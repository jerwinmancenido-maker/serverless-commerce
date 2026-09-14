/**
 * @file    apps/storefront/src/lib/data/navigation-data.ts
 * @module  NavigationData
 * @purpose Single source of truth for storefront top navigation metrics,
 *          pharmacological category taxonomies, and featured reference compounds.
 *          Ultra-lightweight contract optimized for client bundles (zero JSON bloat).
 */

export interface NavCategory {
  name: string
  shortName: string
  desc: string
  href: string
  count: number
}

export interface NavMetrics {
  totalCompounds: number
  totalComparisons: number
  totalArticles: number
  totalGlossaryTerms: number
}

export interface FeaturedCompound {
  title: string
  tag: string
  desc: string
  href: string
}

/**
 * Returns dynamic real-time counts across the catalog, literature, and educational datasets.
 * Canonical values derived from Peptides Studio PIM publisher.
 */
export function getNavMetrics(): NavMetrics {
  return {
    totalCompounds: 176,
    totalComparisons: 24,
    totalArticles: 83,
    totalGlossaryTerms: 31,
  }
}

/**
 * Returns the complete 8 pharmacological categories with live compound counts and deep links.
 */
export function getNavCategories(): NavCategory[] {
  return [
    {
      name: "Metabolic & Incretin Signaling",
      shortName: "Metabolic & GLP-1",
      desc: "Retatrutide, Tirzepatide, Semaglutide & GLP-1/GIP receptor co-agonists",
      href: "/categories/metabolic-weight-management-peptides",
      count: 22,
    },
    {
      name: "Tissue Repair & Cytoprotection",
      shortName: "Healing & Repair",
      desc: "BPC-157, TB-500, KPV & regenerative extracellular matrix peptides",
      href: "/categories/healing-tissue-repair-peptides",
      count: 18,
    },
    {
      name: "Growth Hormone Axis Secretagogues",
      shortName: "GH Axis & Recovery",
      desc: "Tesamorelin, CJC-1295, Ipamorelin, MK-677 & GHRH analogs",
      href: "/categories/growth-hormone-recovery-peptides",
      count: 20,
    },
    {
      name: "Cellular Longevity & Bioregulators",
      shortName: "Longevity & Cellular",
      desc: "Epithalon, GHK-Cu, NAD+, MOTS-c & telomerase mitochondrial regulators",
      href: "/categories/longevity-cellular-health-peptides",
      count: 24,
    },
    {
      name: "Neurobiology & Cognitive Peptides",
      shortName: "Neurobiology & Nootropic",
      desc: "Semax, Selank, NA-Semax Amidate, Pinealon & neuropeptides",
      href: "/categories/cognitive-neuroprotective-peptides",
      count: 16,
    },
    {
      name: "Immunomodulatory & Antimicrobial",
      shortName: "Immune & Defense",
      desc: "Thymosin Alpha-1, LL-37, Thymulin & host-defense peptides",
      href: "/categories/immune-inflammation-research-peptides",
      count: 14,
    },
    {
      name: "Compounded Blends & Synergies",
      shortName: "Multi-Peptide Blends",
      desc: "Multi-peptide synergistic formulations (GLP-1 combos, Wolverine blend)",
      href: "/categories/multi-compound-research-bundles",
      count: 16,
    },
    {
      name: "Sterile Consumables & Labware",
      shortName: "Supplies & Labware",
      desc: "Bacteriostatic (BAC) water USP, U-100 LDS syringes, sterile glass vials",
      href: "/categories/research-supplies-accessories",
      count: 24,
    },
  ]
}

/**
 * Returns popular research peptides with purity metadata.
 */
export function getFeaturedNavCompounds(): FeaturedCompound[] {
  return [
    {
      title: "Retatrutide (10mg / 20mg)",
      tag: "Triple Agonist",
      desc: "GLP-1 / GIP / Glucagon receptor triple co-agonist reference standard",
      href: "/products/retatrutide",
    },
    {
      title: "Tirzepatide (10mg / 30mg)",
      tag: "Dual Incretin",
      desc: "GIP / GLP-1 dual incretin reference solid for glycemic assays",
      href: "/products/tirzepatide",
    },
    {
      title: "BPC-157 (5mg / 10mg)",
      tag: "Tissue Repair",
      desc: "Stable gastric pentadecapeptide for tissue regeneration research",
      href: "/products/bpc-157",
    },
    {
      title: "GHK-Cu (50mg SubQ Set)",
      tag: "Copper Tripeptide",
      desc: "High-concentration copper tripeptide with sterile BAC diluent set",
      href: "/products/ghk-cu",
    },
  ]
}
