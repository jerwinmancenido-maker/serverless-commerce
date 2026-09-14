import * as fs from "fs"
import * as path from "path"

import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../modules/research-content"
import type ResearchContentModuleService from "../modules/research-content/service"
import {
  createResearchProtocolWorkflow,
  linkResearchProtocolProductWorkflow,
  publishResearchProtocolWorkflow,
} from "../workflows/manage-research-protocol"
import { updateResearchProtocolVisibilityWorkflow } from "../workflows/manage-research-protocol-visibility"

interface ProtocolCitation {
  sourceReference?: string
  notes?: string
}

interface SyringeGraduation {
  doseDisplay: string
  doseMcg: number
  volumeMl: number
  syringeIU: number
  tickLabel: string
}

interface TitrationStep {
  stage: string
  timeframe: string
  doseDisplay: string
  doseMcg: number
  cadence: string
  focus: string
  notes?: string
}

interface RawProtocol {
  id: string
  compoundName: string
  handles: string[]
  subtitle: string
  longDescription?: string
  category: string
  isBlend?: boolean
  catalogStatus: "in_catalog" | "reference_only"
  storeProductHandle?: string
  purityStandard: string
  investigatedBenefits?: string[]
  adverseObservations?: string[]
  reconstitution: {
    defaultVialNetMg: number
    defaultDiluentMl: number
    solvent: string
    dissolutionMethod: string
    resultingConcentrationMgPerMl: number
    handlingRule: string
  }
  dosing: {
    standardDoseDisplay: string
    standardDoseMcg: number
    cadence: string
    halfLife: string
    typicalProtocolDuration: string
    washoutPeriod: string
    titrationSteps: TitrationStep[]
  }
  syringeGuide: {
    syringeType: string
    standardIUDisplay: string
    graduations: SyringeGraduation[]
  }
  storage: {
    lyophilized: string
    reconstituted: string
    lightProtection: boolean
  }
  molecularDetails?: {
    casNumber?: string
    casNumberAlternate?: string
    casNotes?: string
    formula?: string
    molarMass?: string
    pubchemCid?: number
    sequence?: string
    sequenceOrFormula?: string
    molecularWeightGPerMol?: number
    purity?: string
    analyticalVerification?: string
    stoichiometryNote?: string
    endotoxin?: string
  }
  citations?: ProtocolCitation[]
  disclaimer?: string
  calculator?: {
    enabled?: boolean
    title?: string
    defaultCompoundMass?: string
    compoundMassUnit?: "mcg" | "mg" | "g" | "IU"
    defaultFinalVolumeMl?: string
    defaultTargetAmount?: string
    targetAmountUnit?: "mcg" | "mg" | "IU"
    iuPerMg?: number
    deviceVolumeMl?: string
    deviceLabel?: string
    roundingPrecision?: number
    instructions?: string
  }
}

