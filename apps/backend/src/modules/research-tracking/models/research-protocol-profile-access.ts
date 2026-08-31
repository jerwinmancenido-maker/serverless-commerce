import { model } from "@medusajs/framework/utils"

import ResearchProfile from "./research-profile"

const ResearchProtocolProfileAccess = model
  .define("research_protocol_profile_access", {
    id: model.id().primaryKey(),
    customer_id: model.text(),
    order_protocol_access_id: model.text(),
    protocol_series_id: model.text(),
    protocol_revision_id: model.text(),
    order_id: model.text(),
    line_item_id: model.text(),
    product_id: model.text(),
    product_variant_id: model.text().nullable(),
    protocol_handle_snapshot: model.text(),
    protocol_title_snapshot: model.text(),
    revision_number_snapshot: model.number(),
    granted_at: model.dateTime(),
    first_viewed_at: model.dateTime().nullable(),
    last_viewed_at: model.dateTime().nullable(),
    status: model.enum(["active", "revoked"]).default("active"),
    routine_started_at: model.dateTime().nullable(),
    routine_id: model.text().nullable(),
    profile: model.belongsTo(() => ResearchProfile, {
      mappedBy: "protocol_accesses",
    }),
  })
  .indexes([
    { on: ["order_protocol_access_id"], unique: true },
    { on: ["profile_id", "status", "granted_at"] },
    { on: ["profile_id", "protocol_series_id", "protocol_revision_id"] },
  ])

export default ResearchProtocolProfileAccess
