/**
 * @file    apps/storefront/src/lib/util/get-line-item-thumbnail.ts
 * @module  LineItemThumbnailResolver
 * @purpose Resolves highest-fidelity variant photograph for cart, drawer, checkout, and order line items.
 */

import { getCanonicalProductSlug } from "./product-handles.ts"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export interface LineItemThumbnailCandidate {
  thumbnail?: string | null
  title?: string | null
  product_title?: string | null
  product_handle?: string | null
  variant_title?: string | null
  variant?: {
    thumbnail?: string | null
    title?: string | null
    metadata?: Record<string, unknown> | null
    product?: {
      handle?: string | null
      thumbnail?: string | null
      images?: { url?: string }[] | null
    } | null
  } | null
  metadata?: Record<string, unknown> | null
}

/**
 * Returns the highest-fidelity variant image for cart, checkout, and order line items.
 * Prioritizes dedicated variant photography (Vial Only, Vial + BAC, Complete SubQ Set)
 * over generic slide 1 hero cards.
 */
export function getLineItemThumbnail(
  item?: LineItemThumbnailCandidate | null
): string | undefined {
  if (!item) return undefined

  // 1. Check variant metadata image_urls
  const variantMetadata =
    item.variant?.metadata || (item.metadata as Record<string, unknown> | undefined)

  const rawUrls = variantMetadata?.image_urls as string[] | undefined
  if (rawUrls && Array.isArray(rawUrls) && rawUrls[0]) {
    return rawUrls[0]
  }

  const compounded = variantMetadata?.compounded_product as
    | { image_urls?: string[] }
    | undefined
  if (
    compounded?.image_urls &&
    Array.isArray(compounded.image_urls) &&
    compounded.image_urls[0]
  ) {
    return compounded.image_urls[0]
  }

  // 2. Check if variant has an explicit thumbnail
  if (item.variant?.thumbnail) {
    return item.variant.thumbnail
  }

  // 3. Fallback: derive matching variant photo from canonical slug and variant title
  const rawHandle = item.product_handle || item.variant?.product?.handle
  const variantTitle = (
    item.variant?.title ||
    item.variant_title ||
    item.title ||
    ""
  ).toLowerCase()

  if (rawHandle) {
    const slug = getCanonicalProductSlug(rawHandle)
    if (
      variantTitle.includes("complete") ||
      variantTitle.includes("subq") ||
      variantTitle.includes("kit")
    ) {
      return `${BACKEND_URL}/static/catalog/${slug}/variant_complete_set.webp`
    }
    if (
      variantTitle.includes("bac") ||
      variantTitle.includes("water") ||
      variantTitle.includes("diluent")
    ) {
      return `${BACKEND_URL}/static/catalog/${slug}/variant_vial_bac.webp`
    }
    if (
      variantTitle.includes("vial only") ||
      variantTitle.includes("pure vial") ||
      variantTitle.trim() === "vial"
    ) {
      return `${BACKEND_URL}/static/catalog/${slug}/variant_vial.webp`
    }
  }

  // 4. Default to line item thumbnail or product thumbnail
  return item.thumbnail || item.variant?.product?.thumbnail || undefined
}
