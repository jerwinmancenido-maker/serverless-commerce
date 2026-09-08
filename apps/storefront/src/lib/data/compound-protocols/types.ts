export type TitrationStep = {
  stage: string              // e.g., "Phase 1: Initial Tolerance Titration"
  timeframe: string          // e.g., "Weeks 1–2" or "Days 1–5"
  doseDisplay: string        // e.g., "250 mcg daily" or "2.5 mg weekly"
  doseMcg: number            // Micrograms of primary compound (or total blend mass)
  cadence: string            // e.g., "1x Daily (SubQ)" or "1x Every 7 Days"
  focus: string              // Pharmacological target (receptor desensitization prevention, tissue saturation)
  notes?: string             // Syringe volume / tick guidance
}

export type SyringeGraduation = {
  doseDisplay: string        // e.g., "250 mcg (Standard Target)"
  doseMcg: number            
  volumeMl: number           // e.g., 0.05
  syringeIU: number          // e.g., 5.0
  tickLabel: string          // e.g., "5.0 units (0.05 mL) on U-100 syringe"
}

export type BlendConstituent = {
  name: string               // e.g., "GHK-Cu"
  ratioMg: number            // e.g., 50
  percentageOfTotal: number  // e.g., 62.5
}

// Delivery route classification for calculator mode selection
export type DeliveryRoute = "subq" | "nasal" | "oral" | "topical"

// Nasal atomizer calibration data
export type NasalGuide = {
  pumpVolumeMl: number        // Fixed metered pump output per spray, e.g., 0.10
  recommendedDiluentMlOptions: number[] // e.g., [3.0, 5.0, 10.0]
  defaultDiluentMl: number    // e.g., 5.0
  deviceLabel: string         // e.g., "Amber nasal spray bottle (10 mL)"
  notes?: string
}

// Oral solution calibration data
export type OralGuide = {
  defaultSuspensionMl: number // e.g., 30.0
  deviceLabel: string         // e.g., "Calibrated oral dropper (1 mL marks)"
  notes?: string
}

// Laboratory supplies & hardware handling guide
export type SupplyProtocolStep = {
  stepNumber: number
  title: string
  instruction: string
}

export type SupplyFeature = {
  title: string
  desc: string
}

export type SupplyGuide = {
  isHardware?: boolean
  physicalState: string       // e.g. "Aqueous Sterile Diluent Solution", "Aviation-Grade Precision Labware"
  sterilityStandard: string   // e.g. "0.22 µm Membrane Filtered · Non-Pyrogenic", "ETO Sterilized"
  material: string            // e.g. "Type I USP Borosilicate Glass Vial", "High-Density Cryo Polymer"
  specs: Record<string, string>
  protocolSteps: SupplyProtocolStep[]
  features: SupplyFeature[]
  inclusions?: [string, string][]
}

export type BundleVial = {
  compoundName: string
  vialNetMass: string
  diluentMl: number
  concMgMl: number
  solvent?: string
  reconstitutionInstructions?: string
  targetDose: string
  cadence?: string
  syringeUnits: string
}

export type CompoundAnalyticalProtocol = {
  id: string                 // e.g., "bpc-157", "retatrutide", "klow-blend"
  compoundName: string       // Full display name e.g., "BPC-157 (10mg Vial)"
  handles: string[]          // URL route slugs e.g., ["bpc-157", "bpc157", "bpc-157-vial"]
  subtitle: string           // Scientific classification and physiological summary
  longDescription?: string   // Comprehensive publication-grade scientific narrative: mechanism of action, receptor binding, pathways
  investigatedBenefits?: string[] // Key researched endpoints and observed mechanisms
  adverseObservations?: string[]  // Practical adverse observations, safety notes, and sensitivities
  category: 
    | "Tissue Repair & Healing"
    | "Skin, Hair & Cellular Matrix"
    | "Metabolic Signaling & Incretins"
    | "Growth Hormone Axis"
    | "Mitochondrial & Cellular Longevity"
    | "Cognitive & Neuroprotective"
    | "Antimicrobial & Immune"
    | "Photoprotection & Sexual Health"
    | "Multi-Peptide Blends"
    | "Laboratory Supplies"
  catalogStatus: "in_catalog" | "reference_only"
  storeProductHandle?: string // Defined only if catalogStatus === "in_catalog"
  purityStandard?: string
  evidenceTier?: string
  isBlend?: boolean
  protocolCategoryType?: "single_peptide" | "blend" | "bundle" | "topical"
  bundleVials?: BundleVial[]
  blendConstituents?: BlendConstituent[]
  reconstitutionOptions?: Record<
    string,
    {
      label: string
      diluentMl: number
      concMgMl: number
      badge?: string
      tickConversion?: string
    }
  >
  vialStrengthOptions?: Array<{
    vialMg: number
    diluentMl: number
    concMgMl: number
    badge: string
    isStandard?: boolean
  }>
  // Optional: specifies which routes are clinically applicable for this compound.
  // When absent or undefined, defaults to ["subq"] (standard injectable).
  deliveryRoutes?: DeliveryRoute[]
  // Optional: nasal atomizer calibration data — required when "nasal" is in deliveryRoutes
  nasalGuide?: NasalGuide
  // Optional: oral solution calibration — required when "oral" is in deliveryRoutes
  oralGuide?: OralGuide
  // Optional: laboratory supplies handling guide
  isSupply?: boolean
  supplyGuide?: SupplyGuide
  reconstitution: {
    defaultVialNetMg: number // Total vial dry mass
    defaultDiluentMl: number // Recommended diluent volume
    solvent: string          // "Bacteriostatic Water USP (0.9% Benzyl Alcohol)" or "0.6% Acetic Acid"
    dissolutionMethod: string// Step-by-step needle angle, vacuum draw, rolling instructions
    resultingConcentrationMgPerMl: number // Exactly: defaultVialNetMg / defaultDiluentMl
    handlingRule: string     // Visual inspection, light sensitivity, and particulate warnings
  }
  dosing: {
    standardDoseDisplay: string
    standardDoseMcg: number
    cadence: string
    halfLife: string
    typicalProtocolDuration: string
    washoutPeriod: string
    titrationSteps: TitrationStep[] // Minimum 3 stages
  }
  syringeGuide: {
    syringeType: string      // "Standard U-100 Insulin Syringe (100 units = 1.0 mL)"
    standardIUDisplay: string// e.g., "5.0 units (0.05 mL)"
    graduations: SyringeGraduation[] // Minimum 3 graduations
  }
  storage: {
    lyophilized: string      // Storage condition for dry powder
    reconstituted: string    // Storage condition and expiration for aqueous solution
    lightProtection: boolean
  }
  molecularDetails?: {
    casNumber?: string
    formula?: string
    molarMass?: string
    pubchemCid?: number
    sequenceOrFormula?: string
    molecularWeightGPerMol?: number
  }
  citations: {
    sourceReference: string  // PubMed PMID or primary literature citation
    notes: string
  }[]
  calculator?: {
    enabled?: boolean
    title?: string
    defaultCompoundMass?: string
    compoundMassUnit?: "mcg" | "mg" | "g" | "IU"
    defaultFinalVolumeMl?: string
    defaultTargetAmount?: string
    targetAmountUnit?: "mcg" | "mg" | "IU"
    iuPerMg?: number
    deviceVolumeMl?: string
    deviceLabel?: string
    roundingPrecision?: number
    instructions?: string
  }
  disclaimer: string
}
