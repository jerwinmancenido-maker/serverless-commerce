/**
 * @file    apps/storefront/src/lib/data/peptide-comparisons.ts
 * @module  PeptideComparisonsData (Storefront Peptide Comparisons)
 * @purpose Data access layer for head-to-head peptide comparison matrices with Medusa backend API and dynamic synthesis fallback.
 * @contracts
 *   API: GET /store/peptide-comparisons · GET /store/peptide-comparisons/:slug
 */

import { sdk } from "@lib/config"
import {
  type StoreResearchProtocol,
  retrieveResearchProtocol,
} from "./research-protocols"

export type ComparisonVector = {
  feature: string
  compoundA_val: string
  compoundB_val: string
  verdict?: string
}

export type CompoundProfile = {
  id: string
  name: string
  handle: string
  tag: string
  category: string
  sequence_or_class: string
  molecular_mass: string
  primary_target: string
  half_life: string
  reconstitution_diluent: string
  standard_dilution?: string
  primary_focus: string
  purity?: string
  typical_cadence?: string
  citations?: Array<{ number: number; text: string; url: string }>
}

export type PeptideComparison = {
  slug: string
  title: string
  subtitle: string
  category: string
  compoundA: CompoundProfile
  compoundB: CompoundProfile
  summary: string
  synergy_verdict: string
  vectors: ComparisonVector[]
  citations: Array<{ number: number; text: string; url: string }>
}

/**
 * Transforms a canonical StoreResearchProtocol into a standardized CompoundProfile
 * suitable for head-to-head analytical comparisons.
 */
export function protocolToCompoundProfile(protocol: StoreResearchProtocol): CompoundProfile {
  const content = protocol.content as Record<string, any> | undefined
  const mol = content?.molecular_details
  const recon = content?.reconstitution_details
  const quickRef = (content?.quick_reference || []) as Array<{ key: string; label: string; value: string }>

  // Primary target receptor or molecular pathway
  const targetRef = quickRef.find((r) =>
    r.key?.toLowerCase().includes("target") ||
    r.key?.toLowerCase().includes("mechanism") ||
    r.label?.toLowerCase().includes("target") ||
    r.label?.toLowerCase().includes("mechanism")
  )
  const primaryTarget =
    targetRef?.value ||
    content?.short_introduction ||
    protocol.summary ||
    "Selective biological receptor / pathway signaling"

  // Cadence / Dosing
  const cadenceRef = quickRef.find((r) =>
    r.key?.toLowerCase().includes("cadence") ||
    r.key?.toLowerCase().includes("frequency") ||
    r.label?.toLowerCase().includes("cadence") ||
    r.label?.toLowerCase().includes("frequency")
  )
  const typicalCadence = cadenceRef?.value || "Standard analytical laboratory cadence"

  // Primary focus
  const focusRef = quickRef.find((r) =>
    r.key?.toLowerCase().includes("focus") ||
    r.key?.toLowerCase().includes("application") ||
    r.label?.toLowerCase().includes("focus") ||
    r.label?.toLowerCase().includes("application")
  )
  const primaryFocus =
    focusRef?.value ||
    protocol.summary ||
    content?.short_introduction ||
    "Preclinical molecular research"

  // Standard dilution
  const standardDilution =
    recon?.default_diluent_ml && recon?.default_vial_net_mg
      ? `${recon.default_diluent_ml} mL / ${recon.default_vial_net_mg} mg (${
          recon.resulting_concentration_mg_per_ml ||
          (recon.default_vial_net_mg / recon.default_diluent_ml).toFixed(1)
        } mg/mL)`
      : undefined

  // Half-life
  const halfLifeRef = quickRef.find((r) =>
    r.key?.toLowerCase().includes("half") ||
    r.label?.toLowerCase().includes("half")
  )
  const halfLife = halfLifeRef?.value || "Experimental Model Dependent"

  // Citations
  const citations = (content?.references || []).map((ref: any, idx: number) => {
    let text = ref.notes || ref.title || ref.text || ""
    if (!text && ref.authors) {
      text = `${ref.authors}. ${ref.journal || ""} ${ref.published_at ? `(${ref.published_at}).` : ""}`.trim()
    }
    if (ref.sourceReference && !text.includes(ref.sourceReference)) {
      text = text ? `${text} [${ref.sourceReference}]` : ref.sourceReference
    }
    return {
      number: idx + 1,
      text: text.trim() || `Reference monograph citation for ${protocol.title}`,
      url:
        ref.url ||
        (ref.doi ? `https://doi.org/${ref.doi}` : "https://pubmed.ncbi.nlm.nih.gov/"),
    }
  })

  const name = content?.compound_name || protocol.title
  const handle = protocol.products?.[0]?.handle || protocol.handle

  return {
    id: protocol.handle,
    name,
    handle,
    tag: content?.product_format || content?.protocol_category_type || "Research Peptide",
    category: content?.category || "General Research",
    sequence_or_class:
      mol?.sequence_or_formula ||
      (mol?.cas_number ? `CAS ${mol.cas_number}` : "Synthetic Amino Acid Sequence"),
    molecular_mass: mol?.molecular_weight_g_per_mol
      ? `${mol.molecular_weight_g_per_mol.toFixed(2)} Da`
      : "Monoisotopic Standard",
    primary_target: primaryTarget,
    half_life: halfLife,
    reconstitution_diluent: recon?.solvent || "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
    standard_dilution: standardDilution,
    primary_focus: primaryFocus,
    purity: content?.purity_standard || "≥99.0% (HPLC Verified)",
    typical_cadence: typicalCadence,
    citations,
  }
}

