import type { CompoundAnalyticalProtocol } from "./types"

export const CATEGORY_4_LONGEVITY_PROTOCOLS: CompoundAnalyticalProtocol[] = [
  {
    "id": "mots-c",
    "compoundName": "MOTS-c",
    "handles": [
      "mots-c",
      "motsc",
      "mitochondrial-peptide"
    ],
    "subtitle": "Mitochondrial-Derived 16-AA Peptide Metabolic Homeostasis & AMPK Activation Standard",
    "longDescription": "**What it is:** MOTS-c (Mitochondrial Open Reading Frame of the 12S rRNA-c) is a groundbreaking 16-amino-acid mitochondrial-derived peptide encoded directly within mitochondrial DNA.\n\n**How it works:** It acts as a powerful cellular exercise mimetic. When cells experience metabolic stress, MOTS-c translocates to the nucleus to regulate gene expression and activates AMPK (AMP-activated protein kinase). This turns on the folate-methionine cycle, stimulates glucose uptake into skeletal muscles without requiring insulin, and shifts cellular metabolism toward fat burning.\n\n**Why researchers study it:** Researched for reversing insulin resistance, combating obesity, increasing physical endurance and stamina, extending cellular lifespan, and preserving muscle metabolism during aging.",
    "category": "Mitochondrial & Cellular Longevity",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "mots-c",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the vial glass wall. MOTS-c dissolves readily into an aqueous state within 45 seconds. Swirl gently horizontally. Avoid shaking.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Maintain strictly refrigerated at 2°C–8°C once dissolved."
    },
    "dosing": {
      "standardDoseDisplay": "5.0 mg – 10.0 mg (2–3x weekly)",
      "standardDoseMcg": 5000,
      "cadence": "2x to 3x Weekly (Fasted SubQ or Intramuscular)",
      "halfLife": "~4 Hours (Triggers durable downstream AMPK phosphorylation and GLUT4 translocation >24h)",
      "typicalProtocolDuration": "4 to 6 Weeks",
      "washoutPeriod": "4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Mitochondrial Influx Loading",
          "timeframe": "Weeks 1–3",
          "doseDisplay": "5.0 mg (3x weekly, e.g., Mon/Wed/Fri)",
          "doseMcg": 5000,
          "cadence": "3x Weekly (Morning Fasted or Pre-Training)",
          "focus": "Rapid AMPK phosphorylation, AICAR-like cellular energy induction, and skeletal muscle glucose uptake",
          "notes": "100.0 units (1.00 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Metabolic Consolidation",
          "timeframe": "Weeks 4–6",
          "doseDisplay": "5.0 mg (2x weekly, e.g., Tue/Fri)",
          "doseMcg": 5000,
          "cadence": "2x Weekly",
          "focus": "Mitochondrial biogenesis, fatty acid beta-oxidation, and metabolic flexibility stabilization",
          "notes": "100.0 units (1.00 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Observation & Washout",
          "timeframe": "Weeks 7–10",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of persistent metabolic rate and insulin sensitivity post-regimen",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "100.0 units (1.00 mL)",
      "graduations": [
        {
          "doseDisplay": "2.50 mg (Half Dose)",
          "doseMcg": 2500,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "5.00 mg (Standard Target)",
          "doseMcg": 5000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 21 days for maximum peptide stability",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "1627580-64-6",
      "pubchemCid": 146675088,
      "sequenceOrFormula": "Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg (MRWQEMGYIFYPRKLR)",
      "molecularWeightGPerMol": 2174.68
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 25738459",
        "notes": "Lee et al. The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis and prevents diet-induced obesity (Cell Metabolism)."
      },
      {
        "sourceReference": "PubMed PMID: 33473109",
        "notes": "Reynolds et al. MOTS-c is an exercise-induced mitochondrial-encoded regulator of age-dependent physical capacity and metabolic homeostasis (Nat Commun)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Natural Exercise Mimetic**: Activates cellular AMPK pathways to deliver the metabolic, fat-burning, and endurance benefits of intense physical exercise.",
      "**Insulin-Independent Glucose Uptake**: Forces muscle cells to take up and burn circulating glucose directly without relying on insulin signaling.",
      "**Reverses Diet-Induced Obesity & Insulin Resistance**: Restores healthy glucose tolerance and insulin sensitivity in metabolic animal models.",
      "**Boosts Physical Capacity & Stamina**: Significantly improves exercise endurance, running capacity, and skeletal muscle power.",
      "**Promotes Mitochondrial Biogenesis**: Encourages the formation of fresh, healthy mitochondria and clears dysfunctional cellular debris.",
      "**Prevents Muscle Aging (Sarcopenia)**: Protects muscle mass and functional strength during aging and sedentary periods."
    ],
    "adverseObservations": [
      "**Localized Injection Stinging or Redness**: Subcutaneous injection can cause mild stinging or local redness lasting 15–30 minutes.",
      "**Temporary Energy Surge or Restlessness**: Can stimulate cellular energy; best administered in the morning rather than before sleep.",
      "**Fasting Interaction**: Works synergistically with fasting or low-carbohydrate states to maximize AMPK activation.",
      "**Reconstitution Care**: Reconstitute gently with Bacteriostatic Water; avoid high-speed vortexing to protect the peptide chain."
    ]
  },
  {
    "id": "ss-31",
    "compoundName": "SS-31",
    "handles": [
      "ss-31",
      "ss31",
      "elamipretide",
      "bendavia"
    ],
    "subtitle": "Cardiolipin-Targeting Mitochondrial Inner Membrane Restorative Tetra-Peptide Standard",
    "longDescription": "**What it is:** SS-31 (also known as Elamipretide) is a synthetic tetrapeptide (D-Arg-Dmt-Lys-Phe-NH2) engineered specifically to target and repair the inner membrane of mitochondria.\n\n**How it works:** SS-31 selectively penetrates cell membranes and binds with high affinity to cardiolipin, a unique phospholipid found exclusively on the inner mitochondrial membrane. In aging or damaged cells, oxidized cardiolipin causes the mitochondrial cristae to collapse and leak free radicals. SS-31 restores cardiolipin structure, stabilizes the electron transport chain, boosts ATP energy production, and halts toxic ROS generation.\n\n**Why researchers study it:** Researched for heart failure, mitochondrial myopathy, acute kidney injury, macular degeneration, cognitive decline, and restoring youthful energy production to aging organs.",
    "category": "Mitochondrial & Cellular Longevity",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "ss-31",
    "reconstitution": {
      "defaultVialNetMg": 50,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Swirl gently horizontally for 45 seconds until powder dissolves completely. Do not shake.",
      "resultingConcentrationMgPerMl": 20,
      "handlingRule": "Clear, colorless aqueous solution. Protect strictly from direct sunlight."
    },
    "dosing": {
      "standardDoseDisplay": "4.0 mg – 10.0 mg daily",
      "standardDoseMcg": 4000,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "~2–4 Hours (Selectively concentrates in inner mitochondrial membrane bound to cardiolipin)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "4 Weeks between cohorts",
      "titrationSteps": [
        {
          "stage": "Phase 1: Inner Membrane Cardiolipin Binding",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "4.0 mg daily (4000 mcg)",
          "doseMcg": 4000,
          "cadence": "1x Daily",
          "focus": "Selective electrostatic binding to cardiolipin, optimizing electron transport chain complexes I, III, and IV",
          "notes": "20.0 units (0.20 mL) on U-100 syringe at 20.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Mitochondrial ATP Synthesis Restoration",
          "timeframe": "Weeks 3–6",
          "doseDisplay": "5.0 mg – 10.0 mg daily",
          "doseMcg": 5000,
          "cadence": "1x Daily",
          "focus": "Mitochondrial reactive oxygen species (ROS) reduction and cellular ATP production rescue in ischemic tissues",
          "notes": "25.0 units (0.25 mL) on U-100 syringe (or 50.0 units for 10 mg)"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of persistent cristae curvature and mitochondrial bioenergetics",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "20.0 units (0.20 mL)",
      "graduations": [
        {
          "doseDisplay": "2.00 mg (Micro Initiation)",
          "doseMcg": 2000,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "4.00 mg (Standard Target)",
          "doseMcg": 4000,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "10.00 mg (High Output Target)",
          "doseMcg": 10000,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "736992-21-5",
      "pubchemCid": 11764719,
      "sequenceOrFormula": "D-Arg-Dmt-Lys-Phe-NH2 (where Dmt is 2',6'-dimethyltyrosine)",
      "molecularWeightGPerMol": 639.8
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 24117165",
        "notes": "Birk et al. First-in-class cardiolipin-protective compound as a therapeutic agent to restore mitochondrial bioenergetics (Br J Pharmacol)."
      },
      {
        "sourceReference": "PubMed PMID: 35913044",
        "notes": "Szeto et al. Structure-activity relationships of mitochondria-targeted tetrapeptide pharmacological compounds (J Med Chem)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Direct Inner Mitochondrial Repair**: Binds to cardiolipin to physically restore the inner mitochondrial membrane architecture and cristae folding.",
      "**Dramatically Increases ATP Cellular Energy**: Restores optimal electron flow through Complexes I-IV, significantly increasing ATP production in tired cells.",
      "**Halts Destructive Free Radical (ROS) Leakage**: Reduces intracellular oxidative stress at its root origin without blunting necessary physiological signaling.",
      "**Protects Heart Muscle & Reverses Heart Failure**: Improves cardiac pumping capacity, reduces left ventricular stiffness, and protects against ischemic injury.",
      "**Kidney & Organ Protection**: Shields renal tubular cells from ischemic damage and toxic drug exposure.",
      "**Restores Skeletal Muscle Endurance**: Reverses age-related muscle fatigue and restores youthful mitochondrial stamina."
    ],
    "adverseObservations": [
      "**Injection Site Sensitivity**: Mild redness, itching, or a small subcutaneous bump at the injection point.",
      "**High Cost & Dosing Requirements**: Effective research models often utilize higher milligram amounts compared to standard pituitary peptides.",
      "**Storage Standards**: Keep reconstituted vials strictly refrigerated at 2°C–8°C away from UV exposure."
    ]
  },
  {
    "id": "epithalon",
    "compoundName": "Epithalon",
    "handles": [
      "epithalon",
      "epitalon",
      "telomerase-peptide"
    ],
    "subtitle": "Synthetic Pineal Tetrapeptide (Ala-Glu-Asp-Gly) Telomerase & Chromatin Standard",
    "longDescription": "**What it is:** Epithalon (also spelled Epitalon) is a synthetic tetrapeptide (Ala-Glu-Asp-Gly) based on epithalamin, a natural peptide extract of the pineal gland discovered by Russian biogerontologist Prof. Vladimir Khavinson.\n\n**How it works:** It acts on the pineal gland to restore natural melatonin secretion rhythms, while uniquely activating the telomerase enzyme. By stimulating telomerase, Epithalon extends the protective telomeres at the ends of chromosomes, allowing aging cells to exceed the traditional Hayflick division limit and repair themselves for longer.\n\n**Why researchers study it:** Studied worldwide for lifespan extension, telomere lengthening, resetting circadian sleep rhythms, antioxidant enzyme upregulation, cancer prevention, and restoring endocrine balance in aging models.",
    "category": "Mitochondrial & Cellular Longevity",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "epithalon",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the glass wall. Epithalon dissolves spontaneously in seconds. Swirl gently horizontally for 30 seconds. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store protected from direct light."
    },
    "dosing": {
      "standardDoseDisplay": "5.0 mg – 10.0 mg daily (in cyclical 10–20 day blocks)",
      "standardDoseMcg": 5000,
      "cadence": "1x Daily (Morning or Pre-Bed SubQ)",
      "halfLife": "~2–3 Hours (Direct epigenetic chromatin remodeling and telomerase reverse transcriptase activation)",
      "typicalProtocolDuration": "10 to 20 Days (Khavinson Classical Longevity Block)",
      "washoutPeriod": "4 to 6 Months between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Epigenetic Induction & Pineal Activation",
          "timeframe": "Days 1–5",
          "doseDisplay": "5.0 mg daily (5000 mcg)",
          "doseMcg": 5000,
          "cadence": "1x Daily",
          "focus": "Activation of telomerase reverse transcriptase (hTERT) gene expression and pineal melatonin synthesis restoration",
          "notes": "100.0 units (1.00 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Cellular Rejuvenation Block",
          "timeframe": "Days 6–20",
          "doseDisplay": "5.0 mg – 10.0 mg daily",
          "doseMcg": 5000,
          "cadence": "1x Daily",
          "focus": "Overcoming the Hayflick limit in senescent fibroblasts, telomeric repeat addition, and neuroendocrine reset",
          "notes": "100.0 units (1.00 mL) once or twice daily"
        },
        {
          "stage": "Phase 3: Extended Washout & Maintenance",
          "timeframe": "Month 2–6",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of persistent circadian rhythm regularity and biological clock stabilization",
          "notes": "Classical protocol repeats only 1–2 times per calendar year"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "100.0 units (1.00 mL)",
      "graduations": [
        {
          "doseDisplay": "2.50 mg (Micro Dose)",
          "doseMcg": 2500,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "5.00 mg (Standard Target)",
          "doseMcg": 5000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "307297-39-8",
      "pubchemCid": 219042,
      "sequenceOrFormula": "Ala-Glu-Asp-Gly (AEDG)",
      "molecularWeightGPerMol": 390.35
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 12937682",
        "notes": "Khavinson et al. Epithalon peptide induces telomerase activity and telomere elongation in human somatic cells (Bulletin of Experimental Biology and Medicine)."
      },
      {
        "sourceReference": "PubMed PMID: 14501183",
        "notes": "Anisimov et al. Effect of Epitalon on biomarkers of aging, life span and spontaneous tumor incidence in mice."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Telomerase Activation & Telomere Lengthening**: Upregulates the telomerase enzyme to elongate chromosomal telomeres, supporting cellular longevity.",
      "**Pineal Gland & Melatonin Rhythm Restoration**: Restores natural, youthful nocturnal melatonin production, dramatically improving sleep architecture.",
      "**Antioxidant Defense System Upregulation**: Significantly increases the body's natural production of Superoxide Dismutase (SOD) and Glutathione Peroxidase.",
      "**Lifespan Extension in Animal Models**: Multiple peer-reviewed studies show a 20–30% increase in mean lifespan and reduced spontaneous tumor rates in rodents.",
      "**Normalizes Endocrine & Immune Function**: Rebalances hormone secretion, improves insulin sensitivity, and restores T-cell immune markers in older subjects."
    ],
    "adverseObservations": [
      "**Vivid Dreams & Sleep Changes**: Deep melatonin activation frequently leads to intensely vivid or memorable dreams during research cycles.",
      "**Dosing Protocol Structure**: Typically researched in short, intensive 10-to-20 day blocks twice yearly, rather than continuous daily administration.",
      "**High Tolerability**: Decades of clinical and preclinical research demonstrate an exceptional safety profile with minimal reported adverse effects."
    ]
  },
  {
    "id": "foxo4-dri",
    "compoundName": "FOXO4-DRI",
    "handles": [
      "foxo4-dri",
      "foxo4",
      "senolytic-peptide"
    ],
    "subtitle": "D-Retro-Inverso Peptide Disruptor of FOXO4-p53 Interaction Senolytic Standard",
    "longDescription": "**What it is:** FOXO4-DRI is a retro-inverso D-amino acid peptide engineered to selectively destroy senescent 'zombie' cells—aging cells that refuse to die and continually pump out toxic inflammatory chemicals.\n\n**How it works:** Senescent cells survive by using the FOXO4 protein to bind and sequester p53, the cell's natural self-destruction switch. FOXO4-DRI acts as a molecular decoy that competitively disrupts this FOXO4-p53 interaction. Once freed, p53 moves to the mitochondria, triggering targeted apoptosis (programmed cell death) exclusively in senescent cells while leaving healthy normal cells untouched.\n\n**Why researchers study it:** Studied for clearing senescent cells, restoring youthful organ function, improving fur/hair density, reversing frailty in aging models, and reducing systemic chronic inflammation.",
    "category": "Mitochondrial & Cellular Longevity",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "foxo4-dri",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl in horizontal circular motions for 60 seconds until dissolved completely. Do not vortex.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Highly sensitive to repeated freeze-thaw cycles."
    },
    "dosing": {
      "standardDoseDisplay": "2.5 mg – 5.0 mg (3x weekly for 3 weeks)",
      "standardDoseMcg": 2500,
      "cadence": "3x Weekly (e.g., Mon / Wed / Fri SubQ)",
      "halfLife": "~24–36 Hours (Retro-inverso D-amino acid backbone confers high protease resistance)",
      "typicalProtocolDuration": "3 Weeks (Pulsed Senolytic Clearance Block)",
      "washoutPeriod": "3 to 6 Months between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Senolytic Induction",
          "timeframe": "Week 1",
          "doseDisplay": "2.5 mg (3x weekly)",
          "doseMcg": 2500,
          "cadence": "3x Weekly (Mon / Wed / Fri)",
          "focus": "Disruption of FOXO4-p53 nuclear complex in senescent cells; exclusion of p53 to mitochondria for apoptosis",
          "notes": "50.0 units (0.50 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Senescent Cell Apoptosis",
          "timeframe": "Weeks 2–3",
          "doseDisplay": "2.5 mg – 5.0 mg (3x weekly)",
          "doseMcg": 2500,
          "cadence": "3x Weekly",
          "focus": "Targeted clearance of p16INK4a-positive senescent cells and reduction of Senescence-Associated Secretory Phenotype (SASP)",
          "notes": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Tissue Regeneration Washout",
          "timeframe": "Month 2–6",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Stem cell niche mobilization and organ functional recovery observation post-senescent clearance",
          "notes": "Mandatory extended washout window"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "50.0 units (0.50 mL)",
      "graduations": [
        {
          "doseDisplay": "2.50 mg (Standard Dose)",
          "doseMcg": 2500,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "5.00 mg (Full Dose)",
          "doseMcg": 5000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 21 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "2095504-20-4",
      "pubchemCid": 167312269,
      "sequenceOrFormula": "D-amino acid retro-inverso sequence of FOXO4 segment",
      "molecularWeightGPerMol": 5358.12
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 28340339",
        "notes": "Baar et al. Targeted Apoptosis of Senescent Cells Restores Tissue Homeostasis in Response to Chemotoxicity and Aging (Cell)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Targeted Senolytic Clearance**: Selectively triggers apoptosis in damaged, senescent cells while leaving healthy, active cells unharmed.",
      "**Stops the Toxic SASP Secretion**: Halts the chronic output of inflammatory cytokines (IL-6, TNF-alpha) that degrade surrounding healthy tissue.",
      "**Reverses Age-Related Frailty & Exhaustion**: Restores physical stamina, running endurance, and muscle coordination in aged animal models.",
      "**Rejuvenates Hair Follicles & Skin**: Documented in landmark studies to restore hair density and reverse hair graying in prematurely aged mice.",
      "**Restores Kidney & Organ Function**: Clears senescent burden in kidneys, liver, and lungs, improving organ filtration and tissue elasticity."
    ],
    "adverseObservations": [
      "**Transient Fatigue & Detox Sensation**: Rapid clearance of senescent cells can temporarily release cellular debris, causing mild fatigue for 24–48 hours.",
      "**Strict Pulse Dosing Required**: Researched strictly in brief pulse cycles (e.g. 3–5 doses over 1–2 weeks) with multi-month rest periods, never continuously.",
      "**High Molecular Mass & Fragility**: Large, complex retro-inverso peptide requiring delicate reconstitution and cold storage at -20°C until use."
    ]
  },
  {
    "id": "humanin",
    "compoundName": "Humanin",
    "handles": [
      "humanin",
      "hn-peptide",
      "mitochondrial-cytoprotection"
    ],
    "subtitle": "Mitochondrial 24-Amino Acid Cytoprotective Anti-Apoptotic Peptide Standard",
    "longDescription": "**What it is:** Humanin is a 24-amino-acid peptide encoded within the 16S ribosomal RNA region of mitochondrial DNA, originally discovered while screening for genes that protect brain cells from Alzheimer's disease.\n\n**How it works:** Humanin functions as a cytoprotective shield. It binds to the pro-apoptotic protein Bax, preventing it from puncturing mitochondrial membranes and stopping premature cell death. Furthermore, it activates the STAT3 signaling pathway, suppressing neuroinflammation and enhancing cellular survival in response to oxidative and toxic insults.\n\n**Why researchers study it:** Studied for neuroprotection against Alzheimer's and Parkinson's, cardiovascular endothelial defense, preserving insulin sensitivity, and protecting germ cells and organ tissues.",
    "category": "Mitochondrial & Cellular Longevity",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "humanin",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 45 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store protected from direct sunlight."
    },
    "dosing": {
      "standardDoseDisplay": "1.0 mg – 2.0 mg daily",
      "standardDoseMcg": 1000,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "~2–4 Hours (Acts extracellularly on GP130/WSX-1/CNTFR receptors and intracellularly via Bax binding)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "1.0 mg daily (1000 mcg)",
          "doseMcg": 1000,
          "cadence": "1x Daily",
          "focus": "Bax sequestration, mitochondrial outer membrane permeabilization (MOMP) inhibition, and cell survival promotion",
          "notes": "20.0 units (0.20 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Cytoprotection",
          "timeframe": "Weeks 3–6",
          "doseDisplay": "1.5 mg – 2.0 mg daily",
          "doseMcg": 2000,
          "cadence": "1x Daily",
          "focus": "Neuroprotection against amyloid-beta toxicity, endothelial apoptosis reduction, and systemic insulin sensitization",
          "notes": "40.0 units (0.40 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of sustained cellular stress resilience post-stimulation",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "20.0 units (0.20 mL)",
      "graduations": [
        {
          "doseDisplay": "1.00 mg (Standard Target)",
          "doseMcg": 1000,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2.00 mg (High Output Target)",
          "doseMcg": 2000,
          "volumeMl": 0.4,
          "syringeIU": 40,
          "tickLabel": "40.0 units (0.40 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "330936-69-1",
      "pubchemCid": 16131438,
      "sequenceOrFormula": "Met-Ala-Pro-Arg-Gly-Phe-Ser-Cys-Leu-Leu-Leu-Leu-Thr-Ser-Glu-Ile-Asp-Leu-Pro-Val-Lys-Arg-Arg-Ala",
      "molecularWeightGPerMol": 2687.27
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 11371646",
        "notes": "Hashimoto et al. A rescue factor abolishing neuronal cell death by a wide spectrum of familial Alzheimer's disease genes (PNAS)."
      },
      {
        "sourceReference": "PubMed PMID: 27070352",
        "notes": "Cohen et al. Naturally occurring mitochondrial-derived peptides are age-dependent regulators of metabolism."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Potent Neuroprotection**: Shields neurons against amyloid-beta toxicity, excitotoxicity, and ischemic stroke damage in brain models.",
      "**Binds and Inhibits Bax (Prevents Apoptosis)**: Blocks Bax translocation to preserve mitochondrial integrity and prevent premature cell suicide.",
      "**Vascular Endothelial Shield**: Prevents atherosclerosis and protects blood vessel walls from oxidative and inflammatory damage.",
      "**Improves Metabolic Insulin Sensitivity**: Lowers fasting blood glucose and enhances systemic glucose disposal in metabolic research.",
      "**Preserves Cellular Viability in Aging Organs**: Protects retina, testes, heart, and kidney cells from toxic environmental stress."
    ],
    "adverseObservations": [
      "**Mild Injection Site Reaction**: Minor, transient erythema at the subcutaneous injection point.",
      "**Reconstitution Care**: Fragile mitochondrial peptide; dissolve gently in Bacteriostatic Water without vigorous shaking.",
      "**Storage Standard**: Store reconstituted peptide at 2°C–8°C shielded from light."
    ]
  },
  {
    "id": "nad-plus",
    "compoundName": "NAD+",
    "handles": [
      "nad-plus",
      "nad",
      "nicotinamide-adenine-dinucleotide"
    ],
    "subtitle": "High-Concentration Beta-Nicotinamide Adenine Dinucleotide Redox Standard",
    "longDescription": "**What it is:** NAD+ (Nicotinamide Adenine Dinucleotide) is a critical coenzyme found in every single living cell, essential for cellular respiration, ATP energy generation, and DNA repair.\n\n**How it works:** NAD+ serves two major roles: it acts as an electron carrier in the Krebs cycle to generate ATP energy, and it serves as the essential substrate consumed by SIRT1-7 longevity enzymes and PARP-1 DNA repair enzymes. Because NAD+ levels drop by over 50% between youth and middle age, replenishing cellular NAD+ reactivates youthful cellular cleanup and genomic repair.\n\n**Why researchers study it:** Studied for anti-aging, mental clarity and focus, cellular energy restoration, reversing chronic fatigue, DNA repair, addiction recovery, and mitochondrial rejuvenation.",
    "category": "Mitochondrial & Cellular Longevity",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "nad-plus-500mg",
    "reconstitution": {
      "defaultVialNetMg": 500,
      "defaultDiluentMl": 5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 5.0 mL diluent slowly into the 500 mg powder. Swirl gently horizontally for 60 seconds until dissolved into a transparent, water-clear solution. Do not vortex.",
      "resultingConcentrationMgPerMl": 100,
      "handlingRule": "Clear, colorless aqueous solution. Keep strictly refrigerated once reconstituted; sensitive to thermal degradation."
    },
    "dosing": {
      "standardDoseDisplay": "50 mg – 100 mg (2–3x weekly)",
      "standardDoseMcg": 50000,
      "cadence": "2x to 3x Weekly (SubQ or Slow Intramuscular)",
      "halfLife": "~1–2 Hours (Rapid cellular uptake; intracellular NAD+/NADH pool elevation persists 24–48h)",
      "typicalProtocolDuration": "6 to 10 Weeks",
      "washoutPeriod": "3 to 4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Micro-Infusion Calibration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "25 mg – 50 mg (2x weekly)",
          "doseMcg": 25000,
          "cadence": "2x Weekly (SubQ)",
          "focus": "Cellular sirtuin (SIRT1–SIRT7) substrate replenishment and PARP-1 DNA repair enzyme activation",
          "notes": "25.0 units (0.25 mL) on U-100 syringe at 100.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Redox Replenishment",
          "timeframe": "Weeks 3–8",
          "doseDisplay": "50 mg – 100 mg (2x to 3x weekly)",
          "doseMcg": 50000,
          "cadence": "2x to 3x Weekly",
          "focus": "Restoration of mitochondrial oxidative phosphorylation, ATP generation, and systemic cognitive vigor",
          "notes": "50.0 units (0.50 mL) on U-100 syringe (or 100.0 units for 100 mg)"
        },
        {
          "stage": "Phase 3: Observation & Washout",
          "timeframe": "Weeks 9–10",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of endogenous NAD+ salvage pathway equilibrium",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "50.0 units (0.50 mL)",
      "graduations": [
        {
          "doseDisplay": "25 mg (Initiation)",
          "doseMcg": 25000,
          "volumeMl": 0.25,
          "syringeIU": 25,
          "tickLabel": "25.0 units (0.25 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "50 mg (Standard Target)",
          "doseMcg": 50000,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "100 mg (High Output Target)",
          "doseMcg": 100000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 21 days for maximum biochemical potency",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "53-84-9",
      "pubchemCid": 5892,
      "sequenceOrFormula": "C21H27N7O14P2",
      "molecularWeightGPerMol": 663.43
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 29514064",
        "notes": "Rajman et al. Therapeutic Potential of NAD-Boosting Molecules: The In Vivo Evidence (Cell Metabolism)."
      },
      {
        "sourceReference": "PubMed PMID: 29249689",
        "notes": "Yoshino et al. NAD+ Intermediates: The Biology and Therapeutic Potential of NMN and NR (Cell Metabolism)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Powers Cellular ATP Production**: Directly fuels mitochondrial oxidative phosphorylation, restoring youthful physical and mental energy.",
      "**Activates Sirtuin Longevity Enzymes**: Provides the essential fuel for SIRT1 and SIRT3 enzymes that regulate gene silencing, autophagy, and lifespan.",
      "**Drives PARP-1 Genomic DNA Repair**: Essential substrate for PARP enzymes to detect and repair single-strand DNA breaks throughout the genome.",
      "**Enhances Cognitive Function & Neuroplasticity**: Protects brain cells against oxidative stress, clears brain fog, and improves mental sharpness.",
      "**Promotes Cellular Detoxification & Autophagy**: Helps cells clear misfolded proteins and damaged mitochondrial components."
    ],
    "adverseObservations": [
      "**Transient Chest Tightness or Flushing**: Rapid administration can cause temporary chest warmth, shortness of breath, or stomach cramping due to rapid cellular uptake.",
      "**Administer Slowly**: Subcutaneous injections must be administered very slowly (over 30–60 seconds) or split into micro-doses to avoid discomfort.",
      "**Headache or Nausea**: High initial doses can trigger transient headaches; starting at low doses (25–50 mg) and titrating up is standard practice.",
      "**High Powder Volume**: Reconstituting high-milligram vials (500mg) requires sufficient diluent volume (2–3 mL) to ensure full dissolution."
    ]
  },
  {
    "id": "glutathione-reduced",
    "compoundName": "Glutathione",
    "handles": [
      "glutathione",
      "gsh",
      "reduced-glutathione"
    ],
    "subtitle": "Tripeptide (gamma-L-Glutamyl-L-Cysteinylglycine) Intracellular Antioxidant Standard",
    "longDescription": "**What it is:** Glutathione (GSH) is a natural tripeptide composed of Glutamine, Cysteine, and Glycine, recognized as the body's 'Master Antioxidant' and primary hepatic detoxifier.\n\n**How it works:** Glutathione neutralizes free radicals, reactive oxygen species, and heavy metals by directly donating electrons via its active sulfhydryl (-SH) group. In the liver, it binds to toxic compounds via glutathione S-transferase enzymes, converting them into water-soluble forms for safe excretion. It also regenerates other vital antioxidants like Vitamin C and Vitamin E back into their active forms.\n\n**Why researchers study it:** Researched for liver detoxification, reversing oxidative stress, skin brightening and melanin inhibition, immune system enhancement, and protecting cellular DNA from environmental pollutants.",
    "category": "Mitochondrial & Cellular Longevity",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "glutathione-1500mg",
    "reconstitution": {
      "defaultVialNetMg": 600,
      "defaultDiluentMl": 3,
      "solvent": "Bacteriostatic Water USP or Sterile Saline 0.9%",
      "dissolutionMethod": "Introduce 3.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 45 seconds until powder dissolves into a transparent aqueous state. Do not shake violently.",
      "resultingConcentrationMgPerMl": 200,
      "handlingRule": "Clear, colorless aqueous solution. Maintain strictly refrigerated once reconstituted."
    },
    "dosing": {
      "standardDoseDisplay": "100 mg – 200 mg (1–2x weekly)",
      "standardDoseMcg": 100000,
      "cadence": "1x to 2x Weekly (SubQ or Slow Intramuscular)",
      "halfLife": "~10–15 Minutes (Rapid intracellular sequestration; tissue protective effects persist for several days)",
      "typicalProtocolDuration": "6 to 12 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initial Calibration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "100 mg weekly (100,000 mcg)",
          "doseMcg": 100000,
          "cadence": "1x Weekly",
          "focus": "Hepatic phase II conjugation upregulation, intracellular reactive electrophile neutralization, and GSH/GSSG ratio recovery",
          "notes": "50.0 units (0.50 mL) on U-100 syringe at 200.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Antioxidant Support",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "100 mg – 200 mg twice weekly",
          "doseMcg": 100000,
          "cadence": "2x Weekly (e.g., Mon / Thu)",
          "focus": "Mitochondrial lipid peroxidation suppression and cellular detox pathway optimization",
          "notes": "50.0 units (0.50 mL) on U-100 syringe per administration"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 11–12",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Endogenous glutathione peroxidase (GPx) and reductase equilibrium observation",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "50.0 units (0.50 mL)",
      "graduations": [
        {
          "doseDisplay": "50 mg (Micro Target)",
          "doseMcg": 50000,
          "volumeMl": 0.25,
          "syringeIU": 25,
          "tickLabel": "25.0 units (0.25 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "100 mg (Standard Target)",
          "doseMcg": 100000,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "200 mg (High Output Target)",
          "doseMcg": 200000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 21 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "70-18-8",
      "pubchemCid": 124886,
      "sequenceOrFormula": "gamma-Glu-Cys-Gly (C10H17N3O6S)",
      "molecularWeightGPerMol": 307.32
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 14988435",
        "notes": "Wu et al. Glutathione metabolism and its implications for health (Journal of Nutrition)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**The Body's Master Antioxidant**: Directly neutralizes destructive reactive oxygen and nitrogen free radicals throughout every organ system.",
      "**Phase II Liver Detoxification**: Binds to toxins, heavy metals, alcohol metabolites, and medications to safely clear them via bile and urine.",
      "**Skin Tone Rejuvenation & Melanin Regulation**: Inhibits the tyrosinase enzyme and shifts melanin synthesis from dark eumelanin to light pheomelanin.",
      "**Bolsters Immune Cell Function**: Essential for the proliferation, activation, and cytokine output of T-cells and Natural Killer (NK) cells.",
      "**Recycles Other Essential Antioxidants**: Continuously re-reduces oxidized Vitamin C, Vitamin E, and CoQ10 back to their active antioxidant states.",
      "**Protects Mitochondrial DNA**: Shields fragile mitochondrial genomes from oxidative damage during intensive ATP energy production."
    ],
    "adverseObservations": [
      "**Sulfur Aroma / Odor**: Possesses a distinct, characteristic sulfur smell; this is entirely normal and confirms the presence of active thiol groups.",
      "**Mild Gastrointestinal Cramping**: High doses can occasionally cause mild stomach cramping or loose stools.",
      "**Localized Injection Discomfort**: Subcutaneous injection of high concentrations can cause mild, temporary stinging.",
      "**Rapid Oxidation in Liquid**: Reconstituted glutathione oxidizes quickly if exposed to air; use within 14–21 days and keep tightly sealed at 2°C–8°C."
    ]
  }
]
