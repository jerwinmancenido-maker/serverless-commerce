/**
 * @file    apps/backend/src/api/admin/bot-missions/rollback/route.ts
 * @module  AdminBotMissionsRollbackRoute (Autonomous Agent Runner Module)
 * @purpose Admin endpoints to inspect 20-minute safety checkpoints and trigger instant rollbacks.
 * @contracts
 *   API:     GET · POST /admin/bot-missions/rollback
 *   Service: BotRunnerService
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { botRunnerService } from "../../../../lib/bot-runner/service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const checkpoints = botRunnerService.getCheckpoints()
  const daemonState = botRunnerService.getDaemonState()

  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({
    checkpoints,
    daemon_state: daemonState,
    total: checkpoints.length,
    next_rollback_at: daemonState.nextRollbackAt,
    last_rollback_at: daemonState.lastRollbackAt,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { action, label, checkpoint_id } = (req.body || {}) as {
    action?: "rollback" | "checkpoint"
    label?: string
    checkpoint_id?: string
  }

  res.setHeader("Cache-Control", "private, no-store")

  if (action === "checkpoint") {
    const checkpoint = botRunnerService.createCheckpoint(label)
    return res.status(200).json({
      message: `Safety checkpoint ${checkpoint.checkpointId} created`,
      checkpoint,
      daemon_state: botRunnerService.getDaemonState(),
    })
  }

  if (action === "rollback" || !action) {
    const result = botRunnerService.revertToCheckpoint(checkpoint_id)
    return res.status(200).json({
      ...result,
      daemon_state: botRunnerService.getDaemonState(),
    })
  }

  throw new MedusaError(
    MedusaError.Types.INVALID_DATA,
    `Invalid action "${action}". Valid actions: "rollback", "checkpoint"`
  )
}
