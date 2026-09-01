import { model } from "@medusajs/framework/utils"

const SupportSavedResponse = model
  .define("support_saved_response", {
    id: model.id().primaryKey(),
    title: model.text(),
    body: model.text(),
    category: model
      .enum([
        "order",
        "payment",
        "shipping",
        "product",
        "protocol_access",
        "account",
        "rewards",
        "technical",
        "other",
      ])
      .nullable(),
    active: model.boolean().default(true),
    sort_order: model.number().default(0),
    created_by_actor_id: model.text(),
    updated_by_actor_id: model.text(),
  })
  .indexes([
    { on: ["active", "category", "sort_order"] },
    { on: ["title"], unique: true },
  ])

export default SupportSavedResponse
