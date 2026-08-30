export type InventoryItemRecipeLink = {
  variant_id: string
  inventory_item_id: string
  required_quantity: number
}

export type InventoryItemUsageVariant = {
  id: string
  title: string
  sku: string | null
  product?: {
    id: string
    title: string
  } | null
}

export type InventoryItemUsageSnapshot = {
  variant_id: string
  version: number
}

export type InventoryItemBomUsage = {
  variant_id: string
  variant_title: string
  variant_sku: string | null
  product_id: string | null
  product_title: string
  required_quantity: number
  recipe_status: "configured" | "missing_variant"
  latest_audit_version: number | null
}

export function resolveInventoryItemBomUsage(input: {
  links: InventoryItemRecipeLink[]
  variants: InventoryItemUsageVariant[]
  snapshots: InventoryItemUsageSnapshot[]
}): InventoryItemBomUsage[] {
  const variantById = new Map(
    input.variants.map((variant) => [variant.id, variant]),
  )
  const latestVersionByVariantId = new Map<string, number>()

  for (const snapshot of input.snapshots) {
    const currentVersion = latestVersionByVariantId.get(snapshot.variant_id)

    if (currentVersion === undefined || snapshot.version > currentVersion) {
      latestVersionByVariantId.set(snapshot.variant_id, snapshot.version)
    }
  }

  return input.links
    .map((link) => {
      const variant = variantById.get(link.variant_id)

      return {
        variant_id: link.variant_id,
        variant_title: variant?.title || "Missing product variant",
        variant_sku: variant?.sku || null,
        product_id: variant?.product?.id || null,
        product_title: variant?.product?.title || "Unavailable product",
        required_quantity: Number(link.required_quantity),
        recipe_status: variant ? "configured" : "missing_variant",
        latest_audit_version:
          latestVersionByVariantId.get(link.variant_id) ?? null,
      } satisfies InventoryItemBomUsage
    })
    .sort((left, right) => {
      const productOrder = left.product_title.localeCompare(
        right.product_title,
      )

      if (productOrder !== 0) {
        return productOrder
      }

      const variantOrder = left.variant_title.localeCompare(
        right.variant_title,
      )

      return variantOrder !== 0
        ? variantOrder
        : left.variant_id.localeCompare(right.variant_id)
    })
}
