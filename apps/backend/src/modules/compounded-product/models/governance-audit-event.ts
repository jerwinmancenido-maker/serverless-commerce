import { model } from "@medusajs/framework/utils"

import {
  COMPOUNDED_PRODUCT_AUDIT_EVENT_TYPES,
  COMPOUNDED_PRODUCT_AUDIT_OUTCOMES,
} from "../contracts/audit"

const GovernanceAuditEvent = model
  .define("compounded_product_governance_audit_event", {
    id: model.id().primaryKey(),
    event_type: model.enum([...COMPOUNDED_PRODUCT_AUDIT_EVENT_TYPES]),
    outcome: model.enum([...COMPOUNDED_PRODUCT_AUDIT_OUTCOMES]),
    actor_id: model.text(),
    product_id: model.text().nullable(),
    variant_id: model.text().nullable(),
    presentation_id: model.text().nullable(),
    presentation_revision_id: model.text().nullable(),
    registration_id: model.text().nullable(),
    correlation_id: model.text().nullable(),
    decision: model.json<Record<string, unknown>>(),
  })
  .indexes([
    { on: ["product_id", "created_at"] },
    { on: ["presentation_id", "created_at"] },
    { on: ["event_type", "created_at"] },
    { on: ["correlation_id"] },
  ])

export default GovernanceAuditEvent
