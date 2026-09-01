import { model } from "@medusajs/framework/utils"

const CustomerNotificationPreference = model
  .define("customer_notification_preference", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    event_key: model.text(),
    enabled: model.boolean(),
  })
  .indexes([
    { on: ["customer_id", "event_key"], unique: true },
    { on: ["customer_id"] },
  ])

export default CustomerNotificationPreference
