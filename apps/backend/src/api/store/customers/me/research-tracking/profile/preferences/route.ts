import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { updateResearchProfilePreferencesWorkflow } from "../../../../../../../workflows/research-tracking-ownership"
import type { StoreUpdateResearchPreferencesType } from "../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreUpdateResearchPreferencesType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const { result } = await updateResearchProfilePreferencesWorkflow(
    req.scope,
  ).run({
    input: {
      customerId,
      timezone: req.validatedBody.timezone,
      locale: req.validatedBody.locale,
      idempotencyKey,
    },
    context: createResearchWorkflowContext(
      customerId,
      "preferences-update",
      idempotencyKey,
    ),
  })

  res.json({ research_profile: result.research_profile })
}
