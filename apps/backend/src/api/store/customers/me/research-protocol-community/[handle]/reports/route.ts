import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../../modules/research-content"
import { assertCommunityEligibility, getCustomerProtocolEligibility } from "../../../../../../../modules/research-content/community-access"
import type { StoreReportResearchProtocolContent } from "../../../../../../../modules/research-content/contracts/research-protocol-community"
import type ResearchContentModuleService from "../../../../../../../modules/research-content/service"
import { reportProtocolContentWorkflow } from "../../../../../../../workflows/manage-research-protocol-community"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const eligibility = await getCustomerProtocolEligibility({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    protocolHandle: req.params.handle,
  })
  assertCommunityEligibility({ ...eligibility, operation: "read" })
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const [identity] = await service.listResearchCommunityIdentities(
    { customer_id: req.auth_context.actor_id },
    { take: 1 },
  )
  const reports = identity
    ? await service.listResearchProtocolReports(
        {
          series_id: eligibility.series.id,
          reporter_identity_id: identity.id,
        },
        { take: 100, order: { reported_at: "DESC" } },
      )
    : []
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    reports: reports.map((report) => ({
      id: report.id,
      reason: report.reason,
      status: report.status,
      reported_at: report.reported_at,
      resolved_at: report.resolved_at,
    })),
  })
}

export async function POST(req: AuthenticatedMedusaRequest<StoreReportResearchProtocolContent>, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const [series] = await service.listResearchProtocolSeries({ protocol_key: req.params.handle, archived_at: null }, { take: 1 })
  if (!series) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Research protocol was not found")
  const { result } = await reportProtocolContentWorkflow(req.scope).run({ input: { ...req.validatedBody, series_id: series.id, customer_id: req.auth_context.actor_id } })
  res.setHeader("Cache-Control", "private, no-store")
  res.status(201).json({ report: { id: result.id, status: result.status } })
}
