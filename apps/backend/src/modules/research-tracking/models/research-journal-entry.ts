import { model } from "@medusajs/framework/utils"

import { RESEARCH_JOURNAL_STATUSES } from "../contracts/journal"
import ResearchProfile from "./research-profile"
import ResearchJournalEntryRevision from "./research-journal-entry-revision"
import ResearchJournalStateTransition from "./research-journal-state-transition"

const ResearchJournalEntry = model
  .define("research_journal_entry", {
    id: model.id().primaryKey(),
    status: model.enum([...RESEARCH_JOURNAL_STATUSES]).default("active"),
    current_revision_id: model.text().nullable(),
    voided_at: model.dateTime().nullable(),
    restored_at: model.dateTime().nullable(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "journal_entries",
    }),
    revisions: model.hasMany(() => ResearchJournalEntryRevision, {
      mappedBy: "journal_entry",
    }),
    state_transitions: model.hasMany(() => ResearchJournalStateTransition, {
      mappedBy: "journal_entry",
    }),
  })
  .indexes([
    { on: ["profile_id", "status"] },
    { on: ["profile_id", "created_at"] },
  ])

export default ResearchJournalEntry
