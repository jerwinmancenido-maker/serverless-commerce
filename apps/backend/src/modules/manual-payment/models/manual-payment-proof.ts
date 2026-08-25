import { model } from "@medusajs/framework/utils"

import { MANUAL_PAYMENT_PROOF_STATUSES } from "../contracts/payment-proof"

const ManualPaymentProof = model
  .define("manual_payment_proof", {
    id: model.id().primaryKey(),
    payment_session_id: model.text().unique(),
    order_id: model.text(),
    customer_id: model.text(),
    provider_id: model.text(),
    file_id: model.text(),
    file_name: model.text(),
    mime_type: model.text(),
    size_bytes: model.number(),
    checksum_sha256: model.text(),
    status: model.enum([...MANUAL_PAYMENT_PROOF_STATUSES]).default("pending"),
    revision: model.number().default(1),
    submitted_at: model.dateTime(),
    expires_at: model.dateTime().nullable(),
    reviewed_at: model.dateTime().nullable(),
    submitted_by_actor_id: model.text(),
    reviewed_by_actor_id: model.text().nullable(),
    rejection_reason: model.text().nullable(),
  })
  .indexes([
    { on: ["order_id"] },
    { on: ["customer_id", "status"] },
    { on: ["status", "expires_at"] },
  ])

export default ManualPaymentProof
