import { model } from "@medusajs/framework/utils"

const ResearchHubSetting = model
  .define("research_hub_setting", {
    id: model.id().primaryKey(),
    setting_key: model.text().default("global"),
    in_app_enabled: model.boolean().default(true),
    email_enabled: model.boolean().default(false),
    browser_push_enabled: model.boolean().default(false),
    mobile_push_enabled: model.boolean().default(false),
    default_timezone: model.text().default("Asia/Manila"),
    default_lead_minutes: model.json(),
    default_quiet_hours_start: model.text().default("22:00"),
    default_quiet_hours_end: model.text().default("07:00"),
    calendar_past_days: model.number().default(365),
    calendar_future_days: model.number().default(365),
    reorder_now_days: model.number().default(14),
    plan_reorder_days: model.number().default(30),
    default_replenishment_snooze_days: model.number().default(7),
    attachment_max_bytes: model.number().default(10_485_760),
    attachment_allowed_types: model.json(),
    reminders_enabled: model.boolean().default(true),
    calendar_enabled: model.boolean().default(true),
    calculator_snapshots_enabled: model.boolean().default(true),
    goals_enabled: model.boolean().default(true),
    referrals_enabled: model.boolean().default(false),
    updated_by: model.text().nullable(),
  })
  .indexes([{ on: ["setting_key"], unique: true }])

export default ResearchHubSetting
