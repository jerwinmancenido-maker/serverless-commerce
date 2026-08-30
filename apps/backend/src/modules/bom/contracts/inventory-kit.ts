import { MedusaError } from "@medusajs/framework/utils";

export const BOM_BASE_UNITS = ["microgram", "microliter", "piece"] as const;

export type BomBaseUnit = (typeof BOM_BASE_UNITS)[number];

export type InventoryKitComponent = {
  inventoryItemId: string;
  requiredQuantity: number;
};

export type ComponentAvailability = {
  inventoryItemId: string;
  availableQuantity: number;
  requiredQuantity: number;
};

export type BuildableQuantity = {
  quantity: number;
  limitingInventoryItemIds: string[];
};

export type ComponentCapacity = {
  inventoryItemId: string;
  availableQuantity: number;
  requiredQuantity: number;
  capacity: number;
};

function assertIdentifier(value: string, field: string) {
  if (value.trim().length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${field} must not be empty`,
    );
  }
}

export function assertNonNegativeSafeInteger(
  value: number,
  field = "quantity",
) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${field} must be a non-negative safe integer`,
    );
  }
}

export function assertPositiveSafeInteger(value: number, field = "quantity") {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${field} must be a positive safe integer`,
    );
  }
}

export function normalizeInventoryKitComponents(
  components: InventoryKitComponent[],
): InventoryKitComponent[] {
  if (components.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "recipe must contain at least one component",
    );
  }

  const seenInventoryItemIds = new Set<string>();

  return components
    .map((component) => {
      const inventoryItemId = component.inventoryItemId.trim();
      assertIdentifier(inventoryItemId, "inventoryItemId");
      assertPositiveSafeInteger(component.requiredQuantity, "requiredQuantity");

      if (seenInventoryItemIds.has(inventoryItemId)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `inventory item ${inventoryItemId} occurs more than once`,
        );
      }

      seenInventoryItemIds.add(inventoryItemId);

      return {
        inventoryItemId,
        requiredQuantity: component.requiredQuantity,
      };
    })
    .sort((left, right) =>
      left.inventoryItemId.localeCompare(right.inventoryItemId),
    );
}

export function inventoryKitsAreEqual(
  left: InventoryKitComponent[],
  right: InventoryKitComponent[],
) {
  const normalizedLeft = normalizeInventoryKitComponents(left);
  const normalizedRight = normalizeInventoryKitComponents(right);

  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((component, index) => {
      const other = normalizedRight[index];

      return (
        component.inventoryItemId === other.inventoryItemId &&
        component.requiredQuantity === other.requiredQuantity
      );
    })
  );
}

export function calculateComponentCapacities(
  components: ComponentAvailability[],
): ComponentCapacity[] {
  if (components.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "recipe must contain at least one component",
    );
  }

  const seenInventoryItemIds = new Set<string>();
  return components.map((component) => {
    assertIdentifier(component.inventoryItemId, "inventoryItemId");

    if (seenInventoryItemIds.has(component.inventoryItemId)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `inventory item ${component.inventoryItemId} occurs more than once`,
      );
    }

    seenInventoryItemIds.add(component.inventoryItemId);
    assertNonNegativeSafeInteger(
      component.availableQuantity,
      "availableQuantity",
    );
    assertPositiveSafeInteger(component.requiredQuantity, "requiredQuantity");

    return {
      inventoryItemId: component.inventoryItemId,
      availableQuantity: component.availableQuantity,
      requiredQuantity: component.requiredQuantity,
      capacity: Math.floor(
        component.availableQuantity / component.requiredQuantity,
      ),
    };
  });
}

export function calculateBuildableQuantity(
  components: ComponentAvailability[],
): BuildableQuantity {
  const capacities = calculateComponentCapacities(components);

  const quantity = Math.min(...capacities.map(({ capacity }) => capacity));

  return {
    quantity,
    limitingInventoryItemIds: capacities
      .filter(({ capacity }) => capacity === quantity)
      .map(({ inventoryItemId }) => inventoryItemId),
  };
}
