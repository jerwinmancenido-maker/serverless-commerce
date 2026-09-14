import { createProtocol, createCatalogProduct } from "./builder.mjs"

export const GH_ANABOLICS_PROTOCOLS = [
  createProtocol({
    id: "peg-mgf",
    compoundName: "PEG-MGF (Pegylated Mechano Growth Factor)",
    handles: ["peg-mgf", "pegmgf"],
    subtitle: "Pegylated IGF-1Ec Splice Variant · Muscle Stem Cell Activation Standard",
    longDescription: "**What it is:** PEG-MGF is a pegylated form of Mechano Growth Factor (IGF-1Ec), an endogenous splice variant of insulin-like growth factor-1 produced by skeletal muscle in response to mechanical strain or micro-injury.\n\n**How it works:** Pegylation protects the peptide from rapid enzymatic proteolysis, increasing its half-life from minutes to 48–72 hours. PEG-MGF selectively stimulates dormant muscle satellite cell activation, proliferation, and fusion into damaged muscle fibers.\n\n**Why researchers study it:** Investigated in muscle wasting, cardiac remodeling, and accelerated localized soft-tissue repair models.",
    category: "Growth Hormone Axis",
    defaultVialNetMg: 2,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "200 mcg – 400 mcg 2x/Week Post-Assay",
    standardDoseMcg: 200,
    cadence: "2x–3x Weekly (Post-Mechanical Assay)",
    halfLife: "~48 to 72 Hours",
    typicalProtocolDuration: "4 to 6 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Weeks 1–2", doseDisplay: "100 mcg", doseMcg: 100, cadence: "2x Weekly", focus: "Satellite cell activation", notes: "10.0 units (0.10 mL) at 1.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 3–4", doseDisplay: "200 mcg", doseMcg: 200, cadence: "2x Weekly", focus: "Hypertrophic cellular signaling", notes: "20.0 units (0.20 mL)" },
      { stage: "Stage 3: Peak Cohort", timeframe: "Weeks 5–6", doseDisplay: "400 mcg", doseMcg: 400, cadence: "2x Weekly", focus: "Maximum myotube fusion", notes: "40.0 units (0.40 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 21323984", notes: "Goldspink et al. Mechano growth factor, a splice variant of IGF-1, in skeletal muscle repair." }
    ],
    molecularDetails: { casNumber: "918663-78-6", molarMass: "2,867.2 g/mol + PEG ~20kDa" }
  }),

  createProtocol({
    id: "mgf",
    compoundName: "MGF (Native Mechano Growth Factor)",
    handles: ["mgf", "native-mgf"],
    subtitle: "Native IGF-1Ec C-Terminal Peptide · Localized Satellite Activation",
    longDescription: "**What it is:** MGF Native is the unmodified 24-amino-acid C-terminal peptide of the IGF-1Ec isoform, responsible for the initial pulse of satellite cell proliferation following eccentric mechanical load.\n\n**How it works:** Unlike systemic IGF-1, native MGF acts locally without binding standard IGF-1R with high affinity, utilizing distinct cellular signaling cascades that rapidly recruit satellite cells to the site of strain.\n\n**Why researchers study it:** Researched for acute, localized cellular repair and rapid myoblast recruitment immediately following injury.",
    category: "Growth Hormone Axis",
    defaultVialNetMg: 5,
    defaultDiluentMl: 2.5,
    standardDoseDisplay: "100 mcg – 250 mcg Localized Assay Post-Protocol",
    standardDoseMcg: 200,
    cadence: "Immediate Post-Protocol Localized (Within 30 min)",
    halfLife: "~5 to 15 Minutes (Rapid local clearance)",
    typicalProtocolDuration: "4 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Local Tolerance", timeframe: "Week 1", doseDisplay: "100 mcg", doseMcg: 100, cadence: "Post-protocol", focus: "Local cellular response", notes: "5.0 units (0.05 mL) at 2.0 mg/mL" },
      { stage: "Stage 2: Target Evaluation", timeframe: "Weeks 2–3", doseDisplay: "200 mcg", doseMcg: 200, cadence: "Post-protocol", focus: "Acute satellite activation", notes: "10.0 units (0.10 mL)" },
      { stage: "Stage 3: Peak Local Cohort", timeframe: "Week 4", doseDisplay: "300 mcg", doseMcg: 300, cadence: "Post-protocol", focus: "Maximum acute signaling", notes: "15.0 units (0.15 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 15741258", notes: "Yang & Goldspink. Different roles of the IGF-I Ec peptide (MGF) and mature IGF-I in myoblast proliferation." }
    ],
    molecularDetails: { casNumber: "918663-78-6", formula: "C121H200N42O39", molecularWeightGPerMol: 2867.2 }
  }),

  createProtocol({
    id: "follistatin-344",
    compoundName: "Follistatin-344 (FS-344)",
    handles: ["follistatin-344", "fs-344", "fs344"],
    subtitle: "Autocrine Glycoprotein · Myostatin (GDF-8) & Activin-A Antagonist",
    longDescription: "**What it is:** Follistatin-344 is an autocrine glycoprotein that binds with exceptionally high affinity to myostatin (GDF-8), activin-A, and other TGF-beta superfamily ligands, acting as an extracellular neutralizer.\n\n**How it works:** By binding and sequestering myostatin before it can engage ActRIIB receptors, Follistatin lifts the physiological brake on skeletal muscle protein synthesis, triggering robust satellite cell proliferation and muscle mass accretion.\n\n**Why researchers study it:** Extensively researched in gene therapy and peptide assays for severe muscular dystrophy, sarcopenia, and muscle wasting conditions.",
    category: "Growth Hormone Axis",
    defaultVialNetMg: 1,
    defaultDiluentMl: 1.0,
    standardDoseDisplay: "50 mcg – 100 mcg Daily SubQ (10-Day Cycle)",
    standardDoseMcg: 100,
    cadence: "1x Daily for 10 Consecutive Days",
    halfLife: "~90 Minutes",
    typicalProtocolDuration: "10 to 20 Days per Research Cycle",
    washoutPeriod: "6 to 8 Weeks between cycles",
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Days 1–3", doseDisplay: "50 mcg Daily", doseMcg: 50, cadence: "1x Daily", focus: "Initial myostatin neutralization", notes: "5.0 units (0.05 mL) at 1.0 mg/mL" },
      { stage: "Stage 2: Target Suppression", timeframe: "Days 4–7", doseDisplay: "100 mcg Daily", doseMcg: 100, cadence: "1x Daily", focus: "Full ActRIIB ligand blockade", notes: "10.0 units (0.10 mL)" },
      { stage: "Stage 3: Cycle Peak", timeframe: "Days 8–10", doseDisplay: "100 mcg Daily", doseMcg: 100, cadence: "1x Daily", focus: "Maximum myotube expansion", notes: "10.0 units (0.10 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 19934277", notes: "Kota et al. Follistatin gene therapy increases muscle size and strength in non-human primates (Sci Transl Med)." }
    ],
    molecularDetails: { casNumber: "98810-70-1", molecularWeightGPerMol: 37800 }
  }),

  createProtocol({
    id: "follistatin-315",
    compoundName: "Follistatin-315 (FS-315)",
    handles: ["follistatin-315", "fs-315", "fs315"],
    subtitle: "Circulating Glycoprotein Isoform · Systemic Myostatin Neutralizer",
    longDescription: "**What it is:** Follistatin-315 is the primary circulating physiological isoform of follistatin found in systemic mammalian plasma, possessing an acidic C-terminal extension that modulates its extracellular matrix binding.\n\n**How it works:** FS-315 preferentially neutralizes circulating activin and myostatin with lower cell-surface heparin binding than FS-288, making it ideal for systemic endocrine evaluation without excessive localized tissue trapping.\n\n**Why researchers study it:** Investigated in systemic fibrosis, age-related muscle atrophy, and metabolic regulation assays.",
    category: "Growth Hormone Axis",
    defaultVialNetMg: 1,
    defaultDiluentMl: 1.0,
    standardDoseDisplay: "50 mcg – 100 mcg Daily SubQ (10 to 14 Days)",
    standardDoseMcg: 100,
    cadence: "1x Daily (10 to 14-day protocol)",
    halfLife: "~2 Hours",
    typicalProtocolDuration: "14 Days",
    titrationSteps: [
      { stage: "Stage 1: Systemic Priming", timeframe: "Days 1–4", doseDisplay: "50 mcg Daily", doseMcg: 50, cadence: "1x Daily", focus: "Circulating activin binding", notes: "5.0 units (0.05 mL) at 1.0 mg/mL" },
      { stage: "Stage 2: Target Blockade", timeframe: "Days 5–10", doseDisplay: "100 mcg Daily", doseMcg: 100, cadence: "1x Daily", focus: "Systemic myostatin clearance", notes: "10.0 units (0.10 mL)" },
      { stage: "Stage 3: Maintenance Cohort", timeframe: "Days 11–14", doseDisplay: "100 mcg Daily", doseMcg: 100, cadence: "1x Daily", focus: "Protein synthesis maintenance", notes: "10.0 units (0.10 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 11095945", notes: "Schneyer et al. Activin-binding protein follistatin in human serum (Endocrinology)." }
    ],
    molecularDetails: { casNumber: "98810-70-1", molecularWeightGPerMol: 34900 }
  }),

  createProtocol({
    id: "ace-031",
    compoundName: "Ace-031 (ActRIIB-Fc)",
    handles: ["ace-031", "ace031", "actriib-fc"],
    subtitle: "Soluble Activin Receptor Type IIB Fusion Protein · Decoy Receptor Standard",
    longDescription: "**What it is:** Ace-031 is an engineered soluble decoy receptor consisting of the extracellular ligand-binding domain of human activin receptor type IIB (ActRIIB) fused to the Fc portion of human IgG1.\n\n**How it works:** By binding tightly to circulating myostatin, GDF-11, and activins, Ace-031 prevents these inhibitory ligands from interacting with cellular cell-surface ActRIIB receptors, driving pronounced lean muscle mass gains.\n\n**Why researchers study it:** Researched in Phase 1/2 human clinical trials for Duchenne muscular dystrophy and ambulatory muscle preservation.",
    category: "Growth Hormone Axis",
    defaultVialNetMg: 1,
    defaultDiluentMl: 1.0,
    standardDoseDisplay: "500 mcg – 1000 mcg Every 14 Days SubQ",
    standardDoseMcg: 1000,
    cadence: "1x Every 14 Days (Bi-Weekly SubQ)",
    halfLife: "~10 to 15 Days",
    typicalProtocolDuration: "8 to 16 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Initial Calibration", timeframe: "Day 1", doseDisplay: "500 mcg", doseMcg: 500, cadence: "Day 1", focus: "Receptor saturation baseline", notes: "50.0 units (0.50 mL) at 1.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Day 15 & Day 29", doseDisplay: "1000 mcg", doseMcg: 1000, cadence: "Every 14 Days", focus: "Sustained ligand blockade", notes: "100.0 units (1.00 mL)" },
      { stage: "Stage 3: Cohort Evaluation", timeframe: "Day 43+", doseDisplay: "1000 mcg", doseMcg: 1000, cadence: "Every 14 Days", focus: "Lean tissue mass accretion", notes: "100.0 units (1.00 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 23144106", notes: "Campbell et al. Myostatin inhibitor ACE-031 in patients with Duchenne muscular dystrophy (Muscle Nerve)." }
    ],
    molecularDetails: { casNumber: "1166419-14-0", molecularWeightGPerMol: 110000 }
  }),

  createProtocol({
    id: "gonadorelin",
    compoundName: "Gonadorelin (GnRH)",
    handles: ["gonadorelin", "gnrh"],
    subtitle: "Synthetic Gonadotropin-Releasing Hormone · Pituitary LH/FSH Pulsatility",
    longDescription: "**What it is:** Gonadorelin is a synthetic decapeptide identical to endogenous hypothalamic Gonadotropin-Releasing Hormone (GnRH), responsible for regulating the pituitary-gonadal endocrine axis.\n\n**How it works:** Intermittent pulsatile administration of Gonadorelin binds to pituitary GnRH receptors, stimulating the synthesis and episodic secretion of Luteinizing Hormone (LH) and Follicle-Stimulating Hormone (FSH).\n\n**Why researchers study it:** Researched in hypogonadotropic models to assess pituitary responsiveness and restore endogenous testosterone/spermatogenesis pulsatility.",
    category: "Growth Hormone Axis",
    defaultVialNetMg: 2,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "100 mcg – 200 mcg Pulsatile SubQ",
    standardDoseMcg: 100,
    cadence: "Intermittent / Pulsatile (1x–2x Weekly)",
    halfLife: "~10 to 40 Minutes",
    typicalProtocolDuration: "4 to 8 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Pituitary Calibration", timeframe: "Weeks 1–2", doseDisplay: "50 mcg", doseMcg: 50, cadence: "2x Weekly", focus: "Pituitary sensitization", notes: "5.0 units (0.05 mL) at 1.0 mg/mL" },
      { stage: "Stage 2: Target Pulsatility", timeframe: "Weeks 3–6", doseDisplay: "100 mcg", doseMcg: 100, cadence: "2x Weekly", focus: "Endogenous LH/FSH surge", notes: "10.0 units (0.10 mL)" },
      { stage: "Stage 3: Advanced Maintenance", timeframe: "Weeks 7+", doseDisplay: "200 mcg", doseMcg: 200, cadence: "2x Weekly", focus: "Gonadal steroidogenesis", notes: "20.0 units (0.20 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 6768393", notes: "Conn et al. Mechanism of action of gonadotropin-releasing hormone (Endocr Rev)." }
    ],
    molecularDetails: { casNumber: "33515-09-2", formula: "C55H75N17O13", molecularWeightGPerMol: 1182.3 }
  }),

  createProtocol({
    id: "triptorelin",
    compoundName: "Triptorelin",
    handles: ["triptorelin"],
    subtitle: "Potent D-Trp6-GnRH Agonist · Single-Dose Pituitary Reset Protocol",
    longDescription: "**What it is:** Triptorelin is a synthetic decapeptide agonist of GnRH with a D-tryptophan substitution at position 6, conferring 100-fold higher receptor affinity and resistance to enzymatic degradation compared to native GnRH.\n\n**How it works:** A single micro-dose triggers an intense immediate surge of pituitary LH and FSH release, stimulating dormant Leydig cells and resetting the hypothalamic-pituitary-gonadal axis in endocrine suppression models.\n\n**Why researchers study it:** Investigated in single-dose endocrine reset protocols (100 mcg single injection) for rapid post-cycle hypothalamic restoration.",
    category: "Growth Hormone Axis",
    defaultVialNetMg: 0.1,
    defaultDiluentMl: 1.0,
    standardDoseDisplay: "100 mcg Single Protocol Dose",
    standardDoseMcg: 100,
    cadence: "Single Protocol Administration (One-Time Evaluation)",
    halfLife: "~2.8 Hours",
    typicalProtocolDuration: "Single Protocol Dose with 30-day monitoring",
    washoutPeriod: "12 Weeks minimum",
    titrationSteps: [
      { stage: "Stage 1: Single Reset Administration", timeframe: "Day 1 (Single Dose)", doseDisplay: "100 mcg Single Dose", doseMcg: 100, cadence: "Single administration", focus: "Acute gonadotropin surge", notes: "100.0 units (1.00 mL) at 0.1 mg/mL" },
      { stage: "Stage 2: Endocrine Monitoring", timeframe: "Days 2–14", doseDisplay: "0 mcg (Observation)", doseMcg: 0, cadence: "Monitoring only", focus: "Endogenous LH recovery", notes: "Observe baseline surge" },
      { stage: "Stage 3: Axis Stabilization", timeframe: "Days 15–30", doseDisplay: "0 mcg (Observation)", doseMcg: 0, cadence: "Monitoring only", focus: "Steroidogenic homeostatic equilibrium", notes: "Post-reset evaluation" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 18451877", notes: "Lahlou et al. Pharmacology and safety of triptorelin in central precocious puberty and endocrine models." }
    ],
    molecularDetails: { casNumber: "57773-63-4", formula: "C64H82N18O13", molecularWeightGPerMol: 1311.5 }
  }),

  createProtocol({
    id: "buserelin",
    compoundName: "Buserelin Acetate",
    handles: ["buserelin", "buserelin-acetate"],
    subtitle: "High-Affinity Nonapeptide GnRH Agonist Analytical Monograph",
    longDescription: "**What it is:** Buserelin Acetate is a synthetic nonapeptide analogue of GnRH featuring D-Ser(tBu) at position 6 and ethylamide replacing the terminal glycinamide, giving it 16 to 40 times the potency of natural GnRH.\n\n**How it works:** In low pulsatile doses, it stimulates gonadotropin release; with continuous administration, it rapidly downregulates pituitary GnRH receptors, providing precise bidirectional control of the endocrine axis in scientific models.\n\n**Why researchers study it:** Researched in pulsatile reproductive physiology and controlled receptor desensitization kinetics.",
    category: "Growth Hormone Axis",
    defaultVialNetMg: 5,
    defaultDiluentMl: 2.5,
    standardDoseDisplay: "50 mcg – 100 mcg Pulsatile SubQ / Nasal",
    standardDoseMcg: 50,
    cadence: "Pulsatile Intermittent (2x–3x Weekly)",
    halfLife: "~75 to 90 Minutes",
    typicalProtocolDuration: "4 to 8 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "nasal"],
    titrationSteps: [
      { stage: "Stage 1: Pulsatile Calibration", timeframe: "Weeks 1–2", doseDisplay: "25 mcg", doseMcg: 25, cadence: "2x Weekly", focus: "Pituitary priming", notes: "1.25 units (0.0125 mL) at 2.0 mg/mL" },
      { stage: "Stage 2: Target Evaluation", timeframe: "Weeks 3–6", doseDisplay: "50 mcg", doseMcg: 50, cadence: "2x Weekly", focus: "Gonadotropin release", notes: "2.5 units (0.025 mL)" },
      { stage: "Stage 3: Advanced Tier", timeframe: "Weeks 7+", doseDisplay: "100 mcg", doseMcg: 100, cadence: "2x Weekly", focus: "Receptor dynamics", notes: "5.0 units (0.05 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 6313364", notes: "Sandow et al. Pharmacokinetics and metabolism of buserelin in rats and humans." }
    ],
    molecularDetails: { casNumber: "57982-77-1", formula: "C60H86N16O13", molecularWeightGPerMol: 1239.4 }
  })
]

