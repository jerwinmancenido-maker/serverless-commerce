/**
 * @file    apps/backend/src/jobs/continuous-bot-hunter.ts
 * @module  ContinuousBotHunterJob (Autonomous Agent Runner Module)
 * @purpose 24/7 autonomous background scheduled watchdog running every 10 minutes to detect anomalies and heal regressions.
 * @contracts
 *   Job: continuous-bot-hunter · Schedule: every 10 minutes · Service: BotRunnerService
 */

import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { botRunnerService } from "../lib/bot-runner/service"

export default async function continuousBotHunter(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const daemonState = botRunnerService.getDaemonState()

  if (!daemonState.isEnabled) {
    return
  }

  try {
    logger.info("[24/7 AI Bug Hunter] Executing continuous autonomous watchdog scan cycle...")
    botRunnerService.executeDaemonScanCycle(container)
    logger.info("[24/7 AI Bug Hunter] Watchdog scan cycle completed successfully.")
  } catch (err: unknown) {
    logger.error(
      `[24/7 AI Bug Hunter] Watchdog cycle error: ${err instanceof Error ? err.message : String(err)}`
    )
  }
}

export const config = {
  name: "continuous-bot-hunter",
  schedule: "*/10 * * * *",
}
