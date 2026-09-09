/**
 * @file    apps/storefront/src/lib/data/research-articles.ts
 * @module  ResearchArticlesData (Storefront Research Articles)
 * @purpose Data access layer for scientific research articles with Medusa backend API and static fallback.
 * @contracts
 *   API: GET /store/research-articles · GET /store/research-articles/:slug
 */

import { sdk } from "@lib/config"

export type ResearchCitation = {
  number: number
  authors: string
  title: string
  journal: string
  year: number
  pmid?: string
  doi?: string
  url: string
}

export type ArticleSection = {
  title: string
  paragraphs: string[]
}

export type ReferencedCompound = {
  name: string
  handle: string
  purity: string
  specification: string
  default_dose_preset?: number
  default_mass_mg?: number
  protocol_handle?: string
}

export type ResearchArticle = {
  slug: string
  title: string
  subtitle: string
  abstract: string
  category: "Tissue Repair & Healing" | "Cellular Longevity" | "Metabolic Signaling" | "Laboratory Methodology"
  compound_tag: string
  reading_time: string
  reviewed_by: string
  published_at: string
  updated_at: string
  sections: ArticleSection[]
  citations: ResearchCitation[]
  referenced_compound?: ReferencedCompound
}

export const RESEARCH_ARTICLES: ResearchArticle[] = [
  {
    slug: "bpc-157-angiogenesis-tissue-remodeling",
    title: "BPC-157: Cellular Mechanisms in Pentadecapeptide Angiogenesis & Soft Tissue Remodeling",
    subtitle: "Analysis of VEGF upregulation, FAK-paxillin focal adhesion phosphorylation, and tenocyte migration kinetics in vitro.",
    abstract: "Body Protection Compound-157 (BPC-157) is a synthetic 15-amino acid peptide derived from human gastric juice protein sequences. In laboratory and cellular models, BPC-157 demonstrates notable cytoprotective and regenerative properties driven primarily by the promotion of early growth response-1 (egr-1) gene expression, acceleration of vascular endothelial growth factor (VEGF) synthesis, and modulation of the focal adhesion kinase (FAK)-paxillin signaling cascade. This monograph reviews preclinical findings on collagen organization, granulation tissue formation, and vascular permeability in tendon, ligament, and mucosal models.",
    category: "Tissue Repair & Healing",
    compound_tag: "BPC-157",
    reading_time: "6 min read",
    reviewed_by: "Scientific Review Board · Analytical Chemistry & In-Vitro Pharmacology",
    published_at: "2026-08-15",
    updated_at: "2026-09-02",
    referenced_compound: {
      name: "BPC-157 (5 mg)",
      handle: "bpc-157-vial",
      purity: "≥99.2% (HPLC Verified)",
      specification: "Lyophilized Solid Powder · Sequence Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
      default_dose_preset: 250,
      default_mass_mg: 5,
      protocol_handle: "bpc-157-protocol",
    },
    sections: [
      {
        title: "1. Molecular Structure & Sequence Characteristics",
        paragraphs: [
          "BPC-157 (molecular formula C62H98N16O22, molecular weight 1419.53 Da) comprises 15 amino acid residues: Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val. Unlike native gastric juice peptides that readily degrade under proteolytic cleavage, BPC-157 exhibits conformation-stabilized peptide backbone resistance in both neutral and acidic aqueous buffers.",
          "High-performance liquid chromatography (HPLC) combined with electrospray ionization mass spectrometry (ESI-MS) confirms that standard lyophilized formulations remain stable at room temperature in solid state for up to 60 days, retaining monoisotopic exact mass fidelity without spontaneous racemization.",
        ],
      },
      {
        title: "2. Angiogenic Signaling: VEGF Induction and Egr-1 Activation",
        paragraphs: [
          "Laboratory assays in endothelial cell lines demonstrate that BPC-157 incubation stimulates capillary vessel outgrowth. This effect is mediated by transcriptional upregulation of early growth response protein-1 (egr-1) and downstream vascular endothelial growth factor receptor 2 (VEGFR-2) internal phosphorylation.",
          "Rather than triggering uncontrolled non-specific neovascularization, cell culture assays demonstrate that BPC-157 accelerates endogenous vascular architecture repair specifically under ischemic or mechanically damaged substrate conditions, restoring nutrient perfusion to avascular matrix zones.",
        ],
      },
      {
        title: "3. Tenocyte Outgrowth and Extracellular Matrix (ECM) Synthesis",
        paragraphs: [
          "In tenocyte explant cultures, BPC-157 promotes cellular proliferation and directional migration across collagen gel matrices. Western blot analyses show elevated expression of focal adhesion kinase (FAK) and paxillin phosphorylation, indicating enhanced cell-substrate anchorage and mechanical tension generation.",
          "Furthermore, mRNA quantitation in fibroblastic assays reveals accelerated transcription of Type I collagen relative to non-functional Type III scar tissue, supporting structural remodeling towards physiological fiber alignment rather than irregular fibrotic plaques.",
        ],
      },
      {
        title: "4. Laboratory Reconstitution & Handling Observations",
        paragraphs: [
          "In analytical laboratory environments, BPC-157 dissolves readily in 0.9% bacteriostatic sodium chloride or sterile water for injection (SWFI) without requiring organic co-solvents. Once reconstituted, solution integrity should be preserved at 2°C–8°C away from direct photolytic exposure to prevent oxidation of proline-rich clusters.",
        ],
      },
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
        url: "https://pubmed.ncbi.nlm.nih.gov/21248398/",
      },
      {
        number: 2,
        authors: "Chang CH, Tsai WC, Hsu YH, Pang JH.",
        title: "Pentadecapeptide BPC 157 enhances the growth hormone receptor expression in tendon fibroblasts.",
        journal: "Molecules",
        year: 2014,
        pmid: "25415472",
        doi: "10.3390/molecules191119066",
        url: "https://pubmed.ncbi.nlm.nih.gov/25415472/",
      },
      {
        number: 3,
        authors: "Hsieh PC, Liu WC, Chang CH, Tsai WC, et al.",
        title: "The promoting effect of pentadecapeptide BPC 157 on tendon healing involves tendon outgrowth, cell survival, and cell migration.",
        journal: "Journal of Applied Physiology",
        year: 2011,
        pmid: "21030672",
        doi: "10.1152/japplphysiol.00945.2010",
        url: "https://pubmed.ncbi.nlm.nih.gov/21030672/",
      },
    ],
  },
  {
    slug: "ghk-cu-collagen-extracellular-matrix",
    title: "GHK-Cu: Copper Tripeptide Gene Modulation, Collagen Matrix Synthesis & Cellular Viability",
    subtitle: "Investigating glycyl-L-histidyl-L-lysine copper complex induction of metalloproteinases, decorin, and fibroblast pro-collagen gene expression.",
    abstract: "Glycyl-L-histidyl-L-lysine (GHK) is a naturally occurring plasma tripeptide with extraordinarily high affinity for copper(II) ions (log K = 16.4). First isolated in human albumin by Dr. Loren Pickart in 1973, GHK-Cu functions as a master transcriptional modulator capable of up- and down-regulating over 4,000 human genes. Preclinical and cellular models demonstrate GHK-Cu's unique capacity to stimulate decorin synthesis, balance matrix metalloproteinases (MMPs) with tissue inhibitors (TIMPs), and suppress inflammatory cytokines while stimulating Type I and Type III pro-collagen synthesis in dermal and soft tissue fibroblasts.",
    category: "Cellular Longevity",
    compound_tag: "GHK-Cu",
    reading_time: "5 min read",
    reviewed_by: "Scientific Review Board · Molecular Biology & Dermal Biochemistry",
    published_at: "2026-08-22",
    updated_at: "2026-09-03",
    referenced_compound: {
      name: "GHK-Cu (50 mg)",
      handle: "ghk-cu",
      purity: "≥99.1% (HPLC & Cu Elemental Chelation)",
      specification: "Lyophilized Deep Blue Crystalline Powder · Cu2+ Chelation Ratio 1:1",
      default_dose_preset: 2000,
      default_mass_mg: 50,
      protocol_handle: "ghk-cu-protocol",
    },
    sections: [
      {
        title: "1. Biochemical Chelation Chemistry & Stability",
        paragraphs: [
          "GHK-Cu (molecular formula C14H22CuN6O4, molecular weight 401.91 Da) exists as a distinctive royal blue coordination complex in which the Cu(II) ion is tetracoordinated by the amino terminal nitrogen, two amide nitrogens, and the imidazole ring of histidine.",
          "This square planar geometry imparts exceptional thermodynamic stability in physiological solution, shielding the bound copper from generating toxic Fenton-type reactive oxygen species (ROS) while facilitating bioavailability and targeted receptor uptake.",
        ],
      },
      {
        title: "2. Gene Modulation: Broad Transcriptional Reprogramming",
        paragraphs: [
          "Broad-scale genomic microarray studies reveal that GHK-Cu shifts cellular expression profiles towards a youthful physiological state. Specifically, GHK-Cu upregulates DNA repair genes, ubiquitin-proteasome systems, and antioxidant enzymes including superoxide dismutase (SOD1).",
          "Concurrently, the tripeptide downregulates pro-inflammatory markers including transforming growth factor-beta (TGF-β) and tumor necrosis factor-alpha (TNF-α), preventing excessive scar fibrosis while promoting functional tissue remodeling.",
        ],
      },
      {
        title: "3. Extracellular Matrix Synthesis: Collagen, Elastin & Decorin",
        paragraphs: [
          "In human fibroblast cultures, GHK-Cu increases the synthesis of collagen by approximately 70% compared to untreated controls, outperforming all-trans retinoic acid and ascorbate in in-vitro assays without causing cytotoxic irritation.",
          "Crucially, GHK-Cu stimulates the expression of decorin—a small leucine-rich proteoglycan that binds to Type I collagen fibrils and ensures uniform, parallel fiber diameter, mitigating irregular bundle formation and keloid-like aggregation.",
        ],
      },
      {
        title: "4. Preparation & Storage Protocols",
        paragraphs: [
          "Reconstitution of GHK-Cu requires gentle swirling rather than aggressive vortexing to preserve complex integrity. Once reconstituted in bacteriostatic water, the solution displays a characteristic clear blue hue; any cloudiness or precipitant indicates improper solvent osmolarity or microbial contamination.",
        ],
      },
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
        url: "https://pubmed.ncbi.nlm.nih.gov/29986520/",
      },
      {
        number: 2,
        authors: "Pickart L, Vasquez-Soltero JM, Margolina A.",
        title: "GHK peptide as a natural modulator of multiple cellular pathways in skin regeneration.",
        journal: "BioMed Research International",
        year: 2015,
        pmid: "26236730",
        doi: "10.1155/2015/648108",
        url: "https://pubmed.ncbi.nlm.nih.gov/26236730/",
      },
      {
        number: 3,
        authors: "Choi HR, Kang YA, Ryoo SJ, Shin JW, et al.",
        title: "Stem cell recovering effect of copper-free GHK in skin fibroblasts.",
        journal: "Journal of Peptide Science",
        year: 2012,
        pmid: "23060205",
        doi: "10.1002/psc.2455",
        url: "https://pubmed.ncbi.nlm.nih.gov/23060205/",
      },
    ],
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
    published_at: "2026-08-30",
    updated_at: "2026-09-04",
    sections: [
      {
        title: "1. The Physics of Lyophilized Cake Dissolution",
        paragraphs: [
          "Lyophilization (freeze-drying) removes water from frozen peptide solutions through sublimation under deep vacuum, leaving behind a highly porous amorphous or crystalline matrix known as the cake. This microscopic porosity allows rapid capillary uptake of solvent.",
          "When adding diluent, solvent should always be directed smoothly along the inside glass wall of the vial rather than directly squirted onto the cake. Direct high-velocity impact can cause mechanical shearing of sensitive tertiary or secondary structures, particularly in longer peptide chains exceeding 25 amino acid residues.",
        ],
      },
      {
        title: "2. Diluent Selection: Bacteriostatic Water vs. Sterile Water for Injection",
        paragraphs: [
          "Bacteriostatic Water for Injection (BWFI) contains 0.9% benzyl alcohol (9 mg/mL) as an antimicrobial preservative. This bacteriostatic agent inhibits bacterial proliferation across multi-entry sampling protocols spanning up to 28 days when maintained under refrigeration.",
          "Sterile Water for Injection (SWFI) lacks preservatives and is strictly intended for single-session analytical procedures. If SWFI is used, the reconstituted solution must be consumed or discarded within 24 hours to prevent microbial contamination and subsequent endotoxin formation.",
        ],
      },
      {
        title: "3. Reconstitution Concentration Stoichiometry & Syringe Scaling",
        paragraphs: [
          "Accurate dosing math depends on the ratio of net peptide mass (mg or mcg) to diluent volume (mL). Using a standard 10 mg peptide vial: adding 1 mL yields 10 mg/mL (10,000 mcg/mL), while adding 2 mL yields 5 mg/mL (5,000 mcg/mL).",
          "On a standard U-100 insulin syringe (where 100 units = 1.0 mL, or 1 unit = 0.01 mL): at a concentration of 5 mg/mL (5 mcg per unit), a target research dose of 250 mcg corresponds precisely to 50 units (0.05 mL). Utilizing lower concentrations allows finer measurement precision and minimizes meniscus parallax reading errors.",
        ],
      },
      {
        title: "4. Cold-Chain Temperature Regimes and Stability Windows",
        paragraphs: [
          "Lyophilized cakes stored at -20°C maintain chemical stability for 24 to 36 months. At 2°C–8°C (refrigerated), stability is typically 12 to 18 months, and at controlled room temperature (20°C–25°C), solid peptides remain stable for up to 60 days without significant loss of purity.",
          "Once reconstituted, all peptide solutions must be stored at 2°C–8°C in airtight, light-protected vials and utilized within the validated 28-day stability window. Repeated freeze-thaw cycles of reconstituted liquid must be avoided, as ice crystal formation shears peptide bonds.",
        ],
      },
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
        url: "https://pubmed.ncbi.nlm.nih.gov/20387002/",
      },
      {
        number: 2,
        authors: "Wang W.",
        title: "Lyophilization and development of solid protein pharmaceuticals.",
        journal: "International Journal of Pharmaceutics",
        year: 2000,
        pmid: "10936450",
        doi: "10.1016/s0378-5173(00)00423-3",
        url: "https://pubmed.ncbi.nlm.nih.gov/10936450/",
      },
      {
        number: 3,
        authors: "Powell MF, Grey H, Gaeta FC, Sette A, Colon SM.",
        title: "Peptide stability in aqueous solutions: effect of pH, buffer, and temperature.",
        journal: "Pharmaceutical Research",
        year: 1992,
        pmid: "1409386",
        doi: "10.1023/a:1015843403211",
        url: "https://pubmed.ncbi.nlm.nih.gov/1409386/",
      },
    ],
  },
]

