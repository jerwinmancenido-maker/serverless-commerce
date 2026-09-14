/**
 * @file    apps/storefront/src/lib/data/clinical-trials-registry.ts
 * @module  ClinicalTrialsRegistry
 * @purpose Centralized peer-reviewed clinical trial escalation tiers, titration matrices, and dosage benchmarks.
 * @contracts
 *   Consumer: DosageCalibrationDrawer (@modules/research-protocols/components/dosage-calibration-drawer)
 */

export interface ClinicalTitrationRow {
  phase: string
  doseMg: number
  doseDisplay: string
  cadence: string
  notes?: string
}

export interface ClinicalTitrationMatrix {
  hasPhase2: boolean
  hasPhase3: boolean
  phase2: ClinicalTitrationRow[]
  phase3: ClinicalTitrationRow[]
  standard: ClinicalTitrationRow[]
}

export const RETATRUTIDE_PHASE2_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 4",
    doseMg: 2,
    doseDisplay: "2 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Lower starting arm for optimized gastrointestinal tolerability",
  },
  {
    phase: "Weeks 5 to 8",
    doseMg: 4,
    doseDisplay: "4 mg",
    cadence: "Once weekly (Q7D)",
    notes: "First titration milestone; sustained GLP-1/GIP receptor saturation",
  },
  {
    phase: "Weeks 9 to 12",
    doseMg: 8,
    doseDisplay: "8 mg",
    cadence: "Once weekly (Q7D)",
    notes: "High target cohort arm; glucagon receptor-mediated lipolysis engages",
  },
  {
    phase: "Weeks 13+",
    doseMg: 12,
    doseDisplay: "12 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Max trial maintenance cohort; 24.2% mean body weight reduction endpoint",
  },
]

export const RETATRUTIDE_PHASE3_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 4",
    doseMg: 2,
    doseDisplay: "2 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Initial starting dose across all Phase 3 TRIUMPH cohorts",
  },
  {
    phase: "Weeks 5 to 8",
    doseMg: 4,
    doseDisplay: "4 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Four-week step escalation threshold",
  },
  {
    phase: "Weeks 9 to 12",
    doseMg: 6,
    doseDisplay: "6 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Phase 3 intermediate titration tier (smooth plasma level rise)",
  },
  {
    phase: "Weeks 13 to 16",
    doseMg: 9,
    doseDisplay: "9 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Target maintenance arm A",
  },
  {
    phase: "Weeks 17+",
    doseMg: 12,
    doseDisplay: "12 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Maximum target maintenance arm B",
  },
]

export const TIRZEPATIDE_SURPASS_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 4",
    doseMg: 2.5,
    doseDisplay: "2.5 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Initial initiation dose (SURMOUNT/SURPASS); not intended for glycemic control",
  },
  {
    phase: "Weeks 5 to 8",
    doseMg: 5.0,
    doseDisplay: "5.0 mg",
    cadence: "Once weekly (Q7D)",
    notes: "First therapeutic maintenance target",
  },
  {
    phase: "Weeks 9 to 12",
    doseMg: 7.5,
    doseDisplay: "7.5 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Optional escalation step if additional glycemic/weight response required",
  },
  {
    phase: "Weeks 13 to 16",
    doseMg: 10.0,
    doseDisplay: "10.0 mg",
    cadence: "Once weekly (Q7D)",
    notes: "High therapeutic maintenance dose",
  },
  {
    phase: "Weeks 17+",
    doseMg: 15.0,
    doseDisplay: "15.0 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Maximum clinical trial cohort dose; 22.5% body weight reduction in SURMOUNT-1",
  },
]

