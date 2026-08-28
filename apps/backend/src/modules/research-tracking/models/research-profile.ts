import { model } from "@medusajs/framework/utils"

import { RESEARCH_PROFILE_STATUSES } from "../contracts/tracking"
import ResearchConsentEvent from "./research-consent-event"
import ResearchJournalConsentEvent from "./research-journal-consent-event"
import ResearchJournalEntry from "./research-journal-entry"
import ResearchJournalMutation from "./research-journal-mutation"
import ResearchJournalStateTransition from "./research-journal-state-transition"
import ResearchPreferenceMutation from "./research-preference-mutation"
import ResearchPrivacyRequest from "./research-privacy-request"
import ResearchRoutine from "./research-routine"
import ResearchRoutineLog from "./research-routine-log"
import ResearchRoutineMutation from "./research-routine-mutation"
import ResearchRoutineStateTransition from "./research-routine-state-transition"
import ResearchSupplyActivation from "./research-supply-activation"
import ResearchSupplyActivationRequest from "./research-supply-activation-request"
import ResearchSupplyAdjustment from "./research-supply-adjustment"
import TrackedMaterial from "./tracked-material"

const ResearchProfile = model.define("research_profile", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  timezone: model.text(),
  locale: model.text().default("en-PH"),
  consent_version: model.text(),
  consented_at: model.dateTime(),
  status: model.enum([...RESEARCH_PROFILE_STATUSES]).default("active"),
  tracked_materials: model.hasMany(() => TrackedMaterial, {
    mappedBy: "profile",
  }),
  consent_events: model.hasMany(() => ResearchConsentEvent, {
    mappedBy: "profile",
  }),
  journal_consent_events: model.hasMany(() => ResearchJournalConsentEvent, {
    mappedBy: "profile",
  }),
  journal_entries: model.hasMany(() => ResearchJournalEntry, {
    mappedBy: "profile",
  }),
  journal_mutations: model.hasMany(() => ResearchJournalMutation, {
    mappedBy: "profile",
  }),
  journal_state_transitions: model.hasMany(
    () => ResearchJournalStateTransition,
    {
      mappedBy: "profile",
    },
  ),
  preference_mutations: model.hasMany(() => ResearchPreferenceMutation, {
    mappedBy: "profile",
  }),
  privacy_requests: model.hasMany(() => ResearchPrivacyRequest, {
    mappedBy: "profile",
  }),
  routines: model.hasMany(() => ResearchRoutine, {
    mappedBy: "profile",
  }),
  routine_logs: model.hasMany(() => ResearchRoutineLog, {
    mappedBy: "profile",
  }),
  routine_mutations: model.hasMany(() => ResearchRoutineMutation, {
    mappedBy: "profile",
  }),
  routine_state_transitions: model.hasMany(
    () => ResearchRoutineStateTransition,
    {
      mappedBy: "profile",
    },
  ),
  supply_adjustments: model.hasMany(() => ResearchSupplyAdjustment, {
    mappedBy: "profile",
  }),
  supply_activations: model.hasMany(() => ResearchSupplyActivation, {
    mappedBy: "profile",
  }),
  supply_activation_requests: model.hasMany(
    () => ResearchSupplyActivationRequest,
    {
      mappedBy: "profile",
    },
  ),
})

export default ResearchProfile
