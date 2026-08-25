import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { closeResearchProfileWorkflow } from "../../../../../../../workflows/research-tracking-ownership"
import type { StoreCloseResearchProfileType } from "../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreCloseResearchProfileType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await closeResearchProfileWorkflow(req.scope).run({
    input: {
      customerId,
      acknowledgeClosure: req.validatedBody.acknowledge_closure,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(
      customerId,
      "profile-close",
      idempotencyKey,
    ),
  })

  res.json({ research_profile: result.research_profile })
}
