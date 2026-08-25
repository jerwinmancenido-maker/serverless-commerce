import {
  BOM_BASE_UNITS,
  assertNonNegativeSafeInteger,
  assertPositiveSafeInteger,
  calculateBuildableQuantity,
  inventoryKitsAreEqual,
  normalizeInventoryKitComponents,
} from "../contracts/inventory-kit";

describe("BOM inventory-kit contract", () => {
  it("defines the version 1 base units", () => {
    expect(BOM_BASE_UNITS).toEqual(["microgram", "microliter", "piece"]);
  });

  it("calculates buildable quantity from the limiting component", () => {
    expect(
      calculateBuildableQuantity([
        {
          inventoryItemId: "raw-powder",
          availableQuantity: 50_000,
          requiredQuantity: 10_000,
        },
        {
          inventoryItemId: "vial",
          availableQuantity: 3,
          requiredQuantity: 1,
        },
        {
          inventoryItemId: "label",
          availableQuantity: 8,
          requiredQuantity: 1,
        },
      ]),
    ).toEqual({
      quantity: 3,
      limitingInventoryItemIds: ["vial"],
    });
  });

  it("reports every component tied at the limiting quantity", () => {
    expect(
      calculateBuildableQuantity([
        {
          inventoryItemId: "vial",
          availableQuantity: 6,
          requiredQuantity: 2,
        },
        {
          inventoryItemId: "stopper",
          availableQuantity: 3,
          requiredQuantity: 1,
        },
        {
          inventoryItemId: "label",
          availableQuantity: 10,
          requiredQuantity: 1,
        },
      ]),
    ).toEqual({
      quantity: 3,
      limitingInventoryItemIds: ["vial", "stopper"],
    });
  });

  it("returns zero when a component has no available stock", () => {
    expect(
      calculateBuildableQuantity([
        {
          inventoryItemId: "vial",
          availableQuantity: 0,
          requiredQuantity: 1,
        },
      ]),
    ).toEqual({
      quantity: 0,
      limitingInventoryItemIds: ["vial"],
    });
  });

  it("rejects an empty recipe", () => {
    expect(() => calculateBuildableQuantity([])).toThrow(
      "recipe must contain at least one component",
    );
  });

  it.each([0, -1, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid required quantity %s",
    (requiredQuantity) => {
      expect(() =>
        assertPositiveSafeInteger(requiredQuantity, "requiredQuantity"),
      ).toThrow("requiredQuantity must be a positive safe integer");
    },
  );

  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid available quantity %s",
    (availableQuantity) => {
      expect(() =>
        assertNonNegativeSafeInteger(availableQuantity, "availableQuantity"),
      ).toThrow("availableQuantity must be a non-negative safe integer");
    },
  );

  it("rejects a duplicate component", () => {
    expect(() =>
      calculateBuildableQuantity([
        {
          inventoryItemId: "vial",
          availableQuantity: 10,
          requiredQuantity: 1,
        },
        {
          inventoryItemId: "vial",
          availableQuantity: 10,
          requiredQuantity: 1,
        },
      ]),
    ).toThrow("inventory item vial occurs more than once");
  });

  it("rejects a blank inventory item identifier", () => {
    expect(() =>
      calculateBuildableQuantity([
        {
          inventoryItemId: " ",
          availableQuantity: 10,
          requiredQuantity: 1,
        },
      ]),
    ).toThrow("inventoryItemId must not be empty");
  });

  it("normalizes component identifiers and ordering", () => {
    expect(
      normalizeInventoryKitComponents([
        { inventoryItemId: " vial ", requiredQuantity: 1 },
        { inventoryItemId: "active", requiredQuantity: 10_000 },
      ]),
    ).toEqual([
      { inventoryItemId: "active", requiredQuantity: 10_000 },
      { inventoryItemId: "vial", requiredQuantity: 1 },
    ]);
  });

  it("compares kits independently of component order", () => {
    expect(
      inventoryKitsAreEqual(
        [
          { inventoryItemId: "vial", requiredQuantity: 1 },
          { inventoryItemId: "active", requiredQuantity: 10_000 },
        ],
        [
          { inventoryItemId: "active", requiredQuantity: 10_000 },
          { inventoryItemId: "vial", requiredQuantity: 1 },
        ],
      ),
    ).toBe(true);
  });

  it("detects a required-quantity change", () => {
    expect(
      inventoryKitsAreEqual(
        [{ inventoryItemId: "vial", requiredQuantity: 1 }],
        [{ inventoryItemId: "vial", requiredQuantity: 2 }],
      ),
    ).toBe(false);
  });
});
