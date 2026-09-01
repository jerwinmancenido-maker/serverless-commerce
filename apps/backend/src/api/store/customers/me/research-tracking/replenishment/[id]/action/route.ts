import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { StoreMutateResearchReplenishmentType } from "../../../validators"
import { manageResearchReplenishmentWorkflow } from "../../../../../../../../workflows/manage-research-replenishment"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreMutateResearchReplenishmentType>,
  res: MedusaResponse,
) {
  const { result } = await manageResearchReplenishmentWorkflow(req.scope).run({
    input: {
      customerId: req.auth_context.actor_id,
      routineId: req.params.id,
      action: req.validatedBody.action,
      remindAt: req.validatedBody.remind_at,
    },
  })
  res.setHeader("Cache-Control", "private, no-store")
  res.json(result)
}