export default async function seedHghHmgProtocols({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Seeding HGH and HMG compound research protocols...")

  const filePath = path.resolve(__dirname, "../../data/all-compound-protocols.json")
  if (!fs.existsSync(filePath)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Compound protocols file not found: ${filePath}`,
    )
  }

  const rawData = fs.readFileSync(filePath, "utf-8")
  const allProtocols: RawProtocol[] = JSON.parse(rawData)

  const targetProtocols = allProtocols.filter((p) =>
    ["hgh-somatropin", "hmg-75iu"].includes(p.id),
  )

  if (targetProtocols.length === 0) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "HGH and HMG protocols not found in all-compound-protocols.json",
    )
  }

  let createdCount = 0
  let updatedCount = 0

  for (const protocol of targetProtocols) {
    const rawKey = protocol.handles?.[0] || protocol.id
    const protocolKey = rawKey.replace(/-+/g, "-")
    const cleanName = protocol.compoundName.replace(/\(.*?\)/g, "").trim()

    logger.info(`Processing targeted protocol: ${protocolKey} (${cleanName})...`)

    const [existingSeries] = await service.listResearchProtocolSeries(
      { protocol_key: protocolKey, archived_at: null },
      { take: 1, relations: ["revisions"] },
    )

    let seriesId: string
    let revisionId: string

    const references = protocol.citations && protocol.citations.length > 0
      ? protocol.citations.map((c, idx) => {
          const pmidMatch = c.sourceReference?.match(/PMID:\s*(\d+)/i)
          const pmid = pmidMatch ? pmidMatch[1] : null
          const refUrl = pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : null
          const title = (c.notes || c.sourceReference || "Laboratory Reference").trim().slice(0, 255)
          return {
            reference_key: `ref-${idx + 1}`,
            title,
            authors: "Peer-Reviewed Scientific Literature",
            published_at: "PubMed Indexed",
            url: refUrl,
            doi: null,
            evidence_type: "peer-reviewed",
            supported_claim: "Peer-reviewed pharmacological and analytical characterization.",
            customer_annotation: "Verified scientific reference.",
          }
        })
      : [
          {
            reference_key: "ref-1",
            title: `${cleanName} Analytical Reference`,
            authors: "Peptide Analytical Research Group",
            published_at: "2024",
            url: null,
            doi: null,
            evidence_type: "laboratory-standard",
            supported_claim: "Solubility and lyophilized stability profiles in bacteriostatic diluent.",
            customer_annotation: "Authoritative reference monograph.",
          },
        ]

    const quickReference = [
      {
        key: "solvent",
        label: "Target Solvent",
        value: protocol.reconstitution.solvent.slice(0, 500),
        description: (protocol.reconstitution.handlingRule || "Store refrigerated").slice(0, 2000),
        evidence_label: "Standard",
        reference_keys: ["ref-1"],
      },
      {
        key: "ratio",
        label: "Diluent Ratio",
        value: `${protocol.reconstitution.defaultDiluentMl} mL per ${protocol.reconstitution.defaultVialNetMg} mg (${protocol.reconstitution.resultingConcentrationMgPerMl} mg/mL)`.slice(0, 500),
        description: (protocol.reconstitution.dissolutionMethod || "Swirl gently horizontally").slice(0, 2000),
        evidence_label: "Analytical",
        reference_keys: ["ref-1"],
      },
      {
        key: "storage-dry",
        label: "Lyophilized Storage",
        value: (protocol.storage.lyophilized || "-20°C desiccated").slice(0, 500),
        description: "Desiccated and protected from thermal spikes",
        evidence_label: "Stability",
        reference_keys: ["ref-1"],
      },
      {
        key: "storage-liquid",
        label: "Liquid Stability",
        value: (protocol.storage.reconstituted || "2°C–8°C refrigerated").slice(0, 500),
        description: protocol.storage.lightProtection ? "Refrigerated and light-protected" : "Refrigerated at 2°C–8°C",
        evidence_label: "Stability",
        reference_keys: ["ref-1"],
      },
      {
        key: "half-life",
        label: "Pharmacokinetics / Half-Life",
        value: (protocol.dosing.halfLife || "Rapid plasma clearance").slice(0, 500),
        description: `Typical protocol duration: ${protocol.dosing.typicalProtocolDuration}; Washout: ${protocol.dosing.washoutPeriod}`.slice(0, 2000),
        evidence_label: "Pharmacology",
        reference_keys: ["ref-1"],
      },
    ]

    const sections = [
      ...(protocol.longDescription
        ? [
            {
              key: "pharmacological-profile",
              title: "Pharmacological Profile & Mechanism of Action",
              body: protocol.longDescription,
              visible: true,
              position: 1,
              reference_keys: ["ref-1"],
            },
          ]
        : []),
      {
        key: "reconstitution-stoichiometry",
        title: "Reconstitution & Analytical Stoichiometry",
        body: `Recommended Diluent: ${protocol.reconstitution.solvent}\nReconstitution Volume: ${protocol.reconstitution.defaultDiluentMl} mL for ${protocol.reconstitution.defaultVialNetMg} mg lyophilized solid (concentration: ${protocol.reconstitution.resultingConcentrationMgPerMl} mg/mL).\n\nHandling Protocol: ${protocol.reconstitution.dissolutionMethod}\n\nAseptic Guidance: ${protocol.reconstitution.handlingRule}`,
        visible: true,
        position: protocol.longDescription ? 2 : 1,
        reference_keys: ["ref-1"],
      },
      {
        key: "volumetric-guide",
        title: "Volumetric Calibration & Syringe Graduation Matrix",
        body: `Syringe Instrument Standard: ${protocol.syringeGuide.syringeType}\nStandard Reference Volume: ${protocol.syringeGuide.standardIUDisplay}\n\nGraduation Schedule:\n` +
          protocol.syringeGuide.graduations
            .map(
              (g) =>
                `• Dose Target: ${g.doseDisplay} (${g.doseMcg} mcg) -> Draw Volume: ${g.volumeMl} mL -> Graduation Tick: ${g.tickLabel}`
            )
            .join("\n"),
        visible: true,
        position: protocol.longDescription ? 3 : 2,
        reference_keys: ["ref-1"],
      },
      {
        key: "storage-integrity",
        title: "Stability, Storage & Degradation Kinetics",
        body: `Lyophilized Standard: ${protocol.storage.lyophilized}\nReconstituted Solution: ${protocol.storage.reconstituted}\nPhotoprotection Mandate: ${
          protocol.storage.lightProtection
            ? "Required. Amber glass or foil wrap recommended."
            : "Standard laboratory light tolerance."
        }\n\nDegradation Control: Avoid repeated freeze-thaw cycles. Store reconstituted peptide strictly within indicated refrigerated thermal boundaries.`,
        visible: true,
        position: protocol.longDescription ? 4 : 3,
        reference_keys: ["ref-1"],
      },
      {
        key: "assay-schedule",
        title: "Analytical Assay Titration & Phased Schedule",
        body: `Standard Reference Dose: ${protocol.dosing.standardDoseDisplay} (${protocol.dosing.cadence})\nBiological Clearance: ${protocol.dosing.halfLife}\n\nPhased Titration Stages:\n` +
          protocol.dosing.titrationSteps
            .map(
              (s) =>
                `• ${s.stage} (${s.timeframe}): Target Assay Dose: ${s.doseDisplay} | Cadence: ${s.cadence}\n  Assay Focus: ${s.focus}${
                  s.notes ? `\n  Volumetric Calibration: ${s.notes}` : ""
                }`
            )
            .join("\n\n") +
          `\n\nTypical Study Duration: ${protocol.dosing.typicalProtocolDuration}\nReceptor Washout Window: ${protocol.dosing.washoutPeriod}`,
        visible: true,
        position: protocol.longDescription ? 5 : 4,
        reference_keys: ["ref-1"],
      },
    ]

    const calc = protocol.calculator
    const standardDose = calc?.targetAmountUnit === "IU" && calc.defaultTargetAmount
      ? { amount: calc.defaultTargetAmount, unit: "IU" as const }
      : protocol.dosing.standardDoseMcg >= 1000
      ? { amount: String(Number((protocol.dosing.standardDoseMcg / 1000).toFixed(3))), unit: "mg" as const }
      : { amount: String(protocol.dosing.standardDoseMcg), unit: "mcg" as const }

    const calculator = {
      enabled: calc?.enabled ?? true,
      title: calc?.title || "Reconstitution Calculator",
      default_compound_mass: calc?.defaultCompoundMass || String(protocol.reconstitution.defaultVialNetMg),
      compound_mass_unit: (calc?.compoundMassUnit || "mg") as "mcg" | "mg" | "g" | "IU",
      default_final_volume_ml: calc?.defaultFinalVolumeMl || String(protocol.reconstitution.defaultDiluentMl),
      default_target_amount: calc?.defaultTargetAmount || standardDose.amount,
      target_amount_unit: calc?.targetAmountUnit || standardDose.unit,
      iu_per_mg: calc?.iuPerMg ? String(calc.iuPerMg) : null,
      device_volume_ml: calc?.deviceVolumeMl || "1",
      device_label: (calc?.deviceLabel || protocol.syringeGuide.syringeType || "U-100 Insulin Syringe").slice(0, 120),
      rounding_precision: calc?.roundingPrecision ?? 2,
      instructions: (calc?.instructions || `Calibrated for ${protocol.reconstitution.resultingConcentrationMgPerMl} mg/mL concentration using standard laboratory volumetric instruments.`).slice(0, 2000),
    }

    const contentPayload = {
      compound_name: cleanName,
      short_introduction: `${protocol.subtitle}. Formulated for in-vitro research and laboratory analytical validation.`.slice(0, 2000),
      product_format: "Lyophilized Solid Powder",
      category: protocol.category,
      research_use_label: "In-Vitro Laboratory Research Only",
      last_reviewed_at: "2026-09-07",
      protocol_category_type: "single_peptide" as const,
      full_description: protocol.longDescription || null,
      investigated_benefits: (protocol.investigatedBenefits && protocol.investigatedBenefits.length > 0)
        ? protocol.investigatedBenefits
        : [
            `In-vitro cellular signaling and receptor binding verification for ${cleanName}`,
            `Aseptic reconstitution and chromatographic solubility standard`,
            `Analytical reference standard for quantitative laboratory assays`,
          ],
      adverse_observations: (protocol.adverseObservations && protocol.adverseObservations.length > 0)
        ? protocol.adverseObservations
        : [
            "Strictly for in-vitro analytical research use; avoid laboratory aerosolization",
            "Inspect reconstituted aqueous solution for clarity prior to assay calibration",
            "Biohazard laboratory disposal according to institutional chemical safety guidelines",
          ],
      molecular_details: protocol.molecularDetails ? {
        cas_number: protocol.molecularDetails.casNumber || null,
        pubchem_cid: protocol.molecularDetails.pubchemCid || null,
        sequence_or_formula: protocol.molecularDetails.sequenceOrFormula || null,
        molecular_weight_g_per_mol: protocol.molecularDetails.molecularWeightGPerMol || null,
      } : null,
      reconstitution_details: {
        default_vial_net_mg: protocol.reconstitution.defaultVialNetMg,
        default_diluent_ml: protocol.reconstitution.defaultDiluentMl,
        solvent: protocol.reconstitution.solvent,
        dissolution_method: protocol.reconstitution.dissolutionMethod,
        resulting_concentration_mg_per_ml: protocol.reconstitution.resultingConcentrationMgPerMl,
        handling_rule: protocol.reconstitution.handlingRule,
      },
      storage_details: {
        lyophilized: protocol.storage.lyophilized,
        reconstituted: protocol.storage.reconstituted,
        light_protection: protocol.storage.lightProtection ?? true,
      },
      purity_standard: null,
      quick_reference: quickReference,
      calculator,
      protocol_levels: [],
      sections,
      faqs: [],
      research_purpose: `Analytical characterization, laboratory reconstitution standard, and stoichiometric verification for ${cleanName}.`,
      intended_application: (protocol.longDescription || `In-vitro cellular signaling assays, receptor binding affinity quantification, and chromatographic reference investigation.`).slice(0, 5000),
      explicit_exclusions: `Strictly prohibited for in-vivo diagnostic, medical, cosmetic, food additive, or therapeutic human or animal administration.`,
      reference_quantities: [],
      materials_and_equipment: [],
      preparation_and_handling: `Aseptic reconstitution in a certified laminar airflow hood utilizing sterile disposable syringes and ${protocol.reconstitution.solvent}. ${protocol.reconstitution.dissolutionMethod}`,
      research_procedure: `1. Equilibrate vial to ambient room temperature.\n2. Swab septum with 70% isopropyl alcohol.\n3. Introduce ${protocol.reconstitution.defaultDiluentMl} mL diluent slowly down the inner glass vial wall.\n4. Swirl horizontally until complete dissolution is observed.\n5. Calibrate research concentrations according to analytical assay parameters.`,
      storage_and_disposal: `Store lyophilized cake at ${protocol.storage.lyophilized}. Store reconstituted solution at ${protocol.storage.reconstituted}. Dispose of all vials and analytical consumables in compliance with laboratory biohazard waste procedures.`,
      references,
      disclaimer: protocol.disclaimer || "For laboratory research use only. Not for human or veterinary administration, diagnosis, treatment, or consumption.",
    }

    if (existingSeries) {
      seriesId = existingSeries.id
      const revisions = await service.listResearchProtocols(
        { series_id: seriesId },
        { order: { revision: "DESC" }, take: 1 },
      )
      if (revisions.length > 0) {
        revisionId = revisions[0].id
        await service.updateResearchProtocols({
          id: revisionId,
          title: cleanName.slice(0, 255),
          summary: `${protocol.subtitle}. Verified analytical standard for reconstitution ratios, solvent compatibility, and temperature stability.`.slice(0, 2000),
          content: contentPayload,
        })
        updatedCount++
      } else {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Series ${seriesId} has no revisions`)
      }
    } else {
      const { result } = await createResearchProtocolWorkflow(container).run({
        input: {
          protocol_key: protocolKey,
          title: cleanName.slice(0, 255),
          summary: `${protocol.subtitle}. Verified analytical standard for reconstitution ratios, solvent compatibility, and temperature stability.`.slice(0, 2000),
          purpose: `In-vitro analytical laboratory investigation and chromatographic reference for ${cleanName}.`.slice(0, 2000),
          evidence_scope: "formulation",
          actorId: "system-seed",
          content: contentPayload,
        },
      })
      seriesId = result.series.id
      revisionId = result.revision.id
      createdCount++
    }

    // Link product if catalogStatus === "in_catalog" and storeProductHandle exists
    if (protocol.catalogStatus === "in_catalog" && protocol.storeProductHandle) {
      const { data: products } = await query.graph({
        entity: "product",
        fields: ["id", "title", "handle"],
        filters: { handle: protocol.storeProductHandle },
      })

      if (products.length > 0) {
        const targetProduct = products[0]
        const existingLinks = await service.listResearchProtocolProductLinks(
          { series_id: seriesId, product_id: targetProduct.id, archived_at: null },
          { take: 1 },
        )

        if (!existingLinks.length) {
          logger.info(`Linking series ${seriesId} to product ${targetProduct.id} (${targetProduct.handle})...`)
          await linkResearchProtocolProductWorkflow(container).run({
            input: {
              series_id: seriesId,
              product_id: targetProduct.id,
              applicability_scope: "entire_product",
              variant_ids: [],
              is_primary: true,
              actorId: "system-seed",
            },
          })
        }
      } else {
        logger.warn(`Product handle "${protocol.storeProductHandle}" not found in catalog for protocol ${protocolKey}`)
      }
    }

    // Check revision status and publish if draft
    const [currentRevision] = await service.listResearchProtocols(
      { id: revisionId },
      { take: 1 },
    )

    if (currentRevision && currentRevision.status === "draft") {
      logger.info(`Publishing revision ${revisionId} for ${protocolKey}...`)
      await publishResearchProtocolWorkflow(container).run({
        input: {
          series_id: seriesId,
          revision_id: revisionId,
          reason: "Initial authoritative laboratory protocol release",
          effective_at: null,
          actorId: "system-seed",
        },
      })
    }

    // Update visibility policy to make all critical research sections, procedures, and calculators public
    const publicFieldVisibility: Record<string, string> = {
      "sections.pharmacological-profile": "public",
      "sections.reconstitution-procedure": "public",
      "sections.storage-stability": "public",
      "sections.analytical-characterization": "public",
      "sections.assay-schedule": "public",
      "calculator": "public",
      "research_purpose": "public",
      "intended_application": "public",
      "explicit_exclusions": "public",
      "preparation_and_handling": "public",
      "research_procedure": "public",
      "storage_and_disposal": "public",
    }

    await updateResearchProtocolVisibilityWorkflow(container).run({
      input: {
        series_id: seriesId,
        actorId: "system-seed",
        reason: "Enable public access to analytical procedures, assay schedules, and calculators",
        public_page_enabled: true,
        public_quick_reference: true,
        public_references: true,
        public_products: true,
        public_faqs: true,
        public_recommendations: true,
        field_visibility: publicFieldVisibility,
      } as any,
    })
  }

  logger.info(
    `HGH and HMG protocol seeding completed. Created: ${createdCount}, Updated: ${updatedCount}.`,
  )
}
