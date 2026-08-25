import type {
  IInventoryService,
  LinkDefinition,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

import {
  type InventoryKitComponent,
  inventoryKitsAreEqual,
  normalizeInventoryKitComponents,
} from "../../modules/bom/contracts/inventory-kit";

export type SetVariantInventoryKitInput = {
  variantId: string;
  components: InventoryKitComponent[];
  actorId?: string;
  note?: string;
};

export type VariantInventoryKitChange = {
  variantId: string;
  components: InventoryKitComponent[];
  shouldReplace: boolean;
  dismissLinks: LinkDefinition[];
  createLinks: LinkDefinition[];
  actorId?: string;
  note?: string;
};

export const validateVariantInventoryKitInputStep = createStep(
  "validate-variant-inventory-kit-input",
  async (input: SetVariantInventoryKitInput) => {
    const variantId = input.variantId.trim();

    if (!variantId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "variantId must not be empty",
      );
    }

    return new StepResponse({
      variantId,
      components: normalizeInventoryKitComponents(input.components),
      actorId: input.actorId?.trim() || undefined,
      note: input.note?.trim() || undefined,
    });
  },
);

export const validateVariantInventoryKitChangeStep = createStep(
  "validate-variant-inventory-kit-change",
  async (input: SetVariantInventoryKitInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const inventoryService = container.resolve<IInventoryService>(
      Modules.INVENTORY,
    );

    const [
      { data: variants },
      inventoryItems,
      { data: currentLinks },
      { data: orderItems },
    ] = await Promise.all([
      query.graph({
        entity: "variant",
        fields: ["id"],
        filters: { id: input.variantId },
      }),
      inventoryService.listInventoryItems({
        id: input.components.map(({ inventoryItemId }) => inventoryItemId),
      }),
      query.graph({
        entity: "product_variant_inventory_item",
        fields: ["variant_id", "inventory_item_id", "required_quantity"],
        filters: { variant_id: input.variantId },
      }),
      query.graph({
        entity: "order_line_item",
        fields: ["id", "variant_id"],
        filters: { variant_id: input.variantId },
        pagination: { take: 1 },
      }),
    ]);

    if (!variants[0]) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `product variant ${input.variantId} was not found`,
      );
    }

    const foundInventoryItemIds = new Set(
      inventoryItems.map((inventoryItem) => inventoryItem.id),
    );
    const missingInventoryItemIds = input.components
      .map(({ inventoryItemId }) => inventoryItemId)
      .filter((inventoryItemId) => !foundInventoryItemIds.has(inventoryItemId));

    if (missingInventoryItemIds.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `inventory items were not found: ${missingInventoryItemIds.join(", ")}`,
      );
    }

    const currentComponents = currentLinks.map((link) => ({
      inventoryItemId: link.inventory_item_id,
      requiredQuantity: link.required_quantity,
    }));
    const shouldReplace =
      currentComponents.length === 0 ||
      !inventoryKitsAreEqual(currentComponents, input.components);

    if (shouldReplace && orderItems.length > 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "an inventory kit cannot change after the variant has been ordered; create a new variant instead",
      );
    }

    const dismissLinks: LinkDefinition[] = currentComponents.map(
      ({ inventoryItemId }) => ({
        [Modules.PRODUCT]: { variant_id: input.variantId },
        [Modules.INVENTORY]: { inventory_item_id: inventoryItemId },
      }),
    );
    const createLinks: LinkDefinition[] = input.components.map(
      ({ inventoryItemId, requiredQuantity }) => ({
        [Modules.PRODUCT]: { variant_id: input.variantId },
        [Modules.INVENTORY]: { inventory_item_id: inventoryItemId },
        data: { required_quantity: requiredQuantity },
      }),
    );

    return new StepResponse<VariantInventoryKitChange>({
      variantId: input.variantId,
      components: input.components,
      shouldReplace,
      dismissLinks,
      createLinks,
      actorId: input.actorId,
      note: input.note,
    });
  },
);
