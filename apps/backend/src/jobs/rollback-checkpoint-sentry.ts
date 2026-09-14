/**
 * @file    apps/backend/src/jobs/rollback-checkpoint-sentry.ts
 * @module  RollbackCheckpointSentryJob (Autonomous Agent Runner Module)
 * @purpose Automated safety rollback sentry running every 20 minutes to checkpoint system state, purge synthetic QA orders, and heal any detected drift.
 * @contracts
 *   Job: rollback-checkpoint-sentry · Schedule: every 20 mins · Service: BotRunnerService
 */

import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { botRunnerService } from "../lib/bot-runner/service"

export default async function rollbackCheckpointSentry(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    logger.info("[20-Min Safety Rollback Sentry] Triggering periodic 20-minute safety checkpoint and synthetic order purge...")
    const checkpoint = await botRunnerService.executePeriodicRollbackCheckpoint(container)
    logger.info(
      `[20-Min Safety Rollback Sentry] Checkpoint ${checkpoint.checkpointId} created (${checkpoint.commitHash.slice(0, 7)}). Synthetic orders purged: ${checkpoint.syntheticOrdersPurged}. Next rollback in 20 mins.`
    )
  } catch (err: unknown) {
    logger.error(
      `[20-Min Safety Rollback Sentry] Periodic rollback checkpoint error: ${err instanceof Error ? err.message : String(err)}`
    )
  }
}

export const config = {
  name: "rollback-checkpoint-sentry",
  schedule: "*/20 * * * *",
}
