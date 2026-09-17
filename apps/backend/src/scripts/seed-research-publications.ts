/**
 * @file apps/backend/src/scripts/seed-research-publications.ts
 * @module ResearchContentSeeder
 * @purpose Idempotent database seeder for scientific research articles and head-to-head peptide comparisons.
 * @contracts Inputs: Canonical publication dataset | Outputs: PostgreSQL records in research_article & peptide_comparison
 */

import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RESEARCH_CONTENT_MODULE } from "../modules/research-content"
import type ResearchContentModuleService from "../modules/research-content/service"

const CANONICAL_ARTICLES = [
  {
    slug: "bpc-157-angiogenesis-tissue-remodeling",
    title: "BPC-157: Cellular Mechanisms in Pentadecapeptide Angiogenesis & Soft Tissue Remodeling",
    subtitle: "Analysis of VEGF upregulation, FAK-paxillin focal adhesion phosphorylation, and tenocyte migration kinetics in vitro.",
    abstract: "Body Protection Compound-157 (BPC-157) is a synthetic 15-amino acid peptide derived from human gastric juice protein sequences. In laboratory and cellular models, BPC-157 demonstrates notable cytoprotective and regenerative properties driven primarily by the promotion of early growth response-1 (egr-1) gene expression, acceleration of vascular endothelial growth factor (VEGF) synthesis, and modulation of the focal adhesion kinase (FAK)-paxillin signaling cascade. This monograph reviews preclinical findings on collagen organization, granulation tissue formation, and vascular permeability in tendon, ligament, and mucosal models.",
    category: "Tissue Repair & Healing",
    compound_tag: "BPC-157",
    reading_time: "6 min read",
    reviewed_by: "Scientific Review Board · Analytical Chemistry & In-Vitro Pharmacology",
    status: "published" as const,
    published_at: "2026-08-15T00:00:00.000Z",
    referenced_compound: {
      name: "BPC-157 (5 mg)",
      handle: "bpc-157-vial",
      purity: "≥99.2% (HPLC Verified)",
      specification: "Lyophilized Solid Powder · Sequence Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
      default_dose_preset: 250,
      default_mass_mg: 5,
      protocol_handle: "bpc-157",
    },
    sections: [
      {
        title: "1. Molecular Structure & Sequence Characteristics",
        paragraphs: [
          "BPC-157 (molecular formula C62H98N16O22, molecular weight 1419.53 Da) comprises 15 amino acid residues: Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val. Unlike native gastric juice peptides that readily degrade under proteolytic cleavage, BPC-157 exhibits conformation-stabilized peptide backbone resistance in both neutral and acidic aqueous buffers.",
          "High-performance liquid chromatography (HPLC) combined with electrospray ionization mass spectrometry (ESI-MS) confirms that standard lyophilized formulations remain stable at room temperature in solid state for up to 60 days, retaining monoisotopic exact mass fidelity without spontaneous racemization."
        ]
      },
      {
        title: "2. Angiogenic Signaling: VEGF Induction and Egr-1 Activation",
        paragraphs: [
          "Laboratory assays in endothelial cell lines demonstrate that BPC-157 incubation stimulates capillary vessel outgrowth. This effect is mediated by transcriptional upregulation of early growth response protein-1 (egr-1) and downstream vascular endothelial growth factor receptor 2 (VEGFR-2) internal phosphorylation.",
          "Rather than triggering uncontrolled non-specific neovascularization, cell culture assays demonstrate that BPC-157 accelerates endogenous vascular architecture repair specifically under ischemic or mechanically damaged substrate conditions, restoring nutrient perfusion to avascular matrix zones."
        ]
      },
      {
        title: "3. Tenocyte Outgrowth and Extracellular Matrix (ECM) Synthesis",
        paragraphs: [
          "In tenocyte explant cultures, BPC-157 promotes cellular proliferation and directional migration across collagen gel matrices. Western blot analyses show elevated expression of focal adhesion kinase (FAK) and paxillin phosphorylation, indicating enhanced cell-substrate anchorage and mechanical tension generation.",
          "Furthermore, mRNA quantitation in fibroblastic assays reveals accelerated transcription of Type I collagen relative to non-functional Type III scar tissue, supporting structural remodeling towards physiological fiber alignment rather than irregular fibrotic plaques."
        ]
      },
      {
        title: "4. Laboratory Reconstitution & Handling Observations",
        paragraphs: [
          "In analytical laboratory environments, BPC-157 dissolves readily in 0.9% bacteriostatic sodium chloride or sterile water for injection (SWFI) without requiring organic co-solvents. Once reconstituted, solution integrity should be preserved at 2°C–8°C away from direct photolytic exposure to prevent oxidation of proline-rich clusters."
        ]
      }
    ],
    citations: [
      {
        number: 1,
        authors: "Sikiric P, Seiwerth S, Rucman R, Turkovic B, et al.",
        title: "Stable gastric pentadecapeptide BPC 157: novel therapy in gastrointestinal tract, liver, and tendon injury models.",
        journal: "Current Pharmaceutical Design",
        year: 2011,
        pmid: "21248398",
        doi: "10.2174/138161211796196954",
        url: "https://pubmed.ncbi.nlm.nih.gov/21248398/"
      },
      {
        number: 2,
        authors: "Chang CH, Tsai WC, Hsu YH, Pang JH.",
        title: "Pentadecapeptide BPC 157 enhances the growth hormone receptor expression in tendon fibroblasts.",
        journal: "Molecules",
        year: 2014,
        pmid: "25415472",
        doi: "10.3390/molecules191119066",
        url: "https://pubmed.ncbi.nlm.nih.gov/25415472/"
      }
    ]
  },
  {
    slug: "ghk-cu-collagen-extracellular-matrix",
    title: "GHK-Cu: Copper Tripeptide Gene Modulation, Collagen Matrix Synthesis & Cellular Viability",
    subtitle: "Investigating glycyl-L-histidyl-L-lysine copper complex induction of metalloproteinases, decorin, and fibroblast pro-collagen gene expression.",
    abstract: "Glycyl-L-histidyl-L-lysine (GHK) is a naturally occurring plasma tripeptide with extraordinarily high affinity for copper(II) ions (log K = 16.4). First isolated in human albumin in 1973, GHK-Cu functions as a master transcriptional modulator capable of up- and down-regulating over 4,000 human genes. Preclinical and cellular models demonstrate GHK-Cu's unique capacity to stimulate decorin synthesis, balance matrix metalloproteinases (MMPs) with tissue inhibitors (TIMPs), and suppress inflammatory cytokines while stimulating Type I and Type III pro-collagen synthesis in dermal and soft tissue fibroblasts.",
    category: "Cellular Longevity",
    compound_tag: "GHK-Cu",
    reading_time: "5 min read",
    reviewed_by: "Scientific Review Board · Molecular Biology & Dermal Biochemistry",
    status: "published" as const,
    published_at: "2026-08-22T00:00:00.000Z",
    referenced_compound: {
      name: "GHK-Cu (50 mg)",
      handle: "ghk-cu",
      purity: "≥99.1% (HPLC & Cu Elemental Chelation)",
      specification: "Lyophilized Deep Blue Crystalline Powder · Cu2+ Chelation Ratio 1:1",
      default_dose_preset: 2000,
      default_mass_mg: 50,
      protocol_handle: "ghk-cu",
    },
    sections: [
      {
        title: "1. Biochemical Chelation Chemistry & Stability",
        paragraphs: [
          "GHK-Cu (molecular formula C14H22CuN6O4, molecular weight 401.91 Da) exists as a distinctive royal blue coordination complex in which the Cu(II) ion is tetracoordinated by the amino terminal nitrogen, two amide nitrogens, and the imidazole ring of histidine.",
          "This square planar geometry imparts exceptional thermodynamic stability in physiological solution, shielding the bound copper from generating toxic Fenton-type reactive oxygen species (ROS) while facilitating bioavailability and targeted receptor uptake."
        ]
      },
      {
        title: "2. Gene Modulation: Broad Transcriptional Reprogramming",
        paragraphs: [
          "Broad-scale genomic microarray studies reveal that GHK-Cu shifts cellular expression profiles towards a youthful physiological state. Specifically, GHK-Cu upregulates DNA repair genes, ubiquitin-proteasome systems, and antioxidant enzymes including superoxide dismutase (SOD1).",
          "Concurrently, the tripeptide downregulates pro-inflammatory markers including transforming growth factor-beta (TGF-β) and tumor necrosis factor-alpha (TNF-α), preventing excessive scar fibrosis while promoting functional tissue remodeling."
        ]
      },
      {
        title: "3. Extracellular Matrix Synthesis: Collagen, Elastin & Decorin",
        paragraphs: [
          "In human fibroblast cultures, GHK-Cu increases the synthesis of collagen by approximately 70% compared to untreated controls, outperforming all-trans retinoic acid and ascorbate in in-vitro assays without causing cytotoxic irritation.",
          "Crucially, GHK-Cu stimulates the expression of decorin—a small leucine-rich proteoglycan that binds to Type I collagen fibrils and ensures uniform, parallel fiber diameter, mitigating irregular bundle formation and keloid-like aggregation."
        ]
      }
    ],
    citations: [
      {
        number: 1,
        authors: "Pickart L, Margolina A.",
        title: "Regenerative and protective actions of the GHK-Cu peptide in the light of the new gene data.",
        journal: "International Journal of Molecular Sciences",
        year: 2018,
        pmid: "29986520",
        doi: "10.3390/ijms19071987",
        url: "https://pubmed.ncbi.nlm.nih.gov/29986520/"
      }
    ]
  },
  {
    slug: "peptide-reconstitution-stoichiometry-guide",
    title: "Laboratory Methodology: Peptide Reconstitution Stoichiometry, Bacteriostatic Preservatives & Cold-Chain Stability",
    subtitle: "A standardized reference manual for sterile dissolution, benzyl alcohol osmolarity, lyophilized cake integrity, and degradation kinetics.",
    abstract: "Synthesized research peptides arrive as lyophilized solid cakes requiring careful reconstitution prior to analytical investigation. Improper handling—such as rapid direct jetting of solvent onto the cake, vigorous mechanical vortexing, or exposure to excessive thermal cycling—can induce peptide backbone shear, deamidation, oxidation, and irreversible precipitation. This reference protocol outlines precision stoichiometry for calculating concentrations, diluent volume trade-offs between 0.9% benzyl alcohol bacteriostatic water and sterile water for injection, and cold-chain stability windows across standard storage temperature regimes.",
    category: "Laboratory Methodology",
    compound_tag: "Laboratory Practice",
    reading_time: "7 min read",
    reviewed_by: "Scientific Review Board · Analytical Lab Operations & Quality Control",
    status: "published" as const,
    published_at: "2026-08-30T00:00:00.000Z",
    referenced_compound: {
      name: "Bacteriostatic Water 10 mL USP",
      handle: "bacteriostatic-water",
      purity: "USP Grade (0.9% Benzyl Alcohol)",
      specification: "Sterile Aqueous Diluent Solution",
      protocol_handle: "bacteriostatic-water",
    },
    sections: [
      {
        title: "1. The Physics of Lyophilized Cake Dissolution",
        paragraphs: [
          "Lyophilization (freeze-drying) removes water from frozen peptide solutions through sublimation under deep vacuum, leaving behind a highly porous amorphous or crystalline matrix known as the cake. This microscopic porosity allows rapid capillary uptake of solvent.",
          "When adding diluent, solvent should always be directed smoothly along the inside glass wall of the vial rather than directly squirted onto the cake. Direct high-velocity impact can cause mechanical shearing of sensitive tertiary or secondary structures, particularly in longer peptide chains exceeding 25 amino acid residues."
        ]
      },
      {
        title: "2. Diluent Selection: Bacteriostatic Water vs. Sterile Water for Injection",
        paragraphs: [
          "Bacteriostatic Water for Injection (BWFI) contains 0.9% benzyl alcohol (9 mg/mL) as an antimicrobial preservative. This bacteriostatic agent inhibits bacterial proliferation across multi-entry sampling protocols spanning up to 28 days when maintained under refrigeration.",
          "Sterile Water for Injection (SWFI) lacks preservatives and is strictly intended for single-session analytical procedures. If SWFI is used, the reconstituted solution must be consumed or discarded within 24 hours to prevent microbial contamination and subsequent endotoxin formation."
        ]
      },
      {
        title: "3. Reconstitution Concentration Stoichiometry & Syringe Scaling",
        paragraphs: [
          "Accurate dosing math depends on the ratio of net peptide mass (mg or mcg) to diluent volume (mL). Using a standard 10 mg peptide vial: adding 1 mL yields 10 mg/mL (10,000 mcg/mL), while adding 2 mL yields 5 mg/mL (5,000 mcg/mL).",
          "On a standard U-100 insulin syringe (where 100 units = 1.0 mL, or 1 unit = 0.01 mL): at a concentration of 5 mg/mL (5 mcg per unit), a target research dose of 250 mcg corresponds precisely to 50 units (0.05 mL). Utilizing lower concentrations allows finer measurement precision and minimizes meniscus parallax reading errors."
        ]
      }
    ],
    citations: [
      {
        number: 1,
        authors: "Manning MC, Chou DK, Murphy BM, Payne RW, Souillac PO.",
        title: "Stability of protein pharmaceuticals: an update on chemical and physical degradation pathways.",
        journal: "Pharmaceutical Research",
        year: 2010,
        pmid: "20387002",
        doi: "10.1007/s11095-010-0102-1",
        url: "https://pubmed.ncbi.nlm.nih.gov/20387002/"
      }
    ]
  }
]

