import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { RESEARCH_CONTENT_MODULE } from "../modules/research-content"
import type ResearchContentModuleService from "../modules/research-content/service"

export default async function archiveDraftAcceptanceProtocol({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  logger.info("\n=======================================================")
  logger.info("ARCHIVING DRAFT TEST FIXTURE FOR 100% CATALOG PARITY")
  logger.info("=======================================================\n")

  const targetKey = "local-protocol-acceptance-20260831"
  const [series] = await service.listResearchProtocolSeries(
    { protocol_key: targetKey },
    { take: 1, relations: ["revisions"] },
  )

  if (!series) {
    logger.warn(`Series with key "${targetKey}" not found in DB.`)
    return
  }

  if (series.archived_at !== null) {
    logger.info(
      `Series ${series.id} ("${series.protocol_key}") is already archived at ${series.archived_at}. Skipping.`,
    )
    return
  }

  // Verify 0 product links
  const links = await service.listResearchProtocolProductLinks({
    series_id: series.id,
    archived_at: null,
  })

  if (links.length > 0) {
    logger.error(
      `SAFETY HALT: Series ${series.id} has ${links.length} active product links! Refusing to archive.`,
    )
    return
  }

  logger.info(
    `Archiving draft test fixture series ${series.id} ("${series.protocol_key}")...`,
  )
  await service.updateResearchProtocolSeries({
    id: series.id,
    archived_at: new Date(),
  })
  logger.info(`Successfully archived series ${series.id}.`)

  // Count remaining active and published series
  const activeSeries = await service.listResearchProtocolSeries(
    { archived_at: null },
    { select: ["id", "protocol_key"] },
  )
  const publishedProtocols = await service.listResearchProtocols(
    { status: "published" },
    { relations: ["series"] },
  )
  const activePublished = publishedProtocols.filter(
    (p) => p.series && p.series.archived_at === null,
  )

  logger.info(`\nVerification Summary:`)
  logger.info(`- Total Active Series in DB: ${activeSeries.length}`)
  logger.info(`- Total Active Published Series: ${activePublished.length}`)
  logger.info(`- Catalog Parity Status: ${activeSeries.length === 81 ? "100% PARITY ACHIEVED (81/81)" : "MISMATCH"}\n`)
}
