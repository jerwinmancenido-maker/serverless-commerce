import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RESEARCH_CONTENT_MODULE } from "../modules/research-content"
import type ResearchContentModuleService from "../modules/research-content/service"

export default async function archiveDuplicateProtocolSeries({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  logger.info("\n=======================================================")
  logger.info("PHASE A: ARCHIVING ORPHANED DUPLICATE PROTOCOL SERIES")
  logger.info("=======================================================\n")

  // Target the 2 unlinked duplicate series created by legacy seeder key mismatch
  const targetDuplicates = [
    {
      id: "01M1XCAG40B7DZXK178P54NVAJ",
      expectedKey: "hgh-somatropin-laboratory-handling",
      compound: "HGH",
    },
    {
      id: "01M1XCB713SXHNKHVVNF6X89C3",
      expectedKey: "hmg-75iu-laboratory-handling",
      compound: "HMG",
    },
  ]

  for (const target of targetDuplicates) {
    const [series] = await service.listResearchProtocolSeries(
      { id: target.id },
      { take: 1, relations: ["revisions"] },
    )

    if (!series) {
      logger.warn(`Series ${target.id} (${target.expectedKey}) not found in DB.`)
      continue
    }

    if (series.archived_at !== null) {
      logger.info(
        `Series ${target.id} (${series.protocol_key}) is already archived at ${series.archived_at}. Skipping.`,
      )
      continue
    }

    // Verify 0 product links before archiving
    const links = await service.listResearchProtocolProductLinks({
      series_id: series.id,
      archived_at: null,
    })

    if (links.length > 0) {
      logger.error(
        `SAFETY HALT: Series ${series.id} has ${links.length} active product links! Refusing to archive.`,
      )
      continue
    }

    logger.info(
      `Soft-archiving duplicate series ${series.id} (${series.protocol_key}) for ${target.compound}...`,
    )
    await service.updateResearchProtocolSeries({
      id: series.id,
      archived_at: new Date(),
    })
    logger.info(`Successfully archived series ${series.id}.`)
  }

  // Verify canonical series are active and linked
  const canonicalSeriesKeys = ["hgh-somatropin", "hmg-75iu"]
  for (const key of canonicalSeriesKeys) {
    const [canonical] = await service.listResearchProtocolSeries(
      { protocol_key: key, archived_at: null },
      { take: 1 },
    )
    if (canonical) {
      const links = await service.listResearchProtocolProductLinks({
        series_id: canonical.id,
        archived_at: null,
      })
      logger.info(
        `[VERIFIED CANONICAL] ${canonical.protocol_key} (${canonical.id}): active = true, product links = ${links.length}`,
      )
    } else {
      logger.error(`[CRITICAL] Canonical series ${key} not found or is archived!`)
    }
  }

  logger.info("\nPhase A archive execution complete.\n")
}
