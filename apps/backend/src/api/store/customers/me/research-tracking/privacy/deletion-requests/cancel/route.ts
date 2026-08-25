import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { cancelResearchProfileDeletionWorkflow } from "../../../../../../../../workflows/research-tracking-ownership"
import type { StoreCancelResearchDeletionType } from "../../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreCancelResearchDeletionType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await cancelResearchProfileDeletionWorkflow(
    req.scope,
  ).run({
    input: {
      customerId,
      acknowledgeCancellation: req.validatedBody.acknowledge_cancellation,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(
      customerId,
      "deletion-cancel",
      idempotencyKey,
    ),
  })

  res.json({
    research_profile: result.research_profile,
    privacy_request: result.privacy_request,
  })
}
