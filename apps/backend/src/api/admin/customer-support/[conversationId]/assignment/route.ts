import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminAssignSupportConversation } from "../../../../../modules/customer-support/contracts"
import { adminManageSupportWorkflow } from "../../../../../workflows/manage-customer-support"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminAssignSupportConversation>,
  res: MedusaResponse,
) {
  const { result } = await adminManageSupportWorkflow(req.scope).run({
    input: {
      conversation_id: req.params.conversationId,
      actor_id: req.auth_context.actor_id,
      operation: "assignment",
      payload: req.validatedBody,
    },
  })
  res.json({ conversation: result })
}
