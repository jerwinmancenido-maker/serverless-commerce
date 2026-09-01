import { model } from "@medusajs/framework/utils"

const SupportInternalNote = model.define("support_internal_note", {
  id: model.id().primaryKey(),
  conversation_id: model.text(),
  actor_id: model.text(),
  body: model.text(),
  edited_at: model.dateTime().nullable(),
}).indexes([{ on: ["conversation_id", "created_at"] }])

export default SupportInternalNote
