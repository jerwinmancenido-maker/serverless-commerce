import { createHash } from "node:crypto";

import { and, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
  marketplaceSkuMappings,
  orderItems,
  orders,
  type Marketplace,
  webhookEvents,
} from "@/db/schema";
import { deductRecipeInventoryInTransaction } from "@/lib/inventory/service";

import type { NormalizedWebhookEvent } from "./normalize";

type ProcessWebhookInput = {
  marketplace: Marketplace;
  event: NormalizedWebhookEvent;
  payload: unknown;
  rawBody: string;
};

export type ProcessWebhookResult = {
  duplicate: boolean;
  orderId?: string;
  deductedLines: number;
  stockByVariant: Record<string, number>;
};

function requestHash(rawBody: string) {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

async function recordFailure(input: ProcessWebhookInput, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown processing error";

  await getDb()
    .insert(webhookEvents)
    .values({
      marketplace: input.marketplace,
      eventId: input.event.eventId,
      eventType: input.event.eventType,
      requestHash: requestHash(input.rawBody),
      payload: input.payload,
      status: "failed",
      attempts: 1,
      error: message.slice(0, 4_000),
    })
    .onConflictDoUpdate({
      target: [webhookEvents.marketplace, webhookEvents.eventId],
      set: {
        status: "failed",
        error: message.slice(0, 4_000),
        attempts: sql`${webhookEvents.attempts} + 1`,
        receivedAt: new Date(),
      },
      setWhere: eq(webhookEvents.status, "failed"),
    });
}

export async function processMarketplaceWebhook(
  input: ProcessWebhookInput,
): Promise<ProcessWebhookResult> {
  try {
    return await getDb().transaction(async (tx) => {
      const [claimed] = await tx
        .insert(webhookEvents)
        .values({
          marketplace: input.marketplace,
          eventId: input.event.eventId,
          eventType: input.event.eventType,
          requestHash: requestHash(input.rawBody),
          payload: input.payload,
          status: "received",
        })
        .onConflictDoUpdate({
          target: [webhookEvents.marketplace, webhookEvents.eventId],
          set: {
            status: "received",
            error: null,
            attempts: sql`${webhookEvents.attempts} + 1`,
            receivedAt: new Date(),
          },
          setWhere: eq(webhookEvents.status, "failed"),
        })
        .returning({ id: webhookEvents.id });

      if (!claimed) {
        return { duplicate: true, deductedLines: 0, stockByVariant: {} };
      }

      const externalSkus = [...new Set(input.event.items.map((item) => item.externalSku))];
      const mappings = await tx
        .select({
          externalSku: marketplaceSkuMappings.externalSku,
          variantId: marketplaceSkuMappings.variantId,
          rawInventoryItemId: marketplaceSkuMappings.rawInventoryItemId,
        })
        .from(marketplaceSkuMappings)
        .where(
          and(
            eq(marketplaceSkuMappings.marketplace, input.marketplace),
            eq(marketplaceSkuMappings.active, true),
            inArray(marketplaceSkuMappings.externalSku, externalSkus),
          ),
        );

      const mappingBySku = new Map(mappings.map((mapping) => [mapping.externalSku, mapping]));
      const mappedItems = input.event.items
        .map((item) => {
          const mapping = mappingBySku.get(item.externalSku);
          if (!mapping) {
            throw new Error(
              `No active ${input.marketplace} SKU mapping exists for ${item.externalSku}`,
            );
          }
          if (!mapping.variantId) {
            throw new Error(
              `SKU ${item.externalSku} maps directly to raw inventory; order deductions require a product variant mapping`,
            );
          }
          return { ...item, variantId: mapping.variantId };
        })
        .sort(
          (left, right) =>
            left.variantId.localeCompare(right.variantId) ||
            left.externalLineId.localeCompare(right.externalLineId),
        );

      const [insertedOrder] = await tx
        .insert(orders)
        .values({
          channel: input.marketplace,
          externalOrderId: input.event.externalOrderId,
          status: "processing",
        })
        .onConflictDoNothing()
        .returning({ id: orders.id });

      const existingOrder = insertedOrder
        ? undefined
        : (
            await tx
              .select({ id: orders.id })
              .from(orders)
              .where(
                and(
                  eq(orders.channel, input.marketplace),
                  eq(orders.externalOrderId, input.event.externalOrderId),
                ),
              )
              .limit(1)
          )[0];
      const orderId = insertedOrder?.id ?? existingOrder?.id;

      if (!orderId) {
        throw new Error("Unable to create or resolve the marketplace order");
      }

      let deductedLines = 0;
      const stockByVariant: Record<string, number> = {};

      for (const item of mappedItems) {
        const [insertedLine] = await tx
          .insert(orderItems)
          .values({
            orderId,
            variantId: item.variantId,
            externalLineId: item.externalLineId,
            externalSku: item.externalSku,
            quantity: item.quantity,
            unitPriceInCents: item.unitPriceInCents,
          })
          .onConflictDoNothing()
          .returning({ id: orderItems.id });

        if (!insertedLine) continue;

        const deduction = await deductRecipeInventoryInTransaction(
          tx,
          item.variantId,
          item.quantity,
        );
        deductedLines += 1;
        stockByVariant[item.variantId] = deduction.availableVariantStock;
      }

      await tx
        .update(webhookEvents)
        .set({ status: "processed", processedAt: new Date(), error: null })
        .where(eq(webhookEvents.id, claimed.id));

      return { duplicate: false, orderId, deductedLines, stockByVariant };
    });
  } catch (error) {
    try {
      await recordFailure(input, error);
    } catch (recordingError) {
      console.error("Unable to record failed webhook", recordingError);
    }
    throw error;
  }
}
