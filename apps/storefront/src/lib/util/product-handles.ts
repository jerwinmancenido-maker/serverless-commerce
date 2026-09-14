/**
 * Canonical product handle aliases and normalizers
 * Maps clean, human-friendly biotech slugs to internal Medusa DB handles.
 */

export const PRODUCT_HANDLE_ALIASES: Record<string, string> = {
  // GHK-Cu friendly aliases
  "ghk-cu": "ghk-cu",
  "ghk-cu-50mg": "ghk-cu",
  "ghk-cu-subq-set": "ghk-cu",
  "ghkcu": "ghk-cu",

  // Tirzepatide friendly aliases
  "tirzepatide": "tirzepatide",
  "tirzepatide-vial": "tirzepatide",
  "tirzepatide-10mg": "tirzepatide",
  "tirzepatide-20mg": "tirzepatide",
  "ti15": "ti15",
  "ti-15": "ti15",
  "tirzepatide-15mg": "ti15",

  // Retatrutide friendly aliases
  "retatrutide": "retatrutide",
  "retatrutide-10mg": "retatrutide",
  "rtt60": "rtt60",
  "rtt-60": "rtt60",
  "retatrutide-60mg": "rtt60",

  // BPC-157 friendly aliases
  "bpc-157": "bpc-157-vial",
  "bpc157": "bpc-157-vial",
  "bpc-157-5mg": "bpc-157-vial",
  "bpc-157-10mg": "bpc-157-vial",
  "bpc-157-vial": "bpc-157-vial",

  // Glutathione friendly aliases
  "glutathione": "glutathione-1500mg",
  "glutathione-vial": "glutathione-1500mg",
  "glutathione-1500": "glutathione-1500mg",
  "glutathione-1500mg": "glutathione-1500mg",

  // NAD+ friendly aliases
  "nad": "nad-plus-500mg",
  "nad-plus": "nad-plus-500mg",
  "nad-500mg": "nad-plus-500mg",
  "nad-plus-500": "nad-plus-500mg",
  "nad-plus-500mg": "nad-plus-500mg",

  // Adamax friendly aliases
  "adamax": "adamax-1032",
  "adamax-10mg": "adamax-1032",
  "adamax1032": "adamax-1032",
  "adamax-1032": "adamax-1032",

  // HMG friendly aliases
  "hmg": "hmg-75iu",
  "hmg-75": "hmg-75iu",
  "hmg75iu": "hmg-75iu",
  "hmg-75iu": "hmg-75iu",

  // HGH Somatropin friendly aliases
  "hgh": "hgh-somatropin",
  "somatropin": "hgh-somatropin",
  "hgh-24iu": "hgh-somatropin",
  "hgh-somatropin": "hgh-somatropin",

  // TB-500 friendly aliases
  "tb500": "tb-500",
  "tb-500-10mg": "tb-500",
  "tb-500-vial": "tb-500",
  "tb-500": "tb-500",

  // CJC-1295 / Ipamorelin friendly aliases
  "cjc-ipam": "cjc-1295-ipamorelin",
  "cjc-1295-ipam": "cjc-1295-ipamorelin",
  "cjc-ipa": "cjc-1295-ipamorelin",
  "cjc-1295-ipamorelin": "cjc-1295-ipamorelin",

  // CJC-1295 No DAC friendly aliases
  "cjc-no-dac": "cjc-1295-no-dac",
  "cjc1295-no-dac": "cjc-1295-no-dac",
  "mod-grf": "cjc-1295-no-dac",
  "mod-grf-1-29": "cjc-1295-no-dac",
  "cjc-1295-no-dac": "cjc-1295-no-dac",

  // CJC-1295 With DAC friendly aliases
  "cjc-with-dac": "cjc-1295-with-dac",
  "cjc-dac": "cjc-1295-with-dac",
  "cjc1295-dac": "cjc-1295-with-dac",
  "cjc-1295-with-dac": "cjc-1295-with-dac",

  // PT-141 friendly aliases
  "pt141": "pt-141",
  "bremelanotide": "pt-141",
  "pt-141": "pt-141",

  // Thymosin Alpha 1 friendly aliases
  "ta1": "thymosin-alpha-1",
  "thymosin-a1": "thymosin-alpha-1",
  "thymosin-alpha-1": "thymosin-alpha-1",

  // Kisspeptin-10 friendly aliases
  "kisspeptin": "kisspeptin-10",
  "kiss-10": "kisspeptin-10",
  "kisspeptin-10": "kisspeptin-10",

  // NA-Semax / NA-Selank friendly aliases
  "nasemax": "na-semax-amidate",
  "na-semax": "na-semax-amidate",
  "na-semax-amidate": "na-semax-amidate",
  "naselank": "na-selank-amidate",
  "na-selank": "na-selank-amidate",
  "na-selank-amidate": "na-selank-amidate",

  // 5-Amino-1MQ friendly aliases
  "5-amino": "5-amino-1mq",
  "amino-1mq": "5-amino-1mq",
  "5amino1mq": "5-amino-1mq",
  "5-amino-1mq": "5-amino-1mq",

  // AOD-9604 friendly aliases
  "aod9604": "aod-9604",
  "aod": "aod-9604",
  "aod-9604": "aod-9604",

  // MOTS-c friendly aliases
  "motsc": "mots-c",
  "mots-c": "mots-c",

  // Selank & Semax Combo friendly aliases
  "selank-semax": "selank-semax-combo",
  "semax-selank": "selank-semax-combo",
  "selank-semax-combo": "selank-semax-combo",

  // Multi-compound blend aliases
  "glow-70": "glow70",
  "glow70": "glow70",
  "klow-80": "klow80",
  "klow80": "klow80",
  "cuv100": "cuv100-ghk-cu-kpv",
  "cuv-100": "cuv100-ghk-cu-kpv",
  "cuv100-ghk-cu-kpv": "cuv100-ghk-cu-kpv",

  // Epithalon friendly aliases
  "epithalon": "epithalon",
  "epithalon-10mg": "epithalon",
  "epitalon": "epithalon",
  "epithalon-10": "epithalon",

  // Bacteriostatic Water friendly aliases
  "bac-water": "bacteriostatic-water",
  "bacteriostatic-water": "bacteriostatic-water",
  "bac-water-10ml": "bacteriostatic-water",
  "bacteriostatic-water-10ml": "bacteriostatic-water",

  // Cartalax friendly aliases
  "cartalax": "cartalax-20mg",
  "cartalax-20mg": "cartalax-20mg",

  // Additional Blend Aliases
  "cjc-ipam-blend": "cjc-1295-ipamorelin",
  "semax-selank-blend": "selank-semax-combo",
}

