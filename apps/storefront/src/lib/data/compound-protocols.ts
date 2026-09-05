export type TitrationStep = {
  stage: string
  timeframe: string
  doseDisplay: string
  doseMcg: number
  cadence: string
  focus: string
  notes?: string
}

export type SyringeGraduation = {
  doseDisplay: string
  doseMcg: number
  volumeMl: number
  syringeIU: number
  tickLabel: string
}

export type CompoundAnalyticalProtocol = {
  id: string
  compoundName: string
  handles: string[]
  subtitle: string
  category: string
  purityStandard: string
  reconstitution: {
    defaultVialNetMg: number
    defaultDiluentMl: number
    solvent: string
    dissolutionMethod: string
    resultingConcentrationMgPerMl: number
    handlingRule: string
  }
  dosing: {
    standardDoseDisplay: string
    standardDoseMcg: number
    cadence: string
    halfLife: string
    typicalProtocolDuration: string
    washoutPeriod: string
    titrationSteps: TitrationStep[]
  }
  syringeGuide: {
    syringeType: string
    standardIUDisplay: string
    graduations: SyringeGraduation[]
  }
  storage: {
    lyophilized: string
    reconstituted: string
    lightProtection: boolean
  }
  disclaimer: string
}

export const COMPOUND_ANALYTICAL_PROTOCOLS: CompoundAnalyticalProtocol[] = [
  {
    id: "bpc-157",
    compoundName: "BPC-157",
    handles: ["bpc-157-vial", "bpc-157", "bpc157"],
    subtitle: "Gastric Pentadecapeptide Laboratory Protocol & In-Vitro Dosing Standard",
    category: "Angiogenic Signaling & Tissue Remodeling",
    purityStandard: "≥99.2% (HPLC Analytical Release Standard)",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      solvent: "Bacteriostatic Water USP (0.9% Benzyl Alcohol preserved water)",
      dissolutionMethod:
        "Direct needle against the inner glass vial wall. Allow vacuum to draw diluent smoothly without rapid bubbling. Swirl gently in a horizontal circular motion; avoid vigorous shaking or vortexing to prevent peptide chain shearing.",
      resultingConcentrationMgPerMl: 5.0, // 10mg / 2mL = 5mg/mL (5,000 mcg/mL)
      handlingRule: "Clear, colorless aqueous solution once dissolved.",
    },
    dosing: {
      standardDoseDisplay: "250 mcg – 500 mcg daily",
      standardDoseMcg: 250,
      cadence: "Once daily (or 250 mcg BID / twice daily in acute trauma models)",
      halfLife: "~4–6 Hours (Aqueous Buffer / Plasma)",
      typicalProtocolDuration: "4 to 6 Weeks per analytical trial cycle",
      washoutPeriod: "2 to 4 Weeks between experimental evaluations",
      titrationSteps: [
        {
          stage: "Initial Analytical Calibration",
          timeframe: "Days 1–7",
          doseDisplay: "250 mcg daily",
          doseMcg: 250,
          cadence: "1x Daily (Morning)",
          focus: "Baseline tissue tolerance & receptor saturation assessment",
          notes: "Corresponds to 5.0 IU on standard U-100 syringe (at 5 mg/mL concentration)",
        },
        {
          stage: "Standard Regeneration Window",
          timeframe: "Weeks 2–5",
          doseDisplay: "250 mcg – 500 mcg daily",
          doseMcg: 500,
          cadence: "1x Daily or 250 mcg BID (Twice Daily)",
          focus: "Peak microvascular angiogenesis & collagen fibril deposition assays",
          notes: "Split cadence (AM/PM) maintains continuous steady-state plasma levels",
        },
        {
          stage: "Washout & Matrix Remodeling",
          timeframe: "Week 6+",
          doseDisplay: "Observation Period",
          doseMcg: 0,
          cadence: "Zero dosing",
          focus: "Evaluation of sustained extracellular matrix stabilization",
          notes: "2–4 week cessation to observe persistent cellular healing dynamics",
        },
      ],
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL; 1 unit = 0.01 mL)",
      standardIUDisplay: "5.0 IU (5 Ticks)",
      graduations: [
        {
          doseDisplay: "100 mcg",
          doseMcg: 100,
          volumeMl: 0.02,
          syringeIU: 2.0,
          tickLabel: "2 units (0.02 mL)",
        },
        {
          doseDisplay: "200 mcg",
          doseMcg: 200,
          volumeMl: 0.04,
          syringeIU: 4.0,
          tickLabel: "4 units (0.04 mL)",
        },
        {
          doseDisplay: "250 mcg (Standard)",
          doseMcg: 250,
          volumeMl: 0.05,
          syringeIU: 5.0,
          tickLabel: "5 units (0.05 mL) — Standard Target",
        },
        {
          doseDisplay: "500 mcg (Intensive)",
          doseMcg: 500,
          volumeMl: 0.10,
          syringeIU: 10.0,
          tickLabel: "10 units (0.10 mL) — Double Target",
        },
      ],
    },
    storage: {
      lyophilized: "-20°C in dry desiccated container (shelf-life: 24 months)",
      reconstituted: "2°C–8°C refrigerated; use within 28 days for maximum stability",
      lightProtection: true,
    },
    disclaimer:
      "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
  },
  {
    id: "tirzepatide",
    compoundName: "Tirzepatide",
    handles: ["tirzepatide", "tirzepatide-vial", "tirzepatide-laboratory-handling"],
    subtitle: "Dual GLP-1 / GIP Incretin Co-Agonist Laboratory Titration & Handling Standard",
    category: "Dual Incretin Receptor Co-Agonism & Metabolic Regulation",
    purityStandard: "≥99.3% (HPLC Verified Lot Standard)",
    reconstitution: {
      defaultVialNetMg: 10,
      defaultDiluentMl: 2.0,
      solvent: "Bacteriostatic Water USP (0.9% Benzyl Alcohol preserved water)",
      dissolutionMethod:
        "Inject diluent slowly down the glass barrel wall. The lyophilized cake will spontaneously wet and dissolve within 60–120 seconds. Swirl gently. Never agitate or centrifuge.",
      resultingConcentrationMgPerMl: 5.0, // 10mg / 2mL = 5mg/mL (5,000 mcg/mL)
      handlingRule: "Visually inspect: solution must be clear, colorless, and free of visible particulates.",
    },
    dosing: {
      standardDoseDisplay: "2.5 mg weekly initial titration",
      standardDoseMcg: 2500,
      cadence: "Once every 7 days (Weekly interval)",
      halfLife: "~120 Hours (~5 Days terminal half-life)",
      typicalProtocolDuration: "8 to 16 Weeks progressive escalation protocol",
      washoutPeriod: "4 to 6 Weeks between trial series",
      titrationSteps: [
        {
          stage: "Titration Initiation (Phase 1)",
          timeframe: "Weeks 1–4",
          doseDisplay: "2.5 mg weekly",
          doseMcg: 2500,
          cadence: "1x Every 7 Days",
          focus: "Receptor acclimatization, GIP lipid buffering, and gastrointestinal tolerance",
          notes: "0.5 mL (50 IU) on U-100 syringe from 10 mg / 2 mL solution",
        },
        {
          stage: "Primary Response Escalation (Phase 2)",
          timeframe: "Weeks 5–8",
          doseDisplay: "5.0 mg weekly",
          doseMcg: 5000,
          cadence: "1x Every 7 Days",
          focus: "Significant adipose thermogenesis & uncoupling protein-1 (UCP-1) stimulation",
          notes: "1.0 mL (100 IU) from 10mg/2mL, or use 20mg vial with 2mL diluent (0.5 mL = 50 IU)",
        },
        {
          stage: "Advanced Metabolic Assays (Phase 3)",
          timeframe: "Weeks 9–12",
          doseDisplay: "7.5 mg weekly",
          doseMcg: 7500,
          cadence: "1x Every 7 Days",
          focus: "Maximum incretin co-agonism and sustained insulinotropic signaling",
          notes: "Requires higher concentration vial (15mg or 20mg) to maintain low injection volumes",
        },
        {
          stage: "Peak Experimental Threshold (Phase 4)",
          timeframe: "Weeks 13+",
          doseDisplay: "10.0 mg – 15.0 mg weekly",
          doseMcg: 10000,
          cadence: "1x Every 7 Days",
          focus: "Ceiling efficacy assays in intensive metabolic research models",
          notes: "Maximum protocol dose ceiling; monitor fluid balance and satiety markers",
        },
      ],
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      standardIUDisplay: "50.0 IU (0.50 mL)",
      graduations: [
        {
          doseDisplay: "2.5 mg (Weeks 1–4)",
          doseMcg: 2500,
          volumeMl: 0.50,
          syringeIU: 50.0,
          tickLabel: "50 units (0.50 mL) — Phase 1 Starting Dose",
        },
        {
          doseDisplay: "5.0 mg (Weeks 5–8)",
          doseMcg: 5000,
          volumeMl: 1.00,
          syringeIU: 100.0,
          tickLabel: "100 units (1.00 mL) — Phase 2 Escalation",
        },
      ],
    },
    storage: {
      lyophilized: "-20°C deep freeze protected from light (24 months)",
      reconstituted: "2°C–8°C refrigerated; use within 28 days for integrity",
      lightProtection: true,
    },
    disclaimer:
      "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
  },
  {
    id: "ghk-cu",
    compoundName: "GHK-Cu (50mg)",
    handles: ["phase8-ghk-cu-acceptance-1788073261417", "phase-8-ghk-cu-50-mg-subq-set", "ghk-cu"],
    subtitle: "Copper Tripeptide Transcriptional Modulator & Matrix Reconstitution Standard",
    category: "Extracellular Matrix Rejuvenation & Gene Regulation",
    purityStandard: "≥99.0% (Certified Copper Tripeptide Complex)",
    reconstitution: {
      defaultVialNetMg: 50,
      defaultDiluentMl: 2.5,
      solvent: "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
      dissolutionMethod:
        "Add 2.5 mL Bacteriostatic Water slowly. Solution immediately turns characteristic deep royal blue. Swirl gently for 30 seconds. Do not sonicate or vortex.",
      resultingConcentrationMgPerMl: 20.0, // 50mg / 2.5mL = 20mg/mL
      handlingRule: "Clear royal blue solution. Precipitation indicates pH imbalance or copper dissociation.",
    },
    dosing: {
      standardDoseDisplay: "1.0 mg – 2.0 mg daily",
      standardDoseMcg: 1000,
      cadence: "Once daily (or cyclical 30-day research blocks)",
      halfLife: "~1 Hour in plasma; extended cellular retention in extracellular matrix",
      typicalProtocolDuration: "30 to 60 Days continuous trial series",
      washoutPeriod: "30 Days between cycles to allow copper clearance",
      titrationSteps: [
        {
          stage: "Micro-Dose Initiation",
          timeframe: "Days 1–7",
          doseDisplay: "1.0 mg daily",
          doseMcg: 1000,
          cadence: "1x Daily",
          focus: "Fibroblast collagen stimulation & superoxide dismutase (SOD1) induction",
          notes: "0.05 mL (5.0 IU on U-100 syringe at 20 mg/mL concentration)",
        },
        {
          stage: "Full Regenerative Block",
          timeframe: "Days 8–30",
          doseDisplay: "2.0 mg daily",
          doseMcg: 2000,
          cadence: "1x Daily",
          focus: "Peak decorin expression and parallel Type I/III collagen bundle synthesis",
          notes: "0.10 mL (10.0 IU on U-100 syringe)",
        },
        {
          stage: "Copper Homeostasis Washout",
          timeframe: "Days 31–60",
          doseDisplay: "Cycle Washout",
          doseMcg: 0,
          cadence: "Zero dosing",
          focus: "Cellular equilibrium and copper clearance observation",
          notes: "30-day rest period prevents copper accumulation in hepatic assays",
        },
      ],
    },
    syringeGuide: {
      syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
      standardIUDisplay: "5.0 IU (0.05 mL)",
      graduations: [
        {
          doseDisplay: "1.0 mg (Standard)",
          doseMcg: 1000,
          volumeMl: 0.05,
          syringeIU: 5.0,
          tickLabel: "5 units (0.05 mL) — Standard Target",
        },
        {
          doseDisplay: "2.0 mg (High Output)",
          doseMcg: 2000,
          volumeMl: 0.10,
          syringeIU: 10.0,
          tickLabel: "10 units (0.10 mL) — High Output Target",
        },
      ],
    },
    storage: {
      lyophilized: "-20°C in dark dessicator (up to 24 months)",
      reconstituted: "2°C–8°C; use within 28 days. Keep strictly shielded from direct light",
      lightProtection: true,
    },
    disclaimer:
      "Synthesized strictly for in-vitro laboratory research, analytical calibration, and preclinical scientific investigation. Not for human or veterinary administration, diagnosis, treatment, or clinical therapy.",
  },
]

