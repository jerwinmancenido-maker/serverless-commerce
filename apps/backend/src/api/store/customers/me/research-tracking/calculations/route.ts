import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../../modules/research-tracking/service"
import type { StoreCreateCalculationSnapshotType } from "../../../../../../modules/research-tracking/contracts/calculations"
import { createResearchCalculationSnapshotWorkflow } from "../../../../../../workflows/manage-research-calculation-snapshots"
import { setResearchPrivateNoStore } from "../utils"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  const service = req.scope.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
  const [profile] = await service.listResearchProfiles(
    { customer_id: req.auth_context.actor_id },
    { take: 1 },
  )
  if (!profile) return res.json({ calculations: [] })
  const calculations = await service.listResearchCalculationSnapshots(
    { profile_id: profile.id, archived_at: null },
    { order: { saved_at: "DESC" }, take: 100 },
  )
  res.json({
    calculations: calculations.map((item) => ({
      id: item.id,
      mode: item.mode,
      title: item.title,
      protocol_revision_id: item.protocol_revision_id,
      profile_protocol_access_id: item.profile_protocol_access_id,
      routine_id: item.routine_id,
      journal_entry_id: item.journal_entry_id,
      input: item.input_snapshot,
      result: item.result_snapshot,
      unit_context: item.unit_context_snapshot,
      saved_at: item.saved_at,
    })),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreCreateCalculationSnapshotType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const { result } = await createResearchCalculationSnapshotWorkflow(req.scope).run({
    input: { customerId: req.auth_context.actor_id, snapshot: req.validatedBody },
  })
  res.status(201).json({ calculation: result })
}
