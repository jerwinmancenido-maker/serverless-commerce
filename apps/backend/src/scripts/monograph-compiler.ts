export type PeptidesBenefit = {
  title: string
  desc: string
}

export type PeptidesMolecular = {
  synonyms?: string
  formula?: string
  mw?: string
  sequence?: string
  cas?: string
  purity?: string
}

export type PeptidesReconstitution = {
  diluent_ml?: number
  solvent_name?: string
}

export type PeptidesSkuData = {
  name: string
  dosage: string
  dosage_mg?: number
  subtitle?: string
  administration_route?: string
  kit_type?: string
  molecular?: PeptidesMolecular
  reconstitution?: PeptidesReconstitution
  benefits?: PeptidesBenefit[]
}

export type FieldDifference = {
  field: string
  currentValue: string
  newValue: string
}

export type MonographDiffResult = {
  handle: string
  hasChanges: boolean
  differences: FieldDifference[]
}

export const RUO_COMPLIANCE_NOTICE =
  "All materials supplied by Research Compounds are synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation only. Not for human, veterinary, therapeutic, cosmetic, or clinical administration. Research Use Only (RUO)."

export function sanitizeHtmlText(value?: string | null): string {
  if (!value) return ""
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .trim()
}

export function calculateConcentration(
  dosageMg?: number | null,
  diluentMl?: number | null,
): string {
  if (!dosageMg || !diluentMl || diluentMl <= 0) {
    return "Standard Analytical Concentration"
  }
  const concentration = (dosageMg / diluentMl).toFixed(1)
  return `${concentration} mg/mL`
}

export function compileMonographHtml(data: PeptidesSkuData): string {
  const name = sanitizeHtmlText(data.name || "Research Compound")
  const dosage = sanitizeHtmlText(data.dosage || "Standard Dose")
  const subtitle = sanitizeHtmlText(
    data.subtitle || "Analytical Reference Standard",
  )

  const mol = data.molecular || {}
  const formula = sanitizeHtmlText(mol.formula || "")
  const sequence = sanitizeHtmlText(mol.sequence || "")
  const sequenceOrFormula = sequence || formula || "Synthesized Reference Peptide"
  const cas = sanitizeHtmlText(mol.cas || "Analytical Reference Standard")
  const mw = sanitizeHtmlText(mol.mw || "Standard Compound Profile")
  const purity = sanitizeHtmlText(mol.purity || "≥99.0% (HPLC Certified)")

  const recon = data.reconstitution || {}
  const diluentMl = recon.diluent_ml ?? 2.0
  const solvent = sanitizeHtmlText(
    recon.solvent_name || "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
  )
  const concentration = calculateConcentration(data.dosage_mg, diluentMl)

  const sections: string[] = []

  // 1. Header & Classification
  sections.push(
    `<p><strong>${name} ${dosage} – Research Grade Peptide Standard | Lyophilized Lab Monograph</strong></p>`,
  )
  sections.push("<p><strong>Classification & Category</strong></p>")
  sections.push("<p>Research Compounds / In-Vitro Reference Grade</p>")

  // 2. Product Overview
  sections.push("<p><strong>Product Overview & Research Rationale</strong></p>")
  sections.push(
    `<p>${name} (${subtitle}) is a high-purity laboratory reference peptide supplied as a sterile lyophilized cake. Formulated specifically for controlled in-vitro cellular signaling assays, receptor-binding affinity studies, bioenergetic kinetic modeling, and high-performance liquid chromatography (HPLC) calibration.</p>`,
  )

  // 3. Physicochemical & Molecular Specifications
  sections.push(
    "<p><strong>Physicochemical & Molecular Specifications</strong></p>",
  )
  sections.push(
    `<p>• <strong>Chemical Sequence / Formula:</strong> <code>${sequenceOrFormula}</code></p>`,
  )
  sections.push(`<p>• <strong>CAS Registry Number:</strong> ${cas}</p>`)
  sections.push(`<p>• <strong>Molecular Weight:</strong> ${mw}</p>`)
  sections.push(`<p>• <strong>Purity:</strong> ${purity}</p>`)
  sections.push(
    "<p>• <strong>Physical State:</strong> Lyophilized Solid Powder (Sealed Glass Vial)</p>",
  )

  // 4. Aseptic Reconstitution & Laboratory Handling Profile
  sections.push(
    "<p><strong>Aseptic Reconstitution & Laboratory Handling Profile</strong></p>",
  )
  sections.push(`<p>• <strong>Target Diluent:</strong> ${solvent}</p>`)
  sections.push(
    `<p>• <strong>Standard Reconstitution Ratio:</strong> ${diluentMl.toFixed(
      1,
    )} mL per ${dosage} (${concentration})</p>`,
  )
  sections.push(
    "<p>• <strong>Dissolution Technique:</strong> Add diluent slowly down inner glass vial wall. Swirl gently in horizontal circles until clear. Avoid vortexing or violent agitation to preserve secondary peptide conformation.</p>",
  )
  sections.push(
    "<p>• <strong>Lyophilized Storage:</strong> -20°C in dry desiccated container (24 months)</p>",
  )
  sections.push(
    "<p>• <strong>Reconstituted Solution Stability:</strong> 2°C–8°C refrigerated; use within 28 days. Protect from direct sunlight and repeated freeze-thaw cycles.</p>",
  )

  // 5. Key Analytical Benefits
  if (data.benefits && data.benefits.length > 0) {
    sections.push(
      "<p><strong>Key Analytical Research Observations</strong></p>",
    )
    for (const b of data.benefits) {
      const bTitle = sanitizeHtmlText(b.title)
      const bDesc = sanitizeHtmlText(b.desc)
      sections.push(`<p>• <strong>${bTitle}:</strong> ${bDesc}</p>`)
    }
  }

  // 6. RUO Legal & Regulatory Notice
  sections.push("<p><strong>Intended Use & Compliance Notice</strong></p>")
  sections.push(`<p>${RUO_COMPLIANCE_NOTICE}</p>`)

  return sections.join("")
}