export const SEMAGLUTIDE_STEP_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 4",
    doseMg: 0.25,
    doseDisplay: "0.25 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Gastrointestinal adaptation dose; minimizes nausea and emesis",
  },
  {
    phase: "Weeks 5 to 8",
    doseMg: 0.50,
    doseDisplay: "0.50 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Initial glycemic regulation tier",
  },
  {
    phase: "Weeks 9 to 12",
    doseMg: 1.0,
    doseDisplay: "1.0 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Standard type 2 diabetes maintenance dose",
  },
  {
    phase: "Weeks 13 to 16",
    doseMg: 1.7,
    doseDisplay: "1.7 mg",
    cadence: "Once weekly (Q7D)",
    notes: "STEP obesity escalation tier",
  },
  {
    phase: "Weeks 17+",
    doseMg: 2.4,
    doseDisplay: "2.4 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Maximum STEP maintenance dose; central appetite suppression saturation",
  },
]

export const CAGRISEMA_REDEFINE_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 4",
    doseMg: 0.5,
    doseDisplay: "0.5 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Phase 3 REDEFINE initiation tier (0.25mg Cagri / 0.25mg Sema)",
  },
  {
    phase: "Weeks 5 to 8",
    doseMg: 1.0,
    doseDisplay: "1.0 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Second escalation tier; robust appetite suppression (0.5mg / 0.5mg)",
  },
  {
    phase: "Weeks 9 to 12",
    doseMg: 1.7,
    doseDisplay: "1.7 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Advanced escalation tier; coordinated neuroendocrine saturation",
  },
  {
    phase: "Weeks 13+",
    doseMg: 2.4,
    doseDisplay: "2.4 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Primary Phase 3 REDEFINE maintenance endpoint (1.2mg / 1.2mg)",
  },
]

export const ORFORGLIPRON_ACHIEVE_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 4",
    doseMg: 3,
    doseDisplay: "3 mg",
    cadence: "Once daily (Q24H)",
    notes: "Phase 3 ACHIEVE oral initiation tier for GI tolerability",
  },
  {
    phase: "Weeks 5 to 8",
    doseMg: 6,
    doseDisplay: "6 mg",
    cadence: "Once daily (Q24H)",
    notes: "Intermediate titration tier; glycemic control optimization",
  },
  {
    phase: "Weeks 9+",
    doseMg: 12,
    doseDisplay: "12 mg",
    cadence: "Once daily (Q24H)",
    notes: "Target clinical maintenance tier; maximum weight reduction endpoint",
  },
]

export const PEMVIDUTIDE_MOMENTUM_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 4",
    doseMg: 1.2,
    doseDisplay: "1.2 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Phase 2 MOMENTUM initiation tier; hepatic glucagon receptor priming",
  },
  {
    phase: "Weeks 5 to 12",
    doseMg: 1.8,
    doseDisplay: "1.8 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Intermediate maintenance tier; rapid hepatic fat clearance",
  },
  {
    phase: "Weeks 13+",
    doseMg: 2.4,
    doseDisplay: "2.4 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Target trial maintenance tier; maximal steatohepatitis resolution",
  },
]

export const COTADUTIDE_PHASE2_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 4",
    doseMg: 0.1,
    doseDisplay: "100 mcg",
    cadence: "Once daily (Q24H)",
    notes: "Phase 2a initiation tier; receptor priming and GI tolerability",
  },
  {
    phase: "Weeks 5 to 8",
    doseMg: 0.3,
    doseDisplay: "300 mcg",
    cadence: "Once daily (Q24H)",
    notes: "Intermediate titration tier; hepatic lipid mobilization",
  },
  {
    phase: "Weeks 9+",
    doseMg: 0.6,
    doseDisplay: "600 mcg",
    cadence: "Once daily (Q24H)",
    notes: "Target Phase 2b MASH endpoint; dual GLP-1/glucagon receptor saturation",
  },
]

export const ECNOGLUTIDE_PHASE3_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 4",
    doseMg: 0.6,
    doseDisplay: "0.6 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Phase 3 biased GLP-1 initiation tier for optimal tolerability",
  },
  {
    phase: "Weeks 5 to 8",
    doseMg: 1.2,
    doseDisplay: "1.2 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Second escalation tier; robust appetite dampening",
  },
  {
    phase: "Weeks 9 to 12",
    doseMg: 1.8,
    doseDisplay: "1.8 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Intermediate maintenance tier; profound HbA1c reduction",
  },
  {
    phase: "Weeks 13+",
    doseMg: 2.4,
    doseDisplay: "2.4 mg",
    cadence: "Once weekly (Q7D)",
    notes: "Primary Phase 3 maintenance endpoint; maximal body weight reduction",
  },
]

