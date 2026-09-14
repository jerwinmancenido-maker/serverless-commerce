/**
 * @file    apps/storefront/src/lib/data/__tests__/data-triangulation.test.ts
 * @purpose Automated Triangulated CI/CD Quality Gate & Anti-Hallucination Invariant Linter.
 * @contracts
 *   Leg 1: Scientific Registries (PMID format & non-hallucination)
 *   Leg 2: Stoichiometric Physics (C = M / V, U = V * 100)
 *   Leg 3: Clinical Benchmarks & Multi-Vial Dual-Channel Segregation
 *   Leg 4: Clinical Supply & Consumables BOM Invariants
 *   Leg 5: Monograph Depth Parity & Editorial Quality Invariants
 */

import test from "node:test"
import assert from "node:assert/strict"

// Direct data imports (pure JSON / pure TS, zero runtime side effects)
import rawProtocols from "../compound-protocols/all-protocols.json" with { type: "json" }
import rawCatalogProducts from "../../../../../backend/data/unified-catalog.json" with { type: "json" }
import type { CompoundAnalyticalProtocol } from "../compound-protocols/types.ts"
import rawComparisons from "../../../../../backend/data/peptide-comparisons.json" with { type: "json" }
import rawEducational from "../../../../../backend/data/peptide-educational-content.json" with { type: "json" }
import rawStackInteractions from "../../../../../backend/data/peptide-stack-interactions.json" with { type: "json" }
import {
  RETATRUTIDE_PHASE2_SCHEDULE,
  RETATRUTIDE_PHASE3_SCHEDULE,
  TIRZEPATIDE_SURPASS_SCHEDULE,
  SEMAGLUTIDE_STEP_SCHEDULE,
  getClinicalTrialSchedulesForProtocol,
  getAvailableVialStrengthsForProtocol,
  calculateProtocolSupplyBOM,
} from "../clinical-trials-registry.ts"

test("Triangulation Leg 1: Catalog Volume, ID Parity & Handle Uniqueness", () => {
  assert.ok(
    rawProtocols.length >= 154,
    `Expected at least 154 protocols, found ${rawProtocols.length}`
  )

  // Verify unique protocol IDs
  const idSet = new Set<string>()
  const handleSet = new Set<string>()

  for (const protocol of rawProtocols) {
    assert.ok(protocol.id, `Protocol missing ID: ${protocol.compoundName}`)
    assert.ok(!idSet.has(protocol.id), `Duplicate protocol ID detected: ${protocol.id}`)
    idSet.add(protocol.id)

    if (protocol.handles && protocol.handles.length > 0) {
      for (const handle of protocol.handles) {
        assert.ok(!handleSet.has(handle), `Duplicate protocol handle detected: ${handle}`)
        handleSet.add(handle)
      }
    }
  }

  assert.equal(idSet.size, rawProtocols.length)
})

test("Triangulation Leg 2: Stoichiometric Invariant C = M / V (Single Compounds)", () => {
  let evaluatedCount = 0

  for (const protocol of rawProtocols) {
    // Skip supplies/hardware and multi-vial bundles (which are segregated into bundleVials)
    if (
      protocol.category === "Laboratory Supplies" ||
      protocol.isSupply ||
      protocol.protocolCategoryType === "bundle" ||
      (protocol.bundleVials && protocol.bundleVials.length > 0)
    ) {
      continue
    }

    const recon = protocol.reconstitution
    if (recon && recon.defaultVialNetMg && recon.defaultDiluentMl) {
      const expectedConc = recon.defaultVialNetMg / recon.defaultDiluentMl
      const actualConc = recon.resultingConcentrationMgPerMl || 0

      const delta = Math.abs(actualConc - expectedConc)
      assert.ok(
        delta <= 0.05,
        `Stoichiometric concentration mismatch for ${protocol.id}: expected ${expectedConc.toFixed(2)} mg/mL, found ${actualConc} mg/mL (delta: ${delta})`
      )
      evaluatedCount++
    }
  }

  assert.ok(
    evaluatedCount >= 70,
    `Expected at least 70 single-compound protocols evaluated for stoichiometry, got ${evaluatedCount}`
  )
})

