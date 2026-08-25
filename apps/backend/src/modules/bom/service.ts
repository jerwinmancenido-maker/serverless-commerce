import { MedusaError, MedusaService } from "@medusajs/framework/utils"

import ComponentProfile from "./models/component-profile"
import RecipeAuditSnapshot from "./models/recipe-audit-snapshot"

class PepstackBomModuleService extends MedusaService({
  ComponentProfile,
  RecipeAuditSnapshot,
}) {
  override updateRecipeAuditSnapshots = async (
    ..._updates: unknown[]
  ): Promise<never> => {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "recipe audit snapshots are immutable",
    )
  }
}

export default PepstackBomModuleService
