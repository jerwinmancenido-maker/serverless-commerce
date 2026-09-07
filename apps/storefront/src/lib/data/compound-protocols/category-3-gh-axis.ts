import type { CompoundAnalyticalProtocol } from "./types"

export const CATEGORY_3_GH_AXIS_PROTOCOLS: CompoundAnalyticalProtocol[] = [
  {
    "id": "ipamorelin",
    "compoundName": "Ipamorelin",
    "handles": [
      "ipamorelin",
      "ipamorelin-vial",
      "ghs-ipamorelin"
    ],
    "subtitle": "Selective Pentapeptide Growth Hormone Secretagogue Receptor (GHS-R1a) Standard",
    "longDescription": "**What it is:** Ipamorelin is a synthetic pentapeptide (Aib-His-D-2-Nal-D-Phe-Lys-NH2) that belongs to the Growth Hormone Secretagogue (GHS) family and acts as a selective ghrelin receptor agonist.\n\n**How it works:** It selectively binds to the ghrelin/GHS-R1a receptor in the pituitary gland, triggering clean, natural pulses of growth hormone (GH) that closely mimic the body's natural youthful secretion patterns. Remarkably, unlike older GHRPs, Ipamorelin does not stimulate cortisol, prolactin, or ACTH, and causes minimal hunger spikes.\n\n**Why researchers study it:** Studied for deep slow-wave sleep enhancement, lean muscle preservation, accelerated wound and bone healing, body fat reduction, skin collagen synthesis, and anti-aging without hormonal side effects.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "ipamorelin",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Direct 2.0 mL diluent slowly down the glass wall. Swirl in horizontal circular motions for 45 seconds until powder dissolves completely into an optical-grade transparent solution. Avoid shaking.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Protect strictly from direct sunlight and repeated freezing."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg – 300 mcg daily",
      "standardDoseMcg": 200,
      "cadence": "1x to 2x Daily (Fasted, Pre-Bed or Post-Workout SubQ)",
      "halfLife": "~2 Hours (Selective somatotropic pulsatility without desensitization)",
      "typicalProtocolDuration": "8 to 12 Weeks",
      "washoutPeriod": "4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Baseline Secretagogue Calibration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily (Pre-Bed SubQ, 2h post-prandial)",
          "focus": "GHS-R1a receptor binding calibration without cortisol, prolactin, or aldosterone elevation",
          "notes": "2.0 units (0.02 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Somatotropic Pulsing",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "200 mcg – 300 mcg daily (or 150 mcg BID)",
          "doseMcg": 200,
          "cadence": "1x to 2x Daily (Morning Fasted / Pre-Bed)",
          "focus": "Peak nocturnal growth hormone surge, slow-wave sleep enhancement, and lean tissue preservation",
          "notes": "4.0 units (0.04 mL) on U-100 syringe (or 6.0 units for 300 mcg)"
        },
        {
          "stage": "Phase 3: Pituitary Somatotrope Washout",
          "timeframe": "Weeks 11–12",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Endogenous GHRH/somatostatin feedback equilibrium verification",
          "notes": "4-week cessation window prevents pituitary receptor downregulation"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "4.0 units (0.04 mL)",
      "graduations": [
        {
          "doseDisplay": "100 mcg (Micro Initiation)",
          "doseMcg": 100,
          "volumeMl": 0.02,
          "syringeIU": 2,
          "tickLabel": "2.0 units (0.02 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "200 mcg (Standard Target)",
          "doseMcg": 200,
          "volumeMl": 0.04,
          "syringeIU": 4,
          "tickLabel": "4.0 units (0.04 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "300 mcg (High Output Target)",
          "doseMcg": 300,
          "volumeMl": 0.06,
          "syringeIU": 6,
          "tickLabel": "6.0 units (0.06 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "170851-70-4",
      "pubchemCid": 9831659,
      "sequenceOrFormula": "Aib-His-D-2-Nal-D-Phe-Lys-NH2",
      "molecularWeightGPerMol": 711.86
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 9849822",
        "notes": "Raun et al. Ipamorelin, the first selective growth hormone secretagogue."
      },
      {
        "sourceReference": "PubMed PMID: 9879640",
        "notes": "Johansen et al. Pharmacokinetic evaluation of ipamorelin and other peptidyl growth hormone secretagogues."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Clean, Selective Growth Hormone Pulses**: Triggers natural pituitary GH release without elevating stress hormones (cortisol, ACTH) or prolactin.",
      "**Enhances Slow-Wave Deep Sleep**: Promotes restorative deep sleep cycles, accelerating cellular repair, brain detox, and morning recovery.",
      "**Accelerated Connective Tissue & Bone Healing**: Upregulates collagen synthesis, osteoblast bone mineral deposition, and joint healing.",
      "**Preserves Lean Muscle Mass**: Promotes nitrogen retention and muscle protein synthesis during intense physical training or caloric deficits.",
      "**Promotes Visceral & Subcutaneous Fat Burning**: Elevates nighttime fatty acid oxidation while keeping blood glucose stable.",
      "**Synergistic with GHRH Peptides**: Produces a massive, 5x–10x amplification of growth hormone when combined with CJC-1295 No DAC."
    ],
    "adverseObservations": [
      "**Transient Head Rush or Lightheadedness**: A brief, mild warm sensation or lightheadedness can occur 10–15 minutes post-injection as GH pulses.",
      "**Temporary Water Retention**: Mild fluid retention in the fingers or ankles during initial weeks as intracellular hydration increases.",
      "**Injection Timing Rules**: Best administered on an empty stomach (at least 2 hours after food) or right before sleep; carbohydrates and fats blunt GH release.",
      "**Injection Site Irritation**: Minor, transient redness at the injection point that fades within 30 minutes.",
      "**Reconstitution Guidelines**: Swirl gently with Bacteriostatic Water; store refrigerated at 2°C–8°C away from light."
    ]
  },
  {
    "id": "cjc-1295-no-dac",
    "compoundName": "CJC-1295 No DAC",
    "handles": [
      "cjc-1295-no-dac",
      "mod-grf-1-29",
      "cjc1295-nodac"
    ],
    "subtitle": "Tetrasubstituted GHRH 1-29 Pulsatile Growth Hormone Releasing Factor Standard",
    "longDescription": "**What it is:** CJC-1295 No DAC (also known as Mod GRF 1-29) is a synthetic 29-amino-acid peptide analogue of natural Growth Hormone Releasing Hormone (GHRH), modified with 4 amino acid substitutions to increase resistance to enzyme breakdown.\n\n**How it works:** It acts directly on the GHRH receptor on pituitary cells to stimulate the synthesis and natural pulsatile release of endogenous growth hormone. Because it lacks a Drug Affinity Complex (DAC), its half-life is approximately 30 minutes, allowing the pituitary gland to release GH in natural, healthy physiological pulses without exhausting the gland.\n\n**Why researchers study it:** Studied in synergy with Ipamorelin for deep sleep, lean muscle preservation, cellular rejuvenation, and fat loss while preserving natural pituitary pulsatility.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "cjc-1295-no-dac",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Gently rotate the vial horizontally for 45 seconds until powder is completely clear. Do not vortex or agitate.",
      "resultingConcentrationMgPerMl": 2,
      "handlingRule": "Clear, colorless aqueous solution. Maintain strictly refrigerated once reconstituted."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg daily (or 100 mcg 1–3x daily with Ipamorelin)",
      "standardDoseMcg": 100,
      "cadence": "1x to 3x Daily (Fasted SubQ)",
      "halfLife": "~30 Minutes (Physiological somatotropic pulsatility matching natural GHRH release)",
      "typicalProtocolDuration": "8 to 12 Weeks",
      "washoutPeriod": "4 Weeks between cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: GHRH Receptor Calibration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily (Pre-Bed)",
          "focus": "Anterior pituitary GHRH receptor affinity calibration and endogenous somatotropic pulse amplification",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 2.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Synergistic Co-Infusion Phase",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "100 mcg – 200 mcg daily",
          "doseMcg": 100,
          "cadence": "1x to 2x Daily (AM Fasted / PM Pre-Bed)",
          "focus": "Synergistic dual-pathway GH pulse creation when combined 1:1 with Ipamorelin",
          "notes": "5.0 units (0.05 mL) on U-100 syringe per administration"
        },
        {
          "stage": "Phase 3: Washout & Receptor Reset",
          "timeframe": "Weeks 11–12",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of sustained baseline somatotropic output and IGF-1 axis homeostasis",
          "notes": "4-week cessation window ensures receptor responsiveness"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "50 mcg (Micro Initiation)",
          "doseMcg": 50,
          "volumeMl": 0.025,
          "syringeIU": 2.5,
          "tickLabel": "2.5 units (0.025 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "100 mcg (Standard Target)",
          "doseMcg": 100,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "200 mcg (High Output Target)",
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
      "casNumber": "863288-34-0",
      "pubchemCid": 91885562,
      "sequenceOrFormula": "Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2",
      "molecularWeightGPerMol": 3367.97
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 16352683",
        "notes": "Teichman et al. Prolonged stimulation of growth hormone (GH) and insulin-like growth factor I secretion by CJC-1295."
      },
      {
        "sourceReference": "PubMed PMID: 15817669",
        "notes": "Jetté et al. Human growth hormone-releasing factor (hGRF)1-29 bioconjugates: identification of CJC-1295."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Physiological Pulsatile Growth Hormone Release**: Stimulates natural pituitary GH pulses without causing continuous, unphysiological receptor flooding.",
      "**Exceptional Synergy with Ipamorelin**: When combined with a GH secretagogue, GHRH and ghrelin pathways activate together to multiply GH output.",
      "**Accelerated Soft Tissue Repair**: Elevates systemic IGF-1 levels, driving amino acid uptake into tendons, ligaments, and muscle fibers.",
      "**Fat Loss and Metabolic Support**: Enhances lipolysis and resting metabolic rate during fasting and sleep windows.",
      "**Restores Youthful Hormone Balance**: Re-establishes healthy nocturnal growth hormone pulses that decline with age."
    ],
    "adverseObservations": [
      "**Temporary Facial Flushing**: Mild, warm redness in the face and neck within 10 minutes of injection due to transient vasodilation.",
      "**Mild Injection Site Stinging**: Temporary redness or tingling at the subcutaneous injection point.",
      "**Water Retention**: Mild extracellular water holding that typically stabilizes after the first two weeks.",
      "**Food Interaction**: Must be administered during a fasted state (at least 90–120 minutes away from carbohydrate/fat intake) for optimal results."
    ]
  },
  {
    "id": "cjc-1295-with-dac",
    "compoundName": "CJC-1295 with DAC",
    "handles": [
      "cjc-1295-dac",
      "cjc1295-dac",
      "long-acting-cjc"
    ],
    "subtitle": "Drug Affinity Complex Bioconjugated GHRH Extended Somatotropic Standard",
    "longDescription": "**What it is:** CJC-1295 with DAC is a synthetic GHRH analogue conjugated to a Drug Affinity Complex (DAC) that binds irreversibly to circulating serum albumin, extending its biological half-life to 6–8 days.\n\n**How it works:** By binding to blood albumin, CJC-1295 with DAC provides continuous, 24/7 stimulation of the pituitary GHRH receptor. This drives a sustained, around-the-clock elevation in baseline growth hormone and circulating IGF-1 levels from a single weekly or bi-weekly dose.\n\n**Why researchers study it:** Researched for long-acting growth hormone elevation, continuous tissue healing, sustained muscle preservation, and anti-catabolic support without requiring daily injections.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "cjc-1295-with-dac",
    "reconstitution": {
      "defaultVialNetMg": 2,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the vial glass wall. Swirl gently for 60 seconds until dissolved completely. Avoid shaking.",
      "resultingConcentrationMgPerMl": 1,
      "handlingRule": "Clear, colorless aqueous solution. Maintain strictly refrigerated once reconstituted."
    },
    "dosing": {
      "standardDoseDisplay": "1.0 mg – 2.0 mg weekly (1000 mcg – 2000 mcg)",
      "standardDoseMcg": 1000,
      "cadence": "1x to 2x Weekly (e.g., Mon / Thu SubQ)",
      "halfLife": "~6–8 Days (Prolonged half-life mediated via covalent albumin bioconjugation in vivo)",
      "typicalProtocolDuration": "8 to 12 Weeks",
      "washoutPeriod": "6 Weeks (Required due to continuous basal somatotrope stimulation)",
      "titrationSteps": [
        {
          "stage": "Phase 1: Albumin Conjugation Titration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "1.0 mg weekly (1000 mcg)",
          "doseMcg": 1000,
          "cadence": "1x Every 7 Days",
          "focus": "Steady-state albumin bioconjugation and basal growth hormone/IGF-1 elevation",
          "notes": "100.0 units (1.00 mL) on U-100 syringe at 1.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Basal Elevation",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "2.0 mg weekly (or 1.0 mg twice weekly)",
          "doseMcg": 2000,
          "cadence": "2x Weekly (e.g., Monday / Thursday)",
          "focus": "Continuous non-pulsatile IGF-1 elevation and systemic protein synthesis enhancement",
          "notes": "100.0 units (1.00 mL) per injection twice weekly"
        },
        {
          "stage": "Phase 3: Extended Washout Period",
          "timeframe": "Weeks 11–16",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Observation of delayed clearance and pituitary desensitization prevention",
          "notes": "Mandatory 6-week cessation window post-cycle"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "100.0 units (1.00 mL)",
      "graduations": [
        {
          "doseDisplay": "500 mcg (Half Dose)",
          "doseMcg": 500,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1000 mcg (Standard Target)",
          "doseMcg": 1000,
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
      "casNumber": "863288-34-0",
      "pubchemCid": 91971820,
      "sequenceOrFormula": "Tetrasubstituted GHRH 1-29 with (Maleimidopropionyl)-Lysine linker at C-terminus",
      "molecularWeightGPerMol": 3647.28
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 16352683",
        "notes": "Teichman et al. Prolonged stimulation of growth hormone (GH) and insulin-like growth factor I secretion by CJC-1295 in healthy adults."
      },
      {
        "sourceReference": "PubMed PMID: 15817669",
        "notes": "Jetté et al. Human growth hormone-releasing factor (hGRF)1-29 bioconjugates: identification of CJC-1295 as a long-lasting GRF analog."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Extended Half-Life (6–8 Days)**: Requires only once or twice weekly administration due to stable serum albumin binding.",
      "**Sustained Elevation in Baseline IGF-1**: Delivers around-the-clock elevated IGF-1 and GH levels for steady tissue repair and anabolism.",
      "**Deep Muscle Recovery & Sarcopenia Prevention**: Provides ongoing protein synthesis support in models of muscle wasting and injury recovery.",
      "**Continuous Fat Burning Stimulation**: Keeps baseline lipolytic pathways activated throughout the entire week.",
      "**Enhanced Bone Mineral Density**: Supports continuous osteoblast stimulation and calcium retention."
    ],
    "adverseObservations": [
      "**Non-Pulsatile Elevation Risks**: Continuous GH elevation can reduce insulin sensitivity over prolonged periods; blood glucose monitoring is recommended.",
      "**Peripheral Water Retention & Carpal Pressure**: Sustained IGF-1 levels can cause fluid retention in the wrists or ankles (mild numbness/tingling).",
      "**Occasional Injection Site Lump**: Mild subcutaneous firmness at the injection site that resolves over several days.",
      "**Mandatory Washout Cycles**: Research protocols typically recommend an 8-week cycle followed by 4–8 weeks off to allow pituitary receptors to reset."
    ]
  },
  {
    "id": "tesamorelin",
    "compoundName": "Tesamorelin",
    "handles": [
      "tesamorelin",
      "egrifta-component",
      "tesamorelin-vial"
    ],
    "subtitle": "Trans-3-Hexenoyl GHRH Analogue Visceral Adipose Mobilization Standard",
    "longDescription": "**What it is:** Tesamorelin is a synthetic 44-amino-acid peptide analogue of Growth Hormone-Releasing Hormone (GHRH), modified with a trans-3-hexenoic acid moiety at its N-terminus for enhanced metabolic stability.\n\n**How it works:** It acts on the pituitary gland to stimulate natural, pulsatile growth hormone release with remarkable potency. Uniquely among GHRH analogues, Tesamorelin specifically targets and reduces deep visceral adipose tissue (the dangerous fat packed around internal organs like the liver, heart, and intestines).\n\n**Why researchers study it:** Studied for visceral belly fat reduction, non-alcoholic fatty liver disease (NAFLD), improving cardiovascular risk markers, and enhancing cognitive function in aging subjects.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "tesamorelin",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl horizontally for 45 seconds until powder dissolves completely. Do not shake vigorously.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Visually inspect for complete clarity prior to withdrawal."
    },
    "dosing": {
      "standardDoseDisplay": "1.0 mg – 2.0 mg daily",
      "standardDoseMcg": 1000,
      "cadence": "1x Daily (Morning Fasted or Pre-Bed SubQ)",
      "halfLife": "~26–38 Minutes (Rapid somatotropic pulse with potent visceral lipolytic effect)",
      "typicalProtocolDuration": "8 to 16 Weeks",
      "washoutPeriod": "4 to 6 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation & Tolerance",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "1.0 mg daily (1000 mcg)",
          "doseMcg": 1000,
          "cadence": "1x Daily",
          "focus": "GHRH receptor activation and glycemic baseline stability monitoring",
          "notes": "20.0 units (0.20 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Visceral Lipolysis",
          "timeframe": "Weeks 3–12",
          "doseDisplay": "2.0 mg daily (2000 mcg)",
          "doseMcg": 2000,
          "cadence": "1x Daily",
          "focus": "Selective visceral adipose tissue (VAT) depletion, trunk fat reduction, and carotid intima-media thickness stabilization",
          "notes": "40.0 units (0.40 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Observation & Washout",
          "timeframe": "Weeks 13–16",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of sustained visceral adipose reduction post-stimulation",
          "notes": "4-week cessation window"
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
      "casNumber": "218949-48-5",
      "pubchemCid": 16137828,
      "sequenceOrFormula": "C221H366N72O67S (Trans-3-hexenoyl-GHRH 1-44)",
      "molecularWeightGPerMol": 5135.86
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 18057338",
        "notes": "Falutz et al. Metabolic effects of a growth hormone-releasing factor in patients with HIV (NEJM)."
      },
      {
        "sourceReference": "PubMed PMID: 31611038",
        "notes": "Stanley et al. Effects of tesamorelin on non-alcoholic fatty liver disease (Lancet)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Targeted Visceral Adipose Tissue Reduction**: Demonstrates unmatched capability in clinical trials to melt deep, hazardous visceral belly fat.",
      "**Reverses Hepatic Steatosis**: Lowers liver fat content and improves liver enzyme profiles in metabolic dysfunction models.",
      "**Cardiovascular and Lipid Improvements**: Substantially reduces circulating triglycerides, total cholesterol, and inflammatory C-reactive protein (CRP).",
      "**Cognitive Function & Brain Health**: Clinical trials show improved executive brain function and memory in aging and mild cognitive impairment models.",
      "**Preserves Natural Pituitary Feedback**: Stimulates growth hormone without shutting down the body's natural regulatory feedback loops."
    ],
    "adverseObservations": [
      "**Injection Site Irritation**: Up to 30% of subjects experience localized redness, itching, or minor swelling at the injection site.",
      "**Mild Joint & Muscle Aches**: Transient joint stiffness (arthralgia) or muscle tightness during early weeks as tissue fluid shifts.",
      "**Insulin Resistance Monitoring**: Elevated growth hormone can slightly increase fasting blood glucose; monitoring glycemic markers is prudent.",
      "**Diluent Technique**: Reconstitute gently with provided diluent; avoid vigorous shaking to protect the large 44-amino-acid chain."
    ]
  },
  {
    "id": "sermorelin",
    "compoundName": "Sermorelin",
    "handles": [
      "sermorelin",
      "sermorelin-acetate",
      "ghrh-1-29"
    ],
    "subtitle": "Bioidentical GHRH 1-29 Pituitary Neuroendocrine Peptide Standard",
    "longDescription": "**What it is:** Sermorelin (GRF 1-29) is a synthetic 29-amino-acid peptide representing the exact, shortest functional biological fragment of natural human Growth Hormone-Releasing Hormone (GHRH).\n\n**How it works:** It binds directly to pituitary GHRH receptors, encouraging the pituitary gland to naturally produce and secrete endogenous human growth hormone in physiological bursts. Because it triggers the body's own production rather than replacing hormone externally, somatostatin negative feedback remains fully intact, eliminating the risk of excess growth hormone overdosing.\n\n**Why researchers study it:** Studied as a gentle, natural anti-aging therapy, for restoring youthful sleep quality, boosting skin elasticity and muscle tone, and supporting natural hormone restoration.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "sermorelin",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Inject 2.5 mL diluent slowly down the glass wall. Swirl in horizontal circular motions for 45 seconds until powder dissolves completely. Do not shake.",
      "resultingConcentrationMgPerMl": 2,
      "handlingRule": "Clear, colorless aqueous solution. Keep refrigerated."
    },
    "dosing": {
      "standardDoseDisplay": "200 mcg – 500 mcg daily",
      "standardDoseMcg": 200,
      "cadence": "1x Daily (Pre-Bed Fasted SubQ)",
      "halfLife": "~10–12 Minutes (Rapid physiologic somatotrope stimulation; clears without pituitary suppression)",
      "typicalProtocolDuration": "8 to 16 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "200 mcg daily",
          "doseMcg": 200,
          "cadence": "1x Daily (Pre-Bed)",
          "focus": "Baseline GHRH receptor responsiveness and nocturnal slow-wave sleep somatotropic pulsing",
          "notes": "10.0 units (0.10 mL) on U-100 syringe at 2.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Somatotropic Optimization",
          "timeframe": "Weeks 3–12",
          "doseDisplay": "300 mcg – 500 mcg daily",
          "doseMcg": 300,
          "cadence": "1x Daily (Pre-Bed)",
          "focus": "Sustained physiological IGF-1 elevation, recovery, and cellular repair without receptor downregulation",
          "notes": "15.0 units (0.15 mL) on U-100 syringe (or 25.0 units for 500 mcg)"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 13–16",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Pituitary somatotrope equilibrium check",
          "notes": "4-week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "10.0 units (0.10 mL)",
      "graduations": [
        {
          "doseDisplay": "200 mcg (Standard Target)",
          "doseMcg": 200,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "300 mcg (Target Optimization)",
          "doseMcg": 300,
          "volumeMl": 0.15,
          "syringeIU": 15,
          "tickLabel": "15.0 units (0.15 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Ceiling Dose)",
          "doseMcg": 500,
          "volumeMl": 0.25,
          "syringeIU": 25,
          "tickLabel": "25.0 units (0.25 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "86168-78-7",
      "pubchemCid": 16132413,
      "sequenceOrFormula": "Tyr-Ala-Asp-Ala-Ile-Phe-Thr-Asn-Ser-Tyr-Arg-Lys-Val-Leu-Gly-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Met-Ser-Arg-NH2",
      "molecularWeightGPerMol": 3357.88
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 18031173",
        "notes": "Prakash et al. Sermorelin: a review of its use in the diagnosis and treatment of children with idiopathic growth hormone deficiency."
      },
      {
        "sourceReference": "PubMed PMID: 18046908",
        "notes": "Walker. Sermorelin: a better approach to management of adult-onset growth hormone insufficiency?"
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Natural Physiological Pituitary Stimulation**: Enhances the body's natural GH synthesis without shutting down internal endocrine feedback.",
      "**Improves Sleep Architecture & REM Stages**: Promotes deep restorative sleep, helping subjects wake feeling refreshed and energized.",
      "**Enhances Skin Tone, Hair & Collagen Quality**: Upregulates dermal fibroblasts, improving skin thickness, hydration, and elasticity.",
      "**Supports Lean Body Mass & Vitality**: Encourages gradual fat loss and lean body recomposition over 3–6 month research periods.",
      "**Zero Pituitary Shutdown Risk**: Retains natural somatostatin inhibition, ensuring the pituitary gland cannot be overstimulated."
    ],
    "adverseObservations": [
      "**Temporary Flushing & Warm Sensation**: Mild facial warmth within 15 minutes of administration.",
      "**Injection Site Sensitivity**: Minor redness or mild itching at the subcutaneous injection point.",
      "**Short Biological Half-Life**: Cleared quickly (half-life ~10–12 minutes); consistency in nightly administration before sleep is key.",
      "**Reconstitution & Cold Storage**: Keep lyophilized vials frozen; once reconstituted with Bacteriostatic Water, store at 2°C–8°C and use within 28 days."
    ]
  },
  {
    "id": "ghrp-2",
    "compoundName": "GHRP-2",
    "handles": [
      "ghrp-2",
      "ghrp2",
      "pralmorelin"
    ],
    "subtitle": "Potent Synthetic Hexapeptide Growth Hormone Secretagogue Standard",
    "longDescription": "**What it is:** GHRP-2 (Growth Hormone Releasing Peptide-2, or Pralmorelin) is a synthetic hexapeptide that acts as a potent agonist of the ghrelin/growth hormone secretagogue receptor.\n\n**How it works:** It stimulates the pituitary gland to release massive pulses of growth hormone. Compared to GHRP-6, GHRP-2 produces a significantly stronger growth hormone release while generating only a mild-to-moderate increase in appetite.\n\n**Why researchers study it:** Studied for intense muscle building, bone density enhancement, accelerating recovery from severe injuries, and treating growth hormone deficiency.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "ghrp-2",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Swirl gently horizontally for 45 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 2,
      "handlingRule": "Clear, colorless aqueous solution. Visually inspect for clarity prior to withdrawal."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg – 200 mcg daily",
      "standardDoseMcg": 100,
      "cadence": "1x to 3x Daily (SubQ)",
      "halfLife": "~30 Minutes (Fast somatotropic pulse with moderate prolactin/cortisol stimulation at high doses)",
      "typicalProtocolDuration": "8 to 12 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initial Calibration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily (Pre-Bed)",
          "focus": "Baseline GHS-R1a binding calibration and nocturnal somatotrope pulsing",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 2.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Pulsing",
          "timeframe": "Weeks 3–10",
          "doseDisplay": "100 mcg – 200 mcg 2x daily",
          "doseMcg": 100,
          "cadence": "2x Daily (AM Fasted / Pre-Bed)",
          "focus": "Pronounced somatotropic pulse generation and nitrogen retention",
          "notes": "5.0 units (0.05 mL) on U-100 syringe per administration"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 11–12",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Receptor desensitization prevention",
          "notes": "4-week cessation window"
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
          "doseDisplay": "200 mcg (High Target)",
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
      "casNumber": "158861-67-7",
      "pubchemCid": 6918296,
      "sequenceOrFormula": "D-Ala-D-2-Nal-Ala-Trp-D-Phe-Lys-NH2",
      "molecularWeightGPerMol": 817.98
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 26401470",
        "notes": "Bowers et al. One-year intranasal application of growth hormone releasing peptide-2 in children."
      },
      {
        "sourceReference": "PubMed PMID: 9390009",
        "notes": "Pihoker et al. Treatment effects of intranasal growth hormone releasing peptide-2 in children with growth hormone deficiency."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**High-Potency Growth Hormone Pulses**: Triggers very robust, sharp peaks in circulating growth hormone levels.",
      "**Accelerated Protein Synthesis & Lean Mass**: Drives nitrogen retention, cell volume expansion, and fast muscle repair.",
      "**Strengthens Bone Mineralization**: Promotes calcium retention and osteoblast activity in bone tissue models.",
      "**Moderate Appetite Stimulation**: Provides a helpful increase in appetite for research subjects needing caloric support without uncontrollable hunger.",
      "**Cardioprotective Properties**: Protects myocardial cells against ischemic damage and cellular stress."
    ],
    "adverseObservations": [
      "**Mild Cortisol and Prolactin Elevations**: Can cause modest, transient spikes in cortisol and prolactin at higher research doses.",
      "**Temporary Lethargy**: Some subjects experience post-injection tiredness as growth hormone surges.",
      "**Water Retention**: Mild subcutaneous fluid holding during initial weeks.",
      "**Cycle Cadence**: Best researched in 8–12 week blocks followed by a 4-week washout to prevent receptor desensitization."
    ]
  },
  {
    "id": "ghrp-6",
    "compoundName": "GHRP-6",
    "handles": [
      "ghrp-6",
      "ghrp6"
    ],
    "subtitle": "Orexigenic Ghrelin Hexapeptide Somatotrope & Gastric Motility Standard",
    "longDescription": "**What it is:** GHRP-6 (Growth Hormone Releasing Hexapeptide-6) is a first-generation synthetic hexapeptide growth hormone secretagogue that powerfully stimulates both growth hormone release and appetite.\n\n**How it works:** It acts on the ghrelin receptor in the pituitary gland and hypothalamus. In addition to triggering large growth hormone pulses, it strongly activates appetite-stimulating NPY neurons in the brain, inducing intense, rapid hunger cravings within 20–30 minutes of injection.\n\n**Why researchers study it:** Studied for overcoming severe muscle wasting (cachexia), accelerating joint and tendon repair, increasing caloric intake in low-appetite models, and neuroprotection.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "ghrp-6",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Swirl gently for 45 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 2,
      "handlingRule": "Clear, colorless aqueous solution. Protect from thermal degradation."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg daily (or 100 mcg 1–2x daily)",
      "standardDoseMcg": 100,
      "cadence": "1x to 2x Daily (SubQ)",
      "halfLife": "~20 Minutes (Potent ghrelin receptor stimulation; triggers marked orexigenic appetite surge)",
      "typicalProtocolDuration": "6 to 8 Weeks",
      "washoutPeriod": "4 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily (Pre-Bed or Post-Workout)",
          "focus": "Ghrelin receptor binding and acute somatotrope degranulation",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 2.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Ghrelinergic Pulse",
          "timeframe": "Weeks 3–6",
          "doseDisplay": "100 mcg – 150 mcg daily",
          "doseMcg": 100,
          "cadence": "1x to 2x Daily",
          "focus": "Growth hormone surge combined with accelerated gastric emptying and hyperphagia in cachexia models",
          "notes": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Appetite and receptor equilibrium observation",
          "notes": "4-week rest period"
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
          "doseDisplay": "150 mcg (Intermediate Dose)",
          "doseMcg": 150,
          "volumeMl": 0.075,
          "syringeIU": 7.5,
          "tickLabel": "7.5 units (0.075 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "87616-84-0",
      "pubchemCid": 4345065,
      "sequenceOrFormula": "His-D-Trp-Ala-Trp-D-Phe-Lys-NH2",
      "molecularWeightGPerMol": 873.01
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 22975043",
        "notes": "Bowers et al. History to the discovery of ghrelin: GHRP-6 development and somatotropic release."
      },
      {
        "sourceReference": "PubMed PMID: 11297568",
        "notes": "Bowers CY. Unnatural growth hormone-releasing peptide begets natural ghrelin."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Powerful Appetite Induction**: Strongly activates ghrelin receptors to stimulate immediate hunger, ideal for cachexia and bulking research.",
      "**Robust Growth Hormone Surges**: Delivers sharp, high-volume growth hormone pulses to accelerate tissue regeneration.",
      "**Anti-Inflammatory & Tissue Healing**: Exhibits strong protective effects on damaged stomach lining, tendons, and inflamed joints.",
      "**Cardioprotective & Cytoprotective**: Protects heart muscle and brain cells from ischemic injury and oxidative stress."
    ],
    "adverseObservations": [
      "**Intense Hunger Spikes**: Within 15–30 minutes, subjects experience extreme appetite surges that can make fasting difficult.",
      "**Cortisol & Prolactin Spikes**: Generates noticeable increases in cortisol and prolactin levels, especially at higher concentrations.",
      "**Water Retention**: Can cause significant temporary fluid holding in the limbs and face.",
      "**Receptor Desensitization**: Daily use can lead to tachyphylaxis (diminished response); intermittent pulsing or cycling is required."
    ]
  },
  {
    "id": "hexarelin",
    "compoundName": "Hexarelin",
    "handles": [
      "hexarelin",
      "examorelin"
    ],
    "subtitle": "Potent Hexapeptide Secretagogue & Cardioprotective CD36 Receptor Agonist Standard",
    "longDescription": "**What it is:** Hexarelin (Examorelin) is a synthetic hexapeptide that is recognized scientifically as the single most potent growth hormone secretagogue in the entire GHRP family.\n\n**How it works:** It binds strongly to the ghrelin receptor in the pituitary gland and also binds to CD36 receptors in cardiac and vascular tissues. It produces the largest growth hormone pulse of any peptide secretagogue, without increasing appetite. Furthermore, its CD36 binding gives it unmatched, direct cardioprotective and anti-ischemic properties.\n\n**Why researchers study it:** Studied for acute cardiovascular protection following heart attacks, intense tissue repair, severe tendon regeneration, and maximum growth hormone surges.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "hexarelin",
    "reconstitution": {
      "defaultVialNetMg": 5,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Swirl horizontally for 45 seconds until transparent. Do not shake.",
      "resultingConcentrationMgPerMl": 2,
      "handlingRule": "Clear, colorless aqueous solution. Highly sensitive to desensitization if administered continuously."
    },
    "dosing": {
      "standardDoseDisplay": "100 mcg – 200 mcg daily",
      "standardDoseMcg": 100,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "~70 Minutes (Highest somatotrope pulse intensity among GHRPs; CD36 myocardial protection)",
      "typicalProtocolDuration": "4 to 6 Weeks (Strictly cycled due to rapid tachyphylaxis)",
      "washoutPeriod": "4 to 6 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initial Calibration",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "100 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily",
          "focus": "Maximum acute somatotrope release and CD36 scavenger receptor mediated cardioprotection assays",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 2.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Cardioprotective Pulse",
          "timeframe": "Weeks 3–4",
          "doseDisplay": "100 mcg – 200 mcg daily",
          "doseMcg": 100,
          "cadence": "1x Daily",
          "focus": "Myocardial ischemia protection, cardiomyocyte apoptosis reduction, and peak growth hormone surge",
          "notes": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Mandatory Washout",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Mandatory cessation window to completely reverse somatotrope desensitization",
          "notes": "4–6 week rest period strictly recommended"
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
      "casNumber": "140703-51-1",
      "pubchemCid": 6918297,
      "sequenceOrFormula": "His-D-2-MeTrp-Ala-Trp-D-Phe-Lys-NH2",
      "molecularWeightGPerMol": 887.04
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 17112585",
        "notes": "Ghigo et al. Hexarelin, a novel growth hormone-releasing peptide, and endocrine responses."
      },
      {
        "sourceReference": "PubMed PMID: 9624598",
        "notes": "Imbimbo et al. Growth hormone-releasing activity of hexarelin in humans."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Maximum Growth Hormone Potency**: Delivers the highest peak growth hormone pulse of any known peptide secretagogue.",
      "**Direct Cardioprotective CD36 Receptor Action**: Protects heart tissue from ischemia, improves left ventricular function, and reduces cardiac cell death.",
      "**Zero Appetite Stimulation**: Does not trigger the intense hunger associated with GHRP-6, allowing strict diet management.",
      "**Intense Connective Tissue Healing**: Speeds up tendon, ligament, and bone healing in acute traumatic damage models.",
      "**Neuroprotective Qualities**: Shields brain tissue against ischemic stroke and inflammatory nerve injury."
    ],
    "adverseObservations": [
      "**Rapid Receptor Desensitization**: Due to its extreme potency, the pituitary gland downregulates receptors quickly; research cycles should be limited to 4–6 weeks.",
      "**Cortisol & Prolactin Elevation**: Noticeably elevates both cortisol and prolactin levels at standard doses.",
      "**Temporary Flushing & Blood Pressure Shifts**: Vasodilation can cause brief flushing, warmth, or mild dizziness immediately after injection.",
      "**Mandatory Rest Period**: Requires at least a 4-week washout between cycles to restore full pituitary sensitivity."
    ]
  },
  {
    "id": "mk-677",
    "compoundName": "MK-677",
    "handles": [
      "mk-677",
      "ibutamoren",
      "nutrobal"
    ],
    "subtitle": "Orally Active Non-Peptide Ghrelin Receptor GHS-R1a Agonist Monograph",
    "longDescription": "**What it is:** MK-677 (also known as Ibutamoren) is an orally active, non-peptide growth hormone secretagogue that functions as a potent, long-acting ghrelin receptor agonist.\n\n**How it works:** It binds to the ghrelin/GHS-R1a receptor in the brain and pituitary gland, sustained by a long biological half-life of 24 hours. A single oral dose stimulates continuous, multi-pulsatile growth hormone and IGF-1 secretion around the clock, without requiring any injections.\n\n**Why researchers study it:** Studied for combating muscle wasting, improving bone mineral density, increasing deep sleep stages, accelerating tendon repair, and enhancing overall body vitality through simple oral administration.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "mk-677",
    "reconstitution": {
      "defaultVialNetMg": 750,
      "defaultDiluentMl": 30,
      "solvent": "Propylene Glycol / Polyethylene Glycol (PEG-400) Research Liquid Vehicle",
      "dissolutionMethod": "Dissolve 750 mg pure powder into 30.0 mL analytical vehicle. Agitate gently until transparent. Yields a standardized 25.0 mg/mL oral research solution.",
      "resultingConcentrationMgPerMl": 25,
      "handlingRule": "Clear, transparent oral solution. Store at controlled room temperature away from excessive light."
    },
    "dosing": {
      "standardDoseDisplay": "10 mg – 25 mg daily (10,000 mcg – 25,000 mcg)",
      "standardDoseMcg": 10000,
      "cadence": "1x Daily (Morning or Pre-Bed Oral Research Formulation)",
      "halfLife": "~24 Hours (Sustained continuous 24-hour IGF-1 elevation via once-daily administration)",
      "typicalProtocolDuration": "8 to 16 Weeks",
      "washoutPeriod": "4 to 6 Weeks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initiation",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "10 mg daily (10,000 mcg)",
          "doseMcg": 10000,
          "cadence": "1x Daily (Pre-Bed)",
          "focus": "GHS-R1a binding calibration, appetite monitoring, and insulin sensitivity baseline",
          "notes": "0.40 mL (10 mg) via calibrated oral dropper"
        },
        {
          "stage": "Phase 2: Target Somatotropic Elevation",
          "timeframe": "Weeks 3–12",
          "doseDisplay": "20 mg – 25 mg daily",
          "doseMcg": 20000,
          "cadence": "1x Daily (Morning Fasted or Pre-Bed)",
          "focus": "Sustained serum IGF-1 and IGFBP-3 elevation, bone mineral density stimulation, and nitrogen retention",
          "notes": "0.80 mL – 1.00 mL (20 mg – 25 mg) daily"
        },
        {
          "stage": "Phase 3: Washout",
          "timeframe": "Weeks 13–16",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of persistent bone turnover markers and insulin sensitivity reset",
          "notes": "4–6 week rest period"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard 1.0 mL Calibrated Oral Dropper",
      "standardIUDisplay": "0.40 mL (10 mg)",
      "graduations": [
        {
          "doseDisplay": "10 mg (Starting Target)",
          "doseMcg": 10000,
          "volumeMl": 0.4,
          "syringeIU": 40,
          "tickLabel": "0.40 mL on oral dropper (10 mg)"
        },
        {
          "doseDisplay": "25 mg (Standard Target)",
          "doseMcg": 25000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "1.00 mL on oral dropper (25 mg)"
        }
      ]
    },
    "storage": {
      "lyophilized": "20°C–25°C room temperature protected from light (36 months)",
      "reconstituted": "15°C–25°C room temperature; use within 90 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "159752-10-0",
      "pubchemCid": 178024,
      "sequenceOrFormula": "C27H36N4O5S (Mesylate salt)",
      "molecularWeightGPerMol": 624.77
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 9467534",
        "notes": "Murphy et al. MK-677, an orally active growth hormone secretagogue, reverses diet-induced catabolism."
      },
      {
        "sourceReference": "PubMed PMID: 18981485",
        "notes": "Nass et al. Effects of an oral ghrelin mimetic on body composition and clinical outcomes in healthy older adults (Ann Intern Med)."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**100% Orally Bioavailable (No Injections)**: Highly stable oral compound that eliminates the need for needles or subcutaneous injections.",
      "**24-Hour Sustained GH and IGF-1 Elevation**: A single daily dose elevates circulating growth hormone and IGF-1 levels continuously for 24 hours.",
      "**Deep REM and Stage 4 Sleep Enhancement**: Documented in clinical trials to improve deep slow-wave sleep duration by up to 50%.",
      "**Reverses Muscle Catabolism**: Promotes nitrogen retention and prevents muscle wasting during caloric restriction or trauma.",
      "**Boosts Bone Mineral Density**: Significantly increases osteocalcin and bone turnover markers in bone density research.",
      "**Skin, Hair & Nail Quality Improvement**: Elevated IGF-1 promotes collagen synthesis, improving hair thickness and skin elasticity."
    ],
    "adverseObservations": [
      "**Increased Appetite (Ghrelin Activation)**: Significantly ramps up hunger during the first 2–4 weeks; research subjects should plan meals in advance.",
      "**Water Retention (Edema)**: Mild swelling in hands and lower legs is common during early weeks as intracellular hydration increases.",
      "**Mild Insulin Sensitivity Shift**: Elevated growth hormone over long periods can mildly reduce insulin sensitivity; monitoring fasting blood glucose is recommended.",
      "**Morning Grogginess**: If taken too late in the evening, enhanced deep sleep can cause temporary lethargy upon waking."
    ]
  },
  {
    "id": "hgh-somatropin",
    "compoundName": "HGH (Somatropin 191AA)",
    "handles": [
      "hgh-somatropin",
      "hgh",
      "somatropin",
      "hgh-somatropin-laboratory-handling",
      "hgh-24iu",
      "hgh-15iu"
    ],
    "subtitle": "Recombinant 191-Amino-Acid Somatropin Growth Hormone Receptor (GHR) Agonist Standard",
    "longDescription": "**What it is:** Recombinant Somatropin is a 191-amino-acid single-chain polypeptide hormone identical in sequence and tertiary conformation to native human pituitary growth hormone. Synthesized with two critical intramolecular disulfide bridges (Cys53–Cys165 and Cys182–Cys189), this authentic 191AA formulation is free of the non-human N-terminal methionine found in older 192AA somatrem variants, eliminating anti-hGH antibody formation.\n\n**How it works:** Somatropin binds extracellular Growth Hormone Receptors (GHR), inducing receptor homodimerization and intracellular signaling via the JAK2/STAT5b pathway. In hepatic tissue, this cascades into transcription and secretion of Insulin-like Growth Factor 1 (IGF-1) alongside ternary circulating carriers (IGFBP-3 and ALS). Concurrently, Somatropin exerts direct non-IGF-1-dependent lipolytic action in adipocytes by activating hormone-sensitive lipase (HSL) and downregulating lipoprotein lipase (LPL). In musculoskeletal tissues, it upregulates type I and type III collagen synthesis, stimulates chondrocyte proliferation in articular cartilage, and enhances cellular nitrogen retention.\n\n**Why researchers study it:** Researched extensively in cellular models of tendon, ligament, and fascial extracellular matrix regeneration, deep slow-wave somatotropic pulsatility, lipid oxidation without glycemic degradation, and endocrine longevity signaling.",
    "category": "Growth Hormone Axis",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "hgh-somatropin",
    "purityStandard": "≥99.0% (Recombinant High-Resolution RP-HPLC & SEC-HPLC Standard)",
    "reconstitution": {
      "defaultVialNetMg": 8,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Direct 2.0 mL diluent slowly down the glass wall. Swirl in horizontal circular motions for 60 seconds until crystal-clear. Never shake or vortex; mechanical agitation shears the tertiary protein structure and causes irreversible fibrillation.",
      "resultingConcentrationMgPerMl": 4,
      "handlingRule": "Crystal-clear aqueous solution. Inspect against a dark backdrop. Do not freeze once reconstituted; store strictly at 2°C–8°C."
    },
    "dosing": {
      "standardDoseDisplay": "2.0 IU daily",
      "standardDoseMcg": 667,
      "cadence": "1x Daily (Morning Fasted or Pre-Bed SubQ)",
      "halfLife": "~20–30 Minutes (IV clearance); ~2–4 Hours (SubQ terminal absorption); secondary circulating IGF-1 elevation sustained for 16–24 Hours",
      "typicalProtocolDuration": "12 to 24 Weeks per analytical research cycle",
      "washoutPeriod": "4 to 8 Weeks between experimental cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Baseline Receptor Sensitivity & Fluid Homeostasis",
          "timeframe": "Weeks 1–4",
          "doseDisplay": "1.0 IU daily",
          "doseMcg": 333,
          "cadence": "1x Daily (SubQ)",
          "focus": "GHR sensitivity calibration, baseline sodium/fluid homeostasis equilibration",
          "notes": "8.3 units (0.083 mL) on U-100 syringe at 12.0 IU/mL concentration"
        },
        {
          "stage": "Phase 2: Target Somatotropic & Lipolytic Activation",
          "timeframe": "Weeks 5–16",
          "doseDisplay": "2.0 IU daily",
          "doseMcg": 667,
          "cadence": "1x Daily (Morning Fasted or Pre-Bed SubQ)",
          "focus": "Peak lipolysis, hepatic IGF-1 induction, and type I/III collagen matrix synthesis",
          "notes": "16.7 units (0.167 mL) on U-100 syringe (or 20.0 units for 15 IU vial reconstituted with 1.5 mL)"
        },
        {
          "stage": "Phase 3: High-Demand Tissue Regeneration Block",
          "timeframe": "Weeks 17–24",
          "doseDisplay": "3.0 IU daily",
          "doseMcg": 1000,
          "cadence": "1x Daily or 1.5 IU BID",
          "focus": "Maximal connective tissue remodeling, chondrocyte proliferation, and cellular repair",
          "notes": "25.0 units (0.25 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 4: Pituitary Somatotrope Washout",
          "timeframe": "Weeks 25+",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Endogenous GHRH/somatostatin feedback equilibrium verification",
          "notes": "4 to 8 week cessation window maintains pituitary receptor responsiveness"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "16.7 units (0.167 mL)",
      "graduations": [
        {
          "doseDisplay": "1.0 IU (Initiation Target)",
          "doseMcg": 333,
          "volumeMl": 0.083,
          "syringeIU": 8.3,
          "tickLabel": "8.3 units (0.083 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2.0 IU (Standard Daily Target)",
          "doseMcg": 667,
          "volumeMl": 0.167,
          "syringeIU": 16.7,
          "tickLabel": "16.7 units (0.167 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "3.0 IU (Regenerative Target)",
          "doseMcg": 1000,
          "volumeMl": 0.25,
          "syringeIU": 25.0,
          "tickLabel": "25.0 units (0.25 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "4.0 IU (Ceiling Target)",
          "doseMcg": 1333,
          "volumeMl": 0.333,
          "syringeIU": 33.3,
          "tickLabel": "33.3 units (0.333 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator (24 months shelf-life); 2°C–8°C for 90 days",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days for optimal molecular stability",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "12629-01-5",
      "pubchemCid": 9833946,
      "sequenceOrFormula": "191-Amino-Acid Single-Chain Polypeptide with 2 Disulfide Bonds (C990H1528N262O300S7)",
      "molecularWeightGPerMol": 22124.8
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 10442564",
        "notes": "De Boer et al. Long-term effects of growth hormone replacement therapy on bone turnover, bone mineral density, and body composition."
      },
      {
        "sourceReference": "PubMed PMID: 20022872",
        "notes": "Velloso CP. Regulation of muscle mass by growth hormone and IGF-I."
      },
      {
        "sourceReference": "PubMed PMID: 16127118",
        "notes": "Doessing et al. Growth hormone stimulates the collagen synthesis in tendon and muscle."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Up-regulates Systemic and Local IGF-1 Signaling**: Triggers sustained hepatic synthesis of IGF-1 and its ternary complexes (IGFBP-3 and ALS) to drive cellular recovery.",
      "**Potent Adipocyte Lipolysis (HSL Activation)**: Direct stimulation of hormone-sensitive lipase mobilizes free fatty acids independently of glycemic shifts.",
      "**Accelerates Type I & III Collagen Deposition**: Significantly upregulates procollagen mRNA expression in tendons, ligaments, and skeletal muscle fascia.",
      "**Chondrocyte Proliferation in Articular Cartilage**: Promotes proteoglycan synthesis and joint surface matrix stabilization in preclinical models.",
      "**Enhanced Cellular Nitrogen Retention**: Improves amino acid transport kinetics and counteracts musculoskeletal catabolism.",
      "**Promotes Microvascular Tissue Perfusion**: Stimulates localized angiogenic factors to support tissue remodeling."
    ],
    "adverseObservations": [
      "**Transient Peripheral Fluid Shifts**: Rapid initiation can cause temporary mild edema in extremities; gradual titration mitigates fluid retention.",
      "**Mild Carpal Tunnel Sensitivity**: Temporary extracellular fluid expansion around median nerves may cause transient morning hand numbness.",
      "**Modulation of Insulin Sensitivity**: High concentrations can transiently alter glucose clearance; monitoring fasting parameters in research models is advised.",
      "**Shear Sensitivity**: High molecular weight protein requires gentle swirling; never vortex, freeze-thaw repeatedly, or expose to direct sunlight."
    ],
    "calculator": {
      "enabled": true,
      "title": "HGH Reconstitution & Volumetric Calculator",
      "defaultCompoundMass": "24",
      "compoundMassUnit": "IU",
      "defaultFinalVolumeMl": "2",
      "defaultTargetAmount": "2",
      "targetAmountUnit": "IU",
      "iuPerMg": 3,
      "deviceVolumeMl": "1",
      "deviceLabel": "U-100 Syringe (mL)",
      "roundingPrecision": 2,
      "instructions": "Calibrated for standard 24 IU vial reconstituted with 2.0 mL Bacteriostatic Water USP (12.0 IU/mL; 1.0 mL = 12 IU = 100 units). For 15 IU vials, reconstitute with 1.5 mL for 10.0 IU/mL."
    }
  }
]
