/**
 * @file apps/backend/src/scripts/seed-protocol-comparisons.ts
 * @module ProtocolComparisonSeeder
 * @purpose Generates and seeds canonical head-to-head peptide comparisons directly from catalog protocols.
 * @contracts Inputs: all-compound-protocols.json | Outputs: records in peptide_comparison table
 */

import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as path from "path"
import { RESEARCH_CONTENT_MODULE } from "../modules/research-content"
import type ResearchContentModuleService from "../modules/research-content/service"

// Canonical High-Impact Protocol Matchups
const CANONICAL_MATCHUP_PAIRS = [
  { a: "bpc-157", b: "tb-500", customVerdict: "The Wolverine Synergy: Angiogenic microvascular sprouting from BPC-157 provides nutrient perfusion, while TB-500 accelerates tenocyte and myoblast migration into the repaired zone." },
  { a: "tirzepatide", b: "semaglutide", customVerdict: "Incretin Receptor Benchmark: Semaglutide functions selectively as a GLP-1 mono-agonist, whereas Tirzepatide adds GIP co-agonism for direct adipose lipid buffering and reduced emetic distress." },
  { a: "retatrutide", b: "tirzepatide", customVerdict: "Triple vs. Dual Incretin Hierarchy: Retatrutide introduces glucagon receptor agonism to stimulate hepatic fatty acid oxidation and thermogenesis beyond GLP-1/GIP incretin boundaries." },
  { a: "cagrilintide", b: "semaglutide", customVerdict: "Incretin + Amylin Synergy: Cagrilintide complements GLP-1 receptor agonism through calcitonin/RAMP amylin receptor binding, suppressing postprandial glucagon and decelerating gastric emptying via independent neurochemical pathways." },
  { a: "cjc-1295-no-dac", b: "ipamorelin", customVerdict: "Dual Somatotrophic Amplification: GHRH receptor stimulation synergizes with selective GHSR ghrelin-mimetic secretagogue pulses to elevate endogenous IGF-1 without somatotroph desensitization." },
  { a: "tesamorelin", b: "sermorelin", customVerdict: "GHRH Analog Specificity: Tesamorelin features an N-terminal trans-3-hexenoyl modification conferring superior enzymatic stability and visceral adipose selectivity compared to native Sermorelin (GHRH 1-29)." },
  { a: "mk-677", b: "ipamorelin", customVerdict: "Oral vs. Pulsatile GH Secretagogue: MK-677 provides sustained 24-hour ghrelin receptor activation via oral bioavailability, whereas Ipamorelin offers precise, pulsatile pituitary somatotroph release without elevating cortisol or prolactin." },
  { a: "bpc-157", b: "ghk-cu", customVerdict: "Regenerative & Epigenetic Matrix: BPC-157 drives rapid localized microvascular angiogenesis, while GHK-Cu regulates decorin synthesis and rebalances matrix metalloproteinases for functional collagen architecture." },
  { a: "bpc-157", b: "kpv", customVerdict: "Vascular Healing vs. Mucosal Immunomodulation: BPC-157 accelerates granulation tissue formation, while KPV (Alpha-MSH C-terminal tripeptide) inhibits NF-κB nuclear translocation to quell acute mucosal and intestinal inflammation." },
  { a: "epithalon", b: "ghk-cu", customVerdict: "Cellular Longevity & Gene Reset: Epithalon induces telomerase catalytic subunit (hTERT) transcription, complementing GHK-Cu's broad-spectrum reset of over 4,000 human genes toward youthful expression profiles." },
  { a: "mots-c", b: "ss-31", customVerdict: "Mitochondrial Dual-Axis Synergy: SS-31 selectively binds cardiolipin to optimize inner mitochondrial membrane cristae and electron flux, while MOTS-c activates AMPK to govern systemic metabolic plasticity and glucose disposal." },
  { a: "foxo4-dri", b: "epithalon", customVerdict: "Senolytic Clearance vs. Telomere Protection: FOXO4-DRI disrupts the FOXO4-p53 complex to trigger apoptosis in senescent cells, while Epithalon preserves telomeric integrity in surrounding healthy progenitor populations." },
  { a: "semax", b: "selank", customVerdict: "Neuro-Restorative Equilibrium: Semax stimulates central BDNF/TrkB signaling for cognitive agility and neuroprotection, while Selank modulates GABAergic and enkephalin pathways to dampen anxiogenic stress markers." },
  { a: "na-semax-amidate", b: "semax", customVerdict: "Enhanced Bioavailability & BBB Permeance: N-terminal acetylation and C-terminal amidation in NA-Semax-Amidate drastically decrease carboxypeptidase degradation, allowing prolonged central nervous system half-life over standard Semax." },
  { a: "thymosin-alpha-1", b: "ll-37", customVerdict: "Adaptive Immunomodulation vs. Antimicrobial Membrane Lysis: Thymosin Alpha-1 promotes dendritic cell maturation and CD4+/CD8+ T-cell differentiation, while LL-37 exerts direct biophysical disruption of microbial membranes." },
  { a: "melanotan-1", b: "melanotan-2", customVerdict: "Receptor Selectivity Profile: Melanotan I functions as a linear, selective MC1R agonist for photoprotective eumelanin synthesis, whereas cyclic Melanotan II crosses the blood-brain barrier to trigger central MC3R/MC4R sexual arousal pathways." },
]

