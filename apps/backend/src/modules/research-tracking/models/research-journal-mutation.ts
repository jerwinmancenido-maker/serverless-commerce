import { model } from "@medusajs/framework/utils"

import {
  RESEARCH_JOURNAL_MUTATION_STATUSES,
  RESEARCH_JOURNAL_OPERATIONS,
} from "../contracts/journal"
import ResearchProfile from "./research-profile"

const ResearchJournalMutation = model
  .define("research_journal_mutation", {
    id: model.id().primaryKey(),
    operation: model.enum([...RESEARCH_JOURNAL_OPERATIONS]),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    status: model.enum([...RESEARCH_JOURNAL_MUTATION_STATUSES]),
    journal_entry_id: model.text().nullable(),
    journal_revision_id: model.text().nullable(),
    response_payload: model.json().nullable(),
    error_code: model.text().nullable(),
    completed_at: model.dateTime().nullable(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "journal_mutations",
    }),
  })
  .indexes([
    { on: ["profile_id", "operation", "idempotency_key"], unique: true },
  ])

export default ResearchJournalMutation
