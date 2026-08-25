import { model } from "@medusajs/framework/utils"

import {
  MANUAL_PAYMENT_SETTLEMENT_ERROR_CATEGORIES,
  MANUAL_PAYMENT_SETTLEMENT_EVENT_TYPES,
  MANUAL_PAYMENT_SETTLEMENT_STATUSES,
} from "../contracts/payment-settlement"

const ManualPaymentSettlementEvent = model
  .define("manual_payment_settlement_event", {
    id: model.id().primaryKey(),
    attempt_id: model.text(),
    proof_id: model.text(),
    proof_revision: model.number(),
    payment_session_id: model.text(),
    order_id: model.text(),
    event_type: model.enum([...MANUAL_PAYMENT_SETTLEMENT_EVENT_TYPES]),
    status: model.enum([...MANUAL_PAYMENT_SETTLEMENT_STATUSES]),
    actor_id: model.text(),
    payment_id: model.text().nullable(),
    capture_id: model.text().nullable(),
    error_category: model
      .enum([...MANUAL_PAYMENT_SETTLEMENT_ERROR_CATEGORIES])
      .nullable(),
    occurred_at: model.dateTime(),
  })
  .indexes([
    {
      on: ["proof_id", "proof_revision", "attempt_id", "event_type"],
      unique: true,
    },
    { on: ["payment_session_id", "occurred_at"] },
    { on: ["order_id", "occurred_at"] },
    { on: ["payment_id"] },
    { on: ["capture_id"] },
  ])

export default ManualPaymentSettlementEvent
