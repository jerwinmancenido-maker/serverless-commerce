import { model } from "@medusajs/framework/utils"

import {
  COMPOUNDED_PRODUCT_REVISION_STATUSES,
  type CompoundedProductPresentationSnapshot,
} from "../contracts/configuration"
import PresentationConfiguration from "./presentation-configuration"

const PresentationConfigurationRevision = model
  .define("compounded_product_presentation_revision", {
    id: model.id().primaryKey(),
    revision: model.number(),
    schema_version: model.text(),
    status: model
      .enum([...COMPOUNDED_PRODUCT_REVISION_STATUSES])
      .default("draft"),
    snapshot: model.json<CompoundedProductPresentationSnapshot>(),
    fingerprint: model.text(),
    reason: model.text().nullable(),
    created_by_actor_id: model.text().nullable(),
    activated_at: model.dateTime().nullable(),
    superseded_at: model.dateTime().nullable(),
    blocked_at: model.dateTime().nullable(),
    archived_at: model.dateTime().nullable(),
    presentation: model.belongsTo(() => PresentationConfiguration, {
      mappedBy: "revisions",
    }),
  })
  .indexes([
    { on: ["presentation_id", "revision"], unique: true },
    { on: ["presentation_id", "status"] },
    { on: ["fingerprint"] },
  ])

export default PresentationConfigurationRevision