/**
 * Reverse mapping: from internal Medusa DB handle to clean user-facing slug
 */
export const CANONICAL_SLUG_BY_HANDLE: Record<string, string> = {
  // GHK-Cu internal handles -> canonical clean slug
  "ghk-cu-50mg": "ghk-cu",
  "ghk-cu-subq-set": "ghk-cu",
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
  "ti15": "ti15",

  // Retatrutide internal handles -> canonical clean slug
  "retatrutide": "retatrutide",
  "rtt60": "rtt60",

  // Glutathione internal handles -> canonical clean slug
  "glutathione-1500mg": "glutathione",
  "glutathione": "glutathione",

  // NAD+ internal handles -> canonical clean slug
  "nad-plus-500mg": "nad-plus",
  "nad-plus": "nad-plus",
  "nad": "nad-plus",

  // Adamax internal handles -> canonical clean slug
  "adamax-1032": "adamax-1032",

  // HMG internal handles -> canonical clean slug
  "hmg-75iu": "hmg-75iu",

  // HGH internal handles -> canonical clean slug
  "hgh-somatropin": "hgh-somatropin",

  // TB-500 internal handles -> canonical clean slug
  "tb-500": "tb-500",

  // Epithalon internal handles -> canonical clean slug
  "epithalon-10mg": "epithalon",
  "epithalon": "epithalon",

  // Bacteriostatic Water internal handles -> canonical clean slug
  "bacteriostatic-water-10ml": "bacteriostatic-water",
  "bacteriostatic-water": "bacteriostatic-water",
  "bac-water": "bacteriostatic-water",

  // Additional Canonical Slugs
  "cartalax-20mg": "cartalax",
  "cjc-1295-ipamorelin": "cjc-1295-ipamorelin",
  "glow70": "glow70",
  "klow80": "klow80",
  "selank-semax-combo": "selank-semax-combo",
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
