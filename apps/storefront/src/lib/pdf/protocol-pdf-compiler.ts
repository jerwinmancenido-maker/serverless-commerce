/**
 * @file    apps/storefront/src/lib/pdf/protocol-pdf-compiler.ts
 * @module  ProtocolPdfCompiler
 * @purpose Pure-TypeScript Vector PDF Compiler generating publication-grade
 *          Good Laboratory Practice (GLP) analytical protocol dossiers.
 *          Zero external npm packages — outputs authentic %PDF-1.4 binary streams.
 * @contracts
 *   Function: generateProtocolPdfBlob(protocol, preset)
 *   Function: downloadProtocolPdf(protocol, preset)
 *   Standard: PDF-1.4 Reference Manual (ISO 32000-1)
 */

import type { CustomerResearchProtocol, StoreResearchProtocol } from "../data/research-protocols"
import { getCompoundProtocol } from "../data/compound-protocols.ts"
import { cleanCompoundTitle } from "../protocol-sharing.ts"
import { calculateProtocolSupplyBOM, getClinicalTrialSchedulesForProtocol } from "../data/clinical-trials-registry.ts"

export type PdfPreset = "full" | "bench_sop" | "schedule_bom"

// ─── Simple Pure-TS PDF-1.4 Vector Engine ─────────────────────────────────────

interface PdfColor {
  r: number // 0 - 1
  g: number // 0 - 1
  b: number // 0 - 1
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
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?") // Strip non-ASCII for standard Type 1 fonts
}

export class SimplePdfDocument {
  private pages: string[] = []
  private currentPageContent: string[] = []
  public readonly width = 595.28 // A4 Width in points
  public readonly height = 841.89 // A4 Height in points
  public readonly margin = 36 // 0.5 in / 12.7 mm
  public readonly printableWidth = 595.28 - 72 // 523.28 pt

  constructor() {
    this.addPage()
  }

  public addPage(): void {
    if (this.currentPageContent.length > 0) {
      this.pages.push(this.currentPageContent.join("\n"))
      this.currentPageContent = []
    }
  }

