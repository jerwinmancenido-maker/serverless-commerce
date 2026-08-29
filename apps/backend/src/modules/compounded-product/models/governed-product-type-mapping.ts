import { model } from "@medusajs/framework/utils"

import { COMPOUNDED_PRODUCT_CLASSIFICATION_MAPPING_STATUSES } from "../contracts/classification"
import PresentationConfiguration from "./presentation-configuration"

const GovernedProductTypeMapping = model
  .define("compounded_product_type_mapping", {
    id: model.id().primaryKey(),
    product_type_id: model.text(),
    status: model
      .enum([...COMPOUNDED_PRODUCT_CLASSIFICATION_MAPPING_STATUSES])
      .default("active"),
    reason: model.text(),
    created_by_actor_id: model.text(),
    updated_by_actor_id: model.text(),
    activated_at: model.dateTime().nullable(),
    deactivated_at: model.dateTime().nullable(),
    archived_at: model.dateTime().nullable(),
    presentation: model.belongsTo(() => PresentationConfiguration, {
      mappedBy: "governed_product_type_mappings",
    }),
  })
  .indexes([
    { on: ["product_type_id", "presentation_id"], unique: true },
    { on: ["product_type_id", "status"] },
    { on: ["presentation_id", "status"] },
  ])

export default GovernedProductTypeMapping
