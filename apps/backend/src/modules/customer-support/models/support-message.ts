import { model } from "@medusajs/framework/utils"

const SupportMessage = model.define("support_message", {
  id: model.id().primaryKey(),
  conversation_id: model.text(),
  sender_type: model.enum(["customer", "staff", "system"]),
  sender_id: model.text(),
  body: model.text(),
  client_request_id: model.text().nullable(),
  sent_at: model.dateTime(),
  edited_at: model.dateTime().nullable(),
}).indexes([
  { on: ["conversation_id", "sent_at"] },
  { on: ["sender_type", "sender_id", "sent_at"] },
  { on: ["conversation_id", "sender_type", "client_request_id"], unique: true },
])

export default SupportMessage