/**
 * Universal Fallback Protocol for any compound that does not have an explicit entry
 */
const DEFAULT_FALLBACK_PROTOCOL: CompoundAnalyticalProtocol = {
  id: "generic-peptide",
  compoundName: "Research Compound",
  handles: [],
  subtitle: "Universal Analytical Reconstitution & Laboratory Handling Standard",
  category: "Preclinical Synthetic Peptide Standard",
  purityStandard: "≥99.0% (Analytical HPLC Standard)",
  reconstitution: {
    defaultVialNetMg: 10,
    defaultDiluentMl: 2.0,
    solvent: "Bacteriostatic Water USP (0.9% Benzyl Alcohol preserved water)",
    dissolutionMethod:
      "Direct needle against vial wall. Introduce solvent slowly without agitation. Allow powder to dissolve completely with gentle horizontal swirling.",
    resultingConcentrationMgPerMl: 5.0,
    handlingRule: "Inspect for clear, uniform dissolution prior to trial initiation.",
  },
  dosing: {
    standardDoseDisplay: "Analytical Research Window",
    standardDoseMcg: 250,
    cadence: "Protocol-specific cadence based on study design",
    halfLife: "Refer to compound literature monograph",
    typicalProtocolDuration: "4 to 8 Weeks",
    washoutPeriod: "2 to 4 Weeks",
    titrationSteps: [
      {
        stage: "Initial Analytical Calibration",
        timeframe: "Week 1",
        doseDisplay: "Minimum Effective Assay Dose",
        doseMcg: 100,
        cadence: "Daily or Intermittent",
        focus: "Receptor binding and system equilibration",
      },
      {
        stage: "Target Experimental Assay",
        timeframe: "Weeks 2–6",
        doseDisplay: "Standard Assay Dose",
        doseMcg: 250,
        cadence: "Standard Cadence",
        focus: "Primary pharmacodynamic evaluation",
      },
    ],
  },
  syringeGuide: {
    syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
    standardIUDisplay: "5.0 IU (at 5 mg/mL)",
    graduations: [
      {
        doseDisplay: "250 mcg",
        doseMcg: 250,
        volumeMl: 0.05,
        syringeIU: 5.0,
        tickLabel: "5 units (0.05 mL)",
      },
    ],
  },
  storage: {
    lyophilized: "-20°C in dark desiccator (24 months)",
    reconstituted: "2°C–8°C refrigerated; use within 28 days",
    lightProtection: true,
  },
  disclaimer:
    "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human or veterinary administration.",
}

