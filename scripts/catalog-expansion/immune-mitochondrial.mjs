import { createProtocol, createCatalogProduct } from "./builder.mjs"

export const IMMUNE_MITO_PROTOCOLS = [
  createProtocol({
    id: "thymulin",
    compoundName: "Thymulin (Zinc-FTS)",
    handles: ["thymulin", "facteur-thymique-serique", "zinc-thymulin"],
    subtitle: "Zinc-Coupled Thymic Nonapeptide · T-Cell Differentiation Standard",
    longDescription: "**What it is:** Thymulin (originally termed Facteur Thymique Sérique) is an endogenous nonapeptide produced exclusively by thymic epithelial cells, requiring equimolar coupling with zinc (Zn2+) for biological activity.\n\n**How it works:** Zinc-Thymulin binds high-affinity receptors on pre-T lymphocytes, inducing the expression of T-cell surface markers (CD3, CD4, CD8), enhancing natural killer cell cytotoxicity, and restoring neuroendocrine-immune homeostatic balance.\n\n**Why researchers study it:** Studied extensively in immunosenescence, thymic involution reversal, autoimmune thyroiditis, and age-related immune deficiency models.",
    category: "Antimicrobial & Immune",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "250 mcg – 500 mcg Daily SubQ",
    standardDoseMcg: 250,
    cadence: "1x Daily (Q24H SubQ)",
    halfLife: "~2 to 4 Hours",
    typicalProtocolDuration: "4 to 8 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Thymic Priming", timeframe: "Weeks 1–2", doseDisplay: "125 mcg Daily", doseMcg: 125, cadence: "1x Daily", focus: "T-cell receptor baseline", notes: "2.5 units (0.025 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Differentiation", timeframe: "Weeks 3–6", doseDisplay: "250 mcg Daily", doseMcg: 250, cadence: "1x Daily", focus: "CD4/CD8 maturation", notes: "5.0 units (0.05 mL)" },
      { stage: "Stage 3: Peak Immune Cohort", timeframe: "Weeks 7+", doseDisplay: "500 mcg Daily", doseMcg: 500, cadence: "1x Daily", focus: "Full thymic reconstitution", notes: "10.0 units (0.10 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 6761001", notes: "Bach et al. Thymulin (FTS-Zn): a thymic hormone strictly dependent on zinc (Proc Natl Acad Sci)." }
    ],
    molecularDetails: { casNumber: "63958-90-7", formula: "C33H54N12O15·Zn", molecularWeightGPerMol: 924.2 }
  }),

  createProtocol({
    id: "thymopentin-tp5",
    compoundName: "Thymopentin (TP-5)",
    handles: ["thymopentin-tp5", "thymopentin", "tp-5"],
    subtitle: "Active Pentapeptide of Thymopoietin · Immunomodulatory Standard",
    longDescription: "**What it is:** Thymopentin (TP-5) is a synthetic pentapeptide corresponding to the amino acid sequence 32–36 (Arg-Lys-Asp-Val-Tyr) of the native 49-amino-acid thymic polypeptide thymopoietin.\n\n**How it works:** TP-5 retains the complete biological activity of thymopoietin, binding to intracellular receptors to elevate cyclic GMP (cGMP), stimulating the maturation of cytotoxic T-lymphocytes, and restoring impaired delayed-type hypersensitivity.\n\n**Why researchers study it:** Researched in chronic viral infections, rheumatoid arthritis models, primary immunodeficiencies, and vaccine adjuvant enhancement.",
    category: "Antimicrobial & Immune",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "1000 mcg 3x/Week SubQ",
    standardDoseMcg: 1000,
    cadence: "3x Weekly (SubQ Intermittent Protocol)",
    halfLife: "~30 Seconds in plasma (Intracellular signaling persists 24–48h)",
    typicalProtocolDuration: "6 to 12 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Immune Calibration", timeframe: "Weeks 1–2", doseDisplay: "500 mcg 3x/Week", doseMcg: 500, cadence: "3x Weekly", focus: "Intracellular cGMP signaling", notes: "10.0 units (0.10 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Immunomodulation", timeframe: "Weeks 3–8", doseDisplay: "1000 mcg 3x/Week", doseMcg: 1000, cadence: "3x Weekly", focus: "Cytotoxic T-cell expansion", notes: "20.0 units (0.20 mL)" },
      { stage: "Stage 3: Maintenance Cohort", timeframe: "Weeks 9+", doseDisplay: "1000 mcg 2x/Week", doseMcg: 1000, cadence: "2x Weekly", focus: "Immune surveillance stability", notes: "20.0 units (0.20 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 6245367", notes: "Goldstein et al. A synthetic pentapeptide with biological activity characteristic of the thymic hormone thymopoietin." }
    ],
    molecularDetails: { casNumber: "69558-55-0", formula: "C30H49N9O9", molecularWeightGPerMol: 679.8 }
  }),

  createProtocol({
    id: "shlp-2",
    compoundName: "SHLP-2 (Small Humanin-Like Peptide 2)",
    handles: ["shlp-2", "shlp2"],
    subtitle: "Mitochondrial-Derived Micropeptide · Insulin Sensitivity & Neuroprotection",
    longDescription: "**What it is:** SHLP-2 is a 26-amino-acid peptide encoded by an open reading frame within the 16S ribosomal RNA gene of the mitochondrial genome, functioning as a mitochondrial-derived hormone.\n\n**How it works:** SHLP-2 enhances mitochondrial oxygen consumption rate (OCR), reduces reactive oxygen species (ROS) production, stimulates peripheral insulin sensitivity via hypothalamic ERK phosphorylation, and protects pancreatic beta-cells from cytokine apoptosis.\n\n**Why researchers study it:** Researched in metabolic longevity, type 2 diabetes insulin sensitization, and preventing neurodegenerative mitochondrial collapse.",
    category: "Mitochondrial & Cellular Longevity",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "500 mcg – 1000 mcg Daily SubQ",
    standardDoseMcg: 500,
    cadence: "1x Daily (Q24H SubQ)",
    halfLife: "~30 to 45 Minutes (Intracellular mitochondrial effects sustained)",
    typicalProtocolDuration: "6 to 12 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Mitochondrial Priming", timeframe: "Weeks 1–2", doseDisplay: "250 mcg Daily", doseMcg: 250, cadence: "1x Daily", focus: "Mitochondrial membrane potential", notes: "5.0 units (0.05 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Metabolic Action", timeframe: "Weeks 3–8", doseDisplay: "500 mcg Daily", doseMcg: 500, cadence: "1x Daily", focus: "Peripheral insulin sensitivity", notes: "10.0 units (0.10 mL)" },
      { stage: "Stage 3: Advanced Longevity", timeframe: "Weeks 9+", doseDisplay: "1000 mcg Daily", doseMcg: 1000, cadence: "1x Daily", focus: "Systemic mitochondrial resilience", notes: "20.0 units (0.20 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 26972237", notes: "Cobb et al. Naturally occurring mitochondrial-derived peptides are age-dependent regulators of metabolism and apoptosis (Aging Cell)." }
    ],
    molecularDetails: { casNumber: "Mitochondrial Peptide Standard", sequenceOrFormula: "MGGFSHLEPTKSDIKSRLEKLEKLEL" }
  }),

  createProtocol({
    id: "urolithin-a",
    compoundName: "Urolithin A (Mitophagy Stimulator)",
    handles: ["urolithin-a", "urolithin"],
    subtitle: "Gut Microbiome Ellagitannin Metabolite · Selective Mitophagy Inducer",
    longDescription: "**What it is:** Urolithin A is a natural metabolite produced by gut microflora from dietary ellagitannins and ellagic acid found in pomegranates, walnuts, and berries.\n\n**How it works:** Urolithin A is a potent inducer of selective mitophagy: it activates the clearance of damaged, dysfunctional mitochondria via the autophagosome-lysosome pathway, stimulating subsequent mitochondrial biogenesis and restoring cellular bioenergetic efficiency in aging muscle fibers.\n\n**Why researchers study it:** Researched in human clinical trials for improving muscle strength, aerobic endurance, and reversing biomarkers of age-related cellular senescence.",
    category: "Mitochondrial & Cellular Longevity",
    defaultVialNetMg: 500,
    defaultDiluentMl: 5.0,
    solvent: "Analytical Suspension / Aqueous Lipid Carrier",
    standardDoseDisplay: "500 mg Daily Oral / Analytical Evaluation",
    standardDoseMcg: 500000,
    cadence: "1x Daily (Q24H Oral Monograph)",
    halfLife: "~17 to 20 Hours",
    typicalProtocolDuration: "12 to 24 Weeks",
    primaryDeliveryRoute: "oral",
    deliveryRoutes: ["oral", "subq"],
    titrationSteps: [
      { stage: "Stage 1: Basal Mitophagy Induction", timeframe: "Weeks 1–4", doseDisplay: "250 mg Daily", doseMcg: 250000, cadence: "1x Daily", focus: "Lysosomal autophagy activation", notes: "2.5 mL oral suspension at 100 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 5–16", doseDisplay: "500 mg Daily", doseMcg: 500000, cadence: "1x Daily", focus: "Damaged mitochondrial clearance", notes: "5.0 mL oral suspension" },
      { stage: "Stage 3: Advanced Endurance Cohort", timeframe: "Weeks 17+", doseDisplay: "1000 mg Daily", doseMcg: 1000000, cadence: "1x Daily", focus: "Mitochondrial biogenesis renewal", notes: "10.0 mL oral suspension" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 31235950", notes: "Andreux et al. The mitophagy activator urolithin A is safe and induces a molecular signature of improved mitochondrial health (Nature Metab)." }
    ],
    molecularDetails: { casNumber: "1143-70-0", formula: "C13H8O4", molecularWeightGPerMol: 228.2 }
  }),

  createProtocol({
    id: "bam15",
    compoundName: "BAM15 (Mitochondrial Proton Uncoupler)",
    handles: ["bam15", "bam-15"],
    subtitle: "Mitochondrial Inner Membrane Protonophore · Selective Thermogenesis",
    longDescription: "**What it is:** BAM15 (N5,N6-bis(2-fluorophenyl)-[1,2,5]oxadiazolo[3,4-b]pyrazine-5,6-diamine) is a synthetic mitochondrial protonophore uncoupler, structurally engineered to bypass the systemic toxicity of older uncouplers like DNP.\n\n**How it works:** BAM15 specifically depolarizes the inner mitochondrial membrane to uncouple oxidative phosphorylation from ATP synthesis without depolarizing the plasma membrane or causing cellular hyperthermia, dissipating energy as heat and burning lipid stores.\n\n**Why researchers study it:** Researched in preclinical obesity, insulin resistance, hepatic steatosis, and cardiac ischemia-reperfusion models.",
    category: "Mitochondrial & Cellular Longevity",
    defaultVialNetMg: 25,
    defaultDiluentMl: 2.5,
    standardDoseDisplay: "2.5 mg – 5.0 mg Daily SubQ / Oral",
    standardDoseMcg: 2500,
    cadence: "1x Daily (Q24H)",
    halfLife: "~4 to 6 Hours",
    typicalProtocolDuration: "6 to 8 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"],
    titrationSteps: [
      { stage: "Stage 1: Uncoupling Initiation", timeframe: "Weeks 1–2", doseDisplay: "1.0 mg Daily", doseMcg: 1000, cadence: "1x Daily", focus: "Thermal homeostatic adaptation", notes: "10.0 units (0.10 mL) at 10.0 mg/mL" },
      { stage: "Stage 2: Target Evaluation", timeframe: "Weeks 3–6", doseDisplay: "2.5 mg Daily", doseMcg: 2500, cadence: "1x Daily", focus: "Lipid beta-oxidation uncoupling", notes: "25.0 units (0.25 mL)" },
      { stage: "Stage 3: Advanced Cohort", timeframe: "Weeks 7–8", doseDisplay: "5.0 mg Daily", doseMcg: 5000, cadence: "1x Daily", focus: "Peak metabolic rate elevation", notes: "50.0 units (0.50 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 32490518", notes: "Alexopoulos et al. Mitochondrial uncoupler BAM15 reverses diet-induced obesity and insulin resistance in mice (Nature Commun)." }
    ],
    molecularDetails: { casNumber: "210302-17-3", formula: "C16H10F2N6O", molecularWeightGPerMol: 340.3 }
  })
]

