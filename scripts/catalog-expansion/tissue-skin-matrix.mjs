import { createProtocol, createCatalogProduct } from "./builder.mjs"

export const TISSUE_SKIN_PROTOCOLS = [
  createProtocol({
    id: "bpc-157-arginate",
    compoundName: "BPC-157 Arginate Salt (Acid-Stable)",
    handles: ["bpc-157-arginate", "bpc157-arginate", "bpc-arginate"],
    subtitle: "Acid-Resistant L-Arginate Salt · High Oral Bioavailability Standard",
    longDescription: "**What it is:** BPC-157 Arginate is a stabilized salt form pairing the 15-amino-acid Body Protection Compound sequence with L-arginine, engineered to resist proteolytic gastric degradation.\n\n**How it works:** Unlike standard BPC-157 acetate which degrades rapidly in human gastric juice (pH ~1–2), BPC-157 Arginate remains >90% intact after 5 hours in simulated gastric acid, allowing direct oral delivery while retaining full angiogenic and anti-inflammatory signaling.\n\n**Why researchers study it:** Researched in oral models of inflammatory bowel disease (ulcerative colitis, Crohn's), mucosal ulcer healing, and systemic soft-tissue tendon repair.",
    category: "Tissue Repair & Healing",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "250 mcg – 500 mcg Daily Oral / SubQ",
    standardDoseMcg: 250,
    cadence: "1x–2x Daily (Oral Solution or SubQ)",
    halfLife: "~4 to 6 Hours",
    typicalProtocolDuration: "4 to 8 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"],
    titrationSteps: [
      { stage: "Stage 1: Mucosal Calibration", timeframe: "Week 1", doseDisplay: "250 mcg Daily", doseMcg: 250, cadence: "1x Daily", focus: "Gastric lining tolerance", notes: "5.0 units (0.05 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 2–6", doseDisplay: "500 mcg Daily", doseMcg: 500, cadence: "1x Daily (or 250mcg BID)", focus: "Systemic tendon & gut repair", notes: "10.0 units (0.10 mL)" },
      { stage: "Stage 3: Advanced Healing", timeframe: "Weeks 7+", doseDisplay: "1000 mcg Daily", doseMcg: 1000, cadence: "2x Daily (500mcg split)", focus: "Max tissue angiogenesis", notes: "20.0 units (0.20 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 32306787", notes: "Sikiric et al. Stable gastric pentadecapeptide BPC 157-NO-system relation (Curr Pharm Des)." }
    ],
    molecularDetails: { casNumber: "137525-51-0 (Free Acid)", sequenceOrFormula: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val · L-Arg Salt" }
  }),

  createProtocol({
    id: "tb-4-full-length",
    compoundName: "Thymosin Beta-4 (Full-Length 43AA)",
    handles: ["tb-4-full-length", "tb4-full-length", "thymosin-beta-4-43aa"],
    subtitle: "Parent 43-Amino-Acid Actin-Sequestering Polypeptide Standard",
    longDescription: "**What it is:** Thymosin Beta-4 (TB-4) is the full-length 43-amino-acid parent polypeptide naturally occurring in high concentrations in platelets and wound fluid, of which TB-500 represents an abbreviated fragment (LKKTET).\n\n**How it works:** TB-4 sequesters monomeric G-actin, regulating cellular cytoskeletal remodeling, accelerating keratinocyte and endothelial cell migration, stimulating angiogenesis via VEGF, and suppressing pro-fibrotic myofibroblast differentiation.\n\n**Why researchers study it:** Researched in corneal re-epithelialization, myocardial infarction tissue preservation, and severe dermal wound regeneration.",
    category: "Tissue Repair & Healing",
    defaultVialNetMg: 5,
    defaultDiluentMl: 2.5,
    standardDoseDisplay: "1000 mcg 2x/Week SubQ",
    standardDoseMcg: 1000,
    cadence: "2x Weekly (Q3.5D SubQ)",
    halfLife: "~2 to 4 Hours (Cellular actin effects sustained for days)",
    typicalProtocolDuration: "4 to 6 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Acute Migration Induction", timeframe: "Weeks 1–2", doseDisplay: "1000 mcg 2x/Week", doseMcg: 1000, cadence: "2x Weekly", focus: "Actin cytoskeletal recruitment", notes: "50.0 units (0.50 mL) at 2.0 mg/mL" },
      { stage: "Stage 2: Tissue Remodeling", timeframe: "Weeks 3–4", doseDisplay: "1000 mcg 2x/Week", doseMcg: 1000, cadence: "2x Weekly", focus: "Collagen organization & angiogenesis", notes: "50.0 units (0.50 mL)" },
      { stage: "Stage 3: Maintenance & Resolution", timeframe: "Weeks 5–6", doseDisplay: "500 mcg 2x/Week", doseMcg: 500, cadence: "2x Weekly", focus: "Scarless repair stabilization", notes: "25.0 units (0.25 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 20536453", notes: "Philp & Kleinman. Thymosin beta4 and wound healing (Vitam Horm 2010)." }
    ],
    molecularDetails: { casNumber: "77591-33-4", formula: "C212H350N56O78S", molecularWeightGPerMol: 4963.5 }
  }),

  createProtocol({
    id: "ahk-cu",
    compoundName: "AHK-Cu (Copper Tripeptide-3)",
    handles: ["ahk-cu", "ahk-copper", "copper-tripeptide-3"],
    subtitle: "Ala-His-Lys-Cu(II) Complex · Dermal Papilla & Hair Follicle Standard",
    longDescription: "**What it is:** AHK-Cu is a synthetic copper complex pairing the tripeptide L-alanyl-L-histidyl-L-lysine with copper(II), structurally distinct from GHK-Cu and specifically optimized for dermal papilla cell stimulation.\n\n**How it works:** AHK-Cu upregulates Vascular Endothelial Growth Factor (VEGF) and basic Fibroblast Growth Factor (bFGF) in dermal papilla cells while suppressing TGF-beta-induced follicle miniaturization, stimulating hair follicle elongation and dermal capillary density.\n\n**Why researchers study it:** Researched as a targeted cosmetic and analytical agent in androgenetic alopecia, hair density enhancement, and scalp microcirculation.",
    category: "Skin, Hair & Cellular Matrix",
    defaultVialNetMg: 50,
    defaultDiluentMl: 5.0,
    standardDoseDisplay: "5 mg – 10 mg Topical Scalp Application",
    standardDoseMcg: 5000,
    cadence: "1x Daily (Topical Scalp / Dermal Monograph)",
    halfLife: "Localized dermal retention (~24 Hours)",
    typicalProtocolDuration: "12 to 24 Weeks",
    primaryDeliveryRoute: "topical",
    deliveryRoutes: ["topical", "subq"],
    titrationSteps: [
      { stage: "Stage 1: Dermal Calibration", timeframe: "Weeks 1–2", doseDisplay: "2.5 mg Topical", doseMcg: 2500, cadence: "1x Daily", focus: "Scalp tolerance & capillary priming", notes: "0.25 mL solution at 10.0 mg/mL" },
      { stage: "Stage 2: Follicle Activation", timeframe: "Weeks 3–12", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "VEGF and bFGF transcription", notes: "0.50 mL solution" },
      { stage: "Stage 3: Hair Matrix Sustained", timeframe: "Weeks 13+", doseDisplay: "10.0 mg Topical", doseMcg: 10000, cadence: "1x Daily", focus: "Anagen phase prolongation", notes: "1.00 mL solution" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 17578401", notes: "Pyo et al. The effect of tripeptide-copper complex on human hair growth in vitro (Arch Pharm Res)." }
    ],
    molecularDetails: { casNumber: "128779-78-2", formula: "C15H24CuN6O4", molecularWeightGPerMol: 415.9 }
  }),

  createProtocol({
    id: "capixyl-acetyl-tetrapeptide-3",
    compoundName: "Capixyl (Acetyl Tetrapeptide-3 Complex)",
    handles: ["capixyl-acetyl-tetrapeptide-3", "capixyl", "acetyl-tetrapeptide-3"],
    subtitle: "Extracellular Matrix Biomimetic Peptide · Follicular Anchoring Standard",
    longDescription: "**What it is:** Capixyl is an advanced formulation combining Acetyl Tetrapeptide-3 (Ac-Lys-Gly-His-Lys-NH2) with Biochanin A, an active isoflavone extracted from red clover.\n\n**How it works:** Acetyl Tetrapeptide-3 stimulates the synthesis of collagen type III, collagen type VII, and laminin in the dermal ECM, dramatically strengthening the anchor of the hair follicle into the dermis while Biochanin A inhibits 5-alpha reductase activity.\n\n**Why researchers study it:** Demonstrated in clinical assays to increase anagen/telogen hair follicle ratios and reverse chronic follicle miniaturization without endocrine side effects.",
    category: "Skin, Hair & Cellular Matrix",
    defaultVialNetMg: 50,
    defaultDiluentMl: 5.0,
    standardDoseDisplay: "5 mg – 10 mg Topical Scalp Dropper",
    standardDoseMcg: 5000,
    cadence: "1x Daily (Topical Application)",
    halfLife: "Localized ECM binding (~24 Hours)",
    typicalProtocolDuration: "12 to 24 Weeks",
    primaryDeliveryRoute: "topical",
    deliveryRoutes: ["topical"],
    titrationSteps: [
      { stage: "Stage 1: ECM Priming", timeframe: "Weeks 1–4", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "Dermal collagen III synthesis", notes: "0.50 mL at 10.0 mg/mL" },
      { stage: "Stage 2: Active Anchoring", timeframe: "Weeks 5–12", doseDisplay: "10.0 mg Topical", doseMcg: 10000, cadence: "1x Daily", focus: "Laminin and follicle anchoring", notes: "1.00 mL at 10.0 mg/mL" },
      { stage: "Stage 3: Maintenance", timeframe: "Weeks 13+", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "Hair density preservation", notes: "0.50 mL at 10.0 mg/mL" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 23449130", notes: "Loing et al. A new strategy to modulate alopecia using a combination of acetyl tetrapeptide-3 and clover extract." }
    ],
    molecularDetails: { casNumber: "827306-88-7", sequenceOrFormula: "Ac-Lys-Gly-His-Lys-NH2" }
  }),

  createProtocol({
    id: "procapil-biotinoyl-tripeptide-1",
    compoundName: "Procapil (Biotinoyl Tripeptide-1 Complex)",
    handles: ["procapil-biotinoyl-tripeptide-1", "procapil", "biotinoyl-tripeptide-1"],
    subtitle: "Vitamin-Peptide Conjugate · Microvascular Dermal Papilla Standard",
    longDescription: "**What it is:** Procapil is a tri-active complex combining Biotinoyl Tripeptide-1 (biotin coupled to Gly-His-Lys) with apigenin (a citrus flavonoid) and oleanolic acid (from olive leaves).\n\n**How it works:** Biotinoyl Tripeptide-1 enhances adhesion protein synthesis (laminin-5 and collagen IV) in root sheaths, apigenin vasodilates microvascular blood vessels in the scalp, and oleanolic acid inhibits 5-alpha reductase types 1 and 2.\n\n**Why researchers study it:** Researched for anti-hair loss efficacy comparable to minoxidil in cellular assays, preventing follicle atrophy and premature telogen transition.",
    category: "Skin, Hair & Cellular Matrix",
    defaultVialNetMg: 50,
    defaultDiluentMl: 5.0,
    standardDoseDisplay: "5 mg – 10 mg Topical Application",
    standardDoseMcg: 5000,
    cadence: "1x Daily Topical Scalp Monograph",
    halfLife: "Localized follicle retention (~24 Hours)",
    typicalProtocolDuration: "12 to 24 Weeks",
    primaryDeliveryRoute: "topical",
    deliveryRoutes: ["topical"],
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Weeks 1–4", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "Microvascular dilation", notes: "0.50 mL at 10.0 mg/mL" },
      { stage: "Stage 2: Follicle Sheath Optimization", timeframe: "Weeks 5–12", doseDisplay: "10.0 mg Topical", doseMcg: 10000, cadence: "1x Daily", focus: "Laminin-5 adhesion synthesis", notes: "1.00 mL at 10.0 mg/mL" },
      { stage: "Stage 3: Sustained Density", timeframe: "Weeks 13+", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "Telogen phase reduction", notes: "0.50 mL at 10.0 mg/mL" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 28914448", notes: "Fischer et al. Effect of biotinoyl tripeptide-1 on human hair follicle proliferation and anchoring." }
    ],
    molecularDetails: { casNumber: "299157-54-3", sequenceOrFormula: "Biotinyl-Gly-His-Lys-OH" }
  }),

  createProtocol({
    id: "argireline-amplified",
    compoundName: "Argireline Amplified (Acetyl Hexapeptide-8)",
    handles: ["argireline-amplified", "argireline", "acetyl-hexapeptide-8"],
    subtitle: "Presynaptic SNARE Complex Inhibitor · Dermal Expression Line Standard",
    longDescription: "**What it is:** Argireline Amplified is an optimized version of Acetyl Hexapeptide-8, a synthetic peptide patterned after the N-terminal end of SNAP-25 protein.\n\n**How it works:** By competing with SNAP-25 for a position in the presynaptic SNARE complex, Argireline prevents the formation of the fusion complex required for acetylcholine exocytosis at the neuromuscular junction, attenuating repetitive facial muscle contractions.\n\n**Why researchers study it:** Researched in dermatology as a non-invasive cosmetic benchmark for dynamic expression line attenuation, dermal firmness, and barrier lipid reinforcement.",
    category: "Skin, Hair & Cellular Matrix",
    defaultVialNetMg: 50,
    defaultDiluentMl: 5.0,
    standardDoseDisplay: "5 mg – 10 mg Topical Dermal Application",
    standardDoseMcg: 5000,
    cadence: "1x–2x Daily Topical Application",
    halfLife: "Topical cellular residence (~12 to 24 Hours)",
    typicalProtocolDuration: "8 to 16 Weeks",
    primaryDeliveryRoute: "topical",
    deliveryRoutes: ["topical"],
    titrationSteps: [
      { stage: "Stage 1: Dermal Permeation", timeframe: "Weeks 1–2", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "SNARE complex competition", notes: "0.50 mL at 10.0 mg/mL" },
      { stage: "Stage 2: Full Expression Modulation", timeframe: "Weeks 3–8", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "2x Daily (AM/PM)", focus: "Micro-contraction relaxation", notes: "0.50 mL twice daily" },
      { stage: "Stage 3: Maintenance", timeframe: "Weeks 9+", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "Dermal matrix preservation", notes: "0.50 mL daily" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 18498523", notes: "Blanes-Mira et al. A synthetic hexapeptide (Argireline) with antiwrinkle activity (Int J Cosmet Sci)." }
    ],
    molecularDetails: { casNumber: "616204-22-9", formula: "C34H60N14O12S", molecularWeightGPerMol: 889.0 }
  }),

  createProtocol({
    id: "matrixyl-synthe-6",
    compoundName: "Matrixyl Synthe'6 (Palmitoyl Tripeptide-38)",
    handles: ["matrixyl-synthe-6", "palmitoyl-tripeptide-38", "matrixyl"],
    subtitle: "Dermal Matrix Matrikine · 6-Fold Extracellular Macromolecule Stimulator",
    longDescription: "**What it is:** Matrixyl Synthe'6 is a dioxygenated lipopeptide consisting of Palmitoyl Tripeptide-38 (Pal-Lys-Met(O2)-Lys-OH), modeled after a natural matrikine peptide derived from laminin.\n\n**How it works:** It acts as a cellular messenger that stimulates the synthesis of 6 major constituents of the dermal matrix and dermal-epidermal junction: Collagen I, Collagen III, Collagen IV, Fibronectin, Hyaluronic Acid, and Laminin-5.\n\n**Why researchers study it:** Extensively documented in dermal reconstructive assays for rebuilding skin tissue volume and depth at the dermal-epidermal junction.",
    category: "Skin, Hair & Cellular Matrix",
    defaultVialNetMg: 50,
    defaultDiluentMl: 5.0,
    standardDoseDisplay: "5 mg – 10 mg Topical Dermal Dropper",
    standardDoseMcg: 5000,
    cadence: "1x Daily Topical Dermal Monograph",
    halfLife: "Localized ECM remodeling (~24 Hours)",
    typicalProtocolDuration: "8 to 16 Weeks",
    primaryDeliveryRoute: "topical",
    deliveryRoutes: ["topical"],
    titrationSteps: [
      { stage: "Stage 1: Matrikine Priming", timeframe: "Weeks 1–2", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "Dermal fibroblast activation", notes: "0.50 mL at 10.0 mg/mL" },
      { stage: "Stage 2: 6-Matrix Synthesis", timeframe: "Weeks 3–8", doseDisplay: "10.0 mg Topical", doseMcg: 10000, cadence: "1x Daily", focus: "Collagen I/III/IV & HA secretion", notes: "1.00 mL at 10.0 mg/mL" },
      { stage: "Stage 3: Density Maintenance", timeframe: "Weeks 9+", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "Dermal-epidermal junction integrity", notes: "0.50 mL at 10.0 mg/mL" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 24040947", notes: "Schagen et al. Topical peptide treatments with effective anti-aging results (Cosmetics)." }
    ],
    molecularDetails: { casNumber: "1447824-23-8", sequenceOrFormula: "Pal-Lys-Met(O2)-Lys-OH" }
  }),

  createProtocol({
    id: "palmitoyl-tetrapeptide-20",
    compoundName: "Palmitoyl Tetrapeptide-20 (Greyverse)",
    handles: ["palmitoyl-tetrapeptide-20", "greyverse"],
    subtitle: "Alpha-MSH Biomimetic Lipopeptide · Follicular Melanogenesis Standard",
    longDescription: "**What it is:** Palmitoyl Tetrapeptide-20 is a palmitoylated biomimetic peptide patterned after alpha-Melanocyte-Stimulating Hormone (alpha-MSH), designed to penetrate the hair follicle bulb.\n\n**How it works:** It binds MC1-R receptors in follicular melanocytes, upregulating tyrosinase activity to stimulate melanin pigment synthesis while upregulating catalase expression to eliminate accumulated hydrogen peroxide (H2O2) in hair shafts.\n\n**Why researchers study it:** Researched in trichology for naturally repigmenting graying hair at the follicular level and reversing oxidative stress-induced depigmentation.",
    category: "Skin, Hair & Cellular Matrix",
    defaultVialNetMg: 50,
    defaultDiluentMl: 5.0,
    standardDoseDisplay: "5 mg – 10 mg Topical Scalp Application",
    standardDoseMcg: 5000,
    cadence: "1x Daily (Topical Scalp Monograph)",
    halfLife: "Localized follicular residence (~24 Hours)",
    typicalProtocolDuration: "12 to 24 Weeks",
    primaryDeliveryRoute: "topical",
    deliveryRoutes: ["topical"],
    titrationSteps: [
      { stage: "Stage 1: Follicle Priming", timeframe: "Weeks 1–4", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "Catalase antioxidant upregulation", notes: "0.50 mL at 10.0 mg/mL" },
      { stage: "Stage 2: Active Melanogenesis", timeframe: "Weeks 5–16", doseDisplay: "10.0 mg Topical", doseMcg: 10000, cadence: "1x Daily", focus: "Tyrosinase and eumelanin production", notes: "1.00 mL at 10.0 mg/mL" },
      { stage: "Stage 3: Pigment Maintenance", timeframe: "Weeks 17+", doseDisplay: "5.0 mg Topical", doseMcg: 5000, cadence: "1x Daily", focus: "Follicular melanocyte survival", notes: "0.50 mL at 10.0 mg/mL" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 32667104", notes: "Wood et al. Senile hair graying: H2O2-mediated oxidative stress and peptide recovery." }
    ],
    molecularDetails: { casNumber: "1356447-90-9", sequenceOrFormula: "Pal-Lys-Phe-Lys-Thr-OH" }
  })
]

export const TISSUE_SKIN_PRODUCTS = [
  createCatalogProduct({
    id: "bpc-157-arginate",
    title: "BPC-157 Arginate Salt (10mg Acid-Stable Vial)",
    category: "Tissue Repair & Healing",
    netContentDisplay: "10MG",
    priceVialOnly: 2950,
    priceVialBac: 3150,
    priceSubqKit: 3270,
    descriptionSummary: "Acid-stable L-arginate salt of BPC-157 with enhanced gastric bioavailability for oral research."
  }),
  createCatalogProduct({
    id: "tb-4-full-length",
    title: "Thymosin Beta-4 / TB-4 (5mg Full-Length 43AA Vial)",
    category: "Tissue Repair & Healing",
    netContentDisplay: "5MG",
    priceVialOnly: 3200,
    priceVialBac: 3400,
    priceSubqKit: 3520,
    descriptionSummary: "Full-length 43-amino-acid parent Thymosin Beta-4 polypeptide for cellular actin remodeling studies."
  }),
  createCatalogProduct({
    id: "ahk-cu",
    title: "AHK-Cu / Copper Tripeptide-3 (50mg Research Vial)",
    category: "Skin, Hair & Cellular Matrix",
    netContentDisplay: "50MG",
    priceVialOnly: 2400,
    priceVialBac: 2600,
    priceSubqKit: 2720,
    descriptionSummary: "Dermal papilla-stimulating copper peptide standard evaluated for VEGF and hair follicle growth."
  }),
  createCatalogProduct({
    id: "capixyl-acetyl-tetrapeptide-3",
    title: "Capixyl / Acetyl Tetrapeptide-3 (50mg Research Vial)",
    category: "Skin, Hair & Cellular Matrix",
    netContentDisplay: "50MG",
    priceVialOnly: 2600,
    priceVialBac: 2800,
    priceSubqKit: 2920,
    descriptionSummary: "Extracellular matrix biomimetic peptide complex targeting collagen III and follicular anchoring."
  }),
  createCatalogProduct({
    id: "procapil-biotinoyl-tripeptide-1",
    title: "Procapil / Biotinoyl Tripeptide-1 (50mg Research Vial)",
    category: "Skin, Hair & Cellular Matrix",
    netContentDisplay: "50MG",
    priceVialOnly: 2500,
    priceVialBac: 2700,
    priceSubqKit: 2820,
    descriptionSummary: "Vitamin-peptide conjugate evaluated for microvascular dermal perfusion and follicle anchoring."
  }),
  createCatalogProduct({
    id: "argireline-amplified",
    title: "Argireline Amplified (50mg Research Vial)",
    category: "Skin, Hair & Cellular Matrix",
    netContentDisplay: "50MG",
    priceVialOnly: 2200,
    priceVialBac: 2400,
    priceSubqKit: 2520,
    descriptionSummary: "Presynaptic SNARE complex inhibitor peptide evaluated for facial expression muscle relaxation."
  }),
  createCatalogProduct({
    id: "matrixyl-synthe-6",
    title: "Matrixyl Synthe'6 (50mg Research Vial)",
    category: "Skin, Hair & Cellular Matrix",
    netContentDisplay: "50MG",
    priceVialOnly: 2400,
    priceVialBac: 2600,
    priceSubqKit: 2720,
    descriptionSummary: "Palmitoyl Tripeptide-38 matrikine evaluated for 6-fold extracellular dermal matrix synthesis."
  }),
  createCatalogProduct({
    id: "palmitoyl-tetrapeptide-20",
    title: "Palmitoyl Tetrapeptide-20 / Greyverse (50mg Research Vial)",
    category: "Skin, Hair & Cellular Matrix",
    netContentDisplay: "50MG",
    priceVialOnly: 2800,
    priceVialBac: 3000,
    priceSubqKit: 3120,
    descriptionSummary: "Alpha-MSH biomimetic peptide evaluated for follicular melanogenesis and hair repigmentation."
  })
]
