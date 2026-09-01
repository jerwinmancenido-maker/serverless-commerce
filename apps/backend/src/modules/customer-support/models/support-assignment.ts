import { model } from "@medusajs/framework/utils"

const SupportAssignment = model.define("support_assignment", {
  id: model.id().primaryKey(),
  conversation_id: model.text(),
  assigned_to_actor_id: model.text().nullable(),
  assigned_by_actor_id: model.text(),
  assigned_at: model.dateTime(),
}).indexes([{ on: ["conversation_id", "assigned_at"] }])

export default SupportAssignment
