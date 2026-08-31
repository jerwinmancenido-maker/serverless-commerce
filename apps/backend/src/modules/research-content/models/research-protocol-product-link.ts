import { model } from "@medusajs/framework/utils"

import { RESEARCH_PROTOCOL_APPLICABILITY_SCOPES } from "../contracts/content"
import ResearchProtocolSeries from "./research-protocol-series"
import ResearchProtocolVariantTarget from "./research-protocol-variant-target"

const ResearchProtocolProductLink = model
  .define("research_protocol_product_link", {
    id: model.id().primaryKey(),
    product_id: model.text(),
    applicability_scope: model
      .enum([...RESEARCH_PROTOCOL_APPLICABILITY_SCOPES])
      .default("entire_product"),
    is_primary: model.boolean().default(false),
    archived_at: model.dateTime().nullable(),
    created_by_actor_id: model.text().nullable(),
    updated_by_actor_id: model.text().nullable(),
    series: model.belongsTo(() => ResearchProtocolSeries, {
      mappedBy: "product_links",
    }),
    variant_targets: model.hasMany(() => ResearchProtocolVariantTarget, {
      mappedBy: "product_link",
    }),
  })
  .indexes([
    { on: ["series_id", "product_id"], unique: true },
    { on: ["product_id", "archived_at"] },
    { on: ["product_id", "is_primary"] },
  ])

export default ResearchProtocolProductLink