/**
 * Resolve compound protocol by handle, title, or substring
 */
export function getCompoundProtocol(handleOrTitle?: string | null): CompoundAnalyticalProtocol {
  if (!handleOrTitle) return DEFAULT_FALLBACK_PROTOCOL

  const query = handleOrTitle.toLowerCase().trim()

  const match = COMPOUND_ANALYTICAL_PROTOCOLS.find(
    (p) =>
      p.id === query ||
      p.handles.some((h) => query.includes(h.toLowerCase()) || h.toLowerCase().includes(query)) ||
      p.compoundName.toLowerCase().includes(query) ||
      query.includes(p.compoundName.toLowerCase())
  )

  if (match) return match

  // Fallback keyword checks
  if (query.includes("bpc") || query.includes("157")) {
    return COMPOUND_ANALYTICAL_PROTOCOLS.find((p) => p.id === "bpc-157")!
  }
  if (query.includes("tirz") || query.includes("mounj") || query.includes("zep")) {
    return COMPOUND_ANALYTICAL_PROTOCOLS.find((p) => p.id === "tirzepatide")!
  }
  if (query.includes("ghk") || query.includes("copper")) {
    return COMPOUND_ANALYTICAL_PROTOCOLS.find((p) => p.id === "ghk-cu")!
  }

  return {
    ...DEFAULT_FALLBACK_PROTOCOL,
    compoundName: handleOrTitle,
  }
}