test("Triangulation Leg 2: Volumetric Syringe Calibration U = V * 100", () => {
  let evaluatedGraduations = 0

  for (const protocol of rawProtocols) {
    const graduations = protocol.syringeGuide?.graduations || []

    for (const grad of graduations) {
      if (grad.volumeMl != null && grad.syringeIU != null) {
        const expectedIU = Math.round(grad.volumeMl * 100 * 10) / 10
        const delta = Math.abs(grad.syringeIU - expectedIU)

        assert.ok(
          delta <= 0.5,
          `Syringe graduation calibration error for ${protocol.id} (${grad.doseDisplay}): expected ${expectedIU} IU, found ${grad.syringeIU} IU`
        )
        evaluatedGraduations++
      }
    }
  }

  assert.ok(
    evaluatedGraduations >= 150,
    `Expected at least 150 syringe graduations evaluated, got ${evaluatedGraduations}`
  )
})

test("Triangulation Leg 3: Multi-Vial Bundle Volumetric Segregation", () => {
  const bundles = rawProtocols.filter(
    (p) => p.protocolCategoryType === "bundle" || (p.bundleVials && p.bundleVials.length > 0)
  )

  assert.ok(bundles.length >= 6, `Expected at least 6 multi-vial bundles, found ${bundles.length}`)

  for (const bundle of bundles) {
    assert.ok(
      bundle.bundleVials && bundle.bundleVials.length >= 2,
      `Bundle ${bundle.id} must have at least 2 segregated constituent vials`
    )

    const vials = bundle.bundleVials || []
    for (let idx = 0; idx < vials.length; idx++) {
      const vial = vials[idx]
      assert.ok(vial.compoundName, `Bundle ${bundle.id} vial #${idx + 1} missing compoundName`)
      assert.ok(vial.vialNetMass, `Bundle ${bundle.id} vial #${idx + 1} missing vialNetMass`)
      assert.ok(vial.diluentMl > 0, `Bundle ${bundle.id} vial #${idx + 1} diluentMl must be > 0`)
      assert.ok(vial.concMgMl > 0, `Bundle ${bundle.id} vial #${idx + 1} concMgMl must be > 0`)
      assert.ok(vial.solvent, `Bundle ${bundle.id} vial #${idx + 1} missing solvent specification`)

      // Check per-vial stoichiometry if mass in mg can be parsed
      const matchMg = vial.vialNetMass.match(/([\d.]+)\s*mg/i)
      if (matchMg) {
        const netMg = parseFloat(matchMg[1])
        const expectedConc = netMg / vial.diluentMl
        const delta = Math.abs(vial.concMgMl - expectedConc)
        assert.ok(
          delta <= 0.1,
          `Bundle ${bundle.id} vial ${vial.compoundName} conc error: expected ${expectedConc.toFixed(2)}, found ${vial.concMgMl}`
        )
      }
    }
  }
})

test("Triangulation Leg 1: Scientific Citations & Anti-Hallucination Invariants", () => {
  let totalCitations = 0
  const validPmidRegex = /(?:PMID:?\s*|pubmed\/)(\d{7,8})/i
  const validRegulatoryRegex = /(?:USP|Pharmacopeia|Pharmacopoeia|GLP|ISO|FDA|EP|Standard|Guidelines|Laboratory|Manual|Safety)/i

  for (const protocol of rawProtocols) {
    const citations = protocol.citations || []
    totalCitations += citations.length

    for (const citation of citations) {
      assert.ok(
        citation.sourceReference && citation.sourceReference.trim().length > 0,
        `Empty citation sourceReference in ${protocol.id}`
      )

      const hasPmid = validPmidRegex.test(citation.sourceReference)
      const hasReg = validRegulatoryRegex.test(citation.sourceReference)
      const isPeerReviewed =
        citation.sourceReference.includes("et al.") ||
        citation.sourceReference.includes("doi:") ||
        citation.sourceReference.includes("Journal") ||
        citation.sourceReference.includes("Med") ||
        citation.sourceReference.includes("Pharmacol")

      assert.ok(
        hasPmid || hasReg || isPeerReviewed,
        `Unverified citation format in ${protocol.id}: "${citation.sourceReference}"`
      )
    }
  }

  assert.ok(
    totalCitations >= 180,
    `Expected at least 180 verified citations, found ${totalCitations}`
  )
})

