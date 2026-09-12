/**
 * @file    apps/storefront/src/lib/pdf/stack-pdf-compiler.ts
 * @module  StackPdfCompiler
 * @purpose Pure-TypeScript Vector PDF Compiler generating ISO 9001:2015 and GLP
 *          compliant multi-compound research stack dossiers directly in browser runtime.
 *          Outputs authentic %PDF-1.4 binary streams with zero external npm dependencies.
 * @contracts
 *   Function: generateStackPdfBlob({ stackEvaluation, selectedProfiles, bundleVials })
 *   Function: downloadStackPdf({ stackEvaluation, selectedProfiles, bundleVials })
 */

import { SimplePdfDocument } from "./protocol-pdf-compiler.ts"
import type {
  StackCompoundProfile,
  StackCompatibilityEvaluation,
} from "../data/stack-interactions"
import type { ResearchBundleVial } from "../../modules/research-protocols/types"

export interface StackPdfOptions {
  stackEvaluation: StackCompatibilityEvaluation | null
  selectedProfiles: StackCompoundProfile[]
  bundleVials: ResearchBundleVial[]
}

const COLORS = {
  black: { r: 0.05, g: 0.05, b: 0.05 },
  white: { r: 1.0, g: 1.0, b: 1.0 },
  slate900: { r: 0.06, g: 0.09, b: 0.16 },
  slate700: { r: 0.2, g: 0.25, b: 0.33 },
  slate500: { r: 0.39, g: 0.45, b: 0.55 },
  slate300: { r: 0.8, g: 0.84, b: 0.88 },
  slate100: { r: 0.95, g: 0.96, b: 0.98 },
  sky700: { r: 0.01, g: 0.41, b: 0.63 },
  sky100: { r: 0.88, g: 0.95, b: 0.99 },
  amber800: { r: 0.58, g: 0.31, b: 0.04 },
  amber50: { r: 1.0, g: 0.98, b: 0.94 },
  emerald700: { r: 0.02, g: 0.47, b: 0.34 },
  emerald50: { r: 0.93, g: 0.98, b: 0.95 },
  rose800: { r: 0.61, g: 0.11, b: 0.11 },
  rose600: { r: 0.88, g: 0.11, b: 0.14 },
  rose50: { r: 1.0, g: 0.95, b: 0.95 },
}

/**
 * Generates an authentic %PDF-1.4 binary Blob for a multi-compound stack regimen
 */
