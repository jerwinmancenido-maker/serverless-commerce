import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"
import {
  transitionCompoundedProductClassificationMappingStep,
  type TransitionCompoundedProductClassificationMappingWorkflowInput,
} from "./steps/manage-compounded-product-classification-mapping"

export const transitionCompoundedProductClassificationMappingWorkflow =
  createWorkflow(
    "transition-compounded-product-classification-mapping",
    (input: TransitionCompoundedProductClassificationMappingWorkflowInput) => {
      const mapping =
        transitionCompoundedProductClassificationMappingStep(input)
      const auditInput = transform({ input, mapping }, ({ input, mapping }) => [
        {
          event_type: "classification_mapping_status_transitioned" as const,
          outcome: "succeeded" as const,
          actor_id: input.actorId,
          product_id: null,
          variant_id: null,
          presentation_id: mapping.presentation_id,
          presentation_revision_id: null,
          registration_id: null,
          correlation_id: mapping.id,
          decision: {
            product_type_id: mapping.product_type_id,
            from_status: input.expected_status,
            to_status: input.target_status,
            reason: input.reason,
          },
        },
      ])

      createCompoundedProductGovernanceAuditEventsStep(auditInput)

      return new WorkflowResponse(mapping)
    },
  )

export default transitionCompoundedProductClassificationMappingWorkflow
