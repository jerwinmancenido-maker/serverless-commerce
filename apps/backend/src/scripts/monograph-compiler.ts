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
  bottle_ml?: number
  pump_output_ml?: number
  concentration_display?: string
}

export type PeptidesSkuData = {
  name: string
  dosage: string
  dosage_mg?: number
  subtitle?: string
  administration_route?: string
  kit_type?: string
  category?: string
  subcategory?: string
  is_hardware?: boolean
  isSupply?: boolean
  specs?: Record<string, string>
  protocol?: Record<string, string>
  benefits?: PeptidesBenefit[]
  features?: PeptidesBenefit[]
  inclusions?: [string, string][]
  pump_output_ml?: number
  bottle_ml?: number
  concentration_display?: string
  molecular?: PeptidesMolecular
  reconstitution?: PeptidesReconstitution
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

export function formatSpecKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
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

  const isSupply =
    data.category === "Laboratory Supplies" ||
    Boolean(data.is_hardware) ||
    Boolean(data.isSupply)

  // 1. LABORATORY SUPPLIES & LABWARE
  if (isSupply) {
    const sections: string[] = []

    sections.push(
      `<p><strong>${name} ${dosage} – Laboratory Supplies & Precision Labware Standard | Technical Monograph</strong></p>`,
    )
    sections.push("<p><strong>Classification & Category</strong></p>")
    sections.push("<p>Laboratory Supplies / Lab Standard</p>")

    sections.push("<p><strong>Product Overview & Technical Specifications</strong></p>")
    sections.push(
      `<p>${name} (${subtitle}) is supplied strictly for controlled laboratory research workflows, aseptic sample handling, and high-precision protocol execution. Engineered to meet pharmaceutical labware standards to prevent contamination, sample degradation, and thermal failure.</p>`,
    )

    if (data.specs && Object.keys(data.specs).length > 0) {
      sections.push("<p><strong>Technical & Material Specifications</strong></p>")
      for (const [key, val] of Object.entries(data.specs)) {
        const formattedKey = formatSpecKey(key)
        const formattedVal = sanitizeHtmlText(val)
        sections.push(`<p>• <strong>${formattedKey}:</strong> ${formattedVal}</p>`)
      }
    }

    if (data.protocol && Object.keys(data.protocol).length > 0) {
      sections.push("<p><strong>Standard Operating Procedure (SOP)</strong></p>")
      // Extract step keys (step1, step2, etc.)
      const stepNums = [1, 2, 3, 4, 5, 6]
      for (const num of stepNums) {
        const stepKey = `step${num}`
        const titleKey = `step${num}_title`
        const instruction = data.protocol[stepKey]
        const stepTitle = data.protocol[titleKey]
        if (instruction) {
          if (stepTitle) {
            sections.push(
              `<p>• <strong>${sanitizeHtmlText(stepTitle)}:</strong> ${sanitizeHtmlText(instruction)}</p>`,
            )
          } else {
            sections.push(`<p>• <strong>${sanitizeHtmlText(instruction)}</strong></p>`)
          }
        }
      }
    }

    const feats = data.features || data.benefits || []
    if (feats.length > 0) {
      sections.push("<p><strong>Engineering & Integrity Highlights</strong></p>")
      for (const f of feats) {
        const fTitle = sanitizeHtmlText(f.title)
        const fDesc = sanitizeHtmlText(f.desc)
        sections.push(`<p>• <strong>${fTitle}:</strong> ${fDesc}</p>`)
      }
    }

    if (data.inclusions && data.inclusions.length > 0) {
      sections.push("<p><strong>Package Inclusions Manifest</strong></p>")
      for (const [item, spec] of data.inclusions) {
        sections.push(
          `<p>• <strong>${sanitizeHtmlText(item)}:</strong> ${sanitizeHtmlText(spec)}</p>`,
        )
      }
    }

    sections.push("<p><strong>Intended Use & Compliance Notice</strong></p>")
    sections.push(`<p>${RUO_COMPLIANCE_NOTICE}</p>`)

    return sections.join("")
  }

  const mol = data.molecular || {}
  const formula = sanitizeHtmlText(mol.formula || "")
  const sequence = sanitizeHtmlText(mol.sequence || "")
  const sequenceOrFormula = sequence || formula || "Synthesized Reference Peptide"
  const cas = sanitizeHtmlText(mol.cas || "Analytical Reference Standard")
  const mw = sanitizeHtmlText(mol.mw || "Standard Compound Profile")
  const purity = sanitizeHtmlText(mol.purity || "≥99.0% (HPLC Certified)")

  const recon = data.reconstitution || {}
  const diluentMl = recon.diluent_ml ?? 2.0
  const isNasal =
    data.administration_route === "nasal" || data.kit_type === "nasal"
  const isOral =
    data.administration_route === "oral" || data.kit_type === "oral"

  // 2. METERED NASAL ATOMIZER PEPTIDES
  if (isNasal) {
    const sections: string[] = []
    const pumpOutput = recon.pump_output_ml ?? data.pump_output_ml ?? 0.1
    const bottleVol = recon.bottle_ml ?? data.bottle_ml ?? diluentMl
    const solvent = sanitizeHtmlText(
      recon.solvent_name || "Sterile Reconstitution Solution / 0.9% Saline USP",
    )

    sections.push(
      `<p><strong>${name} ${dosage} – Research Grade Metered Nasal Atomizer Standard | Lab Monograph</strong></p>`,
    )
    sections.push("<p><strong>Classification & Category</strong></p>")
    sections.push("<p>Research Compounds / In-Vitro &amp; Intranasal Reference Grade</p>")

    sections.push("<p><strong>Product Overview & Research Rationale</strong></p>")
    sections.push(
      `<p>${name} (${subtitle}) is an analytical-grade research compound calibrated for metered intranasal delivery assays. Formulated specifically for blood-brain barrier transport kinetics, mucosal permeation modeling, receptor affinity assays, and high-performance liquid chromatography (HPLC) calibration.</p>`,
    )

    sections.push("<p><strong>Physicochemical & Molecular Specifications</strong></p>")
    sections.push(
      `<p>• <strong>Chemical Sequence / Formula:</strong> <code>${sequenceOrFormula}</code></p>`,
    )
    sections.push(`<p>• <strong>CAS Registry Number:</strong> ${cas}</p>`)
    sections.push(`<p>• <strong>Molecular Weight:</strong> ${mw}</p>`)
    sections.push(`<p>• <strong>Purity:</strong> ${purity}</p>`)
    sections.push(
      "<p>• <strong>Physical State:</strong> Lyophilized Solid Powder with Metered Nasal Spray Delivery System</p>",
    )

    sections.push(
      "<p><strong>Aseptic Metered Nasal Preparation & Laboratory Handling Profile</strong></p>",
    )
    sections.push(`<p>• <strong>Target Diluent:</strong> ${solvent}</p>`)
    sections.push(
      `<p>• <strong>Metered Pump Output:</strong> ${pumpOutput.toFixed(2)} mL per actuation</p>`,
    )
    sections.push(
      `<p>• <strong>Standard Reconstitution Ratio:</strong> ${bottleVol.toFixed(
        1,
      )} mL per ${dosage}</p>`,
    )
    sections.push(
      "<p>• <strong>Priming & Mist Technique:</strong> Swirl gently in horizontal circles until completely dissolved. Affix metered nasal pump securely. Prime pump 2–3 times into air until a uniform, fine conical aerosol plume is produced. Avoid violent agitation.</p>",
    )
    sections.push(
      "<p>• <strong>Lyophilized Storage:</strong> -20°C in dry desiccated container (24 months)</p>",
    )
    sections.push(
      "<p>• <strong>Reconstituted Solution Stability:</strong> 2°C–8°C refrigerated; use within 28 days. Store bottle upright. Protect from light.</p>",
    )

    if (data.benefits && data.benefits.length > 0) {
      sections.push("<p><strong>Key Analytical Research Observations</strong></p>")
      for (const b of data.benefits) {
        sections.push(
          `<p>• <strong>${sanitizeHtmlText(b.title)}:</strong> ${sanitizeHtmlText(b.desc)}</p>`,
        )
      }
    }

    sections.push("<p><strong>Intended Use & Compliance Notice</strong></p>")
    sections.push(`<p>${RUO_COMPLIANCE_NOTICE}</p>`)

    return sections.join("")
  }

  // 3. ORAL BIOAVAILABLE SOLUTIONS
  if (isOral) {
    const sections: string[] = []
    const solvent = sanitizeHtmlText(
      recon.solvent_name || "Oral Liquid Research Vehicle USP",
    )
    const concDisplay = sanitizeHtmlText(
      recon.concentration_display ||
        data.concentration_display ||
        calculateConcentration(data.dosage_mg, diluentMl),
    )

    sections.push(
      `<p><strong>${name} ${dosage} – Research Grade Bioavailable Oral Solution Standard | Lab Monograph</strong></p>`,
    )
    sections.push("<p><strong>Classification & Category</strong></p>")
    sections.push("<p>Research Compounds / Oral Bioavailable Reference Grade</p>")

    sections.push("<p><strong>Product Overview & Research Rationale</strong></p>")
    sections.push(
      `<p>${name} (${subtitle}) is an orally bioavailable research standard formulated for controlled in-vitro cellular signaling assays, gastrointestinal absorption modeling, receptor kinetics, and HPLC quantification.</p>`,
    )

    sections.push("<p><strong>Physicochemical & Molecular Specifications</strong></p>")
    sections.push(
      `<p>• <strong>Chemical Sequence / Formula:</strong> <code>${sequenceOrFormula}</code></p>`,
    )
    sections.push(`<p>• <strong>CAS Registry Number:</strong> ${cas}</p>`)
    sections.push(`<p>• <strong>Molecular Weight:</strong> ${mw}</p>`)
    sections.push(`<p>• <strong>Purity:</strong> ${purity}</p>`)
    sections.push(
      "<p>• <strong>Physical State:</strong> Bioavailable Oral Liquid Solution (Graduated Dropper Bottle)</p>",
    )

    sections.push(
      "<p><strong>Oral Solution & Dropper Calibration Profile</strong></p>",
    )
    sections.push(`<p>• <strong>Formulation Vehicle:</strong> ${solvent}</p>`)
    sections.push(
      `<p>• <strong>Standard Volume & Concentration:</strong> ${diluentMl.toFixed(
        1,
      )} mL (${concDisplay})</p>`,
    )
    sections.push(
      "<p>• <strong>Dispensing SOP:</strong> Shake gently before use. Use the included calibrated laboratory dropper (0.25 mL increments) for precision volumetric aliquot measurement.</p>",
    )
    sections.push(
      "<p>• <strong>Storage Specification:</strong> Controlled room temperature (15°C–25°C) or 2°C–8°C as specified. Protect from direct heat, sunlight, and moisture.</p>",
    )

    if (data.benefits && data.benefits.length > 0) {
      sections.push("<p><strong>Key Analytical Research Observations</strong></p>")
      for (const b of data.benefits) {
        sections.push(
          `<p>• <strong>${sanitizeHtmlText(b.title)}:</strong> ${sanitizeHtmlText(b.desc)}</p>`,
        )
      }
    }

    sections.push("<p><strong>Intended Use & Compliance Notice</strong></p>")
    sections.push(`<p>${RUO_COMPLIANCE_NOTICE}</p>`)

    return sections.join("")
  }

  // 4. STANDARD SUBCUTANEOUS LYOPHILIZED PEPTIDES
  const solvent = sanitizeHtmlText(
    recon.solvent_name || "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
  )
  const concentration = calculateConcentration(data.dosage_mg, diluentMl)

  const sections: string[] = []

  sections.push(
    `<p><strong>${name} ${dosage} – Research Grade Peptide Standard | Lyophilized Lab Monograph</strong></p>`,
  )
  sections.push("<p><strong>Classification & Category</strong></p>")
  sections.push("<p>Research Compounds / In-Vitro Reference Grade</p>")

  sections.push("<p><strong>Product Overview & Research Rationale</strong></p>")
  sections.push(
    `<p>${name} (${subtitle}) is a high-purity laboratory reference peptide supplied as a sterile lyophilized cake. Formulated specifically for controlled in-vitro cellular signaling assays, receptor-binding affinity studies, bioenergetic kinetic modeling, and high-performance liquid chromatography (HPLC) calibration.</p>`,
  )

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
  route: "nasal" | "oral" | "supplies" | "subq"
  pumpOutput: number | null
} {
  if (!html) {
    return {
      cas: null,
      mw: null,
      diluentMl: null,
      solvent: null,
      sequence: null,
      route: "subq",
      pumpOutput: null,
    }
  }

  const casMatch = html.match(/CAS Registry Number:<\/strong>\s*([^<]+)/i)
  const mwMatch = html.match(/Molecular Weight:<\/strong>\s*([^<]+)/i)
  const diluentMatch =
    html.match(
      /(?:Standard Reconstitution Ratio|Standard Volume & Concentration):<\/strong>\s*(\d+(?:\.\d+)?)\s*mL/i,
    ) || html.match(/(\d+(?:\.\d+)?)\s*mL/i)
  const solventMatch = html.match(
    /(?:Target Diluent|Formulation Vehicle):<\/strong>\s*([^<]+)/i,
  )
  const seqMatch = html.match(/<code>([^<]+)<\/code>/i)
  const pumpMatch = html.match(
    /Metered Pump Output:<\/strong>\s*(\d+(?:\.\d+)?)\s*mL/i,
  )

  let route: "nasal" | "oral" | "supplies" | "subq" = "subq"
  if (html.includes("Laboratory Supplies & Precision Labware Standard")) {
    route = "supplies"
  } else if (html.includes("Metered Nasal Atomizer Standard")) {
    route = "nasal"
  } else if (html.includes("Bioavailable Oral Solution Standard")) {
    route = "oral"
  }

  return {
    cas: casMatch ? casMatch[1].trim() : null,
    mw: mwMatch ? mwMatch[1].trim() : null,
    diluentMl: diluentMatch ? parseFloat(diluentMatch[1]) : null,
    solvent: solventMatch ? solventMatch[1].trim() : null,
    sequence: seqMatch ? seqMatch[1].trim() : null,
    route,
    pumpOutput: pumpMatch ? parseFloat(pumpMatch[1]) : null,
  }
}

