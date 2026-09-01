import { model } from "@medusajs/framework/utils"

const SupportAttachment = model.define("support_attachment", {
  id: model.id().primaryKey(),
  conversation_id: model.text(),
  message_id: model.text(),
  file_id: model.text(),
  file_name: model.text(),
  mime_type: model.text(),
  size_bytes: model.number(),
  checksum_sha256: model.text(),
  scan_status: model.enum(["pending", "clean", "blocked", "unavailable"]).default("unavailable"),
  status: model.enum(["active", "removed"]).default("active"),
  uploaded_at: model.dateTime(),
  removed_at: model.dateTime().nullable(),
}).indexes([
  { on: ["conversation_id", "message_id"] },
  { on: ["file_id"], unique: true },
])

export default SupportAttachment