const CANONICAL_COMPARISONS = [
  {
    slug: "bpc-157-vs-tb-500",
    title: "BPC-157 vs. TB-500: Preclinical Comparison of Regenerative Mechanisms",
    subtitle: "A comparative scientific evaluation of local angiogenic signaling versus systemic actin cytoskeletal cell migration.",
    category: "Tissue Repair & Healing",
    compound_a: {
      id: "bpc-157",
      name: "BPC-157",
      handle: "bpc-157-vial",
      tag: "Pentadecapeptide",
      category: "Tissue Repair & Healing",
      sequence_or_class: "15 Amino Acids (Gly-Glu-Pro-Pro-Pro...)",
      molecular_mass: "1419.53 Da",
      primary_target: "VEGF Receptor-2 & FAK-Paxillin Activation",
      half_life: "~4–6 Hours (Aqueous Buffer)",
      reconstitution_diluent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      standard_dilution: "2.0 mL / 10 mg (5.0 mg/mL)",
      primary_focus: "Tendon, Ligament & Gut Mucosal Microvascular Healing",
      typical_cadence: "250 mcg – 500 mcg daily"
    },
    compound_b: {
      id: "tb-500",
      name: "TB-500 (Thymosin Beta-4 Active Fragment)",
      handle: "tb-500",
      tag: "Thymosin Derivative",
      category: "Tissue Repair & Healing",
      sequence_or_class: "Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser",
      molecular_mass: "4963.5 Da",
      primary_target: "G-Actin Sequestration & Cell Migration",
      half_life: "~24–36 Hours",
      reconstitution_diluent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      standard_dilution: "2.0 mL / 10 mg (5.0 mg/mL)",
      primary_focus: "Myofiber Repair, Systemic Muscle Regeneration & Flexibility",
      typical_cadence: "2.0 mg – 5.0 mg twice weekly"
    },
    summary: "While BPC-157 focuses primarily on local angiogenesis, capillary branching, and tenocyte anchoring via VEGF/FAK pathways, TB-500 upregulates actin filament dynamics to accelerate systemic stem cell and keratinocyte migration to damaged zones.",
    synergy_verdict: "High Synergistic Value (Wolverine Protocol): The combination of BPC-157 (local vascularization and collagen organization) with TB-500 (systemic cell migration and myofibrillar repair) presents complementary, non-overlapping pharmacological mechanisms.",
    status: "published" as const,
    published_at: "2026-08-20T00:00:00.000Z",
    vectors: [
      {
        feature: "Primary Mechanism",
        compoundA_val: "VEGFR-2 Up-regulation & FAK Phosphorylation",
        compoundB_val: "G-Actin Monomer Sequestration & Cellular Motility",
        verdict: "Complementary: BPC-157 constructs vascular conduits while TB-500 delivers motile repair cells."
      },
      {
        feature: "Primary Target Tissue",
        compoundA_val: "Tendon, Ligament, Gut Mucosa & Periosteum",
        compoundB_val: "Skeletal Muscle, Dermal Layers & Cardiac Endothelium",
        verdict: "Non-Overlapping: BPC-157 excels in avascular collagen structures; TB-500 excels in soft contractile myofibers."
      },
      {
        feature: "Biological Half-Life",
        compoundA_val: "Short (~4–6 Hours in aqueous solution)",
        compoundB_val: "Intermediate (~24–36 Hours systemic clearance)",
        verdict: "Dosing Schedule: BPC-157 warrants daily administration; TB-500 is typically administered 2x weekly."
      },
      {
        feature: "Reconstitution Parameter",
        compoundA_val: "10 mg in 2.0 mL BAC Water (5.0 mg/mL)",
        compoundB_val: "10 mg in 2.0 mL BAC Water (5.0 mg/mL)",
        verdict: "Standardized Concentration: Both yield identical 5 mg/mL volumetric density for simple insulin syringe measurement."
      }
    ],
    citations: [
      {
        number: 1,
        text: "Goldstein AL, et al. Thymosin beta4: actin-sequestering protein and its functional significance. Ann N Y Acad Sci. 2007;1112:1-13.",
        url: "https://pubmed.ncbi.nlm.nih.gov/17495248/"
      },
      {
        number: 2,
        text: "Sikiric P, et al. Stable gastric pentadecapeptide BPC 157 in clinical practice: a review. Curr Med Res Opin. 2020;36(8):1361-1369.",
        url: "https://pubmed.ncbi.nlm.nih.gov/32338520/"
      }
    ]
  },
  {
    slug: "tirzepatide-vs-semaglutide",
    title: "Tirzepatide vs. Semaglutide: Dual Incretin (GIP/GLP-1) vs. Selective GLP-1 Agonism",
    subtitle: "A stoichiometric and pharmacological evaluation of receptor affinities, metabolic clearance, and satiety signaling.",
    category: "Metabolic & GLP-1",
    compound_a: {
      id: "tirzepatide",
      name: "Tirzepatide",
      handle: "tirzepatide",
      tag: "Dual GIP/GLP-1 Co-Agonist",
      category: "Metabolic & GLP-1",
      sequence_or_class: "39 Amino Acid Peptide with C20 Fatty Diacid Moiety",
      molecular_mass: "4813.5 Da",
      primary_target: "Dual GIP Receptor (Full) + GLP-1 Receptor (Partial Biased)",
      half_life: "~120 Hours (5 Days)",
      reconstitution_diluent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      standard_dilution: "2.0 mL / 10 mg (5.0 mg/mL)",
      primary_focus: "Dual Adipose Lipid Metabolism & Central Anorexigenic Satiety",
      typical_cadence: "2.5 mg – 15 mg weekly (Stepwise Titration)"
    },
    compound_b: {
      id: "semaglutide",
      name: "Semaglutide",
      handle: "semaglutide",
      tag: "Mono GLP-1 Receptor Agonist",
      category: "Metabolic & GLP-1",
      sequence_or_class: "31 Amino Acid Synthetic Peptide with C18 Diacid Chain",
      molecular_mass: "4113.6 Da",
      primary_target: "Selective GLP-1 Receptor (High Affinity)",
      half_life: "~168 Hours (7 Days)",
      reconstitution_diluent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      standard_dilution: "2.0 mL / 5 mg (2.5 mg/mL)",
      primary_focus: "Gastric Motility Deceleration & Central Satiety Signaling",
      typical_cadence: "0.25 mg – 2.4 mg weekly (Titrated)"
    },
    summary: "Tirzepatide introduces concurrent GIP receptor agonism alongside GLP-1 stimulation. While Semaglutide functions primarily by delaying gastric emptying and suppressing central appetite, GIP co-agonism in Tirzepatide improves subcutaneous adipose lipid buffering and significantly decreases gastrointestinal nausea.",
    synergy_verdict: "Comparative Class Shift: Tirzepatide represents a second-generation multi-incretin agonist delivering approximately 20–25% greater mean weight reduction in randomized trials compared to mono GLP-1 therapy.",
    status: "published" as const,
    published_at: "2026-08-25T00:00:00.000Z",
    vectors: [
      {
        feature: "Receptor Target Profile",
        compoundA_val: "Dual: GIPR (Equimolar) + GLP-1R (5x lower affinity than native)",
        compoundB_val: "Mono: GLP-1R (High affinity selective)",
        verdict: "Mechanism Shift: Dual incretin stimulation mitigates GI side effects while enhancing metabolic substrate utilization."
      },
      {
        feature: "Mean Preclinical Weight Delta",
        compoundA_val: "Up to 20.9% – 25.3% mass reduction",
        compoundB_val: "Up to 14.9% – 16.0% mass reduction",
        verdict: "Efficacy Advantage: GIP receptor recruitment significantly amplifies insulin sensitivity and brown fat thermogenesis."
      },
      {
        feature: "Elimination Half-Life",
        compoundA_val: "~5 Days (120 Hours)",
        compoundB_val: "~7 Days (168 Hours)",
        verdict: "Pharmacokinetics: Both accommodate once-weekly administration schedules via albumin-binding fatty diacid side chains."
      }
    ],
    citations: [
      {
        number: 1,
        text: "Jastreboff AM, et al. Tirzepatide once weekly for the treatment of obesity (SURMOUNT-1). N Engl J Med. 2022;387(3):205-216.",
        url: "https://pubmed.ncbi.nlm.nih.gov/35658024/"
      },
      {
        number: 2,
        text: "Wilding JPH, et al. Once-weekly Semaglutide in adults with overweight or obesity (STEP 1). N Engl J Med. 2021;384(11):989-1002.",
        url: "https://pubmed.ncbi.nlm.nih.gov/33567185/"
      }
    ]
  }
]

