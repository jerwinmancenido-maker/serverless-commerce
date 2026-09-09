/**
 * @file    apps/backend/src/api/admin/bot-missions/route.ts
 * @module  AdminBotMissionsRoute (Autonomous Agent Runner Module)
 * @purpose Lists available bot missions, execution runs, and triggers autonomous background agent tasks.
 * @contracts
 *   API:     GET · POST /admin/bot-missions
 *   Service: BotRunnerService
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { botRunnerService } from "../../../lib/bot-runner/service"
import type { BotMissionType } from "../../../lib/bot-runner/types"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20
  const missions = botRunnerService.listMissions()
  const runs = botRunnerService.listRuns(limit)
  const activeRun = botRunnerService.getActiveRun()

  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({
    missions,
    runs,
    active_run: activeRun || null,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { mission_type } = (req.body || {}) as { mission_type?: BotMissionType }

  if (!mission_type) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Field 'mission_type' is required (e.g. 'e2e_buyer_fulfillment_smoke')"
    )
  }

  try {
    const run = botRunnerService.startMission(mission_type, req.scope)
    res.setHeader("Cache-Control", "private, no-store")
    res.status(202).json({
      message: "Bot mission launched successfully in background.",
      run,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes("is already in progress")) {
      throw new MedusaError(MedusaError.Types.CONFLICT, message)
    }
    throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
  }
}
