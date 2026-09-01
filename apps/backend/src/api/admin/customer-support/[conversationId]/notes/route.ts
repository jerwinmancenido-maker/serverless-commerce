import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { AdminCreateSupportInternalNote } from "../../../../../modules/customer-support/contracts"
import { adminManageSupportWorkflow } from "../../../../../workflows/manage-customer-support"
export async function POST(req: AuthenticatedMedusaRequest<AdminCreateSupportInternalNote>, res: MedusaResponse) { const { result } = await adminManageSupportWorkflow(req.scope).run({ input: { conversation_id: req.params.conversationId, actor_id: req.auth_context.actor_id, operation: "note", payload: req.validatedBody } }); res.status(201).json({ note: result }) }
