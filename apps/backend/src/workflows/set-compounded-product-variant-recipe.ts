import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import setVariantInventoryKitWorkflow from "./set-variant-inventory-kit"
import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"

export type SetCompoundedProductVariantRecipeWorkflowInput = {
  productId: string
  registrationId: string
  variantId: string
  components: Array<{
    inventoryItemId: string
    requiredQuantity: number
  }>
  actorId: string
  note?: string
}

export const setCompoundedProductVariantRecipeWorkflow = createWorkflow(
  "set-compounded-product-variant-recipe",
  function (input: SetCompoundedProductVariantRecipeWorkflowInput) {
    const recipeInput = transform({ input }, ({ input }) => ({
      variantId: input.variantId,
      components: input.components,
      actorId: input.actorId,
      note: input.note,
    }))
    const recipe = setVariantInventoryKitWorkflow.runAsStep({
      input: recipeInput,
    })
    const auditInput = transform({ input, recipe }, ({ input, recipe }) => [
      {
        event_type: "recipe_changed" as const,
        outcome: "succeeded" as const,
        actor_id: input.actorId,
        product_id: input.productId,
        variant_id: input.variantId,
        presentation_id: null,
        presentation_revision_id: null,
        registration_id: input.registrationId,
        correlation_id: null,
        decision: {
          changed: recipe.change.shouldReplace,
          recipe_hash: recipe.auditSnapshot?.recipe_hash || null,
          component_count: input.components.length,
          recipe_audit_snapshot_id: recipe.auditSnapshot?.id || null,
          note: input.note || null,
        },
      },
    ])
    createCompoundedProductGovernanceAuditEventsStep(auditInput)

    return new WorkflowResponse(recipe)
  },
)

export default setCompoundedProductVariantRecipeWorkflow