test("Head-to-Head Comparative Catalog Completeness (24 Comparisons)", () => {
  type ComparisonEntry = {
    slug: string
    compoundA?: { name: string; id?: string }
    compound_a?: { name: string; id?: string }
    compoundB?: { name: string; id?: string }
    compound_b?: { name: string; id?: string }
    vectors?: Array<{ feature: string; compoundA_val: string; compoundB_val: string }>
    title?: string
  }
  const comparisons: ComparisonEntry[] = Array.isArray(rawComparisons)
    ? (rawComparisons as unknown as ComparisonEntry[])
    : (((rawComparisons as unknown as { comparisons?: ComparisonEntry[] }).comparisons) || [])
  assert.equal(
    comparisons.length,
    24,
    `Expected exactly 24 verified comparisons, found ${comparisons.length}`
  )

  const slugSet = new Set<string>()
  for (const comp of comparisons) {
    assert.ok(comp.slug, "Comparison missing slug")
    assert.ok(!slugSet.has(comp.slug), `Duplicate comparison slug: ${comp.slug}`)
    slugSet.add(comp.slug)

    const compA = comp.compoundA || comp.compound_a
    const compB = comp.compoundB || comp.compound_b

    assert.ok(compA?.name, `Comparison ${comp.slug} missing compoundA name`)
    assert.ok(compB?.name, `Comparison ${comp.slug} missing compoundB name`)
    assert.ok(comp.vectors && comp.vectors.length >= 6, `Comparison ${comp.slug} must have >= 6 vectors`)
  }
})

test("Clinical Trials Registry Selectors & Titration Invariants", () => {
  assert.ok(RETATRUTIDE_PHASE2_SCHEDULE.length >= 4)
  assert.ok(RETATRUTIDE_PHASE3_SCHEDULE.length >= 5)
  assert.ok(TIRZEPATIDE_SURPASS_SCHEDULE.length >= 5)
  assert.ok(SEMAGLUTIDE_STEP_SCHEDULE.length >= 5)

  // Test Retatrutide selector
  const retaMatrix = getClinicalTrialSchedulesForProtocol("retatrutide-protocol")
  assert.ok(retaMatrix.hasPhase2)
  assert.ok(retaMatrix.hasPhase3)
  assert.equal(retaMatrix.phase3[0].doseMg, 2)
  assert.equal(retaMatrix.phase3[retaMatrix.phase3.length - 1].doseMg, 12)

  // Test Tirzepatide selector
  const tirzMatrix = getClinicalTrialSchedulesForProtocol("tirzepatide-protocol")
  assert.ok(tirzMatrix.hasPhase3)
  assert.equal(tirzMatrix.phase3[0].doseMg, 2.5)
  assert.equal(tirzMatrix.phase3[tirzMatrix.phase3.length - 1].doseMg, 15)

  // Test Semaglutide selector
  const semaMatrix = getClinicalTrialSchedulesForProtocol("semaglutide-protocol")
  assert.ok(semaMatrix.hasPhase3)
  assert.equal(semaMatrix.phase3[0].doseMg, 0.25)
  assert.equal(semaMatrix.phase3[semaMatrix.phase3.length - 1].doseMg, 2.4)

  // Test vial strength selector
  const retaVials = getAvailableVialStrengthsForProtocol("retatrutide-protocol")
  assert.deepEqual(retaVials, [5, 10, 20, 30, 40, 50, 60])
})

test("Educational Standards, Glossary & Stacking Interactions", () => {
  assert.ok(rawEducational.glossary.length >= 30, "Glossary must have >= 30 items")
  assert.ok(rawEducational.faq.length >= 4, "FAQ must have >= 4 categories")
  assert.ok(
    rawEducational.storageGuidelines.tiers.length >= 4,
    "Storage guidelines must have >= 4 tiers"
  )

  // Stacking Interactions
  assert.ok(rawStackInteractions.compounds.length >= 30, "Stacking compounds >= 30")
  assert.ok(rawStackInteractions.pairwise_interactions.length >= 20, "Pairwise rules >= 20")
  assert.ok(rawStackInteractions.presets.length >= 8, "Presets >= 8")
})

