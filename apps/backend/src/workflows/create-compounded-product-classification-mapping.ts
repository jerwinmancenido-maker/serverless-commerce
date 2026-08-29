import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"
import {
  createCompoundedProductClassificationMappingStep,
  type CreateCompoundedProductClassificationMappingWorkflowInput,
} from "./steps/manage-compounded-product-classification-mapping"

export const createCompoundedProductClassificationMappingWorkflow =
  createWorkflow(
    "create-compounded-product-classification-mapping",
    (input: CreateCompoundedProductClassificationMappingWorkflowInput) => {
      const mapping = createCompoundedProductClassificationMappingStep(input)
      const auditInput = transform({ input, mapping }, ({ input, mapping }) => [
        {
          event_type: "classification_mapping_created" as const,
          outcome: "succeeded" as const,
          actor_id: input.actorId,
          product_id: null,
          variant_id: null,
          presentation_id: input.presentation_id,
          presentation_revision_id: null,
          registration_id: null,
          correlation_id: mapping.id,
          decision: {
            product_type_id: input.product_type_id,
            status: mapping.status,
            reason: input.reason,
          },
        },
      ])

      createCompoundedProductGovernanceAuditEventsStep(auditInput)

      return new WorkflowResponse(mapping)
    },
  )

export default createCompoundedProductClassificationMappingWorkflow
