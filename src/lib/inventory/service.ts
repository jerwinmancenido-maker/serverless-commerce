import Decimal from "decimal.js";
import { asc, eq, sql } from "drizzle-orm";

import {
  type DatabaseTransaction,
  getDb,
} from "@/db";
import {
  rawInventoryItems,
  variantRecipes,
} from "@/db/schema";

import {
  InsufficientInventoryError,
  RecipeNotFoundError,
} from "./errors";

export type InventoryDeduction = {
  rawInventoryItemId: string;
  sku: string;
  deducted: string;
  remaining: string;
};

export type DeductRecipeInventoryResult = {
  variantId: string;
  orderedQuantity: number;
  availableVariantStock: number;
  deductions: InventoryDeduction[];
};

function assertOrderQuantity(quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new RangeError("quantity must be a positive safe integer");
  }
}

export async function deductRecipeInventoryInTransaction(
  tx: DatabaseTransaction,
  variantId: string,
  quantity: number,
): Promise<DeductRecipeInventoryResult> {
  assertOrderQuantity(quantity);

  const recipe = await tx
    .select({
      rawInventoryItemId: rawInventoryItems.id,
      sku: rawInventoryItems.sku,
      quantityOnHand: rawInventoryItems.quantityOnHand,
      requiredQuantity: variantRecipes.requiredQuantity,
    })
    .from(variantRecipes)
    .innerJoin(
      rawInventoryItems,
      eq(variantRecipes.rawInventoryItemId, rawInventoryItems.id),
    )
    .where(eq(variantRecipes.variantId, variantId))
    .orderBy(asc(rawInventoryItems.id))
    .for("update", { of: rawInventoryItems });

  if (recipe.length === 0) {
    throw new RecipeNotFoundError(variantId);
  }

  const requirements = recipe.map((component) => ({
    ...component,
    required: new Decimal(component.requiredQuantity).times(quantity),
  }));

  for (const component of requirements) {
    const available = new Decimal(component.quantityOnHand);

    if (available.lessThan(component.required)) {
      throw new InsufficientInventoryError(
        component.sku,
        component.required.toFixed(6),
        available.toFixed(6),
      );
    }
  }

  const deductions: InventoryDeduction[] = [];

  for (const component of requirements) {
    const required = component.required.toFixed(6);
    const [updated] = await tx
      .update(rawInventoryItems)
      .set({
        quantityOnHand: sql`${rawInventoryItems.quantityOnHand} - cast(${required} as numeric)`,
      })
      .where(eq(rawInventoryItems.id, component.rawInventoryItemId))
      .returning({ remaining: rawInventoryItems.quantityOnHand });

    if (!updated) {
      throw new Error(
        `Raw inventory item ${component.rawInventoryItemId} disappeared during deduction`,
      );
    }

    deductions.push({
      rawInventoryItemId: component.rawInventoryItemId,
      sku: component.sku,
      deducted: required,
      remaining: updated.remaining,
    });
  }

  const [availability] = await tx
    .select({
      available: sql<number>`coalesce(floor(min(${rawInventoryItems.quantityOnHand} / ${variantRecipes.requiredQuantity})), 0)::integer`,
    })
    .from(variantRecipes)
    .innerJoin(
      rawInventoryItems,
      eq(variantRecipes.rawInventoryItemId, rawInventoryItems.id),
    )
    .where(eq(variantRecipes.variantId, variantId));

  return {
    variantId,
    orderedQuantity: quantity,
    availableVariantStock: Number(availability?.available ?? 0),
    deductions,
  };
}

export async function deductRecipeInventory(
  variantId: string,
  quantity: number,
) {
  return getDb().transaction((tx) =>
    deductRecipeInventoryInTransaction(tx, variantId, quantity),
  );
}

export async function calculateAvailableStock(variantId: string) {
  const [availability] = await getDb()
    .select({
      componentCount: sql<number>`count(*)::integer`,
      available: sql<number>`coalesce(floor(min(${rawInventoryItems.quantityOnHand} / ${variantRecipes.requiredQuantity})), 0)::integer`,
    })
    .from(variantRecipes)
    .innerJoin(
      rawInventoryItems,
      eq(variantRecipes.rawInventoryItemId, rawInventoryItems.id),
    )
    .where(eq(variantRecipes.variantId, variantId));

  if (!availability || Number(availability.componentCount) === 0) {
    throw new RecipeNotFoundError(variantId);
  }

  return Number(availability.available);
}

