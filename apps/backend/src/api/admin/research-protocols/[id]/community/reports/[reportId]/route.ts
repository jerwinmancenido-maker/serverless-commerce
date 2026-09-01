import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { AdminResolveResearchProtocolReport } from "../../../../../../../modules/research-content/contracts/research-protocol-community"
import { resolveProtocolReportWorkflow } from "../../../../../../../workflows/manage-research-protocol-community"

export async function POST(req: AuthenticatedMedusaRequest<AdminResolveResearchProtocolReport>, res: MedusaResponse) {
  const { result } = await resolveProtocolReportWorkflow(req.scope).run({ input: { ...req.validatedBody, series_id: req.params.id, report_id: req.params.reportId, actor_id: req.auth_context.actor_id } })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ report: { id: result.id, status: result.status } })
}
