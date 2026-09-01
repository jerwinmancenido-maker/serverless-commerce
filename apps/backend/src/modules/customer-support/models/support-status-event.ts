import { model } from "@medusajs/framework/utils"

const SupportStatusEvent = model.define("support_status_event", {
  id: model.id().primaryKey(),
  conversation_id: model.text(),
  from_status: model.text().nullable(),
  to_status: model.text(),
  actor_type: model.enum(["customer", "staff", "system"]),
  actor_id: model.text().nullable(),
  reason: model.text().nullable(),
  occurred_at: model.dateTime(),
}).indexes([{ on: ["conversation_id", "occurred_at"] }])

export default SupportStatusEvent