export const TESAMORELIN_PHASE3_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Weeks 1 to 12",
    doseMg: 1.0,
    doseDisplay: "1.0 mg",
    cadence: "Once daily (Q24H pre-bed fasted)",
    notes: "Phase 3 initiation cohort; pulsatile GH restoration",
  },
  {
    phase: "Weeks 13+",
    doseMg: 2.0,
    doseDisplay: "2.0 mg",
    cadence: "Once daily (Q24H pre-bed fasted)",
    notes: "FDA-approved Phase 3 maintenance tier; selective visceral adipose depletion",
  },
]

export const FOLLISTATIN_PHASE1_2_SCHEDULE: ClinicalTitrationRow[] = [
  {
    phase: "Days 1 to 10",
    doseMg: 0.1,
    doseDisplay: "100 mcg",
    cadence: "Once daily (Q24H)",
    notes: "Phase 1/2 micro-dose initiation; myostatin baseline neutralization",
  },
  {
    phase: "Days 11 to 20",
    doseMg: 0.2,
    doseDisplay: "200 mcg",
    cadence: "Once daily (Q24H)",
    notes: "Active escalation tier; tenocyte and myofibril protein synthesis",
  },
  {
    phase: "Days 21 to 30",
    doseMg: 0.3,
    doseDisplay: "300 mcg",
    cadence: "Once daily (Q24H)",
    notes: "Target maintenance block; full suppression of circulating myostatin",
  },
]

/**
 * Pure selector that resolves clinical trial escalation matrices or falls back to protocol titration steps.
 */
