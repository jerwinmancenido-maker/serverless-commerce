import { model } from "@medusajs/framework/utils"

import ResearchProtocol from "./research-protocol"

const ResearchProtocolOrderAccess = model
  .define("research_protocol_order_access", {
    id: model.id().primaryKey(),
    access_token: model.text(),
    order_id: model.text(),
    line_item_id: model.text(),
    product_id: model.text(),
    product_variant_id: model.text().nullable(),
    protocol_handle_snapshot: model.text(),
    protocol_title_snapshot: model.text(),
    revision_number_snapshot: model.number(),
    issued_at: model.dateTime(),
    revoked_at: model.dateTime().nullable(),
    revision: model.belongsTo(() => ResearchProtocol),
  })
  .indexes([
    { on: ["access_token"], unique: true },
    { on: ["order_id", "line_item_id", "revision_id"], unique: true },
    { on: ["order_id", "revoked_at"] },
  ])

export default ResearchProtocolOrderAccess
