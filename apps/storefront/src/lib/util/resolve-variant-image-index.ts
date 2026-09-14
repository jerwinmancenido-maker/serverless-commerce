/**
 * @file    apps/storefront/src/lib/util/resolve-variant-image-index.ts
 * @module  ResolveVariantImageIndex
 * @purpose Resolves the exact image index in product gallery for an active variant.
 */

import { HttpTypes } from "@medusajs/types"

export function resolveVariantImageIndex(
  variant?: HttpTypes.StoreProductVariant | null,
  images?: HttpTypes.StoreProductImage[]
): number {
  if (!images || images.length === 0 || !variant) return 0

  // 1. Direct metadata match by variant_id
  const directIdx = images.findIndex(
    (img) =>
      (img.metadata as Record<string, unknown> | undefined)?.variant_id ===
      variant.id
  )
  if (directIdx !== -1) return directIdx

  // 2. Match by variant thumbnail or image_urls
  const targetUrls: string[] = []
  if (variant.thumbnail) targetUrls.push(variant.thumbnail)
  const rawUrls = variant.metadata?.image_urls as string[] | undefined
  if (rawUrls) targetUrls.push(...rawUrls)
  const compounded = (
    variant.metadata?.compounded_product as
      | { image_urls?: string[] }
      | undefined
  )?.image_urls
  if (compounded) targetUrls.push(...compounded)

  for (const targetUrl of targetUrls) {
    if (!targetUrl) continue
    const idx = images.findIndex((img) => {
      if (!img.url) return false
      if (img.url === targetUrl) return true
      const imgPath = img.url.split("?")[0].toLowerCase()
      const targetPath = targetUrl.split("?")[0].toLowerCase()
      const imgFilename = imgPath.split("/").pop()
      const targetFilename = targetPath.split("/").pop()
      return imgFilename && targetFilename && imgFilename === targetFilename
    })
    if (idx !== -1) return idx
  }

  // 3. Match by semantic label in variant title and options
  const optionValues = (variant.options || []).map((o) => o.value || "")
  const combinedLabel = [variant.title || "", ...optionValues]
    .join(" ")
    .toLowerCase()

  if (
    combinedLabel.includes("subq") ||
    combinedLabel.includes("analytical") ||
    combinedLabel.includes("lab set") ||
    combinedLabel.includes("complete") ||
    combinedLabel.includes("prep set") ||
    (combinedLabel.includes("kit") && !combinedLabel.includes("bac"))
  ) {
    const idx = images.findIndex((img) =>
      img.url?.toLowerCase().includes("variant_complete_set")
    )
    if (idx !== -1) return idx
    const slide5 = images.findIndex((img) =>
      img.url?.toLowerCase().includes("slide5")
    )
    if (slide5 !== -1) return slide5
  }

  if (
    combinedLabel.includes("bac") ||
    combinedLabel.includes("water") ||
    combinedLabel.includes("diluent") ||
    combinedLabel.includes("reconstitution")
  ) {
    const idx = images.findIndex((img) =>
      img.url?.toLowerCase().includes("variant_vial_bac")
    )
    if (idx !== -1) return idx
    const slide3 = images.findIndex((img) =>
      img.url?.toLowerCase().includes("slide3")
    )
    if (slide3 !== -1) return slide3
  }

  if (
    combinedLabel.includes("vial only") ||
    combinedLabel.includes("pure vial") ||
    combinedLabel.includes("vial")
  ) {
    const idx = images.findIndex(
      (img) =>
        img.url?.toLowerCase().includes("variant_vial.") ||
        img.url?.toLowerCase().includes("variant_vial_") ||
        img.url?.toLowerCase().includes("thumb600_variant_vial.")
    )
    if (idx !== -1) return idx
  }

  return 0
}
