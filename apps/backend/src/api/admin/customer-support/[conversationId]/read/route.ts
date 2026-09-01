import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { markSupportReadWorkflow } from "../../../../../workflows/manage-support-configuration"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { result } = await markSupportReadWorkflow(req.scope).run({
    input: {
      participant_type: "staff",
      participant_id: req.auth_context.actor_id,
      conversation_id: req.params.conversationId,
    },
  })
  res.json(result)
}