export const COMPARABLE_COMPOUNDS: Record<string, CompoundProfile> = {
  "bpc-157": {
    id: "bpc-157",
    name: "BPC-157",
    handle: "bpc-157",
    tag: "Pentadecapeptide",
    category: "Tissue Repair & Healing",
    sequence_or_class: "15 Amino Acids (Gly-Glu-Pro-Pro-Pro...)",
    molecular_mass: "1419.53 Da",
    primary_target: "VEGF Receptor-2 & FAK-Paxillin Activation",
    half_life: "~4–6 Hours (Aqueous Buffer)",
    reconstitution_diluent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
    standard_dilution: "2.0 mL / 10 mg (5.0 mg/mL)",
    primary_focus: "Tendon, Ligament & Gut Mucosal Microvascular Healing",
    typical_cadence: "250 mcg – 500 mcg daily",
    citations: [
      {
        number: 1,
        text: "Chang CH, et al. Pentadecapeptide BPC 157 enhances tendon healing. J Appl Physiol. 2011;110(3):774-780.",
        url: "https://pubmed.ncbi.nlm.nih.gov/21030672/",
      },
      {
        number: 2,
        text: "Sikiric P, et al. Stable gastric pentadecapeptide BPC 157 in neurology and GI pathology. Front Pharmacol. 2021;12:627533.",
        url: "https://pubmed.ncbi.nlm.nih.gov/33815122/",
      },
    ],
  },
  "tb-500": {
    id: "tb-500",
    name: "TB-500 (Thymosin β4)",
    handle: "bpc-157", // Active catalog compound in tissue repair
    tag: "Synthetic Ac-LKKTETQ",
    category: "Tissue Repair & Healing",
    sequence_or_class: "43 Amino Acid Native Sequence (Fragment 17-23)",
    molecular_mass: "4963.50 Da (Native) / 888.0 Da (Fragment)",
    primary_target: "G-Actin Sequestration & Cell Migration",
    half_life: "~24–48 Hours (Extended Tissue Retention)",
    reconstitution_diluent: "Bacteriostatic Water or Sterile Saline",
    standard_dilution: "2.0 mL / 5 mg (2.5 mg/mL)",
    primary_focus: "Skeletal Muscle, Cardiac Fibrosis & Systemic Mobility",
    typical_cadence: "2.0 mg – 2.5 mg twice weekly",
    citations: [
      {
        number: 1,
        text: "Philp D, et al. Thymosin beta4 promotes wound healing through enhanced cell migration. J Cell Sci. 2003;116(Pt 20):4229-4238.",
        url: "https://pubmed.ncbi.nlm.nih.gov/12972508/",
      },
    ],
  },
  "tirzepatide": {
    id: "tirzepatide",
    name: "Tirzepatide",
    handle: "tirzepatide",
    tag: "Dual GLP-1 / GIP Co-Agonist",
    category: "Metabolic & GLP-1",
    sequence_or_class: "39 Amino Acid Peptide with C20 Diacid Fatty Acid Side Chain",
    molecular_mass: "4813.5 Da",
    primary_target: "GIP Receptor (Equal Affinity) & GLP-1 Receptor (Weak Affinity)",
    half_life: "~120 Hours (5 Days)",
    reconstitution_diluent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
    standard_dilution: "2.0 mL / 10 mg (5.0 mg/mL)",
    primary_focus: "Adipose Thermogenesis, Insulin Sensitivity & Glucagon Suppression",
    typical_cadence: "2.5 mg – 15.0 mg weekly (Titrated)",
    citations: [
      {
        number: 1,
        text: "Coskun T, et al. LY3298176, a novel dual GIP and GLP-1 receptor agonist for metabolic disease. Mol Metab. 2018;18:3-14.",
        url: "https://pubmed.ncbi.nlm.nih.gov/30473097/",
      },
      {
        number: 2,
        text: "Jastreboff AM, et al. Tirzepatide once weekly for the treatment of obesity (SURMOUNT-1). N Engl J Med. 2022;387(3):205-216.",
        url: "https://pubmed.ncbi.nlm.nih.gov/35658024/",
      },
    ],
  },
  "semaglutide": {
    id: "semaglutide",
    name: "Semaglutide",
    handle: "tirzepatide", // Active catalog dual incretin
    tag: "Mono GLP-1 Receptor Agonist",
    category: "Metabolic & GLP-1",
    sequence_or_class: "31 Amino Acid Synthetic Peptide with C18 Diacid Chain",
    molecular_mass: "4113.6 Da",
    primary_target: "Selective GLP-1 Receptor (High Affinity)",
    half_life: "~168 Hours (7 Days)",
    reconstitution_diluent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
    standard_dilution: "2.0 mL / 5 mg (2.5 mg/mL)",
    primary_focus: "Gastric Motility Deceleration & Central Satiety Signaling",
    typical_cadence: "0.25 mg – 2.4 mg weekly (Titrated)",
    citations: [
      {
        number: 1,
        text: "Wilding JPH, et al. Once-weekly Semaglutide in adults with overweight or obesity (STEP 1). N Engl J Med. 2021;384(11):989-1002.",
        url: "https://pubmed.ncbi.nlm.nih.gov/33567185/",
      },
    ],
  },
  "ghk-cu": {
    id: "ghk-cu",
    name: "GHK-Cu (Copper Tripeptide)",
    handle: "ghk-cu",
    tag: "Tripeptide-Copper Chelate",
    category: "Cellular Longevity",
    sequence_or_class: "Glycyl-L-Histidyl-L-Lysine:Cu2+ (1:1 Chelate Complex)",
    molecular_mass: "401.91 Da (Free) / 464.44 Da (Chelated)",
    primary_target: "Decorin Synthesis, MMP/TIMP Balance & Pro-Collagen I/III",
    half_life: "~1–3 Hours (Free Plasma) / Extended Tissue Extracellular Binding",
    reconstitution_diluent: "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
    standard_dilution: "2.5 mL / 50 mg (20.0 mg/mL)",
    primary_focus: "Dermal Fibroblast Activation, Collagen Remodeling & Gene Reset",
    typical_cadence: "1.0 mg – 2.0 mg daily",
    citations: [
      {
        number: 1,
        text: "Pickart L, et al. Regenerative and protective actions of the GHK-Cu peptide in the light of the new gene data. Int J Mol Sci. 2018;19(7):1987.",
        url: "https://pubmed.ncbi.nlm.nih.gov/29986520/",
      },
    ],
  },
  "tesamorelin": {
    id: "tesamorelin",
    name: "Tesamorelin",
    handle: "ghk-cu", // Linked to active peptide catalog
    tag: "GHRH Analog",
    category: "Growth Hormone Axis",
    sequence_or_class: "44 Amino Acid N-terminal Trans-3-Hexenoyl Derivative",
    molecular_mass: "5135.9 Da",
    primary_target: "Pituitary GHRH Receptor (Endogenous Pulsatile GH Release)",
    half_life: "~26–38 Minutes (Rapid Pulsatile Peak)",
    reconstitution_diluent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
    standard_dilution: "2.0 mL / 10 mg (5.0 mg/mL)",
    primary_focus: "Visceral Adipose Mobilization & IGF-1 Elevation Without Somatotroph Burnout",
    typical_cadence: "1.0 mg – 2.0 mg daily (Before sleep/fasted)",
    citations: [
      {
        number: 1,
        text: "Falutz J, et al. Metabolic effects of a growth hormone-releasing factor in patients with abdominal fat accumulation. N Engl J Med. 2007;357(23):2359-2370.",
        url: "https://pubmed.ncbi.nlm.nih.gov/18057338/",
      },
    ],
  },
  "epithalon": {
    id: "epithalon",
    name: "Epithalon (Epitalon)",
    handle: "ghk-cu", // Longevity category
    tag: "Synthetic Pineal Tetrapeptide",
    category: "Cellular Longevity",
    sequence_or_class: "Ala-Glu-Asp-Gly (AEDG Synthetic Peptide)",
    molecular_mass: "390.35 Da",
    primary_target: "Telomerase Catalytic Subunit (hTERT) Gene Induction",
    half_life: "~20–30 Minutes (Rapid Nuclear Translocation)",
    reconstitution_diluent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
    standard_dilution: "2.0 mL / 10 mg (5.0 mg/mL)",
    primary_focus: "Telomere Length Maintenance, Circadian Neuroendocrine & Melatonin Reset",
    typical_cadence: "5.0 mg – 10.0 mg daily in 10-day courses",
    citations: [
      {
        number: 1,
        text: "Khavinson VK, et al. Peptide promotes telomerase activation and telomere elongation in human somatic cells. Bull Exp Biol Med. 2003;135(6):590-592.",
        url: "https://pubmed.ncbi.nlm.nih.gov/12968145/",
      },
    ],
  },
}

