import { model } from "@medusajs/framework/utils"

const ResearchNotification = model
  .define("research_notification", {
    id: model.id().primaryKey(),
    profile_id: model.text(),
    routine_id: model.text().nullable(),
    routine_revision_id: model.text().nullable(),
    occurrence_id: model.text().nullable(),
    type: model.enum([
      "routine_reminder",
      "daily_summary",
      "weekly_summary",
      "replenishment",
      "progress",
      "journal_prompt",
      "reward",
    ]),
    channel: model.enum(["in_app", "email", "browser_push", "mobile_push"]),
    title: model.text(),
    body: model.text(),
    status: model.enum([
      "scheduled",
      "unread",
      "read",
      "snoozed",
      "dismissed",
      "failed",
    ]),
    scheduled_for: model.dateTime(),
    available_at: model.dateTime(),
    delivered_at: model.dateTime().nullable(),
    read_at: model.dateTime().nullable(),
    dismissed_at: model.dateTime().nullable(),
    snoozed_until: model.dateTime().nullable(),
    source_local_date: model.dateTime().nullable(),
    source_local_time: model.text().nullable(),
    timezone: model.text(),
    idempotency_key: model.text(),
    template_version: model.text().default("in-app-routine-reminder-v1"),
    metadata: model.json().nullable(),
  })
  .indexes([
    { on: ["idempotency_key"], unique: true },
    { on: ["profile_id", "status", "available_at"] },
    { on: ["occurrence_id", "channel"] },
  ])

export default ResearchNotification
