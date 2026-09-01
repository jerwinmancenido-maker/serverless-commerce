import { model } from "@medusajs/framework/utils"

const RewardRedemption = model
  .define("reward_redemption", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    reward_account_id: model.text(),
    points: model.number(),
    peso_value: model.bigNumber(),
    reward_type: model.enum(["order_discount"]),
    promotion_id: model.text().nullable(),
    order_id: model.text().nullable(),
    status: model.enum(["pending", "applied", "cancelled", "reversed"]),
    idempotency_key: model.text(),
    redeemed_at: model.dateTime(),
  })
  .indexes([
    { on: ["customer_id", "idempotency_key"], unique: true },
    { on: ["reward_account_id", "status", "redeemed_at"] },
  ])

export default RewardRedemption