export const PEPTIDE_COMPARISONS: PeptideComparison[] = [
  {
    slug: "bpc-157-vs-tb-500",
    title: "BPC-157 vs. TB-500: Angiogenic Signaling vs. Actin Polymerization",
    subtitle: "A head-to-head laboratory analysis comparing gastric pentadecapeptide tissue remodeling against synthetic Thymosin Beta-4 cellular migration.",
    category: "Tissue Repair & Healing",
    compoundA: COMPARABLE_COMPOUNDS["bpc-157"],
    compoundB: COMPARABLE_COMPOUNDS["tb-500"],
    summary:
      "While both compounds are widely researched in regenerative biology, their molecular pathways are fundamentally distinct. BPC-157 acts locally as an angiogenic catalyst, stimulating microvascular sprouting and fibroblast collagen deposition. TB-500 acts systemically as an actin-binding protein, promoting cellular motility and down-regulating inflammatory myofibroblast differentiation.",
    synergy_verdict:
      "Complementary (The Wolverine Synergy). In laboratory explant models, researchers frequently co-administer BPC-157 and TB-500. BPC-157 establishes the neovascular capillary network to supply nutrient perfusion, while TB-500 accelerates tenocyte and myoblast migration into the damaged matrix zone.",
    vectors: [
      {
        feature: "Primary Mechanism",
        compoundA_val: "VEGF upregulation, nitric oxide modulation, FAK-paxillin focal adhesion",
        compoundB_val: "Actin filament regulation, G-actin binding, directional cell motility",
        verdict: "Complementary Pathways",
      },
      {
        feature: "Target Tissue Specificity",
        compoundA_val: "High affinity for tendon-to-bone junctions, ligaments, and GI mucosa",
        compoundB_val: "High affinity for skeletal muscle fibers, cardiac tissue, and fascia",
        verdict: "BPC: Tendon/Gut | TB: Muscle/Systemic",
      },
      {
        feature: "Systemic vs. Local Action",
        compoundA_val: "Predominantly localized tissue concentration near application area",
        compoundB_val: "High systemic circulation and multi-organ tissue dispersion",
        verdict: "TB-500 has broader systemic reach",
      },
      {
        feature: "Stability After Reconstitution",
        compoundA_val: "28 days at 2°C–8°C in bacteriostatic water",
        compoundB_val: "14–21 days at 2°C–8°C (higher sensitivity to thermal cycling)",
        verdict: "BPC-157 has higher solution resilience",
      },
      {
        feature: "Common Research Protocol Range",
        compoundA_val: "250 mcg – 500 mcg daily in analytical trials",
        compoundB_val: "2.0 mg – 2.5 mg twice weekly in analytical trials",
        verdict: "Different cadence (Daily vs Intermittent)",
      },
    ],
    citations: [
      {
        number: 1,
        text: "Chang CH, et al. Pentadecapeptide BPC 157 enhances tendon healing. J Appl Physiol. 2011;110(3):774-780.",
        url: "https://pubmed.ncbi.nlm.nih.gov/21030672/",
      },
      {
        number: 2,
        text: "Philp D, et al. Thymosin beta4 promotes wound healing through enhanced cell migration. J Cell Sci. 2003;116(Pt 20):4229-4238.",
        url: "https://pubmed.ncbi.nlm.nih.gov/12972508/",
      },
    ],
  },
  {
    slug: "tirzepatide-vs-semaglutide",
    title: "Tirzepatide vs. Semaglutide: Dual Incretin Co-Agonism vs. Selective GLP-1",
    subtitle: "Comparative in-vitro pharmacodynamics, receptor binding kinetics, and metabolic signaling pathway analysis.",
    category: "Metabolic & GLP-1",
    compoundA: COMPARABLE_COMPOUNDS["tirzepatide"],
    compoundB: COMPARABLE_COMPOUNDS["semaglutide"],
    summary:
      "The pivotal distinction between Semaglutide and Tirzepatide lies in receptor engagement. Semaglutide functions solely at the GLP-1 receptor, primarily suppressing appetite through hindbrain receptors and slowing gastric transit. Tirzepatide introduces glucose-dependent insulinotropic polypeptide (GIP) receptor agonism, directly influencing white and brown adipose lipid metabolism and mitigating the nausea response associated with isolated GLP-1 stimulation.",
    synergy_verdict:
      "Mutually Exclusive (Competing Target Receptors). In laboratory research, these compounds are evaluated independently rather than co-administered, as both compete for GLP-1 receptor binding sites.",
    vectors: [
      {
        feature: "Target Receptors",
        compoundA_val: "Dual GIPR + GLP-1R Co-Agonist",
        compoundB_val: "Selective Monotherapy GLP-1R Agonist",
        verdict: "Tirzepatide has dual receptor activation",
      },
      {
        feature: "Adipose Tissue Action",
        compoundA_val: "Direct GIP-mediated lipid buffering and uncoupling protein-1 (UCP-1) stimulation",
        compoundB_val: "Indirect adipose loss secondary to caloric restriction and gastric slowing",
        verdict: "Tirzepatide has direct fat tissue signaling",
      },
      {
        feature: "In-Vitro Half-Life",
        compoundA_val: "~120 Hours (5 days, steady state achieved by week 4)",
        compoundB_val: "~168 Hours (7 days, perfectly aligned with weekly cadence)",
        verdict: "Semaglutide has longer terminal half-life",
      },
      {
        feature: "Gastrointestinal Tolerance In Vitro",
        compoundA_val: "GIP co-agonism dampens emetic and hyper-motility distress pathways",
        compoundB_val: "GLP-1 monotherapy shows higher initial gastrointestinal motility slowing",
        verdict: "Tirzepatide exhibits milder nausea markers",
      },
    ],
    citations: [
      {
        number: 1,
        text: "Coskun T, et al. LY3298176, a novel dual GIP and GLP-1 receptor agonist for the treatment of type 2 diabetes. Mol Metab. 2018;18:3-14.",
        url: "https://pubmed.ncbi.nlm.nih.gov/30473097/",
      },
      {
        number: 2,
        text: "Nauck MA, et al. The evolving story of incretins: dual GIP/GLP-1 receptor agonists in metabolic disease. Lancet Diabetes Endocrinol. 2021;9(9):586-608.",
        url: "https://pubmed.ncbi.nlm.nih.gov/34293339/",
      },
    ],
  },
]

