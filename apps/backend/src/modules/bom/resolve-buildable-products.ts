import type { VariantLocationAvailability } from "./resolve-location-availability"

export type BuildableProductVariant = {
  id: string
  title: string
  sku: string | null
  product?: {
    id: string
    title: string
  } | null
}

export type BuildableProductRow = {
  product_id: string | null
  product_title: string
  variant_id: string
  variant_title: string
  sku: string | null
  recipe_status: "configured" | "missing_recipe"
  calculated_stock: number | null
  limiting_items: Array<{
    inventory_item_id: string
    inventory_item_title: string
  }>
}

export function resolveBuildableProductRows(input: {
  variants: BuildableProductVariant[]
  availability: VariantLocationAvailability[]
}): BuildableProductRow[] {
  const availabilityByVariantId = new Map(
    input.availability.map((row) => [row.variant_id, row]),
  )

  return input.variants.map((variant) => {
    const availability = availabilityByVariantId.get(variant.id)
    const configured = availability?.status === "calculated"

    return {
      product_id: variant.product?.id || null,
      product_title: variant.product?.title || "Untitled product",
      variant_id: variant.id,
      variant_title: variant.title || "Untitled variant",
      sku: variant.sku || null,
      recipe_status: configured ? "configured" : "missing_recipe",
      calculated_stock: configured
        ? availability.calculated_stock
        : null,
      limiting_items: configured
        ? [...availability.limiting_components].sort((left, right) =>
            left.inventory_item_title.localeCompare(
              right.inventory_item_title,
            ),
          )
        : [],
    }
  })
}
