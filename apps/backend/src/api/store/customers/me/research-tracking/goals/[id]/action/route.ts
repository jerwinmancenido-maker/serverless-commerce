import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { StoreMutatePersonalGoalType } from "../../../../../../../../modules/research-tracking/contracts/goals"
import { mutateResearchPersonalGoalWorkflow } from "../../../../../../../../workflows/manage-research-personal-goals"
import { setResearchPrivateNoStore } from "../../../utils"

export async function POST(req: AuthenticatedMedusaRequest<StoreMutatePersonalGoalType>, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  const { result } = await mutateResearchPersonalGoalWorkflow(req.scope).run({ input: { customerId: req.auth_context.actor_id, goalId: req.params.id, mutation: req.validatedBody } })
  res.json({ goal: result })
}