/**
 * Evaluates physiological and molecular synergy across peptide classes
 */
export function calculateSynergyVerdict(compA: CompoundProfile, compB: CompoundProfile): string {
  if (compA.id === compB.id) {
    return "Identical Reference Standard: Select two distinct compounds from the dropdowns to evaluate comparative pharmacodynamics and receptor affinity."
  }

  const catA = (compA.category || "").toLowerCase()
  const catB = (compB.category || "").toLowerCase()
  const nameA = (compA.name || "").toLowerCase()
  const nameB = (compB.name || "").toLowerCase()

  // Specific canonical synergy pairs
  if (
    (nameA.includes("bpc-157") && nameB.includes("tb-500")) ||
    (nameA.includes("tb-500") && nameB.includes("bpc-157"))
  ) {
    return "The Wolverine Synergy: Angiogenic microvascular sprouting from BPC-157 provides nutrient perfusion, while TB-500 accelerates tenocyte and myoblast migration into the repaired zone."
  }
  if (
    (nameA.includes("cjc") && nameB.includes("ipamorelin")) ||
    (nameA.includes("ipamorelin") && nameB.includes("cjc"))
  ) {
    return "Dual Somatotrophic Amplification: GHRH receptor stimulation synergizes with selective GHSR ghrelin-mimetic secretagogue pulses to elevate endogenous IGF-1 without desensitization."
  }
  if (
    (nameA.includes("tirzepatide") && nameB.includes("semaglutide")) ||
    (nameA.includes("semaglutide") && nameB.includes("tirzepatide"))
  ) {
    return "Incretin Receptor Benchmark: Semaglutide functions selectively as a GLP-1 mono-agonist, whereas Tirzepatide adds GIP co-agonism for direct adipose lipid buffering and reduced emetic distress."
  }
  if (
    (nameA.includes("retatrutide") && (nameB.includes("tirzepatide") || nameB.includes("semaglutide"))) ||
    ((nameA.includes("tirzepatide") || nameA.includes("semaglutide")) && nameB.includes("retatrutide"))
  ) {
    return "Triple vs. Dual/Mono Incretin Hierarchy: Retatrutide introduces glucagon receptor agonism to stimulate hepatic fatty acid oxidation and thermogenesis beyond GLP-1/GIP incretin boundaries."
  }
  if (
    (nameA.includes("mots-c") && nameB.includes("ss-31")) ||
    (nameA.includes("ss-31") && nameB.includes("mots-c"))
  ) {
    return "Mitochondrial Dual-Axis Synergy: SS-31 selectively binds cardiolipin to restore electron transport chain efficiency, while MOTS-c activates AMPK to enhance metabolic cellular glucose handling."
  }
  if (
    (nameA.includes("semax") && nameB.includes("selank")) ||
    (nameA.includes("selank") && nameB.includes("semax"))
  ) {
    return "Neuro-Restorative Equilibrium: Semax stimulates BDNF/TrkB for cognitive focus and neuroprotection, while Selank modulates GABAergic and enkephalin pathways to dampen anxiogenic tone."
  }

  // Generalized Category Synergy Rules
  if (catA.includes("tissue") && catB.includes("tissue")) {
    return "High Regenerative Synergy: Angiogenic microvascular scaffolding combined with cellular motility and structural matrix reorganization."
  }
  if (catA.includes("metabolic") && catB.includes("metabolic")) {
    return "Receptor Competency & Incretin Modulation: Evaluates mono vs. multi-receptor co-agonism (GLP-1 / GIP / Glucagon) for energy expenditure and glycemic homeostasis."
  }
  if (catA.includes("growth") && catB.includes("growth")) {
    return "Neuroendocrine Somatotroph Synergy: Pituitary GHRH receptor induction paired with GHSR secretagogue pulsatile amplification."
  }
  if (catA.includes("longevity") && catB.includes("longevity")) {
    return "Epigenetic & Cellular Longevity Synergy: Telomerase activation and mitochondrial redox stabilization working in tandem with extracellular matrix decorin regulation."
  }
  if (
    (catA.includes("tissue") && catB.includes("longevity")) ||
    (catA.includes("longevity") && catB.includes("tissue"))
  ) {
    return "Regenerative & Epigenetic Matrix: Localized angiogenic repair complemented by broad-spectrum extracellular collagen and gene reset signaling."
  }
  if (
    (catA.includes("growth") && catB.includes("tissue")) ||
    (catA.includes("tissue") && catB.includes("growth"))
  ) {
    return "Anabolic & Structural Healing Synergy: Pituitary IGF-1 upregulation complements localized microvascular tenocyte collagen remodeling."
  }
  if (
    (catA.includes("metabolic") && catB.includes("growth")) ||
    (catA.includes("growth") && catB.includes("metabolic"))
  ) {
    return "Metabolic Partitioning Axis: Adipose lipolysis combined with somatotroph lean tissue preservation."
  }
  if (catA.includes("nootropic") || catB.includes("nootropic") || catA.includes("neuro") || catB.includes("neuro")) {
    return "Neurotrophic & Neuropeptide Signaling: BDNF/TrkB activation paired with neuromodulatory neurotransmitter equilibrium."
  }
  if (catA.includes("immuno") || catB.includes("immuno") || catA.includes("antimicrobial") || catB.includes("antimicrobial")) {
    return "Host Defense & Immunological Calibration: Thymic peptide T-cell differentiation combined with broad-spectrum cathelicidin membrane barrier reinforcement."
  }

  return "Cross-Domain Evaluation: Multi-pathway laboratory analysis comparing distinct physiological and molecular mechanisms."
}