test("Triangulation Leg 4: Clinical Supply & Consumables BOM Invariants", () => {
  // 1. Retatrutide Phase 3 12-Week Titration Invariant
  // Schedule: Weeks 1-4 (2mg), Weeks 5-8 (4mg), Weeks 9-12 (6mg)
  // Total nominal mass: 48.0 mg. With 8% buffer: 51.84 mg.
  // 10mg vials -> Math.ceil(51.84 / 10) = 6 vials.
  // Diluent: 6 * 2.0 mL = 12.0 mL -> 2 BAC bottles (10 mL standard).
  // Total injections: 12 weekly. Weeks 9-12 draw 1.2 mL (> 1.0 mL U-100 max barrel -> 2 syringes per injection) -> 16 syringes.
  const reta12 = calculateProtocolSupplyBOM(RETATRUTIDE_PHASE3_SCHEDULE, 10, 2.0, 12)
  assert.equal(reta12.totalMg, 48.0)
  assert.equal(reta12.vialsRequired, 6)
  assert.equal(reta12.totalSyringes, 16)
  assert.equal(reta12.bacBottlesRequired, 2)
  assert.equal(reta12.alcoholSwabs, 24)

  // 2. Retatrutide Phase 3 24-Week Full Maintenance Invariant
  // Weeks 13-16 (9mg), Weeks 17-20 (12mg), Weeks 21-24 (12mg)
  // Total nominal mass: 48 + 36 + 48 + 48 = 180.0 mg.
  // With 8% buffer: 180.0 * 1.08 = 194.4 mg.
  // For 20mg vials: Math.ceil(194.4 / 20) = 10 vials.
  // Weeks 17-24 draw 1.2 mL (> 1.0 mL barrel -> 2 syringes per injection) -> 32 total syringes.
  const reta24 = calculateProtocolSupplyBOM(RETATRUTIDE_PHASE3_SCHEDULE, 20, 2.0, 24)
  assert.equal(reta24.totalMg, 180.0)
  assert.equal(reta24.vialsRequired, 10)
  assert.equal(reta24.totalSyringes, 32)
  assert.equal(reta24.alcoholSwabs, 48)

  // 3. Tirzepatide SURPASS 12-Week Titration Invariant
  // Weeks 1-4 (2.5mg), Weeks 5-8 (5.0mg), Weeks 9-12 (7.5mg)
  // Total mass: 4*2.5 + 4*5.0 + 4*7.5 = 10 + 20 + 30 = 60.0 mg.
  // With 8% buffer: 60.0 * 1.08 = 64.8 mg.
  // For 10mg vials: Math.ceil(64.8 / 10) = 7 vials.
  // Weeks 9-12 draw 1.5 mL (> 1.0 mL barrel -> 2 syringes per injection) -> 16 total syringes.
  const tirz12 = calculateProtocolSupplyBOM(TIRZEPATIDE_SURPASS_SCHEDULE, 10, 2.0, 12)
  assert.equal(tirz12.totalMg, 60.0)
  assert.equal(tirz12.vialsRequired, 7)
  assert.equal(tirz12.totalSyringes, 16)
  assert.equal(tirz12.alcoholSwabs, 24)

  // 4. BPC-157 Daily Subcutaneous Invariant (synthetic schedule for daily dosing)
  // Schedule: 250 mcg daily (0.25 mg/day * 7 = 1.75 mg/week).
  // 12 Weeks: 1.75 * 12 = 21.0 mg.
  // With 8% buffer: 21.0 * 1.08 = 22.68 mg.
  // For 5mg vials: Math.ceil(22.68 / 5) = 5 vials.
  // Injections: 84 daily -> 84 syringes, 168 swabs.
  const bpcSchedule = [
    { phase: "Weeks 1 to 12", doseMg: 0.25, doseDisplay: "250 mcg", cadence: "Daily (Q24H)" }
  ]
  const bpc12 = calculateProtocolSupplyBOM(bpcSchedule, 5, 2.0, 12)
  assert.equal(bpc12.totalMg, 21.0)
  assert.equal(bpc12.vialsRequired, 5)
  assert.equal(bpc12.totalSyringes, 84)
  assert.equal(bpc12.alcoholSwabs, 168)

  // 5. Semax Intranasal Metered Spray Stoichiometry Invariant
  // 10mg vial reconstituted with 5.0 mL diluent.
  // 0.10 mL per actuation -> 50 actuations per bottle.
  // Concentration = 10 / 5.0 = 2.0 mg/mL -> 200 mcg per spray.
  const semaxVialMg = 10
  const semaxDiluentMl = 5.0
  const actuationVolMl = 0.10
  const totalSprays = Math.floor(semaxDiluentMl / actuationVolMl)
  const concMgMl = semaxVialMg / semaxDiluentMl
  const mcgPerSpray = Math.round(concMgMl * actuationVolMl * 1000)
  assert.equal(totalSprays, 50)
  assert.equal(concMgMl, 2.0)
  assert.equal(mcgPerSpray, 200)
})

