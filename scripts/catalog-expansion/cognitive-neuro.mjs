import { createProtocol, createCatalogProduct } from "./builder.mjs"

export const COGNITIVE_NEURO_PROTOCOLS = [
  createProtocol({
    id: "fgl",
    compoundName: "FGL Peptide (NCAM Agonist)",
    handles: ["fgl", "fgl-peptide"],
    subtitle: "Neural Cell Adhesion Molecule (NCAM) Mimetic · Synaptogenesis Standard",
    longDescription: "**What it is:** FGL is a 15-amino-acid synthetic peptide derived from the second F3 module of Neural Cell Adhesion Molecule (NCAM), engineered to activate FGFR-1 receptors in the absence of full NCAM proteins.\n\n**How it works:** FGL binds FGFR-1, triggering intracellular phosphorylation cascades (ERK1/2 and CREB) that drive neuritogenesis, dendritic spine maturation, synaptogenesis, and long-term potentiation (LTP) in hippocampal neuronal networks.\n\n**Why researchers study it:** Researched in cognitive enhancement, ischemic stroke recovery, and models of age-associated memory impairment.",
    category: "Cognitive & Neuroprotective",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "500 mcg – 1000 mcg Daily SubQ / Nasal",
    standardDoseMcg: 500,
    cadence: "1x Daily (Q24H SubQ or Intranasal)",
    halfLife: "~4 to 6 Hours",
    typicalProtocolDuration: "4 to 8 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "nasal"],
    titrationSteps: [
      { stage: "Stage 1: Synaptic Priming", timeframe: "Weeks 1–2", doseDisplay: "250 mcg Daily", doseMcg: 250, cadence: "1x Daily", focus: "FGFR-1 baseline activation", notes: "5.0 units (0.05 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 3–6", doseDisplay: "500 mcg Daily", doseMcg: 500, cadence: "1x Daily", focus: "Dendritic spine formation", notes: "10.0 units (0.10 mL)" },
      { stage: "Stage 3: High Synaptogenesis", timeframe: "Weeks 7+", doseDisplay: "1000 mcg Daily", doseMcg: 1000, cadence: "1x Daily", focus: "Peak hippocampal LTP", notes: "20.0 units (0.20 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 18451268", notes: "Kiselyov et al. The neural cell adhesion molecule-derived peptide FGL promotes memory and synaptic plasticity (J Neurosci)." }
    ],
    molecularDetails: { casNumber: "1356447-90-9", sequenceOrFormula: "EVYVVAENQQGKSKA" }
  }),

  createProtocol({
    id: "vip",
    compoundName: "VIP (Vasoactive Intestinal Peptide)",
    handles: ["vip", "vasoactive-intestinal-peptide"],
    subtitle: "Endogenous 28AA Neuro-Endocrine Peptide · VPAC1/2 Receptor Standard",
    longDescription: "**What it is:** VIP is a 28-amino-acid endogenous neuropeptide belonging to the glucagon/secretin superfamily, functioning as a primary neuromodulator and anti-inflammatory neurotrophic factor.\n\n**How it works:** VIP binds with high nanomolar affinity to VPAC1 and VPAC2 G-protein-coupled receptors, driving intracellular cAMP accumulation, stabilizing pulmonary arterial pressure, suppressing microglial pro-inflammatory cytokines, and restoring circadian rhythm synchronization in the suprachiasmatic nucleus.\n\n**Why researchers study it:** Researched in neuroinflammation, chronic inflammatory response syndrome (CIRS), pulmonary arterial hypertension, and autoimmune central nervous system models.",
    category: "Cognitive & Neuroprotective",
    defaultVialNetMg: 5,
    defaultDiluentMl: 2.5,
    standardDoseDisplay: "50 mcg – 100 mcg SubQ / Nasal",
    standardDoseMcg: 50,
    cadence: "1x–2x Daily (SubQ or Metered Nasal)",
    halfLife: "~2 to 4 Minutes in circulation (Extended local CNS tissue retention)",
    typicalProtocolDuration: "4 to 8 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "nasal"],
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Days 1–7", doseDisplay: "25 mcg Daily", doseMcg: 25, cadence: "1x Daily", focus: "Vascular tone adaptation", notes: "1.25 units (0.0125 mL) at 2.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 2–4", doseDisplay: "50 mcg Daily", doseMcg: 50, cadence: "1x Daily", focus: "VPAC receptor engagement", notes: "2.5 units (0.025 mL)" },
      { stage: "Stage 3: Advanced Optimization", timeframe: "Weeks 5+", doseDisplay: "100 mcg Daily", doseMcg: 100, cadence: "1x Daily", focus: "Neuro-inflammatory resolution", notes: "5.0 units (0.05 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 17296068", notes: "Pozo et al. VIP and PACAP in the immune system: multiple targets for the development of anti-inflammatory therapies." }
    ],
    molecularDetails: { casNumber: "40077-57-4", formula: "C147H238N44O42S", molecularWeightGPerMol: 3325.8 }
  }),

  createProtocol({
    id: "coluracetam",
    compoundName: "Coluracetam (MKC-231)",
    handles: ["coluracetam", "mkc-231"],
    subtitle: "High-Affinity Choline Uptake (HACU) Enhancer Analytical Standard",
    longDescription: "**What it is:** Coluracetam (MKC-231) is a synthetic racetam-class compound distinguished by its unique ability to upregulate the high-affinity choline uptake (HACU) system in cholinergic nerve terminals.\n\n**How it works:** By accelerating rate-limiting choline uptake into presynaptic neurons, Coluracetam boosts acetylcholine synthesis even in neurons with depleted cholinergic function, enhancing hippocampal memory encoding and visual chromatic perception.\n\n**Why researchers study it:** Evaluated in Phase 2 clinical trials for major depressive disorder comorbid with generalized anxiety and models of cholinergic cognitive decline.",
    category: "Cognitive & Neuroprotective",
    defaultVialNetMg: 20,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "10 mg – 20 mg Daily SubQ / Oral",
    standardDoseMcg: 10000,
    cadence: "1x–2x Daily",
    halfLife: "~3 to 5 Hours",
    typicalProtocolDuration: "6 to 8 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"],
    titrationSteps: [
      { stage: "Stage 1: Cholinergic Baseline", timeframe: "Weeks 1–2", doseDisplay: "5 mg Daily", doseMcg: 5000, cadence: "1x Daily", focus: "HACU transporter sensitization", notes: "25.0 units (0.25 mL) at 10.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 3–6", doseDisplay: "10 mg Daily", doseMcg: 10000, cadence: "1x Daily", focus: "Acetylcholine synthesis optimization", notes: "50.0 units (0.50 mL)" },
      { stage: "Stage 3: Advanced Cognitive Cohort", timeframe: "Weeks 7+", doseDisplay: "20 mg Daily", doseMcg: 20000, cadence: "2x Daily (10mg split)", focus: "Peak hippocampal transmission", notes: "100.0 units (1.00 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 18461272", notes: "Bessho et al. Effect of the novel high-affinity choline uptake enhancer MKC-231 on cognitive deficits." }
    ],
    molecularDetails: { casNumber: "135463-81-9", formula: "C19H23N3O3", molecularWeightGPerMol: 341.4 }
  }),

  createProtocol({
    id: "j-147",
    compoundName: "J-147 (Mitochondrial ATP Synthase Ligand)",
    handles: ["j-147", "j147"],
    subtitle: "Neurogenic Curcumin Derivative · Mitochondrial ATP Synthase Modulator",
    longDescription: "**What it is:** J-147 is an exceptionally potent synthetic neurogenic compound derived from curcumin, engineered to overcome the poor systemic stability and blood-brain barrier permeability of natural curcuminoids.\n\n**How it works:** J-147 directly binds to the alpha-F1 subunit of mitochondrial ATP synthase (ATP5A), partially modulating its activity to trigger a controlled mitochondrial signaling cascade that increases intracellular BDNF, stimulates neurogenesis, and protects neurons from oxidative stress.\n\n**Why researchers study it:** Researched in preclinical neurodegenerative models (Alzheimer's, accelerated aging) where it reverses cognitive impairment and restores youthful synaptic gene expression.",
    category: "Cognitive & Neuroprotective",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "5 mg – 10 mg Daily Analytical Window",
    standardDoseMcg: 5000,
    cadence: "1x Daily (Q24H)",
    halfLife: "~6 to 8 Hours",
    typicalProtocolDuration: "8 to 12 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"],
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Weeks 1–2", doseDisplay: "2.5 mg Daily", doseMcg: 2500, cadence: "1x Daily", focus: "Mitochondrial adaptation", notes: "25.0 units (0.25 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 3–8", doseDisplay: "5.0 mg Daily", doseMcg: 5000, cadence: "1x Daily", focus: "BDNF and neurogenic upregulation", notes: "50.0 units (0.50 mL)" },
      { stage: "Stage 3: Advanced Neurogenesis", timeframe: "Weeks 9+", doseDisplay: "10.0 mg Daily", doseMcg: 10000, cadence: "1x Daily", focus: "Synaptic plasticity restoration", notes: "100.0 units (1.00 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 29311689", notes: "Goldberg et al. The mitochondrial ATP synthase is a shared drug target for aging and dementia (Aging Cell 2018)." }
    ],
    molecularDetails: { casNumber: "1146984-77-5", formula: "C18H17F3N2O2", molecularWeightGPerMol: 350.3 }
  }),

  createProtocol({
    id: "idra-21",
    compoundName: "IDRA-21 (AMPA Modulator)",
    handles: ["idra-21", "idra21"],
    subtitle: "Positive Allosteric Modulator of AMPA Receptors · LTP Potentiation",
    longDescription: "**What it is:** IDRA-21 is a synthetic benzothiadiazine derivative that acts as a potent positive allosteric modulator of AMPA (alpha-amino-3-hydroxy-5-methyl-4-isoxazolepropionic acid) glutamatergic receptors.\n\n**How it works:** By binding to AMPA receptors, IDRA-21 selectively inhibits receptor desensitization, prolonging excitatory postsynaptic currents (EPSCs) and dramatically lowering the threshold required to induce Long-Term Potentiation (LTP) in hippocampal circuits.\n\n**Why researchers study it:** Demonstrated to be ~30 times more potent than aniracetam in reversing drug-induced amnesia and accelerating complex cognitive task learning in primates.",
    category: "Cognitive & Neuroprotective",
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "2.5 mg – 5.0 mg Intermittent Analytical Dosing",
    standardDoseMcg: 2500,
    cadence: "Intermittent / Prior to Cognitive Evaluation (2x–3x Weekly)",
    halfLife: "~48 Hours (Exceptionally sustained allosteric modulation)",
    typicalProtocolDuration: "4 to 6 Weeks",
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"],
    titrationSteps: [
      { stage: "Stage 1: Micro-Calibration", timeframe: "Week 1", doseDisplay: "1.0 mg", doseMcg: 1000, cadence: "2x Weekly", focus: "AMPA receptor baseline", notes: "10.0 units (0.10 mL) at 5.0 mg/mL" },
      { stage: "Stage 2: Target Evaluation", timeframe: "Weeks 2–4", doseDisplay: "2.5 mg", doseMcg: 2500, cadence: "2x Weekly", focus: "LTP enhancement", notes: "25.0 units (0.25 mL)" },
      { stage: "Stage 3: Peak Cohort", timeframe: "Weeks 5–6", doseDisplay: "5.0 mg", doseMcg: 5000, cadence: "2x Weekly", focus: "Max synaptic facilitation", notes: "50.0 units (0.50 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 7603459", notes: "Zivkovic et al. 7-Chloro-3-methyl-3,4-dihydro-2H-1,2,4-benzothiadiazine S,S-dioxide (IDRA 21): a potent cognition enhancer (J Pharmacol Exp Ther)." }
    ],
    molecularDetails: { casNumber: "22503-72-6", formula: "C8H9ClN2O2S", molecularWeightGPerMol: 232.7 }
  }),

  createProtocol({
    id: "emoxypine",
    compoundName: "Emoxypine (Mexidol)",
    handles: ["emoxypine", "mexidol", "emoxipine"],
    subtitle: "Succinate-Coupled 3-Hydroxypyridine · GABAergic & Membrane Antioxidant",
    longDescription: "**What it is:** Emoxypine (Mexidol / 2-ethyl-6-methyl-3-hydroxypyridine succinate) is a specialized antioxidant with a structure combining 3-hydroxypyridine and succinic acid, optimizing mitochondrial Krebs cycle efficiency.\n\n**How it works:** Emoxypine increases membrane fluidity in neuronal lipid bilayers, modulates the functional activity of GABA-benzodiazepine receptor complexes, and scavenges reactive oxygen species without interfering with physiological oxidative signaling.\n\n**Why researchers study it:** Extensively studied in neuroprotection, cerebrovascular ischemia, anxiolysis without sedative tolerance, and normalization of microcirculation.",
    category: "Cognitive & Neuroprotective",
    defaultVialNetMg: 50,
    defaultDiluentMl: 2.0,
    standardDoseDisplay: "25 mg – 50 mg Daily SubQ / IM",
    standardDoseMcg: 25000,
    cadence: "1x–2x Daily",
    halfLife: "~4 to 5 Hours",
    typicalProtocolDuration: "4 to 8 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Week 1", doseDisplay: "12.5 mg Daily", doseMcg: 12500, cadence: "1x Daily", focus: "Membrane stabilization", notes: "25.0 units (0.25 mL) at 25.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 2–6", doseDisplay: "25.0 mg Daily", doseMcg: 25000, cadence: "1x Daily", focus: "GABAergic modulation", notes: "50.0 units (0.50 mL)" },
      { stage: "Stage 3: High-Stress Cohort", timeframe: "Weeks 7+", doseDisplay: "50.0 mg Daily", doseMcg: 50000, cadence: "2x Daily (25mg split)", focus: "Maximum neuroprotection", notes: "100.0 units (1.00 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 17147048", notes: "Voronina et al. Mexidol: basic neuropharmacological mechanisms of action (Zh Nevrol Psikhiatr Im S S Korsakova)." }
    ],
    molecularDetails: { casNumber: "127464-43-1", formula: "C8H11NO·C4H6O4", molecularWeightGPerMol: 255.3 }
  }),

  createProtocol({
    id: "pnc-27",
    compoundName: "PNC-27",
    handles: ["pnc-27", "pnc27"],
    subtitle: "Membrane-Active p53-Targeted Peptide (HDM-2 Binding Domain)",
    longDescription: "**What it is:** PNC-27 is an engineered anti-neoplastic research peptide consisting of the p53 amino acid sequence 12–26 (the HDM-2 binding domain) attached at its C-terminus to a transmembrane-penetrating leader sequence.\n\n**How it works:** PNC-27 selectively targets and binds HDM-2 proteins situated within the plasma membranes of transformed cancerous cells, forming trans-membrane oligomeric pores that trigger rapid, non-apoptotic membrane lysis (oncolysis).\n\n**Why researchers study it:** Researched in oncology models for targeted cytotoxicity against solid tumors and leukemias while demonstrating zero membrane-disruptive effects on healthy non-transformed cells.",
    category: "Cognitive & Neuroprotective",
    defaultVialNetMg: 30,
    defaultDiluentMl: 3.0,
    standardDoseDisplay: "5 mg – 10 mg Daily SubQ / Analytical Infusion",
    standardDoseMcg: 10000,
    cadence: "1x Daily (Q24H SubQ)",
    halfLife: "~2 to 3 Hours",
    typicalProtocolDuration: "4 to 6 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Calibration", timeframe: "Days 1–7", doseDisplay: "5.0 mg Daily", doseMcg: 5000, cadence: "1x Daily", focus: "Membrane binding baseline", notes: "25.0 units (0.25 mL) at 10.0 mg/mL" },
      { stage: "Stage 2: Target Evaluation", timeframe: "Weeks 2–4", doseDisplay: "10.0 mg Daily", doseMcg: 10000, cadence: "1x Daily", focus: "HDM-2 pore formation assay", notes: "50.0 units (0.50 mL)" },
      { stage: "Stage 3: Advanced Cohort", timeframe: "Weeks 5–6", doseDisplay: "15.0 mg Daily", doseMcg: 15000, cadence: "1x Daily", focus: "Peak oncolytic observation", notes: "75.0 units (0.75 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 24700779", notes: "Michl et al. PNC-27, a chimeric p53-penetratin peptide, binds to HDM-2 in a cancer-specific manner (Oncotarget)." }
    ],
    molecularDetails: { casNumber: "915087-84-4", molecularWeightGPerMol: 4031.7 }
  }),

  createProtocol({
    id: "neuroxelin",
    compoundName: "Neuroxelin (48 mg)",
    handles: ["neuroxelin", "neuroxelin-48mg"],
    subtitle: "Broad-Spectrum Neurotrophic Polypeptide Complex Standard",
    longDescription: "**What it is:** Neuroxelin is a standardized high-potency peptidic complex containing 48 mg of active neurotrophic fractions, neuropeptides, and low-molecular-weight amino acid conjugates.\n\n**How it works:** Neuroxelin provides coordinated multi-pathway support: stimulating endogenous NGF and BDNF synthesis, stabilizing mitochondrial electron transport in cortical neurons, and accelerating axonal sprouting.\n\n**Why researchers study it:** Researched in comprehensive neurodegenerative and traumatic brain injury models requiring multi-target cognitive restoration.",
    category: "Cognitive & Neuroprotective",
    defaultVialNetMg: 48,
    defaultDiluentMl: 2.4,
    standardDoseDisplay: "1000 mcg – 2000 mcg Daily SubQ",
    standardDoseMcg: 2000,
    cadence: "1x Daily (Q24H SubQ)",
    halfLife: "~3 to 5 Hours",
    typicalProtocolDuration: "6 to 10 Weeks",
    titrationSteps: [
      { stage: "Stage 1: Initiation", timeframe: "Weeks 1–2", doseDisplay: "1000 mcg Daily", doseMcg: 1000, cadence: "1x Daily", focus: "Neurotrophic priming", notes: "5.0 units (0.05 mL) at 20.0 mg/mL" },
      { stage: "Stage 2: Target Maintenance", timeframe: "Weeks 3–6", doseDisplay: "2000 mcg Daily", doseMcg: 2000, cadence: "1x Daily", focus: "Axonal regeneration assay", notes: "10.0 units (0.10 mL)" },
      { stage: "Stage 3: Advanced Repair", timeframe: "Weeks 7+", doseDisplay: "4000 mcg Daily", doseMcg: 4000, cadence: "1x Daily", focus: "Maximum synaptic density", notes: "20.0 units (0.20 mL)" }
    ],
    citations: [
      { sourceReference: "PubMed PMID: 21855845", notes: "Gusev et al. Neuroprotective effects of peptidergic complexes in central nervous system trauma." }
    ],
    molecularDetails: { casNumber: "Peptidic Complex Standard", molarMass: "48 mg Active Peptidic Fraction" }
  })
]

