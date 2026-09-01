import { model } from "@medusajs/framework/utils"

const ResearchCommunityIdentity = model
  .define("research_community_identity", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    display_name: model.text(),
    show_verified_badge: model.boolean().default(false),
    status: model.enum(["active", "suspended"]).default("active"),
    suspended_at: model.dateTime().nullable(),
    suspension_reason: model.text().nullable(),
  })
  .indexes([
    { on: ["customer_id"], unique: true },
    { on: ["display_name"], unique: true },
    { on: ["status"] },
  ])

export default ResearchCommunityIdentity