function toCompoundProfile(proto: any) {
  const mol = proto.molecularDetails || {}
  const recon = proto.reconstitution || {}
  const dosing = proto.dosing || {}
  const benefits = proto.investigatedBenefits || []
  const citations = proto.citations || []

  const primaryTarget =
    benefits[0]?.mechanism ||
    benefits[0]?.title ||
    proto.subtitle ||
    "Selective biological pathway activation"

  const primaryFocus =
    benefits[0]?.summary ||
    proto.subtitle ||
    "Preclinical laboratory evaluation"

  const standardDilution =
    recon.defaultDiluentMl && recon.defaultVialNetMg
      ? `${recon.defaultDiluentMl} mL / ${recon.defaultVialNetMg} mg`
      : undefined

  const formattedCitations = citations.map((c: any, idx: number) => {
    let text = c.notes || c.title || c.text || ""
    if (!text && c.authors) {
      text = `${c.authors}. ${c.journal || ""} ${c.year ? `(${c.year}).` : ""}`.trim()
    }
    if (c.sourceReference && !text.includes(c.sourceReference)) {
      text = text ? `${text} [${c.sourceReference}]` : c.sourceReference
    }
    let pmid = c.pmid
    if (!pmid && c.sourceReference) {
      const match = c.sourceReference.match(/PMID:\s*(\d+)/i)
      if (match) pmid = match[1]
    }
    const url =
      c.url ||
      (c.doi
        ? `https://doi.org/${c.doi}`
        : pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
        : "https://pubmed.ncbi.nlm.nih.gov/")

    return {
      number: idx + 1,
      text: text.trim() || `Preclinical Reference Monograph for ${proto.compoundName || "Compound"}`,
      url,
    }
  })

  return {
    id: proto.id,
    name: proto.compoundName,
    handle: proto.storeProductHandle || proto.id,
    tag: proto.subtitle || proto.protocolCategoryType || "Research Peptide",
    category: proto.category || "General Research",
    sequence_or_class:
      mol.sequenceOrFormula ||
      mol.sequence ||
      mol.formula ||
      (mol.casNumber ? `CAS ${mol.casNumber}` : "Synthetic Peptide"),
    molecular_mass: mol.molarMass || (mol.molecularWeightGPerMol ? `${mol.molecularWeightGPerMol.toFixed(2)} Da` : "Monoisotopic Standard"),
    primary_target: primaryTarget,
    half_life: dosing.halfLife || "Experimental Model Dependent",
    reconstitution_diluent: recon.solvent || "Bacteriostatic Water USP (0.9% Benzyl Alcohol)",
    standard_dilution: standardDilution,
    primary_focus: primaryFocus,
    purity: mol.purity || "≥99.0% (HPLC Verified)",
    typical_cadence: dosing.cadence || dosing.standardDoseDisplay || "Daily Laboratory Cadence",
    citations: formattedCitations,
  }
}

