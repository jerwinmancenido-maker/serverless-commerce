import fs from "fs";

const backendPath = "apps/backend/data/all-compound-protocols.json";
const storefrontPath = "apps/storefront/src/lib/data/compound-protocols/all-protocols.json";

const backendProtocols = JSON.parse(fs.readFileSync(backendPath, "utf8"));
const storefrontProtocols = JSON.parse(fs.readFileSync(storefrontPath, "utf8"));

const STANDARD_DISCLAIMER = "Strictly for in vitro and academic laboratory research purposes only. Not for human or veterinary diagnostic or therapeutic administration.";

// Definition of complete protocol payloads for the 22 new compounds
const protocolEnrichments = {
  "b7-33": {
    category: "Tissue Repair & Healing",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "B7-33 is a synthetic 33-amino-acid single-chain functional peptide mimetic derived from the B-chain of human relaxin-2. Unlike native relaxin-2, which signals through both classical and oncogenic pathways, B7-33 selectively activates the RXFP1 receptor to stimulate cyclic AMP and extracellular signal-regulated kinase (pERK) phosphorylation without promoting cell proliferation. This targeted mechanism drives potent anti-fibrotic, vasodilatory, and tissue remodeling actions across cardiac, pulmonary, and renal preclinical models.",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 5.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; gentle rotational swirling without agitation."
    },
    dosing: {
      standardDoseDisplay: "500 mcg – 1,000 mcg daily research exposure",
      standardDoseMcg: 500,
      cadence: "1x Daily",
      halfLife: "~6 to 8 Hours (Subcutaneous rodent benchmark)",
      typicalProtocolDuration: "8 to 16 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–2", doseDisplay: "250 mcg daily", doseMcg: 250, cadence: "Daily", focus: "Baseline hemodynamic assessment", notes: "5 units on U-100 syringe" },
        { stage: "Escalation", timeframe: "Weeks 3–6", doseDisplay: "500 mcg daily", doseMcg: 500, cadence: "Daily", focus: "Anti-fibrotic collagen turnover", notes: "10 units on U-100 syringe" },
        { stage: "Target / High", timeframe: "Weeks 7+", doseDisplay: "1,000 mcg daily", doseMcg: 1000, cadence: "Daily", focus: "Maximal microvascular remodeling", notes: "20 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL or 0.5 mL, 31G)",
      standardIUDisplay: "10.0 IU = 500 mcg at 5.0 mg/mL",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" }
      ]
    }
  },

  "crystagen-20mg": {
    category: "Antimicrobial & Immune",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Crystagen is a synthetic short-chain Khavinson bioregulator tripeptide composed of L-glutamic acid, L-aspartic acid, and L-proline (Glu-Asp-Pro). Developed through research at the Saint Petersburg Institute of Bioregulation and Gerontology, Crystagen selectively normalizes cellular metabolism and protein synthesis within splenic and thymic lymphoid tissues. Preclinical assays demonstrate significant restoration of CD4+/CD8+ lymphocyte ratios and enhanced resistance to age-related immunosenescence.",
    reconstitution: {
      defaultVialNetMg: 20,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 10.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; gentle rotational swirling."
    },
    dosing: {
      standardDoseDisplay: "1,000 mcg – 2,000 mcg daily research exposure",
      standardDoseMcg: 1000,
      cadence: "1x Daily",
      halfLife: "~2 to 4 Hours",
      typicalProtocolDuration: "10 to 20 Days (Cyclical Course)",
      washoutPeriod: "3 to 6 Months",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Days 1–3", doseDisplay: "500 mcg daily", doseMcg: 500, cadence: "Daily", focus: "Bioregulation induction", notes: "5 units on U-100 syringe" },
        { stage: "Standard Course", timeframe: "Days 4–15", doseDisplay: "1,000 mcg daily", doseMcg: 1000, cadence: "Daily", focus: "T-cell lineage normalization", notes: "10 units on U-100 syringe" },
        { stage: "High Exposure", timeframe: "Days 16–20", doseDisplay: "2,000 mcg daily", doseMcg: 2000, cadence: "Daily", focus: "Thymic stromal stimulation", notes: "20 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "10.0 IU = 1.0 mg at 10.0 mg/mL",
      graduations: [
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "2,000 mcg", doseMcg: 2000, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" }
      ]
    }
  },

  "n-acetyl-epitalon-amidate-5mg": {
    category: "Mitochondrial & Cellular Longevity",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "N-Acetyl Epitalon Amidate is an enzymatically stabilized synthetic derivative of the pineal peptide Epithalon (Ala-Glu-Asp-Gly). By incorporating an N-terminal acetyl group and a C-terminal amide cap (Ac-AEDG-NH2), the molecule gains profound steric resistance against aminopeptidases and carboxypeptidases in biological sera. In vitro studies confirm preserved nanomolar-affinity induction of human telomerase reverse transcriptase (hTERT) mRNA with extended circulatory and intracellular half-life.",
    reconstitution: {
      defaultVialNetMg: 5,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 2.5,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; gentle rotational swirling."
    },
    dosing: {
      standardDoseDisplay: "500 mcg – 1,000 mcg daily research exposure",
      standardDoseMcg: 500,
      cadence: "1x Daily",
      halfLife: "~4 to 6 Hours (Enhanced over native Epitalon)",
      typicalProtocolDuration: "10 to 20 Days (Biannual Cycle)",
      washoutPeriod: "4 to 6 Months",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Days 1–3", doseDisplay: "250 mcg daily", doseMcg: 250, cadence: "Daily", focus: "Tolerance and pineal induction", notes: "10 units on U-100 syringe" },
        { stage: "Target Course", timeframe: "Days 4–15", doseDisplay: "500 mcg daily", doseMcg: 500, cadence: "Daily", focus: "hTERT telomerase activation", notes: "20 units on U-100 syringe" },
        { stage: "Extended Course", timeframe: "Days 16–20", doseDisplay: "1,000 mcg daily", doseMcg: 1000, cadence: "Daily", focus: "Maximal chromatin elongation", notes: "40 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "20.0 IU = 500 mcg at 2.5 mg/mL",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 0.40, syringeIU: 40.0, tickLabel: "40 units" }
      ]
    }
  },

  "thymalin-10mg": {
    category: "Antimicrobial & Immune",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Thymalin is an authoritative natural peptide extract isolated from bovine thymus tissue, characterized and standardized for Russian clinical and gerontological pharmacology. Comprising a biological spectrum of low-molecular-weight thymic polypeptides (1–5 kDa), Thymalin stimulates the differentiation and functional maturation of bone marrow precursor cells into immunocompetent CD3+, CD4+, and CD8+ T-lymphocytes while attenuating pro-inflammatory cytokine surges.",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 5.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; allow 2 minutes for complete colloidal dissolution."
    },
    dosing: {
      standardDoseDisplay: "500 mcg – 1,000 mcg daily research exposure",
      standardDoseMcg: 500,
      cadence: "1x Daily",
      halfLife: "~2 to 4 Hours",
      typicalProtocolDuration: "10 to 14 Days",
      washoutPeriod: "3 to 6 Months",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Days 1–3", doseDisplay: "250 mcg daily", doseMcg: 250, cadence: "Daily", focus: "Thymic signaling baseline", notes: "5 units on U-100 syringe" },
        { stage: "Active Course", timeframe: "Days 4–10", doseDisplay: "500 mcg daily", doseMcg: 500, cadence: "Daily", focus: "T-cell maturation & CD4/CD8 ratio", notes: "10 units on U-100 syringe" },
        { stage: "Final Pulse", timeframe: "Days 11–14", doseDisplay: "1,000 mcg daily", doseMcg: 1000, cadence: "Daily", focus: "Immunocompetence consolidation", notes: "20 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "10.0 IU = 500 mcg at 5.0 mg/mL",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" }
      ]
    }
  },

  "dulaglutide": {
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Dulaglutide is a long-acting recombinant human glucagon-like peptide-1 (GLP-1) receptor agonist engineered as a covalent dimer fused to an Fc fragment of modified human IgG4. The Fc fusion prevents renal filtration and endopeptidase DPP-4 degradation, imparting a terminal half-life of approximately 5 days (120 hours). This benchmark pharmacological tool allows precise weekly incretin pathway modulation in rodent and mammalian metabolic disease investigations.",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 5.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; avoid shaking to prevent protein foaming."
    },
    dosing: {
      standardDoseDisplay: "0.75 mg – 1.5 mg weekly research exposure",
      standardDoseMcg: 750,
      cadence: "1x Weekly",
      halfLife: "~120 Hours (5 Days)",
      typicalProtocolDuration: "12 to 24 Weeks",
      washoutPeriod: "4 to 6 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–4", doseDisplay: "0.75 mg weekly", doseMcg: 750, cadence: "Weekly", focus: "Incretin tolerability titration", notes: "15 units on U-100 syringe" },
        { stage: "Escalation", timeframe: "Weeks 5–8", doseDisplay: "1.5 mg weekly", doseMcg: 1500, cadence: "Weekly", focus: "Steady-state glucose regulation", notes: "30 units on U-100 syringe" },
        { stage: "High Maintenance", timeframe: "Weeks 9+", doseDisplay: "3.0 mg weekly", doseMcg: 3000, cadence: "Weekly", focus: "Maximal glycemic & weight endpoints", notes: "60 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.5 mL or 1.0 mL, 31G)",
      standardIUDisplay: "15.0 IU = 750 mcg at 5.0 mg/mL",
      graduations: [
        { doseDisplay: "750 mcg", doseMcg: 750, volumeMl: 0.15, syringeIU: 15.0, tickLabel: "15 units" },
        { doseDisplay: "1,500 mcg", doseMcg: 1500, volumeMl: 0.30, syringeIU: 30.0, tickLabel: "30 units" },
        { doseDisplay: "3,000 mcg", doseMcg: 3000, volumeMl: 0.60, syringeIU: 60.0, tickLabel: "60 units" }
      ]
    }
  },

  "retatrutide-cagrilintide-blend-10mg": {
    category: "Multi-Peptide Blends",
    catalogStatus: "in_catalog",
    isBlend: true,
    protocolCategoryType: "blend",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "The Retatrutide + Cagrilintide Blend (RC10) is a co-lyophilized metabolic research preparation combining 5 mg of Retatrutide (GIP/GLP-1/Glucagon tri-agonist) with 5 mg of Cagrilintide (dual amylin and calcitonin receptor agonist) in a precise 1:1 molar-adjusted mass ratio. This multi-target incretin-amylin formulation permits laboratory investigation into the synergistic potentiation of peripheral energy expenditure, hepatic lipid clearance, and neuroendocrine satiety signaling.",
    blendConstituents: [
      { compoundName: "Retatrutide", ratio: "5mg (50%)", primaryPathway: "GIP / GLP-1 / Glucagon Tri-Receptor Agonism" },
      { compoundName: "Cagrilintide", ratio: "5mg (50%)", primaryPathway: "Dual Amylin / Calcitonin Receptor Agonism" }
    ],
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 5.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; gentle rotational swirling."
    },
    dosing: {
      standardDoseDisplay: "500 mcg – 1,000 mcg weekly research exposure",
      standardDoseMcg: 1000,
      cadence: "1x Weekly",
      halfLife: "~144 Hours (Dual long-acting kinetics)",
      typicalProtocolDuration: "12 to 24 Weeks",
      washoutPeriod: "6 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–4", doseDisplay: "250 mcg weekly", doseMcg: 250, cadence: "Weekly", focus: "Dual incretin-amylin tolerance", notes: "5 units on U-100 syringe" },
        { stage: "Escalation", timeframe: "Weeks 5–8", doseDisplay: "500 mcg weekly", doseMcg: 500, cadence: "Weekly", focus: "Appetite suppression and thermogenesis", notes: "10 units on U-100 syringe" },
        { stage: "Maintenance", timeframe: "Weeks 9+", doseDisplay: "1,000 mcg weekly", doseMcg: 1000, cadence: "Weekly", focus: "Target multi-receptor synergy", notes: "20 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "20.0 IU = 1.0 mg at 5.0 mg/mL",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" }
      ]
    }
  },

  "glp-1-native-5mg": {
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "GLP-1 Native (7-36 Amide) is the biologically active endogenous human peptide hormone synthesized and secreted by intestinal L-cells in response to nutrient intake. Truncated from proglucagon, GLP-1(7-36) amide binds with picomolar affinity to the human GLP-1 receptor, stimulating glucose-dependent insulin secretion. Due to rapid degradation by dipeptidyl peptidase-4 (DPP-4; half-life 1.5–2 minutes), it serves as the essential positive control standard for incretin binding and enzymatic cleavage assays.",
    reconstitution: {
      defaultVialNetMg: 5,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 2.5,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; keep cold on wet ice."
    },
    dosing: {
      standardDoseDisplay: "50 mcg – 100 mcg per acute infusion or exposure assay",
      standardDoseMcg: 100,
      cadence: "Acute / Pre-Feeding",
      halfLife: "~2 to 3 Minutes (Rapid DPP-4 cleavage in plasma)",
      typicalProtocolDuration: "Acute In Vitro / In Vivo Assays",
      washoutPeriod: "24 Hours",
      titrationSteps: [
        { stage: "Baseline Control", timeframe: "Assay Day 1", doseDisplay: "25 mcg acute", doseMcg: 25, cadence: "Acute", focus: "Receptor binding kinetics", notes: "1 unit on U-100 syringe" },
        { stage: "Functional Response", timeframe: "Assay Day 2", doseDisplay: "50 mcg acute", doseMcg: 50, cadence: "Acute", focus: "Glucose clamp insulin release", notes: "2 units on U-100 syringe" },
        { stage: "Maximal Stimulus", timeframe: "Assay Day 3", doseDisplay: "100 mcg acute", doseMcg: 100, cadence: "Acute", focus: "Satiety signaling control", notes: "4 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "4.0 IU = 100 mcg at 2.5 mg/mL",
      graduations: [
        { doseDisplay: "25 mcg", doseMcg: 25, volumeMl: 0.01, syringeIU: 1.0, tickLabel: "1 unit" },
        { doseDisplay: "50 mcg", doseMcg: 50, volumeMl: 0.02, syringeIU: 2.0, tickLabel: "2 units" },
        { doseDisplay: "100 mcg", doseMcg: 100, volumeMl: 0.04, syringeIU: 4.0, tickLabel: "4 units" }
      ]
    }
  },

  "teriparatide-10mg": {
    category: "Tissue Repair & Healing",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Teriparatide is the synthetic 34-amino-acid N-terminal bioactive fragment of recombinant human parathyroid hormone [rhPTH(1-34)]. When administered in intermittent pulsatile regimens, Teriparatide selectively stimulates osteoblast survival and bone matrix deposition over osteoclast resorption, accelerating bone mineral density accretion, microarchitectural repair, and periosteal callus formation in preclinical fracture models.",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 5.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; store strictly refrigerated at 2°C–8°C."
    },
    dosing: {
      standardDoseDisplay: "20 mcg – 40 mcg daily pulsatile research exposure",
      standardDoseMcg: 500,
      cadence: "1x Daily (Intermittent Pulsatile)",
      halfLife: "~1 Hour (Subcutaneous elimination)",
      typicalProtocolDuration: "8 to 24 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–2", doseDisplay: "250 mcg daily aliquot", doseMcg: 250, cadence: "Daily", focus: "Osteoblast receptor priming", notes: "5 units on U-100 syringe" },
        { stage: "Standard Regimen", timeframe: "Weeks 3–12", doseDisplay: "500 mcg daily aliquot", doseMcg: 500, cadence: "Daily", focus: "Bone mineral density accrual", notes: "10 units on U-100 syringe" },
        { stage: "Intensive Healing", timeframe: "Weeks 13+", doseDisplay: "1,000 mcg daily aliquot", doseMcg: 1000, cadence: "Daily", focus: "Accelerated fracture callus consolidation", notes: "20 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "10.0 IU = 500 mcg at 5.0 mg/mL",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" }
      ]
    }
  },

  "hgh-fragment-176-191": {
    category: "Growth Hormone Axis",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "HGH Fragment 176-191 is the unmodified C-terminal peptide fragment (amino acids 176–191) of human growth hormone. Unlike the full 191-amino-acid somatropin protein, this isolated peptide domain specifically isolates the lipolytic and anti-lipogenic properties of GH through beta-3 adrenergic receptor pathways without altering plasma IGF-1 concentrations, stimulating cell mitosis, or causing hyperglycemia or insulin resistance.",
    reconstitution: {
      defaultVialNetMg: 5,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 2.5,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; gentle swirling without agitation."
    },
    dosing: {
      standardDoseDisplay: "250 mcg – 500 mcg 1–2x daily fasted research exposure",
      standardDoseMcg: 250,
      cadence: "1–2x Daily (Fasted)",
      halfLife: "~30 Minutes (Rapid clearance; sustained downstream lipolysis)",
      typicalProtocolDuration: "8 to 16 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–2", doseDisplay: "250 mcg daily", doseMcg: 250, cadence: "Daily fasted", focus: "Lipolytic threshold assessment", notes: "10 units on U-100 syringe" },
        { stage: "Standard Regimen", timeframe: "Weeks 3–8", doseDisplay: "250 mcg 2x daily", doseMcg: 500, cadence: "Split morning/evening", focus: "Accelerated adipocyte lipid export", notes: "20 units on U-100 syringe" },
        { stage: "Intensive Regimen", timeframe: "Weeks 9+", doseDisplay: "500 mcg 2x daily", doseMcg: 1000, cadence: "Split morning/evening", focus: "Maximal lipid oxidation rates", notes: "40 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "10.0 IU = 250 mcg at 2.5 mg/mL",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 0.40, syringeIU: 40.0, tickLabel: "40 units" }
      ]
    }
  },

  "gdf-8-1mg": {
    category: "Growth Hormone Axis",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "GDF-8 (Growth Differentiation Factor 8 Propeptide) is the endogenous 243-amino-acid prodomain of myostatin that binds non-covalently to mature myostatin, holding it in a latent, inactive conformation. By preventing myostatin from binding to ActRIIB/ALK4/5 receptor complexes, GDF-8 propeptide halts downstream Smad2/Smad3 phosphorylation, releasing skeletal muscle cells from negative growth constraints in cachexia and sarcopenia assays.",
    reconstitution: {
      defaultVialNetMg: 1,
      defaultDiluentMl: 1.0,
      resultingConcentrationMgPerMl: 1.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; store strictly at -20°C."
    },
    dosing: {
      standardDoseDisplay: "100 mcg – 200 mcg weekly research exposure",
      standardDoseMcg: 100,
      cadence: "1x Weekly",
      halfLife: "~24 to 48 Hours",
      typicalProtocolDuration: "8 to 12 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–2", doseDisplay: "50 mcg weekly", doseMcg: 50, cadence: "Weekly", focus: "Myostatin binding baseline", notes: "5 units on U-100 syringe" },
        { stage: "Target Regimen", timeframe: "Weeks 3–8", doseDisplay: "100 mcg weekly", doseMcg: 100, cadence: "Weekly", focus: "Smad2/3 pathway suppression", notes: "10 units on U-100 syringe" },
        { stage: "Intensive Regimen", timeframe: "Weeks 9+", doseDisplay: "200 mcg weekly", doseMcg: 200, cadence: "Weekly", focus: "Maximal myofibrillar protein synthesis", notes: "20 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "10.0 IU = 100 mcg at 1.0 mg/mL",
      graduations: [
        { doseDisplay: "50 mcg", doseMcg: 50, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "100 mcg", doseMcg: 100, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "200 mcg", doseMcg: 200, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" }
      ]
    }
  },

  "acth-1-39-5mg": {
    category: "Antimicrobial & Immune",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "ACTH 1-39 (Adrenocorticotropic Hormone) is the full-length 39-amino-acid anterior pituitary polypeptide hormone responsible for regulating adrenal cortical steroidogenesis. ACTH binds with high affinity to melanocortin receptor type 2 (MC2R), stimulating cholesterol side-chain cleavage to produce glucocorticoids, mineralocorticoids, and androgens. In experimental neurology and neuroimmunology, it serves as the key probe for the hypothalamic-pituitary-adrenal (HPA) axis.",
    reconstitution: {
      defaultVialNetMg: 5,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 2.5,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; avoid vigorous shaking."
    },
    dosing: {
      standardDoseDisplay: "50 mcg – 250 mcg per experimental challenge protocol",
      standardDoseMcg: 250,
      cadence: "1x Daily or Intermittent Pulse",
      halfLife: "~15 to 20 Minutes (Plasma half-life)",
      typicalProtocolDuration: "Acute to 4 Weeks",
      washoutPeriod: "2 Weeks",
      titrationSteps: [
        { stage: "Baseline Pulse", timeframe: "Day 1", doseDisplay: "50 mcg pulse", doseMcg: 50, cadence: "Pulse", focus: "MC2R adrenal sensitivity test", notes: "2 units on U-100 syringe" },
        { stage: "Intermediate Challenge", timeframe: "Days 2–7", doseDisplay: "125 mcg daily", doseMcg: 125, cadence: "Daily", focus: "Corticosterone release tracking", notes: "5 units on U-100 syringe" },
        { stage: "Full Challenge", timeframe: "Days 8–14", doseDisplay: "250 mcg daily", doseMcg: 250, cadence: "Daily", focus: "Peak adrenocortical activation", notes: "10 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "10.0 IU = 250 mcg at 2.5 mg/mL",
      graduations: [
        { doseDisplay: "50 mcg", doseMcg: 50, volumeMl: 0.02, syringeIU: 2.0, tickLabel: "2 units" },
        { doseDisplay: "125 mcg", doseMcg: 125, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" }
      ]
    }
  },

  "dermorphin-5mg": {
    category: "Cognitive & Neuroprotective",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Dermorphin is a natural heptapeptide (H-Tyr-D-Ala-Phe-Gly-Tyr-Pro-Ser-NH2) originally isolated from the skin of South American tree frogs (Phyllomedusa sauvagei). Notably containing a post-translationally isomerized D-alanine residue at position 2, Dermorphin displays nanomolar, ultra-selective affinity for the mu-opioid receptor (MOR) with minimal affinity for delta or kappa receptors. It serves as an authoritative scientific tool in opioid pharmacology and antinociceptive signaling studies.",
    reconstitution: {
      defaultVialNetMg: 5,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 2.5,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; gentle rotational swirling."
    },
    dosing: {
      standardDoseDisplay: "50 mcg – 250 mcg acute experimental exposure",
      standardDoseMcg: 250,
      cadence: "Acute Experimental Challenge",
      halfLife: "~1.5 to 3 Hours",
      typicalProtocolDuration: "Acute Laboratory Assays",
      washoutPeriod: "48 Hours",
      titrationSteps: [
        { stage: "Threshold Assay", timeframe: "Day 1", doseDisplay: "50 mcg acute", doseMcg: 50, cadence: "Acute", focus: "Receptor binding verification", notes: "2 units on U-100 syringe" },
        { stage: "Intermediate Assay", timeframe: "Day 2", doseDisplay: "125 mcg acute", doseMcg: 125, cadence: "Acute", focus: "Mu-opioid selective activation", notes: "5 units on U-100 syringe" },
        { stage: "Full Dose Assay", timeframe: "Day 3", doseDisplay: "250 mcg acute", doseMcg: 250, cadence: "Acute", focus: "Maximal antinociceptive model response", notes: "10 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "10.0 IU = 250 mcg at 2.5 mg/mL",
      graduations: [
        { doseDisplay: "50 mcg", doseMcg: 50, volumeMl: 0.02, syringeIU: 2.0, tickLabel: "2 units" },
        { doseDisplay: "125 mcg", doseMcg: 125, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" }
      ]
    }
  },

  "epo-3000iu": {
    category: "Mitochondrial & Cellular Longevity",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "EPO (Recombinant Human Erythropoietin / Epoetin Alfa) is a 165-amino-acid glycoprotein hormone synthesized via recombinant DNA technology. By binding to the erythropoietin receptor homodimer on erythroid progenitor cells, it triggers JAK2/STAT5 signaling cascades that suppress apoptosis and stimulate differentiation into mature erythrocytes. In cellular biology, non-erythropoietic tissue protection pathways mediated by the EPOR-CD131 heterodimer are also actively investigated.",
    reconstitution: {
      defaultVialNetMg: 1.0,
      defaultDiluentMl: 1.0,
      resultingConcentrationMgPerMl: 1.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; strictly avoid shaking to protect glycoprotein quaternary structure."
    },
    dosing: {
      standardDoseDisplay: "100 mcg – 500 mcg (300 IU – 1,500 IU) weekly research exposure",
      standardDoseMcg: 200,
      cadence: "1–3x Weekly",
      halfLife: "~4 to 12 Hours (Subcutaneous absorption)",
      typicalProtocolDuration: "4 to 8 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–2", doseDisplay: "100 mcg (300 IU) weekly", doseMcg: 100, cadence: "Weekly", focus: "Reticulocyte response baseline", notes: "10 units on U-100 syringe" },
        { stage: "Standard Regimen", timeframe: "Weeks 3–6", doseDisplay: "200 mcg (600 IU) weekly", doseMcg: 200, cadence: "Weekly", focus: "Hematocrit stabilization", notes: "20 units on U-100 syringe" },
        { stage: "Target Regimen", timeframe: "Weeks 7+", doseDisplay: "500 mcg (1,500 IU) weekly", doseMcg: 500, cadence: "Weekly", focus: "Maximal tissue oxygenation study", notes: "50 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL or 0.5 mL, 31G)",
      standardIUDisplay: "20.0 IU = 200 mcg (600 IU) at 1.0 mg/mL",
      graduations: [
        { doseDisplay: "100 mcg", doseMcg: 100, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "200 mcg", doseMcg: 200, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.50, syringeIU: 50.0, tickLabel: "50 units" }
      ]
    }
  },

  "alprostadil-20mcg": {
    category: "Photoprotection & Sexual Health",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Alprostadil (Prostaglandin E1 / PGE1) is a naturally occurring eicosanoid and powerful biological microvascular vasodilator. By binding specifically to EP2 and EP4 prostanoid receptors on vascular smooth muscle, Alprostadil activates adenylyl cyclase, elevating intracellular cyclic AMP (cAMP) and reducing intracellular calcium. In experimental models, it serves as the benchmark standard for cavernous and peripheral microvascular perfusion studies.",
    reconstitution: {
      defaultVialNetMg: 0.02,
      defaultDiluentMl: 1.0,
      resultingConcentrationMgPerMl: 0.02,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; use immediately after reconstitution."
    },
    dosing: {
      standardDoseDisplay: "5 mcg – 20 mcg experimental microvascular challenge",
      standardDoseMcg: 10,
      cadence: "Acute Experimental Challenge",
      halfLife: "~5 to 10 Minutes (Rapid pulmonary clearance)",
      typicalProtocolDuration: "Acute Laboratory Assays",
      washoutPeriod: "24 Hours",
      titrationSteps: [
        { stage: "Threshold Exposure", timeframe: "Challenge 1", doseDisplay: "5 mcg acute", doseMcg: 5, cadence: "Acute", focus: "Endothelial dilation threshold", notes: "25 units on U-100 syringe" },
        { stage: "Target Exposure", timeframe: "Challenge 2", doseDisplay: "10 mcg acute", doseMcg: 10, cadence: "Acute", focus: "Microvascular smooth muscle relaxation", notes: "50 units on U-100 syringe" },
        { stage: "Maximal Exposure", timeframe: "Challenge 3", doseDisplay: "20 mcg acute", doseMcg: 20, cadence: "Acute", focus: "Full cavernous perfusion endpoint", notes: "100 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (1.0 mL, 31G)",
      standardIUDisplay: "50.0 IU = 10 mcg at 0.02 mg/mL",
      graduations: [
        { doseDisplay: "5 mcg", doseMcg: 5, volumeMl: 0.25, syringeIU: 25.0, tickLabel: "25 units" },
        { doseDisplay: "10 mcg", doseMcg: 10, volumeMl: 0.50, syringeIU: 50.0, tickLabel: "50 units" },
        { doseDisplay: "20 mcg", doseMcg: 20, volumeMl: 1.00, syringeIU: 100.0, tickLabel: "100 units" }
      ]
    }
  },

  "melatonin-10mg": {
    category: "Cognitive & Neuroprotective",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Melatonin (N-acetyl-5-methoxytryptamine) is a high-purity research-grade lyophilized indolamine neurohormone synthesized endogenously by the pineal gland. Serving as the primary circadian chronobiological pacemaker via high-affinity MT1 and MT2 G-protein coupled receptors, Melatonin also functions as an exceptionally potent direct scavenger of reactive oxygen and nitrogen species, crossing blood-brain and mitochondrial membranes to protect electron transport complexes.",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 5.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; protect strictly from light."
    },
    dosing: {
      standardDoseDisplay: "500 mcg – 2,000 mcg nocturnal research exposure",
      standardDoseMcg: 1000,
      cadence: "1x Nightly (Prior to dark cycle)",
      halfLife: "~30 to 45 Minutes",
      typicalProtocolDuration: "4 to 12 Weeks",
      washoutPeriod: "2 Weeks",
      titrationSteps: [
        { stage: "Circadian Priming", timeframe: "Weeks 1–2", doseDisplay: "500 mcg nightly", doseMcg: 500, cadence: "Nightly", focus: "MT1/MT2 receptor phase shifts", notes: "10 units on U-100 syringe" },
        { stage: "Target Antioxidant", timeframe: "Weeks 3–6", doseDisplay: "1,000 mcg nightly", doseMcg: 1000, cadence: "Nightly", focus: "Mitochondrial reactive species scavenging", notes: "20 units on U-100 syringe" },
        { stage: "High Exposure", timeframe: "Weeks 7+", doseDisplay: "2,000 mcg nightly", doseMcg: 2000, cadence: "Nightly", focus: "Neuroprotective chronobiology assay", notes: "40 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "20.0 IU = 1.0 mg at 5.0 mg/mL",
      graduations: [
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" },
        { doseDisplay: "2,000 mcg", doseMcg: 2000, volumeMl: 0.40, syringeIU: 40.0, tickLabel: "40 units" }
      ]
    }
  },

  "botulinum-toxin-100iu": {
    category: "Skin, Hair & Cellular Matrix",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Botulinum Toxin Type A is an analytical 150 kDa neurotoxic protein standard produced by Clostridium botulinum. Composed of a 100 kDa heavy chain responsible for selective cholinergic presynaptic binding and a 50 kDa zinc-metalloprotease light chain, it cleaves synaptosomal-associated protein 25 (SNAP-25). This specific cleavage prevents the assembly of the SNARE complex, reversibly inhibiting acetylcholine vesicle exocytosis at neuromuscular junctions.",
    reconstitution: {
      defaultVialNetMg: 0.005,
      defaultDiluentMl: 2.5,
      resultingConcentrationMgPerMl: 0.002,
      solvent: "0.9% Sterile Sodium Chloride Solution",
      dissolutionMethod: "Slow vacuum-drawn saline along glass wall; strictly do not agitate."
    },
    dosing: {
      standardDoseDisplay: "4 IU – 20 IU (0.2 mcg – 1.0 mcg) micro-injection research challenge",
      standardDoseMcg: 1.0,
      cadence: "Single Intermittent Micro-Dose Protocol",
      halfLife: "~3 to 6 Months (Biological SNAP-25 cleavage duration)",
      typicalProtocolDuration: "Single Challenge (Followed by 12-week observational assay)",
      washoutPeriod: "16 Weeks",
      titrationSteps: [
        { stage: "Micro-Challenge", timeframe: "Challenge 1", doseDisplay: "4 IU (0.2 mcg)", doseMcg: 0.2, cadence: "Single dose", focus: "Focal presynaptic blockade", notes: "10 units on U-100 syringe" },
        { stage: "Standard Challenge", timeframe: "Challenge 2", doseDisplay: "10 IU (0.5 mcg)", doseMcg: 0.5, cadence: "Single dose", focus: "Motor endplate transmission block", notes: "25 units on U-100 syringe" },
        { stage: "High Challenge", timeframe: "Challenge 3", doseDisplay: "20 IU (1.0 mcg)", doseMcg: 1.0, cadence: "Single dose", focus: "Maximal neuromuscular junction inhibition", notes: "50 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL or 0.5 mL, 31G)",
      standardIUDisplay: "50.0 IU = 20 IU Toxin (1.0 mcg) at 0.002 mg/mL",
      graduations: [
        { doseDisplay: "0.2 mcg (4 IU)", doseMcg: 0.2, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "0.5 mcg (10 IU)", doseMcg: 0.5, volumeMl: 0.25, syringeIU: 25.0, tickLabel: "25 units" },
        { doseDisplay: "1.0 mcg (20 IU)", doseMcg: 1.0, volumeMl: 0.50, syringeIU: 50.0, tickLabel: "50 units" }
      ]
    }
  },

  "hyaluronic-acid-5mg": {
    category: "Skin, Hair & Cellular Matrix",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Hyaluronic Acid (Research Matrix Standard) is a high-molecular-weight linear nonsulfated glycosaminoglycan composed of repeating disaccharide units of D-glucuronic acid and N-acetyl-D-glucosamine. Serving as a crucial structural and viscoelastic component of the extracellular matrix in skin, synovial fluid, and connective tissues, it functions in research as a biomimetic carrier vehicle and hydration standard for dermal peptide delivery.",
    reconstitution: {
      defaultVialNetMg: 5,
      defaultDiluentMl: 5.0,
      resultingConcentrationMgPerMl: 1.0,
      solvent: "Sterile Endotoxin-Free Saline / Water",
      dissolutionMethod: "Slow rehydration over 30 minutes; allow complete hydrogel solubilization."
    },
    dosing: {
      standardDoseDisplay: "0.5 mg – 1.0 mg topical or local mesotherapy research application",
      standardDoseMcg: 500,
      cadence: "1–2x Weekly",
      halfLife: "~24 to 72 Hours in local tissue matrix",
      typicalProtocolDuration: "6 to 12 Weeks",
      washoutPeriod: "2 Weeks",
      titrationSteps: [
        { stage: "Hydrogel Baseline", timeframe: "Weeks 1–2", doseDisplay: "250 mcg application", doseMcg: 250, cadence: "Weekly", focus: "Dermal hydration baseline", notes: "25 units on U-100 syringe" },
        { stage: "Matrix Expansion", timeframe: "Weeks 3–6", doseDisplay: "500 mcg application", doseMcg: 500, cadence: "Weekly", focus: "Fibroblast receptor CD44 binding", notes: "50 units on U-100 syringe" },
        { stage: "Maximal Hydration", timeframe: "Weeks 7+", doseDisplay: "1,000 mcg application", doseMcg: 1000, cadence: "Weekly", focus: "Viscoelastic extracellular remodeling", notes: "100 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Syringe (1.0 mL, 30G)",
      standardIUDisplay: "50.0 IU = 500 mcg at 1.0 mg/mL",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.25, syringeIU: 25.0, tickLabel: "25 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.50, syringeIU: 50.0, tickLabel: "50 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 1.00, syringeIU: 100.0, tickLabel: "100 units" }
      ]
    }
  },

  "hhb-blend-10mg": {
    category: "Multi-Peptide Blends",
    catalogStatus: "in_catalog",
    isBlend: true,
    protocolCategoryType: "blend",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "HHB Complex is a multi-target regenerative cosmetic peptide formulation combining 5 mg Copper Peptide (GHK-Cu), 3 mg Biotinyl-GHK, and 2 mg Thymosin Beta-4 (TB-500). Engineered to study follicular extracellular matrix remodeling, angiogenesis, and microvascular hair bulb perfusion, this synergy drives simultaneous stimulation of collagen synthesis, microvascular sprouting, and hair follicle stem cell activation.",
    blendConstituents: [
      { compoundName: "GHK-Cu", ratio: "5mg (50%)", primaryPathway: "Collagen Type I/III Synthesis & Angiogenesis" },
      { compoundName: "Biotinyl-GHK", ratio: "3mg (30%)", primaryPathway: "Follicular Extracellular Matrix Anchor Synthesis" },
      { compoundName: "Thymosin Beta-4 (TB-500)", ratio: "2mg (20%)", primaryPathway: "Actin Polymerization & Microvascular Revascularization" }
    ],
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      resultingConcentrationMgPerMl: 5.0,
      solvent: "Bacteriostatic Water (0.9% Benzyl Alcohol)",
      dissolutionMethod: "Slow laminar stream against vial wall; gentle swirling without foam."
    },
    dosing: {
      standardDoseDisplay: "500 mcg – 1,000 mcg weekly research exposure",
      standardDoseMcg: 500,
      cadence: "1–2x Weekly",
      halfLife: "~24 to 48 Hours (Multi-component kinetics)",
      typicalProtocolDuration: "12 to 24 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–2", doseDisplay: "250 mcg weekly", doseMcg: 250, cadence: "Weekly", focus: "Follicular tolerance assessment", notes: "5 units on U-100 syringe" },
        { stage: "Standard Regimen", timeframe: "Weeks 3–12", doseDisplay: "500 mcg weekly", doseMcg: 500, cadence: "Weekly", focus: "Vascular endothelial factor upregulation", notes: "10 units on U-100 syringe" },
        { stage: "Intensive Regimen", timeframe: "Weeks 13+", doseDisplay: "1,000 mcg weekly", doseMcg: 1000, cadence: "Weekly", focus: "Maximal follicular re-anchoring study", notes: "20 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "10.0 IU = 500 mcg at 5.0 mg/mL",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 0.20, syringeIU: 20.0, tickLabel: "20 units" }
      ]
    }
  },

  "acetic-acid-water-0-6": {
    category: "Laboratory Supplies",
    catalogStatus: "in_catalog",
    isSupply: true,
    protocolCategoryType: "supply",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "0.6% Acetic Acid Reconstitution Solvent is an essential laboratory reagent specially formulated for dissolving and stabilizing peptides prone to isoelectric aggregation at neutral pH (notably IGF-1 LR3, IGF-1 DES, and Long-R3). Buffered to an acidic pH of 2.8–3.2 with reagent-grade glacial acetic acid in endotoxin-free water, it maintains peptide monomer stability and biological potency during long-term refrigeration.",
    supplyGuide: {
      physicalState: "Aqueous solution (0.6% v/v glacial acetic acid in sterile endotoxin-free water)",
      protocolSteps: [
        "Inspect reagent vial for optical clarity and closure integrity prior to puncturing septum.",
        "Sterilize vial septum with 70% isopropyl alcohol and allow to air dry completely.",
        "Aspirate exact required diluent volume using a sterile syringe without introducing aerated bubbles.",
        "Transfer slowly down the glass wall of the lyophilized peptide vial to preserve molecular stability."
      ],
      features: [
        "Optimal pH range (pH 2.8–3.2) preventing IGF-1 LR3 isoelectric precipitation.",
        "Reagent-grade glacial acetic acid filtered through 0.22 micron PES membrane.",
        "Certified endotoxin-free (< 0.005 EU/mL) for analytical cell culture compatibility.",
        "Supplied in borosilicate type I glass vials with bromobutyl rubber stopper."
      ]
    }
  },

  "b12-liquid": {
    category: "Mitochondrial & Cellular Longevity",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Pure Vitamin B12 (Cyanocobalamin / Methylcobalamin Solution) is a high-potency research-grade cobalamin solution (1,000 mcg/mL; 10 mg / 10 mL). As an indispensable cobalt-containing biological cofactor for methionine synthase and methylmalonyl-CoA mutase, it is utilized across laboratory protocols to assess one-carbon folate-methionine cycling, homocysteine transmethylation, and mitochondrial fatty acid beta-oxidation.",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 10.0,
      resultingConcentrationMgPerMl: 1.0,
      solvent: "Pre-Dissolved Solution (0.9% Benzyl Alcohol Preserved Saline)",
      dissolutionMethod: "Liquid formulation; ready for immediate research aspiration without reconstitution."
    },
    dosing: {
      standardDoseDisplay: "500 mcg – 1,000 mcg per experimental metabolic protocol",
      standardDoseMcg: 1000,
      cadence: "1–2x Weekly",
      halfLife: "~6 Days in tissue stores",
      typicalProtocolDuration: "4 to 12 Weeks",
      washoutPeriod: "4 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–2", doseDisplay: "500 mcg weekly", doseMcg: 500, cadence: "Weekly", focus: "Methionine synthase cofactor priming", notes: "50 units on U-100 syringe" },
        { stage: "Target Regimen", timeframe: "Weeks 3–8", doseDisplay: "1,000 mcg weekly", doseMcg: 1000, cadence: "Weekly", focus: "Homocysteine methylation study", notes: "100 units on U-100 syringe" },
        { stage: "High Maintenance", timeframe: "Weeks 9+", doseDisplay: "2,000 mcg weekly", doseMcg: 2000, cadence: "Weekly", focus: "Peak cobalamin tissue saturation", notes: "2x 100 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Syringe (1.0 mL, 30G)",
      standardIUDisplay: "100.0 IU = 1,000 mcg at 1.0 mg/mL",
      graduations: [
        { doseDisplay: "250 mcg", doseMcg: 250, volumeMl: 0.25, syringeIU: 25.0, tickLabel: "25 units" },
        { doseDisplay: "500 mcg", doseMcg: 500, volumeMl: 0.50, syringeIU: 50.0, tickLabel: "50 units" },
        { doseDisplay: "1,000 mcg", doseMcg: 1000, volumeMl: 1.00, syringeIU: 100.0, tickLabel: "100 units" }
      ]
    }
  },

  "lc120": {
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    isBlend: true,
    protocolCategoryType: "blend",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "LC120 Lipotropic Research Solution is a concentrated multi-compound metabolic preparation containing L-Carnitine (500 mg/mL), Choline Chloride (50 mg/mL), and Inositol (50 mg/mL) in a 10 mL multi-dose solution. Designed for laboratory assays exploring mitochondrial long-chain fatty acid entry via carnitine palmitoyltransferase-1 (CPT-1) and hepatic lipid clearance, it provides a validated vehicle for metabolic flux profiling.",
    blendConstituents: [
      { compoundName: "L-Carnitine", ratio: "500mg/mL", primaryPathway: "Mitochondrial Beta-Oxidation & Fatty Acid Transport" },
      { compoundName: "Choline Chloride + Inositol", ratio: "50mg/mL", primaryPathway: "Hepatic Phospholipid Synthesis & Lipotropic Clearance" }
    ],
    reconstitution: {
      defaultVialNetMg: 1200,
      defaultDiluentMl: 10.0,
      resultingConcentrationMgPerMl: 120.0,
      solvent: "Pre-Dissolved Solution (Sterile Saline Base)",
      dissolutionMethod: "Liquid formulation; ready for immediate laboratory pipetting."
    },
    dosing: {
      standardDoseDisplay: "60 mg – 120 mg (0.5 mL – 1.0 mL) per research assay",
      standardDoseMcg: 60000,
      cadence: "2–3x Weekly",
      halfLife: "~15 Hours (L-Carnitine systemic clearance)",
      typicalProtocolDuration: "8 to 16 Weeks",
      washoutPeriod: "3 Weeks",
      titrationSteps: [
        { stage: "Initiation", timeframe: "Weeks 1–2", doseDisplay: "30 mg (0.25 mL)", doseMcg: 30000, cadence: "2x weekly", focus: "CPT-1 transport priming", notes: "25 units on U-100 syringe" },
        { stage: "Target Regimen", timeframe: "Weeks 3–8", doseDisplay: "60 mg (0.50 mL)", doseMcg: 60000, cadence: "3x weekly", focus: "Fatty acid beta-oxidation tracking", notes: "50 units on U-100 syringe" },
        { stage: "Peak Regimen", timeframe: "Weeks 9+", doseDisplay: "120 mg (1.00 mL)", doseMcg: 120000, cadence: "3x weekly", focus: "Maximal hepatic lipid clearance study", notes: "100 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Syringe (1.0 mL, 29G)",
      standardIUDisplay: "50.0 IU = 60 mg at 120.0 mg/mL",
      graduations: [
        { doseDisplay: "30 mg", doseMcg: 30000, volumeMl: 0.25, syringeIU: 25.0, tickLabel: "25 units" },
        { doseDisplay: "60 mg", doseMcg: 60000, volumeMl: 0.50, syringeIU: 50.0, tickLabel: "50 units" },
        { doseDisplay: "120 mg", doseMcg: 120000, volumeMl: 1.00, syringeIU: 100.0, tickLabel: "100 units" }
      ]
    }
  },

  "insulin-3ml": {
    category: "Metabolic Signaling & Incretins",
    catalogStatus: "in_catalog",
    disclaimer: STANDARD_DISCLAIMER,
    longDescription: "Recombinant Human Insulin (3 mL / 100 IU/mL Reference Standard) is a two-chain polypeptide hormone consisting of a 21-amino-acid A-chain and a 30-amino-acid B-chain linked by two interchain disulfide bonds. Engineered as an analytical standard for laboratory euglycemic hyperinsulinemic clamps, GLUT4 glucose transporter translocation assays, and insulin receptor tyrosine kinase phosphorylation benchmarking.",
    reconstitution: {
      defaultVialNetMg: 10.5,
      defaultDiluentMl: 3.0,
      resultingConcentrationMgPerMl: 3.5,
      solvent: "Pre-Dissolved Solution (Glycerol & Phenol Preserved)",
      dissolutionMethod: "Liquid formulation; store strictly refrigerated at 2°C–8°C."
    },
    dosing: {
      standardDoseDisplay: "2 IU – 10 IU (0.07 mg – 0.35 mg) per clamp or glucose challenge",
      standardDoseMcg: 350,
      cadence: "Acute Clamp or Pre-Perfusion Assay",
      halfLife: "~4 to 6 Minutes (Circulating plasma clearance)",
      typicalProtocolDuration: "Acute In Vitro / In Vivo Clamps",
      washoutPeriod: "12 Hours",
      titrationSteps: [
        { stage: "Basal Clamp", timeframe: "Clamp Phase 1", doseDisplay: "2 IU (70 mcg)", doseMcg: 70, cadence: "Acute", focus: "Hepatic glucose output suppression", notes: "2 units on U-100 syringe" },
        { stage: "Hyperinsulinemic Clamp", timeframe: "Clamp Phase 2", doseDisplay: "5 IU (175 mcg)", doseMcg: 175, cadence: "Acute", focus: "Skeletal muscle GLUT4 translocation", notes: "5 units on U-100 syringe" },
        { stage: "Maximal Stimulus", timeframe: "Clamp Phase 3", doseDisplay: "10 IU (350 mcg)", doseMcg: 350, cadence: "Acute", focus: "Peak whole-body glucose disposal rate", notes: "10 units on U-100 syringe" }
      ]
    },
    syringeGuide: {
      syringeType: "U-100 Insulin Syringe (0.3 mL, 31G)",
      standardIUDisplay: "10.0 IU = 10 IU Insulin at 100 IU/mL",
      graduations: [
        { doseDisplay: "70 mcg (2 IU)", doseMcg: 70, volumeMl: 0.02, syringeIU: 2.0, tickLabel: "2 units" },
        { doseDisplay: "175 mcg (5 IU)", doseMcg: 175, volumeMl: 0.05, syringeIU: 5.0, tickLabel: "5 units" },
        { doseDisplay: "350 mcg (10 IU)", doseMcg: 350, volumeMl: 0.10, syringeIU: 10.0, tickLabel: "10 units" }
      ]
    }
  }
};

// Apply enrichments
for (const [id, patch] of Object.entries(protocolEnrichments)) {
  const bpIdx = backendProtocols.findIndex((p) => p.id === id);
  if (bpIdx !== -1) {
    Object.assign(backendProtocols[bpIdx], patch);
  }
  const spIdx = storefrontProtocols.findIndex((p) => p.id === id);
  if (spIdx !== -1) {
    Object.assign(storefrontProtocols[spIdx], patch);
  }
}

fs.writeFileSync(backendPath, JSON.stringify(backendProtocols, null, 2), "utf8");
fs.writeFileSync(storefrontPath, JSON.stringify(storefrontProtocols, null, 2), "utf8");
console.log("Enriched all 22 protocols with complete metadata and GLP calibrations!");
