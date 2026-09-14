/**
 * @file    apps/backend/src/api/admin/bot-missions/dossier/route.ts
 * @module  AdminBotMissionsDossierRoute (Autonomous Agent Runner Module)
 * @purpose Admin endpoint to generate and download the comprehensive 360° 6-Lens Audit Dossier.
 * @contracts
 *   API:     GET /admin/bot-missions/dossier
 *   Service: BotRunnerService
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { botRunnerService } from "../../../../lib/bot-runner/service"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const dossier = botRunnerService.generateAuditDossier()
  const format = (req.query?.format as string) || "json"

  res.setHeader("Cache-Control", "private, no-store")

  if (format === "markdown" || format === "raw") {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8")
    res.setHeader("Content-Disposition", "attachment; filename=\"audit-dossier.md\"")
    return res.status(200).send(dossier)
  }

  res.status(200).json({
    generated_at: new Date().toISOString(),
    dossier,
  })
}