export function getClinicalTrialSchedulesForProtocol(
  protocolId: string,
  titrationSteps?: Array<{
    stage?: string
    timeframe?: string
    doseMcg: number
    doseDisplay: string
    cadence: string
    focus?: string
    notes?: string
  }>,
  standardDoseMg: number = 0.25,
  standardDoseMcg: number = 250,
  cadence: string = "Daily SubQ",
  washoutPeriod: string = "4 Weeks Off"
): ClinicalTitrationMatrix {
  const pid = protocolId.toLowerCase()

  if (pid.includes("reta")) {
    return {
      hasPhase2: true,
      hasPhase3: true,
      phase2: RETATRUTIDE_PHASE2_SCHEDULE,
      phase3: RETATRUTIDE_PHASE3_SCHEDULE,
      standard: RETATRUTIDE_PHASE3_SCHEDULE,
    }
  }

  if (pid.includes("tirz")) {
    return {
      hasPhase2: false,
      hasPhase3: true,
      phase2: [],
      phase3: TIRZEPATIDE_SURPASS_SCHEDULE,
      standard: TIRZEPATIDE_SURPASS_SCHEDULE,
    }
  }

  if (pid.includes("sema") && !pid.includes("cagri")) {
    return {
      hasPhase2: false,
      hasPhase3: true,
      phase2: [],
      phase3: SEMAGLUTIDE_STEP_SCHEDULE,
      standard: SEMAGLUTIDE_STEP_SCHEDULE,
    }
  }

  if (pid.includes("cagri")) {
    return {
      hasPhase2: false,
      hasPhase3: true,
      phase2: [],
      phase3: CAGRISEMA_REDEFINE_SCHEDULE,
      standard: CAGRISEMA_REDEFINE_SCHEDULE,
    }
  }

  if (pid.includes("orfor")) {
    return {
      hasPhase2: false,
      hasPhase3: true,
      phase2: [],
      phase3: ORFORGLIPRON_ACHIEVE_SCHEDULE,
      standard: ORFORGLIPRON_ACHIEVE_SCHEDULE,
    }
  }

  if (pid.includes("pemv")) {
    return {
      hasPhase2: true,
      hasPhase3: false,
      phase2: PEMVIDUTIDE_MOMENTUM_SCHEDULE,
      phase3: [],
      standard: PEMVIDUTIDE_MOMENTUM_SCHEDULE,
    }
  }

  if (pid.includes("cota")) {
    return {
      hasPhase2: true,
      hasPhase3: false,
      phase2: COTADUTIDE_PHASE2_SCHEDULE,
      phase3: [],
      standard: COTADUTIDE_PHASE2_SCHEDULE,
    }
  }

  if (pid.includes("ecno")) {
    return {
      hasPhase2: false,
      hasPhase3: true,
      phase2: [],
      phase3: ECNOGLUTIDE_PHASE3_SCHEDULE,
      standard: ECNOGLUTIDE_PHASE3_SCHEDULE,
    }
  }

  if (pid.includes("tesa")) {
    return {
      hasPhase2: false,
      hasPhase3: true,
      phase2: [],
      phase3: TESAMORELIN_PHASE3_SCHEDULE,
      standard: TESAMORELIN_PHASE3_SCHEDULE,
    }
  }

  if (pid.includes("folli")) {
    return {
      hasPhase2: true,
      hasPhase3: false,
      phase2: FOLLISTATIN_PHASE1_2_SCHEDULE,
      phase3: [],
      standard: FOLLISTATIN_PHASE1_2_SCHEDULE,
    }
  }

  // Derive dynamically from protocol titrationSteps
  const std: ClinicalTitrationRow[] = (titrationSteps || []).map((s) => ({
    phase: `${s.stage} (${s.timeframe})`,
    doseMg: Number((s.doseMcg / 1000).toFixed(3)),
    doseDisplay: s.doseDisplay,
    cadence: s.cadence,
    notes: s.focus || s.notes,
  }))

  if (std.length === 0) {
    std.push(
      {
        phase: "Phase 1: Initiation",
        doseMg: Number((standardDoseMg * 0.5).toFixed(3)),
        doseDisplay: `${Math.round(standardDoseMcg * 0.5)} mcg`,
        cadence: cadence,
        notes: "Initial tolerance induction phase (Days 1–7)",
      },
      {
        phase: "Phase 2: Target Optimization",
        doseMg: standardDoseMg,
        doseDisplay: `${standardDoseMcg} mcg`,
        cadence: cadence,
        notes: "Primary analytical maintenance protocol",
      },
      {
        phase: "Phase 3: Washout",
        doseMg: 0,
        doseDisplay: "0 mcg (Washout)",
        cadence: washoutPeriod,
        notes: "Receptor desensitization prevention & clearance period",
      }
    )
  }

  return {
    hasPhase2: false,
    hasPhase3: false,
    phase2: [],
    phase3: [],
    standard: std,
  }
}

/**
 * Pure selector that computes available vial strengths for a protocol, checking custom options first.
 */
