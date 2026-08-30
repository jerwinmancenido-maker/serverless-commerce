import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"
import {
  createConfiguredRecipeAuditSnapshotsStep,
  prepareConfiguredCompoundedProductRecipesStep,
  type ApplyConfiguredCompoundedProductRecipesInput,
} from "./steps/apply-configured-compounded-product-recipes"

export const applyConfiguredCompoundedProductRecipesWorkflow = createWorkflow(
  "apply-configured-compounded-product-recipes",
  function (input: ApplyConfiguredCompoundedProductRecipesInput) {
    const prepared = prepareConfiguredCompoundedProductRecipesStep(input)
    const hasRecipes = transform({ prepared }, ({ prepared }) =>
      Boolean(prepared.recipes.length),
    )

    when({ hasRecipes }, ({ hasRecipes }) => hasRecipes).then(() =>
      updateProductVariantsWorkflow.runAsStep({
        input: prepared.variantUpdates,
      }),
    )
    const snapshots = when(
      { hasRecipes },
      ({ hasRecipes }) => hasRecipes,
    ).then(() => createConfiguredRecipeAuditSnapshotsStep(prepared.recipes))
    const governanceAuditInput = transform(
      { prepared, snapshots },
      ({ prepared, snapshots }) =>
        prepared.recipes.map((recipe, index) => ({
          event_type: "recipe_changed" as const,
          outcome: "succeeded" as const,
          actor_id: recipe.actorId,
          product_id: recipe.productId,
          variant_id: recipe.variantId,
          presentation_id: null,
          presentation_revision_id: recipe.presentationRevisionId,
          registration_id: recipe.registrationId,
          correlation_id: null,
          decision: {
            changed: true,
            source: "configured_product_creation",
            matrix_row_key: recipe.matrixRowKey,
            recipe_hash: snapshots?.[index]?.recipe_hash || null,
            component_count: recipe.components.length,
            recipe_audit_snapshot_id: snapshots?.[index]?.id || null,
          },
        })),
    )
    createCompoundedProductGovernanceAuditEventsStep(governanceAuditInput)

    return new WorkflowResponse({
      recipes: prepared.recipes,
      auditSnapshots: snapshots,
    })
  },
)

export default applyConfiguredCompoundedProductRecipesWorkflow
