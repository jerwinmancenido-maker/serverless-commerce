import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { CUSTOMER_SUPPORT_MODULE } from "../../../modules/customer-support"
import type { AdminListSupportConversations } from "../../../modules/customer-support/contracts"
import type CustomerSupportModuleService from "../../../modules/customer-support/service"
import { supportUnreadCount } from "../../../modules/customer-support/unread"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const input = req.validatedQuery as AdminListSupportConversations
  const service = req.scope.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
  const filters: any = {}
  if (input.status) filters.status = input.status
  if (input.priority) filters.priority = input.priority
  if (input.category) filters.category = input.category
  if (input.assigned_to_actor_id) filters.assigned_to_actor_id = input.assigned_to_actor_id
  if (input.order_id) filters.order_id = input.order_id
  if (input.protocol_series_id) filters.protocol_series_id = input.protocol_series_id
  if (input.queue === "new") filters.status = "new"
  if (input.queue === "unassigned") filters.assigned_to_actor_id = null
  if (input.queue === "assigned_to_me") filters.assigned_to_actor_id = req.auth_context.actor_id
  if (input.queue === "waiting_for_customer") filters.status = "waiting_for_customer"
  if (input.queue === "high_priority") filters.priority = ["high", "urgent"]
  if (input.queue === "resolved") filters.status = "resolved"
  if (input.queue === "closed") filters.status = "closed"
  if (input.updated_from || input.updated_to) {
    filters.last_activity_at = {
      ...(input.updated_from ? { $gte: new Date(input.updated_from) } : {}),
      ...(input.updated_to ? { $lte: new Date(input.updated_to) } : {}),
    }
  }
  if (input.q) {
    filters.$or = [
      { subject: { $ilike: `%${input.q}%` } },
      { id: { $ilike: `%${input.q}%` } },
    ]
  }

  const [conversations, count] = await service.listAndCountSupportConversations(
    filters,
    {
      order: { last_activity_at: "DESC" },
      take: input.limit,
      skip: input.offset,
    },
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const customerIds = [...new Set(conversations.map((conversation) => conversation.customer_id))]
  const { data: customers } = customerIds.length
    ? await query.graph({
        entity: "customer",
        fields: ["id", "email", "first_name", "last_name"],
        filters: { id: customerIds },
      })
    : { data: [] }
  const customerById = new Map(customers.map((customer: any) => [customer.id, customer]))
  const results = await Promise.all(
    conversations.map(async (conversation) => {
      const [latest] = await service.listSupportMessages(
        { conversation_id: conversation.id },
        { order: { sent_at: "DESC" }, take: 1 },
      )
      const unreadCount = await supportUnreadCount(
        service,
        conversation.id,
        "staff",
        req.auth_context.actor_id,
      )
      const customer: any = customerById.get(conversation.customer_id)
      return {
        ...conversation,
        customer: customer
          ? {
              id: customer.id,
              email: customer.email,
              name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email,
            }
          : null,
        latest_message_preview: latest?.body.slice(0, 160) || "",
        unread_count: unreadCount,
        waiting_since: conversation.status === "waiting_for_customer"
          ? conversation.latest_staff_message_at
          : conversation.latest_customer_message_at,
      }
    }),
  )

  const visible = input.queue === "unread" || input.unread
    ? results.filter((conversation) => conversation.unread_count > 0)
    : results
  res.json({ conversations: visible, count: visible.length === results.length ? count : visible.length, limit: input.limit, offset: input.offset })
}
