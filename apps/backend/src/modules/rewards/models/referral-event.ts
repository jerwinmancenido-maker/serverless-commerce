import { model } from "@medusajs/framework/utils"

const ReferralEvent = model
  .define("referral_event", {
    id: model.id().primaryKey(),
    program_id: model.text(),
    referral_account_id: model.text(),
    referral_code_snapshot: model.text(),
    referrer_customer_id: model.text(),
    referred_customer_id: model.text(),
    status: model.enum(["pending", "qualified", "reversed", "rejected"]).default("pending"),
    qualifying_order_id: model.text().nullable(),
    qualifying_payment_id: model.text().nullable(),
    eligible_amount: model.bigNumber().nullable(),
    referrer_points: model.number().default(0),
    referred_customer_points: model.number().default(0),
    waiting_period_days: model.number().default(0),
    claimed_at: model.dateTime(),
    qualified_at: model.dateTime().nullable(),
    available_at: model.dateTime().nullable(),
    reversed_at: model.dateTime().nullable(),
    rejection_reason: model.text().nullable(),
  })
  .indexes([
    { on: ["program_id", "referred_customer_id"], unique: true },
    { on: ["referral_account_id", "status"] },
    { on: ["qualifying_order_id"] },
  ])

export default ReferralEvent
