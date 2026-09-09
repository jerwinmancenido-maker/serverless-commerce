/**
 * @file    apps/backend/src/jobs/revoke-archived-protocol-accesses.ts
 * @module  RevokeArchivedProtocolAccessesJob (Research Tracking & Content Modules)
 * @purpose Nightly scheduled job to revoke active protocol profile access records pointing to archived protocol series.
 * @contracts
 *   Job:     revoke-archived-protocol-accesses · 0 2 * * *
 *   Service: ResearchTrackingModuleService · ResearchContentModuleService
 */

import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../modules/research-content"
import type ResearchContentModuleService from "../modules/research-content/service"
import { RESEARCH_TRACKING_MODULE } from "../modules/research-tracking"
import type ResearchTrackingModuleService from "../modules/research-tracking/service"

export default async function revokeArchivedProtocolAccesses(
  container: MedusaContainer,
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const trackingService = container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const contentService = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )

  try {
    const activeAccesses =
      await trackingService.listResearchProtocolProfileAccesses({
        status: "active",
      })

    if (!activeAccesses.length) {
      return
    }

    const seriesIds = Array.from(
      new Set(activeAccesses.map((access) => access.protocol_series_id)),
    )

    const seriesList = await contentService.listResearchProtocolSeries({
      id: seriesIds,
    })

    const seriesById = new Map(seriesList.map((series) => [series.id, series]))

    const orphanAccesses = activeAccesses.filter((access) => {
      const series = seriesById.get(access.protocol_series_id)
      return !series || series.archived_at !== null
    })

    if (!orphanAccesses.length) {
      return
    }

    let revokedCount = 0
    const affectedSeriesIds = new Set<string>()

    for (const access of orphanAccesses) {
      try {
        await trackingService.updateResearchProtocolProfileAccesses({
          id: access.id,
          status: "revoked",
        })
        revokedCount++
        affectedSeriesIds.add(access.protocol_series_id)
      } catch (revokeError) {
        logger.warn(
          `[Orphan Access Cleanup] Failed to revoke access #${access.id}: ${
            revokeError instanceof Error ? revokeError.message : String(revokeError)
          }`,
        )
      }
    }

    if (revokedCount > 0) {
      logger.info(
        `[Orphan Access Cleanup] Revoked ${revokedCount} orphan access record(s) for ${affectedSeriesIds.size} archived series.`,
      )
    }
  } catch (error) {
    logger.error(
      `[Orphan Access Cleanup] Job failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}

export const config = {
  name: "revoke-archived-protocol-accesses",
  schedule: "0 2 * * *",
}
