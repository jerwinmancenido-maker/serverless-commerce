import { model } from "@medusajs/framework/utils"

const ResearchReminderPreference = model
  .define("research_reminder_preference", {
    id: model.id().primaryKey(),
    profile_id: model.text(),
    enabled: model.boolean().default(true),
    timezone: model.text().default("Asia/Manila"),
    lead_minutes: model.json(),
    quiet_hours_enabled: model.boolean().default(false),
    quiet_hours_start: model.text().nullable(),
    quiet_hours_end: model.text().nullable(),
    daily_summary: model.boolean().default(false),
    weekly_summary: model.boolean().default(false),
    replenishment_reminders: model.boolean().default(true),
    progress_reminders: model.boolean().default(false),
    journal_prompts: model.boolean().default(false),
    reward_notifications: model.boolean().default(true),
  })
  .indexes([{ on: ["profile_id"], unique: true }])

export default ResearchReminderPreference
