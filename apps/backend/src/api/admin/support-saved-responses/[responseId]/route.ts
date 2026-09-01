import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminUpsertSupportSavedResponse } from "../../../../modules/customer-support/contracts"
import { manageSupportSavedResponseWorkflow } from "../../../../workflows/manage-support-saved-response"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpsertSupportSavedResponse>,
  res: MedusaResponse,
) {
  const { result } = await manageSupportSavedResponseWorkflow(req.scope).run({
    input: {
      id: req.params.responseId,
      operation: "update",
      actor_id: req.auth_context.actor_id,
      value: req.validatedBody,
    },
  })
  res.json({ response: result })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  await manageSupportSavedResponseWorkflow(req.scope).run({
    input: {
      id: req.params.responseId,
      operation: "delete",
      actor_id: req.auth_context.actor_id,
    },
  })
  res.status(204).send()
}
