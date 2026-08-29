import type { VariantDraft } from "./types"

type CreationReviewPolicy = {
  require_price: boolean
  require_sales_channel: boolean
  require_bom_for_managed_inventory: boolean
}

export type CompoundedProductCreationReview = {
  missingSkuCount: number
  missingPriceCount: number
  managedVariantCount: number
  draftSaveBlockers: string[]
  publicationReviewItems: string[]
}

export function suggestCompoundedProductHandle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createCompoundedProductCreationReview(input: {
  title: string
  shippingProfileId: string
  rows: Array<{ key: string }>
  drafts: Record<string, VariantDraft>
  policy: CreationReviewPolicy
  salesChannelCount: number
  largeMatrixRequiresConfirmation: boolean
  largeMatrixConfirmed: boolean
}): CompoundedProductCreationReview {
  const missingSkuCount = input.rows.filter(
    (row) => !input.drafts[row.key]?.sku.trim(),
  ).length
  const missingPriceCount = input.rows.filter((row) => {
    const draft = input.drafts[row.key]
    return !draft?.priceAmount || !draft.currencyCode
  }).length
  const managedVariantCount = input.rows.filter(
    (row) => input.drafts[row.key]?.manageInventory ?? true,
  ).length
  const draftSaveBlockers = [
    !input.title.trim() ? "Product title is required" : null,
    !input.shippingProfileId ? "Shipping profile is required" : null,
    missingSkuCount > 0
      ? `${missingSkuCount} variant${missingSkuCount === 1 ? " needs" : "s need"} a SKU`
      : null,
    input.largeMatrixRequiresConfirmation && !input.largeMatrixConfirmed
      ? "The current large variant matrix needs confirmation"
      : null,
  ].filter((value): value is string => Boolean(value))
  const publicationReviewItems = [
    input.policy.require_price && missingPriceCount > 0
      ? `${missingPriceCount} variant${missingPriceCount === 1 ? " has" : "s have"} no price`
      : null,
    input.policy.require_sales_channel && input.salesChannelCount === 0
      ? "No sales channel is selected"
      : null,
    input.policy.require_bom_for_managed_inventory && managedVariantCount > 0
      ? `${managedVariantCount} managed-inventory variant${managedVariantCount === 1 ? " requires" : "s require"} a reviewed BOM recipe after draft creation`
      : null,
  ].filter((value): value is string => Boolean(value))

  return {
    missingSkuCount,
    missingPriceCount,
    managedVariantCount,
    draftSaveBlockers,
    publicationReviewItems,
  }
}
