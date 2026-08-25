import { model } from "@medusajs/framework/utils"

import {
  RESEARCH_PRIVACY_PRIOR_PROFILE_STATUSES,
  RESEARCH_PRIVACY_REQUEST_STATUSES,
  RESEARCH_PRIVACY_REQUEST_TYPES,
} from "../contracts/tracking"
import ResearchProfile from "./research-profile"

const ResearchPrivacyRequest = model
  .define("research_privacy_request", {
    id: model.id().primaryKey(),
    request_type: model.enum([...RESEARCH_PRIVACY_REQUEST_TYPES]),
    status: model.enum([...RESEARCH_PRIVACY_REQUEST_STATUSES]),
    prior_profile_status: model.enum([
      ...RESEARCH_PRIVACY_PRIOR_PROFILE_STATUSES,
    ]),
    open_request_key: model.text().unique().nullable(),
    requested_at: model.dateTime(),
    cancelled_at: model.dateTime().nullable(),
    started_at: model.dateTime().nullable(),
    completed_at: model.dateTime().nullable(),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    cancellation_idempotency_key: model.text().nullable(),
    cancellation_fingerprint_sha256: model.text().nullable(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "privacy_requests",
    }),
  })
  .indexes([
    { on: ["profile_id", "idempotency_key"], unique: true },
    {
      on: ["profile_id", "cancellation_idempotency_key"],
      unique: true,
    },
    { on: ["profile_id", "status"] },
  ])

export default ResearchPrivacyRequest
