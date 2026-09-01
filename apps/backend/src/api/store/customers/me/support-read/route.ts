import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { StoreMarkSupportRead } from "../../../../../modules/customer-support/contracts"
import { markSupportReadWorkflow } from "../../../../../workflows/manage-support-configuration"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreMarkSupportRead>,
  res: MedusaResponse,
) {
  const customerId = req.auth_context.actor_id
  const { result } = await markSupportReadWorkflow(req.scope).run({
    input: {
      participant_type: "customer",
      participant_id: customerId,
      customer_id: customerId,
      conversation_id: req.validatedBody.conversation_id,
      all: req.validatedBody.all,
    },
  })
  res.setHeader("Cache-Control", "private, no-store")
  res.json(result)
}
