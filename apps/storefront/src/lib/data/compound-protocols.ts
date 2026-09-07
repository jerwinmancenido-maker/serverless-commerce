import {
  type CompoundAnalyticalProtocol,
  type TitrationStep,
  type SyringeGraduation,
  type BlendConstituent,
  ALL_COMPOUND_PROTOCOLS,
} from "./compound-protocols/index.ts"

export type {
  CompoundAnalyticalProtocol,
  TitrationStep,
  SyringeGraduation,
  BlendConstituent,
}

export * from "./compound-protocols/index.ts"

/**
 * Master catalog of analytical protocols (re-exporting unified 55+ compound registry)
 */
export const COMPOUND_ANALYTICAL_PROTOCOLS: CompoundAnalyticalProtocol[] = ALL_COMPOUND_PROTOCOLS

/**
 * Universal Fallback Protocol for any compound that does not have an explicit entry
 */
export const DEFAULT_FALLBACK_PROTOCOL: CompoundAnalyticalProtocol = {
  id: "generic-peptide",
  compoundName: "Research Compound",
  handles: [],
  subtitle: "Universal Analytical Reconstitution & Laboratory Handling Standard",
  longDescription:
    "This reference protocol establishes universal analytical handling, aseptic reconstitution, and stoichiometric dilution procedures for lyophilized research peptides. In laboratory research, solid lyophilized peptide cakes require gentle reconstitution with bacteriostatic water or compatible aqueous solvents without mechanical vortexing to preserve secondary and tertiary structural integrity.",
  category: "Tissue Repair & Healing",
  catalogStatus: "reference_only",
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
        notes: "2.0 units (0.02 mL) on U-100 syringe",
      },
      {
        stage: "Target Experimental Assay",
        timeframe: "Weeks 2–6",
        doseDisplay: "Standard Assay Dose",
        doseMcg: 250,
        cadence: "Standard Cadence",
        focus: "Primary pharmacodynamic evaluation",
        notes: "5.0 units (0.05 mL) on U-100 syringe",
      },
      {
        stage: "Washout & Matrix Observation",
        timeframe: "Weeks 7+",
        doseDisplay: "Observation Window",
        doseMcg: 0,
        cadence: "Zero dosing",
        focus: "Post-protocol kinetic clearance and persistent cellular response",
        notes: "System clearance evaluation",
      },
    ],
  },
  syringeGuide: {
    syringeType: "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
    standardIUDisplay: "5.0 units (0.05 mL)",
    graduations: [
      {
        doseDisplay: "100 mcg",
        doseMcg: 100,
        volumeMl: 0.02,
        syringeIU: 2.0,
        tickLabel: "2.0 units (0.02 mL) on U-100 syringe",
      },
      {
        doseDisplay: "250 mcg",
        doseMcg: 250,
        volumeMl: 0.05,
        syringeIU: 5.0,
        tickLabel: "5.0 units (0.05 mL) on U-100 syringe",
      },
      {
        doseDisplay: "500 mcg",
        doseMcg: 500,
        volumeMl: 0.1,
        syringeIU: 10.0,
        tickLabel: "10.0 units (0.10 mL) on U-100 syringe",
      },
    ],
  },
  storage: {
    lyophilized: "-20°C in dark desiccator (24 months)",
    reconstituted: "2°C–8°C refrigerated; use within 28 days",
    lightProtection: true,
  },
  citations: [
    {
      sourceReference: "USP General Chapter <797> / <800>",
      notes: "Standard sterile reconstitution and compounding standards for parenteral lyophilized peptides.",
    },
  ],
  disclaimer:
    "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human or veterinary administration.",
}

/**
 * Keyword-to-ID alias lookup table for high-precision resolution across customer inputs,
 * product handles, chemical synonyms, and trade names.
 */
