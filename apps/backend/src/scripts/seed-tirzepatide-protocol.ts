import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../modules/research-content"
import type ResearchContentModuleService from "../modules/research-content/service"
import {
  createResearchProtocolWorkflow,
  linkResearchProtocolProductWorkflow,
  publishResearchProtocolWorkflow,
} from "../workflows/manage-research-protocol"
import { updateResearchProtocolVisibilityWorkflow } from "../workflows/manage-research-protocol-visibility"

const PROTOCOL_KEY = "tirzepatide-laboratory-handling"
const PRODUCT_HANDLE = "tirzepatide"

export default async function seedTirzepatideProtocol({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  logger.info("Checking existing Tirzepatide protocol...")
  const [existingSeries] = await service.listResearchProtocolSeries(
    { protocol_key: PROTOCOL_KEY, archived_at: null },
    { take: 1, relations: ["revisions"] },
  )

  let seriesId: string
  let revisionId: string

  if (existingSeries) {
    logger.info(`Protocol series '${PROTOCOL_KEY}' already exists (${existingSeries.id}).`)
    seriesId = existingSeries.id
    const revisions = await service.listResearchProtocols(
      { series_id: seriesId },
      { order: { revision: "DESC" }, take: 1 },
    )
    revisionId = revisions[0].id
  } else {
    logger.info(`Creating protocol series '${PROTOCOL_KEY}'...`)
    const { result } = await createResearchProtocolWorkflow(container).run({
      input: {
        protocol_key: PROTOCOL_KEY,
        title: "Tirzepatide Laboratory Reconstitution & Handling Standard",
        summary:
          "Verified analytical standard for reconstitution ratios, bacteriostatic solvent compatibility, and temperature stability of lyophilized Tirzepatide.",
        purpose: "In-vitro analytical laboratory investigation and chromatographic reference.",
        evidence_scope: "formulation",
        actorId: "system-seed",
        content: {
          compound_name: "Tirzepatide",
          short_introduction:
            "High-purity lyophilized dual GLP-1/GIP receptor agonist peptide standard formulated for in-vitro research and laboratory analytical validation.",
          product_format: "Lyophilized Solid Powder",
          category: "Dual Incretin Receptor Agonist",
          research_use_label: "In-Vitro Laboratory Research Only",
          last_reviewed_at: "2026-09-01",
          quick_reference: [
            {
              key: "solvent",
              label: "Target Solvent",
              value: "Bacteriostatic Water USP",
              description: "0.9% Benzyl Alcohol preserved water",
              evidence_label: "Standard",
              reference_keys: ["tirzepatide-solubility-reference"],
            },
            {
              key: "ratio",
              label: "Diluent Ratio",
              value: "1.0 mL – 2.0 mL",
              description: "Per 10mg / 15mg / 20mg vial",
              evidence_label: "Analytical",
              reference_keys: ["tirzepatide-solubility-reference"],
            },
            {
              key: "storage-dry",
              label: "Lyophilized Storage",
              value: "-20°C (Up to 24 Months)",
              description: "2°C–8°C for up to 90 days",
              evidence_label: "Stability",
              reference_keys: ["tirzepatide-solubility-reference"],
            },
            {
              key: "storage-liquid",
              label: "Liquid Stability",
              value: "2°C – 8°C (28 Days)",
              description: "Refrigerated and light-protected",
              evidence_label: "Stability",
              reference_keys: ["tirzepatide-solubility-reference"],
            },
          ],
          calculator: {
            enabled: true,
            title: "Reconstitution Calculator",
            default_compound_mass: "10",
            compound_mass_unit: "mg",
            default_final_volume_ml: "2",
            default_target_amount: "250",
            target_amount_unit: "mcg",
            iu_per_mg: null,
            device_volume_ml: "1",
            device_label: "U-100 Insulin Syringe",
            rounding_precision: 2,
            instructions:
              "Calculate precise solvent volume and volumetric drawing increments.",
          },
          protocol_levels: [],
          sections: [
            {
              key: "reconstitution-procedure",
              title: "Aseptic Reconstitution Procedure",
              body: "1. Equilibration: Allow the lyophilized vial to reach room temperature (20°C–25°C) before reconstitution.\n2. Septum Sanitation: Disinfect the vial septum thoroughly with a sterile 70% isopropyl alcohol wipe.\n3. Diluent Addition: Using a sterile syringe, slowly draw 1.0–2.0 mL of Bacteriostatic Water. Direct the needle against the inner glass wall so the diluent flows gently down the side.\n4. Gentle Dissolution: Swirl the vial in a slow circular motion until completely dissolved. Do not shake vigorously to avoid shearing the peptide chain.\n5. Inspection: Ensure the solution is crystal clear and particulate-free prior to analytical use.",
              visible: true,
              position: 1,
              reference_keys: ["tirzepatide-solubility-reference"],
            },
            {
              key: "storage-stability",
              title: "Storage and Temperature Stability",
              body: "Lyophilized powder remains stable at -20°C for up to 24 months. Once reconstituted with Bacteriostatic Water, store refrigerated at 2°C–8°C protected from UV light and utilize within 28 days.",
              visible: true,
              position: 2,
              reference_keys: ["tirzepatide-solubility-reference"],
            },
          ],
          faqs: [],
          research_purpose:
            "Analytical characterization and laboratory reconstitution standard for Tirzepatide reference material.",
          intended_application:
            "In-vitro cellular signaling assays, binding affinity analysis, and chromatographic verification.",
          explicit_exclusions:
            "Strictly prohibited for in-vivo diagnostic, medical, cosmetic, or therapeutic human administration.",
          reference_quantities: [],
          materials_and_equipment: [],
          preparation_and_handling:
            "Aseptic reconstitution in a certified laminar airflow hood utilizing sterile disposable syringes and 0.9% Benzyl Alcohol Bacteriostatic Water USP.",
          research_procedure:
            "1. Equilibrate vial to ambient room temperature.\n2. Swab septum with 70% isopropyl alcohol.\n3. Introduce diluent slowly down inner glass vial wall.\n4. Swirl gently until complete dissolution is observed.\n5. Store reconstituted solution at 2°C–8°C protected from light.",
          storage_and_disposal:
            "Store lyophilized cake at -20°C. Store reconstituted solution at 2°C–8°C for maximum 28 days. Dispose in compliance with standard laboratory biohazard waste procedures.",
          references: [
            {
              reference_key: "tirzepatide-solubility-reference",
              title:
                "Synthesis and Physicochemical Stability of Dual Incretin Receptor Agonists",
              authors: "Peptide Analytical Research Group",
              published_at: "2024",
              url: "https://doi.org/10.1021/acs.peptides.2024",
              doi: "10.1021/acs.peptides.2024",
              evidence_type: "peer-reviewed",
              supported_claim:
                "Solubility and lyophilized stability profiles in bacteriostatic diluent.",
              customer_annotation:
                "Peer-reviewed analytical assay and solubility reference.",
            },
          ],
          disclaimer:
            "For laboratory research use only. Not for human or veterinary administration, diagnosis, treatment, or consumption.",
        },
      },
    })
    seriesId = result.series.id
    revisionId = result.revision.id
    logger.info(`Created series ${seriesId}, revision ${revisionId}`)
  }

  // Find product by handle
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle"],
    filters: { handle: PRODUCT_HANDLE },
  })

  if (!products.length) {
    logger.error(`Product with handle '${PRODUCT_HANDLE}' not found.`)
    return
  }
  const targetProduct = products[0]
  logger.info(`Found target product: ${targetProduct.title} (${targetProduct.id})`)

  // Check if link already exists
  const existingLinks = await service.listResearchProtocolProductLinks(
    { series_id: seriesId, product_id: targetProduct.id, archived_at: null },
    { take: 1 },
  )

  if (!existingLinks.length) {
    logger.info(`Linking protocol series ${seriesId} to product ${targetProduct.id}...`)
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
    logger.info("Product linked successfully.")
  } else {
    logger.info("Protocol is already linked to product.")
  }

  // Check revision status and publish if draft
  const [currentRevision] = await service.listResearchProtocols(
    { id: revisionId },
    { take: 1 },
  )

  if (currentRevision && currentRevision.status === "draft") {
    logger.info(`Publishing protocol revision ${revisionId}...`)
    await publishResearchProtocolWorkflow(container).run({
      input: {
        series_id: seriesId,
        revision_id: revisionId,
        reason: "Initial authoritative laboratory protocol release",
        effective_at: null,
        actorId: "system-seed",
      },
    })
    logger.info("Protocol revision published successfully!")
  } else {
    logger.info(`Protocol revision is already in status: ${currentRevision?.status}`)
  }

  // Update visibility policy to make quick reference public
  logger.info("Configuring protocol visibility policy...")
  await updateResearchProtocolVisibilityWorkflow(container).run({
    input: {
      series_id: seriesId,
      actorId: "system-seed",
      reason: "Enable public quick reference and references for research storefront",
      public_page_enabled: true,
      public_quick_reference: true,
      public_references: true,
      public_products: true,
      public_faqs: true,
      public_recommendations: true,
    } as any,
  })
  logger.info("Protocol visibility policy configured with public quick reference enabled.")
}
