/**
 * Canonical product handle aliases and normalizers
 * Maps clean, human-friendly biotech slugs to internal Medusa DB handles.
 */

export const PRODUCT_HANDLE_ALIASES: Record<string, string> = {
  // GHK-Cu friendly aliases
  "ghk-cu": "phase8-ghk-cu-acceptance-1788073261417",
  "ghk-cu-50mg": "phase8-ghk-cu-acceptance-1788073261417",
  "phase-8-ghk-cu-50-mg-subq-set": "phase8-ghk-cu-acceptance-1788073261417",
  "phase8-ghk-cu": "phase8-ghk-cu-acceptance-1788073261417",

  // Tirzepatide friendly aliases
  "tirzepatide-vial": "tirzepatide",
  "tirzepatide-10mg": "tirzepatide",
  "tirzepatide-20mg": "tirzepatide",

  // BPC-157 friendly aliases
  "bpc-157": "bpc-157-vial",
  "bpc157": "bpc-157-vial",
  "bpc-157-5mg": "bpc-157-vial",
  "bpc-157-10mg": "bpc-157-vial",

  // Glutathione friendly aliases
  "glutathione": "glutathione-1500mg",
  "glutathione-vial": "glutathione-1500mg",
  "glutathione-1500": "glutathione-1500mg",

  // NAD+ friendly aliases
  "nad": "nad-plus-500mg",
  "nad-plus": "nad-plus-500mg",
  "nad-500mg": "nad-plus-500mg",
  "nad-plus-500": "nad-plus-500mg",

  // Epithalon friendly aliases
  "epithalon": "epithalon-10mg",
  "epitalon": "epithalon-10mg",
  "epithalon-10": "epithalon-10mg",

  // Bacteriostatic Water friendly aliases
  "bac-water": "bacteriostatic-water-10ml",
  "bacteriostatic-water": "bacteriostatic-water-10ml",
  "bac-water-10ml": "bacteriostatic-water-10ml",
}

/**
 * Reverse mapping: from internal Medusa DB handle to clean user-facing slug
 */
export const CANONICAL_SLUG_BY_HANDLE: Record<string, string> = {
  // GHK-Cu internal handles -> canonical clean slug
  "phase8-ghk-cu-acceptance-1788073261417": "ghk-cu",
  "phase-8-ghk-cu-50-mg-subq-set": "ghk-cu",
  "phase8-ghk-cu": "ghk-cu",
  "ghk-cu-50mg": "ghk-cu",
  "ghk-cu": "ghk-cu",

  // BPC-157 internal handles -> canonical clean slug
  "bpc-157-vial": "bpc-157",
  "bpc-157-5mg": "bpc-157",
  "bpc-157-10mg": "bpc-157",
  "bpc157": "bpc-157",
  "bpc-157": "bpc-157",

  // Tirzepatide internal handles -> canonical clean slug
  "tirzepatide": "tirzepatide",
  "tirzepatide-vial": "tirzepatide",
  "tirzepatide-10mg": "tirzepatide",
  "tirzepatide-20mg": "tirzepatide",

  // Glutathione internal handles -> canonical clean slug
  "glutathione-1500mg": "glutathione",
  "glutathione": "glutathione",

  // NAD+ internal handles -> canonical clean slug
  "nad-plus-500mg": "nad-plus",
  "nad-plus": "nad-plus",
  "nad": "nad-plus",

  // Epithalon internal handles -> canonical clean slug
  "epithalon-10mg": "epithalon",
  "epithalon": "epithalon",

  // Bacteriostatic Water internal handles -> canonical clean slug
  "bacteriostatic-water-10ml": "bac-water",
  "bac-water": "bac-water",
}

/**
 * Resolves any alias or slug to the authoritative Medusa database handle
 */
export function resolveProductHandle(handle?: string | null): string {
  if (!handle) return ""
  const normalized = handle.toLowerCase().trim()
  return PRODUCT_HANDLE_ALIASES[normalized] || handle
}

/**
 * Returns clean user-facing slug for links
 */
export function getCanonicalProductSlug(handle?: string | null): string {
  if (!handle) return ""
  const normalized = handle.toLowerCase().trim()
  return CANONICAL_SLUG_BY_HANDLE[normalized] || handle
}

/**
 * Checks if a given handle is already the clean canonical slug
 */
export function isCanonicalProductSlug(handle?: string | null): boolean {
  if (!handle) return false
  return getCanonicalProductSlug(handle) === handle.toLowerCase().trim()
}
