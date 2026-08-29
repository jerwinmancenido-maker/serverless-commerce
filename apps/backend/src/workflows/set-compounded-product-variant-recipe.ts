import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import setVariantInventoryKitWorkflow from "./set-variant-inventory-kit"
import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"
import {
  prepareCompoundedProductVariantRecipeStep,
  resolveCompoundedProductRecipeReadinessStep,
  type SetCompoundedProductVariantRecipeWorkflowInput,
} from "./steps/set-compounded-product-variant-recipe"

export type { SetCompoundedProductVariantRecipeWorkflowInput }

export const setCompoundedProductVariantRecipeWorkflow = createWorkflow(
  "set-compounded-product-variant-recipe",
  function (input: SetCompoundedProductVariantRecipeWorkflowInput) {
    const prepared = prepareCompoundedProductVariantRecipeStep(input)
    const recipeInput = transform({ prepared }, ({ prepared }) => ({
      variantId: prepared.variantId,
      components: prepared.components,
      actorId: prepared.actorId,
      note: prepared.note,
    }))
    const recipe = setVariantInventoryKitWorkflow.runAsStep({
      input: recipeInput,
    })
    const auditInput = transform({ prepared, recipe }, ({ prepared, recipe }) => [
      {
        event_type: "recipe_changed" as const,
        outcome: "succeeded" as const,
        actor_id: prepared.actorId,
        product_id: prepared.productId,
        variant_id: prepared.variantId,
        presentation_id: null,
        presentation_revision_id: null,
        registration_id: prepared.registrationId,
        correlation_id: null,
        decision: {
          changed: recipe.change.shouldReplace,
          recipe_hash: recipe.auditSnapshot?.recipe_hash || null,
          component_count: prepared.components.length,
          recipe_audit_snapshot_id: recipe.auditSnapshot?.id || null,
          note: prepared.note || null,
        },
      },
    ])
    const auditEvents =
      createCompoundedProductGovernanceAuditEventsStep(auditInput)
    const readinessInput = transform(
      { prepared, recipe, auditEvents },
      ({ prepared }) => ({ productId: prepared.productId }),
    )
    const readiness =
      resolveCompoundedProductRecipeReadinessStep(readinessInput)

    return new WorkflowResponse({
      change: recipe.change,
      auditSnapshot: recipe.auditSnapshot,
      normalizedComponents: prepared.normalizedComponents,
      readiness,
    })
  },
)

export default setCompoundedProductVariantRecipeWorkflow
