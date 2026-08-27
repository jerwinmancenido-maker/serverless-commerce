import { model } from "@medusajs/framework/utils"

import ResearchJournalEntry from "./research-journal-entry"

const ResearchJournalEntryRevision = model
  .define("research_journal_entry_revision", {
    id: model.id().primaryKey(),
    revision_number: model.number(),
    local_date: model.dateTime(),
    local_time: model.text(),
    timezone: model.text(),
    title: model.text().nullable(),
    note: model.text(),
    tracked_material_id: model.text().nullable(),
    supply_id: model.text().nullable(),
    routine_id: model.text().nullable(),
    confirmed_log_id: model.text().nullable(),
    prior_revision_id: model.text().nullable(),
    journal_entry: model.belongsTo(() => ResearchJournalEntry, {
      mappedBy: "revisions",
    }),
  })
  .indexes([
    { on: ["journal_entry_id", "revision_number"], unique: true },
    { on: ["journal_entry_id", "created_at"] },
  ])

export default ResearchJournalEntryRevision