export function getAvailableVialStrengthsForProtocol(
  protocolId: string,
  vialStrengthOptions?: Array<{ vialMg: number; diluentMl?: number; concMgMl?: number }>,
  defaultVialNetMg: number = 10
): number[] {
  if (vialStrengthOptions && vialStrengthOptions.length > 0) {
    return Array.from(new Set(vialStrengthOptions.map((o) => o.vialMg))).sort((a, b) => a - b)
  }

  const pid = protocolId.toLowerCase()
  if (pid.includes("reta")) return [5, 10, 20, 30, 40, 50, 60]
  if (pid.includes("tirz")) return [5, 10, 15, 20, 30]
  if (pid.includes("cagri")) return [5, 10, 20]
  if (pid.includes("orfor")) return [6, 12, 24]
  if (pid.includes("pemv")) return [5, 10, 20]
  if (pid.includes("cota")) return [5, 10]
  if (pid.includes("ecno")) return [5, 10, 15]
  if (pid.includes("tesa")) return [5, 10, 15]
  if (pid.includes("folli")) return [1, 2, 5]
  if (pid.includes("sema")) return [2, 5, 10]
  if (pid.includes("bpc")) return [2, 5, 10]
  if (pid.includes("tb-500")) return [2, 5, 10]
  if (pid.includes("ghk")) return [20, 50, 100]
  if (pid.includes("nad")) return [250, 500, 1000]
  if (pid.includes("cjc") || pid.includes("ipam")) return [2, 5, 10]
  if (pid.includes("semax") || pid.includes("selank")) return [10, 30, 60]
  if (pid.includes("epith")) return [5, 10, 20, 50]
  if (pid.includes("mots") || pid.includes("ss-31")) return [5, 10, 20]

  const baseMg = defaultVialNetMg || 10
  const set = new Set<number>([
    Math.max(1, Math.round(baseMg * 0.5)),
    baseMg,
    baseMg * 2,
  ])
  return Array.from(set).sort((a, b) => a - b)
}

export interface ProtocolSupplyBOM {
  weeks: number
  totalMg: number
  vialsRequired: number
  totalSyringes: number
  bacBottlesRequired: number
  bacWaterMl: number
  alcoholSwabs: number
}

/**
 * Calculates laboratory consumable supplies (vials, syringes, BAC water, swabs) for a given titration schedule and duration.
 */
export function calculateProtocolSupplyBOM(
  schedule: ClinicalTitrationRow[],
  vialMg: number,
  diluentMl: number = 2.0,
  weeks: number = 12
): ProtocolSupplyBOM {
  let totalMg = 0
  let totalInjections = 0
  let totalSyringes = 0

  const concMgMl = diluentMl > 0 && vialMg > 0 ? vialMg / diluentMl : 5.0

  for (let w = 1; w <= weeks; w++) {
    let targetRow = schedule.find((r) => {
      const match = r.phase.match(/weeks?\s*(\d+)\s*(?:[-–]|to)\s*(\d+)/i)
      if (match) {
        const start = parseInt(match[1], 10)
        const end = parseInt(match[2], 10)
        return w >= start && w <= end
      }
      const plusMatch = r.phase.match(/weeks?\s*(\d+)\s*\+/i)
      if (plusMatch) {
        const start = parseInt(plusMatch[1], 10)
        return w >= start
      }
      return false
    })

    if (!targetRow && schedule.length > 0) {
      targetRow = schedule[schedule.length - 1]
    }

    const cadenceLower = (targetRow?.cadence || "").toLowerCase()
    const isWeekly = cadenceLower.includes("week") || cadenceLower.includes("7 days")
    const injectionsPerWeek = isWeekly ? 1 : cadenceLower.includes("daily") || cadenceLower.includes("day") ? 7 : 1

    const doseMg = targetRow?.doseMg || 0
    const weeklyDoseMg = isWeekly ? doseMg : doseMg * injectionsPerWeek
    totalMg += weeklyDoseMg
    totalInjections += injectionsPerWeek

    const volMl = concMgMl > 0 ? doseMg / concMgMl : 0.5
    const syringesPerInjection = volMl > 1.0 ? Math.ceil(volMl / 1.0) : 1
    totalSyringes += injectionsPerWeek * syringesPerInjection
  }

  // 8% analytical buffer for pipetting dead-space and needle-hub retention
  const vialsRequired = vialMg > 0 ? Math.max(1, Math.ceil((totalMg * 1.08) / vialMg)) : 0
  const bacWaterMl = vialsRequired * diluentMl
  const bacBottlesRequired = Math.max(1, Math.ceil(bacWaterMl / 10))
  const alcoholSwabs = totalInjections * 2

  return {
    weeks,
    totalMg: Math.round(totalMg * 10) / 10,
    vialsRequired,
    totalSyringes,
    bacBottlesRequired,
    bacWaterMl: Math.round(bacWaterMl * 10) / 10,
    alcoholSwabs,
  }
}


