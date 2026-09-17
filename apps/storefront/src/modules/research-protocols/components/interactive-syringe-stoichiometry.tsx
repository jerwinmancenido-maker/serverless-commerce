"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/interactive-syringe-stoichiometry.tsx
 * @module  InteractiveSyringeStoichiometry (Research Protocols Module)
 * @purpose Flagship volumetric stoichiometry engine, calibrated SVG syringe visualizer, and clinical protocol calculator.
 * @contracts
 *   Component: InteractiveSyringeStoichiometry
 *   Catalog:   ALL_COMPOUND_PROTOCOLS (@lib/data/compound-protocols)
 */

import React, { useId, useMemo, useState, useEffect, useRef } from "react"
import {
  ALL_COMPOUND_PROTOCOLS,
  getCompoundProtocol,
  type CompoundAnalyticalProtocol,
} from "@lib/data/compound-protocols"
import {
  getClinicalTrialSchedulesForProtocol,
  getAvailableVialStrengthsForProtocol,
  calculateProtocolSupplyBOM,
} from "@lib/data/clinical-trials-registry"

export interface SyringeGraduationItem {
  doseDisplay: string
  doseMcg: number
  volumeMl: number
  syringeIU: number
  tickLabel?: string
}

export interface TitrationStepItem {
  stage?: string
  timeframe?: string
  doseDisplay?: string
  doseMcg?: number
  dose?: string
}

export interface VialStrengthOptionItem {
  vialMg: number
  diluentMl: number
  concMgMl: number
  badge?: string
}

export interface ReconstitutionOptionItem {
  diluentMl: number
  concMgMl: number
  label?: string
  tickConversion?: string
}

export interface ProtocolCalculatorConfig {
  enabled?: boolean
  title?: string
  default_compound_mass?: string | null
  compound_mass_unit?: string
  default_final_volume_ml?: string | null
  default_target_amount?: string | null
  target_amount_unit?: string
  iu_per_mg?: string | null
  device_volume_ml?: string | null
  device_label?: string | null
  rounding_precision?: number
  instructions?: string | null
}

export interface InteractiveSyringeStoichiometryProps {
  compoundId?: string
  compoundName?: string
  subtitle?: string
  vialMg?: number
  diluentMl?: number
  concMgMl?: number
  standardDoseMcg?: number
  standardDoseDisplay?: string
  cadence?: string
  graduations?: SyringeGraduationItem[]
  titrationSteps?: TitrationStepItem[]
  vialStrengthOptions?: VialStrengthOptionItem[]
  reconstitutionOptions?: Record<string, ReconstitutionOptionItem>
  needleGauge?: string
  needleLength?: string
  hubType?: string
  recommendedBarrel?: string
  transferNeedle?: string
  syringeType?: string
  standardIUDisplay?: string
  calculatorConfig?: ProtocolCalculatorConfig | null
  onCalibrationChange?: (metrics: CalibrationMetricsPayload) => void
  className?: string
  // Modernization & Universal Calculator Props
  enableCatalogPicker?: boolean
  initialCompoundId?: string
  customTitle?: string
  customSubtitle?: string
  hideHardwareSpec?: boolean
  hideTitrationTable?: boolean
}

export interface CalibrationMetricsPayload {
  mass: number
  massUnit: string
  diluent: number
  conc: number
  targetDose: number
  targetDoseUnit: string
  units: number
  volumeMl: number
  totalDoses: number
}

function getPeptideColors(peptideId?: string) {
  if (!peptideId) return { main: "#00B9E6", dark: "#0284C7" }
  const id = peptideId.toLowerCase()
  if (id.includes("ghk") || id.includes("copper")) {
    return { main: "#2563EB", dark: "#1D4ED8" } // Sapphire Blue
  }
  if (
    id.includes("mots") ||
    id.includes("ss-31") ||
    id.includes("epithalon") ||
    id.includes("longevity")
  ) {
    return { main: "#10B981", dark: "#059669" } // Emerald Green
  }
  if (id.includes("melanotan") || id.includes("pt-141") || id.includes("kisspeptin")) {
    return { main: "#8B5CF6", dark: "#7C3AED" } // Purple
  }
  return { main: "#00B9E6", dark: "#0284C7" } // Precision Cyan
}

const POPULAR_CATALOG_PRESETS = [
  { id: "bpc-157", label: "BPC-157 (10mg)" },
  { id: "tirzepatide", label: "Tirzepatide (10mg)" },
  { id: "retatrutide", label: "Retatrutide (10mg)" },
  { id: "semaglutide", label: "Semaglutide (5mg)" },
  { id: "5-amino-1mq", label: "5-Amino-1MQ (500mg)" },
  { id: "ghk-cu", label: "GHK-Cu (50mg)" },
  { id: "tb-500", label: "TB-500 (10mg)" },
  { id: "cjc-1295-dac", label: "CJC-1295 (10mg)" },
  { id: "custom", label: "⚙️ Custom Parameters" },
]

