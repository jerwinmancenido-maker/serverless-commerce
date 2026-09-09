/**
 * @file    apps/backend/src/api/admin/bot-missions/purge/route.ts
 * @module  AdminBotMissionsPurgeRoute (Autonomous Agent Runner Module)
 * @purpose Cancels synthetic QA test orders, releases inventory reservations, and marks orders as purged.
 * @contracts
 *   API:     POST /admin/bot-missions/purge
 *   Service: BotRunnerService
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { botRunnerService } from "../../../../lib/bot-runner/service"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { order_id } = (req.body || {}) as { order_id?: string }

  const result = await botRunnerService.purgeQaOrders(req.scope, order_id)

  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({
    success: true,
    message: `Purged ${result.purged_count} synthetic QA order(s).`,
    purged_count: result.purged_count,
    order_ids: result.order_ids,
  })
}
