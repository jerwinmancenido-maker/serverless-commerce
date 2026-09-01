import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { CUSTOMER_SUPPORT_MODULE } from "../../../../../../modules/customer-support"
import type CustomerSupportModuleService from "../../../../../../modules/customer-support/service"
import { supportUnreadCount } from "../../../../../../modules/customer-support/unread"

const activeStatuses = ["new", "open", "waiting_for_customer"]

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const customerId = req.auth_context.actor_id
  const service = req.scope.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
  const conversations = await service.listSupportConversations(
    { customer_id: customerId },
    { order: { last_activity_at: "DESC" }, take: 8 },
  )
  const items = await Promise.all(
    conversations.map(async (conversation) => {
      const [latest] = await service.listSupportMessages(
        { conversation_id: conversation.id },
        { order: { sent_at: "DESC" }, take: 1 },
      )
      return {
        id: conversation.id,
        subject: conversation.subject,
        category: conversation.category,
        status: conversation.status,
        order_id: conversation.order_id,
        protocol_series_id: conversation.protocol_series_id,
        last_activity_at: conversation.last_activity_at,
        latest_message_preview: latest?.body.slice(0, 160) || "",
        unread_count: await supportUnreadCount(
          service,
          conversation.id,
          "customer",
          customerId,
        ),
      }
    }),
  )

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    unread_count: items.reduce((sum, item) => sum + item.unread_count, 0),
    active_count: conversations.filter((conversation) =>
      activeStatuses.includes(conversation.status),
    ).length,
    conversations: items,
  })
}
