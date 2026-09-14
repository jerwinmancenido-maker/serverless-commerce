import { createProtocol, createCatalogProduct } from "./builder.mjs"

const khavinsonDefinitions = [
  {
    id: "vesugen",
    title: "Vesugen",
    seq: "H-Lys-Glu-Asp-OH (KED)",
    tissue: "Vascular Endothelium & Arterial Elasticity",
    desc: "Vesugen is a short synthetic Khavinson tripeptide (Lys-Glu-Asp) specifically targeted at vascular endothelial tissue. It regulates vascular smooth muscle cell metabolism, restores arterial wall elasticity, and normalizes microcirculation in aging endothelial cell models.",
    cas: "115792-44-6",
    mw: 388.4
  },
  {
    id: "chonluten",
    title: "Chonluten",
    seq: "H-Glu-Asp-Gly-OH (EDG)",
    tissue: "Bronchial & Lung Epithelial Mucosa",
    desc: "Chonluten is a synthetic Khavinson tripeptide (Glu-Asp-Gly) designed to regulate bronchial mucosal epithelial cells and ciliated pulmonary architecture. In respiratory models, it reduces mucosal hyper-reactivity, optimizes surfactant dynamics, and enhances gas exchange efficiency.",
    cas: "182349-12-8",
    mw: 305.3
  },
  {
    id: "cardiogen",
    title: "Cardiogen",
    seq: "H-Ala-Glu-Asp-Arg-OH (AEDR)",
    tissue: "Myocardial Fibroblasts & Cardiac Tissue",
    desc: "Cardiogen is a synthetic Khavinson tetrapeptide (Ala-Glu-Asp-Arg) engineered to modulate myocardial cellular kinetics. It inhibits excessive myocardial fibroblast proliferation and collagen deposition post-ischemia, promoting physiological cardiomyocyte integrity.",
    cas: "900574-88-3",
    mw: 488.5
  },
  {
    id: "cortagen",
    title: "Cortagen",
    seq: "H-Ala-Glu-Asp-Pro-OH (AEDP)",
    tissue: "Brain Cortex & Neuroprotective Chromatin",
    desc: "Cortagen is a synthetic Khavinson tetrapeptide (Ala-Glu-Asp-Pro) with potent neuroprotective and chromatin-remodeling actions on cerebral cortical neurons. It crosses the blood-brain barrier in assays to stimulate neurotrophic factor synthesis and prevent excitotoxic neuronal apoptosis.",
    cas: "123284-88-2",
    mw: 428.4
  },
  {
    id: "livagen",
    title: "Livagen",
    seq: "H-Lys-Glu-Asp-Ala-OH (KEDA)",
    tissue: "Hepatic Parenchyma & Chromatin Decondensation",
    desc: "Livagen is a synthetic Khavinson tetrapeptide (Lys-Glu-Asp-Ala) that acts directly on chromatin structure in aged hepatocytes. It promotes histone acetylation and heterochromatin decondensation, reactivating silenced ribosomal and hepatic synthetic genes in senescent liver models.",
    cas: "195158-82-8",
    mw: 460.5
  },
  {
    id: "ovagen",
    title: "Ovagen",
    seq: "H-Glu-Asp-Pro-OH (EDP)",
    tissue: "Hepatobiliary & Gastrointestinal Mucosa",
    desc: "Ovagen is a synthetic Khavinson tripeptide (Glu-Asp-Pro) specifically active on hepatobiliary and digestive epithelial cell layers. It normalizes biliary excretion kinetics, stabilizes hepatocyte cellular membranes, and protects mucosal tight junctions from inflammatory oxidative damage.",
    cas: "195158-85-1",
    mw: 345.3
  },
  {
    id: "prostamax",
    title: "Prostamax",
    seq: "H-Lys-Glu-Asp-Pro-OH (KEDP)",
    tissue: "Prostatic Epithelium & Urogenital Health",
    desc: "Prostamax is a synthetic Khavinson tetrapeptide (Lys-Glu-Asp-Pro) formulated to maintain physiological cellular homeostasis in prostatic epithelial and stromal tissues. It regulates microvascular circulation in the prostate gland, attenuating glandular hypertrophy and inflammatory edema.",
    cas: "195158-88-4",
    mw: 486.5
  },
  {
    id: "testagen",
    title: "Testagen",
    seq: "H-Lys-Glu-Asp-Gly-OH (KEDG)",
    tissue: "Leydig Cells & Testicular Tissue Regimen",
    desc: "Testagen is a synthetic Khavinson tetrapeptide (Lys-Glu-Asp-Gly) targeting testicular Leydig cells and germinal epithelium. In cellular assays, it optimizes steroidogenic enzyme transcription, enhances testicular antioxidant defense mechanisms, and supports spermatogenic cell survival.",
    cas: "195158-91-9",
    mw: 446.5
  },
  {
    id: "vilon",
    title: "Vilon",
    seq: "H-Lys-Glu-OH (KE)",
    tissue: "Thymic Dipeptide & Cellular Immunosenescence",
    desc: "Vilon is a short synthetic Khavinson dipeptide (Lys-Glu) representing the minimal bioactive sequence of thymic humoral factor. It stimulates the proliferation and differentiation of immature thymocytes into mature helper T-cells, reversing immune aging markers in senescent immune models.",
    cas: "2338-76-3",
    mw: 275.3
  },
  {
    id: "bronchogen",
    title: "Bronchogen",
    seq: "H-Ala-Glu-Asp-Leu-OH (AEDL)",
    tissue: "Respiratory Ciliated Epithelium & Alveoli",
    desc: "Bronchogen is a synthetic Khavinson tetrapeptide (Ala-Glu-Asp-Leu) engineered to restore functional ciliary beating frequency and cellular morphology in bronchial and alveolar epithelial cells. It mitigates inflammatory mucus hypersecretion in chronic pulmonary injury models.",
    cas: "900574-89-4",
    mw: 444.5
  },
  {
    id: "pancragen",
    title: "Pancragen",
    seq: "H-Lys-Glu-Asp-Trp-OH (KEDW)",
    tissue: "Pancreatic Islet Beta-Cells & Insulin Secretion",
    desc: "Pancragen is a synthetic Khavinson tetrapeptide (Lys-Glu-Asp-Trp) designed to support pancreatic endocrine and exocrine function. In metabolic models, it stimulates islet beta-cell regeneration, prevents glucolipotoxic apoptosis, and normalizes digestive enzyme synthesis.",
    cas: "900574-90-7",
    mw: 574.6
  },
  {
    id: "cortexin",
    title: "Cortexin",
    seq: "Purified Polypeptide Complex (10mg/vial)",
    tissue: "Neurotrophic Polypeptides · Central Nervous System",
    desc: "Cortexin is a complex fraction of low-molecular-weight neuropeptides and amino acids extracted from cerebral cortex tissue. It provides multifaceted neuroprotective, neurometabolic, and neurotrophic actions, optimizing neurotransmitter balance and enhancing cortical bioelectrical activity.",
    cas: "167812-70-4",
    mw: 10000
  }
]