export const IMMUNE_MITO_PRODUCTS = [
  createCatalogProduct({
    id: "thymulin",
    title: "Thymulin / Zinc-FTS (10mg Research Vial)",
    category: "Antimicrobial & Immune",
    netContentDisplay: "10MG",
    priceVialOnly: 2800,
    priceVialBac: 3000,
    priceSubqKit: 3120,
    descriptionSummary: "Endogenous zinc-coupled thymic nonapeptide evaluated for T-cell differentiation and thymic renewal."
  }),
  createCatalogProduct({
    id: "thymopentin-tp5",
    title: "Thymopentin / TP-5 (10mg Research Vial)",
    category: "Antimicrobial & Immune",
    netContentDisplay: "10MG",
    priceVialOnly: 2600,
    priceVialBac: 2800,
    priceSubqKit: 2920,
    descriptionSummary: "Active pentapeptide (32-36) of thymopoietin for cellular immune modulation research."
  }),
  createCatalogProduct({
    id: "shlp-2",
    title: "SHLP-2 (10mg Research Vial)",
    category: "Mitochondrial & Cellular Longevity",
    netContentDisplay: "10MG",
    priceVialOnly: 3400,
    priceVialBac: 3600,
    priceSubqKit: 3720,
    descriptionSummary: "Mitochondrial-derived 26AA micropeptide evaluated for insulin sensitivity and mitoprotection."
  }),
  createCatalogProduct({
    id: "urolithin-a",
    title: "Urolithin A (500mg Analytical Standard)",
    category: "Mitochondrial & Cellular Longevity",
    netContentDisplay: "500MG",
    priceVialOnly: 2400,
    priceVialBac: 2600,
    priceSubqKit: 2720,
    descriptionSummary: "Selective mitophagy-inducing gut metabolite evaluated for muscle strength and mitochondrial renewal."
  }),
  createCatalogProduct({
    id: "bam15",
    title: "BAM15 (25mg Research Vial)",
    category: "Mitochondrial & Cellular Longevity",
    netContentDisplay: "25MG",
    priceVialOnly: 3100,
    priceVialBac: 3300,
    priceSubqKit: 3420,
    descriptionSummary: "Mitochondrial protonophore uncoupler evaluated for selective thermogenesis and lipid oxidation."
  })
]
