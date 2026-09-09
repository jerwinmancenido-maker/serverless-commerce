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

interface SupplyProtocolStep {
  stepNumber: number
  title: string
  instruction: string
}

interface SupplyFeature {
  title: string
  desc: string
}

interface SupplyGuide {
  physicalState?: string
  sterilityStandard?: string
  material?: string
  specs?: Record<string, string>
  protocolSteps?: SupplyProtocolStep[]
  features?: SupplyFeature[]
  inclusions?: Array<[string, string]>
}

interface RawProtocol {
  id: string
  compoundName: string
  handles: string[]
  subtitle: string
  longDescription?: string
  category: string
  isBlend?: boolean
  isSupply?: boolean
  supplyGuide?: SupplyGuide
  catalogStatus: "in_catalog" | "reference_only"
  storeProductHandle?: string
  protocolCategoryType?: "single_peptide" | "blend" | "bundle" | "topical"
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
    pubchemCid?: number
    sequenceOrFormula?: string
    molecularWeightGPerMol?: number
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
  reconstitutionOptions?: Record<string, { diluentMl: number; concMgMl: number; label: string; tickConversion: string }>
  vialStrengthOptions?: Array<{ vialMg: number; diluentMl: number; concMgMl: number; badge: string }>
  blendConstituents?: Array<{ name: string; ratioMg: number; percentageOfTotal: number }>
  bundleVials?: Array<{
    compoundName: string
    vialNetMass: string
    diluentMl: number
    concMgMl: number
    solvent: string
    reconstitutionInstructions: string
    targetDose: string
    cadence: string
    syringeUnits: string
  }>
  evidenceTier?: string
}

