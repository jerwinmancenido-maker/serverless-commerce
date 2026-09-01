import { model } from "@medusajs/framework/utils"

const CustomerNotificationDeliveryAttempt = model
  .define("customer_notification_delivery_attempt", {
    id: model.id().primaryKey(),
    notification_id: model.text(),
    channel: model.enum(["in_app", "email", "browser_push", "mobile_push", "sms"]),
    status: model.enum(["delivered", "failed", "skipped", "retry_pending"]),
    attempted_at: model.dateTime(),
    provider_reference: model.text().nullable(),
    failure_code: model.text().nullable(),
    retry_at: model.dateTime().nullable(),
  })
  .indexes([
    { on: ["notification_id", "attempted_at"] },
    { on: ["status", "attempted_at"] },
  ])

export default CustomerNotificationDeliveryAttempt
