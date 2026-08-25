import { model } from "@medusajs/framework/utils"

import {
  MANUAL_PAYMENT_PROOF_EVENT_TYPES,
  MANUAL_PAYMENT_PROOF_STATUSES,
} from "../contracts/payment-proof"

const ManualPaymentProofEvent = model
  .define("manual_payment_proof_event", {
    id: model.id().primaryKey(),
    proof_id: model.text(),
    payment_session_id: model.text(),
    order_id: model.text(),
    revision: model.number(),
    event_type: model.enum([...MANUAL_PAYMENT_PROOF_EVENT_TYPES]),
    status: model.enum([...MANUAL_PAYMENT_PROOF_STATUSES]),
    file_id: model.text(),
    file_name: model.text(),
    mime_type: model.text(),
    size_bytes: model.number(),
    checksum_sha256: model.text(),
    actor_id: model.text(),
    reason: model.text().nullable(),
    occurred_at: model.dateTime(),
  })
  .indexes([
    {
      on: ["proof_id", "revision", "event_type"],
      unique: true,
    },
    { on: ["payment_session_id", "occurred_at"] },
    { on: ["order_id", "occurred_at"] },
  ])

export default ManualPaymentProofEvent
