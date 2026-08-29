import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  releaseLockStep,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import type { ProductStatus } from "@medusajs/framework/utils"

import {
  prepareCompoundedProductPublicationChangeStep,
  updateCompoundedProductRegistrationPublicationStep,
  type ChangeCompoundedProductPublicationWorkflowInput,
} from "./steps/change-compounded-product-publication"
import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"

export const changeCompoundedProductPublicationWorkflow = createWorkflow(
  "change-compounded-product-publication",
  function (input: ChangeCompoundedProductPublicationWorkflowInput) {
    const lockInput = transform({ input }, ({ input }) => ({
      key: `compounded-product-publication:${input.productId}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lockInput)
    const prepared = prepareCompoundedProductPublicationChangeStep(input)
    const registrationInput = transform(
      { prepared },
      ({ prepared }) => ({
        registration: prepared.registration,
        action: prepared.action,
        actorId: prepared.actorId,
      }),
    )
    const registration = when(
      "update-governed-registration-publication",
      { prepared },
      ({ prepared }) => prepared.accepted,
    ).then(() =>
      updateCompoundedProductRegistrationPublicationStep(registrationInput),
    )
    const productUpdateInput = transform(
      { prepared, registration },
      ({ prepared }) => ({
        selector: { id: prepared.productId },
        update: {
          status: (prepared.action === "publish"
            ? "published"
            : "draft") as ProductStatus,
        },
      }),
    )
    const product = when(
      "update-governed-native-product-publication",
      { prepared, registration },
      ({ prepared }) => prepared.accepted,
    ).then(() =>
      updateProductsWorkflow.runAsStep({ input: productUpdateInput }),
    )
    const auditInput = transform(
      { prepared, registration },
      ({ prepared }) => {
        const common = {
          actor_id: prepared.actorId,
          product_id: prepared.productId,
          variant_id: null,
          presentation_id: null,
          presentation_revision_id:
            prepared.registration.presentation_revision_id,
          registration_id: prepared.registration.id,
          correlation_id: null,
        }

        if (prepared.action === "withdraw") {
          return [
            {
              ...common,
              event_type: "publication_withdrawn" as const,
              outcome: "succeeded" as const,
              decision: { reason: prepared.reason },
            },
          ]
        }

        return [
          {
            ...common,
            event_type: "readiness_evaluated" as const,
            outcome: prepared.accepted
              ? ("succeeded" as const)
              : ("rejected" as const),
            decision: {
              ready: prepared.readiness.ready,
              blockers: prepared.readiness.blockers,
              policy_revision:
                prepared.registration.readiness_policy_revision,
            },
          },
          {
            ...common,
            event_type: prepared.accepted
              ? ("publication_succeeded" as const)
              : ("publication_rejected" as const),
            outcome: prepared.accepted
              ? ("succeeded" as const)
              : ("rejected" as const),
            decision: {
              reason: prepared.reason,
              blockers: prepared.readiness.blockers,
            },
          },
        ]
      },
    )
    releaseLockStep(lockInput)
    const auditEvents = createCompoundedProductGovernanceAuditEventsStep(
      auditInput,
    )

    return new WorkflowResponse({
      accepted: prepared.accepted,
      action: prepared.action,
      product,
      registration,
      readiness: prepared.readiness,
      audit_events: auditEvents,
    })
  },
)

export default changeCompoundedProductPublicationWorkflow
