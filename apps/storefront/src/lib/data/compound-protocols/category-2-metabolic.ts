import type { CompoundAnalyticalProtocol } from "./types"

export const CATEGORY_2_METABOLIC_INCRETIN_PROTOCOLS: CompoundAnalyticalProtocol[] = [
  {
    "id": "semaglutide",
    "compoundName": "Semaglutide",
    "handles": [
      "semaglutide",
      "semaglutide-vial",
      "glp1-semaglutide"
    ],
    "subtitle": "Selective GLP-1 Receptor Agonist Analytical Titration & Satiety Signaling Standard",
    "longDescription": "**What it is:** Semaglutide is a long-acting synthetic GLP-1 (Glucagon-Like Peptide-1) receptor agonist peptide engineered with an albumin-binding fatty acid side chain that extends its biological half-life to approximately one week.\n\n**How it works:** It activates GLP-1 receptors in the pancreas to stimulate insulin release only when glucose is elevated, while suppressing excess glucagon secretion. In the brain and stomach, it slows gastric emptying and acts on the hypothalamus to significantly reduce appetite, hunger cravings, and food preoccupation.\n\n**Why researchers study it:** Widely researched for profound weight management, visceral fat reduction, blood sugar regulation, improved cardiovascular health, and non-alcoholic fatty liver disease (NAFLD/NASH).",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "semaglutide",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Direct 2.0 mL diluent slowly down the glass barrel wall. Allow lyophilized cake to wet spontaneously for 90 seconds. Swirl gently in a horizontal orbit; never agitate or centrifuge. Solution dissolves completely into a water-clear state.",
      "resultingConcentrationMgPerMl": 2.5,
      "handlingRule": "Clear, colorless aqueous solution. Protect strictly from direct sunlight and thermal spikes above 25°C."
    },
    "dosing": {
      "standardDoseDisplay": "0.25 mg – 1.0 mg weekly progressive titration",
      "standardDoseMcg": 250,
      "cadence": "1x Every 7 Days (Weekly SubQ)",
      "halfLife": "~168 Hours (~7 Days terminal elimination half-life)",
      "typicalProtocolDuration": "16 to 24 Weeks progressive evaluation block",
      "washoutPeriod": "5 to 7 Weeks (allows complete systemic peptide clearance)",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation & GI Acclimatization",
          "timeframe": "Weeks 1–4",
          "doseDisplay": "0.25 mg weekly ",
          "doseMcg": 250,
          "cadence": "1x Every 7 Days",
          "focus": "GLP-1 receptor upregulation and gastric emptying deceleration calibration",
          "notes": "10.0 units (0.10 mL) on U-100 syringe at 2.5 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Intermediate Escalation",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "0.50 mg weekly ",
          "doseMcg": 500,
          "cadence": "1x Every 7 Days",
          "focus": "Sustained postprandial glycemic suppression and central hypothalamic pro-opiomelanocortin (POMC) activation",
          "notes": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Therapeutic Research Target",
          "timeframe": "Weeks 9–12",
          "doseDisplay": "1.00 mg weekly ",
          "doseMcg": 1000,
          "cadence": "1x Every 7 Days",
          "focus": "Significant visceral adipose thermogenesis and continuous satiety signaling",
          "notes": "40.0 units (0.40 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 4: Intensive Dose Ceiling",
          "timeframe": "Weeks 13+",
          "doseDisplay": "1.70 mg – 2.40 mg weekly",
          "doseMcg": 1700,
          "cadence": "1x Every 7 Days",
          "focus": "Maximum metabolic efficacy in intensive obesity models",
          "notes": "68.0 units (0.68 mL) on U-100 syringe at 1.70 mg dose"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "10.0 units (0.10 mL)",
      "graduations": [
        {
          "doseDisplay": "0.25 mg (Weeks 1–4 Initiation)",
          "doseMcg": 250,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "0.50 mg (Weeks 5–8 Escalation)",
          "doseMcg": 500,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.00 mg (Weeks 9–12 Target)",
          "doseMcg": 1000,
          "volumeMl": 0.4,
          "syringeIU": 40,
          "tickLabel": "40.0 units (0.40 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.70 mg (Advanced Phase 4)",
          "doseMcg": 1700,
          "volumeMl": 0.68,
          "syringeIU": 68,
          "tickLabel": "68.0 units (0.68 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2.40 mg (Maximum Ceiling)",
          "doseMcg": 2400,
          "volumeMl": 0.96,
          "syringeIU": 96,
          "tickLabel": "96.0 units (0.96 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dark desiccator (shelf-life: 24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28–30 days for maximum biological potency",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "910463-68-2",
      "pubchemCid": 56843331,
      "sequenceOrFormula": "C187H291N45O59",
      "molecularWeightGPerMol": 4113.58
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 33567185",
        "notes": "Wilding et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1 Trial)."
      },
      {
        "sourceReference": "PubMed PMID: 30122305",
        "notes": "O'Neil et al. Efficacy and safety of semaglutide compared with liraglutide and placebo for weight loss in patients with obesity (Lancet)."
      },
      {
        "sourceReference": "PubMed PMID: 29617641",
        "notes": "Drucker. Mechanisms of Action and Therapeutic Application of Glucagon-like Peptide-1."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Substantial Caloric Intake & Appetite Suppression**: Decreases hunger signals and food cravings by acting on satiety centers in the brain's hypothalamus.",
      "**Significant & Sustained Fat Loss**: Extensively proven to generate 15% or greater average reductions in body weight in preclinical and clinical models.",
      "**Glucose-Dependent Glycemic Control**: Lowers blood sugar by triggering insulin secretion strictly in the presence of food, preventing dangerous hypoglycemia.",
      "**Cardiovascular Risk Reduction**: Demonstrates significant protective benefits against major cardiovascular events, arterial plaque, and vascular inflammation.",
      "**Reduces Liver Fat (NASH/MASH)**: Clears hepatic fat accumulation and improves liver enzyme markers in metabolic research models.",
      "**Delayed Gastric Digestion**: Keeps food in the stomach longer, resulting in prolonged feelings of fullness after smaller meal sizes."
    ],
    "adverseObservations": [
      "**Gastrointestinal Symptoms (Nausea, Vomiting, Diarrhea)**: The most frequent side effect, usually peaking 24–48 hours after dose escalation. Mitigated by starting at 0.25 mg weekly and escalating slowly every 4 weeks.",
      "**Constipation and Acid Reflux**: Delayed digestion can cause mild acid reflux and constipation; maintaining high dietary fiber and daily hydration is critical.",
      "**Transient Fatigue During Caloric Deficits**: Lower caloric intake can temporarily cause feelings of sluggishness as the body adapts to fat oxidation.",
      "**Subcutaneous Rotation**: Rotate injection sites (abdomen, thighs, upper arms) to avoid localized tissue irritation.",
      "**Cold Storage Requirements**: Reconstituted vials must be refrigerated at 2°C–8°C; do not freeze."
    ]
  },
  {
    "id": "tirzepatide",
    "compoundName": "Tirzepatide",
    "handles": [
      "tirzepatide",
      "tirzepatide-vial",
      "dual-incretin-tirzepatide"
    ],
    "subtitle": "Dual GIP / GLP-1 Incretin Receptor Co-Agonist Analytical Titration Standard",
    "longDescription": "**What it is:** Tirzepatide is a synthetic 39-amino-acid peptide that represents a major scientific breakthrough: a first-in-class dual agonist that activates both GIP and GLP-1 receptors simultaneously.\n\n**How it works:** By triggering both glucose-dependent insulinotropic polypeptide (GIP) and GLP-1 receptors, Tirzepatide coordinates metabolic control on two fronts. GIP enhances fat cell sensitivity and lipid metabolism, while GLP-1 curbs appetite and controls blood sugar. Together, they create a synergistic effect on fat loss and metabolic rate that surpasses single-hormone compounds.\n\n**Why researchers study it:** Studied for massive body weight and fat reduction (averaging 20–25% in clinical trials), reversal of type 2 diabetes, fatty liver resolution, sleep apnea improvement, and cardiovascular risk reduction.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "tirzepatide",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the glass wall. The lyophilized matrix hydrates spontaneously within 60 seconds. Swirl gently in horizontal circles. Avoid shaking to prevent peptide foaming or denaturing.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Solution must be free of particulate matter before withdrawal."
    },
    "dosing": {
      "standardDoseDisplay": "2.5 mg weekly initial titration",
      "standardDoseMcg": 2500,
      "cadence": "1x Every 7 Days (Weekly SubQ)",
      "halfLife": "~120 Hours (~5 Days terminal half-life)",
      "typicalProtocolDuration": "12 to 20 Weeks progressive titration block",
      "washoutPeriod": "4 to 6 Weeks between trial series",
      "titrationSteps": [
        {
          "stage": "Phase 1: Titration Initiation",
          "timeframe": "Weeks 1–4",
          "doseDisplay": "2.5 mg weekly ",
          "doseMcg": 2500,
          "cadence": "1x Every 7 Days",
          "focus": "Receptor acclimatization, GIP lipid buffering, and gastrointestinal tolerance calibration",
          "notes": "50.0 units (0.50 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Primary Response Escalation",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "5.0 mg weekly ",
          "doseMcg": 5000,
          "cadence": "1x Every 7 Days",
          "focus": "Adipose thermogenesis, uncoupling protein-1 (UCP-1) stimulation, and insulin sensitivity enhancement",
          "notes": "100.0 units (1.00 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Advanced Metabolic Assays",
          "timeframe": "Weeks 9–12",
          "doseDisplay": "7.5 mg weekly ",
          "doseMcg": 7500,
          "cadence": "1x Every 7 Days",
          "focus": "Maximum dual-receptor synergy and continuous hepatic triglyceride clearance",
          "notes": "Requires higher concentration vial (15mg or 20mg) or 1.50 mL volume"
        },
        {
          "stage": "Phase 4: Ceiling Efficacy Window",
          "timeframe": "Weeks 13+",
          "doseDisplay": "10.0 mg weekly ",
          "doseMcg": 10000,
          "cadence": "1x Every 7 Days",
          "focus": "Ceiling efficacy assays in intensive metabolic research models",
          "notes": "10.0 mg protocol target ceiling"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "50.0 units (0.50 mL)",
      "graduations": [
        {
          "doseDisplay": "2.50 mg (Weeks 1–4 Initiation)",
          "doseMcg": 2500,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "5.00 mg (Weeks 5–8 Escalation)",
          "doseMcg": 5000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dark desiccator (shelf-life: 24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days for maximum stability",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "2023788-19-2",
      "pubchemCid": 166567236,
      "sequenceOrFormula": "C225H348N48O68",
      "molecularWeightGPerMol": 4813.45
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 35658024",
        "notes": "Jastreboff et al. Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)."
      },
      {
        "sourceReference": "PubMed PMID: 34170647",
        "notes": "Frias et al. Tirzepatide versus Semaglutide Once Weekly in Patients with Type 2 Diabetes (SURPASS-2 NEJM)."
      },
      {
        "sourceReference": "PubMed PMID: 30473097",
        "notes": "Coskun et al. LY3298176, a novel dual GIP and GLP-1 receptor agonist for the treatment of type 2 diabetes mellitus."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Dual GIP and GLP-1 Synergistic Incretin Activation**: Activates two key metabolic hormone pathways at once, multiplying appetite control and metabolic efficiency.",
      "**Profound Weight & Adipose Loss**: Demonstrates dose-dependent total body weight reductions averaging over 20% in long-term metabolic research.",
      "**Superior Glycemic Control & Insulin Sensitivity**: Calms blood glucose spikes and restores normal insulin sensitivity with minimal hypoglycemic risk.",
      "**Enhanced Fat Cell Lipid Metabolism**: GIP receptor signaling directly promotes healthy fat cell storage dynamics, lipid buffering, and mitochondrial fat burning.",
      "**Clears Hepatic Steatosis (Fatty Liver)**: Rapidly reduces liver fat deposits and normalizes liver function enzymes (ALT, AST).",
      "**Improves Blood Pressure & Lipid Profiles**: Substantially lowers triglycerides, LDL cholesterol, and systolic blood pressure in metabolic syndrome models."
    ],
    "adverseObservations": [
      "**Gastrointestinal Adjustment (Nausea, Acid Reflux, Bloating)**: The most common observation, occurring primarily during dose escalations. Managed by starting at 2.5 mg weekly and increasing by 2.5 mg increments every 4 weeks.",
      "**Delayed Gastric Digestion**: Food stays longer in the stomach; consuming smaller, low-fat meals helps prevent feelings of heaviness and sulfur burps.",
      "**Hydration and Electrolyte Diligence**: Appetite suppression reduces fluid intake; researchers recommend tracking water and electrolyte consumption daily.",
      "**Temporary Fatigue During Rapid Fat Loss**: Mild lethargy can occur during early phases of rapid caloric deficit as metabolic pathways adjust.",
      "**Subcutaneous Injection Site Care**: Mild redness or minor itching at the injection point can occasionally occur; letting the vial warm to room temperature for 10 minutes prior to injection minimizes stinging.",
      "**Peptide Bond Fragility**: Never shake the vial after adding diluent; swirl smoothly and keep refrigerated between 2°C–8°C."
    ]
  },
  {
    "id": "retatrutide",
    "compoundName": "Retatrutide",
    "handles": [
      "retatrutide",
      "ly3437943",
      "triple-g-retatrutide"
    ],
    "subtitle": "Triple GIP / GLP-1 / Glucagon Tri-Agonist Stoichiometric Research Standard",
    "longDescription": "**What it is:** Retatrutide (LY3437943) is an advanced next-generation synthetic 39-amino-acid peptide that acts as a triple receptor agonist—activating GLP-1, GIP, and Glucagon receptors at the same time.\n\n**How it works:** In addition to the appetite suppression and insulin optimization of GLP-1 and GIP, Retatrutide's glucagon receptor activation directly stimulates the liver and brown adipose tissue to burn calories, actively ramping up resting energy expenditure. This means the body burns more fat even while resting, rather than merely relying on caloric restriction.\n\n**Why researchers study it:** Researched as the most potent weight loss and metabolic compound discovered to date, achieving over 24% mean weight loss in trials, complete resolution of fatty liver disease, and profound improvements in blood lipids.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "retatrutide",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Allow cake to dissolve spontaneously over 90 seconds without vigorous agitation. Swirl in continuous horizontal circles. Inspect for complete optical dissolution.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Sensitive to repeated freeze-thaw cycles once reconstituted."
    },
    "dosing": {
      "standardDoseDisplay": "2.0 mg – 4.0 mg weekly initial calibration",
      "standardDoseMcg": 2000,
      "cadence": "1x Every 7 Days (Weekly SubQ)",
      "halfLife": "~144 Hours (~6 Days terminal half-life)",
      "typicalProtocolDuration": "12 to 24 Weeks progressive evaluation block",
      "washoutPeriod": "6 Weeks between research cohorts",
      "titrationSteps": [
        {
          "stage": "Phase 1: Triple-Receptor Initiation",
          "timeframe": "Weeks 1–4",
          "doseDisplay": "2.0 mg weekly ",
          "doseMcg": 2000,
          "cadence": "1x Every 7 Days",
          "focus": "Initial glucagon receptor recruitment without compensatory tachycardia; glycemic and satiety baseline",
          "notes": "40.0 units (0.40 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Glucagon Thermogenic Escalation",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "4.0 mg weekly ",
          "doseMcg": 4000,
          "cadence": "1x Every 7 Days",
          "focus": "Hepatic lipid oxidation stimulation, uncoupling protein activation, and robust energy expenditure enhancement",
          "notes": "80.0 units (0.80 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: High-Output Tri-Agonism",
          "timeframe": "Weeks 9–12",
          "doseDisplay": "8.0 mg weekly ",
          "doseMcg": 8000,
          "cadence": "1x Every 7 Days",
          "focus": "Near-total hepatic steatosis clearance and peak triple-pathway metabolic overdrive",
          "notes": "Requires higher concentration vial (20mg) or dual 0.80 mL injections"
        },
        {
          "stage": "Phase 4: Maximum Protocol Ceiling",
          "timeframe": "Weeks 13+",
          "doseDisplay": "12.0 mg weekly ",
          "doseMcg": 12000,
          "cadence": "1x Every 7 Days",
          "focus": "Maximum clinical trial endpoint evaluation",
          "notes": "Ceiling dose tested in Phase 2 clinical trials"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "40.0 units (0.40 mL)",
      "graduations": [
        {
          "doseDisplay": "2.00 mg (Phase 1 Initiation)",
          "doseMcg": 2000,
          "volumeMl": 0.4,
          "syringeIU": 40,
          "tickLabel": "40.0 units (0.40 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "4.00 mg (Phase 2 Escalation)",
          "doseMcg": 4000,
          "volumeMl": 0.8,
          "syringeIU": 80,
          "tickLabel": "80.0 units (0.80 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "5.00 mg (Intermediate Target)",
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
      "casNumber": "2381089-83-2",
      "pubchemCid": 171390338,
      "sequenceOrFormula": "C221H342N46O68",
      "molecularWeightGPerMol": 4731.33
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 37366315",
        "notes": "Jastreboff et al. Triple-Hormone-Receptor Agonist Retatrutide for Obesity — A Randomized, Phase 2 Trial (NEJM)."
      },
      {
        "sourceReference": "PubMed PMID: 37385280",
        "notes": "Rosenstock et al. Retatrutide, a GIP, GLP-1 and glucagon receptor agonist, for people with type 2 diabetes (Lancet)."
      },
      {
        "sourceReference": "PubMed PMID: 36354040",
        "notes": "Coskun et al. LY3437943, a novel triple GIP, GLP-1, and glucagon receptor agonist in people with type 2 diabetes (Lancet)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Triple-Agonist Metabolic Power (GLP-1 / GIP / Glucagon)**: The only triple incretin peptide, uniquely combining appetite control with active, direct caloric burning.",
      "**Highest Documented Fat Loss**: Clinical models demonstrate unprecedented fat loss exceeding 24% of total body weight, outpacing earlier incretins.",
      "**Increased Resting Energy Expenditure**: Glucagon activation directly triggers thermogenesis and fatty acid oxidation in liver and adipose tissues.",
      "**Total Reversal of Hepatic Steatosis**: Achieves up to 86% average reduction in liver fat content, resolving non-alcoholic steatohepatitis (NASH).",
      "**Rapid Triglyceride & Cholesterol Clearance**: Vastly improves blood lipid profiles, lowering dangerous circulating triglycerides and very-low-density lipoproteins.",
      "**Maintains Lean Mass Better**: Higher metabolic burn allows fat loss with preserved lean tissue when combined with proper protein intake."
    ],
    "adverseObservations": [
      "**Transient Heart Rate Elevation**: Glucagon receptor stimulation can cause a modest, dose-dependent resting pulse increase of 2–5 beats per minute.",
      "**Nausea and Digestive Sensitivity**: Early dose-escalation can trigger nausea, fullness, or loose stools; conservative micro-titration is essential.",
      "**Heightened Caloric Burn Sensation**: Increased metabolic rate may cause subjects to feel slightly warm or experience mild skin hypersensitivity (allodynia).",
      "**Strict Gradual Titration Required**: Must begin at lowest calibration (e.g. 2.0 mg weekly) and titrate in 2.0 mg steps every 4 weeks to allow cardiac and gastrointestinal adaptation.",
      "**Reconstitution & Light Protection**: Delicate peptide structure; reconstitute with Bacteriostatic Water and store strictly between 2°C–8°C protected from light."
    ]
  },
  {
    "id": "cagrilintide",
    "compoundName": "Cagrilintide",
    "handles": [
      "cagrilintide",
      "cagrisema-component",
      "amylin-analogue"
    ],
    "subtitle": "Long-Acting Non-Selective Amylin / Calcitonin Receptor Agonist Monograph",
    "longDescription": "**What it is:** Cagrilintide is a long-acting synthetic analogue of amylin, a natural hormone co-secreted with insulin by pancreatic beta cells to regulate mealtime fullness.\n\n**How it works:** Cagrilintide targets amylin and calcitonin receptors in the area postrema of the brainstem, controlling hunger through an entirely different biological pathway than GLP-1 peptides. It slows stomach emptying and suppresses appetite non-incretin style, creating powerful synergy when combined with GLP-1 agonists (such as the CagriSema combination).\n\n**Why researchers study it:** Researched for breaking weight loss plateaus, suppressing stubborn hunger, achieving greater fat loss in combination therapies, and managing blood sugar without causing nausea.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "cagrilintide",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 60 seconds until dissolved completely. Do not shake. Optical inspection must reveal a clear aqueous state.",
      "resultingConcentrationMgPerMl": 2.5,
      "handlingRule": "Clear, colorless aqueous solution. Sensitive to agitation-induced aggregation."
    },
    "dosing": {
      "standardDoseDisplay": "0.3 mg – 1.2 mg weekly titration",
      "standardDoseMcg": 300,
      "cadence": "1x Every 7 Days (Weekly SubQ)",
      "halfLife": "~168–192 Hours (~7–8 Days terminal elimination half-life)",
      "typicalProtocolDuration": "16 to 24 Weeks",
      "washoutPeriod": "6 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation & Tolerance Calibration",
          "timeframe": "Weeks 1–4",
          "doseDisplay": "0.30 mg weekly ",
          "doseMcg": 300,
          "cadence": "1x Every 7 Days",
          "focus": "Amylin receptor saturation and homeostatic satiety signaling without acute emetic response",
          "notes": "12.0 units (0.12 mL) on U-100 syringe at 2.5 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Escalation Step 1",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "0.60 mg weekly ",
          "doseMcg": 600,
          "cadence": "1x Every 7 Days",
          "focus": "Synergistic gastric tone delay and central area postrema activation",
          "notes": "24.0 units (0.24 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Therapeutic Target Step 2",
          "timeframe": "Weeks 9–12",
          "doseDisplay": "1.20 mg weekly ",
          "doseMcg": 1200,
          "cadence": "1x Every 7 Days",
          "focus": "Maximum independent amylinergic satiety induction (or co-infusion with GLP-1 agonists)",
          "notes": "48.0 units (0.48 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 4: Full Maintenance Ceiling",
          "timeframe": "Weeks 13+",
          "doseDisplay": "2.40 mg weekly ",
          "doseMcg": 2400,
          "cadence": "1x Every 7 Days",
          "focus": "Ceiling trial efficacy endpoint evaluation",
          "notes": "96.0 units (0.96 mL) on U-100 syringe"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "12.0 units (0.12 mL)",
      "graduations": [
        {
          "doseDisplay": "0.30 mg (Weeks 1–4 Initiation)",
          "doseMcg": 300,
          "volumeMl": 0.12,
          "syringeIU": 12,
          "tickLabel": "12.0 units (0.12 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "0.60 mg (Weeks 5–8 Escalation)",
          "doseMcg": 600,
          "volumeMl": 0.24,
          "syringeIU": 24,
          "tickLabel": "24.0 units (0.24 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.20 mg (Weeks 9–12 Target)",
          "doseMcg": 1200,
          "volumeMl": 0.48,
          "syringeIU": 48,
          "tickLabel": "48.0 units (0.48 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2.40 mg (Phase 4 Ceiling)",
          "doseMcg": 2400,
          "volumeMl": 0.96,
          "syringeIU": 96,
          "tickLabel": "96.0 units (0.96 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "1415456-99-3",
      "pubchemCid": 171397054,
      "sequenceOrFormula": "C186H288N46O57",
      "molecularWeightGPerMol": 4091.6
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 34798060",
        "notes": "Lau et al. Once-weekly cagrilintide for weight management in people with overweight and obesity: a multicentre, randomised trial (Lancet)."
      },
      {
        "sourceReference": "PubMed PMID: 37364590",
        "notes": "Frias et al. Efficacy and safety of co-administered once-weekly cagrilintide 2.4 mg with once-weekly semaglutide 2.4 mg in type 2 diabetes (Lancet)."
      },
      {
        "sourceReference": "PubMed PMID: 33894838",
        "notes": "Enebo et al. Safety, tolerability, pharmacokinetics, and pharmacodynamics of concomitant administration of multiple doses of cagrilintide with semaglutide (Lancet)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Novel Amylin Receptor Mechanism**: Operates outside standard incretin pathways, targeting brainstem satiety centers for powerful appetite suppression.",
      "**Synergistic Power with GLP-1 Peptides**: When paired with Semaglutide or Tirzepatide, it produces additive weight loss that outperforms either agent alone.",
      "**Smooth Gastric Emptying Control**: Promotes natural, steady post-meal fullness without abrupt digestive stops or sugar spikes.",
      "**Preserves Muscle Tissue**: Facilitates fat mass reduction while protecting lean functional tissue in metabolic animal models.",
      "**Prevents Post-Meal Glucagon Spikes**: Inhibits unnecessary glucagon secretion after eating, helping maintain stable, healthy blood glucose curves."
    ],
    "adverseObservations": [
      "**Dose-Dependent Nausea**: Transient nausea can occur if escalated too quickly; gradual titration ensures comfortable receptor saturation.",
      "**Early Satiety Fullness**: Subjects can feel full very quickly on small portions; ensure nutrient-dense, high-protein intake.",
      "**Mild Constipation**: Amylin receptor activation slows digestive motility; plenty of water and dietary fiber prevent bowel sluggishness.",
      "**Subcutaneous Administration Rules**: Keep injections rotated and inspect for clear, colorless appearance before administration."
    ]
  },
  {
    "id": "mazdutide",
    "compoundName": "Mazdutide",
    "handles": [
      "mazdutide",
      "ibi362",
      "ly3305677",
      "oxm-analogue"
    ],
    "subtitle": "Synthetic Oxyntomodulin Dual GLP-1 / Glucagon Receptor Co-Agonist Standard",
    "longDescription": "**What it is:** Mazdutide (IBI362) is a synthetic dual GLP-1 and glucagon receptor agonist peptide with a long-acting fatty acid chain, engineered to mimic the body's natural oxyntomodulin hormone.\n\n**How it works:** By stimulating both GLP-1 and glucagon receptors, Mazdutide balances appetite reduction with enhanced liver fat metabolism and increased caloric expenditure. It specifically targets visceral abdominal fat and liver fat accumulation.\n\n**Why researchers study it:** Studied for high-rate weight loss, targeted reduction of visceral belly fat, clearing fatty liver disease, and improving blood lipid and uric acid levels.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "mazdutide",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the vial glass wall. Allow 60 seconds for passive hydration, then swirl horizontally. Inspect for clear, colorless optical appearance.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Protect from thermal degradation."
    },
    "dosing": {
      "standardDoseDisplay": "3.0 mg – 6.0 mg weekly titration",
      "standardDoseMcg": 3000,
      "cadence": "1x Every 7 Days (Weekly SubQ)",
      "halfLife": "~120–144 Hours (~5–6 Days terminal half-life)",
      "typicalProtocolDuration": "16 to 24 Weeks",
      "washoutPeriod": "5 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation Step",
          "timeframe": "Weeks 1–4",
          "doseDisplay": "3.0 mg weekly ",
          "doseMcg": 3000,
          "cadence": "1x Every 7 Days",
          "focus": "Dual GLP-1/GCGR receptor baseline adaptation and gastrointestinal tolerance calibration",
          "notes": "60.0 units (0.60 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Active Thermogenic Escalation",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "4.5 mg – 6.0 mg weekly",
          "doseMcg": 6000,
          "cadence": "1x Every 7 Days",
          "focus": "Hepatic beta-oxidation upregulation, brown adipose tissue thermogenesis, and satiety amplification",
          "notes": "120.0 units (1.20 mL total volume; administer via two 60-unit injections)"
        },
        {
          "stage": "Phase 3: Ceiling Efficacy Maintenance",
          "timeframe": "Weeks 9+",
          "doseDisplay": "9.0 mg weekly",
          "doseMcg": 9000,
          "cadence": "1x Every 7 Days",
          "focus": "Maximum hepatic steatosis resolution and systemic lipid reduction",
          "notes": "Requires dedicated high-concentration vial (20mg)"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "60.0 units (0.60 mL)",
      "graduations": [
        {
          "doseDisplay": "1.50 mg (Micro Initiation)",
          "doseMcg": 1500,
          "volumeMl": 0.3,
          "syringeIU": 30,
          "tickLabel": "30.0 units (0.30 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "3.00 mg (Standard Phase 1)",
          "doseMcg": 3000,
          "volumeMl": 0.6,
          "syringeIU": 60,
          "tickLabel": "60.0 units (0.60 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "5.00 mg (Intermediate Ceiling)",
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
      "casNumber": "2413554-61-3",
      "pubchemCid": 167312357,
      "sequenceOrFormula": "C201H315N47O64",
      "molecularWeightGPerMol": 4467
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 42251595",
        "notes": "Ji et al. Treatment With 9-mg Mazdutide for Weight Reduction in Chinese Adults With Obesity: The GLORY-2 Randomized Clinical Trial."
      },
      {
        "sourceReference": "PubMed PMID: 41875890",
        "notes": "Jiang et al. Mazdutide 9 mg in Chinese adults with a body mass index ≥30 kg/m(2) but without diabetes: A phase 2 randomized controlled trial."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Dual GLP-1 and Glucagon Receptor Agonism**: Balances hunger suppression with direct hepatic fat oxidation.",
      "**Rapid Visceral Fat Reduction**: Selectively targets dangerous deep visceral abdominal fat deposits surrounding internal organs.",
      "**Lowers Serum Uric Acid**: Uniquely documented to reduce serum uric acid levels, providing additional protection against gout and metabolic inflammation.",
      "**Accelerates Liver Fat Depletion**: Demonstrates robust clearance of intrahepatic triglycerides in steatohepatitis models.",
      "**Cardiovascular and Blood Pressure Benefits**: Lowers blood pressure, improves arterial elasticity, and reduces systemic inflammatory biomarkers."
    ],
    "adverseObservations": [
      "**Digestive System Adjustment**: Standard incretin side effects (nausea, mild diarrhea, decreased appetite) during dose escalation.",
      "**Mild Resting Pulse Increase**: Glucagon component may modestly increase heart rate by 2–4 beats per minute.",
      "**Hydration Diligence**: Ensure adequate daily fluids to support kidney filtration and uric acid clearance."
    ]
  },
  {
    "id": "survodutide",
    "compoundName": "Survodutide",
    "handles": [
      "survodutide",
      "bi456906",
      "survodutide-dual-agonist"
    ],
    "subtitle": "Dual Glucagon / GLP-1 Receptor Agonist Hepatic Steatosis & Fibrosis Standard",
    "longDescription": "**What it is:** Survodutide (BI 456906) is a dual glucagon/GLP-1 receptor agonist peptide specifically engineered with high glucagon receptor activity relative to its GLP-1 action.\n\n**How it works:** It activates glucagon receptors in the liver to dramatically speed up fat breakdown and energy expenditure, while simultaneously activating GLP-1 receptors in the brain to keep appetite under control.\n\n**Why researchers study it:** Researched as a prime candidate for curing MASH/NASH (Metabolic Dysfunction-Associated Steatohepatitis), reversing advanced liver fibrosis, and driving significant total-body weight reduction.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "survodutide",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl gently horizontally for 60 seconds until dissolved completely. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Visually inspect for clarity prior to withdrawal."
    },
    "dosing": {
      "standardDoseDisplay": "0.6 mg – 2.4 mg weekly titration",
      "standardDoseMcg": 600,
      "cadence": "1x Every 7 Days (Weekly SubQ)",
      "halfLife": "~144 Hours (~6 Days terminal elimination half-life)",
      "typicalProtocolDuration": "16 to 24 Weeks",
      "washoutPeriod": "6 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initial Calibration Step 1",
          "timeframe": "Weeks 1–4",
          "doseDisplay": "0.60 mg weekly ",
          "doseMcg": 600,
          "cadence": "1x Every 7 Days",
          "focus": "Dual GCGR/GLP-1 receptor acclimatization and baseline glycemic control",
          "notes": "12.0 units (0.12 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Escalation Step 2",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "1.20 mg weekly ",
          "doseMcg": 1200,
          "cadence": "1x Every 7 Days",
          "focus": "Hepatic fat oxidation activation and systemic energy expenditure elevation",
          "notes": "24.0 units (0.24 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Therapeutic Target Step 3",
          "timeframe": "Weeks 9–12",
          "doseDisplay": "2.40 mg weekly ",
          "doseMcg": 2400,
          "cadence": "1x Every 7 Days",
          "focus": "MASH / NASH hepatic fibrosis reversal assays and profound weight reduction",
          "notes": "48.0 units (0.48 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 4: High-Dose Ceiling",
          "timeframe": "Weeks 13+",
          "doseDisplay": "3.60 mg – 4.80 mg weekly",
          "doseMcg": 3600,
          "cadence": "1x Every 7 Days",
          "focus": "Maximum clinical trial endpoint evaluation",
          "notes": "72.0 units (0.72 mL) on U-100 syringe at 3.60 mg dose"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "12.0 units (0.12 mL)",
      "graduations": [
        {
          "doseDisplay": "0.60 mg (Phase 1 Starting Dose)",
          "doseMcg": 600,
          "volumeMl": 0.12,
          "syringeIU": 12,
          "tickLabel": "12.0 units (0.12 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.20 mg (Phase 2 Escalation)",
          "doseMcg": 1200,
          "volumeMl": 0.24,
          "syringeIU": 24,
          "tickLabel": "24.0 units (0.24 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2.40 mg (Phase 3 Target)",
          "doseMcg": 2400,
          "volumeMl": 0.48,
          "syringeIU": 48,
          "tickLabel": "48.0 units (0.48 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "3.60 mg (Phase 4 High Output)",
          "doseMcg": 3600,
          "volumeMl": 0.72,
          "syringeIU": 72,
          "tickLabel": "72.0 units (0.72 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dark desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "2489284-59-9",
      "pubchemCid": 171378821,
      "sequenceOrFormula": "C194H299N47O59",
      "molecularWeightGPerMol": 4290.8
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 38330987",
        "notes": "le Roux et al. Dual glucagon and GLP-1 receptor agonist survodutide in people with overweight or obesity: a randomised, double-blind, placebo-controlled, dose-finding, phase 2 trial (Lancet)."
      },
      {
        "sourceReference": "PubMed PMID: 38847460",
        "notes": "Sanyal et al. A Phase 2 Randomized Trial of Survodutide in MASH and Fibrosis (NEJM)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Reverses Liver Fibrosis & NASH**: Demonstrates breakthrough histological improvements in liver scarring and inflammation in clinical trials.",
      "**Strong Liver Glucagon Signaling**: Dramatically boosts hepatic mitochondrial fatty acid oxidation and energy burn.",
      "**Substantial Body Weight Loss**: Drives 15–19% weight reduction through combined appetite suppression and metabolic thermogenesis.",
      "**Normalizes Liver Enzymes**: Rapidly brings elevated ALT and AST liver inflammation markers back to baseline.",
      "**Improves Insulin & Glucose Balance**: Enhances systemic insulin sensitivity while keeping fasting glucose strictly regulated."
    ],
    "adverseObservations": [
      "**Gastrointestinal Symptoms**: Nausea and loose stools can occur during early titration; gradual escalation minimises distress.",
      "**Heart Rate Sensitivity**: Due to glucagon receptor potency, resting heart rate should be monitored.",
      "**Proper Reconstitution Protocols**: Dissolve gently in Bacteriostatic Water without vortexing; refrigerate at 2°C–8°C."
    ]
  },
  {
    "id": "aod-9604",
    "compoundName": "AOD-9604",
    "handles": [
      "aod-9604",
      "aod9604",
      "hgh-fragment-analog"
    ],
    "subtitle": "Modified C-Terminus hGH Fragment 177–191 Lipolytic Research Standard",
    "longDescription": "**What it is:** AOD-9604 (Advanced Obesity Drug-9604) is a synthetic 16-amino-acid peptide derived from the C-terminal region (amino acids 177–191) of human growth hormone, with an added tyrosine residue for stability.\n\n**How it works:** It isolates the fat-burning (lipolytic) domain of growth hormone without interacting with the growth hormone receptor. This means it triggers fat breakdown (lipolysis) and stops new fat storage (lipogenesis) without increasing IGF-1, without affecting blood sugar, and without promoting organ enlargement or cellular proliferation.\n\n**Why researchers study it:** Studied for targeted fat loss without hormonal side effects, cartilage and joint regeneration, repairing osteoarthritis damage, and metabolic health with an exceptional safety profile.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "aod-9604",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Inject 2.0 mL diluent slowly down the glass wall. Gently swirl in a horizontal circular motion for 45 seconds. Do not vortex.",
      "resultingConcentrationMgPerMl": 2.5,
      "handlingRule": "Clear, colorless aqueous solution. Visually inspect for clarity prior to withdrawal."
    },
    "dosing": {
      "standardDoseDisplay": "300 mcg – 500 mcg daily",
      "standardDoseMcg": 300,
      "cadence": "1x Daily (Fasted Morning SubQ)",
      "halfLife": "~30 Minutes (Rapid plasma clearance; triggers sustained lipolytic signaling without IGF-1 elevation)",
      "typicalProtocolDuration": "8 to 12 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initial Lipolytic Calibration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "250 mcg – 300 mcg daily",
          "doseMcg": 300,
          "cadence": "1x Daily (Morning Fasted)",
          "focus": "Stimulation of beta-3 adrenergic receptors on adipocytes and baseline lipolytic activation",
          "notes": "12.0 units (0.12 mL) on U-100 syringe at 2.5 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Lipolytic Oxidation",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "500 mcg daily",
          "doseMcg": 500,
          "cadence": "1x Daily (Morning Fasted or Pre-Cardio)",
          "focus": "Inhibition of acetyl-CoA carboxylase, fatty acid release, and non-glycemic lipid breakdown",
          "notes": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Observation & Reset",
          "timeframe": "Weeks 11–12",
          "doseDisplay": "Washout Window",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Adipocyte receptor sensitivity equilibrium observation",
          "notes": "Maintain 4-week cessation window between experimental blocks"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "12.0 units (0.12 mL)",
      "graduations": [
        {
          "doseDisplay": "250 mcg (Low Dose Calibration)",
          "doseMcg": 250,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "300 mcg (Standard Daily Target)",
          "doseMcg": 300,
          "volumeMl": 0.12,
          "syringeIU": 12,
          "tickLabel": "12.0 units (0.12 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (High Output Target)",
          "doseMcg": 500,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C dry freezer (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "221231-10-3",
      "pubchemCid": 71300630,
      "sequenceOrFormula": "Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe (Disulfide bridge Cys7-Cys14)",
      "molecularWeightGPerMol": 1815.1
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 11713213",
        "notes": "Heffernan et al. The effects of human GH and its lipolytic fragment (AOD9604) on lipid metabolism."
      },
      {
        "sourceReference": "PubMed PMID: 26275694",
        "notes": "Kwon et al. Effect of Intra-articular Injection of AOD9604 with or without Hyaluronic Acid in Rabbit Osteoarthritis Model."
      },
      {
        "sourceReference": "PubMed PMID: 25208511",
        "notes": "Cox et al. Detection and in vitro metabolism of AOD9604."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Pure Lipolysis Without Hormonal Growth**: Stimulates fat burning and blocks fat accumulation without elevating IGF-1 or causing tissue proliferation.",
      "**Zero Blood Glucose or Insulin Disruption**: Unlike full growth hormone, AOD-9604 has zero negative impact on blood sugar, insulin sensitivity, or diabetes risk.",
      "**Cartilage Repair & Osteoarthritis Relief**: Extensively studied for repairing damaged articular cartilage and promoting chondrocyte regeneration when administered intra-articularly or systemically.",
      "**High Safety Margin & Tolerability**: Excellent safety record with minimal systemic side effects or hormonal suppression in preclinical studies.",
      "**Preserves Muscle Tissue During Caloric Deficits**: Allows fat oxidation without sacrificing muscle protein or functional tissue."
    ],
    "adverseObservations": [
      "**Localized Injection Discomfort**: Occasional mild redness, swelling, or itching at the injection point.",
      "**Mild Headache**: Infrequent, mild transient headaches reported during early research sessions.",
      "**Storage Integrity**: Highly sensitive to heat and moisture; maintain lyophilized powder at -20°C and reconstituted solution at 2°C–8°C."
    ]
  },
  {
    "id": "5-amino-1mq",
    "compoundName": "5-Amino-1MQ",
    "handles": [
      "5-amino-1mq",
      "5amino1mq",
      "nnmt-inhibitor"
    ],
    "subtitle": "Selective Small-Molecule Nicotinamide N-Methyltransferase (NNMT) Inhibitor Standard",
    "longDescription": "**What it is:** 5-Amino-1MQ is a small-molecule chemical compound that acts as a selective, membrane-permeable inhibitor of NNMT (Nicotinamide N-methyltransferase), an enzyme overexpressed in fat tissue of obese individuals.\n\n**How it works:** By blocking NNMT, 5-Amino-1MQ stops the wasteful methylation of nicotinamide. This dramatically boosts intracellular NAD+ levels and SAM (S-adenosylmethionine) concentrations, which in turn revs up SIRT1 longevity enzymes and turns white fat cells into active, fat-burning metabolic furnaces without affecting the central nervous system.\n\n**Why researchers study it:** Researched for cellular energy enhancement, reversing diet-induced obesity, preventing muscle atrophy, improving muscle stem cell function, and boosting mitochondrial longevity.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "5-amino-1mq",
    "deliveryRoutes": ["oral", "subq"],
    "oralGuide": {
      "defaultSuspensionMl": 10.0,
      "deviceLabel": "Calibrated oral dropper (1 mL graduations)",
      "notes": "5-Amino-1MQ is dissolved into a liquid vehicle (PEG-400 or sterile water). A calibrated oral dropper delivers precise mL volumes; no syringe or needle required."
    },
    "reconstitution": {
      "defaultVialNetMg": 500,
      "defaultDiluentMl": 10,
      "solvent": "Sterile Deionized Water USP or Polyethylene Glycol (PEG-400) Research Vehicle",
      "dissolutionMethod": "Introduce 10.0 mL sterile solvent slowly into the 500 mg powder. Swirl or vortex gently for 90 seconds until the yellow crystalline salt is completely dissolved into a clear, uniform yellow solution.",
      "resultingConcentrationMgPerMl": 50,
      "handlingRule": "Clear golden-yellow solution. Protect from direct light and high temperatures."
    },
    "dosing": {
      "standardDoseDisplay": "50 mg – 100 mg daily",
      "standardDoseMcg": 50000,
      "cadence": "1x Daily (Morning Oral/Oral Research Suspension)",
      "halfLife": "~4–6 Hours (Intracellular NNMT enzymatic inhibition persists >24h)",
      "typicalProtocolDuration": "8 to 12 Weeks continuous assay",
      "washoutPeriod": "4 Weeks between cohorts",
      "titrationSteps": [
        {
          "stage": "Phase 1: Enzymatic Baseline Titration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "50 mg daily (50,000 mcg)",
          "doseMcg": 50000,
          "cadence": "1x Daily (Morning with Food)",
          "focus": "Selective inhibition of NNMT, preventing 1-methylnicotinamide (1-MNA) accumulation and elevating cellular NAD+ levels",
          "notes": "100.0 units (1.00 mL) from 50.0 mg/mL solution (or 50 mg analytical capsule)"
        },
        {
          "stage": "Phase 2: Metabolic Optimization",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "100 mg daily (100,000 mcg)",
          "doseMcg": 100000,
          "cadence": "1x Daily (or 50 mg BID)",
          "focus": "Upregulation of SIRT1 signaling, mitochondrial biogenesis, and muscle fiber hypertrophy",
          "notes": "2.00 mL total volume daily (or 2 x 50 mg capsules)"
        },
        {
          "stage": "Phase 3: Epigenetic Reset & Washout",
          "timeframe": "Weeks 11–12",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of persistent metabolic rate and NAD+ pool homeostasis",
          "notes": "4-week cessation window to verify long-term cellular adaptation"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "100.0 units (1.00 mL)",
      "graduations": [
        {
          "doseDisplay": "25 mg (Micro Dose)",
          "doseMcg": 25000,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "50 mg (Standard Daily Target)",
          "doseMcg": 50000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 30 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "42464-96-0",
      "pubchemCid": 950107,
      "sequenceOrFormula": "C10H11N2+ (Iodide salt)",
      "molecularWeightGPerMol": 286.11
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 29155147",
        "notes": "Neelakantan et al. Selective and membrane-permeable small molecule inhibitors of nicotinamide N-methyltransferase reverse high fat diet-induced obesity in mice (Biochem Pharmacol)."
      },
      {
        "sourceReference": "PubMed PMID: 41543936",
        "notes": "Gao et al. NNMT inhibition counteracts tubular senescence and fibrosis in early stages of chronic kidney disease."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Selective NNMT Enzyme Inhibition**: Shuts down the metabolic brake on fat burning by inhibiting NNMT directly inside adipocytes.",
      "**Significantly Elevates Cellular NAD+ Levels**: Restores intracellular NAD+ pools, activating SIRT1 enzymes and mitochondrial biogenesis.",
      "**Shrinks Fat Cells Without Muscle Loss**: Decreases adipocyte cell size by over 30% in animal studies while simultaneously preserving or building skeletal muscle.",
      "**Reverses Diet-Induced Metabolic Resistance**: Restores healthy insulin sensitivity and lipid balance in high-fat diet models.",
      "**Muscle Stem Cell Activation & Strength**: Enhances muscle regeneration and contractile force in injured and aging muscle fibers."
    ],
    "adverseObservations": [
      "**Mild Gastrointestinal Upset**: When researched orally, occasional mild nausea or stomach discomfort can occur; administering with food is standard.",
      "**Cellular Methylation Dynamics**: Modulates methyl pools; researchers often balance protocols with methyl donors (like TMG or B-vitamins).",
      "**Moisture Protection Required**: Protect bulk powder from ambient humidity; store desiccated in airtight containers."
    ]
  },
  {
    "id": "tesofensine",
    "compoundName": "Tesofensine",
    "handles": [
      "tesofensine",
      "ns2330",
      "triple-reuptake-tesofensine"
    ],
    "subtitle": "Triple Monoamine (DA/NE/5-HT) Reuptake Inhibitor Metabolic Research Standard",
    "longDescription": "**What it is:** Tesofensine is a novel triple monoamine reuptake inhibitor that centrally inhibits the reuptake of dopamine, noradrenaline (norepinephrine), and serotonin in the synaptic cleft.\n\n**How it works:** Originally developed for neurodegenerative conditions like Parkinson's and Alzheimer's, researchers discovered that its triple reuptake blockade potently suppresses appetite and raises resting energy expenditure. By keeping dopamine and norepinephrine elevated in brain reward pathways, it eliminates food cravings and emotional eating while stimulating sympathetic fat burning.\n\n**Why researchers study it:** Studied for massive long-term weight reduction (10–12% in clinical trials), suppressing emotional and binge eating, neuroprotection, and increasing daytime alertness.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "tesofensine",
    "deliveryRoutes": [
      "oral"
    ],
    "oralGuide": {
      "defaultSuspensionMl": 20.0,
      "deviceLabel": "Calibrated oral dropper (1 mL marks)",
      "notes": "100 mg crystalline powder dissolved into 20.0 mL analytical vehicle yields 5.0 mg/mL stock solution."
    },
    "reconstitution": {
      "defaultVialNetMg": 100,
      "defaultDiluentMl": 20,
      "solvent": "Propylene Glycol / Sterile Saline Research Vehicle (50:50)",
      "dissolutionMethod": "Dissolve 100 mg crystalline powder into 20.0 mL analytical vehicle. Swirl gently until transparent. Provides a 5.0 mg/mL concentrated stock solution for micro-aliquot dilution.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Store at room temperature in dark desiccator."
    },
    "dosing": {
      "standardDoseDisplay": "250 mcg – 500 mcg daily",
      "standardDoseMcg": 500,
      "cadence": "1x Daily (Morning Oral Research Formulation)",
      "halfLife": "~220 Hours (~9 Days terminal elimination half-life)",
      "typicalProtocolDuration": "12 to 24 Weeks",
      "washoutPeriod": "8 Weeks (Required due to prolonged 9-day elimination half-life)",
      "titrationSteps": [
        {
          "stage": "Phase 1: Central Neurotransmitter Titration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "250 mcg daily (0.25 mg)",
          "doseMcg": 250,
          "cadence": "1x Daily (Morning)",
          "focus": "Steady-state central dopamine/noradrenaline reuptake calibration and appetite suppression onset",
          "notes": "5.0 units (0.05 mL) on U-100 syringe from 5.0 mg/mL stock"
        },
        {
          "stage": "Phase 2: Target Metabolic Acceleration",
          "timeframe": "Weeks 3–12",
          "doseDisplay": "500 mcg daily (0.50 mg)",
          "doseMcg": 500,
          "cadence": "1x Daily (Morning)",
          "focus": "Sustained resting energy expenditure increase, sympathetic thermogenesis, and deep appetite blunting",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Extended Washout Period",
          "timeframe": "Weeks 13–20",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of sustained behavioral satiety adaptation and prolonged 9-day clearance observation",
          "notes": "Mandatory 8-week washout period between cohorts"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "10.0 units (0.10 mL)",
      "graduations": [
        {
          "doseDisplay": "250 mcg (Phase 1 Starting Dose)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Standard Daily Target)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1000 mcg (Phase 2 Clinical High)",
          "doseMcg": 1000,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "20°C–25°C controlled room temperature protected from light (36 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 60 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "195875-84-4",
      "pubchemCid": 11370864,
      "sequenceOrFormula": "C17H23Cl2NO",
      "molecularWeightGPerMol": 328.28
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 18950853",
        "notes": "Astrup et al. Effect of tesofensine on bodyweight loss, body composition, and quality of life in obese patients: a randomised, double-blind, placebo-controlled trial (Lancet)."
      },
      {
        "sourceReference": "PubMed PMID: 21720440",
        "notes": "Sjodin et al. The effect of the triple monoamine reuptake inhibitor tesofensine on energy metabolism and appetite regulation."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Triple Monoamine Neurotransmitter Blockade**: Extends the activity of dopamine, norepinephrine, and serotonin in the brain's appetite regulation centers.",
      "**Potent Appetite & Craving Suppression**: Dramatically lowers daily caloric intake by eliminating cravings for high-sugar, high-fat foods.",
      "**Stimulates Resting Energy Expenditure**: Increases 24-hour fat oxidation and metabolic rate by 6% or more in metabolic chamber studies.",
      "**Enhanced Mood & Mental Alertness**: Dopamine modulation boosts focus, motivation, and positive mood during caloric deficits.",
      "**Long Biological Half-Life (~9 Days)**: Exceptional pharmacokinetic stability allows consistent, steady-state receptor engagement with once-daily research."
    ],
    "adverseObservations": [
      "**Mild Elevation in Heart Rate & Blood Pressure**: Sympathetic stimulation can raise resting heart rate (by 3–8 bpm) and mild systolic blood pressure; baseline monitoring is advised.",
      "**Insomnia or Sleep Disturbance**: Increased alertness can interfere with sleep if administered late in the day; best administered early morning.",
      "**Dry Mouth (Xerostomia) and Mild Jitteriness**: Common anticholinergic/noradrenergic side effects; maintain constant hydration.",
      "**Avoid Combining with SSRIs or Stimulants**: Strictly avoid combining with other serotonergic or stimulant compounds to prevent serotonin syndrome."
    ]
  },
  {
    "id": "liraglutide",
    "compoundName": "Liraglutide",
    "handles": [
      "liraglutide",
      "glp1-daily-liraglutide"
    ],
    "subtitle": "Daily Human GLP-1 Analogue (Arg34Lys26-(N-epsilon-(gamma-Glu(N-alpha-hexadecanoyl)))) Standard",
    "longDescription": "**What it is:** Liraglutide is a once-daily synthetic GLP-1 receptor agonist with 97% sequence homology to native human GLP-1, stabilized with a C16 fatty acid chain that extends its half-life to 13 hours.\n\n**How it works:** It binds to pancreatic GLP-1 receptors to promote insulin secretion in response to elevated blood glucose and reduces glucagon output. In the brain and gut, it slows stomach emptying and promotes satiety, helping reduce daily food consumption.\n\n**Why researchers study it:** Extensively studied as an authoritative benchmark for daily GLP-1 therapy in weight control, diabetes management, kidney protection, and cardiovascular risk reduction.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "liraglutide",
    "reconstitution": {
      "defaultVialNetMg": 18,
      "defaultDiluentMl": 3,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 3.0 mL diluent slowly down the glass wall. Swirl gently in horizontal circles for 60 seconds. Do not shake.",
      "resultingConcentrationMgPerMl": 6,
      "handlingRule": "Clear, colorless aqueous solution. Visually inspect for clarity prior to withdrawal."
    },
    "dosing": {
      "standardDoseDisplay": "0.6 mg – 1.8 mg daily progressive titration",
      "standardDoseMcg": 600,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "~13 Hours (Allows stable steady-state 24h coverage via daily administration)",
      "typicalProtocolDuration": "12 to 16 Weeks",
      "washoutPeriod": "2 to 3 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initial Calibration",
          "timeframe": "Week 1",
          "doseDisplay": "0.60 mg daily ",
          "doseMcg": 600,
          "cadence": "1x Daily (SubQ)",
          "focus": "Gastrointestinal adaptation and initial glucose-dependent insulin secretion",
          "notes": "10.0 units (0.10 mL) on U-100 syringe at 6.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Escalation Step 1",
          "timeframe": "Week 2",
          "doseDisplay": "1.20 mg daily ",
          "doseMcg": 1200,
          "cadence": "1x Daily",
          "focus": "Appetite suppression and glycemic control stabilization",
          "notes": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Therapeutic Step 2",
          "timeframe": "Week 3",
          "doseDisplay": "1.80 mg daily ",
          "doseMcg": 1800,
          "cadence": "1x Daily",
          "focus": "Visceral adiposity reduction and continuous satiety maintenance",
          "notes": "30.0 units (0.30 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 4: High Output Protocol",
          "timeframe": "Week 4+",
          "doseDisplay": "3.00 mg daily ",
          "doseMcg": 3000,
          "cadence": "1x Daily",
          "focus": "Maximum clinical trial endpoint evaluation",
          "notes": "50.0 units (0.50 mL) on U-100 syringe"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "10.0 units (0.10 mL)",
      "graduations": [
        {
          "doseDisplay": "0.60 mg (Week 1 Starting Dose)",
          "doseMcg": 600,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.20 mg (Week 2 Escalation)",
          "doseMcg": 1200,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.80 mg (Week 3 Target)",
          "doseMcg": 1800,
          "volumeMl": 0.3,
          "syringeIU": 30,
          "tickLabel": "30.0 units (0.30 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "3.00 mg (Phase 4 Maximum)",
          "doseMcg": 3000,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 30 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "204656-20-2",
      "pubchemCid": 16134956,
      "sequenceOrFormula": "C172H265N43O51",
      "molecularWeightGPerMol": 3751.2
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 26132939",
        "notes": "Pi-Sunyer et al. A Randomized, Controlled Trial of 3.0 mg of Liraglutide in Weight Management (SCALE Trial)."
      },
      {
        "sourceReference": "PubMed PMID: 27295427",
        "notes": "Marso et al. Liraglutide and Cardiovascular Outcomes in Type 2 Diabetes (LEADER Trial)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Established Daily GLP-1 Incretin Standard**: Backed by over a decade of comprehensive clinical data across millions of research subjects.",
      "**Proven Caloric Intake & Weight Reduction**: Delivers consistent, dose-dependent 8–10% body weight reductions in long-term models.",
      "**Cardiovascular and Renal Protection**: Reduces major adverse cardiovascular events and slows progression of diabetic kidney disease.",
      "**Tight Daily Glycemic Control**: Provides predictable 24-hour blood glucose regulation with an exceptional safety track record.",
      "**Suppresses Hepatic Glucose Output**: Prevents excess overnight liver glucose production."
    ],
    "adverseObservations": [
      "**Daily Subcutaneous Dosing Cadence**: Requires daily administration compared to newer weekly peptides (Semaglutide/Tirzepatide).",
      "**Transient Nausea & Reflux**: Nausea and stomach discomfort occur during initial dose titration; escalations in 0.6 mg weekly increments prevent distress.",
      "**Injection Site Rotating**: Subcutaneous administration site should be rotated daily across abdomen, thigh, and arm.",
      "**Refrigerate at 2°C–8°C**: Once opened, cartridges or vials must remain refrigerated."
    ]
  },
  {
    "id": "lemon-bottle",
    "compoundName": "Lemon Bottle",
    "handles": [
      "lemon-bottle",
      "lemonbottle",
      "lemon-bottle-lipolysis"
    ],
    "subtitle": "High-Concentration Riboflavin / Bromelain / Lecithin Adipocyte Lipolytic Solution Standard",
    "longDescription": "**What it is:** Lemon Bottle is a premium non-detergent lipolytic research formulation combining high-potency Riboflavin (Vitamin B2), Lecithin, and Bromelain (Ananas comosus proteolytic enzyme) optimized for targeted fat cell metabolism studies.\n\n**How it works:** Unlike sodium deoxycholate solutions that cause non-specific tissue necrosis, Lemon Bottle acts via metabolic adipocyte membrane destabilization. Lecithin breaks down localized triglyceride droplets into micro-emulsions; Bromelain hydrolyzes structural adipocyte collagen membranes while suppressing inflammatory edema; and Riboflavin (B2) accelerates cellular flavin adenine dinucleotide (FAD) beta-oxidation, mobilizing free fatty acids for metabolic clearance.\n\n**Why researchers study it:** Researched for targeted localized subcutaneous fat reduction (submental fullness, abdominal fat pads), accelerating adipocyte lipid metabolism without prolonged swelling or tissue fibrosis.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "lemon-bottle",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 10,
      "solvent": "Pre-formulated Sterile Aqueous Solution (Ready to Draw)",
      "dissolutionMethod": "Supplied as a ready-to-use liquid solution. Invert vial gently 3 times before laboratory sampling. Do not dilute further.",
      "resultingConcentrationMgPerMl": 1,
      "handlingRule": "Slightly yellow clear liquid. Keep refrigerated at 2°C–8°C. Protect from intense light."
    },
    "dosing": {
      "standardDoseDisplay": "1.0 mL – 3.0 mL per target localized zone",
      "standardDoseMcg": 1000,
      "cadence": "1x Every 7 to 10 Days (Localized SubQ research grid)",
      "halfLife": "~24 to 48 Hours (Localized tissue enzymatic action)",
      "typicalProtocolDuration": "3 to 5 Sessions",
      "washoutPeriod": "2 to 4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Session 1: Initial Local Tissue Tolerance",
          "timeframe": "Day 1",
          "doseDisplay": "1.0 mL – 2.0 mL total per zone",
          "doseMcg": 1000,
          "cadence": "Single session (0.2 mL per grid point)",
          "focus": "Observation of local adipocyte permeability and absence of excessive inflammatory swelling",
          "notes": "10–20 units (0.1–0.2 mL) per micro-injection point"
        },
        {
          "stage": "Sessions 2–4: Target Lipolysis Consolidation",
          "timeframe": "Weeks 2–6 (Every 7–10 days)",
          "doseDisplay": "2.0 mL – 3.0 mL total per zone",
          "doseMcg": 2000,
          "cadence": "1x Every 7 to 10 Days",
          "focus": "Maximal enzymatic lipid emulsion, bromelain fibrillar breakdown, and lymphatic clearance",
          "notes": "Spaced 1 cm apart in a uniform subcutaneous grid"
        },
        {
          "stage": "Post-Protocol Evaluation",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Window",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Measurement of localized skinfold thickness reduction and tissue contour remodeling",
          "notes": "Hydration protocols accelerate lipid transport"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe or 1.0 mL Tuberculin Syringe",
      "standardIUDisplay": "20.0 units (0.20 mL per grid point)",
      "graduations": [
        {
          "doseDisplay": "0.1 mL (Micro-Grid Point)",
          "doseMcg": 100,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "0.2 mL (Standard Grid Point)",
          "doseMcg": 200,
          "volumeMl": 0.2,
          "syringeIU": 20,
          "tickLabel": "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.0 mL (Total Zone Volume)",
          "doseMcg": 1000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "2°C–8°C refrigerated in original amber packaging (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 30 days after opening vial",
      "lightProtection": true
    },
    "molecularDetails": {
      "sequenceOrFormula": "Riboflavin (B2) + Lecithin + Bromelain Complex Solution"
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 15798993",
        "notes": "Rotunda et al. Lipomas treated with subcutaneous deoxycholate vs non-detergent lipolytic agents."
      },
      {
        "sourceReference": "PubMed PMID: 23304525",
        "notes": "Pavan et al. Properties and therapeutic application of bromelain: a review (Biotechnology Research International)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Non-Necrotic Adipocyte Lipolysis**: Destabilizes fat cell membranes metabolically without causing non-specific tissue destruction.",
      "**Minimal Post-Procedure Swelling**: Bromelain enzyme inhibits bradykinin and prostaglandin E2, suppressing local inflammatory edema.",
      "**Accelerated FAD Beta-Oxidation**: High-potency Riboflavin (Vitamin B2) fuels enzymatic cellular breakdown of released fatty acids.",
      "**Lecithin Triglyceride Emulsification**: Breaks dense lipid stores into tiny micro-droplets easily transported by lymphatic vessels.",
      "**Precise Localized Contouring**: Optimized for selective subcutaneous fat deposits resistant to generalized caloric deficits."
    ],
    "adverseObservations": [
      "**Mild Transient Bruising**: Mechanical micro-needle insertion can produce small local bruising at injection points.",
      "**Hydration Requirement**: Adequate fluid throughput in research subjects is necessary to support optimal lymphatic drainage.",
      "**Light Sensitivity**: Riboflavin degrades upon UV exposure; maintain solution in shaded, refrigerated storage."
    ]
  },
  {
    "id": "lipo-c-b12",
    "compoundName": "Lipo-C + B12",
    "handles": [
      "lipo-c-b12",
      "lipo-c",
      "lipotropic-b12",
      "mic-b12"
    ],
    "subtitle": "Methionine / Inositol / Choline + Cyanocobalamin Hepatic Lipotropic Mobilization Standard",
    "longDescription": "**What it is:** Lipo-C + B12 is an aqueous lipotropic formulation combining essential methyl donors and cofactors: L-Carnitine, Methionine, Inositol, Choline (MIC), and Cyanocobalamin (Vitamin B12).\n\n**How it works:** Choline and Inositol serve as essential structural components of phosphatidylcholine, necessary for the assembly and hepatic export of very-low-density lipoproteins (VLDL), preventing hepatic lipid accumulation. L-Carnitine shuttles long-chain fatty acids across the inner mitochondrial membrane via the carnitine palmitoyltransferase (CPT-1) system for ATP generation. Methionine and Vitamin B12 act as core methyl donors in the methionine-homocysteine cycle, regenerating S-adenosylmethionine (SAMe) and optimizing cellular energy metabolism.\n\n**Why researchers study it:** Studied for non-alcoholic fatty liver resistance, accelerating hepatic fat export, boosting mitochondrial ATP production, and improving metabolic rate in clinical research.",
    "category": "Metabolic Signaling & Incretins",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "lipo-c-b12",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 10,
      "solvent": "Pre-formulated Sterile Aqueous Solution (Ready to Draw)",
      "dissolutionMethod": "Supplied as a ready-to-use liquid solution. Invert vial gently 3 times before laboratory sampling. Do not dilute further.",
      "resultingConcentrationMgPerMl": 1,
      "handlingRule": "Clear red/pinkish liquid (due to B12 cyanocobalamin). Store at 15°C–25°C or refrigerated. Protect from light."
    },
    "dosing": {
      "standardDoseDisplay": "1.0 mL (Intramuscular or SubQ 1x to 2x weekly)",
      "standardDoseMcg": 1000,
      "cadence": "1x to 2x Weekly",
      "halfLife": "~24 Hours",
      "typicalProtocolDuration": "6 to 12 Weeks",
      "washoutPeriod": "4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Metabolic Priming",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "1.0 mL weekly",
          "doseMcg": 1000,
          "cadence": "1x Weekly",
          "focus": "Hepatic methyl donor saturation and baseline carnitine pool replenishment",
          "notes": "1.0 mL drawn via sterile syringe"
        },
        {
          "stage": "Phase 2: Target Lipotropic Export Phase",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "1.0 mL (1x to 2x weekly)",
          "doseMcg": 1000,
          "cadence": "1x or 2x Weekly (Every 3–4 days)",
          "focus": "Maximal VLDL hepatic lipid export, mitochondrial fatty acid oxidation, and ATP generation",
          "notes": "1.0 mL per administration"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 11–12",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of sustained hepatic enzyme stability and body composition changes",
          "notes": "4-week wash-out window"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard 1.0 mL or 3.0 mL Luer-Lock Syringe",
      "standardIUDisplay": "1.0 mL (100 units on U-100 syringe)",
      "graduations": [
        {
          "doseDisplay": "0.5 mL (Half Dose)",
          "doseMcg": 500,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.0 mL (Standard Dose)",
          "doseMcg": 1000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.5 mL (Maximum Target)",
          "doseMcg": 1500,
          "volumeMl": 1.5,
          "syringeIU": 150,
          "tickLabel": "1.5 mL on 3.0 mL syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "15°C–25°C controlled room temperature or refrigerated at 2°C–8°C (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 60 days after opening vial",
      "lightProtection": true
    },
    "molecularDetails": {
      "sequenceOrFormula": "Methionine + Inositol + Choline + L-Carnitine + Cyanocobalamin (B12)"
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 15159228",
        "notes": "Zeisel et al. Choline: critical role during fetal development and dietary requirements in adults."
      },
      {
        "sourceReference": "PubMed PMID: 15005834",
        "notes": "Vance et al. Phosphatidylcholine and hepatic lipid secretion: role of PEMT and CDP-choline pathways."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Hepatic VLDL Lipid Export**: Choline and inositol facilitate the synthesis of lipoproteins that carry fat away from the liver.",
      "**Mitochondrial Fatty Acid Transport**: L-Carnitine transfers long-chain acyl-CoA into mitochondrial matrix for beta-oxidation.",
      "**Enhanced Cellular Energy & Red Cell Synthesis**: Vitamin B12 cofactor drives cellular ATP synthesis and combats research fatigue.",
      "**Homocysteine & Methylation Support**: Methionine provides active methyl groups for detoxifying metabolic pathways.",
      "**Non-Stimulant Metabolic Acceleration**: Promotes natural fat turnover without elevating heart rate or blood pressure."
    ],
    "adverseObservations": [
      "**Mild Post-Injection Soreness**: Intramuscular administration may cause mild, temporary muscle tenderness.",
      "**Chromaturia (Red/Pink Urine)**: Harmless pinkish or reddish tint in urine following administration due to excess water-soluble Vitamin B12 excretion.",
      "**Light Protection**: Vitamin B12 is sensitive to photodegradation; keep vial in protective packaging."
    ]
  }
]
