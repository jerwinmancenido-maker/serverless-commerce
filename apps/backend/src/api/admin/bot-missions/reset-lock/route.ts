/**
 * @file    apps/backend/src/api/admin/bot-missions/reset-lock/route.ts
 * @module  AdminBotMissionsResetLockRoute (Autonomous Agent Runner Module)
 * @purpose Resets in-flight mutex locks and recovers from interrupted/crashed background missions.
 * @contracts
 *   API:     POST /admin/bot-missions/reset-lock
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
  botRunnerService.forceResetLock()

  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({
    success: true,
    message: "Bot runner mutex lock reset successfully.",
  })
}
