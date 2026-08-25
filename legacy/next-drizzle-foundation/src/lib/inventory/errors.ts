export class RecipeNotFoundError extends Error {
  constructor(variantId: string) {
    super(`No BOM recipe is configured for variant ${variantId}`);
    this.name = "RecipeNotFoundError";
  }
}

export class InsufficientInventoryError extends Error {
  constructor(
    public readonly rawInventorySku: string,
    public readonly required: string,
    public readonly available: string,
  ) {
    super(
      `Insufficient inventory for ${rawInventorySku}: required ${required}, available ${available}`,
    );
    this.name = "InsufficientInventoryError";
  }
}
