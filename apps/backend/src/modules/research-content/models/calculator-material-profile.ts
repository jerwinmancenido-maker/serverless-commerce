import { model } from "@medusajs/framework/utils"

import { RESEARCH_BASE_UNITS } from "../../../lib/research-quantity"
import {
  RESEARCH_CONTENT_STATUSES,
  RESEARCH_EVIDENCE_SCOPES,
} from "../contracts/content"

const CalculatorMaterialProfile = model
  .define("calculator_material_profile", {
    id: model.id().primaryKey(),
    profile_key: model.text(),
    revision: model.number(),
    product_variant_id: model.text(),
    material_quantity_base_units: model.number(),
    material_base_unit: model.enum([...RESEARCH_BASE_UNITS]),
    display_unit: model.text(),
    base_units_per_display_unit: model.number(),
    display_precision: model.number().default(0),
    status: model.enum([...RESEARCH_CONTENT_STATUSES]).default("draft"),
    evidence_scope: model.enum([...RESEARCH_EVIDENCE_SCOPES]),
    effective_at: model.dateTime().nullable(),
    published_at: model.dateTime().nullable(),
    withdrawn_at: model.dateTime().nullable(),
    created_by_actor_id: model.text().nullable(),
  })
  .indexes([
    { on: ["profile_key", "revision"], unique: true },
    { on: ["product_variant_id", "status"] },
  ])

export default CalculatorMaterialProfile