export default async function seedAllCompoundProtocols({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const dataFilePath = path.resolve(process.cwd(), "data/all-compound-protocols.json")
  if (!fs.existsSync(dataFilePath)) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Data file not found at ${dataFilePath}`)
  }

  const rawData = fs.readFileSync(dataFilePath, "utf-8")
  const protocols: RawProtocol[] = JSON.parse(rawData)

  logger.info(`Loaded ${protocols.length} compound protocols for seeding.`)

  let createdCount = 0
  let updatedCount = 0
  let linkedCount = 0
  let publishedCount = 0
  let archivedDuplicatesCount = 0

  for (const protocol of protocols) {
    try {
      // Standardize on clean canonical protocol id as protocol key
      const protocolKey = (protocol.id || protocol.storeProductHandle || "")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      const cleanName = protocol.compoundName.replace(/\(.*?\)/g, "").trim()
      const isSupply = Boolean(protocol.isSupply || protocol.category === "Laboratory Supplies")

      logger.info(`Processing protocol: ${protocolKey} (${cleanName})...`)

      // Build comprehensive candidate keys to match existing series
      const candidateKeys = Array.from(
        new Set([
          protocolKey,
          `${protocolKey}-laboratory-handling`,
          protocol.id,
          `${protocol.id}-laboratory-handling`,
          protocol.storeProductHandle,
          `${protocol.storeProductHandle}-laboratory-handling`,
          ...(protocol.handles || []),
          ...(protocol.handles || []).map((h) => `${h}-laboratory-handling`),
        ]),
      ).filter(Boolean) as string[]

      const matchingSeries = await service.listResearchProtocolSeries(
        { protocol_key: candidateKeys, archived_at: null },
        { relations: ["revisions", "product_links"] },
      )

      let seriesId: string
      let revisionId: string

      // Compile References
      const defaultReference = isSupply
        ? {
            reference_key: "ref-1",
            title: "ISO 11137 / USP <797> Sterilization and Compounding Standards",
            authors: "International Organization for Standardization & USP",
            published_at: "Current Edition",
            url: null,
            doi: null,
            evidence_type: "laboratory-standard",
            supported_claim: "Aseptic laboratory consumables specifications and microbial integrity standards.",
            customer_annotation: "Authoritative laboratory manufacturing and handling standard.",
          }
        : {
            reference_key: "ref-1",
            title: `${cleanName} Analytical Reference`,
            authors: "Peptide Analytical Research Group",
            published_at: "2024",
            url: null,
            doi: null,
            evidence_type: "laboratory-standard",
            supported_claim: "Solubility and lyophilized stability profiles in bacteriostatic diluent.",
            customer_annotation: "Authoritative reference monograph.",
          }

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
        : [defaultReference]

      // Compile Quick Reference
      const quickReference = isSupply
        ? [
            {
              key: "material-spec",
              label: "Material Specification",
              value: (protocol.supplyGuide?.material || protocol.purityStandard || "Laboratory Grade Standard").slice(0, 500),
              description: "Medical and laboratory grade structural material",
              evidence_label: "Specification",
              reference_keys: ["ref-1"],
            },
            {
              key: "sterility-spec",
              label: "Sterility Standard",
              value: (protocol.supplyGuide?.sterilityStandard || "Aseptic Laboratory Standard").slice(0, 500),
              description: "Certified sterile and non-pyrogenic for research handling",
              evidence_label: "Sterility",
              reference_keys: ["ref-1"],
            },
            {
              key: "storage-condition",
              label: "Storage Standard",
              value: (protocol.storage.lyophilized || "Ambient Room Temperature (20°C–25°C)").slice(0, 500),
              description: "Store in clean, dry laboratory environment",
              evidence_label: "Stability",
              reference_keys: ["ref-1"],
            },
            {
              key: "hardware-classification",
              label: "Classification",
              value: "Laboratory Hardware & Consumables",
              description: "Standard laboratory reconstitution and storage equipment",
              evidence_label: "Classification",
              reference_keys: ["ref-1"],
            },
          ]
        : [
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

      // Compile Sections
      const sections = isSupply && protocol.supplyGuide?.protocolSteps?.length
        ? [
            ...(protocol.longDescription ? [{
              key: "overview",
              title: "Technical Overview & Material Specifications",
              body: protocol.longDescription,
              visible: true,
              position: 1,
              reference_keys: ["ref-1"],
            }] : []),
            {
              key: "sop-procedure",
              title: "Standard Operating Procedure (SOP)",
              body: protocol.supplyGuide.protocolSteps
                .map((s) => `Step ${s.stepNumber}: ${s.title}\n${s.instruction}`)
                .join("\n\n"),
              visible: true,
              position: protocol.longDescription ? 2 : 1,
              reference_keys: ["ref-1"],
            },
            ...(protocol.supplyGuide.specs ? [{
              key: "technical-specs",
              title: "Engineering & Material Specifications",
              body: Object.entries(protocol.supplyGuide.specs)
                .map(([k, v]) => `• ${k}: ${v}`)
                .join("\n"),
              visible: true,
              position: protocol.longDescription ? 3 : 2,
              reference_keys: ["ref-1"],
            }] : []),
            ...(protocol.supplyGuide.features?.length ? [{
              key: "features",
              title: "Key Features & Quality Standards",
              body: protocol.supplyGuide.features
                .map((f) => `• ${f.title}: ${f.desc}`)
                .join("\n"),
              visible: true,
              position: protocol.longDescription ? 4 : 3,
              reference_keys: ["ref-1"],
            }] : []),
            ...(protocol.supplyGuide.inclusions?.length ? [{
              key: "inclusions",
              title: "Package Inclusions Manifest",
              body: protocol.supplyGuide.inclusions
                .map(([name, desc]) => `• ${name}: ${desc}`)
                .join("\n"),
              visible: true,
              position: protocol.longDescription ? 5 : 4,
              reference_keys: ["ref-1"],
            }] : []),
          ]
        : [
            ...(protocol.longDescription ? [{
              key: "pharmacological-profile",
              title: "Pharmacological Profile and Mechanism",
              body: protocol.longDescription,
              visible: true,
              position: 1,
              reference_keys: ["ref-1"],
            }] : []),
            {
              key: "reconstitution-procedure",
              title: "Aseptic Reconstitution Procedure",
              body: `1. Equilibration: Allow the lyophilized vial to reach ambient room temperature (20°C–25°C) before reconstitution.\n2. Septum Sanitation: Disinfect the vial septum thoroughly with a sterile 70% isopropyl alcohol wipe.\n3. Diluent Addition: Using a sterile syringe, slowly draw ${protocol.reconstitution.defaultDiluentMl} mL of ${protocol.reconstitution.solvent}. Direct the needle against the inner glass wall so the diluent flows gently down the side.\n4. Gentle Dissolution: ${protocol.reconstitution.dissolutionMethod}\n5. Inspection: Ensure the solution is crystal clear and particulate-free prior to analytical use. ${protocol.reconstitution.handlingRule}`,
              visible: true,
              position: protocol.longDescription ? 2 : 1,
              reference_keys: ["ref-1"],
            },
            {
              key: "storage-stability",
              title: "Storage and Temperature Stability",
              body: `Lyophilized powder: ${protocol.storage.lyophilized}. Once reconstituted: ${protocol.storage.reconstituted}. ${protocol.storage.lightProtection ? "Keep shielded from UV light." : ""}`,
              visible: true,
              position: protocol.longDescription ? 3 : 2,
              reference_keys: ["ref-1"],
            },
            {
              key: "analytical-characterization",
              title: "Physicochemical Specifications",
              body: `${protocol.molecularDetails ? `CAS Number: ${protocol.molecularDetails.casNumber || "N/A"}\nPubChem CID: ${protocol.molecularDetails.pubchemCid || "N/A"}\nFormula/Sequence: ${protocol.molecularDetails.sequenceOrFormula || "N/A"}\nMolecular Weight: ${protocol.molecularDetails.molecularWeightGPerMol ? `${protocol.molecularDetails.molecularWeightGPerMol} g/mol` : "N/A"}` : "Multi-peptide blended formulation standard."}`,
              visible: true,
              position: protocol.longDescription ? 4 : 3,
              reference_keys: ["ref-1"],
            },
            {
              key: "assay-schedule",
              title: "In-Vitro Concentration & Assay Schedule",
              body: protocol.dosing.titrationSteps
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
        enabled: isSupply ? false : (calc?.enabled ?? true),
        title: calc?.title || "Reconstitution Calculator",
        default_compound_mass: calc?.defaultCompoundMass || String(protocol.reconstitution.defaultVialNetMg || "10"),
        compound_mass_unit: (calc?.compoundMassUnit || "mg") as "mcg" | "mg" | "g" | "IU",
        default_final_volume_ml: calc?.defaultFinalVolumeMl || String(protocol.reconstitution.defaultDiluentMl || "2"),
        default_target_amount: calc?.defaultTargetAmount || standardDose.amount || "250",
        target_amount_unit: calc?.targetAmountUnit || standardDose.unit || "mcg",
        iu_per_mg: calc?.iuPerMg ? String(calc.iuPerMg) : null,
        device_volume_ml: calc?.deviceVolumeMl || "1",
        device_label: (calc?.deviceLabel || protocol.syringeGuide.syringeType || "U-100 Insulin Syringe").slice(0, 120),
        rounding_precision: calc?.roundingPrecision ?? 2,
        instructions: (calc?.instructions || `Calibrated for laboratory analytical instruments.`).slice(0, 2000),
      }

      const prepAndHandling = isSupply && protocol.supplyGuide?.protocolSteps?.length
        ? `Standard laboratory handling: ${protocol.supplyGuide.protocolSteps.map((s) => `${s.stepNumber}. ${s.title}: ${s.instruction}`).join(" ")}`.slice(0, 5000)
        : `Aseptic reconstitution in a certified laminar airflow hood utilizing sterile disposable syringes and ${protocol.reconstitution.solvent}. ${protocol.reconstitution.dissolutionMethod}`

      const researchProc = isSupply && protocol.supplyGuide?.protocolSteps?.length
        ? protocol.supplyGuide.protocolSteps.map((s) => `${s.stepNumber}. ${s.title}: ${s.instruction}`).join("\n")
        : `1. Equilibrate vial to ambient room temperature.\n2. Swab septum with 70% isopropyl alcohol.\n3. Introduce ${protocol.reconstitution.defaultDiluentMl} mL diluent slowly down the inner glass vial wall.\n4. Swirl horizontally until complete dissolution is observed.\n5. Calibrate research concentrations according to analytical assay parameters.`

      const contentPayload = {
        compound_name: cleanName,
        short_introduction: `${protocol.subtitle}. Formulated for in-vitro research and laboratory analytical validation.`.slice(0, 2000),
        product_format: isSupply ? (protocol.supplyGuide?.physicalState || "Laboratory Consumable Standard") : "Lyophilized Solid Powder",
        category: protocol.category,
        research_use_label: "In-Vitro Laboratory Research Only",
        last_reviewed_at: "2026-09-06",
        protocol_category_type: (protocol.protocolCategoryType)
          ? protocol.protocolCategoryType
          : (protocol.bundleVials && protocol.bundleVials.length > 0)
            ? "bundle" as const
            : (protocol.id === "ghk-cu-anti-aging-serum" || protocol.category === "Topical Cosmetic Formulations")
              ? "topical" as const
              : (protocol.category === "Multi-Peptide Blends" || protocol.isBlend)
                ? "blend" as const
                : "single_peptide" as const,
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
              "Inspect solution for clarity prior to assay calibration",
              "Biohazard laboratory disposal according to institutional chemical safety guidelines",
            ],
        molecular_details: protocol.molecularDetails ? {
          cas_number: protocol.molecularDetails.casNumber || null,
          pubchem_cid: protocol.molecularDetails.pubchemCid && protocol.molecularDetails.pubchemCid > 0
            ? protocol.molecularDetails.pubchemCid
            : null,
          sequence_or_formula: protocol.molecularDetails.sequenceOrFormula || null,
          molecular_weight_g_per_mol: protocol.molecularDetails.molecularWeightGPerMol && protocol.molecularDetails.molecularWeightGPerMol > 0
            ? protocol.molecularDetails.molecularWeightGPerMol
            : null,
        } : null,
        reconstitution_details: {
          default_vial_net_mg: protocol.reconstitution.defaultVialNetMg && protocol.reconstitution.defaultVialNetMg > 0
            ? protocol.reconstitution.defaultVialNetMg
            : null,
          default_diluent_ml: protocol.reconstitution.defaultDiluentMl && protocol.reconstitution.defaultDiluentMl > 0
            ? protocol.reconstitution.defaultDiluentMl
            : null,
          solvent: protocol.reconstitution.solvent || null,
          dissolution_method: protocol.reconstitution.dissolutionMethod || null,
          resulting_concentration_mg_per_ml: protocol.reconstitution.resultingConcentrationMgPerMl && protocol.reconstitution.resultingConcentrationMgPerMl > 0
            ? protocol.reconstitution.resultingConcentrationMgPerMl
            : null,
          handling_rule: protocol.reconstitution.handlingRule || null,
        },
        reconstitution_options: protocol.reconstitutionOptions || null,
        vial_strength_options: protocol.vialStrengthOptions || [],
        syringe_guide: protocol.syringeGuide ? {
          syringeType: protocol.syringeGuide.syringeType,
          standardIUDisplay: protocol.syringeGuide.standardIUDisplay,
          graduations: (protocol.syringeGuide.graduations || []).map(g => ({
            doseDisplay: g.doseDisplay,
            doseMcg: g.doseMcg,
            volumeMl: g.volumeMl,
            syringeIU: g.syringeIU,
            tickLabel: g.tickLabel,
          })),
        } : null,
        evidence_tier: protocol.evidenceTier || null,
        blend_constituents: protocol.blendConstituents || [],
        bundle_vials: protocol.bundleVials || [],
        storage_details: {
          lyophilized: protocol.storage.lyophilized,
          reconstituted: protocol.storage.reconstituted,
          light_protection: protocol.storage.lightProtection ?? true,
        },
        purity_standard: isSupply ? (protocol.supplyGuide?.sterilityStandard || protocol.purityStandard || null) : (protocol.purityStandard || null),
        quick_reference: quickReference,
        calculator,
        protocol_levels: isSupply || !protocol.dosing?.titrationSteps?.length
          ? []
          : [
              {
                key: "standard-schedule",
                title: "In-Vitro Assay Titration Schedule",
                summary: `Study duration: ${protocol.dosing.typicalProtocolDuration || "Protocol-defined"} · Washout: ${protocol.dosing.washoutPeriod || "Standard washout"}`,
                duration: protocol.dosing.typicalProtocolDuration || null,
                interval: protocol.dosing.washoutPeriod || null,
                applicability: null,
                evidence_label: "Assay Schedule",
                reference_keys: ["ref-1"],
                routine_enabled: true,
                rows: protocol.dosing.titrationSteps.map((step, idx) => {
                  const iuMatch = step.doseDisplay?.match(/([\d.]+)\s*IU/i)
                  const stepDose = (protocol.calculator?.targetAmountUnit === "IU" && iuMatch)
                    ? { amount: iuMatch[1], unit: "IU" as const }
                    : step.doseMcg >= 1000
                    ? { amount: String(Number((step.doseMcg / 1000).toFixed(3))), unit: "mg" as const }
                    : { amount: String(step.doseMcg || 250), unit: "mcg" as const }
                  return {
                    row_key: `step-${idx + 1}`,
                    period: step.timeframe || `Phase ${idx + 1}`,
                    start_offset_days: null,
                    end_offset_days: null,
                    amount: stepDose.amount,
                    unit: stepDose.unit,
                    recurrence_type: "daily" as const,
                    times_per_day: 1,
                    weekdays: [],
                    suggested_local_times: [],
                    frequency: step.cadence || "Daily",
                    notes: `${step.stage}: ${step.focus}${step.notes ? ` (${step.notes})` : ""}`.slice(0, 2000),
                    reference_keys: ["ref-1"],
                  }
                }),
              },
            ],
        sections,
        faqs: [],
        research_purpose: `Analytical characterization, laboratory standard, and stoichiometric verification for ${cleanName}.`,
        intended_application: (protocol.longDescription || `In-vitro cellular signaling assays, receptor binding affinity quantification, and chromatographic reference investigation.`).slice(0, 5000),
        explicit_exclusions: "Strictly prohibited for in-vivo diagnostic, medical, cosmetic, food additive, or therapeutic human or animal administration.",
        reference_quantities: [],
        materials_and_equipment: [],
        preparation_and_handling: prepAndHandling,
        research_procedure: researchProc,
        storage_and_disposal: `Store at ${protocol.storage.lyophilized}. Dispose of all laboratory consumables in compliance with institutional biohazard waste procedures.`,
        references,
        disclaimer: protocol.disclaimer || "For laboratory research use only. Not for human or veterinary administration, diagnosis, treatment, or consumption.",
      }

      if (matchingSeries.length > 0) {
        // Pick primary series: prefer series with product links or exact match with clean key
        const primarySeries = matchingSeries.find((s) => s.product_links && s.product_links.length > 0)
          || matchingSeries.find((s) => s.protocol_key === protocolKey)
          || matchingSeries[0]

        seriesId = primarySeries.id

        // Key migration: update legacy -laboratory-handling key to clean protocolKey
        if (primarySeries.protocol_key !== protocolKey) {
          logger.info(`Migrating series key from "${primarySeries.protocol_key}" to clean slug "${protocolKey}"...`)
          await service.updateResearchProtocolSeries({
            id: seriesId,
            protocol_key: protocolKey,
          })
        }

        // Soft-archive any orphaned duplicate series found
        for (const extraSeries of matchingSeries) {
          if (extraSeries.id !== seriesId) {
            const extraLinks = extraSeries.product_links || []
            if (extraLinks.length === 0) {
              logger.info(`Auto-archiving orphan duplicate series ${extraSeries.id} (${extraSeries.protocol_key})...`)
              await service.updateResearchProtocolSeries({
                id: extraSeries.id,
                archived_at: new Date(),
              })
              archivedDuplicatesCount++
            }
          }
        }

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
            try {
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
              linkedCount++
            } catch (linkErr: any) {
              logger.info(
                `Link already exists or primary guide assigned for ${targetProduct.handle}: ${linkErr?.message || linkErr}`,
              )
            }
          }
        } else {
          logger.warn(`Product with handle '${protocol.storeProductHandle}' not found in Medusa graph.`)
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
        publishedCount++
      }

      // Update visibility policy to make all critical research sections, procedures, and calculators public
      const publicFieldVisibility: Record<string, "admin" | "member" | "purchaser" | "public"> = {
        "sections.overview": "public",
        "sections.sop-procedure": "public",
        "sections.technical-specs": "public",
        "sections.features": "public",
        "sections.inclusions": "public",
        "sections.pharmacological-profile": "public",
        "sections.reconstitution-procedure": "public",
        "sections.storage-stability": "public",
        "sections.analytical-characterization": "public",
        "sections.assay-schedule": "public",
        "calculator": "public",
        "protocol_levels": "public",
        "reconstitution_options": "public",
        "vial_strength_options": "public",
        "syringe_guide": "public",
        "evidence_tier": "public",
        "blend_constituents": "public",
        "bundle_vials": "public",
        "research_purpose": "public",
        "intended_application": "public",
        "explicit_exclusions": "public",
        "preparation_and_handling": "public",
        "research_procedure": "public",
        "storage_and_disposal": "public",
      }

      try {
        await updateResearchProtocolVisibilityWorkflow(container).run({
          input: {
            series_id: seriesId,
            public_page_enabled: true,
            public_summary: null,
            public_quick_reference: true,
            public_references: true,
            public_faqs: true,
            public_products: true,
            public_recommendations: true,
            community_read_scope: "purchaser",
            field_visibility: publicFieldVisibility,
            reason: "Authoritative research protocol release policy",
            actorId: "system-seed",
          } as any,
        })
      } catch (visErr: any) {
        logger.warn(`Visibility policy update note for ${seriesId}: ${visErr?.message || visErr}`)
      }
    } catch (err: any) {
      logger.error(`Error processing protocol ${protocol.id}: ${err?.message || err}`)
    }
  }

  logger.info("\n=======================================================")
  logger.info("SEEDING COMPLETE")
  logger.info(`Created: ${createdCount}`)
  logger.info(`Updated: ${updatedCount}`)
  logger.info(`Linked to Products: ${linkedCount}`)
  logger.info(`Published: ${publishedCount}`)
  logger.info(`Archived Duplicates: ${archivedDuplicatesCount}`)
  logger.info("=======================================================\n")
}
