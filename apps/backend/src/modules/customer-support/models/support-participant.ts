import { model } from "@medusajs/framework/utils"

const SupportParticipant = model.define("support_participant", {
  id: model.id().primaryKey(),
  conversation_id: model.text(),
  participant_type: model.enum(["customer", "staff"]),
  participant_id: model.text(),
  joined_at: model.dateTime(),
  last_read_at: model.dateTime().nullable(),
  last_notified_at: model.dateTime().nullable(),
  left_at: model.dateTime().nullable(),
}).indexes([
  { on: ["conversation_id", "participant_type", "participant_id"], unique: true },
])

export default SupportParticipant
