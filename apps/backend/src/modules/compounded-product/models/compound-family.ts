import { model } from "@medusajs/framework/utils"

import { COMPOUND_FAMILY_STATUSES } from "../contracts/compound-family"
import GovernedProductRegistration from "./governed-product-registration"

const CompoundFamily = model
  .define("compounded_product_family", {
    id: model.id().primaryKey(),
    key: model.text().unique(),
    name: model.text(),
    description: model.text().nullable(),
    status: model.enum([...COMPOUND_FAMILY_STATUSES]).default("active"),
    created_by_actor_id: model.text(),
    updated_by_actor_id: model.text(),
    archived_at: model.dateTime().nullable(),
    registrations: model.hasMany(() => GovernedProductRegistration, {
      mappedBy: "compound_family",
    }),
  })
  .indexes([{ on: ["status"] }, { on: ["name"] }])

export default CompoundFamily
