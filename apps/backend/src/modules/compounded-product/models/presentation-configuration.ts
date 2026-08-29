import { model } from "@medusajs/framework/utils"

import { COMPOUNDED_PRODUCT_CONFIGURATION_STATUSES } from "../contracts/configuration"
import PresentationConfigurationRevision from "./presentation-configuration-revision"
import GovernedProductTypeMapping from "./governed-product-type-mapping"

const PresentationConfiguration = model.define(
  "compounded_product_presentation",
  {
    id: model.id().primaryKey(),
    key: model.text().unique(),
    status: model
      .enum([...COMPOUNDED_PRODUCT_CONFIGURATION_STATUSES])
      .default("draft"),
    current_revision_id: model.text().nullable(),
    latest_revision: model.number().default(0),
    revisions: model.hasMany(() => PresentationConfigurationRevision, {
      mappedBy: "presentation",
    }),
    governed_product_type_mappings: model.hasMany(
      () => GovernedProductTypeMapping,
      { mappedBy: "presentation" },
    ),
  },
)

export default PresentationConfiguration