export function InteractiveSyringeStoichiometry({
  compoundId = "generic-peptide",
  compoundName = "Research Peptide",
  subtitle,
  vialMg: initialVialMg = 10,
  diluentMl: initialDiluentMl = 2.0,
  concMgMl: _initialConcMgMl,
  standardDoseMcg = 250,
  standardDoseDisplay: _standardDoseDisplay,
  cadence: initialCadence = "1x Daily",
  graduations = [],
  titrationSteps = [],
  vialStrengthOptions,
  reconstitutionOptions,
  needleGauge = "31G Ultra-Fine (0.25 mm)",
  needleLength = '5/16" (8 mm)',
  hubType = "Fixed Ultra-Low Dead Space (<0.005 mL)",
  recommendedBarrel = "0.3 mL or 0.5 mL for Micro-Doses",
  transferNeedle = '21G–23G × 1.5" Sterile Transfer Needle',
  syringeType = "Standard U-100 Insulin Syringe (100 units = 1.0 mL)",
  standardIUDisplay,
  calculatorConfig,
  onCalibrationChange,
  className = "",
  enableCatalogPicker = false,
  initialCompoundId,
  customTitle,
  customSubtitle,
  hideHardwareSpec = false,
  hideTitrationTable = false,
}: InteractiveSyringeStoichiometryProps) {
  const uid = useId().replace(/:/g, "")
  const fluidGradId = `visFluidGrad_${uid}`
  const needleGradId = `visNeedleGrad_${uid}`

  // Universal Catalog Picker state
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>(
    initialCompoundId || (compoundId !== "generic-peptide" ? compoundId : "bpc-157")
  )

  // Categorize protocols for dropdown
  const categorizedCompounds = useMemo(() => {
    const groups: Record<string, CompoundAnalyticalProtocol[]> = {}
    ALL_COMPOUND_PROTOCOLS.forEach((p) => {
      const cat = p.category || "General Research Standards"
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(p)
    })
    return groups
  }, [])

  // Resolved protocol from catalog if picker is enabled
  const resolvedProtocol = useMemo(() => {
    if (!enableCatalogPicker || selectedCatalogId === "custom") return null
    return getCompoundProtocol(selectedCatalogId)
  }, [enableCatalogPicker, selectedCatalogId])

  // Effective compound attributes
  const effectiveCompoundId = resolvedProtocol?.id || compoundId
  const effectiveCompoundName = resolvedProtocol?.compoundName || compoundName
  const effectiveSubtitle = resolvedProtocol?.subtitle || subtitle
  const effectiveCadence = resolvedProtocol?.dosing?.cadence || initialCadence
  const effectiveGraduations = resolvedProtocol?.syringeGuide?.graduations || graduations
  const effectiveTitrationSteps = resolvedProtocol?.dosing?.titrationSteps || titrationSteps
  const effectiveVialStrengthOptions = resolvedProtocol?.vialStrengthOptions || vialStrengthOptions
  const _effectiveReconstitutionOptions = resolvedProtocol?.reconstitutionOptions || reconstitutionOptions
  const effectiveNeedleGauge = resolvedProtocol?.syringeGuide?.needleGauge || needleGauge
  const effectiveNeedleLength = resolvedProtocol?.syringeGuide?.needleLength || needleLength
  const effectiveHubType = resolvedProtocol?.syringeGuide?.hubType || hubType
  const effectiveRecommendedBarrel = resolvedProtocol?.syringeGuide?.recommendedBarrel || recommendedBarrel
  const effectiveTransferNeedle = resolvedProtocol?.syringeGuide?.transferNeedle || transferNeedle
  const effectiveSyringeType =
    resolvedProtocol?.syringeGuide?.syringeType ||
    syringeType ||
    "Standard U-100 Insulin Syringe (100 units = 1.0 mL)"
  const effectiveStandardIUDisplay = resolvedProtocol?.syringeGuide?.standardIUDisplay || standardIUDisplay

  const isHgh =
    effectiveCompoundId.toLowerCase().includes("hgh") ||
    effectiveCompoundId.toLowerCase().includes("somatropin")
  const isHmg = effectiveCompoundId.toLowerCase().includes("hmg")
  const isBotulinum = effectiveCompoundId.toLowerCase().includes("botulinum")
  const isHcg = effectiveCompoundId.toLowerCase().includes("hcg")
  const isEpo = effectiveCompoundId.toLowerCase().includes("epo")
  const isIuCompound = isHgh || isHmg || isBotulinum || isHcg || isEpo

  // Initial mass determination
  const defaultMassString = useMemo(() => {
    if (resolvedProtocol) {
      if (resolvedProtocol.calculator?.defaultCompoundMass) {
        return resolvedProtocol.calculator.defaultCompoundMass
      }
      if (resolvedProtocol.vialStrengthOptions && resolvedProtocol.vialStrengthOptions.length > 0) {
        return resolvedProtocol.vialStrengthOptions[0].vialMg.toString()
      }
      return (resolvedProtocol.reconstitution?.defaultVialNetMg || 10).toString()
    }
    if (calculatorConfig?.default_compound_mass) {
      return calculatorConfig.default_compound_mass
    }
    if (vialStrengthOptions && vialStrengthOptions.length > 0) {
      return vialStrengthOptions[0].vialMg.toString()
    }
    return (initialVialMg || 10).toString()
  }, [resolvedProtocol, calculatorConfig, vialStrengthOptions, initialVialMg])

  // Initial diluent determination
  const defaultDiluentString = useMemo(() => {
    if (resolvedProtocol) {
      if (resolvedProtocol.calculator?.defaultFinalVolumeMl) {
        return resolvedProtocol.calculator.defaultFinalVolumeMl
      }
      if (resolvedProtocol.vialStrengthOptions && resolvedProtocol.vialStrengthOptions.length > 0) {
        return resolvedProtocol.vialStrengthOptions[0].diluentMl.toString()
      }
      return (resolvedProtocol.reconstitution?.defaultDiluentMl || 2.0).toString()
    }
    if (calculatorConfig?.default_final_volume_ml) {
      return calculatorConfig.default_final_volume_ml
    }
    if (vialStrengthOptions && vialStrengthOptions.length > 0) {
      return vialStrengthOptions[0].diluentMl.toString()
    }
    return (initialDiluentMl || 2.0).toString()
  }, [resolvedProtocol, calculatorConfig, vialStrengthOptions, initialDiluentMl])

  // Initial target dose determination
  const defaultDoseString = useMemo(() => {
    if (resolvedProtocol) {
      if (resolvedProtocol.calculator?.defaultTargetAmount) {
        return resolvedProtocol.calculator.defaultTargetAmount
      }
      const mcg = resolvedProtocol.dosing?.standardDoseMcg
      if (mcg && mcg > 0) {
        return mcg >= 1000 ? (mcg / 1000).toString() : mcg.toString()
      }
    }
    if (calculatorConfig?.default_target_amount) {
      return calculatorConfig.default_target_amount
    }
    if (standardDoseMcg && standardDoseMcg > 0) {
      return standardDoseMcg >= 1000 ? (standardDoseMcg / 1000).toString() : standardDoseMcg.toString()
    }
    if (effectiveGraduations.length > 0 && effectiveGraduations[0].doseMcg) {
      return effectiveGraduations[0].doseMcg >= 1000
        ? (effectiveGraduations[0].doseMcg / 1000).toString()
        : effectiveGraduations[0].doseMcg.toString()
    }
    return "200"
  }, [resolvedProtocol, calculatorConfig, standardDoseMcg, effectiveGraduations])

  const defaultDoseUnit = useMemo(() => {
    if (resolvedProtocol?.calculator?.targetAmountUnit) {
      return resolvedProtocol.calculator.targetAmountUnit as "mcg" | "mg" | "IU"
    }
    if (calculatorConfig?.target_amount_unit) {
      return calculatorConfig.target_amount_unit as "mcg" | "mg" | "IU"
    }
    if (isIuCompound) return "IU"
    const stdMcg = resolvedProtocol?.dosing?.standardDoseMcg || standardDoseMcg
    if (stdMcg && stdMcg >= 1000) return "mg"
    return "mcg"
  }, [resolvedProtocol, calculatorConfig, isIuCompound, standardDoseMcg])

  // 1. Parameter State Inputs
  const [compoundMassInput, setCompoundMassInput] = useState<string>(defaultMassString)
  const [compoundMassUnit] = useState<string>(
    calculatorConfig?.compound_mass_unit || (isHmg ? "IU" : "mg")
  )
  const [finalVolumeInput, setFinalVolumeInput] = useState<string>(defaultDiluentString)
  const [targetDoseInput, setTargetDoseInput] = useState<string>(defaultDoseString)
  const [targetDoseUnit, setTargetDoseUnit] = useState<"mcg" | "mg" | "IU">(defaultDoseUnit)
  const [barrelCapacity, setBarrelCapacity] = useState<30 | 50 | 100>(100)

  // Switch compound catalog handler
  const handleSelectCompound = (cid: string) => {
    setSelectedCatalogId(cid)
    if (cid === "custom") return
    const proto = getCompoundProtocol(cid)
    if (!proto) return

    const isProtoHgh = proto.id.toLowerCase().includes("hgh") || proto.id.toLowerCase().includes("somatropin")
    const isProtoHmg = proto.id.toLowerCase().includes("hmg")

    const mass = proto.calculator?.defaultCompoundMass
      ? proto.calculator.defaultCompoundMass
      : proto.vialStrengthOptions && proto.vialStrengthOptions.length > 0
      ? proto.vialStrengthOptions[0].vialMg.toString()
      : (proto.reconstitution?.defaultVialNetMg || 10).toString()

    const dil = proto.calculator?.defaultFinalVolumeMl
      ? proto.calculator.defaultFinalVolumeMl
      : proto.vialStrengthOptions && proto.vialStrengthOptions.length > 0
      ? proto.vialStrengthOptions[0].diluentMl.toString()
      : (proto.reconstitution?.defaultDiluentMl || 2.0).toString()

    const stdMcg = proto.dosing?.standardDoseMcg || 250

    setCompoundMassInput(mass)
    setFinalVolumeInput(dil)

    if (isProtoHgh || isProtoHmg) {
      setTargetDoseUnit("IU")
      setTargetDoseInput(isProtoHgh ? "2.0" : "37.5")
    } else if (stdMcg >= 1000) {
      setTargetDoseUnit("mg")
      setTargetDoseInput((stdMcg / 1000).toString())
    } else {
      setTargetDoseUnit("mcg")
      setTargetDoseInput(stdMcg.toString())
    }
  }

  // 2. Numeric Calculations
  const numericMass = Math.max(0.01, parseFloat(compoundMassInput) || 0)
  const numericDiluent = Math.max(0.01, parseFloat(finalVolumeInput) || 0)
  const numericTarget = Math.max(0, parseFloat(targetDoseInput) || 0)

  // Derive mass in mg
  const vialMg = useMemo(() => {
    if (compoundMassUnit === "g") return numericMass * 1000
    if (compoundMassUnit === "mcg") return numericMass / 1000
    return numericMass
  }, [compoundMassUnit, numericMass])

  const diluentMl = numericDiluent

  // Derive target dose in mcg
  const activeDoseMcg = useMemo(() => {
    if (targetDoseUnit === "mg") return numericTarget * 1000
    if (targetDoseUnit === "IU") {
      if (isHgh) return numericTarget * (1000.0 / 3.0)
      if (isHmg) return numericTarget
      if (isBotulinum) return numericTarget * 0.05
      if (isHcg) return numericTarget * 1.0
      if (isEpo) return numericTarget * 0.00833
      return numericTarget
    }
    return numericTarget
  }, [targetDoseUnit, numericTarget, isHgh, isHmg, isBotulinum, isHcg, isEpo])

  // Active Concentration
  const activeConcMgMl = useMemo(() => {
    if (diluentMl > 0) {
      return vialMg / diluentMl
    }
    return 5.0
  }, [vialMg, diluentMl])

  // Clinical Trial Escalation Schedules & Dynamic Presets
  const cleanProtocolId = useMemo(() => {
    return (effectiveCompoundId || "").replace(/^protocol-/, "").toLowerCase()
  }, [effectiveCompoundId])

  const clinicalTrialMatrix = useMemo(() => {
    const stdMcg = resolvedProtocol?.dosing?.standardDoseMcg || 250
    const stdMg = stdMcg / 1000
    return getClinicalTrialSchedulesForProtocol(
      cleanProtocolId,
      effectiveTitrationSteps as Parameters<typeof getClinicalTrialSchedulesForProtocol>[1],
      stdMg,
      stdMcg,
      effectiveCadence
    )
  }, [cleanProtocolId, effectiveTitrationSteps, resolvedProtocol, effectiveCadence])

  const availableSchedules = useMemo(() => {
    const list: Array<{
      id: "phase2" | "phase3" | "standard"
      label: string
      schedule: import("@lib/data/clinical-trials-registry").ClinicalTitrationRow[]
    }> = []

    if (clinicalTrialMatrix.hasPhase2 && clinicalTrialMatrix.phase2.length > 0) {
      list.push({
        id: "phase2",
        label: "Phase 2 Escalation Schedule",
        schedule: clinicalTrialMatrix.phase2,
      })
    }
    if (clinicalTrialMatrix.hasPhase3 && clinicalTrialMatrix.phase3.length > 0) {
      list.push({
        id: "phase3",
        label: "Phase 3 Confirmatory Schedule",
        schedule: clinicalTrialMatrix.phase3,
      })
    }
    if (list.length === 0 && clinicalTrialMatrix.standard.length > 0) {
      list.push({
        id: "standard",
        label: "Analytical Titration Schedule",
        schedule: clinicalTrialMatrix.standard,
      })
    }
    return list
  }, [clinicalTrialMatrix])

  const [selectedScheduleIdx, setSelectedScheduleIdx] = useState<number>(0)
  const activeScheduleItem = availableSchedules[selectedScheduleIdx] || availableSchedules[0]

  const supplyCalculations = useMemo(() => {
    if (!activeScheduleItem) return null
    return {
      cycle12: calculateProtocolSupplyBOM(activeScheduleItem.schedule, vialMg, diluentMl, 12),
      cycle24: calculateProtocolSupplyBOM(activeScheduleItem.schedule, vialMg, diluentMl, 24),
    }
  }, [activeScheduleItem, vialMg, diluentMl])

  const dynamicVialStrengths = useMemo<Array<{ vialMg: number; diluentMl: number }>>(() => {
    if (effectiveVialStrengthOptions && effectiveVialStrengthOptions.length > 0) {
      const seen = new Set<number>()
      const list: Array<{ vialMg: number; diluentMl: number }> = []
      for (const o of effectiveVialStrengthOptions) {
        if (!seen.has(o.vialMg)) {
          seen.add(o.vialMg)
          list.push({
            vialMg: o.vialMg,
            diluentMl: o.diluentMl || diluentMl || 2.0,
          })
        }
      }
      return list.sort((a, b) => a.vialMg - b.vialMg)
    }
    const numbers = getAvailableVialStrengthsForProtocol(cleanProtocolId)
    return numbers.map((mg) => ({
      vialMg: mg,
      diluentMl: mg >= 30 ? 3.0 : 2.0,
    }))
  }, [effectiveVialStrengthOptions, cleanProtocolId, diluentMl])

  // 3. Quick Presets from Titration & Graduations
  const quickPresets = useMemo(() => {
    const list: Array<{
      label: string
      doseMcg: number
      displayValue: string
      displayUnit: "mcg" | "mg" | "IU"
    }> = []
    const seen = new Set<string>()

    effectiveTitrationSteps.forEach((s) => {
      const label = s.doseDisplay || ("dose" in s ? (s as { dose?: string }).dose : undefined)
      if (!label || seen.has(label)) return
      seen.add(label)
      let mcg = s.doseMcg || 0
      let unit: "mcg" | "mg" | "IU" = "mcg"
      let dispVal = ""
      const match = label.match(/(\d+(?:\.\d+)?)\s*(mcg|mg|iu)/i)
      if (match) {
        const val = parseFloat(match[1])
        const u = match[2].toLowerCase()
        dispVal = val.toString()
        if (u === "mg") {
          mcg = val * 1000
          unit = "mg"
        } else if (u === "iu") {
          mcg = isHgh ? val * (1000 / 3) : val
          unit = "IU"
        } else {
          mcg = val
          unit = "mcg"
        }
      }
      if (mcg > 0) {
        list.push({
          label,
          doseMcg: mcg,
          displayValue: dispVal || mcg.toString(),
          displayUnit: unit,
        })
      }
    })

    effectiveGraduations.forEach((g) => {
      const label = g.doseDisplay
      if (!label || seen.has(label)) return
      seen.add(label)
      let mcg = g.doseMcg || 0
      let unit: "mcg" | "mg" | "IU" = "mcg"
      let dispVal = ""
      const match = label.match(/(\d+(?:\.\d+)?)\s*(mcg|mg|iu)/i)
      if (match) {
        const val = parseFloat(match[1])
        const u = match[2].toLowerCase()
        dispVal = val.toString()
        if (u === "mg") {
          mcg = val * 1000
          unit = "mg"
        } else if (u === "iu") {
          mcg = isHgh ? val * (1000 / 3) : val
          unit = "IU"
        } else {
          mcg = val
          unit = "mcg"
        }
      }
      if (mcg > 0) {
        list.push({
          label,
          doseMcg: mcg,
          displayValue: dispVal || mcg.toString(),
          displayUnit: unit,
        })
      }
    })

    if (list.length === 0) {
      return [
        { label: "100 mcg", doseMcg: 100, displayValue: "100", displayUnit: "mcg" as const },
        { label: "200 mcg", doseMcg: 200, displayValue: "200", displayUnit: "mcg" as const },
        { label: "250 mcg", doseMcg: 250, displayValue: "250", displayUnit: "mcg" as const },
        { label: "500 mcg", doseMcg: 500, displayValue: "500", displayUnit: "mcg" as const },
      ]
    }

    return list.slice(0, 6)
  }, [effectiveTitrationSteps, effectiveGraduations, isHgh])

  // 4. Volumetric and Plunger Geometry
  const { volumeMl, units, totalDoses } = useMemo(() => {
    let vol = 0
    const isPureIu = compoundMassUnit === "IU" && targetDoseUnit === "IU"
    if (isPureIu || isHmg) {
      vol = activeConcMgMl > 0 ? numericTarget / activeConcMgMl : 0
    } else {
      vol = activeConcMgMl > 0 ? (activeDoseMcg / 1000.0) / activeConcMgMl : 0
    }
    const u = vol * 100.0
    const clamped = Math.min(barrelCapacity, Math.max(0, u))
    let yieldDoses = 0
    if (isPureIu) {
      yieldDoses = numericTarget > 0 ? numericMass / numericTarget : 0
    } else if (isHmg) {
      yieldDoses = activeDoseMcg > 0 ? 75.0 / activeDoseMcg : 0
    } else if (isHgh) {
      const totalIU = vialMg * 3.0
      const doseIU = activeDoseMcg / (1000.0 / 3.0)
      yieldDoses = doseIU > 0 ? totalIU / doseIU : 0
    } else if (isBotulinum) {
      const totalIU = 100.0
      const doseIU = activeDoseMcg / 0.05
      yieldDoses = doseIU > 0 ? totalIU / doseIU : 0
    } else if (isHcg) {
      const totalIU = 10000.0
      const doseIU = activeDoseMcg / 1.0
      yieldDoses = doseIU > 0 ? totalIU / doseIU : 0
    } else if (isEpo) {
      const totalIU = 3000.0
      const doseIU = activeDoseMcg / 0.00833
      yieldDoses = doseIU > 0 ? totalIU / doseIU : 0
    } else {
      yieldDoses = activeDoseMcg > 0 ? (vialMg * 1000.0) / activeDoseMcg : 0
    }
    return {
      volumeMl: vol,
      units: u,
      clampedUnits: clamped,
      totalDoses: yieldDoses,
    }
  }, [compoundMassUnit, targetDoseUnit, numericTarget, numericMass, isHmg, isHgh, isBotulinum, isHcg, isEpo, activeConcMgMl, activeDoseMcg, vialMg, barrelCapacity])

  // Synchronize calibration metrics to parent full-protocol state (guarded with ref to prevent infinite loops)
  const onCalibrationChangeRef = useRef(onCalibrationChange)
  useEffect(() => {
    onCalibrationChangeRef.current = onCalibrationChange
  })

  const lastEmittedKeyRef = useRef<string>("")
  useEffect(() => {
    if (!onCalibrationChangeRef.current) return
    const key = `${vialMg}|${compoundMassUnit}|${diluentMl}|${activeConcMgMl}|${numericTarget}|${targetDoseUnit}|${units}|${volumeMl}|${totalDoses}`
    if (lastEmittedKeyRef.current === key) return
    lastEmittedKeyRef.current = key

    onCalibrationChangeRef.current({
      mass: vialMg,
      massUnit: compoundMassUnit,
      diluent: diluentMl,
      conc: activeConcMgMl,
      targetDose: numericTarget,
      targetDoseUnit,
      units,
      volumeMl,
      totalDoses,
    })
  }, [
    vialMg,
    compoundMassUnit,
    diluentMl,
    activeConcMgMl,
    numericTarget,
    targetDoseUnit,
    units,
    volumeMl,
    totalDoses,
  ])

  // Auto-expand barrel capacity when units exceed capacity
  useEffect(() => {
    if (units > barrelCapacity) {
      if (units <= 50) {
        setBarrelCapacity(50)
      } else {
        setBarrelCapacity(100)
      }
    }
  }, [units, barrelCapacity])

  // Bidirectional Slider handler
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawUnits = parseFloat(e.target.value) || 0
    const conc = activeConcMgMl > 0 ? activeConcMgMl : 5.0
    let newDoseMcg = 0
    if (isHmg) {
      newDoseMcg = rawUnits * (conc / 100.0)
    } else {
      newDoseMcg = rawUnits * (conc / 100.0) * 1000.0
    }

    if (targetDoseUnit === "mg") {
      setTargetDoseInput((newDoseMcg / 1000).toFixed(2))
    } else if (targetDoseUnit === "IU") {
      const iu = isHgh ? newDoseMcg / (1000 / 3) : newDoseMcg
      setTargetDoseInput(iu.toFixed(1))
    } else {
      setTargetDoseInput(Math.round(newDoseMcg).toString())
    }
  }

  // Quick Preset Chip Click handler
  const handleChipClick = (preset: {
    doseMcg: number
    displayValue: string
    displayUnit: "mcg" | "mg" | "IU"
  }) => {
    setTargetDoseUnit(preset.displayUnit)
    setTargetDoseInput(preset.displayValue)
  }

  // Click row on graduation mark table to set dose
  const handleRowClick = (grad: SyringeGraduationItem) => {
    const rawUnits = grad.syringeIU
    const conc = activeConcMgMl > 0 ? activeConcMgMl : 5.0
    let newDoseMcg = 0
    if (isHmg) {
      newDoseMcg = rawUnits * (conc / 100.0)
      setTargetDoseUnit("IU")
      setTargetDoseInput(newDoseMcg.toFixed(1))
    } else {
      newDoseMcg = rawUnits * (conc / 100.0) * 1000.0
      if (newDoseMcg >= 1000) {
        setTargetDoseUnit("mg")
        setTargetDoseInput((newDoseMcg / 1000).toFixed(2).replace(/\.00$/, ""))
      } else {
        setTargetDoseUnit("mcg")
        setTargetDoseInput(Math.round(newDoseMcg).toString())
      }
    }
  }

  // Visual appearance
  const colors = useMemo(() => getPeptideColors(effectiveCompoundId), [effectiveCompoundId])
  const fillRatio = Math.min(1.0, Math.max(0, units / barrelCapacity))
  const fluidWidth = Number((fillRatio * 400.0).toFixed(1))
  const plungerX = Number((80 + fluidWidth).toFixed(1))
  const isOverBarrel = units > barrelCapacity

  // Dynamic barrel ticks based on selected capacity
  const barrelTicks = useMemo(() => {
    const list: Array<{ val: number; x: number; isMajor: boolean; isMedium?: boolean; label?: string }> = []
    if (barrelCapacity === 30) {
      for (let u = 0; u <= 30; u += 1) {
        const isMajor = u % 5 === 0
        const x = 80 + (u / 30) * 400
        list.push({ val: u, x, isMajor, label: isMajor ? u.toString() : undefined })
      }
    } else if (barrelCapacity === 50) {
      for (let u = 0; u <= 50; u += 2) {
        const isMajor = u % 10 === 0
        const isMedium = !isMajor && u % 5 === 0
        const x = 80 + (u / 50) * 400
        list.push({ val: u, x, isMajor, isMedium, label: isMajor ? u.toString() : undefined })
      }
    } else {
      for (let u = 0; u <= 100; u += 5) {
        const isMajor = u % 10 === 0
        const isMedium = !isMajor && u % 5 === 0
        const x = 80 + (u / 100) * 400
        list.push({ val: u, x, isMajor, isMedium, label: isMajor ? u.toString() : undefined })
      }
    }
    return list
  }, [barrelCapacity])

  // Vial SVG liquid height
  const vialFillRatio = Math.min(1.0, Math.max(0.2, diluentMl / 3.5))
  const vialLiquidHeight = Math.round(52 * vialFillRatio)
  const vialLiquidY = 92 - vialLiquidHeight

  // Readout text formatting
  const formattedDoseString = useMemo(() => {
    if (isHmg || isBotulinum || isHcg || isEpo) {
      const iuVal = isBotulinum
        ? activeDoseMcg / 0.05
        : isHcg
        ? activeDoseMcg / 1.0
        : isEpo
        ? activeDoseMcg / 0.00833
        : activeDoseMcg
      return `${Math.round(iuVal)} IU`
    }
    if (isHgh) {
      const iu = (activeDoseMcg / (1000.0 / 3.0)).toFixed(1).replace(/\.0$/, "")
      return `${iu} IU`
    }
    if (activeDoseMcg >= 1000) {
      return `${(activeDoseMcg / 1000.0).toFixed(2).replace(/\.00$/, "")} mg`
    }
    return `${Math.round(activeDoseMcg)} mcg`
  }, [isHmg, isHgh, isBotulinum, isHcg, isEpo, activeDoseMcg])

  const formattedDoseSub = useMemo(() => {
    if (isHmg) return `${Math.round(activeDoseMcg)} IU bioactive standard`
    if (isHgh) {
      const iu = (activeDoseMcg / (1000.0 / 3.0)).toFixed(1).replace(/\.0$/, "")
      return `${iu} IU (${(activeDoseMcg / 1000.0).toFixed(2)} mg Somatropin)`
    }
    if (activeDoseMcg >= 1000) {
      return `${Math.round(activeDoseMcg)} µg active mass`
    }
    return `${(activeDoseMcg / 1000.0).toFixed(3)} mg active mass`
  }, [isHmg, isHgh, activeDoseMcg])

  const vialSummaryText = useMemo(() => {
    if (isHmg) return `75 IU / ${diluentMl}mL`
    if (isHgh) {
      const iu = Math.round(vialMg * 3.0)
      return `${iu} IU (${vialMg}mg) / ${diluentMl}mL`
    }
    if (vialMg === 0) return `${diluentMl} mL USP Diluent`
    return `${vialMg}mg / ${diluentMl}mL`
  }, [isHmg, isHgh, vialMg, diluentMl])

  // Dynamic Fallback Graduations
  const displayGraduations = useMemo(() => {
    if (effectiveGraduations && effectiveGraduations.length > 0) {
      return effectiveGraduations
    }
    const conc = activeConcMgMl > 0 ? activeConcMgMl : 5.0
    return [10, 25, 50, 100].map((u) => {
      const vol = u / 100.0
      let dose = 0
      let display = ""
      if (isHmg) {
        dose = u * (conc / 100.0)
        display = `${dose.toFixed(1)} IU`
      } else {
        dose = u * (conc / 100.0) * 1000.0
        display =
          dose >= 1000
            ? `${(dose / 1000).toFixed(2).replace(/\.00$/, "")} mg`
            : `${Math.round(dose)} mcg`
      }
      return {
        doseDisplay: display,
        doseMcg: dose,
        volumeMl: vol,
        syringeIU: u,
        tickLabel: `${u.toFixed(1)} units (${vol.toFixed(2)} mL) on U-100 syringe`,
      }
    })
  }, [effectiveGraduations, activeConcMgMl, isHmg])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ── 0. OPTIONAL UNIVERSAL CATALOG PICKER ── */}
      {enableCatalogPicker && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200 text-xs font-bold font-mono">
                🧪
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 block">
                  Universal Research Compound Catalog (88 Analytical Protocols)
                </span>
                <span className="text-[11px] text-slate-500">
                  Select a verified compound to auto-load vial net mass, diluent volumes, and titration schedules.
                </span>
              </div>
            </div>
            <div className="w-full sm:w-auto shrink-0">
              <select
                value={selectedCatalogId}
                onChange={(e) => handleSelectCompound(e.target.value)}
                className="w-full sm:w-64 rounded-xl bg-slate-50 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer shadow-xs"
                aria-label="Select research compound from catalog"
              >
                <option value="custom">⚙️ Custom Parameters (Manual Dilution)</option>
                {Object.entries(categorizedCompounds).map(([category, compounds]) => (
                  <optgroup key={category} label={category} className="bg-white text-slate-900 font-bold">
                    {compounds.map((c) => (
                      <option key={c.id} value={c.id} className="text-slate-800 font-normal">
                        {c.compoundName} ({c.reconstitution?.defaultVialNetMg || 10}mg)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Popular Quick-Select Chips */}
          <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Popular:</span>
            {POPULAR_CATALOG_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectCompound(preset.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCatalogId === preset.id
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 1. SCREEN LABORATORY VISUALIZER CARD (Hidden in Print) ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-slate-900 shadow-sm print:hidden">
        {/* Subtle Radial Glow */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)",
          }}
        />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200 shadow-2xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <span>{customTitle || "Interactive Syringe Calibration & Reconstitution Stoichiometry"}</span>
                {effectiveCompoundName && effectiveCompoundName !== "Research Peptide" && (
                  <span className="text-xs font-mono font-normal text-sky-700">
                    — {effectiveCompoundName}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">
                {customSubtitle ||
                  effectiveSubtitle ||
                  "Integrated reconstitution calculator and calibrated volumetric micro-plunger simulation."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full bg-sky-50 border border-sky-200 px-2.5 py-1 text-[10px] font-mono font-bold text-sky-800">
              U-100 Micro-Plunger
            </span>
            <span className="hidden sm:inline-block rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-mono text-slate-700">
              {effectiveNeedleGauge}
            </span>
          </div>
        </div>

        {/* Quick Presets Bar (Prominent Cockpit Placement) */}
        {quickPresets.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Quick Presets:</span>
            {quickPresets.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  Math.abs(activeDoseMcg - chip.doseMcg) < 1
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {chip.label}
              </button>
            ))}
            {effectiveCadence && (
              <span className="ml-auto hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                Cadence: {effectiveCadence}
              </span>
            )}
          </div>
        )}

        {/* ── INTEGRATED PARAMETER CALIBRATION BAR ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 mb-4 shadow-2xs">
          {/* 1. Compound Mass */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1">
                <span className="text-sky-600 font-mono">1.</span> Compound Mass
              </span>
              <span className="text-[10px] font-mono text-sky-700 font-bold">{vialMg} mg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={compoundMassInput}
                onChange={(e) => setCompoundMassInput(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-2xs"
                placeholder="10"
                aria-label="Compound net mass in mg"
              />
              <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 font-mono">
                {compoundMassUnit}
              </span>
            </div>
            {dynamicVialStrengths && dynamicVialStrengths.length > 1 && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Vials:</span>
                {dynamicVialStrengths.map((opt, idx) => (
                  <button
                    key={`vial-${opt.vialMg}-${idx}`}
                    type="button"
                    onClick={() => {
                      setCompoundMassInput(opt.vialMg.toString())
                      setFinalVolumeInput(opt.diluentMl.toString())
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      vialMg === opt.vialMg
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {opt.vialMg}mg
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Diluent Added (mL) */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1">
                <span className="text-sky-600 font-mono">2.</span> Diluent Volume
              </span>
              <span className="text-[10px] font-mono text-sky-700 font-bold">{diluentMl.toFixed(1)} mL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={finalVolumeInput}
                onChange={(e) => setFinalVolumeInput(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-2xs"
                placeholder="2.0"
                aria-label="Diluent solvent added in mL"
              />
              <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 font-mono">
                mL
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className="text-[9px] text-slate-400 font-bold uppercase">Quick:</span>
              {[1.0, 2.0, 2.5, 3.0, 5.0].map((vol) => (
                <button
                  key={`vol-${vol}`}
                  type="button"
                  onClick={() => setFinalVolumeInput(vol.toString())}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    Math.abs(diluentMl - vol) < 0.05
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {vol}mL
                </button>
              ))}
            </div>
          </div>

          {/* 3. Target Desired Assay Dose */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1">
                <span className="text-sky-600 font-mono">3.</span> Target Assay Dose
              </span>
              <span className="text-[10px] font-mono text-rose-600 font-bold">{units.toFixed(1)} Units</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0.1"
                step={targetDoseUnit === "mg" ? "0.1" : "10"}
                value={targetDoseInput}
                onChange={(e) => setTargetDoseInput(e.target.value)}
                className="w-full rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-2xs"
                placeholder="200"
                aria-label="Target assay dose"
              />
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                {(["mcg", "mg", "IU"] as const).map((unit) => {
                  if (unit === "IU" && !isIuCompound) return null
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => {
                        if (unit !== targetDoseUnit) {
                          const num = parseFloat(targetDoseInput) || 0
                          if (unit === "mg") {
                            setTargetDoseInput((num / 1000).toFixed(2))
                          } else if (unit === "mcg") {
                            setTargetDoseInput(Math.round(num * 1000).toString())
                          }
                          setTargetDoseUnit(unit)
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        targetDoseUnit === unit
                          ? "bg-sky-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {unit}
                    </button>
                  )
                })}
              </div>
            </div>
            {quickPresets.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">Presets:</span>
                {quickPresets.slice(0, 4).map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2-Station Visualizer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] gap-4 items-center mb-5">
          {/* Station 1: Dissolution Vial */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50/70 border border-slate-200 text-center">
            <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
              Dissolution Vial
            </div>
            <svg width="76" height="100" viewBox="0 0 76 100" fill="none" className="select-none">
              {/* Aluminum Crimp Cap & Neck */}
              <rect x="26" y="2" width="24" height="8" rx="2" fill="#94A3B8" stroke="#CBD5E1" strokeWidth="1" />
              <rect x="30" y="0" width="16" height="3" rx="1" fill="#64748B" />
              <rect
                x="29"
                y="10"
                width="18"
                height="8"
                fill="rgba(241, 245, 249, 0.8)"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              {/* Borosilicate Glass Vial Body */}
              <rect
                x="10"
                y="18"
                width="56"
                height="78"
                rx="8"
                fill="rgba(248, 250, 252, 0.85)"
                stroke="#94A3B8"
                strokeWidth="1.5"
              />
              {/* Lyophilized Cake Powder Line */}
              <rect x="14" y="80" width="48" height="12" rx="4" fill="#E2E8F0" />
              {/* Dynamic Reconstituted Solution Column */}
              <rect
                x="13"
                y={vialLiquidY}
                width="50"
                height={vialLiquidHeight}
                rx="5"
                fill={colors.main}
                fillOpacity="0.4"
                className="transition-all duration-300 ease-out"
              />
              {/* Glass Highlight Sheen */}
              <path d="M14 24 L14 88" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
              {/* Central Concentration Label Card */}
              <rect
                x="18"
                y="42"
                width="40"
                height="24"
                rx="2"
                fill="#FFFFFF"
                fillOpacity="0.95"
                stroke="#CBD5E1"
              />
              <text
                x="38"
                y="53"
                textAnchor="middle"
                fontSize="6.8"
                fontWeight="700"
                fill="#0284C7"
                fontFamily="'JetBrains Mono', monospace"
              >
                {activeConcMgMl.toFixed(1)} {isHmg ? "IU/mL" : "mg/mL"}
              </text>
              <text
                x="38"
                y="61"
                textAnchor="middle"
                fontSize="6"
                fill="#64748B"
                fontFamily="'JetBrains Mono', monospace"
              >
                {diluentMl.toFixed(1)} mL
              </text>
            </svg>
            <div className="text-[11px] font-bold font-mono text-slate-800 mt-2">
              {vialSummaryText}
            </div>
          </div>

          {/* Station 2: Precision Syringe Barrel & Plunger */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  Syringe: {barrelCapacity} U ({barrelCapacity === 30 ? "0.3 mL Micro" : barrelCapacity === 50 ? "0.5 mL Standard" : "1.0 mL Workhorse"})
                </span>
                {/* Barrel capacity selector pills */}
                <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 text-[10px] font-mono font-bold shadow-2xs">
                  {(
                    [
                      { cap: 30, label: "30 U" },
                      { cap: 50, label: "50 U" },
                      { cap: 100, label: "100 U" },
                    ] as const
                  ).map(({ cap, label }) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setBarrelCapacity(cap)}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        barrelCapacity === cap
                          ? "bg-sky-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-700">
                {units.toFixed(1)} Units ({volumeMl.toFixed(3)} mL)
              </span>
            </div>

            <svg className="w-full h-auto block select-none max-h-[110px]" viewBox="0 0 520 70">
              <defs>
                <linearGradient id={fluidGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors.main} stopOpacity="0.75" />
                  <stop offset="100%" stopColor={colors.dark} stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id={needleGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F1F5F9" />
                  <stop offset="50%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>

              {/* 31G Needle Cannula & Hub (x=8 to x=80) */}
              <line
                x1="8"
                y1="35"
                x2="48"
                y2="35"
                stroke={`url(#${needleGradId})`}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <polygon points="48,27 68,31 68,39 48,43" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
              <rect x="68" y="30" width="12" height="10" rx="1" fill="#CBD5E1" />

              {/* Barrel Body: Length=400px (x=80 to x=480) - Clear Medical Glass */}
              <rect
                x="80"
                y="16"
                width="400"
                height="38"
                rx="3"
                fill="rgba(255, 255, 255, 0.85)"
                stroke="#94A3B8"
                strokeWidth="1.5"
              />

              {/* Fluid Column inside barrel */}
              <rect
                x="80"
                y="17"
                width={fluidWidth}
                height="36"
                fill={`url(#${fluidGradId})`}
                className="transition-all duration-150 ease-out"
              />

              {/* Rubber Piston Plunger Assembly */}
              <g
                transform={`translate(${plungerX}, 0)`}
                className="transition-transform duration-150 ease-out"
              >
                <rect x="0" y="17" width="8" height="36" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
                <rect x="8" y="21" width="6" height="28" fill="#334155" />
                <rect x="14" y="17" width="7" height="36" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
                <rect x="21" y="32" width="70" height="6" fill="#94A3B8" />
                <line x1="21" y1="35" x2="91" y2="35" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="91" y="20" width="6" height="30" rx="2" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
                {/* Alignment Red Dashed Vertical Guide */}
                <line x1="0" y1="8" x2="0" y2="62" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 1" />
              </g>

              {/* Dynamic Graduation Ticks on Barrel */}
              <g stroke="#334155" strokeWidth="1">
                {barrelTicks.map((tick, idx) => (
                  <React.Fragment key={idx}>
                    <line
                      x1={tick.x}
                      y1="16"
                      x2={tick.x}
                      y2={tick.isMajor ? "30" : tick.isMedium ? "26" : "22"}
                      stroke={tick.isMajor ? (tick.val === barrelCapacity / 2 ? "#0284C7" : "#0F172A") : "#475569"}
                      strokeWidth={tick.isMajor ? "1.2" : "0.8"}
                    />
                    {tick.label && (
                      <text
                        x={tick.x}
                        y="12"
                        fontSize={tick.isMajor ? "7.5" : "6.5"}
                        fontWeight={tick.val === barrelCapacity / 2 ? "700" : "600"}
                        fontFamily="'JetBrains Mono', monospace"
                        fill={tick.val === barrelCapacity / 2 ? "#0284C7" : "#0F172A"}
                        textAnchor="middle"
                      >
                        {tick.label}
                      </text>
                    )}
                  </React.Fragment>
                ))}
                <rect x="480" y="8" width="6" height="54" rx="2" fill="#CBD5E1" stroke="#94A3B8" />
              </g>

              {/* Meniscus Indicator Badge */}
              <g
                transform={`translate(${plungerX}, 0)`}
                className="transition-transform duration-150 ease-out"
              >
                <rect x="-18" y="56" width="36" height="13" rx="3" fill="#DC2626" />
                <text
                  x="0"
                  y="65"
                  fontSize="7"
                  fontWeight="800"
                  fontFamily="'JetBrains Mono', monospace"
                  fill="#FFFFFF"
                  textAnchor="middle"
                >
                  {units.toFixed(1)} U
                </text>
              </g>
            </svg>

            {/* Interactive Range Slider */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[11px] font-bold font-mono text-slate-500">0 U</span>
              <input
                type="range"
                min="0"
                max={barrelCapacity}
                step={barrelCapacity === 30 ? 0.25 : 0.5}
                value={Math.min(barrelCapacity, Math.max(0, units))}
                onChange={handleSliderChange}
                className="h-2 flex-1 rounded-lg bg-slate-200 accent-[#0284C7] cursor-pointer"
                aria-label={`Calibrated U-${barrelCapacity} syringe units slider`}
              />
              <span className="text-[11px] font-bold font-mono text-slate-500">{barrelCapacity} U</span>
            </div>

            {/* Over-capacity and Accuracy Advice Callouts */}
            {isOverBarrel && (
              <div className="mt-2.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>
                    Target draw (<strong>{units.toFixed(1)} Units</strong>) exceeds {barrelCapacity} U capacity.
                  </span>
                </div>
                {barrelCapacity < 100 && (
                  <button
                    type="button"
                    onClick={() => setBarrelCapacity(100)}
                    className="shrink-0 px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-[11px] font-bold text-white transition-colors cursor-pointer"
                  >
                    Expand to 100 U Barrel →
                  </button>
                )}
              </div>
            )}

            {units > 0 && units <= 25 && barrelCapacity === 100 && (
              <div className="mt-2.5 rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs text-sky-900 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span>💡</span>
                  <span>
                    <strong>Micro-Dose Accuracy:</strong> Low draw ({units.toFixed(1)} U). A 30 U (0.3 mL) barrel provides 3× optical tick resolution.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBarrelCapacity(30)}
                  className="shrink-0 px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-700 text-[11px] font-bold text-white transition-colors cursor-pointer"
                >
                  Use 30 U Barrel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4 Real-Time Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Card 1: Selected Dose */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-center shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Selected Dose
            </div>
            <div className="text-sm sm:text-base font-extrabold font-mono text-sky-700">
              {formattedDoseString}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
              {formattedDoseSub}
            </div>
          </div>

          {/* Card 2: Injection Volume */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-center shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Injection Volume
            </div>
            <div className="text-sm sm:text-base font-extrabold font-mono text-slate-900">
              {volumeMl.toFixed(3)} mL
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {(volumeMl * 1000).toFixed(0)} µL draw
            </div>
          </div>

          {/* Card 3: U-100 Syringe Mark */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-center shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              U-100 Syringe Mark
            </div>
            <div className="text-sm sm:text-base font-extrabold font-mono text-rose-600">
              {units.toFixed(1)} Units
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Barrel Graduation
            </div>
          </div>

          {/* Card 4: Single Vial Yield */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-center shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Single Vial Yield
            </div>
            <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-700">
              ~{totalDoses < 1 ? "<1" : totalDoses.toFixed(1)} Doses
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate" title={effectiveCadence}>
              {totalDoses > 0 && effectiveCadence
                ? `${Math.round(totalDoses)} days at ${effectiveCadence}`
                : "Protocol Supply"}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2A. CLINICAL TRIAL TITRATION & ESCALATION PROTOCOLS ── */}
      {availableSchedules.length > 0 && activeScheduleItem && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-sm print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Clinical Trial Titration &amp; Escalation Schedules
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Benchmark protocols from peer-reviewed clinical trials &amp; institutional investigational programs.
              </p>
            </div>

            {/* Trial Switcher Tabs */}
            {availableSchedules.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                {availableSchedules.map((sched, idx) => (
                  <button
                    key={sched.id}
                    type="button"
                    onClick={() => setSelectedScheduleIdx(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedScheduleIdx === idx
                        ? "bg-sky-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {sched.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trial Metadata Badge Bar */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-bold text-sky-700 font-mono">{activeScheduleItem.label}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Target: {effectiveCompoundName}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">{effectiveCadence}</span>
          </div>

          {/* Titration Ladder Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-900">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Escalation Stage &amp; Phase</th>
                  <th className="py-2.5 px-3">Target Dose</th>
                  <th className="py-2.5 px-3">U-100 Mark ({vialMg}mg / {diluentMl.toFixed(1)}mL)</th>
                  <th className="py-2.5 px-3">Cadence</th>
                  <th className="py-2.5 px-3 text-right">Syringe Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {activeScheduleItem.schedule.map((row, idx) => {
                  const calculatedDoseMl = activeConcMgMl > 0 ? row.doseMg / activeConcMgMl : 0
                  const calculatedUnits = calculatedDoseMl * 100
                  const isCurrentActive = Math.abs(activeDoseMcg - row.doseMg * 1000) < 1

                  return (
                    <tr
                      key={idx}
                      className={`transition-colors hover:bg-sky-50/80 ${
                        isCurrentActive ? "bg-sky-50/90 font-bold text-slate-950" : "text-slate-700"
                      }`}
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                        {row.phase}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {row.doseDisplay || (row.doseMg >= 1 ? `${row.doseMg} mg` : `${row.doseMg * 1000} µg`)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-sky-700">
                          {calculatedUnits.toFixed(1)} Units
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1.5 font-sans">
                          ({calculatedDoseMl.toFixed(2)} mL)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[10px] font-sans">
                        {row.cadence || effectiveCadence}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (row.doseMg >= 1) {
                              setTargetDoseUnit("mg")
                              setTargetDoseInput(row.doseMg.toString())
                            } else {
                              setTargetDoseUnit("mcg")
                              setTargetDoseInput((row.doseMg * 1000).toString())
                            }
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold font-sans cursor-pointer transition-all ${
                            isCurrentActive
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                          }`}
                        >
                          {isCurrentActive ? "Active in Syringe" : "Set Syringe"}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Supply Requirements BOM (12-Week vs 24-Week) */}
          {supplyCalculations && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Reagent &amp; Consumables Supply Inventory Planning
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Based on {vialMg}mg vial strength &amp; {activeScheduleItem.label}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 12-Week */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold text-sky-700 text-xs">12-Week Initiation &amp; Escalation Cycle</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Total: {supplyCalculations.cycle12.totalMg.toFixed(1)} mg
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Active Vials ({vialMg}mg):</span>
                      <strong className="font-mono text-slate-900 text-xs">{supplyCalculations.cycle12.vialsRequired} vials</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Sterile Syringes:</span>
                      <strong className="font-mono text-sky-700 text-xs">{supplyCalculations.cycle12.totalSyringes} U-100</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">BAC Water (10mL):</span>
                      <strong className="font-mono text-emerald-700 text-xs">{supplyCalculations.cycle12.bacBottlesRequired} bottles</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Alcohol Swabs:</span>
                      <strong className="font-mono text-slate-700 text-xs">{supplyCalculations.cycle12.alcoholSwabs} pads</strong>
                    </div>
                  </div>
                </div>

                {/* 24-Week */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="font-bold text-emerald-800 text-xs">24-Week Comprehensive Extended Cycle</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Total: {supplyCalculations.cycle24.totalMg.toFixed(1)} mg
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Active Vials ({vialMg}mg):</span>
                      <strong className="font-mono text-slate-900 text-xs">{supplyCalculations.cycle24.vialsRequired} vials</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Sterile Syringes:</span>
                      <strong className="font-mono text-sky-700 text-xs">{supplyCalculations.cycle24.totalSyringes} U-100</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">BAC Water (10mL):</span>
                      <strong className="font-mono text-emerald-700 text-xs">{supplyCalculations.cycle24.bacBottlesRequired} bottles</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Alcohol Swabs:</span>
                      <strong className="font-mono text-slate-700 text-xs">{supplyCalculations.cycle24.alcoholSwabs} pads</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. STANDARD U-100 INSULIN SYRINGE GRADUATION MARK TABLE ── */}
      {!hideTitrationTable && (
        <div className="space-y-2.5 print:hidden">
          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-slate-900 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-600" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">{effectiveSyringeType}</span>
            </div>
            <span className="text-xs font-mono font-bold text-sky-700">
              Target: {effectiveStandardIUDisplay || `${units.toFixed(1)} Units (${volumeMl.toFixed(2)} mL)`}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-900">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4" style={{ width: "35%" }}>
                    Research Dose
                  </th>
                  <th className="py-2.5 px-4" style={{ width: "25%" }}>
                    Volume (mL)
                  </th>
                  <th className="py-2.5 px-4" style={{ width: "40%" }}>
                    U-100 Syringe Graduation Mark
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {displayGraduations.map((g, idx) => {
                  const isMatch = Math.abs(units - g.syringeIU) < 0.5
                  return (
                    <tr
                      key={idx}
                      onClick={() => handleRowClick(g)}
                      className={`transition-colors cursor-pointer hover:bg-sky-50/80 ${
                        isMatch ? "bg-sky-50/90 text-slate-950 font-bold" : "text-slate-700"
                      }`}
                    >
                      <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        {isMatch && <span className="h-1.5 w-1.5 rounded-full bg-sky-600 shrink-0" />}
                        <span>{g.doseDisplay}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                        {g.volumeMl.toFixed(g.volumeMl < 0.1 ? 3 : 2)} mL
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-block font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[11px]">
                          {g.syringeIU} Units
                        </span>
                        {g.tickLabel && (
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5 font-normal">
                            {g.tickLabel}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 3. CALIBRATED HARDWARE & INSTRUMENT SPECIFICATION CARD ── */}
      {!hideHardwareSpec && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm print:hidden">
          <div className="flex items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Calibrated Administration Instrument &amp; Needle Hardware Specification
              </span>
            </div>
            <span className="rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-800">
              RUO Standard
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Aliquoting Needle</div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                {effectiveNeedleGauge} × {effectiveNeedleLength}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Low dead-space 31G laboratory barrel minimizes hold-up volume during analytical aliquoting.</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Hub &amp; Dead Space Retention</div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1 truncate" title={effectiveHubType}>
                {effectiveHubType}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Ultra-low dead space prevents peptide loss</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Recommended Precision Barrel</div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1 truncate" title={effectiveRecommendedBarrel}>
                {effectiveRecommendedBarrel}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">High-resolution micro-dose calibrations</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Reconstitution Transfer Needle</div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1 truncate" title={effectiveTransferNeedle}>
                {effectiveTransferNeedle}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sterile diluent transfer down glass wall</div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. PRINT-ONLY LABORATORY RECONSTITUTION & SYRINGE CALIBRATION DOSSIER ── */}
      <div className="hidden print:block rounded-xl border-2 border-slate-900 p-4 mb-3 bg-white text-slate-900 print-break-inside-avoid">
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs uppercase tracking-wider text-slate-900">
              🔬 Analytical Reconstitution Stoichiometry &amp; Volumetric Calibration SOP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
              U-100 Micro-Plunger (100 U = 1.0 mL)
            </span>
            <span className="text-[9px] font-mono text-slate-600">Needle: {effectiveNeedleGauge}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 mb-3 text-center">
          <div className="p-2 rounded border border-slate-300 bg-slate-50">
            <span className="text-[8px] uppercase font-bold text-slate-600 block">Active Compound Mass</span>
            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
              {vialMg} {compoundMassUnit}
            </span>
            <span className="text-[7.5px] text-slate-500 block">Single Lyophilized Vial</span>
          </div>
          <div className="p-2 rounded border border-slate-300 bg-slate-50">
            <span className="text-[8px] uppercase font-bold text-slate-600 block">Diluent Volume Added</span>
            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
              {diluentMl.toFixed(1)} mL
            </span>
            <span className="text-[7.5px] text-slate-500 block">Bacteriostatic Water USP</span>
          </div>
          <div className="p-2 rounded border border-slate-300 bg-slate-50">
            <span className="text-[8px] uppercase font-bold text-slate-600 block">Resulting Concentration</span>
            <span className="font-mono font-bold text-emerald-800 text-xs sm:text-sm">
              {activeConcMgMl.toFixed(activeConcMgMl < 0.1 ? 3 : 2)} {isHmg ? "IU/mL" : "mg/mL"}
            </span>
            <span className="text-[7.5px] text-slate-500 block">Homogenized Solution</span>
          </div>
          <div className="p-2 rounded border border-slate-300 bg-slate-50">
            <span className="text-[8px] uppercase font-bold text-slate-600 block">Vial Yield</span>
            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
              ~{totalDoses < 1 ? "<1" : totalDoses.toFixed(1)} Doses
            </span>
            <span className="text-[7.5px] text-slate-500 block">Per Single Reconstituted Vial</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 p-2.5 rounded-lg border-2 border-sky-800 bg-sky-50 text-center">
          <div>
            <span className="text-[8.5px] uppercase font-bold text-sky-950 block">Target Analytical Dose</span>
            <span className="font-mono font-black text-sky-950 text-sm sm:text-base">
              {formattedDoseString}
            </span>
            <span className="text-[7.5px] text-slate-600 block font-mono">{formattedDoseSub}</span>
          </div>
          <div>
            <span className="text-[8.5px] uppercase font-bold text-sky-950 block">Volumetric Draw</span>
            <span className="font-mono font-black text-slate-900 text-sm sm:text-base">
              {volumeMl.toFixed(3)} mL ({Math.round(volumeMl * 1000)} µL)
            </span>
            <span className="text-[7.5px] text-slate-600 block font-mono">Calibrated Liquid Draw</span>
          </div>
          <div>
            <span className="text-[8.5px] uppercase font-bold text-rose-950 block">U-100 Syringe Graduation</span>
            <span className="font-mono font-black text-rose-700 text-sm sm:text-base">
              {units.toFixed(1)} Units
            </span>
            <span className="text-[7.5px] text-rose-800 block font-bold">Plunger Barrel Mark</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveSyringeStoichiometry
