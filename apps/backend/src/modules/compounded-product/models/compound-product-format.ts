import { model } from "@medusajs/framework/utils"

import { COMPOUND_PRODUCT_FORMAT_STATUSES } from "../contracts/compound-product-format"
import GovernedProductRegistration from "./governed-product-registration"

const CompoundProductFormat = model
  .define("compounded_product_format", {
    id: model.id().primaryKey(),
    key: model.text().unique(),
    name: model.text(),
    description: model.text().nullable(),
    status: model
      .enum([...COMPOUND_PRODUCT_FORMAT_STATUSES])
      .default("active"),
    created_by_actor_id: model.text(),
    updated_by_actor_id: model.text(),
    archived_at: model.dateTime().nullable(),
    registrations: model.hasMany(() => GovernedProductRegistration, {
      mappedBy: "compound_format",
    }),
  })
  .indexes([{ on: ["status"] }, { on: ["name"] }])

export default CompoundProductFormat