export default async function seedResearchPublications({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  logger.info("Starting Research Publications (Articles & Comparisons) Seeder...")

  let articlesCreated = 0
  let articlesUpdated = 0
  let comparisonsCreated = 0
  let comparisonsUpdated = 0

  // 1. Seed Articles
  for (const art of CANONICAL_ARTICLES) {
    const existing = await service.listResearchArticles(
      { slug: art.slug },
      { take: 1 },
    )

    const payload = {
      ...art,
      published_at: new Date(art.published_at),
    }

    if (existing.length > 0) {
      await (service as any).updateResearchArticles({
        id: existing[0].id,
        ...payload,
      })
      articlesUpdated++
      logger.info(`Updated article: ${art.slug}`)
    } else {
      await (service as any).createResearchArticles(payload)
      articlesCreated++
      logger.info(`Created article: ${art.slug}`)
    }
  }

  // 2. Seed Comparisons
  for (const comp of CANONICAL_COMPARISONS) {
    const existing = await service.listPeptideComparisons(
      { slug: comp.slug },
      { take: 1 },
    )

    const payload = {
      ...comp,
      published_at: new Date(comp.published_at),
    }

    if (existing.length > 0) {
      await (service as any).updatePeptideComparisons({
        id: existing[0].id,
        ...payload,
      })
      comparisonsUpdated++
      logger.info(`Updated comparison: ${comp.slug}`)
    } else {
      await (service as any).createPeptideComparisons(payload)
      comparisonsCreated++
      logger.info(`Created comparison: ${comp.slug}`)
    }
  }

  logger.info("=======================================================")
  logger.info("RESEARCH PUBLICATIONS SEED COMPLETE")
  logger.info(`  • Articles Created:     ${articlesCreated}`)
  logger.info(`  • Articles Updated:     ${articlesUpdated}`)
  logger.info(`  • Comparisons Created:  ${comparisonsCreated}`)
  logger.info(`  • Comparisons Updated:  ${comparisonsUpdated}`)
  logger.info("=======================================================")
}
