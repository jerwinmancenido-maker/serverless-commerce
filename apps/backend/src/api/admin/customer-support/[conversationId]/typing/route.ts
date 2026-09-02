import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { setTypingState } from "../../../../../modules/customer-support/presence"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { conversationId } = req.params
  setTypingState(conversationId, "staff", req.auth_context.actor_id)

  res.setHeader("Cache-Control", "private, no-store")
  res.json({ ok: true })
}
