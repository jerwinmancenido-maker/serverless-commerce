import { model } from "@medusajs/framework/utils"

import {
  COMPOUNDED_PRODUCT_REGISTRATION_STATES,
  type CompoundedProductReadinessPolicySnapshot,
} from "../contracts/governance"
import type { CompoundedProductPresentationSnapshot } from "../contracts/configuration"
import CompoundFamily from "./compound-family"
import CompoundProductFormat from "./compound-product-format"
import PresentationConfigurationRevision from "./presentation-configuration-revision"

const GovernedProductRegistration = model
  .define("compounded_product_registration", {
    id: model.id().primaryKey(),
    product_id: model.text().unique(),
    governed_product_type_id: model.text().nullable(),
    catalog_kind: model.text(),
    contract_schema_version: model.text(),
    configuration_snapshot: model.json<CompoundedProductPresentationSnapshot>(),
    configuration_fingerprint: model.text(),
    readiness_policy_revision: model.text(),
    readiness_policy_snapshot:
      model.json<CompoundedProductReadinessPolicySnapshot>(),
    state: model
      .enum([...COMPOUNDED_PRODUCT_REGISTRATION_STATES])
      .default("draft"),
    created_by_actor_id: model.text(),
    updated_by_actor_id: model.text(),
    published_at: model.dateTime().nullable(),
    withdrawn_at: model.dateTime().nullable(),
    compound_family: model
      .belongsTo(() => CompoundFamily, { mappedBy: "registrations" })
      .nullable(),
    compound_format: model
      .belongsTo(() => CompoundProductFormat, { mappedBy: "registrations" })
      .nullable(),
    presentation_revision: model.belongsTo(
      () => PresentationConfigurationRevision,
      { mappedBy: "registrations" },
    ),
  })
  .indexes([
    { on: ["state"] },
    { on: ["compound_family_id"] },
    { on: ["compound_format_id"] },
    { on: ["configuration_fingerprint"] },
  ])

export default GovernedProductRegistration
