import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { StoreCreateSupportReply } from "../../../../../../../modules/customer-support/contracts"
import { createCustomerSupportReplyWorkflow } from "../../../../../../../workflows/manage-customer-support"

export async function POST(req: AuthenticatedMedusaRequest<StoreCreateSupportReply>, res: MedusaResponse) { const { result } = await createCustomerSupportReplyWorkflow(req.scope).run({ input: { ...req.validatedBody, customer_id: req.auth_context.actor_id, conversation_id: req.params.conversationId } }); res.setHeader("Cache-Control", "private, no-store"); res.status(201).json({ message: { id: result.id, body: result.body, sent_at: result.sent_at, sender_type: "customer" } }) }