const COMPOUND_ALIAS_MAP: Record<string, string> = {
  // Category 1: Tissue Repair
  bpc: "bpc-157",
  "bpc-157": "bpc-157",
  bpc157: "bpc-157",
  tb500: "tb-500",
  "tb-500": "tb-500",
  thymosin_beta: "tb-500",
  "thymosin-beta": "tb-500",
  "thymosin beta": "tb-500",
  ghk: "ghk-cu",
  "ghk-cu": "ghk-cu",
  ghkcu: "ghk-cu",
  copper_peptide: "ghk-cu",
  "copper peptide": "ghk-cu",
  ghk_basic: "ghk-basic",
  "ghk-basic": "ghk-basic",
  kpv: "kpv",
  ara290: "ara-290",
  "ara-290": "ara-290",
  cibinetide: "ara-290",
  pps: "pentosan-polysulfate",
  pentosan: "pentosan-polysulfate",
  elmiron: "pentosan-polysulfate",

  // Category 2: Metabolic Incretins
  sema: "semaglutide",
  semaglutide: "semaglutide",
  ozempic: "semaglutide",
  wegovy: "semaglutide",
  rybelsus: "semaglutide",
  tirz: "tirzepatide",
  tirzepatide: "tirzepatide",
  mounjaro: "tirzepatide",
  zepbound: "tirzepatide",
  reta: "retatrutide",
  retatrutide: "retatrutide",
  rtt60: "retatrutide",
  cagri: "cagrilintide",
  cagrilintide: "cagrilintide",
  mazdutide: "mazdutide",
  survodutide: "survodutide",
  aod: "aod-9604",
  "aod-9604": "aod-9604",
  aod9604: "aod-9604",
  "5-amino": "5-amino-1mq",
  "5-amino-1mq": "5-amino-1mq",
  amino1mq: "5-amino-1mq",
  tesofensine: "tesofensine",
  lira: "liraglutide",
  liraglutide: "liraglutide",
  victoza: "liraglutide",
  saxenda: "liraglutide",

  // Category 3: GH Axis
  hgh: "hgh-somatropin",
  somatropin: "hgh-somatropin",
  "hgh-somatropin": "hgh-somatropin",
  hgh24: "hgh-somatropin",
  "hgh-24iu": "hgh-somatropin",
  "hgh-15iu": "hgh-somatropin",
  ipam: "ipamorelin",
  ipamorelin: "ipamorelin",
  cjc: "cjc-1295-no-dac",
  "cjc-1295": "cjc-1295-no-dac",
  "cjc-1295-no-dac": "cjc-1295-no-dac",
  cjc1295: "cjc-1295-no-dac",
  "cjc-dac": "cjc-1295-with-dac",
  "cjc-1295-dac": "cjc-1295-with-dac",
  "cjc-1295-with-dac": "cjc-1295-with-dac",
  tesamorelin: "tesamorelin",
  egrifta: "tesamorelin",
  sermorelin: "sermorelin",
  geref: "sermorelin",
  ghrp2: "ghrp-2",
  "ghrp-2": "ghrp-2",
  pralmorelin: "ghrp-2",
  ghrp6: "ghrp-6",
  "ghrp-6": "ghrp-6",
  hexarelin: "hexarelin",
  mk677: "mk-677",
  "mk-677": "mk-677",
  ibutamoren: "mk-677",

  // Category 4: Longevity & Mitochondria
  mots: "mots-c",
  "mots-c": "mots-c",
  motsc: "mots-c",
  ss31: "ss-31",
  "ss-31": "ss-31",
  elamipretide: "ss-31",
  bendavia: "ss-31",
  epith: "epithalon",
  epithalon: "epithalon",
  epitalon: "epithalon",
  foxo: "foxo4-dri",
  "foxo4-dri": "foxo4-dri",
  foxo4: "foxo4-dri",
  humanin: "humanin",
  nad: "nad-plus",
  "nad+": "nad-plus",
  "nad-plus": "nad-plus",
  nadplus: "nad-plus",
  gluta: "glutathione",
  glutathione: "glutathione",

  // Category 5: Cognitive & Neuro
  semax: "semax",
  "na-semax": "na-semax-amidate",
  "na-semax-amidate": "na-semax-amidate",
  selank: "selank",
  "na-selank": "na-selank-amidate",
  "na-selank-amidate": "na-selank-amidate",
  cere: "cerebrolysin",
  cerebrolysin: "cerebrolysin",
  p21: "p21",
  noopept: "noopept",
  dihexa: "dihexa",
  dsip: "dsip",

  // Category 6: Immune & Sexual
  hmg: "hmg-75iu",
  menotropins: "hmg-75iu",
  menopur: "hmg-75iu",
  "hmg-75iu": "hmg-75iu",
  hmg75: "hmg-75iu",
  ll37: "ll-37",
  "ll-37": "ll-37",
  ta1: "thymosin-alpha-1",
  "thymosin-alpha-1": "thymosin-alpha-1",
  "thymosin alpha": "thymosin-alpha-1",
  zadaxin: "thymosin-alpha-1",
  mt1: "melanotan-1",
  "melanotan-1": "melanotan-1",
  afamelanotide: "melanotan-1",
  scenesse: "melanotan-1",
  mt2: "melanotan-2",
  "melanotan-2": "melanotan-2",
  melanotan: "melanotan-2",
  pt141: "pt-141",
  "pt-141": "pt-141",
  bremelanotide: "pt-141",
  vyleesi: "pt-141",
  kiss: "kisspeptin-10",
  kisspeptin: "kisspeptin-10",
  "kisspeptin-10": "kisspeptin-10",
  oxytocin: "oxytocin",
  pitocin: "oxytocin",

  // Category 7: Blends & Bundles
  glow: "glow-blend",
  "glow-blend": "glow-blend",
  glow70: "glow-blend",
  klow: "klow-blend",
  "klow-blend": "klow-blend",
  klow80: "klow-blend",
  wolverine: "wolverine-blend",
  "wolverine-blend": "wolverine-blend",
  "wolverine-bundle": "wolverine-blend",
  "tri-heal": "tri-heal-blend",
  "tri-heal-matrix": "tri-heal-blend",
  triheal: "tri-heal-blend",
  "cjc-ipam": "cjc-ipam-blend",
  "cjc-1295-ipamorelin": "cjc-ipam-blend",
  "cjc-1295-ipamorelin-blend": "cjc-ipam-blend",
  "cjc-ipam-blend": "cjc-ipam-blend",
  "neuro-sync": "neuro-sync-blend",
  "neuro-sync-stack": "neuro-sync-blend",
  "selank-semax-combo": "neuro-sync-blend",
  "ghk-cu-glutathione-bundle": "glow-blend",
  "epithalon-glutathione-bundle": "epithalon",
  "epithalon-glutathione-nad-bundle": "epithalon",
  "nad-ghk-cu-bundle": "nad-plus",
  "ghk-cu-anti-aging-serum": "ghk-cu",

  // Category 8: Laboratory Supplies & Accessories
  "bacteriostatic-water": "bacteriostatic-water",
  "bac-water": "bacteriostatic-water",
  "bac-water-10ml": "bacteriostatic-water",
  "bacwater": "bacteriostatic-water",
  "peptide-reconstitution-set": "peptide-reconstitution-set",
  "reconstitution-set": "peptide-reconstitution-set",
  "reusable-metal-insulin-pen": "reusable-metal-insulin-pen",
  "insulin-pen": "reusable-metal-insulin-pen",
  "metal-insulin-pen": "reusable-metal-insulin-pen",
  "50-slot-vial-organizer-box": "50-slot-vial-organizer-box",
  "vial-organizer-box-50": "50-slot-vial-organizer-box",
  "50-slot-vial-box": "50-slot-vial-organizer-box",
  "custom-mixed-vial-organizer-box": "custom-mixed-vial-organizer-box",
  "custom-mixed-vial-box": "custom-mixed-vial-organizer-box",
  "mixed-vial-box": "custom-mixed-vial-organizer-box",
  "clear-nasal-spray-bottles": "clear-nasal-spray-bottles",
  "nasal-spray-bottles": "clear-nasal-spray-bottles",
}

