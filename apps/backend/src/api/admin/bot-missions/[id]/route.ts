/**
 * @file    apps/backend/src/api/admin/bot-missions/[id]/route.ts
 * @module  AdminBotMissionDetailRoute (Autonomous Agent Runner Module)
 * @purpose Retrieves live telemetry, timestamped step logs, and handles abort actions for a specific bot run.
 * @contracts
 *   API:     GET · POST /admin/bot-missions/:id
 *   Service: BotRunnerService
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { botRunnerService } from "../../../../lib/bot-runner/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const run = botRunnerService.getRun(id)

  if (!run) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Bot run "${id}" was not found.`
    )
  }

  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({ run })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const { action } = (req.body || {}) as { action?: string }

  if (action === "abort") {
    const success = botRunnerService.abortRun(id)
    const run = botRunnerService.getRun(id)
    res.setHeader("Cache-Control", "private, no-store")
    res.status(200).json({
      success,
      message: success ? "Run aborted successfully." : "Run was not in progress.",
      run,
    })
    return
  }

  throw new MedusaError(
    MedusaError.Types.INVALID_DATA,
    `Unsupported action "${action}". Expected "abort".`
  )
}
