import { z } from "zod";

import type { Marketplace } from "@/db/schema";

const normalizedItemSchema = z.object({
  externalLineId: z.string().min(1),
  externalSku: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceInCents: z.number().int().nonnegative().default(0),
});

const normalizedEventSchema = z.object({
  eventId: z.string().min(1),
  eventType: z.string().min(1),
  externalOrderId: z.string().min(1),
  items: z.array(normalizedItemSchema).min(1),
});

export type NormalizedWebhookEvent = z.infer<typeof normalizedEventSchema>;

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function positiveInteger(...values: unknown[]) {
  for (const value of values) {
    const parsed = typeof value === "number" ? value : Number(value);
    if (Number.isSafeInteger(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

function getItemArray(payload: JsonObject, data: JsonObject, order: JsonObject) {
  return array(
    payload.items ??
      payload.order_items ??
      data.items ??
      data.order_items ??
      data.item_list ??
      order.items ??
      order.order_items ??
      order.item_list,
  );
}

export function normalizeMarketplaceWebhook(
  marketplace: Marketplace,
  payload: unknown,
): NormalizedWebhookEvent {
  const root = object(payload);
  const data = object(root.data);
  const order = object(root.order ?? data.order);

  const eventId = firstString(
    root.event_id,
    root.eventId,
    root.webhook_id,
    root.code,
    data.event_id,
  );
  const eventType = firstString(
    root.event_type,
    root.eventType,
    root.message_type,
    root.type,
    root.code,
    "order_or_inventory",
  );
  const externalOrderId = firstString(
    order.id,
    order.order_id,
    order.ordersn,
    root.order_id,
    root.ordersn,
    data.order_id,
    data.trade_order_id,
    data.ordersn,
    eventId ? `inventory:${eventId}` : undefined,
  );

  const items = getItemArray(root, data, order).map((rawItem, index) => {
    const item = object(rawItem);
    const externalSku = firstString(
      item.external_sku,
      item.seller_sku,
      item.model_sku,
      item.item_sku,
      item.sku,
      item.sku_id,
    );
    const externalLineId = firstString(
      item.line_id,
      item.order_item_id,
      item.id,
      externalSku ? `${externalSku}:${index}` : undefined,
    );
    const quantity = positiveInteger(
      item.quantity,
      item.qty,
      item.model_quantity_purchased,
      item.amount,
    );

    return {
      externalLineId,
      externalSku,
      quantity,
      unitPriceInCents: positiveInteger(item.unit_price_in_cents) ?? 0,
    };
  });

  const result = normalizedEventSchema.safeParse({
    eventId,
    eventType: `${marketplace}.${eventType ?? "unknown"}`,
    externalOrderId,
    items,
  });

  if (!result.success) {
    throw new Error(
      `Unsupported ${marketplace} webhook payload: ${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
