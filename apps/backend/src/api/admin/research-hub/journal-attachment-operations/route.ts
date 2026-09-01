import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../modules/research-tracking/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [attachments, count] =
    await service.listAndCountResearchJournalAttachments(
      {},
      { take: 25, order: { uploaded_at: "DESC" } },
    )
  const counts = attachments.reduce<Record<string, number>>((result, item) => {
    result[item.scan_status] = (result[item.scan_status] ?? 0) + 1
    return result
  }, {})
  res.json({
    total: count,
    sampled_counts: counts,
    attachments: attachments.map((item) => ({
      id: item.id,
      mime_type: item.mime_type,
      size_bytes: item.size_bytes,
      scan_status: item.scan_status,
      status: item.status,
      uploaded_at: item.uploaded_at,
      removed_at: item.removed_at,
    })),
  })
}