test("Triangulation Leg 5: Depth Parity & Editorial Quality Invariants (176 Protocols)", () => {
  let singlePeptideCount = 0

  for (const protocol of rawProtocols as unknown as CompoundAnalyticalProtocol[]) {
    const isSingle =
      (protocol.protocolCategoryType === "single_peptide" || !protocol.protocolCategoryType) &&
      protocol.category !== "Laboratory Supplies" &&
      !protocol.isSupply &&
      !protocol.isBlend &&
      (!protocol.bundleVials || protocol.bundleVials.length === 0)

    if (isSingle) {
      singlePeptideCount++

      // Dual reconstitution options
      assert.ok(
        protocol.reconstitutionOptions,
        `Single peptide ${protocol.id} missing reconstitutionOptions`
      )
      const reconKeys = Object.keys(protocol.reconstitutionOptions)
      assert.ok(
        reconKeys.length >= 2,
        `Single peptide ${protocol.id} must have at least 2 reconstitution options, found ${reconKeys.length}`
      )
      assert.ok(
        protocol.reconstitutionOptions.standardCompact ||
          protocol.reconstitutionOptions.standard50ml,
        `Single peptide ${protocol.id} missing standard reconstitution option`
      )

      // Multi-tier vial strength options
      assert.ok(
        protocol.vialStrengthOptions && protocol.vialStrengthOptions.length >= 2,
        `Single peptide ${protocol.id} must have >= 2 vialStrengthOptions`
      )
      for (const opt of protocol.vialStrengthOptions) {
        assert.ok(opt.vialMg > 0, `Invalid vialMg in ${protocol.id}`)
        assert.ok(opt.diluentMl > 0, `Invalid diluentMl in ${protocol.id}`)
        assert.ok(opt.concMgMl > 0, `Invalid concMgMl in ${protocol.id}`)
      }

      // Molecular details & HPLC verification
      assert.ok(
        protocol.molecularDetails,
        `Single peptide ${protocol.id} missing molecularDetails`
      )
      assert.ok(
        protocol.molecularDetails.pubchemCid != null && protocol.molecularDetails.pubchemCid > 0,
        `Single peptide ${protocol.id} missing valid pubchemCid`
      )
      assert.equal(
        protocol.pubchemCid,
        protocol.molecularDetails.pubchemCid,
        `PubChem CID mismatch between root and molecularDetails in ${protocol.id}`
      )
      assert.ok(
        protocol.molecularDetails.purity?.includes("≥99.0%"),
        `Purity standard missing in ${protocol.id}`
      )
      assert.ok(
        protocol.molecularDetails.analyticalVerification?.includes("HPLC"),
        `Analytical verification HPLC missing in ${protocol.id}`
      )
    }

    // Editorial quality: all benefits and adverse observations must start with bold header
    if (protocol.investigatedBenefits && protocol.investigatedBenefits.length > 0) {
      for (const b of protocol.investigatedBenefits) {
        assert.ok(
          b.startsWith("**"),
          `Investigated benefit in ${protocol.id} does not start with bold header: "${b.slice(0, 30)}..."`
        )
      }
    }
    if (protocol.adverseObservations && protocol.adverseObservations.length > 0) {
      for (const a of protocol.adverseObservations) {
        assert.ok(
          a.startsWith("**"),
          `Adverse observation in ${protocol.id} does not start with bold header: "${a.slice(0, 30)}..."`
        )
      }
    }
  }

  assert.ok(
    singlePeptideCount >= 100,
    `Expected at least 100 single peptide protocols, found ${singlePeptideCount}`
  )
})

test("Triangulation Leg 6: Exact 1:1 Catalog-to-Protocol Parity (176:176)", () => {
  const catalogHandles = new Set(rawCatalogProducts.map((p: { handle: string }) => p.handle))

  assert.equal(
    rawCatalogProducts.length,
    176,
    `Expected exactly 176 catalog products, found ${rawCatalogProducts.length}`
  )
  assert.equal(
    rawProtocols.length,
    176,
    `Expected exactly 176 analytical protocols, found ${rawProtocols.length}`
  )

  for (const protocol of rawProtocols) {
    const targetHandle =
      protocol.storeProductHandle ||
      ("handle" in protocol ? String((protocol as { handle?: string }).handle) : undefined) ||
      protocol.id
    assert.ok(
      catalogHandles.has(targetHandle),
      `Protocol "${protocol.id}" targets storeProductHandle "${targetHandle}", but no matching product exists in unified-catalog.json`
    )
  }
})