/**
 * Normalizes product handles by stripping common packaging and dosage suffixes
 * (-vial, -5mg, -10mg, etc.) for resilient fallback matching.
 */
export function normalizeProductHandle(handle: string): string {
  if (!handle) return ""
  let normalized = handle.toLowerCase().trim()
  let prev = ""
  while (prev !== normalized) {
    prev = normalized
    normalized = normalized
      .replace(/-(?:vial|organizer|box|set|kit|combo|pack|anti-aging-serum|somatropin)$/i, "")
      .replace(/-(?:500mcg|100mcg|250mcg|\d+(?:\.\d+)?(?:mg|iu|ml|cc))$/i, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }
  return normalized
}

/**
 * Resolve compound protocol by handle, title, or substring across all 55+ compounds and blends.
 * Exact ID, exact handle, and exact alias matches take strict precedence before substring heuristics.
 */
export function getCompoundProtocol(handleOrTitle?: string | null): CompoundAnalyticalProtocol {
  if (!handleOrTitle) return DEFAULT_FALLBACK_PROTOCOL

  const query = handleOrTitle.toLowerCase().trim()

  // 1. Direct ID match
  const exactIdMatch = ALL_COMPOUND_PROTOCOLS.find(
    (p) => p.id.toLowerCase() === query
  )
  if (exactIdMatch) return exactIdMatch

  // 2. Direct Handle match
  const exactHandleMatch = ALL_COMPOUND_PROTOCOLS.find((p) =>
    p.handles.some((h) => h.toLowerCase() === query)
  )
  if (exactHandleMatch) return exactHandleMatch

  // 3. Exact Alias map lookup
  if (COMPOUND_ALIAS_MAP[query]) {
    const match = ALL_COMPOUND_PROTOCOLS.find((p) => p.id === COMPOUND_ALIAS_MAP[query])
    if (match) return match
  }

  // 4. Exact compoundName match (ignoring parenthetical packaging like "(10mg Vial)")
  const cleanQuery = query.replace(/\(.*?\)/g, "").trim()
  const exactNameMatch = ALL_COMPOUND_PROTOCOLS.find((p) => {
    const cleanName = p.compoundName.toLowerCase().replace(/\(.*?\)/g, "").trim()
    return cleanName === cleanQuery || p.compoundName.toLowerCase() === query
  })
  if (exactNameMatch) return exactNameMatch

  // 5. Normalized exact matches (ID, Handle, Alias, Name)
  const normalizedQuery = normalizeProductHandle(query)
  if (normalizedQuery && normalizedQuery !== query) {
    const normIdMatch = ALL_COMPOUND_PROTOCOLS.find(
      (p) => p.id.toLowerCase() === normalizedQuery
    )
    if (normIdMatch) return normIdMatch

    const normHandleMatch = ALL_COMPOUND_PROTOCOLS.find((p) =>
      p.handles.some((h) => h.toLowerCase() === normalizedQuery)
    )
    if (normHandleMatch) return normHandleMatch

    if (COMPOUND_ALIAS_MAP[normalizedQuery]) {
      const match = ALL_COMPOUND_PROTOCOLS.find((p) => p.id === COMPOUND_ALIAS_MAP[normalizedQuery])
      if (match) return match
    }

    const normNameMatch = ALL_COMPOUND_PROTOCOLS.find((p) => {
      const cleanName = p.compoundName.toLowerCase().replace(/\(.*?\)/g, "").trim()
      return cleanName === normalizedQuery
    })
    if (normNameMatch) return normNameMatch
  }

  // 6. Substring in handles
  const handleSubstringMatch = ALL_COMPOUND_PROTOCOLS.find((p) =>
    p.handles.some((h) => query.includes(h.toLowerCase()) || h.toLowerCase().includes(query))
  )
  if (handleSubstringMatch) return handleSubstringMatch

  // 7. Substring in alias map
  for (const [alias, protocolId] of Object.entries(COMPOUND_ALIAS_MAP)) {
    if (query === alias || query.includes(alias) || alias.includes(query)) {
      const match = ALL_COMPOUND_PROTOCOLS.find((p) => p.id === protocolId)
      if (match) return match
    }
  }

  // 8. Substring in compoundName
  const nameSubstringMatch = ALL_COMPOUND_PROTOCOLS.find(
    (p) =>
      p.compoundName.toLowerCase().includes(query) ||
      query.includes(p.compoundName.toLowerCase())
  )
  if (nameSubstringMatch) return nameSubstringMatch

  // 9. Fallback generic protocol with user-provided compoundName
  return {
    ...DEFAULT_FALLBACK_PROTOCOL,
    compoundName: handleOrTitle,
  }
}
