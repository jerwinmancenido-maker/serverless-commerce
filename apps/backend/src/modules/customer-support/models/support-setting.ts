import { model } from "@medusajs/framework/utils"

const SupportSetting = model.define("support_setting", {
  id: model.id().primaryKey(),
  singleton_key: model.text().default("default"),
  support_enabled: model.boolean().default(true),
  side_panel_enabled: model.boolean().default(true),
  display_name: model.text().default("Customer support"),
  response_time_message: model
    .text()
    .default("We usually reply within one business day."),
  timezone: model.text().default("Asia/Manila"),
  offline_message: model
    .text()
    .default("Send us a message and our support team will follow up."),
  business_hours_enabled: model.boolean().default(false),
  business_hours: model.json().nullable(),
  attachment_uploads_enabled: model.boolean().default(true),
  maximum_attachment_size_bytes: model.number().default(10 * 1024 * 1024),
  allowed_mime_types: model
    .json()
    .default({ values: ["image/jpeg", "image/png", "application/pdf"] }),
  customer_message_limit_per_hour: model.number().default(12),
  email_notifications_enabled: model.boolean().default(false),
  auto_acknowledgement_enabled: model.boolean().default(false),
  auto_acknowledgement_text: model
    .text()
    .default(
      "Thanks for contacting us. We received your message and usually reply within one business day.",
    ),
  retention_days: model.number().nullable(),
  updated_by_actor_id: model.text().nullable(),
}).indexes([{ on: ["singleton_key"], unique: true }])

export default SupportSetting
