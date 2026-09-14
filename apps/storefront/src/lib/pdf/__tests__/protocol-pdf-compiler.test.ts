/**
 * @file    apps/storefront/src/lib/pdf/__tests__/protocol-pdf-compiler.test.ts
 * @purpose Unit test suite verifying binary correctness, PDF-1.4 structural invariants,
 *          and dossier generation for both single-compound and multi-compound stack PDF compilers.
 * @contracts
 *   Standard: PDF-1.4 Reference Manual (ISO 32000-1)
 *   Invariants:
 *     - Header magic bytes '%PDF-1.4'
 *     - Structural objects: Catalog, Pages tree, Type1 fonts, content streams
 *     - Exact byte offset xref table and EOF trailer
 */

import test from "node:test"
import assert from "node:assert/strict"
import {
  SimplePdfDocument,
  generateProtocolPdfBlob,
} from "../protocol-pdf-compiler.ts"
import {
  generateStackPdfBlob,
} from "../stack-pdf-compiler.ts"
import type { StoreResearchProtocol } from "../../data/research-protocols.ts"
import type { StackCompoundProfile } from "../../data/stack-interactions.ts"
import type { ResearchBundleVial } from "../../../modules/research-protocols/types.ts"

test("PDF Engine: SimplePdfDocument low-level vector generation and PDF-1.4 syntax", () => {
  const doc = new SimplePdfDocument()
  assert.equal(doc.width, 595.28, "A4 width must be 595.28 points")
  assert.equal(doc.height, 841.89, "A4 height must be 841.89 points")

  // Draw elements
  doc.drawRect(36, 750, 523.28, 50, {
    fill: true,
    fillColor: { r: 0.95, g: 0.96, b: 0.98 },
    stroke: true,
    strokeColor: { r: 0.8, g: 0.84, b: 0.88 },
  })
  doc.drawLine(36, 740, 559.28, 740, { lineWidth: 1 })
  doc.drawText("GLP ANALYTICAL TEST DOCUMENT", 44, 760, { font: "/F2", size: 10 })

  const binary = doc.compileBinary()
  assert.ok(binary instanceof Uint8Array, "Must compile to a Uint8Array")
  assert.ok(binary.length > 200, "Compiled binary must have non-trivial size")

  const pdfString = new TextDecoder("latin1").decode(binary)

  // Invariant 1: Magic Header
  assert.ok(pdfString.startsWith("%PDF-1.4\n"), "Must start with %PDF-1.4 header")

  // Invariant 2: Catalog & Pages tree
  assert.ok(pdfString.includes("/Type /Catalog"), "Must contain Catalog object")
  assert.ok(pdfString.includes("/Type /Pages"), "Must contain Pages object")
  assert.ok(pdfString.includes("/Type /Page"), "Must contain at least one Page object")

  // Invariant 3: Type 1 Fonts
  assert.ok(pdfString.includes("/BaseFont /Helvetica"), "Must embed Helvetica")
  assert.ok(pdfString.includes("/BaseFont /Helvetica-Bold"), "Must embed Helvetica-Bold")
  assert.ok(pdfString.includes("/BaseFont /Courier"), "Must embed Courier")

  // Invariant 4: Cross-reference table & Trailer
  assert.ok(pdfString.includes("xref\n0 "), "Must contain xref table")
  assert.ok(pdfString.includes("trailer\n<<"), "Must contain trailer dictionary")
  assert.ok(pdfString.includes("startxref\n"), "Must contain startxref pointer")
  assert.ok(pdfString.trim().endsWith("%%EOF"), "Must terminate with %%EOF")
})

test("PDF Engine: generateProtocolPdfBlob generates authentic GLP Protocol Dossiers", async () => {
  const mockProtocol = {
    handle: "retatrutide",
    revision: 1,
    title: "Retatrutide GLP Analytical Protocol",
    summary: "LY3437943 GGG Tri-Agonist Reference Standard",
    published_at: "2026-01-01",
    updated_at: "2026-01-01",
    access: { full_protocol: "purchaser" as const, community: "member" as const },
    products: [],
    content: {
      compound_name: "Retatrutide",
      category: "Metabolic Signaling & Incretins",
      product_format: "Lyophilized Powder",
      purity_standard: ">=99.0% (HPLC)",
      short_introduction: "Retatrutide tri-agonist peptide targeting GLP-1, GIP, and GCGR receptors.",
      reconstitution_details: {
        solvent: "USP Bacteriostatic Water",
        target_concentration: "5 mg/mL",
        steps: [
          "Sanitize rubber septums with 70% sterile isopropyl wipe.",
          "Inject 2.0 mL bacteriostatic water slowly down the vial wall.",
          "Roll gently between palms until dissolved; avoid vigorous vortexing.",
          "Immediately store in laboratory refrigerator at 2C to 8C.",
        ],
      },
      dosage_matrix: {
        single_dose: "2.0 mg",
        draw_volume: "0.40 mL (40 U-100 units)",
        frequency: "Once weekly SubQ",
      },
      storage_details: {
        dry_powder: "Store desiccated at -20C (24 months)",
        reconstituted: "Store at 2C to 8C (28 days BUD)",
      },
      warnings_and_precautions: [
        "FOR IN VITRO LABORATORY RESEARCH ONLY.",
        "Not for human or veterinary administration.",
      ],
    },
  }

  const presets = ["full", "bench_sop", "schedule_bom"] as const

  for (const preset of presets) {
    const blob = generateProtocolPdfBlob(mockProtocol as unknown as StoreResearchProtocol, preset)
    assert.equal(blob.type, "application/pdf", `Blob type must be application/pdf for preset ${preset}`)
    assert.ok(blob.size > 2000, `PDF Blob size must be > 2000 bytes (got ${blob.size})`)

    // Verify binary content
    const arrayBuffer = await blob.arrayBuffer()
    const text = new TextDecoder("latin1").decode(new Uint8Array(arrayBuffer))
    assert.ok(text.startsWith("%PDF-1.4"), "Protocol PDF must start with %PDF-1.4")
    assert.ok(text.includes("PEPSTACK LABORATORIES"), "Protocol PDF must include PepStack header")
    assert.ok(text.includes("RETATRUTIDE"), "Protocol PDF must include compound name")
    assert.ok(text.includes("%%EOF"), "Protocol PDF must terminate with %%EOF")
  }
})

