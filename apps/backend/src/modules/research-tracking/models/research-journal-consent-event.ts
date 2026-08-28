import { model } from "@medusajs/framework/utils"

import { RESEARCH_JOURNAL_CONSENT_EVENT_TYPES } from "../contracts/journal-consent"
import ResearchProfile from "./research-profile"

const ResearchJournalConsentEvent = model
  .define("research_journal_consent_event", {
    id: model.id().primaryKey(),
    event_type: model.enum([...RESEARCH_JOURNAL_CONSENT_EVENT_TYPES]),
    consent_version: model.text(),
    notice_sha256: model.text(),
    occurred_at: model.dateTime(),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "journal_consent_events",
    }),
  })
  .indexes([
    { on: ["profile_id", "idempotency_key"], unique: true },
    { on: ["profile_id", "occurred_at"] },
  ])

export default ResearchJournalConsentEvent