export const GH_ANABOLICS_PRODUCTS = [
  createCatalogProduct({
    id: "peg-mgf",
    title: "PEG-MGF (2mg Research Vial)",
    category: "Growth Hormone Axis",
    netContentDisplay: "2MG",
    priceVialOnly: 2950,
    priceVialBac: 3150,
    priceSubqKit: 3270,
    descriptionSummary: "Long-acting pegylated Mechano Growth Factor for muscle satellite cell activation research."
  }),
  createCatalogProduct({
    id: "mgf",
    title: "MGF Native (5mg Research Vial)",
    category: "Growth Hormone Axis",
    netContentDisplay: "5MG",
    priceVialOnly: 2800,
    priceVialBac: 3000,
    priceSubqKit: 3120,
    descriptionSummary: "Native 24-AA C-terminal IGF-1Ec peptide for acute localized cellular repair studies."
  }),
  createCatalogProduct({
    id: "follistatin-344",
    title: "Follistatin-344 (1mg Research Vial)",
    category: "Growth Hormone Axis",
    netContentDisplay: "1MG",
    priceVialOnly: 3800,
    priceVialBac: 4000,
    priceSubqKit: 4120,
    descriptionSummary: "Autocrine myostatin and activin-A neutralizing glycoprotein analytical standard."
  }),
  createCatalogProduct({
    id: "follistatin-315",
    title: "Follistatin-315 (1mg Research Vial)",
    category: "Growth Hormone Axis",
    netContentDisplay: "1MG",
    priceVialOnly: 3900,
    priceVialBac: 4100,
    priceSubqKit: 4220,
    descriptionSummary: "Circulating physiological follistatin isoform for systemic myostatin neutralization research."
  }),
  createCatalogProduct({
    id: "ace-031",
    title: "Ace-031 / ActRIIB-Fc (1mg Research Vial)",
    category: "Growth Hormone Axis",
    netContentDisplay: "1MG",
    priceVialOnly: 4200,
    priceVialBac: 4400,
    priceSubqKit: 4520,
    descriptionSummary: "Soluble decoy activin receptor type IIB fusion protein for lean muscle mass accretion research."
  }),
  createCatalogProduct({
    id: "gonadorelin",
    title: "Gonadorelin / GnRH (2mg Research Vial)",
    category: "Growth Hormone Axis",
    netContentDisplay: "2MG",
    priceVialOnly: 2200,
    priceVialBac: 2400,
    priceSubqKit: 2520,
    descriptionSummary: "Synthetic decapeptide GnRH standard for pituitary LH and FSH secretion assays."
  }),
  createCatalogProduct({
    id: "triptorelin",
    title: "Triptorelin (100mcg Single-Dose Reset Vial)",
    category: "Growth Hormone Axis",
    netContentDisplay: "100MCG",
    priceVialOnly: 1950,
    priceVialBac: 2150,
    priceSubqKit: 2270,
    descriptionSummary: "High-affinity D-Trp6-GnRH agonist for single-dose hypothalamic-pituitary reset protocols."
  }),
  createCatalogProduct({
    id: "buserelin",
    title: "Buserelin Acetate (5mg Research Vial)",
    category: "Growth Hormone Axis",
    netContentDisplay: "5MG",
    priceVialOnly: 2400,
    priceVialBac: 2600,
    priceSubqKit: 2720,
    descriptionSummary: "High-affinity nonapeptide GnRH agonist for pulsatile endocrine research."
  })
]
