/**
 * @file    apps/backend/src/api/admin/bot-missions/ast-audit/route.ts
 * @module  AdminBotMissionsAstAuditRoute (Autonomous Agent Runner Module)
 * @purpose On-demand line-by-line static AST code audit for workflow step compensations, subscribers, and type boundaries.
 * @contracts
 *   API:     GET · POST /admin/bot-missions/ast-audit
 *   Service: AstCodeAuditor
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { runAstCodeAudit } from "../../../../lib/bot-runner/ast-auditor"

export const AUTHENTICATE = false

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const report = runAstCodeAudit()
  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({ report })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const report = runAstCodeAudit()
  res.setHeader("Cache-Control", "private, no-store")
  res.status(200).json({ report })
}
