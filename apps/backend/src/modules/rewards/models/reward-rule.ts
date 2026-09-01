import { model } from "@medusajs/framework/utils"

const RewardRule = model
  .define("reward_rule", {
    id: model.id().primaryKey(),
    name: model.text(),
    event_type: model.text(),
    award_type: model.enum(["fixed", "purchase_rate"]),
    point_value: model.number().nullable(),
    purchase_amount_per_point: model.bigNumber().nullable(),
    eligible_product_ids: model.json().nullable(),
    eligible_category_ids: model.json().nullable(),
    daily_cap: model.number().nullable(),
    weekly_cap: model.number().nullable(),
    lifetime_cap: model.number().nullable(),
    starts_at: model.dateTime().nullable(),
    ends_at: model.dateTime().nullable(),
    status: model.enum(["active", "inactive"]).default("active"),
    show_as_badge: model.boolean().default(false),
    badge_name: model.text().nullable(),
    badge_icon: model.text().nullable(),
    streak_target: model.number().nullable(),
    skip_policy: model.enum(["ignore", "break"]).default("ignore"),
    program_id: model.text(),
  })
  .indexes([
    { on: ["program_id", "event_type", "status"] },
    { on: ["program_id", "name"], unique: true },
  ])

export default RewardRule
