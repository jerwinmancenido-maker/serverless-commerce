import { model } from "@medusajs/framework/utils"

const SupportConversation = model.define("support_conversation", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  client_request_id: model.text().nullable(),
  subject: model.text(),
  category: model.enum(["order", "payment", "shipping", "product", "protocol_access", "account", "rewards", "technical", "other"]),
  status: model.enum(["new", "open", "waiting_for_customer", "resolved", "closed"]).default("new"),
  priority: model.enum(["low", "normal", "high", "urgent"]).default("normal"),
  order_id: model.text().nullable(),
  protocol_series_id: model.text().nullable(),
  assigned_to_actor_id: model.text().nullable(),
  opened_at: model.dateTime(),
  last_activity_at: model.dateTime(),
  latest_customer_message_at: model.dateTime().nullable(),
  latest_staff_message_at: model.dateTime().nullable(),
  first_staff_response_at: model.dateTime().nullable(),
  resolved_at: model.dateTime().nullable(),
  closed_at: model.dateTime().nullable(),
}).indexes([
  { on: ["customer_id", "last_activity_at"] },
  { on: ["customer_id", "client_request_id"], unique: true },
  { on: ["status", "priority", "last_activity_at"] },
  { on: ["assigned_to_actor_id", "status"] },
  { on: ["order_id"] },
])

export default SupportConversation
