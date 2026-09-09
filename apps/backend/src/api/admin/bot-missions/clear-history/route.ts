/**
 * @file    apps/backend/src/api/admin/bot-missions/clear-history/route.ts
 * @module  AdminBotMissionsClearHistoryRoute (Autonomous Agent Runner Module)
 * @purpose Clears past execution run history logs while preserving any in-progress active mission.
 * @contracts
 *   API:     POST /admin/bot-missions/clear-history
 *   Service: BotRunnerService
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { botRunnerService } from "../../../../lib/bot-runner/service"

export async function POST(
  _req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  botRunnerService.clearHistory()

  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({
    success: true,
    message: "Bot mission run history cleared successfully.",
  })
}