export const COGNITIVE_NEURO_PRODUCTS = [
  createCatalogProduct({
    id: "fgl",
    title: "FGL Peptide (10mg Research Vial)",
    category: "Cognitive & Neuroprotective",
    netContentDisplay: "10MG",
    priceVialOnly: 3200,
    priceVialBac: 3400,
    priceSubqKit: 3520,
    descriptionSummary: "NCAM-mimetic peptide engineered for FGFR-1 activation, synaptogenesis, and memory research."
  }),
  createCatalogProduct({
    id: "vip",
    title: "VIP / Vasoactive Intestinal Peptide (5mg Research Vial)",
    category: "Cognitive & Neuroprotective",
    netContentDisplay: "5MG",
    priceVialOnly: 3600,
    priceVialBac: 3800,
    priceSubqKit: 3920,
    descriptionSummary: "Endogenous 28AA neuropeptide standard targeting VPAC1/2 receptors in neuro-inflammatory models."
  }),
  createCatalogProduct({
    id: "coluracetam",
    title: "Coluracetam (20mg Research Vial)",
    category: "Cognitive & Neuroprotective",
    netContentDisplay: "20MG",
    priceVialOnly: 2600,
    priceVialBac: 2800,
    priceSubqKit: 2920,
    descriptionSummary: "Unique high-affinity choline uptake (HACU) enhancer for cholinergic neurotransmission research."
  }),
  createCatalogProduct({
    id: "j-147",
    title: "J-147 (10mg Research Vial)",
    category: "Cognitive & Neuroprotective",
    netContentDisplay: "10MG",
    priceVialOnly: 3100,
    priceVialBac: 3300,
    priceSubqKit: 3420,
    descriptionSummary: "Neurogenic mitochondrial ATP synthase ligand evaluated for reversing cellular aging markers."
  }),
  createCatalogProduct({
    id: "idra-21",
    title: "IDRA-21 (10mg Research Vial)",
    category: "Cognitive & Neuroprotective",
    netContentDisplay: "10MG",
    priceVialOnly: 2800,
    priceVialBac: 3000,
    priceSubqKit: 3120,
    descriptionSummary: "Positive allosteric modulator of AMPA receptors evaluated for long-term potentiation enhancement."
  }),
  createCatalogProduct({
    id: "emoxypine",
    title: "Emoxypine / Mexidol (50mg Research Vial)",
    category: "Cognitive & Neuroprotective",
    netContentDisplay: "50MG",
    priceVialOnly: 2400,
    priceVialBac: 2600,
    priceSubqKit: 2720,
    descriptionSummary: "Succinate-coupled 3-hydroxypyridine antioxidant evaluated for membrane fluidity and neuroprotection."
  }),
  createCatalogProduct({
    id: "pnc-27",
    title: "PNC-27 (30mg Research Vial)",
    category: "Cognitive & Neuroprotective",
    netContentDisplay: "30MG",
    priceVialOnly: 3800,
    priceVialBac: 4000,
    priceSubqKit: 4120,
    descriptionSummary: "Targeted HDM-2 membrane-binding p53 leader peptide for cancer cell oncolysis research."
  }),
  createCatalogProduct({
    id: "neuroxelin",
    title: "Neuroxelin (48mg Research Vial)",
    category: "Cognitive & Neuroprotective",
    netContentDisplay: "48MG",
    priceVialOnly: 3500,
    priceVialBac: 3700,
    priceSubqKit: 3820,
    descriptionSummary: "Broad-spectrum neurotrophic polypeptide complex standard for comprehensive CNS regeneration models."
  })
]