export const KHAVINSON_PROTOCOLS = khavinsonDefinitions.map(def => {
  const isCortexin = def.id === "cortexin"
  const vialMg = isCortexin ? 10 : 20
  const diluentMl = 2.0
  const conc = Number((vialMg / diluentMl).toFixed(4))
  const stdDoseMcg = isCortexin ? 10000 : 1000

  return createProtocol({
    id: def.id,
    compoundName: `${def.title} (${def.seq})`,
    handles: [def.id, `${def.id}-peptide`],
    subtitle: `Synthetic Khavinson Bioregulator · Target: ${def.tissue}`,
    longDescription: `**What it is:** ${def.desc}\n\n**How it works:** Khavinson bioregulators act via epigenetic mechanisms by penetrating into cell nuclei, binding specific DNA promoter regions, and inducing chromatin remodeling that restores youthful gene expression profiles in targeted tissues.\n\n**Why researchers study it:** Studied in gerontology and cellular regeneration for reversing tissue-specific biological age markers and extending cellular functional lifespan.`,
    category: "Mitochondrial & Cellular Longevity",
    defaultVialNetMg: vialMg,
    defaultDiluentMl: diluentMl,
    standardDoseDisplay: `${isCortexin ? "10 mg" : "1000 mcg"} Daily Analytical Standard`,
    standardDoseMcg: stdDoseMcg,
    cadence: "1x Daily (10 to 20-day analytical cycle)",
    halfLife: "~2 to 4 Hours (Cellular epigenetic modulation lasts months)",
    typicalProtocolDuration: "10 to 20 Days per research cohort",
    washoutPeriod: "3 to 6 Months between cycles",
    titrationSteps: [
      { stage: "Stage 1: Cycle Initiation", timeframe: "Days 1–3", doseDisplay: `${Math.round(stdDoseMcg * 0.5)} mcg Daily`, doseMcg: Math.round(stdDoseMcg * 0.5), cadence: "1x Daily", focus: "Epigenetic baseline", notes: `${(Math.round(stdDoseMcg * 0.5) / (conc * 10)).toFixed(1)} units at ${conc} mg/mL` },
      { stage: "Stage 2: Active Epigenetic Cohort", timeframe: "Days 4–15", doseDisplay: `${stdDoseMcg} mcg Daily`, doseMcg: stdDoseMcg, cadence: "1x Daily", focus: "Target tissue cellular renewal", notes: `${(stdDoseMcg / (conc * 10)).toFixed(1)} units at ${conc} mg/mL` },
      { stage: "Stage 3: Cycle Conclusion & Washout", timeframe: "Days 16–20", doseDisplay: `${stdDoseMcg} mcg Daily`, doseMcg: stdDoseMcg, cadence: "1x Daily", focus: "Epigenetic persistence", notes: `${(stdDoseMcg / (conc * 10)).toFixed(1)} units at ${conc} mg/mL` }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 12577695", notes: "Khavinson et al. Peptides and Ageing (Neuroendocrinology Letters 2002)." },
      { sourceReference: "PubMed PMID: 24707639", notes: "Khavinson et al. Peptide regulation of gene expression and protein synthesis in bronchial epithelial cells." }
    ],
    investigatedBenefits: [
      `Tissue-specific cellular renewal in ${def.tissue}`,
      "Epigenetic heterochromatin decondensation and gene reactivation",
      "Restoration of ribosomal protein synthesis in senescent cells"
    ],
    molecularDetails: {
      casNumber: def.cas,
      sequenceOrFormula: def.seq
    }
  })
})

export const KHAVINSON_PRODUCTS = khavinsonDefinitions.map(def => {
  const isCortexin = def.id === "cortexin"
  return createCatalogProduct({
    id: def.id,
    title: `${def.title} (${isCortexin ? "10mg" : "20mg"} Khavinson Bioregulator)`,
    category: "Mitochondrial & Cellular Longevity",
    netContentDisplay: isCortexin ? "10MG" : "20MG",
    priceVialOnly: 2750,
    priceVialBac: 2950,
    priceSubqKit: 3070,
    descriptionSummary: `Synthetic Khavinson peptide bioregulator standard (${def.seq}) targeting ${def.tissue}.`
  })
})
