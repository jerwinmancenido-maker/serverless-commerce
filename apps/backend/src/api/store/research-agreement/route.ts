import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../modules/research-tracking/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const bundles = await service.listResearchAgreementBundles(
    { status: "active" },
    { order: { effective_at: "DESC" }, take: 1 },
  )
  const bundle = bundles.find((item) => item.effective_at <= new Date()) || null
  res.setHeader("Cache-Control", "public, max-age=60")
  res.json({ agreement_bundle: bundle })
}
