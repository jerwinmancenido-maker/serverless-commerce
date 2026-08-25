import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { requestResearchProfileDeletionWorkflow } from "../../../../../../../workflows/research-tracking-ownership"
import type { StoreRequestResearchDeletionType } from "../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreRequestResearchDeletionType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await requestResearchProfileDeletionWorkflow(
    req.scope,
  ).run({
    input: {
      customerId,
      acknowledgeDeletionRequest:
        req.validatedBody.acknowledge_deletion_request,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(
      customerId,
      "deletion-request",
      idempotencyKey,
    ),
  })

  res.status(202).json({
    research_profile: result.research_profile,
    privacy_request: result.privacy_request,
    message:
      "Your request was recorded. This is not confirmation that deletion is complete, and required commerce records are governed separately.",
  })
}