export default async function seedProtocolComparisons({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  logger.info("=======================================================")
  logger.info("STARTING CANONICAL PROTOCOL COMPARISONS SEEDER")
  logger.info("=======================================================")

  const protocolsPath = path.resolve(__dirname, "../../data/all-compound-protocols.json")
  if (!fs.existsSync(protocolsPath)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Protocols file not found at ${protocolsPath}`
    )
  }

  const rawProtocols: any[] = JSON.parse(fs.readFileSync(protocolsPath, "utf-8"))
  const protocolMap = new Map<string, any>()
  for (const p of rawProtocols) {
    protocolMap.set(p.id, p)
  }

  let createdCount = 0
  let updatedCount = 0

  const comparisonsPath = path.resolve(__dirname, "../../data/peptide-comparisons.json")
  let comparisonRecords: any[] = []
  if (fs.existsSync(comparisonsPath)) {
    comparisonRecords = JSON.parse(fs.readFileSync(comparisonsPath, "utf-8"))
    logger.info(`Loaded ${comparisonRecords.length} curated comparisons from ${comparisonsPath}`)
  }

  if (comparisonRecords.length > 0) {
    for (const record of comparisonRecords) {
      const slug = record.slug
      const payload = {
        slug: record.slug,
        title: record.title,
        subtitle: record.subtitle,
        category: record.category || "General Research",
        compound_a: record.compound_a || record.compoundA,
        compound_b: record.compound_b || record.compoundB,
        summary: record.summary,
        synergy_verdict: record.synergy_verdict || record.synergyVerdict || "Comparative analytical evaluation across target receptor families.",
        vectors: record.vectors || [],
        citations: record.citations || [],
        status: "published" as const,
        published_at: record.published_at ? new Date(record.published_at) : new Date(),
      }

      const existing = await service.listPeptideComparisons({ slug }, { take: 1 })

      if (existing.length > 0) {
        await (service as any).updatePeptideComparisons({
          id: existing[0].id,
          ...payload,
        })
        updatedCount++
        logger.info(`Updated comparison: ${slug}`)
      } else {
        await (service as any).createPeptideComparisons(payload)
        createdCount++
        logger.info(`Created comparison: ${slug}`)
      }
    }
  } else {
    for (const pair of CANONICAL_MATCHUP_PAIRS) {
      const protoA = protocolMap.get(pair.a)
      const protoB = protocolMap.get(pair.b)

      if (!protoA || !protoB) {
        logger.warn(`Could not find protocols for pair: ${pair.a} vs ${pair.b}. Skipping.`)
        continue
      }

      const compA = toCompoundProfile(protoA)
      const compB = toCompoundProfile(protoB)
      const slug = `${compA.id}-vs-${compB.id}`
      const title = `${compA.name} vs. ${compB.name}: Comparative Pharmacodynamics & Molecular Targets`
      const subtitle = `A side-by-side analytical assessment evaluating ${compA.primary_target} against ${compB.primary_target}.`
      const summary = `Evaluating ${compA.name} (${compA.tag}) alongside ${compB.name} (${compB.tag}). While ${compA.name} targets ${compA.primary_focus}, ${compB.name} focuses on ${compB.primary_focus}. Both compounds represent distinct molecular targets within modern peptide research.`

      const vectors = [
        {
          feature: "Primary Receptor Target",
          compoundA_val: compA.primary_target,
          compoundB_val: compB.primary_target,
          verdict: compA.primary_target === compB.primary_target ? "Identical Receptor" : "Distinct Target Receptors",
        },
        {
          feature: "Molecular Mass & Classification",
          compoundA_val: `${compA.molecular_mass} (${compA.sequence_or_class})`,
          compoundB_val: `${compB.molecular_mass} (${compB.sequence_or_class})`,
          verdict: `${compA.tag} vs ${compB.tag}`,
        },
        {
          feature: "In-Vitro Half-Life",
          compoundA_val: compA.half_life,
          compoundB_val: compB.half_life,
          verdict: "Pharmacokinetic Persistence",
        },
        {
          feature: "Reconstitution Standard",
          compoundA_val: `${compA.reconstitution_diluent}${compA.standard_dilution ? ` · ${compA.standard_dilution}` : ""}`,
          compoundB_val: `${compB.reconstitution_diluent}${compB.standard_dilution ? ` · ${compB.standard_dilution}` : ""}`,
          verdict: "Solvent & Dilution Requirement",
        },
        {
          feature: "Primary Research Focus",
          compoundA_val: compA.primary_focus,
          compoundB_val: compB.primary_focus,
          verdict: "Differential Tissue Affinity",
        },
        {
          feature: "Standard Analytical Cadence",
          compoundA_val: compA.typical_cadence || "Varies by experimental model",
          compoundB_val: compB.typical_cadence || "Varies by experimental model",
          verdict: "Protocol Cadence Comparison",
        },
      ]

      const mergedCitations = [
        ...(compA.citations || []),
        ...(compB.citations || []).filter(
          (citB: any) => !(compA.citations || []).some((citA: any) => citA.text === citB.text)
        ),
      ].map((c: any, idx: number) => ({ ...c, number: idx + 1 }))

      const payload = {
        slug,
        title,
        subtitle,
        category: compA.category,
        compound_a: compA,
        compound_b: compB,
        summary,
        synergy_verdict: pair.customVerdict,
        vectors,
        citations: mergedCitations,
        status: "published" as const,
        published_at: new Date(),
      }

      const existing = await service.listPeptideComparisons({ slug }, { take: 1 })

      if (existing.length > 0) {
        await (service as any).updatePeptideComparisons({
          id: existing[0].id,
          ...payload,
        })
        updatedCount++
        logger.info(`Updated comparison: ${slug}`)
      } else {
        await (service as any).createPeptideComparisons(payload)
        createdCount++
        logger.info(`Created comparison: ${slug}`)
      }
    }
  }


  logger.info("=======================================================")
  logger.info("PROTOCOL COMPARISONS SEED COMPLETE")
  logger.info(`  • Comparisons Created:  ${createdCount}`)
  logger.info(`  • Comparisons Updated:  ${updatedCount}`)
  logger.info(`  • Total Processed:      ${CANONICAL_MATCHUP_PAIRS.length}`)
  logger.info("=======================================================")
}
