/**
 * @file    apps/backend/src/api/admin/bot-missions/daemon/route.ts
 * @module  AdminBotMissionsDaemonRoute (Autonomous Agent Runner Module)
 * @purpose Telemetry, state query, and start/stop controls for 24/7 autonomous AI bug hunter daemon.
 * @contracts
 *   API:     GET · POST /admin/bot-missions/daemon
 *   Service: BotRunnerService
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { botRunnerService } from "../../../../lib/bot-runner/service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const daemonState = botRunnerService.getDaemonState()
  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({ daemon_state: daemonState })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { action } = (req.body || {}) as { action?: "start" | "stop" | "status" | "toggle" }

  res.setHeader("Cache-Control", "private, no-store")

  if (action === "start") {
    const daemonState = botRunnerService.startDaemon()
    return res.status(200).json({ message: "24/7 AI Bug Hunter started", daemon_state: daemonState })
  }

  if (action === "stop") {
    const daemonState = botRunnerService.stopDaemon()
    return res.status(200).json({ message: "24/7 AI Bug Hunter stopped", daemon_state: daemonState })
  }

  if (action === "status") {
    const daemonState = botRunnerService.getDaemonState()
    return res.status(200).json({ message: "24/7 AI Bug Hunter daemon status", daemon_state: daemonState })
  }

  if (action === "toggle" || !action) {
    const daemonState = botRunnerService.toggleDaemon()
    return res.status(200).json({ message: "24/7 AI Bug Hunter state toggled", daemon_state: daemonState })
  }

  throw new MedusaError(MedusaError.Types.INVALID_DATA, `Unknown action: "${action}". Valid: start, stop, toggle, status.`)
}
