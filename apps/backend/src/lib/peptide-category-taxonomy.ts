export type PeptideCategoryDefinition = {
  name: string
  handle: string
  description: string
  rank: number
}

export const PEPTIDE_CATEGORY_TAXONOMY: PeptideCategoryDefinition[] = [
  {
    name: "Healing & Tissue Repair Peptides",
    handle: "healing-tissue-repair-peptides",
    description:
      "Research compounds commonly studied in tissue-repair and recovery contexts.",
    rank: 0,
  },
  {
    name: "Cognitive & Neuroprotective Peptides",
    handle: "cognitive-neuroprotective-peptides",
    description:
      "Research compounds commonly studied in cognition and neuroprotection contexts.",
    rank: 1,
  },
  {
    name: "Metabolic & Weight Management Peptides",
    handle: "metabolic-weight-management-peptides",
    description:
      "Research compounds commonly studied in metabolism and weight-management contexts.",
    rank: 2,
  },
  {
    name: "Growth Hormone & Recovery Peptides",
    handle: "growth-hormone-recovery-peptides",
    description:
      "Research compounds commonly studied in growth-hormone signaling and recovery contexts.",
    rank: 3,
  },
  {
    name: "Longevity & Cellular Health Peptides",
    handle: "longevity-cellular-health-peptides",
    description:
      "Research compounds commonly studied in longevity and cellular-health contexts.",
    rank: 4,
  },
  {
    name: "Immune & Inflammation Research Peptides",
    handle: "immune-inflammation-research-peptides",
    description:
      "Research compounds commonly studied in immune-response and inflammation contexts.",
    rank: 5,
  },
  {
    name: "Skin, Hair & Cosmetic Peptides",
    handle: "skin-hair-cosmetic-peptides",
    description:
      "Research compounds commonly studied in skin, hair, and cosmetic-science contexts.",
    rank: 6,
  },
  {
    name: "Sexual & Reproductive Research Peptides",
    handle: "sexual-reproductive-research-peptides",
    description:
      "Research compounds commonly studied in sexual-health and reproductive contexts.",
    rank: 7,
  },
  {
    name: "Sleep & Circadian Research Peptides",
    handle: "sleep-circadian-research-peptides",
    description:
      "Research compounds commonly studied in sleep and circadian-rhythm contexts.",
    rank: 8,
  },
  {
    name: "Antimicrobial & Host Defense Peptides",
    handle: "antimicrobial-host-defense-peptides",
    description:
      "Research compounds commonly studied in antimicrobial and host-defense contexts.",
    rank: 9,
  },
  {
    name: "Research Supplies & Accessories",
    handle: "research-supplies-accessories",
    description:
      "Customer-facing research supplies and accessories that are not peptide compounds.",
    rank: 10,
  },
]