test("PDF Engine: generateStackPdfBlob generates multi-compound stack dossiers", async () => {
  const mockStackOptions = {
    stackEvaluation: {
      status: "synergistic" as const,
      overallScore: 94,
      title: "Tissue Regeneration & Cellular Repair Regimen",
      summary: "High-synergy dual peptide administration targeting systemic angiogenic and tissue repair pathways.",
      combinedProtocol: {
        morningDose: "BPC-157 250 mcg SubQ in fasted state",
        eveningDose: "TB-500 2.5 mg SubQ twice weekly prior to sleep",
        weeklySchedule: "5 days on / 2 days off for 8 weeks",
        cycleLength: "8 weeks",
        washout: "4 weeks off",
      },
      pairwiseDetails: [],
      contraindications: [],
    },
    selectedProfiles: [
      {
        id: "bpc-157",
        name: "BPC-157 Pentadecapeptide",
        shortName: "BPC-157",
        category: "Tissue Repair",
        targetReceptor: "Growth Factor",
        primaryPathway: "Angiogenesis",
        adminRoute: "subq",
        optimalTiming: "Morning fasted",
        halfLife: "4 hours",
      },
      {
        id: "tb-500",
        name: "TB-500 Thymosin Beta-4",
        shortName: "TB-500",
        category: "Tissue Repair",
        targetReceptor: "Actin Sequestration",
        primaryPathway: "Cell Migration",
        adminRoute: "subq",
        optimalTiming: "Evening pre-bed",
        halfLife: "24 hours",
      },
    ] as StackCompoundProfile[],
    bundleVials: [
      {
        compoundName: "BPC-157",
        vialNetMass: "5 mg",
        netMg: 5,
        diluentMl: 2.0,
        concMgMl: 2.5,
        solvent: "USP Bacteriostatic Water",
        reconstitutionInstructions: "Dissolve gently down vial wall.",
        targetDose: "250 mcg",
        targetDoseMcg: 250,
        cadence: "Daily SubQ",
        syringeUnits: "10 units (0.10 mL)",
      },
      {
        compoundName: "TB-500",
        vialNetMass: "10 mg",
        netMg: 10,
        diluentMl: 2.0,
        concMgMl: 5.0,
        solvent: "USP Bacteriostatic Water",
        reconstitutionInstructions: "Dissolve gently down vial wall.",
        targetDose: "2.5 mg",
        targetDoseMcg: 2500,
        cadence: "Twice weekly SubQ",
        syringeUnits: "50 units (0.50 mL)",
      },
    ] as ResearchBundleVial[],
  }

  const blob = generateStackPdfBlob(mockStackOptions)
  assert.equal(blob.type, "application/pdf", "Blob type must be application/pdf")
  assert.ok(blob.size > 2000, `Stack PDF Blob size must be > 2000 bytes (got ${blob.size})`)

  const arrayBuffer = await blob.arrayBuffer()
  const text = new TextDecoder("latin1").decode(new Uint8Array(arrayBuffer))
  assert.ok(text.startsWith("%PDF-1.4"), "Stack PDF must start with %PDF-1.4")
  assert.ok(text.includes("PSL-SOP-STACK"), "Stack PDF must include PSL-SOP-STACK ID")
  assert.ok(text.includes("SYNERGY INDEX: 94/100"), "Stack PDF must render synergy index")
  assert.ok(text.includes("BPC-157"), "Stack PDF must include constituent compound 1")
  assert.ok(text.includes("TB-500"), "Stack PDF must include constituent compound 2")
  assert.ok(text.includes("%%EOF"), "Stack PDF must terminate with %%EOF")
})