export function diffPeptidesAndMonograph(
  handle: string,
  peptidesData: PeptidesSkuData,
  currentHtml?: string | null,
): MonographDiffResult {
  const parsed = parseMonographHtml(currentHtml)
  const differences: FieldDifference[] = []

  const isSupply =
    peptidesData.category === "Laboratory Supplies" ||
    Boolean(peptidesData.is_hardware) ||
    Boolean(peptidesData.isSupply)
  const isNasal =
    peptidesData.administration_route === "nasal" ||
    peptidesData.kit_type === "nasal"
  const isOral =
    peptidesData.administration_route === "oral" ||
    peptidesData.kit_type === "oral"

  const expectedRoute = isSupply
    ? "supplies"
    : isNasal
      ? "nasal"
      : isOral
        ? "oral"
        : "subq"

  // Route / Classification diff
  if (currentHtml && parsed.route !== expectedRoute) {
    differences.push({
      field: "Delivery Route / Classification",
      currentValue: parsed.route,
      newValue: expectedRoute,
    })
  }

  // Check CAS (for chemical compounds)
  if (!isSupply) {
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

    // Check Pump Output for Nasal
    if (isNasal) {
      const expectedPump =
        peptidesData.reconstitution?.pump_output_ml ??
        peptidesData.pump_output_ml ??
        0.1
      if (parsed.pumpOutput !== null && parsed.pumpOutput !== expectedPump) {
        differences.push({
          field: "Metered Pump Output",
          currentValue: `${parsed.pumpOutput} mL`,
          newValue: `${expectedPump} mL`,
        })
      }
    }
  }

  return {
    handle,
    hasChanges: differences.length > 0,
    differences,
  }
}

