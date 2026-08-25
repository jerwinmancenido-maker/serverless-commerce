import { model } from "@medusajs/framework/utils"

import type { RecipeSnapshotComponent } from "../contracts/recipe-audit"

const RecipeAuditSnapshot = model
  .define("recipe_audit_snapshot", {
    id: model.id().primaryKey(),
    variant_id: model.text(),
    version: model.number(),
    recipe_hash: model.text(),
    components: model.json<RecipeSnapshotComponent[]>(),
    actor_id: model.text().nullable(),
    note: model.text().nullable(),
  })
  .indexes([
    {
      on: ["variant_id", "version"],
      unique: true,
    },
    {
      on: ["variant_id", "recipe_hash"],
    },
  ])

export default RecipeAuditSnapshot
