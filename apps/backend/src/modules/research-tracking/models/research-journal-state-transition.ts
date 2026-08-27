import { model } from "@medusajs/framework/utils"

import ResearchJournalEntry from "./research-journal-entry"
import ResearchJournalMutation from "./research-journal-mutation"
import ResearchProfile from "./research-profile"

const ResearchJournalStateTransition = model
  .define("research_journal_state_transition", {
    id: model.id().primaryKey(),
    operation: model.enum(["void", "restore"]),
    occurred_at: model.dateTime(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "journal_state_transitions",
    }),
    journal_entry: model.belongsTo(() => ResearchJournalEntry, {
      mappedBy: "state_transitions",
    }),
    mutation: model.belongsTo(() => ResearchJournalMutation),
  })
  .indexes([{ on: ["journal_entry_id", "occurred_at"] }])

export default ResearchJournalStateTransition
