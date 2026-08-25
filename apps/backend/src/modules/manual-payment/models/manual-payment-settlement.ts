import { model } from "@medusajs/framework/utils"

import {
  MANUAL_PAYMENT_SETTLEMENT_ERROR_CATEGORIES,
  MANUAL_PAYMENT_SETTLEMENT_STATUSES,
} from "../contracts/payment-settlement"

const ManualPaymentSettlement = model
  .define("manual_payment_settlement", {
    id: model.id().primaryKey(),
    proof_id: model.text(),
    proof_revision: model.number(),
    payment_session_id: model.text(),
    order_id: model.text(),
    status: model
      .enum([...MANUAL_PAYMENT_SETTLEMENT_STATUSES])
      .default("not_started"),
    attempt_count: model.number().default(0),
    current_attempt_id: model.text().nullable(),
    payment_id: model.text().nullable(),
    capture_id: model.text().nullable(),
    requested_at: model.dateTime().nullable(),
    authorization_confirmed_at: model.dateTime().nullable(),
    capture_confirmed_at: model.dateTime().nullable(),
    failed_at: model.dateTime().nullable(),
    last_error_category: model
      .enum([...MANUAL_PAYMENT_SETTLEMENT_ERROR_CATEGORIES])
      .nullable(),
    last_attempted_by_actor_id: model.text().nullable(),
  })
  .indexes([
    { on: ["proof_id", "proof_revision"], unique: true },
    { on: ["payment_session_id", "status"] },
    { on: ["order_id", "status"] },
    { on: ["payment_id"] },
    { on: ["capture_id"] },
  ])

export default ManualPaymentSettlement
