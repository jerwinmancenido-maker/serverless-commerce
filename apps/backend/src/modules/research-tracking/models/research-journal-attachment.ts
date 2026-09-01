import { model } from "@medusajs/framework/utils"

import ResearchProfile from "./research-profile"

const ResearchJournalAttachment = model
  .define("research_journal_attachment", {
    id: model.id().primaryKey(),
    profile: model.belongsTo(() => ResearchProfile, { mappedBy: "journal_attachments" }),
    journal_entry_id: model.text(),
    journal_revision_id: model.text().nullable(),
    file_id: model.text(),
    file_name: model.text(),
    mime_type: model.text(),
    size_bytes: model.number(),
    checksum_sha256: model.text(),
    scan_status: model.enum(["pending", "unavailable", "clean", "quarantined"]).default("unavailable"),
    status: model.enum(["active", "removed"]).default("active"),
    uploaded_at: model.dateTime(),
    removed_at: model.dateTime().nullable(),
  })
  .indexes([
    { on: ["profile_id", "journal_entry_id", "status"] },
    { on: ["file_id"], unique: true },
  ])

export default ResearchJournalAttachment
