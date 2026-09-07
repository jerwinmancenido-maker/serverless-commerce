import type { CompoundAnalyticalProtocol } from "./types"

export const CATEGORY_5_NEURO_PROTOCOLS: CompoundAnalyticalProtocol[] = [
  {
    "id": "semax",
    "compoundName": "Semax",
    "handles": [
      "semax",
      "semax-peptide",
      "acth-fragment"
    ],
    "subtitle": "Heptapeptide (Met-Glu-His-Phe-Pro-Gly-Pro) ACTH 4-10 Neurotrophic Standard",
    "longDescription": "**What it is:** Semax is a synthetic heptapeptide (Met-Glu-His-Phe-Pro-Gly-Pro) derived from a natural fragment of adrenocorticotropic hormone (ACTH 4-10) combined with a tripeptide stabilizer.\n\n**How it works:** Semax acts on the central nervous system without producing any hormonal or steroid side effects. It dramatically boosts the expression of BDNF (Brain-Derived Neurotrophic Factor) and its TrkB receptor in the hippocampus, activates dopaminergic and serotonergic neurotransmission, and shields brain cells from glutamate excitotoxicity and oxygen deprivation.\n\n**Why researchers study it:** Studied for cognitive enhancement, memory formation, rapid focus and mental processing, ischemic stroke recovery, ADHD research, and protecting the brain from stress and exhaustion.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "semax",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP or Deionized Saline (Intranasal/SubQ)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the vial glass wall. Swirl gently horizontally for 30 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Keep refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "250 mcg – 500 mcg daily",
      "standardDoseMcg": 250,
      "cadence": "1x to 2x Daily (Morning / Midday SubQ or Intranasal)",
      "halfLife": "~30–60 Minutes (Rapid plasma clearance; induces persistent TrkB receptor & BDNF expression >24h)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "2 to 4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Baseline Nootropic Calibration",
          "timeframe": "Days 1–7",
          "doseDisplay": "250 mcg daily",
          "doseMcg": 250,
          "cadence": "1x Daily (Morning)",
          "focus": "Upregulation of BDNF, TrkB, and NGF mRNA expression in hippocampus and frontal cortex",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Cognitive Consolidation",
          "timeframe": "Weeks 2–6",
          "doseDisplay": "250 mcg – 500 mcg daily",
          "doseMcg": 500,
          "cadence": "1x Daily or 250 mcg Twice Daily",
          "focus": "Cerebral blood flow optimization, dopamine/serotonin turnover enhancement, and synaptic plasticity",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of persistent memory retention and working recall post-stimulation",
          "notes": "2–4 week cessation window"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "100 mcg (Micro Initiation)",
          "doseMcg": 100,
          "volumeMl": 0.02,
          "syringeIU": 2,
          "tickLabel": "2.0 units (0.02 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "250 mcg (Standard Target)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Intensive Focus Target)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "80714-61-0",
      "pubchemCid": 9811102,
      "sequenceOrFormula": "Met-Glu-His-Phe-Pro-Gly-Pro (MEHFPGP)",
      "molecularWeightGPerMol": 813.92
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 16996037",
        "notes": "Grivennikov et al. Semax, an analog of ACTH(4-10) with cognitive effects, regulates BDNF and trkB expression in the rat hippocampus."
      },
      {
        "sourceReference": "PubMed PMID: 28255762",
        "notes": "Medvedeva et al. Semax, an analog of ACTH((4-7)), regulates expression of immune-response genes in ischemic rat brain."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Dramatically Elevates BDNF Levels**: Increases Brain-Derived Neurotrophic Factor by up to 800% in hippocampal tissue, spurring fresh neural connections.",
      "**Sharper Focus & Information Processing**: Improves attention span, executive function, and working memory during complex mental tasks.",
      "**Neuroprotection Against Hypoxia & Stroke**: Widely approved and researched in Eastern Europe for acute ischemic stroke rehabilitation and brain injury.",
      "**Enhances Dopaminergic & Serotonergic Tone**: Optimizes motivation, mental drive, and positive mood without causing stimulant crashes.",
      "**Shields Brain Cells from Excitotoxicity**: Protects delicate synapses from excess glutamate and oxidative neurotoxicity."
    ],
    "adverseObservations": [
      "**Mild Over-Stimulation / Jitteriness**: Doses taken too late in the evening may cause mild restlessness or delayed sleep onset.",
      "**Transient Hair Shedding Warning**: High BDNF elevation can rarely cause temporary hair shedding (telogen effluvium) in predisposed subjects; cycling is advised.",
      "**Mild Nasal Irritation**: When researched as a nasal spray, can occasionally cause brief tickling or dry nasal passages.",
      "**Cold Chain Sensitivity**: Keep reconstituted solution refrigerated at 2°C–8°C to maintain peptide integrity."
    ]
  },
  {
    "id": "na-semax-amidate",
    "compoundName": "N-Acetyl Semax Amidate",
    "handles": [
      "na-semax-amidate",
      "nasa-peptide",
      "na-semax"
    ],
    "subtitle": "Acetylated & Amidated High-Stability Semax Analogue Standard",
    "longDescription": "**What it is:** N-Acetyl Semax Amidate (NA-Semax-A) is an advanced modified version of Semax, featuring an N-terminal acetyl group and a C-terminal amide group.\n\n**How it works:** These dual molecular modifications protect the peptide from degradation by aminopeptidases and carboxypeptidases in the bloodstream. This dramatically increases its biological half-life, enhances blood-brain barrier permeability, and delivers deeper, more sustained BDNF upregulation at lower micro-dose amounts compared to standard Semax.\n\n**Why researchers study it:** Researched for extended cognitive focus, long-lasting mental stamina, neuroplasticity, memory retention, and combating mental fatigue with lower dosage requirements.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "na-semax-amidate",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 30 seconds. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Enhanced resistance to plasma aminopeptidases."
    },
    "dosing": {
      "standardDoseDisplay": "200 mcg – 400 mcg daily",
      "standardDoseMcg": 200,
      "cadence": "1x Daily (Morning SubQ or Intranasal)",
      "halfLife": "~2–4 Hours (Significantly extended enzymatic stability compared to native Semax)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "2 to 4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Days 1–7",
          "doseDisplay": "200 mcg daily",
          "doseMcg": 200,
          "cadence": "1x Daily (Morning)",
          "focus": "Enhanced blood-brain barrier transport, sustained TrkB binding, and focus calibration",
          "notes": "4.0 units (0.04 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Cognitive Enhancement",
          "timeframe": "Weeks 2–6",
          "doseDisplay": "300 mcg – 400 mcg daily",
          "doseMcg": 300,
          "cadence": "1x Daily",
          "focus": "Peak executive processing, vigilance, and microvascular neuroprotection",
          "notes": "6.0 units (0.06 mL) on U-100 syringe (or 8.0 units for 400 mcg)"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Neurotransmitter homeostasis observation",
          "notes": "2–4 week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "4.0 units (0.04 mL)",
      "graduations": [
        {
          "doseDisplay": "200 mcg (Standard Target)",
          "doseMcg": 200,
          "volumeMl": 0.04,
          "syringeIU": 4,
          "tickLabel": "4.0 units (0.04 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "300 mcg (Optimization Target)",
          "doseMcg": 300,
          "volumeMl": 0.06,
          "syringeIU": 6,
          "tickLabel": "6.0 units (0.06 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Ceiling Target)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 30 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "80714-61-0 (parent)",
      "pubchemCid": 9811102,
      "sequenceOrFormula": "Ac-Met-Glu-His-Phe-Pro-Gly-Pro-NH2",
      "molecularWeightGPerMol": 855.96
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 16996037",
        "notes": "Grivennikov et al. Semax analogues: metabolic stability and neurotrophin induction."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Superior Enzymatic Stability**: Dual acetylation and amidation prevent rapid enzymatic breakdown, prolonging active brain exposure.",
      "**Deeper Blood-Brain Barrier Crossing**: Lipophilic modifications allow more peptide to cross into brain tissue for maximum neural activation.",
      "**Sustained All-Day Cognitive Focus**: Provides a smoother, longer-lasting boost to executive function and mental clarity.",
      "**Lower Dose Potency**: Requires significantly lower microgram quantities to achieve identical or superior neurotrophic effects.",
      "**Potent Neuroplasticity & Synaptogenesis**: Supports long-term potentiation (LTP) and rapid learning capacity."
    ],
    "adverseObservations": [
      "**Sleep Interference if Taken Late**: Due to its extended duration, administration should be restricted to morning or early afternoon.",
      "**Sensory Sensitivity**: Enhanced focus may heighten sensitivity to bright lights or loud sounds during initial research.",
      "**Strict Refrigeration Required**: Store reconstituted solution strictly at 2°C–8°C away from heat sources."
    ]
  },
  {
    "id": "selank",
    "compoundName": "Selank",
    "handles": [
      "selank",
      "selank-peptide",
      "tuftsin-analogue"
    ],
    "subtitle": "Synthetic Tuftsin-Derived Heptapeptide Anxiolytic & Neuro-Immunomodulator Standard",
    "longDescription": "**What it is:** Selank is a synthetic regulatory heptapeptide (Thr-Lys-Pro-Arg-Pro-Gly-Pro) derived from the naturally occurring human immunopeptide Tuftsin, stabilized with a Pro-Gly-Pro sequence.\n\n**How it works:** Selank acts as a potent, non-sedating anxiolytic and nootropic. It modulates GABAergic neurotransmission, stabilizes blood enkephalins (the body's natural calm-inducing endorphins), and influences dopamine and serotonin metabolism. Crucially, it relieves anxiety, fear, and mental stress without causing sedation, drowsiness, muscle relaxation, or physical addiction.\n\n**Why researchers study it:** Studied for generalized anxiety reduction, stress resilience, cognitive clarity under pressure, memory consolidation, and modulating immune system balance.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "selank",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl in horizontal circular motions for 30 seconds until dissolved completely. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store protected from direct sunlight."
    },
    "dosing": {
      "standardDoseDisplay": "250 mcg – 500 mcg daily",
      "standardDoseMcg": 250,
      "cadence": "1x to 2x Daily (SubQ or Intranasal)",
      "halfLife": "~2–3 Hours (Allosteric GABA-A modulation with continuous anxiolysis without sedative motor impairment)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "2 to 4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Anxiolytic Calibration",
          "timeframe": "Days 1–7",
          "doseDisplay": "250 mcg daily",
          "doseMcg": 250,
          "cadence": "1x Daily (Morning or Midday)",
          "focus": "GABAergic allosteric modulation, enkephalinase inhibition, and stress-induced corticotropin blunting",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Neuro-Cognitive Stabilization",
          "timeframe": "Weeks 2–6",
          "doseDisplay": "250 mcg – 500 mcg daily",
          "doseMcg": 500,
          "cadence": "1x Daily or 250 mcg Twice Daily",
          "focus": "Hippocampal BDNF upregulation, IL-6 inflammatory cytokine suppression, and cognitive focus preservation during stress",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of sustained stress resilience and absence of rebound anxiety or withdrawal",
          "notes": "2–4 week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "100 mcg (Micro Initiation)",
          "doseMcg": 100,
          "volumeMl": 0.02,
          "syringeIU": 2,
          "tickLabel": "2.0 units (0.02 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "250 mcg (Standard Target)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Intensive Target)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "129954-34-3",
      "pubchemCid": 11765600,
      "sequenceOrFormula": "Thr-Lys-Pro-Arg-Pro-Gly-Pro (TKPRPGP)",
      "molecularWeightGPerMol": 751.9
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 11550013",
        "notes": "Kost et al. The inhibitory effect of Selank on enkephalin-degrading enzymes as a possible mechanism of its anxiolytic activity."
      },
      {
        "sourceReference": "PubMed PMID: 20919548",
        "notes": "Semenova et al. Experimental optimization of learning and memory processes by selank."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Non-Sedating Anxiety Relief**: Lowers mental anxiety, panic, and stress signals without causing drowsiness, brain fog, or motor impairment.",
      "**Modulates GABA and Enkephalin Systems**: Naturally balances inhibitory neurotransmitters and prevents the rapid breakdown of calming endorphins.",
      "**Enhances Memory & Learning Under Stress**: Unlike traditional sedatives that impair memory, Selank actively sharpens recall and cognitive performance during high-pressure situations.",
      "**Zero Dependency or Withdrawal**: Non-addictive with zero tolerance build-up, physical dependency, or rebound anxiety.",
      "**Immune-Modulating Properties**: Derived from Tuftsin, it supports balanced antiviral and anti-inflammatory cytokine signaling."
    ],
    "adverseObservations": [
      "**Occasional Mild Drowsiness at High Doses**: While generally non-sedating, large initial doses can cause mild relaxation or desire for rest.",
      "**Mild Nasal Sensation**: When administered intranasally, may cause slight nasal tickling or sneezing.",
      "**Storage Care**: Highly sensitive to room temperature once reconstituted; store refrigerated at 2°C–8°C."
    ]
  },
  {
    "id": "na-selank-amidate",
    "compoundName": "N-Acetyl Selank Amidate",
    "handles": [
      "na-selank-amidate",
      "nasa-selank"
    ],
    "subtitle": "High-Bioavailability Acetylated & Amidated Selank Neuroprotective Standard",
    "longDescription": "**What it is:** N-Acetyl Selank Amidate (NA-Selank-A) is an enhanced molecular analogue of Selank, featuring both N-terminal acetylation and C-terminal amidation.\n\n**How it works:** The dual end-cap modifications protect the peptide against circulating peptidase enzymes, dramatically slowing its breakdown. This significantly boosts blood-brain barrier penetration and delivers a smoother, deeper, and longer-lasting anxiolytic and nootropic effect with superior bioavailability.\n\n**Why researchers study it:** Researched for all-day stress and anxiety resilience, improved emotional stability, sharper focus under intense pressure, and sustained cognitive clarity.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "na-selank-amidate",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 30 seconds. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Store refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "200 mcg – 400 mcg daily",
      "standardDoseMcg": 200,
      "cadence": "1x Daily (SubQ or Intranasal)",
      "halfLife": "~3–4 Hours (Extended enzymatic half-life with enhanced blood-brain barrier transport)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "2 to 4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Days 1–7",
          "doseDisplay": "200 mcg daily",
          "doseMcg": 200,
          "cadence": "1x Daily",
          "focus": "Sustained allosteric GABAergic modulation and stress attenuation without psychomotor slowing",
          "notes": "4.0 units (0.04 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Anxiolytic Optimization",
          "timeframe": "Weeks 2–6",
          "doseDisplay": "300 mcg – 400 mcg daily",
          "doseMcg": 300,
          "cadence": "1x Daily",
          "focus": "Maximum resistance to anxiety, neuro-inflammatory suppression, and mood stability",
          "notes": "6.0 units (0.06 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Endogenous neurochemical equilibrium evaluation",
          "notes": "2–4 week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "4.0 units (0.04 mL)",
      "graduations": [
        {
          "doseDisplay": "200 mcg (Standard Target)",
          "doseMcg": 200,
          "volumeMl": 0.04,
          "syringeIU": 4,
          "tickLabel": "4.0 units (0.04 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "300 mcg (Optimization Target)",
          "doseMcg": 300,
          "volumeMl": 0.06,
          "syringeIU": 6,
          "tickLabel": "6.0 units (0.06 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 30 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "129954-34-3 (parent)",
      "pubchemCid": 11765600,
      "sequenceOrFormula": "Ac-Thr-Lys-Pro-Arg-Pro-Gly-Pro-NH2",
      "molecularWeightGPerMol": 793.94
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 11550013",
        "notes": "Kost et al. Selank modifications and prolonged enkephalin-degrading enzyme inhibition."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Extended Anxiolytic Protection**: Provides prolonged, all-day relief from chronic stress, nervousness, and cognitive overwhelm.",
      "**Enhanced Blood-Brain Penetration**: Enters the central nervous system more efficiently, requiring lower micro-doses for maximum calming effect.",
      "**Emotional Balance & Stress Resilience**: Dampens emotional reactivity and panic responses while maintaining razor-sharp executive focus.",
      "**Improves Executive Function & Working Memory**: Facilitates rapid learning, complex reasoning, and memory consolidation without mental clouding.",
      "**Non-Addictive & Non-Habit Forming**: Retains the complete non-addictive, withdrawal-free safety profile of the parent Selank molecule."
    ],
    "adverseObservations": [
      "**Deep Relaxation**: Very high doses can induce deep calm that may reduce motivation for high-stress physical tasks.",
      "**Subcutaneous Administration Care**: If administered via subcutaneous injection, ensure proper aseptic technique.",
      "**Refrigeration Mandatory**: Maintain reconstituted vials at 2°C–8°C shielded from light."
    ]
  },
  {
    "id": "cerebrolysin",
    "compoundName": "Cerebrolysin",
    "handles": [
      "cerebrolysin",
      "porcine-neurotrophic-peptides"
    ],
    "subtitle": "Purified Porcine Brain-Derived Peptides & Neurotrophic Factor Complex Standard",
    "longDescription": "**What it is:** Cerebrolysin is a low-molecular-weight neuropeptide preparation purified from porcine brain tissue, containing concentrated natural neurotrophic factors including BDNF, GDNF, NGF, and CNTF.\n\n**How it works:** Its small peptides easily cross the blood-brain barrier to mimic the actions of natural endogenous neurotrophic factors. It promotes neurogenesis (the birth of new brain cells), enhances synaptic plasticity, shields neurons against free radical damage and glutamate excitotoxicity, and reduces amyloid deposition and neuroinflammation.\n\n**Why researchers study it:** Studied worldwide for acute ischemic stroke rehabilitation, vascular dementia, Alzheimer's disease, traumatic brain injury (TBI), neuro-regeneration, and cognitive recovery.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "cerebrolysin",
    "reconstitution": {
      "defaultVialNetMg": 2152,
      "defaultDiluentMl": 10,
      "solvent": "Ready-to-Use Aqueous Solution (Filter sterilized)",
      "dissolutionMethod": "Supplied as a ready-to-use liquid solution in amber glass ampoules. No manual reconstitution required. Draw slowly using a blunt filter needle to eliminate micro-glass particles upon breaking ampoule.",
      "resultingConcentrationMgPerMl": 215.2,
      "handlingRule": "Clear, pale yellow aqueous solution. Protect strictly from direct light and freezing. Use immediately upon opening ampoule."
    },
    "dosing": {
      "standardDoseDisplay": "2.0 mL – 5.0 mL daily (in 10 to 20-day cycles)",
      "standardDoseMcg": 430400,
      "cadence": "1x Daily (Deep Intramuscular or Slow IV Infusion)",
      "halfLife": "~2–4 Hours (Acts via permanent neuroplastic remodeling, synaptogenesis, and apoptosis inhibition)",
      "typicalProtocolDuration": "10 to 20 Days (Classical Clinical Cycle: 5 days on, 2 days off)",
      "washoutPeriod": "4 to 8 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Acute Neuro-Restorative Block",
          "timeframe": "Days 1–10",
          "doseDisplay": "2.0 mL – 5.0 mL daily (5 days/week)",
          "doseMcg": 430400,
          "cadence": "5 Days On, 2 Days Off",
          "focus": "BDNF, GDNF, NGF, and CNTF biomimetic receptor stimulation, caspase-3 inhibition, and tau hyperphosphorylation reduction",
          "notes": "Administer 2.0 mL to 5.0 mL deep IM via 23G/25G needle"
        },
        {
          "stage": "Phase 2: Synaptogenic Consolidation",
          "timeframe": "Days 11–20",
          "doseDisplay": "2.0 mL daily",
          "doseMcg": 430400,
          "cadence": "5 Days On, 2 Days Off",
          "focus": "Dendritic arborization, axonal sprouting, and blood-brain barrier integrity stabilization",
          "notes": "2.0 mL IM daily"
        },
        {
          "stage": "Phase 3: Extended Washout",
          "timeframe": "Month 2–3",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of sustained neurocognitive retention, motor recovery, and memory persistence",
          "notes": "Repeat cycle after 1–2 months if evaluating chronic neurodegeneration models"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard 3.0 mL or 5.0 mL Luer-Lock Syringe (IM/IV)",
      "standardIUDisplay": "2.0 mL (430.4 mg)",
      "graduations": [
        {
          "doseDisplay": "2.0 mL (Standard Single IM Target)",
          "doseMcg": 430400,
          "volumeMl": 2,
          "syringeIU": 200,
          "tickLabel": "2.0 mL via calibrated intramuscular syringe"
        },
        {
          "doseDisplay": "5.0 mL (Intensive Protocol Target)",
          "doseMcg": 1076000,
          "volumeMl": 5,
          "syringeIU": 500,
          "tickLabel": "5.0 mL via calibrated intramuscular/IV syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "15°C–25°C room temperature protected from light (36 months)",
      "reconstituted": "Use immediately upon ampoule snap; discard unconsumed volume",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "12656-61-0",
      "pubchemCid": 135331146,
      "sequenceOrFormula": "Complex standardized porcine brain-derived low molecular weight peptides (<10 kDa)",
      "molecularWeightGPerMol": 10000
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 30129883",
        "notes": "Bornstein et al. Cerebrolysin in acute ischemic stroke: a meta-analysis of randomized, double-blind trials."
      },
      {
        "sourceReference": "PubMed PMID: 36155516",
        "notes": "Alvarez et al. Modulation of Amyloid-β and Tau in Alzheimer's Disease Plasma by Cerebrolysin."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Multi-Neurotrophic Factor Cocktail**: Supplies active biological peptide fragments of BDNF, GDNF, NGF, and CNTF in one preparation.",
      "**Promotes Neurogenesis & Synaptic Growth**: Stimulates the generation of new neurons and strengthens synaptic connections across brain regions.",
      "**Clinical Standard for Stroke & TBI Recovery**: Extensively researched in clinical hospitals for restoring speech, motor skills, and memory following brain trauma.",
      "**Protects Neurons Against Ischemia & Excitotoxicity**: Shields vulnerable brain cells from lack of oxygen and destructive glutamate cascades.",
      "**Clears Toxic Amyloid & Tau Stress**: Reduces pathological protein aggregation and neuroinflammatory damage in dementia models."
    ],
    "adverseObservations": [
      "**Intramuscular / Slow Infusion Requirements**: Typically researched via slow intramuscular injection or IV infusion rather than standard micro-subcutaneous injections.",
      "**Sensation of Head Heat / Warmth**: Rapid administration can cause a transient feeling of head warmth or light dizziness; inject slowly.",
      "**Mild Headache or Agitation**: Rare, mild restlessness or headache reported during early administration.",
      "**Single-Use Ampoule Precautions**: Filter needles should be used when drawing from glass ampoules to prevent micro-glass contamination."
    ]
  },
  {
    "id": "p21",
    "compoundName": "P21",
    "handles": [
      "p21",
      "p21-peptide",
      "cntf-mimetic"
    ],
    "subtitle": "Ciliary Neurotrophic Factor (CNTF) Active Fragment Dentate Gyrus Neurogenesis Standard",
    "longDescription": "**What it is:** P21 (Ac-DGGL(A)G-NH2) is a synthetic, brain-penetrant peptide derived from the active neutralizing region of Ciliary Neurotrophic Factor (CNTF).\n\n**How it works:** P21 was engineered to bypass CNTF's bulky size and avoid stimulating neutralizing antibodies. It crosses the blood-brain barrier to inhibit leukemia inhibitory factor (LIF) signaling and downregulate anti-neurogenic enzymes. This activates endogenous neurogenesis in the subgranular zone of the dentate gyrus in the hippocampus, stimulating the continuous growth of fresh, healthy neurons and synapses.\n\n**Why researchers study it:** Researched for boosting long-term memory formation, reversing neurodegenerative cognitive decline, stimulating adult brain neurogenesis, and promoting rapid learning.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "p21",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 30 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Maintain strictly refrigerated at 2°C–8°C once reconstituted."
    },
    "dosing": {
      "standardDoseDisplay": "250 mcg – 500 mcg daily",
      "standardDoseMcg": 250,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "~2–4 Hours (Induces long-lasting adult hippocampal neurogenesis in subgranular zone)",
      "typicalProtocolDuration": "6 to 8 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "250 mcg daily",
          "doseMcg": 250,
          "cadence": "1x Daily",
          "focus": "Inhibition of LIF/STAT3 non-neurogenic pathways and initiation of CNTF-dependent neural progenitor cell differentiation",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Neurogenesis",
          "timeframe": "Weeks 3–6",
          "doseDisplay": "500 mcg daily",
          "doseMcg": 500,
          "cadence": "1x Daily",
          "focus": "Granule cell maturation in dentate gyrus, spatial memory enhancement, and synaptic transmission boost",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Observation of newly integrated functional neurons in hippocampal networks",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "250 mcg (Standard Target)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Intensive Target)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "1401708-83-5 (analogue family)",
      "pubchemCid": 137700147,
      "sequenceOrFormula": "Ac-Asp-Gly-Gly-Leu-Aib-Val-NH2 (Tetrapeptide CNTF 148-151 derivative)",
      "molecularWeightGPerMol": 585.65
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 24702821",
        "notes": "Bolognin et al. Rescue of cognitive-aging by administration of a neurogenic peptide P021."
      },
      {
        "sourceReference": "PubMed PMID: 27400746",
        "notes": "Kazim et al. Disease-modifying effect of a neurogenic compound P021 in Alzheimer's disease."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Drives Adult Hippocampal Neurogenesis**: Directly stimulates the birth and functional integration of new neurons in the brain's memory centers.",
      "**Enhances Synaptic Plasticity & LTP**: Strengthens long-term potentiation, the core biological process behind memory storage and rapid learning.",
      "**Reverses Age-Related Cognitive Deficits**: Restores spatial memory, problem-solving, and cognitive flexibility in aged animal models.",
      "**Shields Synapses from Amyloid-Beta Toxicity**: Protects delicate dendritic spines from degradation caused by toxic Alzheimer's proteins.",
      "**Non-Immunogenic Design**: Engineered to avoid antibody formation, allowing long-term research cycles."
    ],
    "adverseObservations": [
      "**Mild Temporary Lethargy**: Intense neurogenic stimulation can cause mild mental fatigue as synapses reorganize.",
      "**Sensory Sensitivity**: Increased synaptic clarity can temporarily heighten visual or auditory perception.",
      "**Storage Requirements**: Reconstituted solution must remain refrigerated at 2°C–8°C."
    ]
  },
  {
    "id": "noopept",
    "compoundName": "Noopept",
    "handles": [
      "noopept",
      "gvs-111",
      "omberacetam"
    ],
    "subtitle": "N-Phenylacetyl-L-Prolylglycine Ethyl Ester Hippocampal Neurotrophin Standard",
    "longDescription": "**What it is:** Noopept (N-phenylacetyl-L-prolylglycine ethyl ester, GVS-111) is a synthetic peptide-derived nootropic molecule related to the racetam family, boasting approximately 1,000 times higher potency than Piracetam.\n\n**How it works:** It acts as a cycloprolylglycine prodrug, crossing the blood-brain barrier to bind to AMPA and NMDA glutamate receptors. It stimulates the expression of both NGF (Nerve Growth Factor) and BDNF in the hippocampus and cerebral cortex, while sensitizing acetylcholine receptors to improve neural communication.\n\n**Why researchers study it:** Studied for enhancing memory retention, speed of mental recall, cognitive clarity, neuroprotection against trauma and toxins, and reducing cognitive anxiety.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "noopept",
    "reconstitution": {
      "defaultVialNetMg": 500,
      "defaultDiluentMl": 50,
      "solvent": "Propylene Glycol / Deionized Sterile Water (50:50) Oral Vehicle",
      "dissolutionMethod": "Dissolve 500 mg powder into 50.0 mL analytical vehicle. Swirl gently for 60 seconds until transparent. Provides a 10.0 mg/mL oral research solution.",
      "resultingConcentrationMgPerMl": 10,
      "handlingRule": "Clear, transparent liquid. Store at room temperature in dark desiccator."
    },
    "dosing": {
      "standardDoseDisplay": "10 mg – 30 mg daily (10,000 mcg – 30,000 mcg)",
      "standardDoseMcg": 10000,
      "cadence": "1x to 2x Daily (Oral / Sublingual Research Formulation)",
      "halfLife": "~30–60 Minutes (Rapidly metabolized to cycloprolylglycine; elevates NGF and BDNF for >12h)",
      "typicalProtocolDuration": "6 to 12 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "10 mg daily (10,000 mcg)",
          "doseMcg": 10000,
          "cadence": "1x Daily (Morning with Food)",
          "focus": "Hippocampal NGF and BDNF mRNA upregulation, alpha-1 adrenergic and cholinergic sensitivity enhancement",
          "notes": "1.00 mL oral liquid (or 10 mg analytical capsule)"
        },
        {
          "stage": "Phase 2: Target Nootropic Support",
          "timeframe": "Weeks 3–8",
          "doseDisplay": "20 mg – 30 mg daily (in divided doses)",
          "doseMcg": 20000,
          "cadence": "2x Daily (AM / Midday)",
          "focus": "AMPA/NMDA receptor transmission optimization, electroencephalographic alpha rhythm stimulation, and memory consolidation",
          "notes": "1.00 mL twice daily (20 mg total)"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 9–12",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of long-term memory retrieval persistence post-cessation",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard 1.0 mL Calibrated Oral Dropper",
      "standardIUDisplay": "1.00 mL (10 mg)",
      "graduations": [
        {
          "doseDisplay": "10 mg (Standard Target)",
          "doseMcg": 10000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "1.00 mL oral dropper (10 mg)"
        }
      ]
    },
    "storage": {
      "lyophilized": "20°C–25°C room temperature protected from light (36 months)",
      "reconstituted": "15°C–25°C room temperature; use within 90 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "157115-85-0",
      "pubchemCid": 180496,
      "sequenceOrFormula": "C17H22N2O4",
      "molecularWeightGPerMol": 318.37
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 19240853",
        "notes": "Ostrovskaya et al. The original nootropic drug Noopept stimulates the expression of NGF and BDNF in rat hippocampus."
      },
      {
        "sourceReference": "PubMed PMID: 21414388",
        "notes": "Nevalnaya et al. Efficacy of Noopept in patients with cognitive impairment of cerebrovascular origin."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**High-Potency Cognitive Booster**: Up to 1,000 times more potent by weight than standard piracetam for mental clarity.",
      "**Upregulates Both NGF and BDNF**: Stimulates essential growth factors responsible for neural growth, repair, and synaptic maintenance.",
      "**Sensitizes Cholinergic Transmission**: Enhances the brain's response to acetylcholine, improving information processing speed and recall.",
      "**Neuroprotective Antioxidant Properties**: Neutralizes reactive oxygen species and protects brain tissue from excitotoxic damage.",
      "**Mild Anxiolytic & Stress Resilience**: Helps keep subjects calm, focused, and composed under high cognitive demands."
    ],
    "adverseObservations": [
      "**Mild Headaches from Choline Depletion**: Elevated acetylcholine turnover can cause headaches; co-administering a choline source (Alpha-GPC or CDP-Choline) resolves this.",
      "**Over-Stimulation at High Doses**: Excessive amounts can cause brain fog, restlessness, or irritability; precise microgram/milligram calibration is critical.",
      "**Sublingual or Oral Dosing**: Highly bioavailable sublingually or orally; avoid late evening research to prevent sleep disturbances."
    ]
  },
  {
    "id": "dihexa",
    "compoundName": "Dihexa",
    "handles": [
      "dihexa",
      "pnb-0408",
      "hgf-inducer"
    ],
    "subtitle": "Angiotensin IV Analogue Hepatocyte Growth Factor (HGF) Synaptogenic Standard",
    "longDescription": "**What it is:** Dihexa (N-hexanoic-Tyr-Ile-(6) aminohexanoic amide) is an orally active, blood-brain barrier-permeable small-molecule peptide derivative developed at Washington State University.\n\n**How it works:** Dihexa binds with high affinity to Hepatocyte Growth Factor (HGF) and its receptor c-Met. Remarkably, in preclinical assays, Dihexa was found to be orders of magnitude more potent than BDNF at inducing spinogenesis—the physical creation of new dendritic spines and synaptic connections between neurons.\n\n**Why researchers study it:** Researched for reversing severe cognitive deficits, Alzheimer's and Parkinson's disease, traumatic brain injury, and building vast new synaptic networks in the brain.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "dihexa",
    "reconstitution": {
      "defaultVialNetMg": 100,
      "defaultDiluentMl": 20,
      "solvent": "Dimethyl Sulfoxide (DMSO) or Propylene Glycol Analytical Vehicle",
      "dissolutionMethod": "Dissolve 100 mg powder into 20.0 mL vehicle. Swirl gently for 60 seconds until transparent. Provides a 5.0 mg/mL oral/transdermal research stock.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, transparent liquid. Protect strictly from moisture and direct sunlight."
    },
    "dosing": {
      "standardDoseDisplay": "5.0 mg – 10.0 mg daily (5000 mcg – 10000 mcg)",
      "standardDoseMcg": 5000,
      "cadence": "1x Daily (Oral / Transdermal Research Formulation)",
      "halfLife": "~12–24 Hours (Picomolar affinity for HGF; drives massive spinogenesis for days)",
      "typicalProtocolDuration": "4 to 6 Weeks",
      "washoutPeriod": "4 to 6 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Spinogenesis Initiation",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "5.0 mg daily (5000 mcg)",
          "doseMcg": 5000,
          "cadence": "1x Daily (Morning)",
          "focus": "Binding to hepatocyte growth factor (HGF) and activation of c-Met receptor dimerization; dendritic arborization onset",
          "notes": "1.00 mL oral vehicle (or 5 mg transdermal aliquot)"
        },
        {
          "stage": "Phase 2: Synaptic Network Expansion",
          "timeframe": "Weeks 3–4",
          "doseDisplay": "5.0 mg – 10.0 mg daily",
          "doseMcg": 5000,
          "cadence": "1x Daily",
          "focus": "New functional synapse formation (seven orders of magnitude more potent than BDNF in spinogenesis assays)",
          "notes": "1.00 mL to 2.00 mL daily"
        },
        {
          "stage": "Phase 3: Washout & Synaptic Pruning",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Observation of permanent synaptic structural remodeling post-cessation",
          "notes": "4–6 week rest period strictly recommended"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard 1.0 mL Calibrated Oral Dropper",
      "standardIUDisplay": "1.00 mL (5 mg)",
      "graduations": [
        {
          "doseDisplay": "5.0 mg (Standard Target)",
          "doseMcg": 5000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "1.00 mL calibrated oral dropper (5 mg)"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "15°C–25°C room temperature; use within 60 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "1401708-83-5",
      "pubchemCid": 129010512,
      "sequenceOrFormula": "N-hexanoic-Tyr-Ile-(6)aminohexanoic amide (C27H44N4O5)",
      "molecularWeightGPerMol": 504.66
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 25187433",
        "notes": "Benoist et al. The procognitive and synaptogenic Dihexa facilitates cognitive recovery via HGF/c-Met activation (JPET)."
      },
      {
        "sourceReference": "PubMed PMID: 23055539",
        "notes": "McCoy et al. Evaluation of metabolically stabilized angiotensin IV analogs as procognitive/antidementia agents (JPET)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Unmatched Synaptogenic Potency**: Triggers rapid, high-density formation of new dendritic spines and synaptic connections between neurons.",
      "**HGF / c-Met Pathway Activation**: Potentiates Hepatocyte Growth Factor signaling, promoting profound neuronal survival and repair.",
      "**Restores Massive Cognitive Function**: Capable of reversing severe memory deficits in animal models of neurodegenerative disease.",
      "**Orally & Transdermally Bioavailable**: Uniquely active via oral, sublingual, or transdermal research routes.",
      "**Enhances Creative Problem Solving**: Facilitates rich associative thinking and rapid cross-domain learning."
    ],
    "adverseObservations": [
      "**Cellular Proliferation Precautions**: Because HGF/c-Met pathways are involved in cellular growth, research should strictly avoid subjects with active or suspected tumors.",
      "**Transient Mental Fatigue**: Fast synaptic growth can cause mental tiredness during the first several days as neural wiring expands.",
      "**Precise Micro-Dosing Necessary**: Extremely potent compound requiring accurate volumetric calibration."
    ]
  },
  {
    "id": "dsip",
    "compoundName": "DSIP",
    "handles": [
      "dsip",
      "delta-sleep-inducing-peptide"
    ],
    "subtitle": "Endogenous Circadian Neuromodulator & Slow-Wave Sleep Neuropeptide Standard",
    "longDescription": "**What it is:** DSIP (Delta Sleep-Inducing Peptide) is a naturally occurring 9-amino-acid neuropeptide originally isolated from cerebral venous blood in rabbits during induced deep slow-wave sleep.\n\n**How it works:** DSIP crosses the blood-brain barrier and acts on the hypothalamus and limbic system. Rather than acting as a heavy knock-out sedative, DSIP functions as a sleep neuromodulator: it restores natural physiological circadian sleep architecture, specifically promoting restorative delta-wave (Stage 3/4) deep sleep while modulating autonomic stress responses and stabilizing cortisol rhythms.\n\n**Why researchers study it:** Studied for treating chronic insomnia, restoring healthy circadian sleep cycles, dampening stress-induced cortisol spikes, chronic pain relief, and reducing opioid and alcohol withdrawal symptoms.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "dsip",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Swirl gently horizontally for 30 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 2,
      "handlingRule": "Clear, colorless aqueous solution. Store strictly refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg – 250 mcg daily",
      "standardDoseMcg": 100,
      "cadence": "1x Daily (30–60 Minutes Pre-Bed SubQ)",
      "halfLife": "~15 Minutes (Triggers sustained slow-wave delta rhythm synchronization for 6–8h)",
      "typicalProtocolDuration": "2 to 4 Weeks",
      "washoutPeriod": "2 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Days 1–5",
          "doseDisplay": "100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily (Pre-Bed)",
          "focus": "Hypothalamic slow-wave delta EEG synchronization, monoamine turnover balance, and nocturnal LH pulse restoration",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 2.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Circadian Synchronization",
          "timeframe": "Days 6–21",
          "doseDisplay": "150 mcg – 200 mcg daily",
          "doseMcg": 150,
          "cadence": "1x Daily (Pre-Bed)",
          "focus": "Deep restorative slow-wave delta sleep percentage elevation, nocturnal cortisol attenuation, and autonomic recovery",
          "notes": "7.5 units (0.075 mL) on U-100 syringe (or 10.0 units for 200 mcg)"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 4–5",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Endogenous sleep architecture stability evaluation post-regimen",
          "notes": "2-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "100 mcg (Standard Target)",
          "doseMcg": 100,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "150 mcg (Target Optimization)",
          "doseMcg": 150,
          "volumeMl": 0.075,
          "syringeIU": 7.5,
          "tickLabel": "7.5 units (0.075 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "200 mcg (Ceiling Dose)",
          "doseMcg": 200,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "62568-57-4",
      "pubchemCid": 68816,
      "sequenceOrFormula": "Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu (WAGGDASGE)",
      "molecularWeightGPerMol": 848.81
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 6782298",
        "notes": "Graf & Kastin. Delta-sleep-inducing peptide (DSIP): an update (Peptides)."
      },
      {
        "sourceReference": "PubMed PMID: 2981504",
        "notes": "Schneider-Helmert. DSIP in insomnia: clinical pharmacology and sleep architecture."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Restores Deep Delta-Wave Slow-Wave Sleep**: Promotes natural Stage 4 deep sleep where maximum cellular repair and hormone release occur.",
      "**Non-Sedative Neuromodulation**: Does not drug or knock out subjects; works with the brain's natural circadian clocks to restore natural sleep rhythms.",
      "**Balances Cortisol & Stress Responses**: Normalizes hyperactive hypothalamic-pituitary-adrenal (HPA) axis activity, lowering baseline stress.",
      "**Pain Modulation & Endorphin Support**: Interacts with central opiate and endorphin receptors to reduce chronic pain signals.",
      "**Assists in Substance Withdrawal**: Researched for significantly reducing physical and psychological withdrawal symptoms in dependency models."
    ],
    "adverseObservations": [
      "**Morning Grogginess if Dosed Improperly**: Excessive dosing can cause next-day sluggishness; timing 30–60 minutes before sleep is optimal.",
      "**Individual Sensitivity Variations**: Response can vary based on baseline circadian disruption; consistency over 5–7 days produces best stability.",
      "**Reconstitution & Refrigeration**: Dissolve gently in Bacteriostatic Water and store strictly refrigerated at 2°C–8°C."
    ]
  },
  {
    "id": "adamax-1032",
    "compoundName": "ADAMAX 1032",
    "handles": [
      "adamax-1032",
      "adamax",
      "adamax-10mg"
    ],
    "subtitle": "Adamantane-Conjugated N-Acetyl Semax Amidate Enhanced TrkB / BDNF Neurotrophic Standard",
    "longDescription": "**What it is:** ADAMAX 1032 is an advanced synthetic analogue of Semax featuring an N-terminal acetyl group, a C-terminal amide moiety, and an adamantyl cross-link (adamantane moiety) designed to dramatically improve blood-brain barrier permeability and metabolic stability.\n\n**How it works:** ADAMAX acts as a hyper-potent activator of the Brain-Derived Neurotrophic Factor (BDNF) and TrkB receptor cascade in the hippocampus and prefrontal cortex. The lipophilic adamantane modification extends its central half-life and amplifies dopaminergic and serotonergic neurotransmission without causing peripheral sympathomimetic stimulation or crash.\n\n**Why researchers study it:** Researched for intense cognitive focus, long-term potentiation (LTP), synaptic plasticity, accelerated learning acquisition, neuroprotection against oxidative stress, and rapid neurological rehabilitation.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "adamax-1032",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP or Deionized Saline (Intranasal/SubQ)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down inner vial wall. Swirl gently horizontally for 45 seconds until crystal clear. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Keep refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "250 mcg – 500 mcg daily",
      "standardDoseMcg": 250,
      "cadence": "1x Daily (Morning SubQ or Intranasal)",
      "halfLife": "~4 to 6 Hours (Extended central action via adamantane stabilization)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "2 to 4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Baseline Nootropic Calibration",
          "timeframe": "Days 1–7",
          "doseDisplay": "100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily (Morning)",
          "focus": "Upregulation of BDNF, TrkB, and NGF mRNA expression in hippocampus",
          "notes": "2.0 units (0.02 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Cognitive Consolidation",
          "timeframe": "Weeks 2–6",
          "doseDisplay": "250 mcg – 500 mcg daily",
          "doseMcg": 250,
          "cadence": "1x Daily (Morning)",
          "focus": "Cerebral blood flow optimization, dopamine/serotonin turnover enhancement, and synaptic plasticity",
          "notes": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of persistent memory retention and working recall post-stimulation",
          "notes": "2–4 week cessation window"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "100 mcg",
          "doseMcg": 100,
          "volumeMl": 0.02,
          "syringeIU": 2,
          "tickLabel": "2.0 units (0.02 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "250 mcg (Standard Dose)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Intensive Target)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "1638363-22-2",
      "sequenceOrFormula": "Ac-Met-Glu-His-Phe-Pro-Gly-Pro-Adamantane-NH2",
      "molecularWeightGPerMol": 1032.25
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 17351604",
        "notes": "Eremin et al. Semax and its modified analogues in experimental cerebral ischemia and memory enhancement."
      },
      {
        "sourceReference": "PubMed PMID: 21972661",
        "notes": "Medvedeva et al. The effects of Semax and its adamantyl derivatives on TrkB/BDNF expression in primary cortical neurons."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Potent TrkB / BDNF Activation**: Dramatically elevates brain-derived neurotrophic factor expression, promoting dendritic arborization and neurogenesis.",
      "**Superior Blood-Brain Barrier Penetration**: Adamantyl moiety provides lipid solubility, enhancing central nervous system bioavailability.",
      "**Optimized Synaptic Plasticity**: Enhances long-term potentiation (LTP) in hippocampal circuits for accelerated memory consolidation.",
      "**Dopamine & Serotonin System Modulation**: Elevates cognitive motivation and sustained focus without cardiovascular side effects.",
      "**Neuroprotective Resilience**: Protects neuronal membranes from excitotoxic glutamate insults and hypoxic stress."
    ],
    "adverseObservations": [
      "**Late-Day Insomnia**: Due to prolonged central stimulation, administration within 6 hours of sleep may impair sleep onset.",
      "**Overstimulation at High Doses**: Titration above 500 mcg daily can cause sensory over-responsiveness or mild transient headaches.",
      "**Storage Protocol**: Sensitive to temperature cycling; store reconstituted liquid strictly at 2°C–8°C."
    ]
  },
  {
    "id": "pe-22-28",
    "compoundName": "PE-22-28",
    "handles": [
      "pe-22-28",
      "pe2228",
      "spadin-derivative"
    ],
    "subtitle": "Shortened Spadin Derivative Selective TREK-1 Potassium Channel Antagonist Standard",
    "longDescription": "**What it is:** PE-22-28 is a synthetic heptapeptide derivative of spadin (a natural propeptide directed against sortilin) specifically engineered as a selective, high-affinity blocker of the two-pore domain potassium channel TREK-1 (K2P2.1).\n\n**How it works:** By selectively blocking TREK-1 channels in hippocampal neurons, PE-22-28 enhances neuronal excitability, promotes rapid synaptogenesis, and stimulates immediate CREB phosphorylation and BDNF transcription. Unlike conventional monoaminergic modulators, PE-22-28 exerts rapid neurotrophic and behavioral actions within hours rather than weeks.\n\n**Why researchers study it:** Researched for rapid-onset neuroplasticity, mood elevation, resistance to chronic stress, reversing hippocampal dendritic atrophy, and cognitive preservation in neurodegenerative models.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "pe-22-28",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP or Sterile Saline",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down inner vial wall. Swirl gently horizontally for 30 seconds until clear. Avoid vigorous shaking.",
      "resultingConcentrationMgPerMl": 2.5,
      "handlingRule": "Clear, colorless solution. Keep refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg – 200 mcg daily",
      "standardDoseMcg": 100,
      "cadence": "1x Daily (Morning SubQ)",
      "halfLife": "~2 Hours (Rapid central activation with persistent downstream CREB signaling)",
      "typicalProtocolDuration": "4 to 6 Weeks",
      "washoutPeriod": "2 to 3 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation Calibration",
          "timeframe": "Days 1–5",
          "doseDisplay": "50 mcg daily",
          "doseMcg": 50,
          "cadence": "1x Daily (Morning)",
          "focus": "Baseline TREK-1 channel blockade and membrane potential adjustment",
          "notes": "2.0 units (0.02 mL) on U-100 syringe at 2.5 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Neuroplasticity Phase",
          "timeframe": "Weeks 2–5",
          "doseDisplay": "100 mcg – 200 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily (Morning)",
          "focus": "CREB phosphorylation, sustained BDNF release, and hippocampal neurogenesis",
          "notes": "4.0 units (0.04 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Week 6+",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Monitoring long-term synaptogenic persistence and mood stability",
          "notes": "2–3 week cessation window"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "4.0 units (0.04 mL)",
      "graduations": [
        {
          "doseDisplay": "50 mcg",
          "doseMcg": 50,
          "volumeMl": 0.02,
          "syringeIU": 2,
          "tickLabel": "2.0 units (0.02 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "100 mcg (Standard Dose)",
          "doseMcg": 100,
          "volumeMl": 0.04,
          "syringeIU": 4,
          "tickLabel": "4.0 units (0.04 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "200 mcg (Ceiling Dose)",
          "doseMcg": 200,
          "volumeMl": 0.08,
          "syringeIU": 8,
          "tickLabel": "8.0 units (0.08 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "1374529-65-3",
      "sequenceOrFormula": "Gly-Lys-Leu-Pro-Arg-Ala-Ser (GKLPRAS)",
      "molecularWeightGPerMol": 740.9
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 24709675",
        "notes": "Moha Ou Maati et al. PE-22-28, a shorter and more potent spadin derivative targeting TREK-1 potassium channels with rapid antidepressant-like activity."
      },
      {
        "sourceReference": "PubMed PMID: 20406899",
        "notes": "Mazella et al. Spadin, a sortilin-derived peptide, targeting TREK-1 channels: a new concept for fast-acting antidepressants."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Selective TREK-1 Channel Inhibition**: High-affinity antagonist of the K2P2.1 potassium channel without off-target ion channel blockade.",
      "**Rapid-Onset Neuroplasticity**: Induces CREB phosphorylation and synaptogenesis within hours of administration in animal models.",
      "**Hippocampal Neurogenesis**: Accelerates the formation and functional integration of new granule neurons in the dentate gyrus.",
      "**Stress Resilience Modeling**: Protects neuronal architecture against stress-induced dendritic retraction.",
      "**Zero Sedation**: Exerts behavioral normalization without sedation, ataxia, or motor impairment."
    ],
    "adverseObservations": [
      "**Mild Transient Restlessness**: Initial doses may induce temporary psychomotor activation.",
      "**Short Elimination Window**: Requires precise daily timing for consistent receptor target engagement.",
      "**Reconstitution Storage**: Protect reconstituted solution from light and excessive temperature excursions."
    ]
  },
  {
    "id": "pinealon",
    "compoundName": "Pinealon",
    "handles": [
      "pinealon",
      "pinealon-peptide",
      "pineal-bioregulator"
    ],
    "subtitle": "Synthetic Epithalamic Tripeptide (Glu-Arg-Asp) Pineal Bioregulator Standard",
    "longDescription": "**What it is:** Pinealon is a synthetic neuroprotective tripeptide composed of L-glutamic acid, L-arginine, and L-aspartic acid (Glu-Arg-Asp / E-R-D), modeled after natural bioregulatory peptides isolated from the pineal gland and cerebral cortex.\n\n**How it works:** Pinealon penetrates cell and nuclear membranes directly, interacting with histone proteins to modulate gene expression in brain tissue. It stimulates ribosomal RNA transcription, activates endogenous antioxidant enzymes (superoxide dismutase and catalase), and prevents caspase-3-mediated apoptotic cell death induced by oxidative stress, hypoxia, or aging.\n\n**Why researchers study it:** Studied for cerebral vascular health, circadian rhythm synchronization, cognitive preservation in extreme environments, protecting neurons against ischemic insults, and reducing intellectual fatigue.",
    "category": "Cognitive & Neuroprotective",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "pinealon",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP or Deionized Saline (Intranasal/SubQ)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down inner vial wall. Swirl gently horizontally for 30 seconds until completely dissolved. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Keep refrigerated at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "250 mcg – 500 mcg daily",
      "standardDoseMcg": 250,
      "cadence": "1x Daily (Morning SubQ or Intranasal)",
      "halfLife": "~30–45 Minutes (Induces long-lasting genomic epigenetic modifications)",
      "typicalProtocolDuration": "20 to 30 Days",
      "washoutPeriod": "2 to 3 Months between bioregulatory courses",
      "titrationSteps": [
        {
          "stage": "Course Initiation",
          "timeframe": "Days 1–10",
          "doseDisplay": "250 mcg daily",
          "doseMcg": 250,
          "cadence": "1x Daily (Morning)",
          "focus": "Epigenetic chromatin normalization and endogenous antioxidant enzyme activation",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Consolidation Phase",
          "timeframe": "Days 11–20",
          "doseDisplay": "250 mcg – 500 mcg daily",
          "doseMcg": 500,
          "cadence": "1x Daily (Morning)",
          "focus": "Cerebral microcirculation stabilization and circadian clock gene harmonization",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Washout & Residual Action",
          "timeframe": "Months 2–4",
          "doseDisplay": "Observation Window",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of sustained cognitive clarity and cellular vitality post-course",
          "notes": "Persistent bioregulatory effects observed up to 6 months"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "100 mcg",
          "doseMcg": 100,
          "volumeMl": 0.02,
          "syringeIU": 2,
          "tickLabel": "2.0 units (0.02 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "250 mcg (Standard Target)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Intensive Target)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "851199-59-2",
      "sequenceOrFormula": "Glu-Arg-Asp (ERD)",
      "molecularWeightGPerMol": 404.38
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 21542385",
        "notes": "Khavinson et al. Short peptides regulate gene expression and protein synthesis in cerebral cortex cells."
      },
      {
        "sourceReference": "PubMed PMID: 18663842",
        "notes": "Chalisova et al. Neuroprotective effects of Pinealon peptide in aging cerebral tissue cultures."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Direct Gene Expression Modulation**: Penetrates nucleoli to modulate chromatin architecture and ribosomal synthesis in brain cells.",
      "**Endogenous Antioxidant Upregulation**: Significantly elevates intracellular superoxide dismutase (SOD) and catalase activity.",
      "**Circadian Rhythm Harmonization**: Modulates melatonin-synthesizing pineal pathways, supporting natural biorhythm restoration.",
      "**Cerebrovascular Protection**: Protects vascular endothelial lining in cerebral microvasculature against hypoxic stress.",
      "**Long-Lasting Post-Course Persistence**: Short 20-day course yields durable metabolic improvements lasting several months."
    ],
    "adverseObservations": [
      "**High Tolerability Profile**: Naturally occurring peptide sequence exhibits minimal adverse potential in documented animal protocols.",
      "**Course-Based Usage**: Not intended for continuous year-round dosing; cyclical 20–30 day blocks provide optimal epigenetic priming.",
      "**Aseptic Handling**: Maintain strict sterility during reconstitution to prevent microbial contamination."
    ]
  }
]