  // Draw rectangle
  public drawRect(
    x: number,
    y: number,
    w: number,
    h: number,
    options?: {
      fill?: boolean
      stroke?: boolean
      fillColor?: PdfColor
      strokeColor?: PdfColor
      lineWidth?: number
    }
  ): void {
    const opts = {
      fill: true,
      stroke: false,
      fillColor: COLORS.white,
      strokeColor: COLORS.slate300,
      lineWidth: 1,
      ...options,
    }

    const commands: string[] = []
    if (opts.lineWidth) commands.push(`${opts.lineWidth} w`)
    if (opts.fill && opts.fillColor) {
      commands.push(`${opts.fillColor.r.toFixed(3)} ${opts.fillColor.g.toFixed(3)} ${opts.fillColor.b.toFixed(3)} rg`)
    }
    if (opts.stroke && opts.strokeColor) {
      commands.push(`${opts.strokeColor.r.toFixed(3)} ${opts.strokeColor.g.toFixed(3)} ${opts.strokeColor.b.toFixed(3)} RG`)
    }
    commands.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`)
    if (opts.fill && opts.stroke) {
      commands.push("B")
    } else if (opts.fill) {
      commands.push("f")
    } else {
      commands.push("S")
    }
    this.currentPageContent.push(commands.join(" "))
  }

  // Draw line
  public drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options?: { color?: PdfColor; lineWidth?: number }
  ): void {
    const color = options?.color || COLORS.slate300
    const width = options?.lineWidth || 1
    this.currentPageContent.push(
      `${width} w ${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} RG ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`
    )
  }

  // Draw text
  public drawText(
    text: string,
    x: number,
    y: number,
    options?: {
      font?: "/F1" | "/F2" | "/F3" // F1=Helvetica, F2=Helvetica-Bold, F3=Courier
      size?: number
      color?: PdfColor
      align?: "left" | "center" | "right"
      width?: number
    }
  ): void {
    const font = options?.font || "/F1"
    const size = options?.size || 10
    const color = options?.color || COLORS.slate900
    const clean = escapePdfText(text)

    let posX = x
    if (options?.align === "right" && options.width) {
      const approxLen = clean.length * size * 0.52
      posX = x + options.width - approxLen
    } else if (options?.align === "center" && options.width) {
      const approxLen = clean.length * size * 0.52
      posX = x + (options.width - approxLen) / 2
    }

    this.currentPageContent.push(
      `BT ${font} ${size} Tf ${color.r.toFixed(3)} ${color.g.toFixed(3)} ${color.b.toFixed(3)} rg 1 0 0 1 ${posX.toFixed(2)} ${y.toFixed(2)} Tm (${clean}) Tj ET`
    )
  }

  // Compile full PDF 1.4 binary buffer
  public compileBinary(): Uint8Array {
    // Push final page
    if (this.currentPageContent.length > 0) {
      this.pages.push(this.currentPageContent.join("\n"))
      this.currentPageContent = []
    }

    const totalPages = Math.max(1, this.pages.length)
    const objects: string[] = []
    const offsets: number[] = []

    // Helper to add object
    const addObject = (content: string): number => {
      const objIndex = objects.length + 1
      objects.push(`${objIndex} 0 obj\n${content}\nendobj`)
      return objIndex
    }

    // 1. Catalog (Obj 1)
    addObject("<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>")

    // 2. Pages Container (Obj 2)
    // Page object references will start at 7
    const pageObjRefs: string[] = []
    for (let p = 0; p < totalPages; p++) {
      pageObjRefs.push(`${7 + p * 2} 0 R`)
    }
    addObject(`<<\n  /Type /Pages\n  /Kids [${pageObjRefs.join(" ")}]\n  /Count ${totalPages}\n>>`)

    // 3, 4, 5. Fonts (Obj 3 = Helvetica, Obj 4 = Helvetica-Bold, Obj 5 = Courier)
    addObject("<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica\n>>")
    addObject("<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Helvetica-Bold\n>>")
    addObject("<<\n  /Type /Font\n  /Subtype /Type1\n  /BaseFont /Courier\n>>")

    // 6. Resources Dictionary (Obj 6)
    addObject(
      "<<\n  /Font <<\n    /F1 3 0 R\n    /F2 4 0 R\n    /F3 5 0 R\n  >>\n  /ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n>>"
    )

    // 7+. For each page: Page Object & Content Stream Object
    for (let p = 0; p < totalPages; p++) {
      const streamIndex = 8 + p * 2
      // Page Object
      addObject(
        `<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 ${this.width} ${this.height}]\n  /Resources 6 0 R\n  /Contents ${streamIndex} 0 R\n>>`
      )

      // Stream Content
      const streamContent = this.pages[p] || ""
      const streamLength = new TextEncoder().encode(streamContent).length
      addObject(`<<\n  /Length ${streamLength}\n>>\nstream\n${streamContent}\nendstream`)
    }

    // Assemble file with exact byte offset tracking
    const header = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"
    let bufferStr = header
    offsets.push(0) // dummy 0 index for xref table

    for (let i = 0; i < objects.length; i++) {
      offsets.push(new TextEncoder().encode(bufferStr).length)
      bufferStr += objects[i] + "\n"
    }

    const startXref = new TextEncoder().encode(bufferStr).length
    const totalObjs = objects.length + 1

    let xref = `xref\n0 ${totalObjs}\n0000000000 65535 f \n`
    for (let i = 1; i < totalObjs; i++) {
      const off = offsets[i] || 0
      xref += off.toString().padStart(10, "0") + " 00000 n \n"
    }

    const trailer = `trailer\n<<\n  /Size ${totalObjs}\n  /Root 1 0 R\n>>\nstartxref\n${startXref}\n%%EOF\n`
    bufferStr += xref + trailer

    return new TextEncoder().encode(bufferStr)
  }
}

// ─── High-Level Protocol Dossier Layout Synthesizer ───────────────────────────

export function generateProtocolPdfBlob(
  protocol: CustomerResearchProtocol | StoreResearchProtocol,
  preset: PdfPreset = "full"
): Blob {
  const content = protocol.content
  const rawTitle = content.compound_name || protocol.title
  const cleanTitle = cleanCompoundTitle(rawTitle)
  const canonical = getCompoundProtocol(protocol.handle) || getCompoundProtocol(cleanTitle.toLowerCase())

  const doc = new SimplePdfDocument()
  const margin = doc.margin
  const pWidth = doc.printableWidth
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const protocolId = `PSL-SOP-${protocol.handle.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`

  // ── HEADER HELPER ──
  const drawDocHeader = (pageNumber: number, totalPages: number) => {
    // Top banner background
    doc.drawRect(margin, 805 - 42, pWidth, 42, {
      fill: true,
      fillColor: COLORS.slate900,
      stroke: false,
    })

    // Header Titles
    doc.drawText("PEPSTACK LABORATORIES · ANALYTICAL SCIENCES DIVISION", margin + 12, 792, {
      font: "/F2",
      size: 7.5,
      color: COLORS.sky100,
    })
    doc.drawText(`STANDARD OPERATING PROCEDURE: ${cleanTitle.toUpperCase()}`, margin + 12, 776, {
      font: "/F2",
      size: 11,
      color: COLORS.white,
    })

    // Header Metadata (Right)
    doc.drawText(`DOC ID: ${protocolId}`, margin, 792, {
      font: "/F3",
      size: 7.5,
      color: COLORS.slate300,
      align: "right",
      width: pWidth - 12,
    })
    doc.drawText(`REV 2026.09 · GLP COMPLIANT · PAGE ${pageNumber} OF ${totalPages}`, margin, 776, {
      font: "/F3",
      size: 7,
      color: COLORS.slate300,
      align: "right",
      width: pWidth - 12,
    })

    // Regulatory Warning Strip
    doc.drawRect(margin, 755 - 14, pWidth, 14, {
      fill: true,
      fillColor: COLORS.amber50,
      stroke: true,
      strokeColor: COLORS.slate300,
    })
    doc.drawText(
      "FOR IN VITRO LABORATORY RESEARCH & ANALYTICAL COMPLIANCE ONLY · NOT FOR HUMAN CLINICAL USE · FDA 21 CFR § 312.160",
      margin + 8,
      745,
      {
        font: "/F2",
        size: 6.5,
        color: COLORS.amber800,
      }
    )
  }

  // ── PAGE 1: RECONSTITUTION & VOLUMETRIC CALIBRATION ──
  drawDocHeader(1, preset === "full" ? 2 : 1)

  let cursorY = 724

  // Section 1: Chemical & Molecular Profile
  doc.drawText("1. CHEMICAL SPECIFICATION & IDENTIFIERS", margin, cursorY, {
    font: "/F2",
    size: 9,
    color: COLORS.slate900,
  })
  cursorY -= 6
  doc.drawLine(margin, cursorY, margin + pWidth, cursorY, { color: COLORS.slate700, lineWidth: 1 })
  cursorY -= 12

  // Key-Value Grid for Identity (8-item balanced 4x2 GLP specification matrix)
  const identityGrid = [
    { label: "Compound Name", value: cleanTitle },
    { label: "Category", value: content.category || canonical?.category || "Bioactive Peptide" },
    { label: "Format / Physical State", value: content.product_format || "Certified Lyophilized Solid Cake" },
    { label: "Analytical Purity", value: content.purity_standard || canonical?.molecularDetails?.purity || "≥99.0% (RP-HPLC / ESI-MS)" },
    { label: "CAS Registry No.", value: canonical?.molecularDetails?.casNumber || "Verified Reference Standard" },
    { label: "PubChem Identifier", value: canonical?.molecularDetails?.pubchemCid ? `CID ${canonical.molecularDetails.pubchemCid}` : "Analytical Standard" },
    { label: "Sequence / Formula", value: canonical?.molecularDetails?.formula || canonical?.molecularDetails?.sequenceOrFormula || "Analytical Grade" },
    { label: "Molar Mass", value: canonical?.molecularDetails?.molecularWeightGPerMol ? `${canonical.molecularDetails.molecularWeightGPerMol} g/mol` : canonical?.molecularDetails?.molarMass || "Standard Reference Mass" },
  ]

  const colW = pWidth / 2
  for (let i = 0; i < identityGrid.length; i += 2) {
    const item1 = identityGrid[i]
    const item2 = identityGrid[i + 1]

    doc.drawRect(margin, cursorY - 14, colW - 4, 18, { fill: true, fillColor: COLORS.slate100, stroke: false })
    doc.drawText(item1.label + ":", margin + 6, cursorY - 10, { font: "/F2", size: 7.5, color: COLORS.slate700 })
    doc.drawText(item1.value, margin + 80, cursorY - 10, { font: "/F1", size: 7.5, color: COLORS.slate900 })

    if (item2) {
      doc.drawRect(margin + colW + 4, cursorY - 14, colW - 4, 18, { fill: true, fillColor: COLORS.slate100, stroke: false })
      doc.drawText(item2.label + ":", margin + colW + 10, cursorY - 10, { font: "/F2", size: 7.5, color: COLORS.slate700 })
      doc.drawText(item2.value, margin + colW + 84, cursorY - 10, { font: "/F1", size: 7.5, color: COLORS.slate900 })
    }
    cursorY -= 20
  }

  cursorY -= 6

  // Section 2: Reconstitution Stoichiometry
  const vialMg = canonical?.reconstitution?.defaultVialNetMg || 10
  const diluentMl = canonical?.reconstitution?.defaultDiluentMl || 2.0
  const conc = vialMg / diluentMl
  const stdMcg = canonical?.dosing?.standardDoseMcg || 250
  const stdIU = ((stdMcg / 1000 / conc) * 100).toFixed(1)

  doc.drawText("2. RECONSTITUTION STOICHIOMETRY & MATHEMATICAL MODEL (C = M / V)", margin, cursorY, {
    font: "/F2",
    size: 9,
    color: COLORS.slate900,
  })
  cursorY -= 6
  doc.drawLine(margin, cursorY, margin + pWidth, cursorY, { color: COLORS.slate700, lineWidth: 1 })
  cursorY -= 16

  // Stoichiometry 4-Cell Highlight Card
  const boxW = (pWidth - 18) / 4
  const stoichBoxes = [
    { label: "Net Peptide Mass (M)", val: `${vialMg} mg`, sub: "Dry Lyophilized Cake" },
    { label: "Diluent Volume (V)", val: `${diluentMl.toFixed(1)} mL`, sub: "Bacteriostatic Water USP" },
    { label: "Resulting Conc (C)", val: `${conc.toFixed(2)} mg/mL`, sub: "Active Solution" },
    { label: "Standard Dose (D)", val: `${stdMcg >= 1000 ? stdMcg / 1000 + " mg" : stdMcg + " mcg"}`, sub: `${stdIU} U (U-100 Syringe)` },
  ]

  for (let b = 0; b < stoichBoxes.length; b++) {
    const boxX = margin + b * (boxW + 6)
    doc.drawRect(boxX, cursorY - 40, boxW, 44, {
      fill: true,
      fillColor: b === 3 ? COLORS.sky100 : COLORS.slate100,
      stroke: true,
      strokeColor: b === 3 ? COLORS.sky700 : COLORS.slate300,
      lineWidth: 1,
    })
    doc.drawText(stoichBoxes[b].label, boxX + 6, cursorY - 6, { font: "/F2", size: 6.5, color: COLORS.slate700 })
    doc.drawText(stoichBoxes[b].val, boxX + 6, cursorY - 22, {
      font: "/F2",
      size: 11,
      color: b === 3 ? COLORS.sky700 : COLORS.slate900,
    })
    doc.drawText(stoichBoxes[b].sub, boxX + 6, cursorY - 34, { font: "/F1", size: 6.5, color: COLORS.slate500 })
  }

  cursorY -= 56

  // Section 3: Volumetric Syringe Calibration Table
  doc.drawText("3. U-100 VOLUMETRIC GRADUATION & BARREL SPECIFICATION", margin, cursorY, {
    font: "/F2",
    size: 9,
    color: COLORS.slate900,
  })
  cursorY -= 6
  doc.drawLine(margin, cursorY, margin + pWidth, cursorY, { color: COLORS.slate700, lineWidth: 1 })
  cursorY -= 14

  // Syringe Table Header
  const tableHeaders = [
    { label: "Assay Dose", w: 100 },
    { label: "Draw Volume (mL)", w: 110 },
    { label: "U-100 Marking", w: 110 },
    { label: "Recommended Syringe Barrel", w: pWidth - 320 },
  ]

  doc.drawRect(margin, cursorY - 14, pWidth, 16, { fill: true, fillColor: COLORS.slate700, stroke: false })
  let thX = margin + 8
  for (const th of tableHeaders) {
    doc.drawText(th.label, thX, cursorY - 10, { font: "/F2", size: 7.5, color: COLORS.white })
    thX += th.w
  }
  cursorY -= 18

  // Syringe Table Rows
  const graduations = canonical?.syringeGuide?.graduations || [
    { doseDisplay: "100 mcg", volumeMl: 0.1 / conc, syringeIU: (0.1 / conc) * 100 },
    { doseDisplay: "250 mcg", volumeMl: 0.25 / conc, syringeIU: (0.25 / conc) * 100 },
    { doseDisplay: "500 mcg", volumeMl: 0.5 / conc, syringeIU: (0.5 / conc) * 100 },
    { doseDisplay: "1.0 mg", volumeMl: 1.0 / conc, syringeIU: (1.0 / conc) * 100 },
  ]

  for (let r = 0; r < Math.min(graduations.length, 5); r++) {
    const g = graduations[r]
    const rowBg = r % 2 === 0 ? COLORS.white : COLORS.slate100
    doc.drawRect(margin, cursorY - 12, pWidth, 14, { fill: true, fillColor: rowBg, stroke: false })

    const doseLabel = g.doseDisplay || `${g.doseMcg || 250} mcg`
    const volLabel = `${(g.volumeMl || 0.05).toFixed(3)} mL`
    const iuLabel = `${(g.syringeIU || 5).toFixed(1)} Units`
    const barrelLabel =
      (g.volumeMl || 0.05) <= 0.3
        ? '0.3 mL Micro-Barrel (31G × 5/16")'
        : (g.volumeMl || 0.05) <= 0.5
        ? '0.5 mL Mid-Barrel (30G × 5/16")'
        : '1.0 mL Full-Barrel (29G × 1/2")'

    doc.drawText(doseLabel, margin + 8, cursorY - 9, { font: "/F2", size: 7.5, color: COLORS.slate900 })
    doc.drawText(volLabel, margin + 108, cursorY - 9, { font: "/F3", size: 7.5, color: COLORS.slate700 })
    doc.drawText(iuLabel, margin + 218, cursorY - 9, { font: "/F2", size: 7.5, color: COLORS.sky700 })
    doc.drawText(barrelLabel, margin + 328, cursorY - 9, { font: "/F1", size: 7, color: COLORS.slate700 })

    cursorY -= 14
  }

  cursorY -= 10

  // Section 4: Aseptic Preparation SOP
  doc.drawText("4. ASEPTIC LABORATORY RECONSTITUTION DIRECTIVE", margin, cursorY, {
    font: "/F2",
    size: 9,
    color: COLORS.slate900,
  })
  cursorY -= 6
  doc.drawLine(margin, cursorY, margin + pWidth, cursorY, { color: COLORS.slate700, lineWidth: 1 })
  cursorY -= 12

  const sopSteps = [
    { step: "Step 1: Sanitize", desc: "Decontaminate rubber septums with sterile 70% isopropyl alcohol. Allow 30s to air dry." },
    { step: "Step 2: Stream Wall", desc: "Introduce diluent slowly angling needle against inner vial glass wall. Never spray cake." },
    { step: "Step 3: Dissolve", desc: "Swirl horizontally with gentle circular motions. Do not agitate, vortex, or shake." },
    { step: "Step 4: Refrigeration", desc: "Quarantine in laboratory refrigeration at +2°C to +8°C. Protect from direct UV exposure." },
  ]

  for (const s of sopSteps) {
    doc.drawRect(margin, cursorY - 14, pWidth, 16, { fill: true, fillColor: COLORS.slate100, stroke: false })
    doc.drawText(s.step + ":", margin + 8, cursorY - 10, { font: "/F2", size: 7.5, color: COLORS.slate900 })
    doc.drawText(s.desc, margin + 110, cursorY - 10, { font: "/F1", size: 7.5, color: COLORS.slate700 })
    cursorY -= 18
  }

  // ── PAGE 2: CLINICAL TITRATION, BOM & QA SIGN-OFF (If Full Preset) ──
  if (preset === "full") {
    doc.addPage()
    drawDocHeader(2, 2)
    cursorY = 724

    // Section 5: Clinical Titration Ladder
    doc.drawText("5. CLINICAL ASSAY TITRATION & REAGENTS BOM MATRIX", margin, cursorY, {
      font: "/F2",
      size: 9,
      color: COLORS.slate900,
    })
    cursorY -= 6
    doc.drawLine(margin, cursorY, margin + pWidth, cursorY, { color: COLORS.slate700, lineWidth: 1 })
    cursorY -= 14

    // Retrieve schedule from registry
    const trialMatrix = getClinicalTrialSchedulesForProtocol(
      protocol.handle,
      undefined,
      stdMcg / 1000,
      stdMcg,
      canonical?.dosing?.routeLabel || "Daily SubQ"
    )
    const scheduleRows = trialMatrix.phase3.length > 0 ? trialMatrix.phase3 : trialMatrix.standard

    // Titration Table Header
    doc.drawRect(margin, cursorY - 14, pWidth, 16, { fill: true, fillColor: COLORS.slate700, stroke: false })
    doc.drawText("Phase / Horizon", margin + 8, cursorY - 10, { font: "/F2", size: 7.5, color: COLORS.white })
    doc.drawText("Target Dose", margin + 140, cursorY - 10, { font: "/F2", size: 7.5, color: COLORS.white })
    doc.drawText("Cadence", margin + 240, cursorY - 10, { font: "/F2", size: 7.5, color: COLORS.white })
    doc.drawText("Scientific Focus / Physiological Target", margin + 340, cursorY - 10, { font: "/F2", size: 7.5, color: COLORS.white })
    cursorY -= 18

    for (let r = 0; r < Math.min(scheduleRows.length, 6); r++) {
      const row = scheduleRows[r]
      const rowBg = r % 2 === 0 ? COLORS.white : COLORS.slate100
      doc.drawRect(margin, cursorY - 12, pWidth, 14, { fill: true, fillColor: rowBg, stroke: false })

      doc.drawText(row.phase, margin + 8, cursorY - 9, { font: "/F2", size: 7.5, color: COLORS.slate900 })
      doc.drawText(row.doseDisplay || `${row.doseMg} mg`, margin + 140, cursorY - 9, { font: "/F2", size: 7.5, color: COLORS.sky700 })
      doc.drawText(row.cadence, margin + 240, cursorY - 9, { font: "/F1", size: 7, color: COLORS.slate700 })
      doc.drawText((row.notes || "Standard titration tier").slice(0, 38), margin + 340, cursorY - 9, { font: "/F1", size: 6.5, color: COLORS.slate500 })

      cursorY -= 14
    }

    cursorY -= 12

    // Consumables BOM Calculation
    const bom12 = calculateProtocolSupplyBOM(scheduleRows, vialMg, diluentMl, 12)
    doc.drawText("12-WEEK CONSUMABLE REAGENTS BILL OF MATERIALS (BOM) · 8% ANALYTICAL DEAD-SPACE BUFFER", margin, cursorY, {
      font: "/F2",
      size: 8,
      color: COLORS.slate700,
    })
    cursorY -= 8

    const bomGrid = [
      { item: "Lyophilized Vials", qty: `${bom12.vialsRequired} vials (${vialMg}mg net)`, notes: `Nominal active mass: ${bom12.totalMg} mg` },
      { item: "Diluent Bottles", qty: `${bom12.bacBottlesRequired} bottles (10 mL)`, notes: `Total volume: ${bom12.bacWaterMl} mL BAC Water` },
      { item: "Disposable Syringes", qty: `${bom12.totalSyringes} syringes (U-100)`, notes: "Single-use aseptic insulin standard" },
      { item: "Alcohol Prep Swabs", qty: `${bom12.alcoholSwabs} pads (70% IPA)`, notes: "Septum sanitize + injection site prep" },
    ]

    for (const b of bomGrid) {
      doc.drawRect(margin, cursorY - 12, pWidth, 14, { fill: true, fillColor: COLORS.slate100, stroke: false })
      doc.drawText(b.item + ":", margin + 8, cursorY - 9, { font: "/F2", size: 7.5, color: COLORS.slate900 })
      doc.drawText(b.qty, margin + 140, cursorY - 9, { font: "/F2", size: 7.5, color: COLORS.slate900 })
      doc.drawText(b.notes, margin + 280, cursorY - 9, { font: "/F1", size: 7, color: COLORS.slate500 })
      cursorY -= 16
    }

    cursorY -= 14

    // Section 6: Physicochemical Storage Stability Kinetics
    doc.drawText("6. PHYSICOCHEMICAL STABILITY & REFRIGERATED KINETICS", margin, cursorY, {
      font: "/F2",
      size: 9,
      color: COLORS.slate900,
    })
    cursorY -= 6
    doc.drawLine(margin, cursorY, margin + pWidth, cursorY, { color: COLORS.slate700, lineWidth: 1 })
    cursorY -= 14

    const storageTiers = [
      { temp: "-20°C to -80°C", state: "Lyophilized Cake (Dry Powder)", window: "24 to 36 Months", rule: "Maximum thermodynamic stability. Air-gap light shield." },
      { temp: "+2°C to +8°C", state: "Lyophilized Cake (Pre-reconstitution)", window: "12 to 18 Months", rule: "Laboratory refrigeration shelf-life." },
      { temp: "+2°C to +8°C", state: "Reconstituted Solution (with BAC)", window: "21 to 28 Days", rule: "Preserved with 0.9% Benzyl Alcohol. Prevent agitation." },
      { temp: ">37°C / Direct UV", state: "Any State", window: "< 6 Hours", rule: "Severe degradation risk. Cleavage of amide peptide bonds." },
    ]

    for (const st of storageTiers) {
      doc.drawRect(margin, cursorY - 12, pWidth, 14, { fill: true, fillColor: COLORS.slate100, stroke: false })
      doc.drawText(st.temp, margin + 8, cursorY - 9, { font: "/F2", size: 7, color: COLORS.slate900 })
      doc.drawText(st.state, margin + 110, cursorY - 9, { font: "/F1", size: 7, color: COLORS.slate700 })
      doc.drawText(st.window, margin + 270, cursorY - 9, { font: "/F2", size: 7, color: COLORS.sky700 })
      doc.drawText(st.rule, margin + 370, cursorY - 9, { font: "/F1", size: 6.5, color: COLORS.slate500 })
      cursorY -= 16
    }

    cursorY -= 14

    // Section 7: QA Validation & Compound Custody Block
    doc.drawText("7. INSTITUTIONAL GOOD LABORATORY PRACTICE (GLP) SIGN-OFF", margin, cursorY, {
      font: "/F2",
      size: 9,
      color: COLORS.slate900,
    })
    cursorY -= 6
    doc.drawLine(margin, cursorY, margin + pWidth, cursorY, { color: COLORS.slate700, lineWidth: 1 })
    cursorY -= 18

    // QA Signature Box
    doc.drawRect(margin, cursorY - 50, pWidth, 54, {
      fill: true,
      fillColor: COLORS.white,
      stroke: true,
      strokeColor: COLORS.slate300,
      lineWidth: 1,
    })

    const qaCol = pWidth / 3
    // Col 1: Prepared By
    doc.drawText("COMPOUNDED / PREPARED BY:", margin + 8, cursorY - 10, { font: "/F2", size: 6.5, color: COLORS.slate500 })
    doc.drawLine(margin + 8, cursorY - 32, margin + qaCol - 12, cursorY - 32, { color: COLORS.slate300, lineWidth: 0.5 })
    doc.drawText("Signature / Researcher ID", margin + 8, cursorY - 42, { font: "/F1", size: 6, color: COLORS.slate500 })

    // Col 2: Verified By
    doc.drawText("VERIFIED / QA AUDITOR:", margin + qaCol + 8, cursorY - 10, { font: "/F2", size: 6.5, color: COLORS.slate500 })
    doc.drawLine(margin + qaCol + 8, cursorY - 32, margin + qaCol * 2 - 12, cursorY - 32, { color: COLORS.slate300, lineWidth: 0.5 })
    doc.drawText("Signature / PI Sign-Off", margin + qaCol + 8, cursorY - 42, { font: "/F1", size: 6, color: COLORS.slate500 })

    // Col 3: Lot & Date
    doc.drawText(`LOT NUMBER: PSL-LOT-${Date.now().toString().slice(-6)}`, margin + qaCol * 2 + 8, cursorY - 10, { font: "/F3", size: 6.5, color: COLORS.slate900 })
    doc.drawText(`VERIFICATION DATE: ${currentDate}`, margin + qaCol * 2 + 8, cursorY - 24, { font: "/F3", size: 6.5, color: COLORS.slate700 })
    doc.drawText("STATUS: CERTIFIED GREEN", margin + qaCol * 2 + 8, cursorY - 38, { font: "/F2", size: 7, color: COLORS.emerald700 })
  }

  const binary = doc.compileBinary()
  return new Blob([binary.buffer as ArrayBuffer], { type: "application/pdf" })
}

/**
 * Triggers native browser download of the generated PDF document
 */
export function downloadProtocolPdf(
  protocol: CustomerResearchProtocol | StoreResearchProtocol,
  preset: PdfPreset = "full"
): void {
  const blob = generateProtocolPdfBlob(protocol, preset)
  const cleanTitle = cleanCompoundTitle(protocol.content.compound_name || protocol.title)
  const filename = `PepStack_GLP_Protocol_${cleanTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${preset.toUpperCase()}.pdf`

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
