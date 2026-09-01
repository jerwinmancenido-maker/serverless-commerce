import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { AdminCreateSupportMessage } from "../../../../../modules/customer-support/contracts"
import { adminManageSupportWorkflow } from "../../../../../workflows/manage-customer-support"
export async function POST(req: AuthenticatedMedusaRequest<AdminCreateSupportMessage>, res: MedusaResponse) { const { result } = await adminManageSupportWorkflow(req.scope).run({ input: { conversation_id: req.params.conversationId, actor_id: req.auth_context.actor_id, operation: "reply", payload: req.validatedBody } }); res.status(201).json({ message: result }) }
