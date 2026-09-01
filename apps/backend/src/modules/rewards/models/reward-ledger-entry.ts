import { model } from "@medusajs/framework/utils"

const RewardLedgerEntry = model
  .define("reward_ledger_entry", {
    id: model.id().primaryKey(),
    reward_account_id: model.text(),
    entry_type: model.enum(["earn", "redeem", "reverse", "expire", "adjustment"]),
    points: model.number(),
    status: model.enum(["pending", "available", "reversed", "cancelled"]),
    rule_id: model.text().nullable(),
    source_type: model.text(),
    source_id: model.text(),
    order_id: model.text().nullable(),
    idempotency_key: model.text(),
    available_at: model.dateTime().nullable(),
    expires_at: model.dateTime().nullable(),
    reversal_entry_id: model.text().nullable(),
    admin_reason: model.text().nullable(),
  })
  .indexes([
    { on: ["reward_account_id", "idempotency_key"], unique: true },
    { on: ["reward_account_id", "status", "created_at"] },
    { on: ["order_id"] },
  ])

export default RewardLedgerEntry
