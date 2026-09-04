import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { StorePostThreadMessage } from "../../../../../../../modules/customer-support/contracts"
import { postThreadMessageWorkflow } from "../../../../../../../workflows/manage-customer-support"

export async function POST(req: AuthenticatedMedusaRequest<StorePostThreadMessage>, res: MedusaResponse) {
  const { result } = await postThreadMessageWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      customer_id: req.auth_context.actor_id,
    },
  })
  res.setHeader("Cache-Control", "private, no-store")
  res.status(201).json({
    conversation_id: result.conversation.id,
    message: {
      id: result.message.id,
      sender_type: result.message.sender_type,
      body: result.message.body,
      sent_at: result.message.sent_at,
      attachments: [],
    },
    acknowledgement_id: (result as any)?.acknowledgement?.id || null,
  })
}
