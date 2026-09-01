import { model } from "@medusajs/framework/utils"

const CustomerNotificationTemplateRevision = model
  .define("customer_notification_template_revision", {
    id: model.id().primaryKey(),
    template_id: model.text(),
    event_key: model.text(),
    version: model.number(),
    title_template: model.text(),
    body_template: model.text(),
    action_label: model.text().nullable(),
    allowed_variables: model.json<{ values: string[] }>(),
    changed_by_actor_id: model.text(),
    change_reason: model.text(),
  })
  .indexes([
    { on: ["template_id", "version"], unique: true },
    { on: ["event_key", "created_at"] },
  ])

export default CustomerNotificationTemplateRevision
