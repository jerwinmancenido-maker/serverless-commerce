import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { CUSTOMER_SUPPORT_MODULE } from "../../../../modules/customer-support"
import { isTyping } from "../../../../modules/customer-support/presence"
import type { AdminUpdateSupportConversation } from "../../../../modules/customer-support/contracts"

import type CustomerSupportModuleService from "../../../../modules/customer-support/service"
import { adminManageSupportWorkflow } from "../../../../workflows/manage-customer-support"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
  const [conversation] = await service.listSupportConversations(
    { id: req.params.conversationId },
    { take: 1 }
  )
  if (!conversation) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Support conversation was not found")
  }

  const [messages, notes, events, assignments, attachments] = await Promise.all([
    service.listSupportMessages({ conversation_id: conversation.id }, { order: { sent_at: "ASC" } }),
    service.listSupportInternalNotes({ conversation_id: conversation.id }, { order: { created_at: "ASC" } }),
    service.listSupportStatusEvents({ conversation_id: conversation.id }, { order: { occurred_at: "ASC" } }),
    service.listSupportAssignments({ conversation_id: conversation.id }, { order: { assigned_at: "ASC" } }),
    service.listSupportAttachments({ conversation_id: conversation.id, status: "active" }),
  ])

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Customer context
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name", "created_at"],
    filters: { id: conversation.customer_id },
    pagination: { take: 1 },
  })
  const rawCustomer = customers?.[0]

  // Recent customer orders
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "total", "status", "created_at", "currency_code"],
    filters: { customer_id: conversation.customer_id },
    pagination: { take: 5, order: { created_at: "DESC" } },
  }).catch(() => ({ data: [] }))

  // Staff users for resolving names
  const { data: users } = await query.graph({
    entity: "user",
    fields: ["id", "first_name", "last_name", "email"],
  }).catch(() => ({ data: [] }))

  const staffMap: Record<string, string> = {}
  for (const u of users || []) {
    staffMap[u.id] = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email
  }

  const customerName = rawCustomer
    ? [rawCustomer.first_name, rawCustomer.last_name].filter(Boolean).join(" ") || rawCustomer.email
    : "Customer"

  const totalSpent = ((orders as any[]) || []).reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0)

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    conversation,
    customer_typing: isTyping(conversation.id, "customer"),
    customer: rawCustomer
      ? {
          id: rawCustomer.id,
          name: customerName,
          email: rawCustomer.email,
          created_at: rawCustomer.created_at,
          orders_count: ((orders as any[]) || []).length,
          total_spent: totalSpent,
          recent_orders: orders || [],
        }
      : null,
    messages: messages.map((m) => ({
      id: m.id,
      sender_type: m.sender_type,
      sender_id: m.sender_id,
      sender_name:
        m.sender_type === "customer"
          ? customerName
          : m.sender_type === "staff"
          ? staffMap[m.sender_id] || "Support Staff"
          : "System",
      body: m.body,
      sent_at: m.sent_at,
    })),
    internal_notes: notes.map((n) => ({
      id: n.id,
      actor_id: n.actor_id,
      actor_name: staffMap[n.actor_id] || "Staff",
      body: n.body,
      created_at: n.created_at,
    })),
    status_events: events.map((e) => ({
      id: e.id,
      from_status: e.from_status,
      to_status: e.to_status,
      actor_type: e.actor_type,
      actor_id: e.actor_id,
      actor_name: e.actor_type === "staff" ? (e.actor_id ? staffMap[e.actor_id] || "Staff" : "Staff") : customerName,
      reason: e.reason,
      occurred_at: e.occurred_at,
    })),
    assignments: assignments.map((a) => ({
      id: a.id,
      assigned_to_actor_id: a.assigned_to_actor_id,
      assigned_to_name: a.assigned_to_actor_id ? staffMap[a.assigned_to_actor_id] || "Staff" : "Staff",
      assigned_by_actor_id: a.assigned_by_actor_id,
      assigned_by_name: a.assigned_by_actor_id ? staffMap[a.assigned_by_actor_id] || "Staff" : "Staff",
      assigned_at: a.assigned_at,
    })),
    attachments: attachments.map((item) => ({
      id: item.id,
      message_id: item.message_id,
      file_name: item.file_name,
      mime_type: item.mime_type,
      size_bytes: item.size_bytes,
      scan_status: item.scan_status,
    })),
  })
}

export async function POST(req: AuthenticatedMedusaRequest<AdminUpdateSupportConversation>, res: MedusaResponse) {
  const { result } = await adminManageSupportWorkflow(req.scope).run({
    input: {
      conversation_id: req.params.conversationId,
      actor_id: req.auth_context.actor_id,
      operation: "update",
      payload: req.validatedBody,
    },
  })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ conversation: result })
}
