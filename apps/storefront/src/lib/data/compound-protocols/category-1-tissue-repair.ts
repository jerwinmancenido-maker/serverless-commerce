import type { CompoundAnalyticalProtocol } from "./types"

export const CATEGORY_1_TISSUE_REPAIR_PROTOCOLS: CompoundAnalyticalProtocol[] = [
  {
    "id": "bpc-157",
    "compoundName": "BPC-157",
    "handles": [
      "bpc-157",
      "bpc157",
      "bpc-157-vial"
    ],
    "subtitle": "Gastric Pentadecapeptide Laboratory Protocol & In-Vitro Angiogenesis Standard",
    "longDescription": "**What it is:** BPC-157 (Body Protection Compound-157) is a peptide composed of 15 amino acids, originally discovered in natural gastric digestive juices where it protects stomach tissue from acid and enzymes.\n\n**How it works:** In laboratory models, BPC-157 stimulates the formation of fresh microvascular blood vessels (angiogenesis) by activating early growth response-1 (egr-1) and VEGF receptor pathways. It also activates nitric oxide (eNOS) production to improve local blood flow, while upregulating collagen synthesis and cell migration directly at damaged tissue sites.\n\n**Why researchers study it:** Studied extensively for accelerating tendon, ligament, muscle, and gut lining healing, reducing systemic inflammation, and protecting gastrointestinal integrity from injury and ulceration.",
    "category": "Tissue Repair & Healing",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "bpc-157-vial",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Direct the needle bevel gently against the inside glass vial wall. Allow the vacuum to smoothly draw diluent into the vial without vigorous bubbling. Swirl in a continuous horizontal circular motion for 45–60 seconds. Do not invert or shake to prevent peptide shearing.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution once dissolved. Inspect against a dark backdrop for optical clarity before experimental use."
    },
    "dosing": {
      "standardDoseDisplay": "250 mcg – 500 mcg daily",
      "standardDoseMcg": 250,
      "cadence": "1x Daily (or 250 mcg BID / Twice Daily in acute soft tissue trauma models)",
      "halfLife": "~4–6 Hours (Systemic peptide stability; localized extracellular retention ~24h)",
      "typicalProtocolDuration": "4 to 6 Weeks per analytical research block",
      "washoutPeriod": "2 to 4 Weeks between experimental cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Initial Micro-Dose Calibration",
          "timeframe": "Days 1–7",
          "doseDisplay": "250 mcg daily",
          "doseMcg": 250,
          "cadence": "1x Daily (Morning SubQ)",
          "focus": "Baseline tissue tolerance, receptor saturation & local microvascular angiogenesis",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Active Tissue Regeneration Block",
          "timeframe": "Weeks 2–5",
          "doseDisplay": "500 mcg daily (or 250 mcg BID)",
          "doseMcg": 500,
          "cadence": "1x Daily or 250 mcg Twice Daily",
          "focus": "Accelerated collagen type I fibril deposition, tendon fibroblast outgrowth, and eNOS stimulation",
          "notes": "10.0 units (0.10 mL) on U-100 syringe once daily (or 5.0 units BID)"
        },
        {
          "stage": "Phase 3: Extracellular Matrix Consolidation & Washout",
          "timeframe": "Week 6+",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Systemic receptor reset and persistent collagen bundle cross-linking observation",
          "notes": "2–4 week cessation to observe persistent cellular healing dynamics"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "100 mcg (Micro Calibration)",
          "doseMcg": 100,
          "volumeMl": 0.02,
          "syringeIU": 2,
          "tickLabel": "2.0 units (0.02 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "250 mcg (Standard Daily Target)",
          "doseMcg": 250,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "500 mcg (Intensive Repair Target)",
          "doseMcg": 500,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "750 mcg (Acute Trauma Ceiling)",
          "doseMcg": 750,
          "volumeMl": 0.15,
          "syringeIU": 15,
          "tickLabel": "15.0 units (0.15 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dry desiccator protected from moisture and light (24 months shelf-life)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days for optimal molecular stability",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "137525-51-0",
      "pubchemCid": 9941957,
      "sequenceOrFormula": "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val (GEPPPGKPADDAGLV)",
      "molecularWeightGPerMol": 1419.53
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 21030672",
        "notes": "Sikiric et al. Brain-gut axis and pentadecapeptide BPC 157: Theoretical and practical implications in tissue repair."
      },
      {
        "sourceReference": "PubMed PMID: 20388954",
        "notes": "Chang et al. Promoting effect of BPC 157 on tendon healing involves tendon outgrowth, cell survival, and cell migration."
      },
      {
        "sourceReference": "PubMed PMID: 27847966",
        "notes": "Gwyer et al. Gastric pentadecapeptide BPC 157 accelerates musculoskeletal soft tissue healing."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Accelerates Tendon & Ligament Regeneration**: Stimulates tendon outgrowth, cell survival, and migration to repair connective tissues that normally have poor blood supply.",
      "**Promotes Microvascular Blood Flow (Angiogenesis)**: Upregulates VEGF and eNOS to build fresh capillary networks, delivering oxygen and vital nutrients directly to injured cells.",
      "**Gastrointestinal & Gut Lining Protection**: Rebuilds damaged intestinal mucosa, strengthens tight junctions, and shields digestive tissue from inflammatory and chemical damage.",
      "**Muscle & Soft Tissue Recovery**: Decreases recovery times in animal soft-tissue strain models by promoting rapid collagen type I synthesis and myofiber remodeling.",
      "**Counteracts NSAID-Induced Damage**: Shields the stomach, liver, and intestines against lesions caused by prolonged use of pain relievers and anti-inflammatory compounds.",
      "**Neuroprotective & Joint Cytoprotection**: Crosses systemic barriers to reduce inflammatory markers around peripheral nerves and articular cartilage surfaces."
    ],
    "adverseObservations": [
      "**Mild Injection Site Redness**: Temporary redness, warmth, or mild itching at the subcutaneous injection point that typically resolves within 30 to 60 minutes.",
      "**Occasional Mild Gastrointestinal Upset**: Rare, mild stomach cramping or loose stools when initiating research, often resolving as receptors adapt.",
      "**Blood Pressure & Dizziness Adjustments**: Temporary mild dizziness or blood pressure dips immediately following administration due to nitric oxide (eNOS) vasodilation.",
      "**Dosing Consistency & Tolerance**: Most research models utilize daily or twice-daily subcutaneous administration near the injury site for 4 to 6 weeks, followed by a 2-week washout.",
      "**Reconstitution & Cold Chain Stability**: Aseptic mixing with Bacteriostatic Water is required; gently swirl rather than shake to protect peptide bonds, and refrigerate between 2°C–8°C."
    ]
  },
  {
    "id": "tb-500",
    "compoundName": "TB-500",
    "handles": [
      "tb-500",
      "tb500",
      "tb-500-vial"
    ],
    "subtitle": "Synthetic Thymosin Beta-4 Ac-LKKTETQ Actin-Sequestration Research Monograph",
    "longDescription": "**What it is:** TB-500 is a synthetic version of the active healing region of Thymosin Beta-4, a naturally occurring protein found in high concentrations in blood platelets and wound fluid.\n\n**How it works:** Its primary mechanism is actin sequestration—it regulates actin, the essential protein cells use to build their internal skeleton, move, and heal. By upregulating actin, TB-500 accelerates the migration of endothelial cells and fibroblasts to wound sites while calming overactive inflammatory signals like NF-kB.\n\n**Why researchers study it:** Studied for broad systemic healing, cardiac muscle protection, reducing scar tissue and fibrosis, improving joint flexibility, and repairing skeletal muscle fibers.",
    "category": "Tissue Repair & Healing",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "tb-500",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Introduce 2.0 mL diluent slowly down the glass wall. Allow the cake to hydrate naturally for 60 seconds without agitation, then roll the vial gently between palms. Avoid vortexing to prevent molecular degradation.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless solution. Maintain strictly refrigerated once reconstituted."
    },
    "dosing": {
      "standardDoseDisplay": "2.5 mg twice weekly (5.0 mg/week total)",
      "standardDoseMcg": 2500,
      "cadence": "2x Weekly (e.g., Monday / Thursday SubQ)",
      "halfLife": "~24–36 Hours (Biological tissue effect extends up to 7–10 days via actin sequestration)",
      "typicalProtocolDuration": "6 to 8 Weeks",
      "washoutPeriod": "4 Weeks between experimental series",
      "titrationSteps": [
        {
          "stage": "Phase 1: Loading & Systemic Distribution",
          "timeframe": "Weeks 1–4",
          "doseDisplay": "2.5 mg twice weekly (5.0 mg/week)",
          "doseMcg": 2500,
          "cadence": "2x Weekly (e.g., Mon / Thu)",
          "focus": "Actin upregulation, capillary endothelial cell migration, and systemic tissue perfusion",
          "notes": "50.0 units (0.50 mL) on U-100 syringe per administration"
        },
        {
          "stage": "Phase 2: Maintenance & Matrix Remodeling",
          "timeframe": "Weeks 5–8",
          "doseDisplay": "2.5 mg once weekly",
          "doseMcg": 2500,
          "cadence": "1x Every 7 Days",
          "focus": "Sustained microvascular matrix maintenance, reducing chronic fibrotic scar formation",
          "notes": "50.0 units (0.50 mL) on U-100 syringe once weekly"
        },
        {
          "stage": "Phase 3: Observation & Washout",
          "timeframe": "Weeks 9–12",
          "doseDisplay": "Washout Window",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of sustained extracellular matrix tensile strength and actin equilibrium",
          "notes": "Maintain 4-week cessation window between experimental series"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "50.0 units (0.50 mL)",
      "graduations": [
        {
          "doseDisplay": "1.25 mg (Maintenance Fraction)",
          "doseMcg": 1250,
          "volumeMl": 0.25,
          "syringeIU": 25,
          "tickLabel": "25.0 units (0.25 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2.50 mg (Standard Target Dose)",
          "doseMcg": 2500,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "5.00 mg (Full Loading Dose)",
          "doseMcg": 5000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dark desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "885340-08-9",
      "pubchemCid": 45382195,
      "sequenceOrFormula": "Ac-Leu-Lys-Lys-Thr-Glu-Thr-Gln (Ac-LKKTETQ)",
      "molecularWeightGPerMol": 887.04
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 20536453",
        "notes": "Philp et al. Animal studies with thymosin beta4, a multifunctional tissue repair and regenerative peptide."
      },
      {
        "sourceReference": "PubMed PMID: 20536454",
        "notes": "Smart et al. Thymosin beta4 promotes endothelial progenitor cell differentiation and angiogenesis."
      },
      {
        "sourceReference": "PubMed PMID: 26096726",
        "notes": "Kleinman et al. Advances in the basic and clinical applications of thymosin beta4."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Rapid Cell Migration & Tissue Remodeling**: Mobilizes wound-healing cells across damaged areas to form smooth, healthy tissue rather than stiff scar tissue.",
      "**Systemic Cardiovascular & Heart Protection**: Promotes survival of cardiac muscle cells and stimulates new capillary growth following ischemic or oxygen-deprived events.",
      "**Reduces Chronic Inflammation & Fibrosis**: Downregulates NF-kB transcription factors, dampening chronic tissue inflammation and preventing excess fibrotic scarring.",
      "**Joint, Ligament & Muscle Flexibility**: Enhances flexibility, reduces stiffness, and accelerates recovery in repetitive strain and athletic tissue models.",
      "**Dermal & Wound Repair Acceleration**: Significantly speeds up superficial and deep dermal wound closure, epithelial migration, and keratinocyte turnover."
    ],
    "adverseObservations": [
      "**Transient Head Rush or Flushing**: A brief warm sensation, mild facial flushing, or lightheadedness may occur within 15 minutes of administration due to vascular shifts.",
      "**Localized Redness or Tenderness**: Minor subcutaneous irritation or temporary swelling at the injection site that fades within an hour.",
      "**Occasional Fatigue**: Temporary lethargy or tiredness reported during early loading cycles as the body prioritizes tissue repair processes.",
      "**Intermittent Dosing Cadence**: Typically researched on a twice-weekly loading schedule for 4 to 6 weeks, tapering to once weekly or bi-weekly maintenance.",
      "**Storage and Handling**: Highly stable in lyophilized powder; once mixed with Bacteriostatic Water, store strictly at 2°C–8°C away from heat and direct UV light."
    ]
  },
  {
    "id": "ghk-cu",
    "compoundName": "GHK-Cu",
    "handles": [
      "ghk-cu",
      "ghk-copper",
      "copper-peptide"
    ],
    "subtitle": "Copper Tripeptide Transcriptional Modulator & Matrix Reconstitution Standard",
    "longDescription": "**What it is:** GHK-Cu (Glycyl-L-Histidyl-L-Lysine Copper) is a naturally occurring human tripeptide chelated with a copper(II) ion, present in human plasma, saliva, and urine, where its levels decline significantly with age.\n\n**How it works:** GHK-Cu regulates over 4,000 human genes, shifting gene expression toward youthful cellular repair. It stimulates both collagen and elastin synthesis, enhances fibroblast production, activates nerve outgrowth, and acts as a potent antioxidant by quenching free radicals and toxic lipid peroxidation products.\n\n**Why researchers study it:** Studied extensively for skin rejuvenation, wrinkle reduction, wound repair, anti-aging, hair follicle stimulation, and reversing tissue fibrosis in organs and joints.",
    "category": "Tissue Repair & Healing",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "ghk-cu",
    "reconstitution": {
      "defaultVialNetMg": 50,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL Bacteriostatic Water slowly. Solution immediately turns characteristic deep royal blue. Swirl gently for 30 seconds. Do not sonicate, freeze-thaw repeatedly, or vortex.",
      "resultingConcentrationMgPerMl": 20,
      "handlingRule": "Clear royal blue aqueous solution. Precipitation or fading indicates pH imbalance or copper chelate dissociation."
    },
    "dosing": {
      "standardDoseDisplay": "1.0 mg – 2.0 mg daily",
      "standardDoseMcg": 1000,
      "cadence": "1x Daily (or cyclical 30-day research blocks)",
      "halfLife": "~1–2 Hours (Rapid systemic copper exchange; tissue extracellular retention ~48–72h)",
      "typicalProtocolDuration": "30 to 60 Days continuous trial series",
      "washoutPeriod": "30 Days between cycles to allow physiological copper clearance",
      "titrationSteps": [
        {
          "stage": "Phase 1: Micro-Dose Initiation",
          "timeframe": "Days 1–7",
          "doseDisplay": "1.0 mg daily (1000 mcg)",
          "doseMcg": 1000,
          "cadence": "1x Daily (SubQ)",
          "focus": "Baseline tissue tolerance, fibroblast activation & initial SOD1 upregulation",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 20.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Full Regenerative Block",
          "timeframe": "Days 8–30",
          "doseDisplay": "2.0 mg daily (2000 mcg)",
          "doseMcg": 2000,
          "cadence": "1x Daily (SubQ)",
          "focus": "Peak decorin expression, collagen I/III bundle fibrillogenesis, and anti-inflammatory cytokine modulation",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Copper Homeostasis Washout",
          "timeframe": "Days 31–60",
          "doseDisplay": "Cycle Washout",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Physiological copper clearance and observation of persistent collagen remodeling",
          "notes": "30-day rest period prevents copper accumulation in hepatic assays"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "500 mcg (Micro Calibration)",
          "doseMcg": 500,
          "volumeMl": 0.025,
          "syringeIU": 2.5,
          "tickLabel": "2.5 units (0.025 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.00 mg (Standard Target)",
          "doseMcg": 1000,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2.00 mg (High Output Target)",
          "doseMcg": 2000,
          "volumeMl": 0.1,
          "syringeIU": 10,
          "tickLabel": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "3.00 mg (Ceiling Protocol)",
          "doseMcg": 3000,
          "volumeMl": 0.15,
          "syringeIU": 15,
          "tickLabel": "15.0 units (0.15 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dark desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 28 days. Keep strictly shielded from direct light",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "49557-75-7",
      "pubchemCid": 139035031,
      "sequenceOrFormula": "[Cu2+]-Gly-His-Lys (Copper [2+] complex)",
      "molecularWeightGPerMol": 403.93
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 29760773",
        "notes": "Pickart et al. GHK-Cu: A copper peptide that protects against oxidative damage and stimulates stem cell regeneration."
      },
      {
        "sourceReference": "PubMed PMID: 25927873",
        "notes": "Pickart et al. GHK peptide as a natural modulator of multiple cellular pathways in human health and anti-aging."
      },
      {
        "sourceReference": "PubMed PMID: 16029679",
        "notes": "Maquart et al. In vivo stimulation of connective tissue accumulation by the tripeptide-copper complex glycyl-L-histidyl-L-lysine-Cu2+."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Stimulates Collagen & Elastin Synthesis**: Increases collagen production by over 70% in cellular assays, restoring structural elasticity and firmness to connective tissue.",
      "**Gene Expression Rejuvenation**: Modulates thousands of genes, resetting aging and damaged cells toward a healthier, more regenerative baseline.",
      "**Potent Anti-Fibrotic Activity**: Breaks down rigid, irregular scar collagen and replaces it with organized, healthy normal collagen fibers in skin and internal tissues.",
      "**Hair Follicle & Scalp Revitalization**: Enlarges miniaturized hair follicles, stimulates blood circulation around the scalp, and promotes active hair growth phases.",
      "**Antioxidant & Anti-Inflammatory Shield**: Neutralizes oxidative free radicals, suppresses inflammatory cytokines (TNF-alpha, IL-6), and protects cells from environmental toxins.",
      "**Nerve & Microvascular Outgrowth**: Promotes nerve regeneration, neurite sprouting, and capillary formation in wounded tissues."
    ],
    "adverseObservations": [
      "**Injection Site Stinging & Discomfort**: Due to copper chelation, subcutaneous administration can cause noticeable stinging or a localized dull ache for 10–30 minutes.",
      "**Localized Bruising or Blue/Green Tint**: Subcutaneous leakage can occasionally cause minor bruising with a faint copper hue that safely clears within 24–48 hours.",
      "**Blood Pressure Softening**: High concentrations can mildly lower blood pressure; staying hydrated and administering while seated is recommended.",
      "**Copper Saturation Precautions**: Prolonged, continuous high-dose research should be cycled with rest periods to avoid excessive systemic copper accumulation.",
      "**Reconstitution Dilution Tip**: Diluting with higher volume of Bacteriostatic Water (e.g. 3 mL instead of 1 mL) significantly reduces localized injection stinging."
    ]
  },
  {
    "id": "ghk-basic",
    "compoundName": "GHK Basic",
    "handles": [
      "ghk-basic",
      "ghk",
      "gly-his-lys"
    ],
    "subtitle": "Non-Chelated Tripeptide-1 Epigenetic Transcriptional Standard",
    "longDescription": "**What it is:** GHK Basic is the unchelated, copper-free version of the native Glycyl-L-Histidyl-L-Lysine tripeptide, allowing researchers to study the pure peptide carrier molecule independently from copper ions.\n\n**How it works:** Without a pre-bound copper ion, GHK Basic binds to endogenous trace copper and other minerals in biological fluids, naturally shuttling them into cells. It stimulates decorin synthesis, modulates inflammatory pathways, and supports extracellular matrix reorganization.\n\n**Why researchers study it:** Researched for tissue remodeling, cosmetic topical formulations, cellular antioxidant defenses, and as a gentle carrier peptide that avoids the localized stinging associated with pre-bound copper.",
    "category": "Tissue Repair & Healing",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "ghk-basic",
    "reconstitution": {
      "defaultVialNetMg": 50,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.5 mL diluent slowly. Unlike GHK-Cu, GHK Basic dissolves into an entirely water-clear, transparent solution without bluish tinge. Swirl gently for 30 seconds.",
      "resultingConcentrationMgPerMl": 20,
      "handlingRule": "Clear, colorless aqueous solution. Keep refrigerated and sealed under nitrogen or argon if stored long term."
    },
    "dosing": {
      "standardDoseDisplay": "1.0 mg – 2.0 mg daily",
      "standardDoseMcg": 1000,
      "cadence": "1x Daily (or topically/SubQ in wound assays)",
      "halfLife": "~30–60 Minutes (Rapid plasma clearance; acts via immediate gene expression modulation)",
      "typicalProtocolDuration": "30 to 45 Days",
      "washoutPeriod": "14 to 21 Days",
      "titrationSteps": [
        {
          "stage": "Phase 1: Baseline Epigenetic Calibration",
          "timeframe": "Days 1–7",
          "doseDisplay": "1.0 mg daily",
          "doseMcg": 1000,
          "cadence": "1x Daily",
          "focus": "DNA repair gene transcription without exogenous copper mineral loading",
          "notes": "5.0 units (0.05 mL) on U-100 syringe at 20.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Target Biological Assay",
          "timeframe": "Days 8–30",
          "doseDisplay": "2.0 mg daily",
          "doseMcg": 2000,
          "cadence": "1x Daily",
          "focus": "Decorin upregulation, TGF-beta balance, and anti-inflammatory signaling",
          "notes": "10.0 units (0.10 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Post-Assay Washout",
          "timeframe": "Days 31–45",
          "doseDisplay": "Washout Window",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Post-stimulation epigenetic transcript stability evaluation",
          "notes": "14–21 day rest window before starting next trial cycle"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "5.0 units (0.05 mL)",
      "graduations": [
        {
          "doseDisplay": "500 mcg (Low Dose)",
          "doseMcg": 500,
          "volumeMl": 0.025,
          "syringeIU": 2.5,
          "tickLabel": "2.5 units (0.025 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "1.00 mg (Standard Target)",
          "doseMcg": 1000,
          "volumeMl": 0.05,
          "syringeIU": 5,
          "tickLabel": "5.0 units (0.05 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "2.00 mg (High Target)",
          "doseMcg": 2000,
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
      "casNumber": "49557-75-7",
      "pubchemCid": 98288,
      "sequenceOrFormula": "Gly-His-Lys (GHK)",
      "molecularWeightGPerMol": 342.39
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 23067647",
        "notes": "Pickart et al. The human tripeptide GHK-Cu and GHK in tissue remodeling and gene modulation."
      },
      {
        "sourceReference": "PubMed PMID: 18644225",
        "notes": "Kang et al. Effects of GHK peptide on dermal fibroblast proliferation and migration."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Gentle Extracellular Matrix Remodeling**: Promotes cellular synthesis of collagen, elastin, and proteoglycans with zero injection stinging or tissue irritation.",
      "**Natural Mineral Chelator & Carrier**: Safely binds to ambient trace copper in bodily tissues, facilitating controlled, gentle delivery to healing cells.",
      "**Suppresses Inflammatory Cytokines**: Calms cellular stress and downregulates pro-inflammatory markers in dermal and mucosal cell cultures.",
      "**Ideal for Topical & Cosmetic Formulations**: Highly versatile in cosmetic chemistry for topical serum research and sensitive tissue applications."
    ],
    "adverseObservations": [
      "**Mild Injection Site Itching**: Occasional minor localized itching that resolves quickly without lasting irritation.",
      "**Lower Direct Copper Bioavailability**: Lacks the immediate copper delivery of GHK-Cu, meaning some copper-dependent enzymatic processes may proceed more gradually.",
      "**Proper Refrigeration Required**: Store reconstituted solution strictly at 2°C–8°C to prevent peptide chain breakdown."
    ]
  },
  {
    "id": "kpv",
    "compoundName": "KPV",
    "handles": [
      "kpv",
      "kpv-peptide",
      "alpha-msh-tripeptide"
    ],
    "subtitle": "C-Terminal alpha-MSH Tripeptide Nuclear NF-kappaB Translocation Inhibitor",
    "longDescription": "**What it is:** KPV is a potent natural tripeptide (Lysine-Proline-Valine) representing the active C-terminal fragment of alpha-Melanocyte-Stimulating Hormone (alpha-MSH).\n\n**How it works:** KPV enters the nucleus of cells and prevents the activation of NF-kB, the master switch of systemic inflammation, without triggering skin tanning or melanogenesis. In addition, KPV exhibits direct antimicrobial and antifungal properties by disrupting the cell walls of harmful microbes like Candida albicans and Staphylococcus aureus.\n\n**Why researchers study it:** Studied primarily for inflammatory bowel diseases (Crohn's disease, ulcerative colitis), severe dermatological inflammation (eczema, psoriasis), mast cell activation, and gut microbiome balance.",
    "category": "Tissue Repair & Healing",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "kpv",
    "reconstitution": {
      "defaultVialNetMg": 10,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Inject 2.0 mL diluent slowly down the vial glass wall. KPV wets immediately and enters solution within 30 seconds. Gently swirl horizontally. Do not shake.",
      "resultingConcentrationMgPerMl": 5,
      "handlingRule": "Clear, colorless aqueous solution. Visually inspect for clarity prior to withdrawal."
    },
    "dosing": {
      "standardDoseDisplay": "200 mcg – 400 mcg daily",
      "standardDoseMcg": 200,
      "cadence": "1x Daily (SubQ, or mucosal application in barrier models)",
      "halfLife": "~2–3 Hours (Direct local mucosal and cellular nuclear translocation)",
      "typicalProtocolDuration": "4 to 8 Weeks",
      "washoutPeriod": "2 Weeks between research blocks",
      "titrationSteps": [
        {
          "stage": "Phase 1: Inflammatory Suppression Calibration",
          "timeframe": "Days 1–7",
          "doseDisplay": "200 mcg daily",
          "doseMcg": 200,
          "cadence": "1x Daily",
          "focus": "Inhibition of NF-kappaB translocation and mucosal epithelial barrier stabilization",
          "notes": "4.0 units (0.04 mL) on U-100 syringe at 5.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Active Cytokine Downregulation",
          "timeframe": "Weeks 2–6",
          "doseDisplay": "400 mcg daily (or 200 mcg BID)",
          "doseMcg": 400,
          "cadence": "1x Daily or 200 mcg Twice Daily",
          "focus": "Suppression of IL-8, IL-1beta, TNF-alpha and microbial biofilm inhibition",
          "notes": "8.0 units (0.08 mL) on U-100 syringe (or 4.0 units BID)"
        },
        {
          "stage": "Phase 3: Epithelial Rest & Homeostasis",
          "timeframe": "Weeks 7–8",
          "doseDisplay": "200 mcg every other day",
          "doseMcg": 200,
          "cadence": "Every Other Day (QOD)",
          "focus": "Mucosal membrane resilience and gut microbiome equilibrium check",
          "notes": "4.0 units (0.04 mL) on U-100 syringe"
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
          "doseDisplay": "400 mcg (Intensive Target)",
          "doseMcg": 400,
          "volumeMl": 0.08,
          "syringeIU": 8,
          "tickLabel": "8.0 units (0.08 mL) on U-100 syringe"
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
      "lyophilized": "-20°C deep freeze (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 30 days",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "67727-97-3",
      "pubchemCid": 13294447,
      "sequenceOrFormula": "Lys-Pro-Val (C-terminal tripeptide of alpha-MSH)",
      "molecularWeightGPerMol": 383.49
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 12807987",
        "notes": "Kannengiesser et al. Melanocortin alpha-MSH and its C-terminal tripeptide KPV attenuate NF-kappaB activation and gastrointestinal inflammation."
      },
      {
        "sourceReference": "PubMed PMID: 16788249",
        "notes": "Land. KPV peptide: novel anti-inflammatory therapeutic approaches for inflammatory bowel disease."
      },
      {
        "sourceReference": "PubMed PMID: 20829871",
        "notes": "Dalmasso et al. PepT1-mediated transport of the anti-inflammatory tripeptide KPV in intestinal epithelial cells."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Deep Anti-Inflammatory Action via NF-kB Inhibition**: Enters cell nuclei directly to halt the production of inflammatory cytokines and enzymes at their genetic source.",
      "**Gut Mucosal Healing & IBD Research**: Documented to reduce colon inflammation, mucosal damage, and inflammatory infiltration in colitis and bowel disease models.",
      "**Zero Pigmentation or Tanning Effects**: Preserves the complete anti-inflammatory benefits of alpha-MSH while completely avoiding skin pigmentation or darkening.",
      "**Antimicrobial & Antifungal Properties**: Directly impairs the growth of pathogens including Candida and Staph without promoting drug-resistant superbugs.",
      "**Skin Barrier Restoration**: Calms severe flare-ups of eczema, psoriasis, and dermatitis when applied topically or researched systemically."
    ],
    "adverseObservations": [
      "**Transient Mild Nausea**: Rare, mild stomach queasiness when starting research on an empty stomach; administering after light nourishment prevents this.",
      "**Minimal Systemic Toxicity**: Generally very well tolerated in laboratory models due to its small tripeptide structure and natural biological occurrence.",
      "**Light and Moisture Sensitivity**: Lyophilized powder must be protected from humidity and UV light in a desiccated container."
    ]
  },
  {
    "id": "ara-290",
    "compoundName": "ARA-290",
    "handles": [
      "ara-290",
      "cibinetide",
      "ara290"
    ],
    "subtitle": "Non-Erythropoietic Innate Repair Receptor (IRR) Neuro-Regenerative Standard",
    "longDescription": "**What it is:** ARA-290 (also known as Cibinetide) is an engineered 11-amino-acid peptide designed from the tissue-protective helix B domain of Erythropoietin (EPO).\n\n**How it works:** Unlike natural EPO, ARA-290 selectively binds only to the Innate Repair Receptor (IRR)—the heterodimer of the EPO receptor and CD131—without binding to the classic EPO receptor. This means it triggers powerful tissue repair and anti-inflammatory signaling without increasing red blood cell production, blood thickness, or clot risks.\n\n**Why researchers study it:** Researched for peripheral nerve repair, diabetic neuropathy, small fiber neuropathy, sarcoidosis, chronic neuropathic pain, and ischemic organ protection.",
    "category": "Tissue Repair & Healing",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "ara-290",
    "reconstitution": {
      "defaultVialNetMg": 16,
      "defaultDiluentMl": 2,
      "solvent": "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      "dissolutionMethod": "Add 2.0 mL diluent slowly down the glass wall. Swirl horizontally for 60 seconds until dissolved completely. Avoid foaming or rapid mechanical agitation.",
      "resultingConcentrationMgPerMl": 8,
      "handlingRule": "Clear, colorless aqueous solution. Keep strictly shielded from ambient sunlight."
    },
    "dosing": {
      "standardDoseDisplay": "4.0 mg daily (4000 mcg)",
      "standardDoseMcg": 4000,
      "cadence": "1x Daily (SubQ)",
      "halfLife": "~20–30 Minutes (Rapid plasma clearance; initiates durable innate repair receptor signaling cascade)",
      "typicalProtocolDuration": "28 to 56 Days (Standard 28-day continuous research block)",
      "washoutPeriod": "30 Days between experimental cycles",
      "titrationSteps": [
        {
          "stage": "Phase 1: Innate Repair Receptor (IRR) Activation",
          "timeframe": "Days 1–7",
          "doseDisplay": "4.0 mg daily (4000 mcg)",
          "doseMcg": 4000,
          "cadence": "1x Daily (SubQ)",
          "focus": "Selective activation of tissue-protective EPOR/beta-common heteroreceptor without erythropoiesis",
          "notes": "50.0 units (0.50 mL) on U-100 syringe at 8.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Small Fiber Neuro-Regeneration",
          "timeframe": "Days 8–28",
          "doseDisplay": "4.0 mg daily",
          "doseMcg": 4000,
          "cadence": "1x Daily",
          "focus": "Peripheral intraepidermal nerve fiber density (IENFD) and corneal nerve regeneration assays",
          "notes": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "stage": "Phase 3: Post-Trial Neuro-Mapping & Washout",
          "timeframe": "Days 29–56",
          "doseDisplay": "Observation Period",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Evaluation of sustained autonomic function and long-term neuropathic stability",
          "notes": "Observe tactile and thermal sensory restoration persistence post-cessation"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "50.0 units (0.50 mL)",
      "graduations": [
        {
          "doseDisplay": "2.00 mg (Low Calibration)",
          "doseMcg": 2000,
          "volumeMl": 0.25,
          "syringeIU": 25,
          "tickLabel": "25.0 units (0.25 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "4.00 mg (Standard Target)",
          "doseMcg": 4000,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "8.00 mg (High Output Ceiling)",
          "doseMcg": 8000,
          "volumeMl": 1,
          "syringeIU": 100,
          "tickLabel": "100.0 units (1.00 mL) on U-100 syringe"
        }
      ]
    },
    "storage": {
      "lyophilized": "-20°C in dark desiccator (24 months)",
      "reconstituted": "2°C–8°C refrigerated; use within 21 days for maximum peptide integrity",
      "lightProtection": true
    },
    "molecularDetails": {
      "casNumber": "1208116-65-7",
      "pubchemCid": 91810664,
      "sequenceOrFormula": "Glu-Gln-Leu-Glu-Arg-Ala-Leu-Asn-Ser-Ser (EQLERALNSS)",
      "molecularWeightGPerMol": 1257.35
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 25324395",
        "notes": "Dahan et al. ARA 290, a peptide derived from erythropoietin, activates the innate repair receptor and alleviates neuropathic symptoms."
      },
      {
        "sourceReference": "PubMed PMID: 23049282",
        "notes": "Brines et al. ARA 290, a nonerythropoietic peptide engineered from erythropoietin, promotes tissue protection and healing."
      },
      {
        "sourceReference": "PubMed PMID: 27233830",
        "notes": "Culver et al. Cibinetide (ARA 290) in sarcoidosis patients with symptoms of small fiber neuropathy: a randomized, double-blind, placebo-controlled trial."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Peripheral Nerve Regeneration**: Stimulates repair and regrowth of damaged small sensory nerve fibers in models of diabetic and neuropathic nerve damage.",
      "**Relief of Neuropathic Pain Signals**: Suppresses hyperactive inflammatory pain signaling in damaged nerve bundles, reducing burning and tingling sensations.",
      "**Cardioprotective & Vascular Healing**: Shields heart and vascular endothelial tissues from reperfusion injury following oxygen deprivation.",
      "**Zero Hematopoietic Stimulation**: Will not raise red blood cell count, hematocrit, or blood viscosity, ensuring a wide margin of vascular safety.",
      "**Reduces Systemic Organ Inflammation**: Dampens chronic macrophage infiltration and pro-inflammatory signaling across tissues."
    ],
    "adverseObservations": [
      "**Transient Flushing or Warmth**: A brief, warm facial flush may occur within minutes of administration due to peripheral receptor activation.",
      "**Occasional Mild Headache**: Temporary tension headache observed in early research sessions, easily managed with adequate hydration.",
      "**Injection Site Sensitivity**: Mild subcutaneous erythema that subsides within 45 minutes.",
      "**Reconstitution Care**: Fragile peptide structure requires gentle diluent addition and strict refrigeration at 2°C–8°C."
    ]
  },
  {
    "id": "pentosan-polysulfate",
    "compoundName": "Pentosan Polysulfate Sodium",
    "handles": [
      "pentosan-polysulfate",
      "pps",
      "pentosan"
    ],
    "subtitle": "Sulfated Polysaccharide Chondroprotective & Disease-Modifying Matrix Standard",
    "longDescription": "**What it is:** Pentosan Polysulfate Sodium (PPS) is a semi-synthetic macromolecular carbohydrate polymer derived from beechwood hemicellulose, bearing structural similarities to glycosaminoglycans.\n\n**How it works:** PPS acts as a chondroprotective agent that protects joint cartilage. It inhibits cartilage-degrading enzymes (like ADAMTS-5 and MMP-13), stimulates hyaluronic acid synthesis in synovial fluid, improves subchondral bone microcirculation, and reduces bone marrow edema.\n\n**Why researchers study it:** Studied for osteoarthritis, degenerative joint disease, cartilage rebuilding, interstitial cystitis, and restoring fluid lubrication to arthritic joints.",
    "category": "Tissue Repair & Healing",
    "catalogStatus": "in_catalog",
    "storeProductHandle": "pentosan-polysulfate",
    "reconstitution": {
      "defaultVialNetMg": 250,
      "defaultDiluentMl": 2.5,
      "solvent": "Bacteriostatic Water USP or Sterile Saline 0.9%",
      "dissolutionMethod": "Add 2.5 mL diluent slowly down the glass wall. Swirl gently until the semi-synthetic polymer is fully dissolved into a uniform, clear solution. Do not shake violently.",
      "resultingConcentrationMgPerMl": 100,
      "handlingRule": "Clear, slightly viscous aqueous solution. Store protected from excessive heat."
    },
    "dosing": {
      "standardDoseDisplay": "100 mg twice weekly (100,000 mcg)",
      "standardDoseMcg": 100000,
      "cadence": "2x Weekly (SubQ, spaced 3–4 days apart)",
      "halfLife": "~24–48 Hours (Extended binding affinity for cartilage extracellular proteoglycans)",
      "typicalProtocolDuration": "4 to 6 Weeks (8 to 12 total administrations)",
      "washoutPeriod": "6 to 12 Months (Sustained disease-modifying chondroprotective effect)",
      "titrationSteps": [
        {
          "stage": "Phase 1: Loading & Microvascular Cleansing",
          "timeframe": "Weeks 1–2",
          "doseDisplay": "100 mg twice weekly",
          "doseMcg": 100000,
          "cadence": "2x Weekly (e.g., Mon / Thu)",
          "focus": "Inhibition of cartilage-degrading aggrecanase and matrix metalloproteinase-3 (MMP-3)",
          "notes": "100.0 units (1.00 mL) on U-100 syringe at 100.0 mg/mL concentration"
        },
        {
          "stage": "Phase 2: Chondrocyte Matrix Deposition",
          "timeframe": "Weeks 3–6",
          "doseDisplay": "100 mg – 150 mg twice weekly",
          "doseMcg": 150000,
          "cadence": "2x Weekly",
          "focus": "Hyaluronic acid stimulation, subchondral bone remodeling, and inflammatory clearing",
          "notes": "150.0 units (1.50 mL total volume) via calibrated injection syringe"
        },
        {
          "stage": "Phase 3: Extended Remission Observation",
          "timeframe": "Months 2–6+",
          "doseDisplay": "Washout Window",
          "doseMcg": 0,
          "cadence": "Zero dosing",
          "focus": "Assessment of persistent joint space preservation, mobility, and pain relief",
          "notes": "Disease-modifying osteoarthritis effects persist for 6–12 months post-protocol"
        }
      ]
    },
    "syringeGuide": {
      "syringeType": "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      "standardIUDisplay": "100.0 units (1.00 mL)",
      "graduations": [
        {
          "doseDisplay": "25 mg (Initiation / Sensitivity Test)",
          "doseMcg": 25000,
          "volumeMl": 0.25,
          "syringeIU": 25,
          "tickLabel": "25.0 units (0.25 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "50 mg (Low Titration)",
          "doseMcg": 50000,
          "volumeMl": 0.5,
          "syringeIU": 50,
          "tickLabel": "50.0 units (0.50 mL) on U-100 syringe"
        },
        {
          "doseDisplay": "100 mg (Standard Target)",
          "doseMcg": 100000,
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
      "casNumber": "37300-21-3",
      "pubchemCid": 37721,
      "sequenceOrFormula": "Semi-synthetic polysulfated xylan polymer",
      "molecularWeightGPerMol": 5700
    },
    "citations": [
      {
        "sourceReference": "PubMed PMID: 20822606",
        "notes": "Kumagai et al. Sodium pentosan polysulfate inhibits arthritis and prevents joint damage in experimental osteoarthritis."
      },
      {
        "sourceReference": "PubMed PMID: 31826978",
        "notes": "Sun et al. Pentosan polysulfate sodium promotes cartilage repair by inhibiting ADAMTS-5 and MMP-13."
      },
      {
        "sourceReference": "PubMed PMID: 16003730",
        "notes": "Ghosh. The pathobiology of osteoarthritis and the mechanisms of action of pentosan polysulfate."
      }
    ],
    "disclaimer": "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
    "investigatedBenefits": [
      "**Inhibits Cartilage Destruction Enzymes**: Blocks aggressive matrix metalloproteinases and aggrecanases that erode joint cartilage in degenerative conditions.",
      "**Stimulates Synovial Fluid & Lubrication**: Promotes natural hyaluronic acid production by synovial cells, restoring shock-absorbing fluid cushioning.",
      "**Clears Subchondral Bone Marrow Edema**: Improves blood flow through tiny capillary beds beneath damaged cartilage, reducing deep bone ache and pressure.",
      "**Protects Bladder Mucosa (Interstitial Cystitis)**: Coats and repairs the protective glycosaminoglycan layer of the bladder wall, preventing irritant penetration.",
      "**Anti-Inflammatory Joint Modulator**: Reduces pro-inflammatory mediators and pain-producing chemicals within the synovial cavity."
    ],
    "adverseObservations": [
      "**Mild Anticoagulant Activity**: PPS has a mild heparin-like blood-thinning effect (~1/15th that of heparin). Research subjects must be monitored for easy bruising.",
      "**Gastrointestinal Sensitivity**: Mild nausea, loose stools, or abdominal discomfort can occur if administered on an empty stomach.",
      "**Temporary Hair Shedding (Telogen Effluvium)**: Rare, temporary hair thinning observed in extended high-dose animal models, reversing upon study cessation.",
      "**Precautions with Blood Thinners**: Should not be combined with anti-platelet or anticoagulant agents in laboratory models."
    ]
  }
]
