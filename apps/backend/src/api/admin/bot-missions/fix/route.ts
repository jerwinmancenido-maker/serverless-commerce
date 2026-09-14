/**
 * @file    apps/backend/src/api/admin/bot-missions/fix/route.ts
 * @module  AdminBotMissionsFixRoute (Autonomous Agent Runner Module)
 * @purpose 1-Click surgical AST defect auto-fixer and patch remediation endpoint.
 * @contracts
 *   API:     POST /admin/bot-missions/fix
 *   Service: BotRunnerService
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { botRunnerService } from "../../../../lib/bot-runner/service"

export const AUTHENTICATE = false

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { defect_id, fix_all } = (req.body || {}) as {
    defect_id?: string
    fix_all?: boolean
  }

  res.setHeader("Cache-Control", "private, no-store")

  if (fix_all) {
    const result = botRunnerService.applyAllDefectFixes()
    return res.status(200).json({
      message: `Successfully applied ${result.fixedCount} defect fix(es).`,
      results: result.results,
      defects: botRunnerService.getKnownDefects(),
    })
  }

  if (!defect_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Either 'defect_id' or 'fix_all: true' must be provided."
    )
  }

  try {
    const result = botRunnerService.applyDefectFix(defect_id)
    return res.status(200).json({
      message: `Defect ${defect_id} fixed successfully.`,
      result,
      defects: botRunnerService.getKnownDefects(),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new MedusaError(MedusaError.Types.INVALID_DATA, msg)
  }
}