/**
 * Generate or resolve a comparison dynamically for ANY two compound IDs
 */
export function getDynamicComparison(
  compoundAId: string,
  compoundBId: string,
  customRegistry?: Record<string, CompoundProfile>
): PeptideComparison {
  const registry = customRegistry || COMPARABLE_COMPOUNDS
  const compA =
    registry[compoundAId] ||
    COMPARABLE_COMPOUNDS[compoundAId] ||
    COMPARABLE_COMPOUNDS["bpc-157"]
  const compB =
    registry[compoundBId] ||
    COMPARABLE_COMPOUNDS[compoundBId] ||
    COMPARABLE_COMPOUNDS["tb-500"]

  // Check if an authored monograph exists (direct or inverted)
  const authored = PEPTIDE_COMPARISONS.find(
    (c) =>
      (c.compoundA.id === compA.id && c.compoundB.id === compB.id) ||
      (c.compoundA.id === compB.id && c.compoundB.id === compA.id)
  )

  if (authored) {
    if (authored.compoundA.id === compA.id) {
      return authored
    }
    // Inverted authored comparison
    return {
      ...authored,
      compoundA: compA,
      compoundB: compB,
      vectors: authored.vectors.map((v) => ({
        feature: v.feature,
        compoundA_val: v.compoundB_val,
        compoundB_val: v.compoundA_val,
        verdict: v.verdict,
      })),
    }
  }

  const synergyVerdict = calculateSynergyVerdict(compA, compB)

  const citations = [
    ...(compA.citations || []),
    ...(compB.citations || []).filter(
      (citB) => !(compA.citations || []).some((citA) => citA.text === citB.text)
    ),
  ].map((c, idx) => ({ ...c, number: idx + 1 }))

  return {
    slug: `${compA.id}-vs-${compB.id}`,
    title: `${compA.name} vs. ${compB.name}: Comparative Pharmacodynamics & Molecular Targets`,
    subtitle: `A side-by-side analytical assessment evaluating ${compA.primary_target} against ${compB.primary_target}.`,
    category: compA.category,
    compoundA: compA,
    compoundB: compB,
    summary: `Evaluating ${compA.name} (${compA.tag}) alongside ${compB.name} (${compB.tag}). While ${compA.name} targets ${compA.primary_focus}, ${compB.name} focuses on ${compB.primary_focus}. Both compounds represent distinct molecular targets within modern peptide research.`,
    synergy_verdict: synergyVerdict,
    vectors: [
      {
        feature: "Primary Receptor Target",
        compoundA_val: compA.primary_target,
        compoundB_val: compB.primary_target,
        verdict: compA.primary_target === compB.primary_target ? "Identical Receptor" : "Distinct Target Receptors",
      },
      {
        feature: "Molecular Mass & Classification",
        compoundA_val: `${compA.molecular_mass} (${compA.sequence_or_class})`,
        compoundB_val: `${compB.molecular_mass} (${compB.sequence_or_class})`,
        verdict: `${compA.tag} vs ${compB.tag}`,
      },
      {
        feature: "In-Vitro Half-Life",
        compoundA_val: compA.half_life,
        compoundB_val: compB.half_life,
        verdict: "Pharmacokinetic Persistence",
      },
      {
        feature: "Reconstitution Standard",
        compoundA_val: `${compA.reconstitution_diluent}${compA.standard_dilution ? ` · ${compA.standard_dilution}` : ""}`,
        compoundB_val: `${compB.reconstitution_diluent}${compB.standard_dilution ? ` · ${compB.standard_dilution}` : ""}`,
        verdict: "Solvent & Dilution Requirement",
      },
      {
        feature: "Primary Research Focus",
        compoundA_val: compA.primary_focus,
        compoundB_val: compB.primary_focus,
        verdict: "Differential Tissue Affinity",
      },
      {
        feature: "Standard Analytical Cadence",
        compoundA_val: compA.typical_cadence || "Varies by experimental model",
        compoundB_val: compB.typical_cadence || "Varies by experimental model",
        verdict: "Protocol Cadence Comparison",
      },
    ],
    citations,
  }
}

