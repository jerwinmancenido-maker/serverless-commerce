import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  releaseLockStep,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"
import {
  prepareCompoundedProductClassificationChangeStep,
  updateCompoundedProductRegistrationClassificationStep,
  type ChangeCompoundedProductClassificationWorkflowInput,
} from "./steps/change-compounded-product-classification"

export const changeCompoundedProductClassificationWorkflow = createWorkflow(
  "change-compounded-product-classification",
  function (input: ChangeCompoundedProductClassificationWorkflowInput) {
    const lockInput = transform({ input }, ({ input }) => ({
      key: `compounded-product-classification:${input.productId}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lockInput)
    const prepared = prepareCompoundedProductClassificationChangeStep(input)
    const registration =
      updateCompoundedProductRegistrationClassificationStep(prepared)
    const productUpdateInput = transform({ prepared }, ({ prepared }) => ({
      selector: { id: prepared.productId },
      update: { type_id: prepared.target_product_type_id },
    }))
    const product = updateProductsWorkflow.runAsStep({
      input: productUpdateInput,
    })
    const auditInput = transform(
      { prepared, registration, product },
      ({ prepared }) => [
        {
          event_type:
            prepared.action === "reclassify"
              ? ("governed_registration_reclassified" as const)
              : ("governed_registration_removed" as const),
          outcome: "succeeded" as const,
          actor_id: prepared.actorId,
          product_id: prepared.productId,
          variant_id: null,
          presentation_id: null,
          presentation_revision_id:
            prepared.registration.presentation_revision_id,
          registration_id: prepared.registration.id,
          correlation_id: null,
          decision: {
            reason: prepared.reason,
            action: prepared.action,
            current_product_type_id:
              prepared.impact.current_product_type_id,
            target_product_type_id: prepared.target_product_type_id,
            impact_fingerprint: prepared.impact.impact_fingerprint,
            variant_count: prepared.impact.variant_count,
            order_line_item_count: prepared.impact.order_line_item_count,
          },
        },
      ],
    )
    const auditEvents =
      createCompoundedProductGovernanceAuditEventsStep(auditInput)
    releaseLockStep(lockInput)

    return new WorkflowResponse({
      action: prepared.action,
      impact: prepared.impact,
      product,
      registration,
      audit_events: auditEvents,
    })
  },
)

export default changeCompoundedProductClassificationWorkflow