export function parseMonographHtml(html?: string | null): {
  cas: string | null
  mw: string | null
  diluentMl: number | null
  solvent: string | null
  sequence: string | null
} {
  if (!html) {
    return { cas: null, mw: null, diluentMl: null, solvent: null, sequence: null }
  }

  const casMatch = html.match(/CAS Registry Number:<\/strong>\s*([^<]+)/i)
  const mwMatch = html.match(/Molecular Weight:<\/strong>\s*([^<]+)/i)
  const diluentMatch = html.match(/(\d+(?:\.\d+)?)\s*mL/i)
  const solventMatch = html.match(/Target Diluent:<\/strong>\s*([^<]+)/i)
  const seqMatch = html.match(/<code>([^<]+)<\/code>/i)

  return {
    cas: casMatch ? casMatch[1].trim() : null,
    mw: mwMatch ? mwMatch[1].trim() : null,
    diluentMl: diluentMatch ? parseFloat(diluentMatch[1]) : null,
    solvent: solventMatch ? solventMatch[1].trim() : null,
    sequence: seqMatch ? seqMatch[1].trim() : null,
  }
}

export function diffPeptidesAndMonograph(
  handle: string,
  peptidesData: PeptidesSkuData,
  currentHtml?: string | null,
): MonographDiffResult {
  const parsed = parseMonographHtml(currentHtml)
  const differences: FieldDifference[] = []

  // Check CAS
  const newCas = peptidesData.molecular?.cas?.trim() || ""
  if (newCas && parsed.cas && newCas !== parsed.cas) {
    differences.push({
      field: "CAS Registry",
      currentValue: parsed.cas,
      newValue: newCas,
    })
  }

  // Check MW
  const newMw = peptidesData.molecular?.mw?.trim() || ""
  if (newMw && parsed.mw && newMw !== parsed.mw) {
    differences.push({
      field: "Molecular Weight",
      currentValue: parsed.mw,
      newValue: newMw,
    })
  }

  // Check Diluent mL
  const newDiluent = peptidesData.reconstitution?.diluent_ml
  if (
    newDiluent !== undefined &&
    parsed.diluentMl !== null &&
    newDiluent !== parsed.diluentMl
  ) {
    differences.push({
      field: "Diluent Volume",
      currentValue: `${parsed.diluentMl} mL`,
      newValue: `${newDiluent} mL`,
    })
  }

  // Check Solvent Name
  const newSolvent = peptidesData.reconstitution?.solvent_name?.trim() || ""
  if (newSolvent && parsed.solvent && newSolvent !== parsed.solvent) {
    differences.push({
      field: "Target Diluent",
      currentValue: parsed.solvent,
      newValue: newSolvent,
    })
  }

  return {
    handle,
    hasChanges: differences.length > 0,
    differences,
  }
}