/**
 * Normalizes backend Medusa DML records (compound_a, compound_b) to Storefront types (compoundA, compoundB)
 */
export function normalizePeptideComparison(raw: any): PeptideComparison {
  if (!raw) return raw
  return {
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle,
    category: raw.category,
    compoundA: raw.compoundA || raw.compound_a,
    compoundB: raw.compoundB || raw.compound_b,
    summary: raw.summary,
    synergy_verdict: raw.synergy_verdict || raw.synergyVerdict,
    vectors: raw.vectors || [],
    citations: raw.citations || [],
  }
}

export const listPeptideComparisons = async (): Promise<PeptideComparison[]> => {
  try {
    const response = await sdk.client.fetch<{ comparisons: any[]; count: number }>(
      "/store/peptide-comparisons?limit=100",
      { method: "GET", cache: "no-store" }
    )
    if (response?.comparisons && response.comparisons.length > 0) {
      return response.comparisons.map(normalizePeptideComparison)
    }
  } catch (err) {
    console.warn("[listPeptideComparisons] Medusa API call failed or offline, falling back to static cache:", err)
  }
  return PEPTIDE_COMPARISONS.map(normalizePeptideComparison)
}

export const retrievePeptideComparison = async (
  slug: string
): Promise<PeptideComparison | null> => {
  try {
    const response = await sdk.client.fetch<{ comparison: any }>(
      `/store/peptide-comparisons/${encodeURIComponent(slug)}`,
      { method: "GET", cache: "no-store" }
    )
    if (response?.comparison) {
      return normalizePeptideComparison(response.comparison)
    }
  } catch (err) {
    console.warn(`[retrievePeptideComparison] Medusa API call for '${slug}' failed, falling back to local resolver:`, err)
  }

  const comparison = PEPTIDE_COMPARISONS.find((c) => c.slug === slug)
  if (comparison) return normalizePeptideComparison(comparison)

  const parts = slug.split("-vs-")
  if (parts.length === 2) {
    try {
      const [resA, resB] = await Promise.all([
        retrieveResearchProtocol(parts[0]).catch(() => null),
        retrieveResearchProtocol(parts[1]).catch(() => null),
      ])
      if (resA?.protocol && resB?.protocol) {
        const profileA = protocolToCompoundProfile(resA.protocol)
        const profileB = protocolToCompoundProfile(resB.protocol)
        return getDynamicComparison(profileA.id, profileB.id, {
          [profileA.id]: profileA,
          [profileB.id]: profileB,
        })
      }
    } catch (protocolErr) {
      console.warn(`[retrievePeptideComparison] Protocol resolution for ${slug} failed:`, protocolErr)
    }

    return getDynamicComparison(parts[0], parts[1])
  }
  return null
}

export const listComparisonsForCompound = async (
  compoundNameOrHandle: string
): Promise<PeptideComparison[]> => {
  const comparisons = await listPeptideComparisons()
  const query = compoundNameOrHandle.toLowerCase()
  return comparisons.filter(
    (c) =>
      c.compoundA.name.toLowerCase().includes(query) ||
      c.compoundA.handle.toLowerCase().includes(query) ||
      c.compoundB.name.toLowerCase().includes(query) ||
      c.compoundB.handle.toLowerCase().includes(query)
  )
}