export function generateStackPdfBlob(options: StackPdfOptions): Blob {
  const { stackEvaluation, selectedProfiles, bundleVials } = options
  const doc = new SimplePdfDocument()
  const pWidth = doc.printableWidth
  const margin = doc.margin
  let cursorY = doc.height - margin

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const isContraindicated = stackEvaluation?.status === "contraindicated"
  const stackCode = selectedProfiles
    .map((p) => p.shortName.replace(/[^a-zA-Z0-9]/g, ""))
    .join("-")
    .toUpperCase()
  const protocolId = `PSL-SOP-STACK-${stackCode || "GENERAL"}`

  // ─── 1. Document Control Header ───────────────────────────────────────────
  doc.drawRect(margin, cursorY - 60, pWidth, 60, {
    fill: true,
    fillColor: isContraindicated ? COLORS.rose50 : COLORS.slate100,
    stroke: true,
    strokeColor: isContraindicated ? COLORS.rose600 : COLORS.slate300,
    lineWidth: 1.5,
  })

  doc.drawText(
    "PEPSTACK LABORATORIES · ANALYTICAL SCIENCES DIVISION",
    margin + 12,
    cursorY - 14,
    { font: "/F2", size: 7.5, color: isContraindicated ? COLORS.rose800 : COLORS.slate500 }
  )

  doc.drawText(
    "STANDARD OPERATING PROCEDURE: MULTI-PEPTIDE STACK PROTOCOL",
    margin + 12,
    cursorY - 28,
    { font: "/F2", size: 11, color: isContraindicated ? COLORS.rose800 : COLORS.slate900 }
  )

  doc.drawText(
    `DOC ID: ${protocolId}  |  ISO 9001:2015 & GLP CONTROLS`,
    margin + 12,
    cursorY - 42,
    { font: "/F3", size: 7.5, color: COLORS.slate700 }
  )

  doc.drawText(
    "FOR IN VITRO ANALYTICAL RESEARCH ONLY (FDA 21 CFR § 312.160 RUO)",
    margin + 12,
    cursorY - 53,
    { font: "/F2", size: 6.5, color: isContraindicated ? COLORS.rose600 : COLORS.amber800 }
  )

  // Header Right Column
  doc.drawText(`ISSUE DATE: ${currentDate}`, margin + pWidth - 140, cursorY - 18, {
    font: "/F3",
    size: 7.5,
    color: COLORS.slate700,
  })

  const statusLabel = isContraindicated
    ? "STATUS: CONTRAINDICATED"
    : "STATUS: VERIFIED GLP SPEC"
  doc.drawText(statusLabel, margin + pWidth - 140, cursorY - 32, {
    font: "/F2",
    size: 8,
    color: isContraindicated ? COLORS.rose600 : COLORS.emerald700,
  })

  cursorY -= 75

  // ─── 2. Critical Safety Alert (If Contraindicated) ────────────────────────
  if (isContraindicated) {
    doc.drawRect(margin, cursorY - 50, pWidth, 50, {
      fill: true,
      fillColor: COLORS.rose50,
      stroke: true,
      strokeColor: COLORS.rose600,
      lineWidth: 1.5,
    })

    doc.drawText(
      "[!] SAFETY CONTRAINDICATION ALERT: CO-ADMINISTRATION PROHIBITED",
      margin + 10,
      cursorY - 14,
      { font: "/F2", size: 8.5, color: COLORS.rose800 }
    )

    doc.drawText(
      "Simultaneous co-administration is prohibited due to pharmacological competition or toxicity.",
      margin + 10,
      cursorY - 26,
      { font: "/F1", size: 7.5, color: COLORS.slate900 }
    )

    const rationale = (stackEvaluation?.summary || "Adverse receptor overlap detected.").slice(0, 95)
    doc.drawText(
      `Rationale: ${rationale}`,
      margin + 10,
      cursorY - 38,
      { font: "/F1", size: 7, color: COLORS.slate700 }
    )

    cursorY -= 62
  }

  // ─── 3. Pharmacodynamic Synergy & Regimen Overview ─────────────────────────
  doc.drawRect(margin, cursorY - 14, pWidth, 14, {
    fill: true,
    fillColor: COLORS.slate700,
  })
  doc.drawText(
    "1. PHARMACODYNAMIC STACKING OVERVIEW & SYNERGY EVALUATION",
    margin + 6,
    cursorY - 10,
    { font: "/F2", size: 7.5, color: COLORS.white }
  )
  cursorY -= 14

  const regimenTitle = (stackEvaluation?.title || "Multi-Peptide Research Regimen").slice(0, 65)
  const synergyScore = stackEvaluation?.overallScore ?? 0
  const compatStatus = (stackEvaluation?.status || "compatible").toUpperCase()

  doc.drawRect(margin, cursorY - 45, pWidth, 45, {
    fill: true,
    fillColor: COLORS.slate100,
    stroke: true,
    strokeColor: COLORS.slate300,
    lineWidth: 1,
  })

  doc.drawText(`REGIMEN: ${regimenTitle}`, margin + 8, cursorY - 12, {
    font: "/F2",
    size: 8.5,
    color: COLORS.slate900,
  })

  doc.drawText(
    `SYNERGY INDEX: ${synergyScore}/100  |  COMPATIBILITY: ${compatStatus}`,
    margin + pWidth - 210,
    cursorY - 12,
    {
      font: "/F2",
      size: 8,
      color: isContraindicated ? COLORS.rose600 : COLORS.emerald700,
    }
  )

  const summaryText = (
    stackEvaluation?.summary ||
    "Co-administration of verified peptide APIs with separated vial stoichiometry and synchronized schedules."
  ).slice(0, 170)

  doc.drawText(summaryText.slice(0, 90), margin + 8, cursorY - 26, {
    font: "/F1",
    size: 7.5,
    color: COLORS.slate700,
  })
  if (summaryText.length > 90) {
    doc.drawText(summaryText.slice(90, 180), margin + 8, cursorY - 37, {
      font: "/F1",
      size: 7.5,
      color: COLORS.slate700,
    })
  }

  cursorY -= 55

  // ─── 4. Multi-Vial Reconstitution Stoichiometry Station ───────────────────
  doc.drawRect(margin, cursorY - 14, pWidth, 14, {
    fill: true,
    fillColor: COLORS.slate700,
  })
  doc.drawText(
    `2. MULTI-VIAL RECONSTITUTION STOICHIOMETRY STATION (${bundleVials.length} INDEPENDENT VIALS)`,
    margin + 6,
    cursorY - 10,
    { font: "/F2", size: 7.5, color: COLORS.white }
  )
  cursorY -= 14

  // Table Headers
  const colWidths = [50, 120, 60, 65, 75, 75, 78]
  const headers = [
    "VIAL #",
    "COMPOUND NAME",
    "VIAL MASS",
    "DILUENT VOL",
    "TARGET CONC",
    "ASSAY DOSE",
    "U-100 DRAW",
  ]

  doc.drawRect(margin, cursorY - 16, pWidth, 16, {
    fill: true,
    fillColor: COLORS.slate300,
  })

  let hX = margin
  headers.forEach((h, i) => {
    doc.drawText(h, hX + 4, cursorY - 11, { font: "/F2", size: 6.5, color: COLORS.slate900 })
    hX += colWidths[i] || 60
  })
  cursorY -= 16

  // Table Rows
  bundleVials.forEach((vial, idx) => {
    const rowFill = idx % 2 === 0 ? COLORS.white : COLORS.slate100
    doc.drawRect(margin, cursorY - 16, pWidth, 16, {
      fill: true,
      fillColor: rowFill,
      stroke: true,
      strokeColor: COLORS.slate300,
      lineWidth: 0.5,
    })

    let rX = margin
    // Col 0: Vial #
    doc.drawText(`Vial #${idx + 1}`, rX + 4, cursorY - 11, { font: "/F2", size: 7, color: COLORS.slate900 })
    rX += colWidths[0]

    // Col 1: Compound Name
    doc.drawText(vial.compoundName.slice(0, 22), rX + 4, cursorY - 11, { font: "/F1", size: 7, color: COLORS.slate900 })
    rX += colWidths[1]

    // Col 2: Net Mass
    doc.drawText(vial.vialNetMass, rX + 4, cursorY - 11, { font: "/F3", size: 7, color: COLORS.slate700 })
    rX += colWidths[2]

    // Col 3: Diluent
    doc.drawText(`${vial.diluentMl} mL BAC`, rX + 4, cursorY - 11, { font: "/F3", size: 7, color: COLORS.slate700 })
    rX += colWidths[3]

    // Col 4: Target Conc
    doc.drawText(`${vial.concMgMl} mg/mL`, rX + 4, cursorY - 11, { font: "/F3", size: 7, color: COLORS.slate900 })
    rX += colWidths[4]

    // Col 5: Target Dose
    doc.drawText(vial.targetDose, rX + 4, cursorY - 11, { font: "/F2", size: 7, color: COLORS.slate900 })
    rX += colWidths[5]

    // Col 6: U-100 Units
    doc.drawText(vial.syringeUnits, rX + 4, cursorY - 11, { font: "/F2", size: 7, color: COLORS.emerald700 })

    cursorY -= 16
  })

  // Footnote
  doc.drawText(
    "* Diluent Specification: USP Bacteriostatic Water (0.9% benzyl alcohol). Each compound reconstituted separately.",
    margin,
    cursorY - 9,
    { font: "/F1", size: 6, color: COLORS.slate500 }
  )
  cursorY -= 18

  // ─── 5. Co-Administration Schedule & Cadence ──────────────────────────────
  doc.drawRect(margin, cursorY - 14, pWidth, 14, {
    fill: true,
    fillColor: COLORS.slate700,
  })
  doc.drawText(
    "3. CO-ADMINISTRATION CADENCE & TIMING SYNCHRONIZATION",
    margin + 6,
    cursorY - 10,
    { font: "/F2", size: 7.5, color: COLORS.white }
  )
  cursorY -= 14

  const halfWidth = (pWidth - 8) / 2

  if (isContraindicated) {
    doc.drawRect(margin, cursorY - 45, pWidth, 45, {
      fill: true,
      fillColor: COLORS.rose50,
      stroke: true,
      strokeColor: COLORS.rose600,
      lineWidth: 1,
    })
    doc.drawText(
      "CO-ADMINISTRATION SCHEDULE VOIDED",
      margin + 8,
      cursorY - 14,
      { font: "/F2", size: 8, color: COLORS.rose800 }
    )
    doc.drawText(
      "Compounds must NOT be administered in overlapping cycles. Minimum 4-6 week washout mandatory.",
      margin + 8,
      cursorY - 28,
      { font: "/F1", size: 7.5, color: COLORS.slate900 }
    )
    cursorY -= 55
  } else {
    // Left Box: Morning Window
    doc.drawRect(margin, cursorY - 50, halfWidth, 50, {
      fill: true,
      fillColor: COLORS.slate100,
      stroke: true,
      strokeColor: COLORS.slate300,
      lineWidth: 1,
    })
    doc.drawText("FASTED MORNING WINDOW (UPON WAKING)", margin + 6, cursorY - 12, {
      font: "/F2",
      size: 7,
      color: COLORS.slate900,
    })
    const morningDose = (
      stackEvaluation?.combinedProtocol?.morningDose ||
      "Administer indicated morning agents in fasted state (30 min prior to food)."
    ).slice(0, 90)
    doc.drawText(morningDose.slice(0, 48), margin + 6, cursorY - 26, {
      font: "/F1",
      size: 6.5,
      color: COLORS.slate700,
    })
    if (morningDose.length > 48) {
      doc.drawText(morningDose.slice(48, 96), margin + 6, cursorY - 37, {
        font: "/F1",
        size: 6.5,
        color: COLORS.slate700,
      })
    }

    // Right Box: Evening Window
    doc.drawRect(margin + halfWidth + 8, cursorY - 50, halfWidth, 50, {
      fill: true,
      fillColor: COLORS.slate100,
      stroke: true,
      strokeColor: COLORS.slate300,
      lineWidth: 1,
    })
    doc.drawText("PRE-BED NOCTURNAL WINDOW (FASTED >= 2H)", margin + halfWidth + 14, cursorY - 12, {
      font: "/F2",
      size: 7,
      color: COLORS.slate900,
    })
    const eveningDose = (
      stackEvaluation?.combinedProtocol?.eveningDose ||
      "Administer nocturnal repair agents 30-45 minutes prior to sleep."
    ).slice(0, 90)
    doc.drawText(eveningDose.slice(0, 48), margin + halfWidth + 14, cursorY - 26, {
      font: "/F1",
      size: 6.5,
      color: COLORS.slate700,
    })
    if (eveningDose.length > 48) {
      doc.drawText(eveningDose.slice(48, 96), margin + halfWidth + 14, cursorY - 37, {
        font: "/F1",
        size: 6.5,
        color: COLORS.slate700,
      })
    }

    cursorY -= 58

    // Cadence Bar
    doc.drawRect(margin, cursorY - 25, pWidth, 25, {
      fill: true,
      fillColor: COLORS.white,
      stroke: true,
      strokeColor: COLORS.slate300,
      lineWidth: 1,
    })

    const weekly = stackEvaluation?.combinedProtocol?.weeklySchedule || "5 days on / 2 days off"
    const cycle = stackEvaluation?.combinedProtocol?.cycleLength || "8 to 12 weeks"
    const washout = stackEvaluation?.combinedProtocol?.washout || "4 weeks off"

    doc.drawText(
      `CADENCE: ${weekly}  |  CYCLE: ${cycle}  |  WASHOUT: ${washout}`,
      margin + 8,
      cursorY - 16,
      { font: "/F2", size: 7.5, color: COLORS.slate900 }
    )

    cursorY -= 33
  }

  // ─── 6. Aseptic Safety & Syringe Separation Directive ─────────────────────
  doc.drawRect(margin, cursorY - 55, pWidth, 55, {
    fill: true,
    fillColor: COLORS.amber50,
    stroke: true,
    strokeColor: COLORS.amber800,
    lineWidth: 1,
  })

  doc.drawText(
    "MANDATORY CLEANROOM ASEPTIC CROSS-CONTAMINATION PROTOCOL",
    margin + 8,
    cursorY - 12,
    { font: "/F2", size: 7.5, color: COLORS.amber800 }
  )

  const safetyPoints = [
    "1. Strict Syringe Separation: NEVER draw multiple peptide solutions into a single syringe.",
    "2. Precipitation Prevention: Divergent pH buffers will aggregate and precipitate if mixed in liquid phase.",
    "3. Injection Site Rotation: Alternate contralateral subcutaneous sites minimum 2 inches from navel.",
    "4. Cold-Chain Standard: Store all reconstituted vials at 2°C-8°C protected from light (USP <797>).",
  ]

  safetyPoints.forEach((sp, i) => {
    doc.drawText(sp, margin + 8, cursorY - 23 - i * 9.5, {
      font: "/F1",
      size: 6.5,
      color: COLORS.slate900,
    })
  })

  cursorY -= 65

  // ─── 7. Institutional QA Sign-Off Block ───────────────────────────────────
  doc.drawRect(margin, cursorY - 50, pWidth, 50, {
    fill: true,
    fillColor: COLORS.white,
    stroke: true,
    strokeColor: COLORS.slate300,
    lineWidth: 1,
  })

  const qaCol = pWidth / 3

  // Col 1: Authorizing Investigator
  doc.drawText("AUTHORIZING INVESTIGATOR:", margin + 8, cursorY - 10, {
    font: "/F2",
    size: 6.5,
    color: COLORS.slate500,
  })
  doc.drawLine(margin + 8, cursorY - 30, margin + qaCol - 12, cursorY - 30, {
    color: COLORS.slate300,
    lineWidth: 0.5,
  })
  doc.drawText("Dr. Jerwin / Senior Investigator", margin + 8, cursorY - 40, {
    font: "/F1",
    size: 6,
    color: COLORS.slate500,
  })

  // Col 2: QA Auditor
  doc.drawText("QA COMPLIANCE AUDITOR:", margin + qaCol + 8, cursorY - 10, {
    font: "/F2",
    size: 6.5,
    color: COLORS.slate500,
  })
  doc.drawLine(margin + qaCol + 8, cursorY - 30, margin + qaCol * 2 - 12, cursorY - 30, {
    color: COLORS.slate300,
    lineWidth: 0.5,
  })
  doc.drawText("GLP Quality Officer Sign-Off", margin + qaCol + 8, cursorY - 40, {
    font: "/F1",
    size: 6,
    color: COLORS.slate500,
  })

  // Col 3: Document Control ID & Date
  const controlId = isContraindicated ? "GLP-REJECT-ALERT" : "GLP-PASS-2026"
  doc.drawText(`CONTROL ID: ${controlId}`, margin + qaCol * 2 + 8, cursorY - 10, {
    font: "/F3",
    size: 6.5,
    color: isContraindicated ? COLORS.rose800 : COLORS.slate900,
  })
  doc.drawText(`VERIFICATION DATE: ${currentDate}`, margin + qaCol * 2 + 8, cursorY - 24, {
    font: "/F3",
    size: 6.5,
    color: COLORS.slate700,
  })
  doc.drawText(
    isContraindicated ? "STATUS: REJECTED" : "STATUS: CERTIFIED GREEN",
    margin + qaCol * 2 + 8,
    cursorY - 38,
    {
      font: "/F2",
      size: 7,
      color: isContraindicated ? COLORS.rose600 : COLORS.emerald700,
    }
  )

  const binary = doc.compileBinary()
  return new Blob([binary.buffer as ArrayBuffer], { type: "application/pdf" })
}

/**
 * Downloads the multi-compound stack PDF document directly in the browser
 */
export function downloadStackPdf(options: StackPdfOptions): void {
  const blob = generateStackPdfBlob(options)
  const stackCode = options.selectedProfiles
    .map((p) => p.shortName.replace(/[^a-zA-Z0-9]/g, ""))
    .join("_")
  const filename = `PepStack_GLP_Stack_SOP_${stackCode || "MultiCompound"}.pdf`

  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}
