import { model } from "@medusajs/framework/utils"

const SupportCategory = model.define("support_category", {
  id: model.id().primaryKey(),
  key: model.text(),
  label: model.text(),
  guidance: model.text().nullable(),
  enabled: model.boolean().default(true),
  sort_order: model.number().default(0),
  default_priority: model
    .enum(["low", "normal", "high", "urgent"])
    .default("normal"),
}).indexes([
  { on: ["key"], unique: true },
  { on: ["enabled", "sort_order"] },
])

export default SupportCategory
