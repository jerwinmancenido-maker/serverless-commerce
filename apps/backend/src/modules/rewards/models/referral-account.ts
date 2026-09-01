import { model } from "@medusajs/framework/utils"

const ReferralAccount = model
  .define("referral_account", {
    id: model.id().primaryKey(),
    program_id: model.text(),
    customer_id: model.text(),
    code: model.text(),
    status: model.enum(["active", "suspended", "closed"]).default("active"),
    qualified_referrals: model.number().default(0),
  })
  .indexes([
    { on: ["program_id", "customer_id"], unique: true },
    { on: ["program_id", "code"], unique: true },
  ])

export default ReferralAccount
