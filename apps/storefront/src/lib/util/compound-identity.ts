import type { HttpTypes } from "@medusajs/types"
import type {
  PurchasedItemCandidate,
  ResearchReplenishmentProjection,
  ResearchRoutine,
} from "@lib/data/research-tracking"

export type CompoundIdentity = {
  compoundName: string
  variantLabel: string
  productHandle: string | null
  fullTitle: string
  isResolved: boolean
  matchedProduct?: HttpTypes.StoreProduct | null
  matchedVariant?: HttpTypes.StoreProductVariant | null
}

export const KNOWN_PEPTIDES = [
  "GHK-Cu",
  "Tirzepatide",
  "Retatrutide",
  "Semaglutide",
  "BPC-157",
  "Semax",
  "Selank",
  "MOTS-C",
  "AOD-9604",
  "CJC-1295",
  "Ipamorelin",
  "Epithalon",
  "NAD+",
  "Glutathione",
  "Lipo-C + B12",
  "Lipo-C",
  "DIHEXA",
  "PE-22-28",
  "Pinealon",
  "ADAMAX 1032",
  "ADAMAX",
  "ARA-290",
  "RTT60",
]

const KNOWN_VARIANT_MAP: Record<
  string,
  { compoundName: string; variantLabel: string; handle: string }
> = {
  "variant_01M18QHEF8BJT0GT2JPP0ZF1H8": {
    compoundName: "GHK-Cu",
    variantLabel: "50 mg · Vial Only",
    handle: "ghk-cu",
  },
}

/**
 * Normalizes packaging / variant strings into a consistent, premium format.
 * Examples:
 *   "50MG / Vial Only" -> "50 mg · Vial Only"
 *   "Vial Only / 50 mg" -> "50 mg · Vial Only"
 *   "10ML / Complete SubQ Set" -> "10 ml · Complete SubQ Set"
 */
export function formatVariantLabel(rawVariant: string): string {
  if (!rawVariant) return ""

  let cleaned = rawVariant.trim()

  // Standardize slash or hyphen separators
  const parts = cleaned.split(/\s*[/·]\s*/).map((p) => p.trim()).filter(Boolean)

  if (parts.length === 2) {
    const isFirstQuantity = /\b\d+(\.\d+)?\s*(mg|mcg|ml|iu)\b/i.test(parts[0])
    const isSecondQuantity = /\b\d+(\.\d+)?\s*(mg|mcg|ml|iu)\b/i.test(parts[1])

    if (!isFirstQuantity && isSecondQuantity) {
      // Flip "Vial Only / 50 mg" -> "50 mg · Vial Only"
      cleaned = `${parts[1]} · ${parts[0]}`
    } else {
      cleaned = `${parts[0]} · ${parts[1]}`
    }
  }

  // Normalize units (e.g. 50MG -> 50 mg, 10ML -> 10 ml)
  cleaned = cleaned.replace(/(\d+)\s*(MG|mg)\b/g, "$1 mg")
  cleaned = cleaned.replace(/(\d+)\s*(MCG|mcg)\b/g, "$1 mcg")
  cleaned = cleaned.replace(/(\d+)\s*(ML|ml)\b/g, "$1 ml")
  cleaned = cleaned.replace(/(\d+)\s*(IU|iu)\b/g, "$1 IU")

  return cleaned
}

/**
 * Resolves the genuine chemical/peptide name and variant details from available metadata.
 */
