import { model } from "@medusajs/framework/utils"

const ResearchNotificationDeliveryAttempt = model
  .define("research_notification_delivery_attempt", {
    id: model.id().primaryKey(),
    notification_id: model.text(),
    channel: model.enum(["in_app", "email", "browser_push", "mobile_push"]),
    status: model.enum(["delivered", "failed", "skipped"]),
    attempted_at: model.dateTime(),
    provider_reference: model.text().nullable(),
    error_code: model.text().nullable(),
    detail: model.text().nullable(),
  })
  .indexes([{ on: ["notification_id", "attempted_at"] }])

export default ResearchNotificationDeliveryAttempt