export const listResearchArticles = async (): Promise<ResearchArticle[]> => {
  try {
    const response = await sdk.client.fetch<{ articles: ResearchArticle[]; count: number }>(
      "/store/research-articles?limit=100",
      { method: "GET", cache: "no-store" }
    )
    if (response?.articles && response.articles.length > 0) {
      return response.articles
    }
  } catch (err) {
    console.warn("[listResearchArticles] Medusa API call failed or offline, falling back to static cache:", err)
  }
  return RESEARCH_ARTICLES
}

export const retrieveResearchArticle = async (
  slug: string
): Promise<ResearchArticle | null> => {
  try {
    const response = await sdk.client.fetch<{ article: ResearchArticle }>(
      `/store/research-articles/${encodeURIComponent(slug)}`,
      { method: "GET", cache: "no-store" }
    )
    if (response?.article) {
      return response.article
    }
  } catch (err) {
    console.warn(`[retrieveResearchArticle] Medusa API call for '${slug}' failed, falling back to static cache:`, err)
  }
  const article = RESEARCH_ARTICLES.find((a) => a.slug === slug)
  return article || null
}

export const listArticlesForCompound = async (
  compoundTagOrHandle: string
): Promise<ResearchArticle[]> => {
  const articles = await listResearchArticles()
  const query = compoundTagOrHandle.toLowerCase()
  return articles.filter(
    (a) =>
      a.compound_tag.toLowerCase().includes(query) ||
      a.referenced_compound?.handle.toLowerCase().includes(query) ||
      a.referenced_compound?.name.toLowerCase().includes(query)
  )
}
