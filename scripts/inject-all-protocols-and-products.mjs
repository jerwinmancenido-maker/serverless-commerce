import fs from "fs"
import path from "path"

const PROTOCOLS_STOREFRONT_PATH = path.resolve("apps/storefront/src/lib/data/compound-protocols/all-protocols.json")
const PROTOCOLS_BACKEND_PATH = path.resolve("apps/backend/data/all-compound-protocols.json")
const CATALOG_BACKEND_PATH = path.resolve("apps/backend/data/unified-catalog.json")

console.log("Loading existing protocols and catalog...")
const existingProtocols = JSON.parse(fs.readFileSync(PROTOCOLS_STOREFRONT_PATH, "utf8"))
const existingCatalog = JSON.parse(fs.readFileSync(CATALOG_BACKEND_PATH, "utf8"))

console.log(`Current protocol count: ${existingProtocols.length}`)
console.log(`Current catalog product count: ${existingCatalog.length}`)

// Master definitions for all 66 items
export const NEW_PROTOCOLS_DATA = [
  // ==========================================
  // 1. Incretins, GLP/GIP Agonists & Metabolic (10 items)
  // ==========================================
  {
    id: "cagrisema-blend",
    compoundName: "CagriSema (Cagrilintide 5mg + Semaglutide 5mg Blend)",
    handles: ["cagrisema", "cagrisema-blend", "cagrilintide-semaglutide", "cagrilintide-semaglutide-blend"],
    subtitle: "Dual-Action Amylin & GLP-1 Receptor Co-Agonist Stoichiometric Standard",
    longDescription: "**What it is:** CagriSema is a state-of-the-art dual-hormone combination peptide pairing Cagrilintide (a long-acting amylin analogue) and Semaglutide (a proven GLP-1 receptor agonist) in a precise 1:1 stoichiometric ratio (5mg / 5mg).\n\n**How it works:** By concurrently engaging the area postrema and ventral tegmental area via calcitonin/RAMP amylin receptor complexes while stimulating hypothalamic GLP-1 receptors, CagriSema produces profound synergistic suppression of appetite, deceleration of gastric emptying, and restoration of glycemic setpoints exceeding either agent alone.\n\n**Why researchers study it:** Investigated in Phase 3 trials (REDEFINE program) for unmatched weight reduction (exceeding 25% in clinical cohorts) and significant improvements in cardiovascular and metabolic biomarkers.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "cagrisema-blend",
    evidenceTier: "Peer-Reviewed Phase 3 Clinical Evidence",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      solvent: "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Direct diluent stream against inner glass wall. Swirl gently in circular horizontal motions. Do not shake.",
      resultingConcentrationMgPerMl: 5.0,
      handlingRule: "Inspect for clear, particle-free dissolution. Store at 2°C–8°C refrigerated."
    },
    dosing: {
      standardDoseDisplay: "0.5 mg – 2.4 mg Weekly SubQ",
      standardDoseMcg: 500,
      cadence: "1x Every 7 Days (Weekly SubQ)",
      halfLife: "~168 Hours (~7 Days Terminal Half-Life)",
      typicalProtocolDuration: "16 to 32 Weeks Titration Block",
      washoutPeriod: "6 Weeks between research cohorts",
      titrationSteps: [
        {
          stage: "Stage 1: Incretin Initiation",
          timeframe: "Weeks 1–4",
          doseDisplay: "0.5 mg Weekly (0.25mg Cagri / 0.25mg Sema)",
          doseMcg: 500,
          cadence: "1x Every 7 Days",
          focus: "Gastrointestinal tolerability and amylin receptor baseline",
          notes: "10.0 units (0.10 mL) on U-100 syringe at 5.0 mg/mL"
        },
        {
          stage: "Stage 2: Mid-Dose Titration",
          timeframe: "Weeks 5–8",
          doseDisplay: "1.0 mg Weekly (0.5mg Cagri / 0.5mg Sema)",
          doseMcg: 1000,
          cadence: "1x Every 7 Days",
          focus: "Robust central satiety escalation and gastric delay",
          notes: "20.0 units (0.20 mL) on U-100 syringe"
        },
        {
          stage: "Stage 3: Advanced Metabolic Cohort",
          timeframe: "Weeks 9–12",
          doseDisplay: "1.7 mg Weekly (0.85mg Cagri / 0.85mg Sema)",
          doseMcg: 1700,
          cadence: "1x Every 7 Days",
          focus: "High-affinity receptor saturation across both pathways",
          notes: "34.0 units (0.34 mL) on U-100 syringe"
        },
        {
          stage: "Stage 4: Target Trial Maintenance",
          timeframe: "Weeks 13+",
          doseDisplay: "2.4 mg Weekly (1.2mg Cagri / 1.2mg Sema)",
          doseMcg: 2400,
          cadence: "1x Every 7 Days",
          focus: "Maximum clinical trial endpoint maintenance cohort",
          notes: "48.0 units (0.48 mL) on U-100 syringe"
        }
      ],
      deliveryRoute: "subq",
      routeLabel: "Subcutaneous (SubQ) Protocol"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      standardIUDisplay: "10.0 units (0.10 mL) Initiation",
      graduations: [
        { doseDisplay: "0.50 mg (Initiation)", doseMcg: 500, volumeMl: 0.1, syringeIU: 10, tickLabel: "10 units (0.10 mL)" },
        { doseDisplay: "1.00 mg (Titration 1)", doseMcg: 1000, volumeMl: 0.2, syringeIU: 20, tickLabel: "20 units (0.20 mL)" },
        { doseDisplay: "1.70 mg (Titration 2)", doseMcg: 1700, volumeMl: 0.34, syringeIU: 34, tickLabel: "34 units (0.34 mL)" },
        { doseDisplay: "2.40 mg (Target Endpoint)", doseMcg: 2400, volumeMl: 0.48, syringeIU: 48, tickLabel: "48 units (0.48 mL)" }
      ],
      needleGauge: "31G Ultra-Fine (0.25 mm)",
      needleLength: "5/16\" (8 mm) True SubQ Short Needle",
      hubType: "Fixed Integrated Needle (Ultra-Low Dead Space <0.005 mL)",
      deadSpaceCorrection: "Fixed Integrated Needle (Ultra-Low Dead Space <0.005 mL)",
      recommendedBarrel: "0.3 mL or 0.5 mL U-100 barrel for micro-dosing",
      transferNeedle: "21G–23G x 1.5\" sterile needle for diluent transfer",
      calibratedInstrument: {
        instrumentType: "u100_insulin_syringe",
        barrelStandard: "U-100 Precision Micro-Barrel (100 units = 1.0 mL = 1,000 µL)",
        needleGauge: "31G Ultra-Fine (0.25 mm)",
        needleLength: "5/16\" (8 mm) True SubQ Short Needle",
        needleWall: "Thin-Wall Lubricated Surgical Stainless Steel",
        hubType: "Fixed Integrated Needle (Ultra-Low Dead Space)",
        recommendedBarrel: "0.3 mL or 0.5 mL U-100 syringe",
        transferNeedle: "21G–23G x 1.5\" sterile needle"
      }
    },
    storage: {
      lyophilized: "-20°C in dry desiccated container (24 months shelf life)",
      reconstituted: "2°C–8°C refrigerated; use within 28 days",
      lightProtection: "Protect reconstituted vial from direct UV and fluorescent light exposure."
    },
    molecularDetails: {
      casNumber: "Blend Standard (Cagrilintide 1415456-99-3 / Semaglutide 910463-68-2)",
      pubchemCid: 137090281,
      sequenceOrFormula: "Cagrilintide + Semaglutide Dual Lyophilized Salt",
      molecularWeightGPerMol: 8530.8,
      formula: "Dual Peptide Formulation (5mg / 5mg)",
      molarMass: "8,530.8 g/mol Combined Equimolar Basis",
      sequence: "Cagrilintide (37AA) + Semaglutide (31AA)",
      purity: "≥99.0% (HPLC Lot Standard)",
      analyticalVerification: "Reversed-Phase HPLC & Electrospray Ionization Mass Spectrometry (ESI-MS)"
    },
    citations: [
      { sourceReference: "PubMed PMID: 37385280", notes: "Frias et al. Efficacy and safety of cagrilintide plus semaglutide in individuals with obesity: REDEFINE Phase 2 (Lancet)." },
      { sourceReference: "PubMed PMID: 34146522", notes: "DeBlock et al. Cagrilintide, a long-acting amylin analogue, in combination with semaglutide (Lancet Diabetes Endocrinol)." }
    ],
    disclaimer: "All materials are synthesized strictly for controlled in-vitro and laboratory research use only. Not for human, veterinary, therapeutic, or clinical administration.",
    investigatedBenefits: [
      "Dual amylin and GLP-1 receptor coordinated neuro-signaling",
      "Superior appetite and hedonic food intake reduction over single incretins",
      "Robust preservation of glycemic control and insulin sensitivity",
      "Synergistic deceleration of gastric motility"
    ],
    adverseObservations: [
      "Dose-dependent transient nausea and gastrointestinal symptoms during rapid escalation",
      "Transient delayed gastric emptying effects",
      "Mild localized injection site erythema"
    ],
    vialStrengthOptions: [
      { vialMg: 5, diluentMl: 1.0, concMgMl: 5.0, badge: "5 mg Trial Calibration" },
      { vialMg: 10, diluentMl: 2.0, concMgMl: 5.0, badge: "10 mg Standard Dual Vial" },
      { vialMg: 20, diluentMl: 2.0, concMgMl: 10.0, badge: "20 mg High-Concentration" }
    ],
    reconstitutionOptions: {
      standardCompact: { diluentMl: 2.0, concMgMl: 5.0, label: "2.0 mL Compact Standard (5.0 mg/mL)", tickConversion: "1 unit = 50 mcg (0.01 mL)" }
    },
    protocolCategoryType: "peptide",
    isBlend: true,
    blendConstituents: [
      { name: "Cagrilintide", nominalMassMg: 5, ratio: "50%" },
      { name: "Semaglutide", nominalMassMg: 5, ratio: "50%" }
    ],
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq"]
  },

  {
    id: "orforglipron",
    compoundName: "Orforglipron (LY3502970)",
    handles: ["orforglipron", "ly3502970"],
    subtitle: "Oral Non-Peptide GLP-1 Receptor Agonist Analytical Monograph",
    longDescription: "**What it is:** Orforglipron (LY3502970) is a pioneering non-peptide small-molecule agonist of the GLP-1 receptor, engineered to achieve high oral bioavailability without requiring absorption enhancers.\n\n**How it works:** Orforglipron binds to the transmembrane domain of the GLP-1 receptor, allosterically inducing downstream cAMP accumulation and glucose-dependent insulin secretion while profoundly suppressing appetite.\n\n**Why researchers study it:** Researched in Phase 3 clinical trials (ACHIEVE program) for oral efficacy rivaling injectable peptide incretins, achieving significant reductions in HbA1c and body weight.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "orforglipron",
    evidenceTier: "Phase 2 / Phase 3 Clinical Evidence",
    reconstitution: {
      defaultVialNetMg: 12,
      defaultDiluentMl: 2.0,
      solvent: "Bacteriostatic Water USP or Aqueous Analytical Buffer",
      dissolutionMethod: "Dissolves rapidly upon addition of aqueous diluent. Swirl gently until transparent.",
      resultingConcentrationMgPerMl: 6.0,
      handlingRule: "Analytical reference material; keep sealed and protected from light."
    },
    dosing: {
      standardDoseDisplay: "3.0 mg – 12.0 mg Daily Analytical Window",
      standardDoseMcg: 3000,
      cadence: "1x Daily (Q24H)",
      halfLife: "~29 to 49 Hours",
      typicalProtocolDuration: "12 to 26 Weeks Evaluation Block",
      washoutPeriod: "4 Weeks between research cohorts",
      titrationSteps: [
        { stage: "Stage 1: Initiation", timeframe: "Weeks 1–4", doseDisplay: "3.0 mg Daily", doseMcg: 3000, cadence: "1x Daily", focus: "Receptor tolerance", notes: "50.0 units (0.50 mL) at 6.0 mg/mL" },
        { stage: "Stage 2: Titration", timeframe: "Weeks 5–8", doseDisplay: "6.0 mg Daily", doseMcg: 6000, cadence: "1x Daily", focus: "Glycemic optimization", notes: "100.0 units (1.00 mL) at 6.0 mg/mL" },
        { stage: "Stage 3: Maintenance", timeframe: "Weeks 9+", doseDisplay: "12.0 mg Daily", doseMcg: 12000, cadence: "1x Daily", focus: "Maximum receptor saturation", notes: "Requires dual draws or high-concentration stock" }
      ],
      deliveryRoute: "oral_solution",
      routeLabel: "Oral Solution / SubQ Analytical"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Precision Syringe / Analytical Pipettor",
      standardIUDisplay: "50.0 units (0.50 mL) for 3.0 mg",
      graduations: [
        { doseDisplay: "3.00 mg", doseMcg: 3000, volumeMl: 0.5, syringeIU: 50, tickLabel: "50 units (0.50 mL)" },
        { doseDisplay: "6.00 mg", doseMcg: 6000, volumeMl: 1.0, syringeIU: 100, tickLabel: "100 units (1.00 mL)" }
      ],
      needleGauge: "30G Precision Needle",
      needleLength: "1/2\" (12.7 mm)",
      hubType: "Luer-Slip / Fixed",
      deadSpaceCorrection: "Low Dead Space Standard",
      recommendedBarrel: "1.0 mL U-100 Syringe",
      transferNeedle: "21G Reconstitution Needle"
    },
    storage: {
      lyophilized: "-20°C dry desiccated container (36 months)",
      reconstituted: "2°C–8°C refrigerated; use within 30 days",
      lightProtection: "Store protected from direct sunlight."
    },
    molecularDetails: {
      casNumber: "2212020-52-3",
      pubchemCid: 155191456,
      sequenceOrFormula: "C46H47FN6O5",
      molecularWeightGPerMol: 782.9,
      formula: "C46H47FN6O5",
      molarMass: "782.9 g/mol",
      purity: "≥99.0% (HPLC-Certified)",
      analyticalVerification: "HPLC, 1H-NMR, LC-MS Confirmation"
    },
    citations: [
      { sourceReference: "PubMed PMID: 37351564", notes: "Pratt et al. Daily Oral GLP-1 Receptor Agonist Orforglipron for Type 2 Diabetes (NEJM 2023)." },
      { sourceReference: "PubMed PMID: 37351563", notes: "Wharton et al. Daily Oral Orforglipron for Obesity — A Phase 2 Randomized Trial (NEJM 2023)." }
    ],
    disclaimer: "Synthesized strictly for laboratory research and analytical calibration. Not for clinical, therapeutic, or diagnostic administration.",
    investigatedBenefits: ["High oral GLP-1 receptor potency", "Non-peptide degradation resistance", "Potent weight loss and glucose-dependent insulin secretion"],
    adverseObservations: ["Mild-to-moderate nausea, vomiting, or diarrhea during titration", "Transient heart rate increase"],
    vialStrengthOptions: [
      { vialMg: 12, diluentMl: 2.0, concMgMl: 6.0, badge: "12 mg Standard Vial" },
      { vialMg: 24, diluentMl: 2.0, concMgMl: 12.0, badge: "24 mg Extended Protocol" }
    ],
    reconstitutionOptions: {
      standard: { diluentMl: 2.0, concMgMl: 6.0, label: "2.0 mL Analytical Dilution (6.0 mg/mL)", tickConversion: "1 unit = 60 mcg" }
    },
    protocolCategoryType: "small_molecule",
    isBlend: false,
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"]
  },

  {
    id: "pemvidutide",
    compoundName: "Pemvidutide (ALT-801)",
    handles: ["pemvidutide", "alt-801"],
    subtitle: "Balanced 1:1 GLP-1 & Glucagon Dual Receptor Agonist for MASH / NASH",
    longDescription: "**What it is:** Pemvidutide (ALT-801) is an engineered, long-acting synthetic peptide that acts as an equimolar (1:1) dual receptor agonist for both the GLP-1 and Glucagon receptors.\n\n**How it works:** Glucagon receptor stimulation activates hepatic mitochondrial beta-oxidation and clears intrahepatic fat, while GLP-1 receptor activation suppresses appetite and prevents hepatic glucose overproduction.\n\n**Why researchers study it:** Demonstrates rapid, dramatic clearance of liver fat (over 75% reduction) in clinical trials (MOMENTUM study) with significant lean mass preservation compared to pure GLP-1 agonists.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "pemvidutide",
    evidenceTier: "Phase 2 Clinical Evidence (MOMENTUM Trial)",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      solvent: "Bacteriostatic Water USP",
      dissolutionMethod: "Slowly inject 2.0 mL down the vial wall. Swirl gently until dissolved.",
      resultingConcentrationMgPerMl: 5.0,
      handlingRule: "Inspect for clarity. Avoid vigorous shaking."
    },
    dosing: {
      standardDoseDisplay: "1.2 mg – 2.4 mg Weekly SubQ",
      standardDoseMcg: 1200,
      cadence: "1x Every 7 Days (Weekly SubQ)",
      halfLife: "~168 Hours (~7 Days)",
      typicalProtocolDuration: "12 to 24 Weeks Study Block",
      washoutPeriod: "6 Weeks between research cohorts",
      titrationSteps: [
        { stage: "Stage 1: Initiation", timeframe: "Weeks 1–4", doseDisplay: "1.2 mg Weekly", doseMcg: 1200, cadence: "1x Every 7 Days", focus: "Hepatic lipid mobilisation", notes: "24.0 units (0.24 mL) on U-100 syringe" },
        { stage: "Stage 2: Target Escalation", timeframe: "Weeks 5–8", doseDisplay: "1.8 mg Weekly", doseMcg: 1800, cadence: "1x Every 7 Days", focus: "Mitochondrial uncoupling", notes: "36.0 units (0.36 mL) on U-100 syringe" },
        { stage: "Stage 3: Maximum Efficacy", timeframe: "Weeks 9+", doseDisplay: "2.4 mg Weekly", doseMcg: 2400, cadence: "1x Every 7 Days", focus: "Peak steatohepatitis clearance", notes: "48.0 units (0.48 mL) on U-100 syringe" }
      ],
      deliveryRoute: "subq",
      routeLabel: "Subcutaneous (SubQ) Protocol"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      standardIUDisplay: "24.0 units (0.24 mL)",
      graduations: [
        { doseDisplay: "1.20 mg", doseMcg: 1200, volumeMl: 0.24, syringeIU: 24, tickLabel: "24 units (0.24 mL)" },
        { doseDisplay: "1.80 mg", doseMcg: 1800, volumeMl: 0.36, syringeIU: 36, tickLabel: "36 units (0.36 mL)" },
        { doseDisplay: "2.40 mg", doseMcg: 2400, volumeMl: 0.48, syringeIU: 48, tickLabel: "48 units (0.48 mL)" }
      ],
      needleGauge: "31G Ultra-Fine",
      needleLength: "5/16\" (8 mm)",
      hubType: "Fixed Integrated Needle (Ultra-Low Dead Space)",
      deadSpaceCorrection: "Fixed Needle (<0.005 mL dead space)",
      recommendedBarrel: "0.5 mL U-100 syringe",
      transferNeedle: "21G Reconstitution Needle"
    },
    storage: {
      lyophilized: "-20°C in dry desiccated container (24 months)",
      reconstituted: "2°C–8°C refrigerated; use within 28 days",
      lightProtection: "Protect from direct sunlight."
    },
    molecularDetails: {
      casNumber: "2417758-00-6",
      pubchemCid: 162649033,
      sequenceOrFormula: "C194H304N46O57",
      molecularWeightGPerMol: 4180.7,
      formula: "C194H304N46O57",
      molarMass: "4180.7 g/mol",
      purity: "≥99.0% (HPLC-grade)",
      analyticalVerification: "RP-HPLC & ESI-MS Confirmation"
    },
    citations: [
      { sourceReference: "PubMed PMID: 38100523", notes: "Alkhouri et al. Pemvidutide, a dual GLP-1/glucagon receptor agonist, in metabolic dysfunction-associated steatotic liver disease (Hepatology 2023)." }
    ],
    disclaimer: "Strictly for in-vitro laboratory research and analytical evaluation. Not for clinical administration.",
    investigatedBenefits: ["Rapid hepatic fat fraction clearance (>75%)", "Equimolar 1:1 dual receptor stimulation", "Lean muscle mass preservation"],
    adverseObservations: ["Transient nausea", "Mild appetite decrease"],
    vialStrengthOptions: [
      { vialMg: 10, diluentMl: 2.0, concMgMl: 5.0, badge: "10 mg Standard Vial" },
      { vialMg: 20, diluentMl: 2.0, concMgMl: 10.0, badge: "20 mg High-Potency" }
    ],
    reconstitutionOptions: {
      standard: { diluentMl: 2.0, concMgMl: 5.0, label: "2.0 mL Standard (5.0 mg/mL)", tickConversion: "1 unit = 50 mcg" }
    },
    protocolCategoryType: "peptide",
    isBlend: false,
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq"]
  },

  {
    id: "cotadutide",
    compoundName: "Cotadutide (MEDI0382)",
    handles: ["cotadutide", "medi0382"],
    subtitle: "Dual GLP-1 / Glucagon Receptor Agonist for Glycemic & Hepatic Modeling",
    longDescription: "**What it is:** Cotadutide (MEDI0382) is an engineered oxyntomodulin-like peptide analogue acting as a balanced dual GLP-1 and Glucagon receptor agonist with potent insulinotropic and hepatic beta-oxidation activities.\n\n**How it works:** It increases insulin secretion in response to glucose while stimulating glycogenolysis and mitochondrial fatty acid combustion in the liver, leading to reduced hepatic fat and improved insulin sensitivity.\n\n**Why researchers study it:** Extensively investigated in diabetic kidney disease and metabolic liver disease cohorts.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "cotadutide",
    evidenceTier: "Phase 2 Clinical Evidence",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      solvent: "Bacteriostatic Water USP",
      dissolutionMethod: "Direct diluent stream gently against glass vial wall. Swirl until transparent.",
      resultingConcentrationMgPerMl: 5.0,
      handlingRule: "Store refrigerated at 2°C–8°C."
    },
    dosing: {
      standardDoseDisplay: "100 mcg – 600 mcg Daily SubQ",
      standardDoseMcg: 100,
      cadence: "1x Daily (Q24H SubQ)",
      halfLife: "~12 Hours",
      typicalProtocolDuration: "8 to 16 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Stage 1: Initiation", timeframe: "Weeks 1–2", doseDisplay: "100 mcg Daily", doseMcg: 100, cadence: "1x Daily", focus: "Receptor acclimation", notes: "2.0 units (0.02 mL) on U-100 syringe at 5.0 mg/mL" },
        { stage: "Stage 2: Mid-Dose", timeframe: "Weeks 3–6", doseDisplay: "300 mcg Daily", doseMcg: 300, cadence: "1x Daily", focus: "Glycemic and hepatic response", notes: "6.0 units (0.06 mL) on U-100 syringe" },
        { stage: "Stage 3: High-Dose Cohort", timeframe: "Weeks 7+", doseDisplay: "600 mcg Daily", doseMcg: 600, cadence: "1x Daily", focus: "Peak beta-oxidation", notes: "12.0 units (0.12 mL) on U-100 syringe" }
      ],
      deliveryRoute: "subq",
      routeLabel: "Subcutaneous (SubQ) Protocol"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      standardIUDisplay: "2.0 units (0.02 mL)",
      graduations: [
        { doseDisplay: "100 mcg", doseMcg: 100, volumeMl: 0.02, syringeIU: 2, tickLabel: "2 units (0.02 mL)" },
        { doseDisplay: "300 mcg", doseMcg: 300, volumeMl: 0.06, syringeIU: 6, tickLabel: "6 units (0.06 mL)" },
        { doseDisplay: "600 mcg", doseMcg: 600, volumeMl: 0.12, syringeIU: 12, tickLabel: "12 units (0.12 mL)" }
      ],
      needleGauge: "31G Ultra-Fine",
      needleLength: "5/16\" (8 mm)",
      hubType: "Fixed Integrated Needle (Ultra-Low Dead Space)",
      deadSpaceCorrection: "Fixed Needle (<0.005 mL dead space)",
      recommendedBarrel: "0.3 mL U-100 syringe for micro-units",
      transferNeedle: "21G Reconstitution Needle"
    },
    storage: {
      lyophilized: "-20°C in dry desiccated container (24 months)",
      reconstituted: "2°C–8°C refrigerated; use within 28 days",
      lightProtection: "Protect from light."
    },
    molecularDetails: {
      casNumber: "1801344-02-6",
      pubchemCid: 137090280,
      sequenceOrFormula: "C182H278N44O57",
      molecularWeightGPerMol: 3970.4,
      formula: "C182H278N44O57",
      molarMass: "3970.4 g/mol",
      purity: "≥99.0% (HPLC Lot Standard)",
      analyticalVerification: "RP-HPLC & ESI-MS"
    },
    citations: [
      { sourceReference: "PubMed PMID: 34146522", notes: "Parker et al. Efficacy and safety of cotadutide in type 2 diabetes and chronic kidney disease (Lancet Diabetes Endocrinol 2021)." }
    ],
    disclaimer: "Research Use Only (RUO). Strictly for scientific in-vitro laboratory research.",
    investigatedBenefits: ["Dual GLP-1/Glucagon balanced activity", "Hepatic lipid reduction", "Renal hemodynamic improvements"],
    adverseObservations: ["Mild GI discomfort during initiation", "Transient heart rate increase"],
    vialStrengthOptions: [
      { vialMg: 10, diluentMl: 2.0, concMgMl: 5.0, badge: "10 mg Standard Vial" }
    ],
    reconstitutionOptions: {
      standard: { diluentMl: 2.0, concMgMl: 5.0, label: "2.0 mL Standard (5.0 mg/mL)", tickConversion: "1 unit = 50 mcg" }
    },
    protocolCategoryType: "peptide",
    isBlend: false,
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq"]
  },

  {
    id: "ecnoglutide",
    compoundName: "Ecnoglutide (XW003)",
    handles: ["ecnoglutide", "xw003"],
    subtitle: "Biased Long-Acting GLP-1 Receptor Agonist for Glycemic & Weight Control",
    longDescription: "**What it is:** Ecnoglutide (XW003) is a novel, long-acting cAMP-biased GLP-1 receptor agonist optimized for prolonged terminal half-life and minimized receptor desensitization.\n\n**How it works:** Biased signaling selectively triggers cAMP generation while avoiding beta-arrestin recruitment, maintaining high receptor sensitivity and durable signaling without rapid receptor internalization.\n\n**Why researchers study it:** Demonstrated powerful reductions in HbA1c and body weight with a favorable gastrointestinal tolerability profile in Phase 2/3 clinical studies.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "ecnoglutide",
    evidenceTier: "Phase 2 / Phase 3 Clinical Evidence",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      solvent: "Bacteriostatic Water USP",
      dissolutionMethod: "Add diluent slowly. Swirl gently. Inspect for clear solution.",
      resultingConcentrationMgPerMl: 5.0,
      handlingRule: "Store at 2°C–8°C refrigerated."
    },
    dosing: {
      standardDoseDisplay: "0.6 mg – 2.4 mg Weekly SubQ",
      standardDoseMcg: 600,
      cadence: "1x Every 7 Days (Weekly SubQ)",
      halfLife: "~160 Hours (~6.5 Days)",
      typicalProtocolDuration: "12 to 24 Weeks",
      washoutPeriod: "6 Weeks",
      titrationSteps: [
        { stage: "Stage 1: Initiation", timeframe: "Weeks 1–4", doseDisplay: "0.6 mg Weekly", doseMcg: 600, cadence: "1x Every 7 Days", focus: "Receptor priming", notes: "12.0 units (0.12 mL) on U-100 syringe" },
        { stage: "Stage 2: Mid-Dose", timeframe: "Weeks 5–8", doseDisplay: "1.2 mg Weekly", doseMcg: 1200, cadence: "1x Every 7 Days", focus: "Appetite suppression", notes: "24.0 units (0.24 mL) on U-100 syringe" },
        { stage: "Stage 3: High-Dose", timeframe: "Weeks 9+", doseDisplay: "2.4 mg Weekly", doseMcg: 2400, cadence: "1x Every 7 Days", focus: "Maximum clinical trial endpoint", notes: "48.0 units (0.48 mL) on U-100 syringe" }
      ],
      deliveryRoute: "subq",
      routeLabel: "Subcutaneous (SubQ) Protocol"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      standardIUDisplay: "12.0 units (0.12 mL)",
      graduations: [
        { doseDisplay: "0.60 mg", doseMcg: 600, volumeMl: 0.12, syringeIU: 12, tickLabel: "12 units (0.12 mL)" },
        { doseDisplay: "1.20 mg", doseMcg: 1200, volumeMl: 0.24, syringeIU: 24, tickLabel: "24 units (0.24 mL)" },
        { doseDisplay: "2.40 mg", doseMcg: 2400, volumeMl: 0.48, syringeIU: 48, tickLabel: "48 units (0.48 mL)" }
      ],
      needleGauge: "31G Ultra-Fine",
      needleLength: "5/16\" (8 mm)",
      hubType: "Fixed Integrated Needle",
      deadSpaceCorrection: "Fixed Needle (<0.005 mL dead space)",
      recommendedBarrel: "0.5 mL U-100 syringe",
      transferNeedle: "21G Reconstitution Needle"
    },
    storage: {
      lyophilized: "-20°C desiccated (24 months)",
      reconstituted: "2°C–8°C refrigerated; use within 28 days",
      lightProtection: "Store away from light."
    },
    molecularDetails: {
      casNumber: "2504144-88-1",
      pubchemCid: 167584102,
      sequenceOrFormula: "C190H297N47O58",
      molecularWeightGPerMol: 4153.7,
      formula: "C190H297N47O58",
      molarMass: "4153.7 g/mol",
      purity: "≥99.0% (HPLC)",
      analyticalVerification: "RP-HPLC & ESI-MS"
    },
    citations: [
      { sourceReference: "PubMed PMID: 37192305", notes: "Ji et al. Efficacy and safety of ecnoglutide (XW003) in patients with type 2 diabetes (Diabetes Care 2023)." }
    ],
    disclaimer: "Research Use Only (RUO). Strictly for scientific in-vitro laboratory research.",
    investigatedBenefits: ["Biased cAMP signaling pathway", "Reduced beta-arrestin desensitization", "Potent weight loss and glucose control"],
    adverseObservations: ["Dose-dependent mild nausea", "Decreased appetite"],
    vialStrengthOptions: [
      { vialMg: 10, diluentMl: 2.0, concMgMl: 5.0, badge: "10 mg Standard Vial" }
    ],
    reconstitutionOptions: {
      standard: { diluentMl: 2.0, concMgMl: 5.0, label: "2.0 mL Standard (5.0 mg/mL)", tickConversion: "1 unit = 50 mcg" }
    },
    protocolCategoryType: "peptide",
    isBlend: false,
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq"]
  },

  {
    id: "slu-pp-332",
    compoundName: "SLU-PP-332 (Exercise Mimetic ERR Agonist)",
    handles: ["slu-pp-332", "slupp332"],
    subtitle: "Pan-Estrogen-Related Receptor (ERRα/β/γ) Agonist Stoichiometric Standard",
    longDescription: "**What it is:** SLU-PP-332 is a groundbreaking synthetic small-molecule agonist that simultaneously activates all three isoforms of the Estrogen-Related Receptor family (ERRα, ERRβ, and ERRγ).\n\n**How it works:** By binding ERRs, SLU-PP-332 induces the gene expression program of endurance exercise training in skeletal muscle and cardiac tissue, upregulating PGC-1α, GLUT4, and mitochondrial oxidative phosphorylation without requiring actual physical contraction.\n\n**Why researchers study it:** Researched as a premier 'exercise-in-a-bottle' mimetic, driving profound increases in type I slow-twitch endurance muscle fibers, fatty acid oxidation, and systemic insulin sensitivity.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "slu-pp-332",
    evidenceTier: "Preclinical / In-Vivo Metabolic Evidence",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      solvent: "Aqueous Buffer / Bacteriostatic Water with solubilizer",
      dissolutionMethod: "Add diluent slowly. Swirl gently until clear.",
      resultingConcentrationMgPerMl: 5.0,
      handlingRule: "Store refrigerated at 2°C–8°C."
    },
    dosing: {
      standardDoseDisplay: "250 mcg – 1000 mcg Daily SubQ",
      standardDoseMcg: 250,
      cadence: "1x Daily (Q24H SubQ)",
      halfLife: "~8 to 12 Hours",
      typicalProtocolDuration: "4 to 8 Weeks",
      washoutPeriod: "3 Weeks",
      titrationSteps: [
        { stage: "Stage 1: Initiation", timeframe: "Weeks 1–2", doseDisplay: "250 mcg Daily", doseMcg: 250, cadence: "1x Daily", focus: "Mitochondrial baseline", notes: "5.0 units (0.05 mL) on U-100 syringe at 5.0 mg/mL" },
        { stage: "Stage 2: Target Evaluation", timeframe: "Weeks 3–6", doseDisplay: "500 mcg Daily", doseMcg: 500, cadence: "1x Daily", focus: "Endurance & fatty acid oxidation", notes: "10.0 units (0.10 mL) on U-100 syringe" },
        { stage: "Stage 3: Peak Cohort", timeframe: "Weeks 7–8", doseDisplay: "1000 mcg Daily", doseMcg: 1000, cadence: "1x Daily", focus: "Maximum oxidative fiber remodeling", notes: "20.0 units (0.20 mL) on U-100 syringe" }
      ],
      deliveryRoute: "subq",
      routeLabel: "Subcutaneous (SubQ) Protocol"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      standardIUDisplay: "5.0 units (0.05 mL)",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.05, syringeIU: 5, tickLabel: "5 units (0.05 mL)" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.1, syringeIU: 10, tickLabel: "10 units (0.10 mL)" },
        { doseDisplay: "1000 mcg", doseMcg: 1000, volumeMl: 0.2, syringeIU: 20, tickLabel: "20 units (0.20 mL)" }
      ],
      needleGauge: "31G Ultra-Fine",
      needleLength: "5/16\" (8 mm)",
      hubType: "Fixed Integrated Needle",
      deadSpaceCorrection: "Fixed Needle (<0.005 mL dead space)",
      recommendedBarrel: "0.3 mL U-100 syringe",
      transferNeedle: "21G Reconstitution Needle"
    },
    storage: {
      lyophilized: "-20°C dry desiccated (24 months)",
      reconstituted: "2°C–8°C refrigerated; use within 28 days",
      lightProtection: "Store protected from UV light."
    },
    molecularDetails: {
      casNumber: "2828432-37-5",
      pubchemCid: 167389823,
      sequenceOrFormula: "C22H17F3N2O3",
      molecularWeightGPerMol: 414.38,
      formula: "C22H17F3N2O3",
      molarMass: "414.38 g/mol",
      purity: "≥99.0% (HPLC Lot Standard)",
      analyticalVerification: "RP-HPLC, 1H-NMR, LC-MS"
    },
    citations: [
      { sourceReference: "PubMed PMID: 37739794", notes: "Billotte et al. A synthetic ERR agonist alleviates metabolic syndrome characteristics and increases physical performance (J Pharmacol Exp Ther 2023)." }
    ],
    disclaimer: "Strictly for laboratory in-vitro and animal model scientific research. Not for human use.",
    investigatedBenefits: ["Mitochondrial biogenesis induction", "Type I slow-twitch oxidative fiber remodeling", "Robust cellular fatty acid oxidation"],
    adverseObservations: ["Preclinical model only; human safety unestablished", "Transient thermal sensation"],
    vialStrengthOptions: [
      { vialMg: 10, diluentMl: 2.0, concMgMl: 5.0, badge: "10 mg Standard Vial" }
    ],
    reconstitutionOptions: {
      standard: { diluentMl: 2.0, concMgMl: 5.0, label: "2.0 mL Standard (5.0 mg/mL)", tickConversion: "1 unit = 50 mcg" }
    },
    protocolCategoryType: "small_molecule",
    isBlend: false,
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq"]
  },

  {
    id: "adipotide",
    compoundName: "Adipotide (FTPP)",
    handles: ["adipotide", "ftpp", "fat-targeted-proapoptotic-peptide"],
    subtitle: "Prohibitin-Targeting White Adipose Vasculature Proapoptotic Peptidomimetic",
    longDescription: "**What it is:** Adipotide (also known as FTPP) is a dual-domain peptidomimetic composed of a homing peptide directed against prohibitin on white adipose tissue blood vessels coupled to a membrane-disrupting proapoptotic domain.\n\n**How it works:** It selectively binds to the endothelial lining of white adipose tissue capillaries, internalizes into the cells, and disrupts mitochondrial membranes, triggering targeted apoptosis and rapid starvation of fat depots.\n\n**Why researchers study it:** Showcased in landmark primate studies for rapid, dramatic visceral fat reduction without neurological appetite suppression.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "adipotide",
    evidenceTier: "Preclinical Non-Human Primate In-Vivo Evidence",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      solvent: "Bacteriostatic Water USP",
      dissolutionMethod: "Slow injection down glass vial wall. Swirl gently.",
      resultingConcentrationMgPerMl: 5.0,
      handlingRule: "Store refrigerated at 2°C–8°C."
    },
    dosing: {
      standardDoseDisplay: "250 mcg – 500 mcg Daily SubQ (28-day cycle limit)",
      standardDoseMcg: 250,
      cadence: "1x Daily (Q24H SubQ for 28 Days Max)",
      halfLife: "~3 to 5 Hours",
      typicalProtocolDuration: "4 Weeks (28-Day Protocol Maximum)",
      washoutPeriod: "8 to 12 Weeks (Renal Recovery Interval)",
      titrationSteps: [
        { stage: "Stage 1: Initiation", timeframe: "Days 1–7", doseDisplay: "250 mcg Daily", doseMcg: 250, cadence: "1x Daily", focus: "Endothelial receptor saturation", notes: "5.0 units (0.05 mL) on U-100 syringe at 5.0 mg/mL" },
        { stage: "Stage 2: Target Cycle", timeframe: "Days 8–28", doseDisplay: "500 mcg Daily", doseMcg: 500, cadence: "1x Daily", focus: "Targeted adipose vascular apoptosis", notes: "10.0 units (0.10 mL) on U-100 syringe" },
        { stage: "Stage 3: Post-Cycle Washout", timeframe: "Post-Day 28", doseDisplay: "Washout (0 mcg)", doseMcg: 0, cadence: "None", focus: "Strict protocol cessation for renal recovery", notes: "8–12 week recovery required" }
      ],
      deliveryRoute: "subq",
      routeLabel: "Subcutaneous (SubQ) Protocol"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      standardIUDisplay: "5.0 units (0.05 mL)",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.05, syringeIU: 5, tickLabel: "5 units (0.05 mL)" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.1, syringeIU: 10, tickLabel: "10 units (0.10 mL)" }
      ],
      needleGauge: "31G Ultra-Fine",
      needleLength: "5/16\" (8 mm)",
      hubType: "Fixed Integrated Needle",
      deadSpaceCorrection: "Fixed Needle (<0.005 mL dead space)",
      recommendedBarrel: "0.3 mL U-100 syringe",
      transferNeedle: "21G Reconstitution Needle"
    },
    storage: {
      lyophilized: "-20°C dry desiccated (24 months)",
      reconstituted: "2°C–8°C refrigerated; use within 28 days",
      lightProtection: "Protect from light."
    },
    molecularDetails: {
      casNumber: "137525-51-0",
      pubchemCid: 91885623,
      sequenceOrFormula: "CKGGRAKDC-GG-(KLAKLAK)2",
      molecularWeightGPerMol: 2611.3,
      formula: "C111H204N36O28S2",
      molarMass: "2611.3 g/mol",
      purity: "≥99.0% (HPLC-grade)",
      analyticalVerification: "RP-HPLC & ESI-MS Confirmation"
    },
    citations: [
      { sourceReference: "PubMed PMID: 22072637", notes: "Barnhart et al. A peptidomimetic targeting white fat causes marked weight loss and improved insulin resistance in obese monkeys (Sci Transl Med 2011)." }
    ],
    disclaimer: "Strictly for non-clinical laboratory in-vitro and animal model investigation. Known renal tubular sensitivity in primates; not for human use.",
    investigatedBenefits: ["Targeted white adipose capillary apoptosis", "Rapid visceral fat depot reduction", "Non-neurological metabolic action"],
    adverseObservations: ["Transient renal tubular creatinine elevation", "Fatigue during rapid adipose resorption"],
    vialStrengthOptions: [
      { vialMg: 10, diluentMl: 2.0, concMgMl: 5.0, badge: "10 mg Standard Vial" }
    ],
    reconstitutionOptions: {
      standard: { diluentMl: 2.0, concMgMl: 5.0, label: "2.0 mL Standard (5.0 mg/mL)", tickConversion: "1 unit = 50 mcg" }
    },
    protocolCategoryType: "peptide",
    isBlend: false,
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq"]
  },

  {
    id: "l-carnitine",
    compoundName: "Injectable L-Carnitine (600 mg/mL)",
    handles: ["l-carnitine", "injectable-l-carnitine", "levocarnitine"],
    subtitle: "High-Concentration Mitochondrial Acyl-CoA Fatty Acid Shuttle Standard",
    longDescription: "**What it is:** Injectable L-Carnitine is a pharmaceutical-grade aqueous preparation of pure Levocarnitine at 600 mg/mL, bypassing the poor (<15%) gastrointestinal bioavailability of oral carnitine supplements.\n\n**How it works:** It facilitates the transport of long-chain fatty acids across the inner mitochondrial membrane via the Carnitine Palmitoyltransferase (CPT-1/CPT-2) system for beta-oxidation and cellular ATP production.\n\n**Why researchers study it:** Researched in sports science and metabolic medicine for optimizing intramuscular carnitine stores, enhancing aerobic endurance, and sparing muscle glycogen.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "l-carnitine",
    evidenceTier: "Peer-Reviewed Clinical Human Data",
    reconstitution: {
      defaultVialNetMg: 600,
      defaultDiluentMl: 1.0,
      solvent: "Sterile Aqueous Solution (Supplied Pre-Liquid 600 mg/mL)",
      dissolutionMethod: "Pre-dissolved sterile multidose vial. Draw directly using aseptic needle technique.",
      resultingConcentrationMgPerMl: 600.0,
      handlingRule: "Store at controlled room temperature (15°C–25°C) or refrigerate."
    },
    dosing: {
      standardDoseDisplay: "200 mg – 600 mg Pre-Trial SubQ/IM",
      standardDoseMcg: 200000,
      cadence: "1x Daily or Intermittent Pre-Resistance Trial",
      halfLife: "~15 Hours",
      typicalProtocolDuration: "8 to 12 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Stage 1: Initiation", timeframe: "Days 1–7", doseDisplay: "200 mg (0.33 mL)", doseMcg: 200000, cadence: "1x Daily", focus: "Tolerance and localized acclimation", notes: "33.0 units (0.33 mL) on U-100 syringe at 600 mg/mL" },
        { stage: "Stage 2: Standard Research Dose", timeframe: "Weeks 2–8", doseDisplay: "400 mg (0.67 mL)", doseMcg: 400000, cadence: "1x Daily", focus: "Intramuscular carnitine saturation", notes: "67.0 units (0.67 mL) on U-100 syringe" },
        { stage: "Stage 3: Peak Saturation", timeframe: "Weeks 9–12", doseDisplay: "600 mg (1.00 mL)", doseMcg: 600000, cadence: "1x Daily", focus: "Maximum mitochondrial fatty acid flux", notes: "100.0 units (1.00 mL) on U-100 syringe" }
      ],
      deliveryRoute: "subq",
      routeLabel: "Subcutaneous / Intramuscular (IM) Protocol"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL) or 1cc Luer-Lok Syringe",
      standardIUDisplay: "33.0 units (0.33 mL) for 200 mg",
      graduations: [
        { doseDisplay: "200 mg", doseMcg: 200000, volumeMl: 0.33, syringeIU: 33, tickLabel: "33 units (0.33 mL)" },
        { doseDisplay: "400 mg", doseMcg: 400000, volumeMl: 0.67, syringeIU: 67, tickLabel: "67 units (0.67 mL)" },
        { doseDisplay: "600 mg", doseMcg: 600000, volumeMl: 1.0, syringeIU: 100, tickLabel: "100 units (1.00 mL)" }
      ],
      needleGauge: "29G–31G Ultra-Fine",
      needleLength: "1/2\" (12.7 mm)",
      hubType: "Fixed Integrated / Luer-Slip",
      deadSpaceCorrection: "Standard Low Dead Space",
      recommendedBarrel: "1.0 mL U-100 syringe",
      transferNeedle: "Direct draw needle"
    },
    storage: {
      lyophilized: "Liquid solution; store 15°C–25°C protected from light",
      reconstituted: "Use within 60 days of puncture",
      lightProtection: "Protect from excessive heat and direct sunlight."
    },
    molecularDetails: {
      casNumber: "541-15-1",
      pubchemCid: 288,
      sequenceOrFormula: "C7H15NO3",
      molecularWeightGPerMol: 161.2,
      formula: "C7H15NO3",
      molarMass: "161.2 g/mol",
      purity: "≥99.5% (USP Grade)",
      analyticalVerification: "USP Monograph Titration & HPLC"
    },
    citations: [
      { sourceReference: "PubMed PMID: 18065594", notes: "Stephens et al. An increase in muscle carnitine content increases fatty acid oxidation in exercising men (Am J Clin Nutr 2007)." },
      { sourceReference: "PubMed PMID: 21224234", notes: "Wall et al. Chronic oral ingestion of L-carnitine and carbohydrate increases muscle carnitine content and alters muscle fuel metabolism during exercise in humans (J Physiol 2011)." }
    ],
    disclaimer: "Synthesized strictly for laboratory research, sports science kinetics, and analytical investigation. Not for consumer self-administration.",
    investigatedBenefits: ["Bypasses poor oral gastrointestinal absorption", "100% bioavailability for mitochondrial carnitine loading", "Spares muscle glycogen during aerobic exercise protocols"],
    adverseObservations: ["Localized temporary post-injection PIP (pain on injection) if injected cold", "Mild fishy odor at extreme multi-gram dosing (TMAO)"],
    vialStrengthOptions: [
      { vialMg: 600, diluentMl: 1.0, concMgMl: 600.0, badge: "600 mg/mL Multidose Vial" }
    ],
    reconstitutionOptions: {
      standard: { diluentMl: 1.0, concMgMl: 600.0, label: "Supplied Liquid (600 mg/mL)", tickConversion: "1 unit = 6 mg" }
    },
    protocolCategoryType: "small_molecule",
    isBlend: false,
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "im"]
  },

  {
    id: "pramlintide",
    compoundName: "Pramlintide",
    handles: ["pramlintide", "symlin-standard"],
    subtitle: "Synthetic Human Amylin Receptor Agonist Stoichiometric Standard",
    longDescription: "**What it is:** Pramlintide is a synthetic analogue of human amylin (islet amyloid polypeptide) featuring three proline substitutions at positions 25, 28, and 29 to prevent self-aggregation into amyloid fibrils.\n\n**How it works:** It engages calcitonin-receptor-like complexes (AMY1-3 receptors) in the hindbrain area postrema, slowing postprandial gastric emptying, inhibiting inappropriate post-meal glucagon secretion, and centrally enhancing mealtime satiety.\n\n**Why researchers study it:** Investigated for profound synergy with GLP-1 analogues and insulin in optimizing postprandial metabolic homeostasis.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "pramlintide",
    evidenceTier: "FDA-Approved Clinical Molecule Benchmark",
    reconstitution: {
      defaultVialNetMg: 5,
      defaultDiluentMl: 2.5,
      solvent: "Bacteriostatic Water USP",
      dissolutionMethod: "Inject 2.5 mL slowly down inner vial wall. Swirl gently until clear.",
      resultingConcentrationMgPerMl: 2.0,
      handlingRule: "Store at 2°C–8°C refrigerated."
    },
    dosing: {
      standardDoseDisplay: "60 mcg – 120 mcg Pre-Prandial SubQ",
      standardDoseMcg: 60,
      cadence: "Pre-Prandial (Prior to Research Nutrition Ingestion)",
      halfLife: "~48 Minutes",
      typicalProtocolDuration: "8 to 16 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Stage 1: Initiation", timeframe: "Weeks 1–2", doseDisplay: "60 mcg Pre-Prandial", doseMcg: 60, cadence: "Pre-Prandial SubQ", focus: "Tolerability and gastric emptying rate", notes: "3.0 units (0.03 mL) on U-100 syringe at 2.0 mg/mL" },
        { stage: "Stage 2: Target Dose", timeframe: "Weeks 3+", doseDisplay: "120 mcg Pre-Prandial", doseMcg: 120, cadence: "Pre-Prandial SubQ", focus: "Full postprandial glucagon suppression", notes: "6.0 units (0.06 mL) on U-100 syringe" }
      ],
      deliveryRoute: "subq",
      routeLabel: "Subcutaneous (SubQ) Protocol"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      standardIUDisplay: "3.0 units (0.03 mL) for 60 mcg",
      graduations: [
        { doseDisplay: "60 mcg", doseMcg: 60, volumeMl: 0.03, syringeIU: 3, tickLabel: "3 units (0.03 mL)" },
        { doseDisplay: "120 mcg", doseMcg: 120, volumeMl: 0.06, syringeIU: 6, tickLabel: "6 units (0.06 mL)" }
      ],
      needleGauge: "31G Ultra-Fine",
      needleLength: "5/16\" (8 mm)",
      hubType: "Fixed Integrated Needle",
      deadSpaceCorrection: "Fixed Needle (<0.005 mL dead space)",
      recommendedBarrel: "0.3 mL U-100 syringe",
      transferNeedle: "21G Reconstitution Needle"
    },
    storage: {
      lyophilized: "-20°C dry desiccated (24 months)",
      reconstituted: "2°C–8°C refrigerated; use within 28 days",
      lightProtection: "Protect from light."
    },
    molecularDetails: {
      casNumber: "151126-84-0",
      pubchemCid: 16132442,
      sequenceOrFormula: "C171H267N51O53S2",
      molecularWeightGPerMol: 3949.4,
      formula: "C171H267N51O53S2",
      molarMass: "3949.4 g/mol",
      purity: "≥99.0% (HPLC Lot Standard)",
      analyticalVerification: "RP-HPLC & ESI-MS"
    },
    citations: [
      { sourceReference: "PubMed PMID: 12032107", notes: "Hollander et al. Addition of pramlintide to insulin therapy improves long-term glycemic and weight control (Diabetes Care 2002)." }
    ],
    disclaimer: "Research Use Only (RUO). Strictly for scientific in-vitro laboratory research.",
    investigatedBenefits: ["Potent inhibition of postprandial glucagon secretion", "Deceleration of gastric emptying rate", "Central postprandial satiety signaling"],
    adverseObservations: ["Transient mild nausea", "Risk of hypoglycemia when co-administered with insulin in models"],
    vialStrengthOptions: [
      { vialMg: 5, diluentMl: 2.5, concMgMl: 2.0, badge: "5 mg Standard Vial" }
    ],
    reconstitutionOptions: {
      standard: { diluentMl: 2.5, concMgMl: 2.0, label: "2.5 mL Standard (2.0 mg/mL)", tickConversion: "1 unit = 20 mcg" }
    },
    protocolCategoryType: "peptide",
    isBlend: false,
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq"]
  },

  {
    id: "sr9009",
    compoundName: "SR9009 (Stenabolic)",
    handles: ["sr9009", "stenabolic"],
    subtitle: "Synthetic Rev-ErbA Agonist · Circadian Rhythm & Mitochondrial Biogenesis Standard",
    longDescription: "**What it is:** SR9009 (Stenabolic) is a synthetic small-molecule agonist of Rev-ErbAα and Rev-ErbAβ, key nuclear hormone receptors regulating the mammalian circadian clock and mitochondrial bioenergetics.\n\n**How it works:** By activating Rev-Erb, SR9009 represses negative clock genes and upregulates the transcription of fatty acid and glucose oxidation genes, increasing mitochondrial count in skeletal muscle.\n\n**Why researchers study it:** Famous for dramatically boosting running capacity, aerobic endurance, and energy expenditure in preclinical models without physical training.",
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    storeProductHandle: "sr9009",
    evidenceTier: "Preclinical In-Vivo Benchmark Data",
    reconstitution: {
      defaultVialNetMg: 20,
      defaultDiluentMl: 2.0,
      solvent: "Aqueous / PEG-300 / Ethanol analytical vehicle",
      dissolutionMethod: "Dissolves readily in designated research vehicle. Swirl gently until uniform.",
      resultingConcentrationMgPerMl: 10.0,
      handlingRule: "Store protected from direct light."
    },
    dosing: {
      standardDoseDisplay: "5.0 mg – 20.0 mg Daily Divided Cohorts",
      standardDoseMcg: 5000,
      cadence: "Divided Dosing (2x–3x Daily Due to Short Half-Life)",
      halfLife: "~4 to 5 Hours",
      typicalProtocolDuration: "6 to 8 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Stage 1: Initiation", timeframe: "Weeks 1–2", doseDisplay: "5.0 mg Daily", doseMcg: 5000, cadence: "2x Daily (2.5mg split)", focus: "Circadian baseline", notes: "25.0 units (0.25 mL) on U-100 syringe at 10.0 mg/mL" },
        { stage: "Stage 2: Target Evaluation", timeframe: "Weeks 3–6", doseDisplay: "10.0 mg Daily", doseMcg: 10000, cadence: "2x Daily (5mg split)", focus: "Endurance & mitochondrial density", notes: "50.0 units (0.50 mL) on U-100 syringe" },
        { stage: "Stage 3: Peak Cohort", timeframe: "Weeks 7–8", doseDisplay: "20.0 mg Daily", doseMcg: 20000, cadence: "3x Daily (6.6mg split)", focus: "Peak beta-oxidation", notes: "100.0 units (1.00 mL) on U-100 syringe" }
      ],
      deliveryRoute: "oral_solution",
      routeLabel: "Oral Solution / SubQ Analytical"
    },
    syringeGuide: {
      syringeType: "Standard U-100 Precision Syringe / Pipettor",
      standardIUDisplay: "25.0 units (0.25 mL) for 2.5 mg",
      graduations: [
        { doseDisplay: "2.50 mg", doseMcg: 2500, volumeMl: 0.25, syringeIU: 25, tickLabel: "25 units (0.25 mL)" },
        { doseDisplay: "5.00 mg", doseMcg: 5000, volumeMl: 0.5, syringeIU: 50, tickLabel: "50 units (0.50 mL)" }
      ],
      needleGauge: "30G Precision Needle",
      needleLength: "1/2\" (12.7 mm)",
      hubType: "Fixed / Luer-Slip",
      deadSpaceCorrection: "Low Dead Space Standard",
      recommendedBarrel: "1.0 mL Precision Syringe",
      transferNeedle: "Direct Draw Needle"
    },
    storage: {
      lyophilized: "Store 15°C–25°C dry desiccated container (36 months)",
      reconstituted: "2°C–8°C refrigerated; use within 30 days",
      lightProtection: "Protect from light."
    },
    molecularDetails: {
      casNumber: "1379686-30-2",
      pubchemCid: 57347971,
      sequenceOrFormula: "C20H24ClN3O4S",
      molecularWeightGPerMol: 437.94,
      formula: "C20H24ClN3O4S",
      molarMass: "437.94 g/mol",
      purity: "≥99.0% (HPLC-Certified)",
      analyticalVerification: "RP-HPLC, 1H-NMR, LC-MS"
    },
    citations: [
      { sourceReference: "PubMed PMID: 22460952", notes: "Solt et al. Regulation of circadian behaviour and metabolism by synthetic Rev-Erb agonists (Nature 2012)." }
    ],
    disclaimer: "Synthesized strictly for laboratory research and analytical calibration. Not for human use.",
    investigatedBenefits: ["Mitochondrial biogenesis upregulation", "Enhanced fatty acid oxidation and basal energy expenditure", "Circadian metabolic synchronization"],
    adverseObservations: ["Short half-life requiring frequent division", "Preclinical status only"],
    vialStrengthOptions: [
      { vialMg: 20, diluentMl: 2.0, concMgMl: 10.0, badge: "20 mg Standard Vial" }
    ],
    reconstitutionOptions: {
      standard: { diluentMl: 2.0, concMgMl: 10.0, label: "2.0 mL Vehicle (10.0 mg/mL)", tickConversion: "1 unit = 100 mcg" }
    },
    protocolCategoryType: "small_molecule",
    isBlend: false,
    isSupply: false,
    primaryDeliveryRoute: "subq",
    deliveryRoutes: ["subq", "oral"]
  }
]

console.log(`Prepared ${NEW_PROTOCOLS_DATA.length} initial incretins/metabolic protocols for validation.`)
