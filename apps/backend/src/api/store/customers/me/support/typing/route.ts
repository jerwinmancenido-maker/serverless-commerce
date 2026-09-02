import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_SUPPORT_MODULE } from "../../../../../../modules/customer-support"
import { setTypingState } from "../../../../../../modules/customer-support/presence"
import type CustomerSupportModuleService from "../../../../../../modules/customer-support/service"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
  const [conversation] = await service.listSupportConversations(
    { customer_id: req.auth_context.actor_id },
    { order: { last_activity_at: "DESC" }, take: 1 }
  )

  if (conversation) {
    setTypingState(conversation.id, "customer", req.auth_context.actor_id)
  }

  res.setHeader("Cache-Control", "private, no-store")
  res.json({ ok: true })
}
