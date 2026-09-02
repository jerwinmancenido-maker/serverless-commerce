import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { isTyping } from "../../../../../../modules/customer-support/presence"
import { ensureSupportThreadWorkflow } from "../../../../../../workflows/manage-customer-support"

const conversationView = (item: any) => ({
  id: item.id,
  subject: item.subject,
  category: item.category,
  status: item.status,
  priority: item.priority,
  order_id: item.order_id,
  protocol_series_id: item.protocol_series_id,
  opened_at: item.opened_at,
  last_activity_at: item.last_activity_at,
})

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await ensureSupportThreadWorkflow(req.scope).run({
    input: { customer_id: req.auth_context.actor_id },
  })

  const staffTyping = isTyping(result.conversation.id, "staff")

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    conversation: {
      ...conversationView(result.conversation),
      staff_last_read_at: result.staff_last_read_at,
      staff_typing: staffTyping,
      messages: result.messages.map((message: any) => ({
        id: message.id,
        sender:
          message.sender_type === "customer"
            ? "You"
            : message.sender_type === "system"
              ? "Automatic confirmation"
              : "Support",
        sender_type: message.sender_type,
        body: message.body,
        sent_at: message.sent_at,
        attachments: result.attachments
          .filter((item: any) => item.message_id === message.id)
          .map((item: any) => ({
            id: item.id,
            file_name: item.file_name,
            mime_type: item.mime_type,
            size_bytes: item.size_bytes,
            scan_status: item.scan_status,
          })),
      })),
    },
  })
}
