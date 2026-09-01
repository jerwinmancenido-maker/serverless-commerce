import { model } from "@medusajs/framework/utils"

const RewardAccount = model
  .define("reward_account", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    program_id: model.text(),
    status: model.enum(["active", "suspended", "closed"]).default("active"),
    lifetime_earned: model.number().default(0),
  })
  .indexes([
    { on: ["customer_id", "program_id"], unique: true },
    { on: ["customer_id", "status"] },
  ])

export default RewardAccount
