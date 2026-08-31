import { model } from "@medusajs/framework/utils"

import ResearchProtocolProductLink from "./research-protocol-product-link"

const ResearchProtocolVariantTarget = model
  .define("research_protocol_variant_target", {
    id: model.id().primaryKey(),
    product_variant_id: model.text(),
    product_link: model.belongsTo(() => ResearchProtocolProductLink, {
      mappedBy: "variant_targets",
    }),
  })
  .indexes([
    { on: ["product_link_id", "product_variant_id"], unique: true },
    { on: ["product_variant_id"] },
  ])

export default ResearchProtocolVariantTarget
