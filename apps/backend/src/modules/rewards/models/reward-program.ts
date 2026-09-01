import { model } from "@medusajs/framework/utils"

const RewardProgram = model
  .define("reward_program", {
    id: model.id().primaryKey(),
    name: model.text(),
    status: model.enum(["draft", "active", "paused"]).default("draft"),
    currency_code: model.text().default("php"),
    purchase_amount_per_point: model.bigNumber().default(100),
    peso_value_per_point: model.bigNumber().default(1),
    minimum_redemption_points: model.number().default(100),
    maximum_redemption_points: model.number().nullable(),
    points_expire_after_days: model.number().nullable(),
    pending_period_days: model.number().default(0),
    referral_enabled: model.boolean().default(false),
    referral_minimum_order_amount: model.bigNumber().default(0),
    referral_waiting_period_days: model.number().default(0),
    referral_maximum_per_customer: model.number().nullable(),
    referral_refund_reversal_enabled: model.boolean().default(true),
    referral_eligible_product_ids: model.json().nullable(),
    referral_starts_at: model.dateTime().nullable(),
    referral_ends_at: model.dateTime().nullable(),
  })
  .indexes([{ on: ["status"] }])

export default RewardProgram