export function resolveCompoundIdentity({
  label,
  materialLabel,
  productVariantId,
  variantId,
  productHandle,
  products,
  purchasedItems,
  projections,
  lineItemIds,
}: {
  label?: string | null
  materialLabel?: string | null
  productVariantId?: string | null
  variantId?: string | null
  productHandle?: string | null
  products?: HttpTypes.StoreProduct[] | null
  purchasedItems?: PurchasedItemCandidate[] | null
  projections?: ResearchReplenishmentProjection[] | null
  lineItemIds?: string[] | null
}): CompoundIdentity {
  const safeLabel = (label || materialLabel || "").trim()
  const effectiveVariantId = productVariantId || variantId || null

  // 0. Explicit known variant map fallback for legacy / test seed variants
  if (effectiveVariantId && KNOWN_VARIANT_MAP[effectiveVariantId]) {
    const known = KNOWN_VARIANT_MAP[effectiveVariantId]
    const catalogProduct = products?.find(
      (p) =>
        p.handle === known.handle ||
        p.title?.toLowerCase() === known.compoundName.toLowerCase()
    )
    return {
      compoundName: known.compoundName,
      variantLabel: known.variantLabel,
      productHandle: catalogProduct?.handle || known.handle,
      fullTitle: `${known.compoundName} — ${known.variantLabel}`,
      isResolved: true,
      matchedProduct: catalogProduct || null,
      matchedVariant: catalogProduct?.variants?.[0] || null,
    }
  }

  // 1. Direct variant match in store product catalog
  if (products && effectiveVariantId) {
    for (const product of products) {
      const matchedVariant = product.variants?.find((v) => v.id === effectiveVariantId)
      if (matchedVariant) {
        const variantLabel = formatVariantLabel(matchedVariant.title || "")
        return {
          compoundName: product.title || safeLabel,
          variantLabel: variantLabel || "Standard Compound",
          productHandle: product.handle || null,
          fullTitle: variantLabel ? `${product.title} — ${variantLabel}` : product.title,
          isResolved: true,
          matchedProduct: product,
          matchedVariant,
        }
      }
    }
  }

  // 2. Direct product handle match in catalog
  const effectiveHandle =
    productHandle ||
    projections?.find(
      (p) =>
        (p.product_variant_id && p.product_variant_id === effectiveVariantId) ||
        (p.tracked_material_label && p.tracked_material_label.toLowerCase() === safeLabel.toLowerCase()),
    )?.source_product_handle ||
    null

  if (products && effectiveHandle) {
    const matchedProduct = products.find((p) => p.handle === effectiveHandle)
    if (matchedProduct) {
      const variant = effectiveVariantId
        ? matchedProduct.variants?.find((v) => v.id === effectiveVariantId)
        : null
      const variantLabel = formatVariantLabel(variant?.title || safeLabel)
      return {
        compoundName: matchedProduct.title || safeLabel,
        variantLabel: variantLabel || "Standard Compound",
        productHandle: matchedProduct.handle || null,
        fullTitle: variantLabel ? `${matchedProduct.title} — ${variantLabel}` : matchedProduct.title,
        isResolved: true,
        matchedProduct,
        matchedVariant: variant || null,
      }
    }
  }

  // 3. Fallback to matching handle heuristic if handle is known
  if (effectiveHandle) {
    const handlePeptideMap: Record<string, string> = {
      "ghk-cu": "GHK-Cu",
      "tirzepatide": "Tirzepatide",
      "retatrutide": "Retatrutide",
      "semaglutide": "Semaglutide",
      "bpc-157": "BPC-157",
      "semax": "Semax",
      "selank": "Selank",
      "mots-c": "MOTS-C",
      "aod-9604": "AOD-9604",
      "cjc-1295-ipamorelin": "CJC-1295 + Ipamorelin",
      "dihexa": "DIHEXA",
      "pinealon": "Pinealon",
      "ara-290": "ARA-290",
      "lipo-c-b12": "Lipo-C + B12",
    }
    const peptideFromHandle = handlePeptideMap[effectiveHandle.toLowerCase()]
    if (peptideFromHandle) {
      const variantLabel = formatVariantLabel(safeLabel)
      const catalogProduct = products?.find((p) => p.handle === effectiveHandle || p.title?.toLowerCase() === peptideFromHandle.toLowerCase())
      return {
        compoundName: peptideFromHandle,
        variantLabel: variantLabel || "Standard Compound",
        productHandle: effectiveHandle,
        fullTitle: variantLabel ? `${peptideFromHandle} — ${variantLabel}` : peptideFromHandle,
        isResolved: true,
        matchedProduct: catalogProduct || null,
        matchedVariant: catalogProduct?.variants?.[0] || null,
      }
    }
  }

  // 4. Parse label if it contains a known peptide name
  for (const peptide of KNOWN_PEPTIDES) {
    const idx = safeLabel.toLowerCase().indexOf(peptide.toLowerCase())
    if (idx !== -1) {
      // Extract peptide and remaining variant
      const remaining = safeLabel.replace(new RegExp(peptide, "i"), "").replace(/^[\s\-–—/]+|[\s\-–—/]+$/g, "")
      const variantLabel = formatVariantLabel(remaining)
      const handle = peptide.toLowerCase().replace(/\+/g, "").replace(/\s+/g, "-")
      const catalogProduct = products?.find((p) => p.handle === handle || p.title?.toLowerCase() === peptide.toLowerCase())
      return {
        compoundName: peptide,
        variantLabel: variantLabel || "Standard Compound",
        productHandle: catalogProduct?.handle || handle,
        fullTitle: variantLabel ? `${peptide} — ${variantLabel}` : peptide,
        isResolved: true,
        matchedProduct: catalogProduct || null,
        matchedVariant: catalogProduct?.variants?.[0] || null,
      }
    }
  }

  // 5. Check purchased item candidates for line item ID, SKU or label hints
  if (purchasedItems) {
    const matchedPurchase = purchasedItems.find(
      (p) =>
        (effectiveVariantId && p.variant_id === effectiveVariantId) ||
        (lineItemIds && lineItemIds.some((lid) => lid === p.line_item_id))
    )
    if (matchedPurchase) {
      for (const peptide of KNOWN_PEPTIDES) {
        const cleanPeptide = peptide.toLowerCase().replace(/[^a-z0-9]/g, "")
        const cleanSku = (matchedPurchase.variant_sku || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        const labelMatches = matchedPurchase.label.toLowerCase().includes(peptide.toLowerCase())
        const skuMatches = cleanSku.includes(cleanPeptide)

        if (labelMatches || skuMatches) {
          const variantLabel = formatVariantLabel(safeLabel)
          const handle = peptide.toLowerCase().replace(/\+/g, "").replace(/\s+/g, "-")
          const catalogProduct = products?.find(
            (prod) =>
              prod.title?.toLowerCase() === peptide.toLowerCase() ||
              prod.handle?.toLowerCase() === handle
          )

          return {
            compoundName: peptide,
            variantLabel: variantLabel || "Standard Compound",
            productHandle: catalogProduct?.handle || handle,
            fullTitle: variantLabel ? `${peptide} — ${variantLabel}` : peptide,
            isResolved: true,
            matchedProduct: catalogProduct || null,
            matchedVariant: catalogProduct?.variants?.[0] || null,
          }
        }
      }
    }
  }

  // 6. Final fallback: If label is purely packaging like "Vial Only / 50 mg", attempt to present nicely
  const formattedVariant = formatVariantLabel(safeLabel)
  return {
    compoundName: formattedVariant || safeLabel || "Research Compound",
    variantLabel: formattedVariant || "Standard Compound",
    productHandle: null,
    fullTitle: formattedVariant || safeLabel,
    isResolved: false,
  }
}

/**
 * Checks whether a research protocol routine is chemically compatible with a specific tracked compound.
 * If a routine's label or material label explicitly contains another known peptide name
 * (e.g. Tirzepatide when compound is GHK-Cu), it returns false.
 */
export function isRoutineCompatibleWithCompound(
  routine: ResearchRoutine,
  compoundName: string,
): boolean {
  if (!compoundName) return true
  const revLabel = routine.current_revision?.label || ""
  const matLabel = routine.tracked_material_label || ""
  const routineText = `${revLabel} ${matLabel}`.toLowerCase()
  const targetCompound = compoundName.toLowerCase()

  const mentionedPeptides = KNOWN_PEPTIDES.filter((p) => {
    const pLower = p.toLowerCase()
    const regex = new RegExp(`\\b${pLower.replace(/[+]/g, "\\+")}\\b`, "i")
    return regex.test(routineText)
  })

  if (mentionedPeptides.length > 0) {
    return mentionedPeptides.some((p) => {
      const pLower = p.toLowerCase()
      return targetCompound.includes(pLower) || pLower.includes(targetCompound)
    })
  }

  return true
}

/**
 * Identifies which known peptide an unlinked or orphaned routine is intended for based on its label.
 */
export function getRoutineTargetCompound(routine: ResearchRoutine): string | null {
  const revLabel = routine.current_revision?.label || ""
  const matLabel = routine.tracked_material_label || ""
  const routineText = `${revLabel} ${matLabel}`.toLowerCase()
  for (const peptide of KNOWN_PEPTIDES) {
    const pLower = peptide.toLowerCase()
    const regex = new RegExp(`\\b${pLower.replace(/[+]/g, "\\+")}\\b`, "i")
    if (regex.test(routineText)) {
      return peptide
    }
  }
  return null
}

