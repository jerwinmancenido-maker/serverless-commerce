import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows"

import {
  archiveCompoundFamilyStep,
  assignCompoundFamilyStep,
  createCompoundFamilyStep,
  updateCompoundFamilyStep,
  type ArchiveCompoundFamilyWorkflowInput,
  type AssignCompoundFamilyWorkflowInput,
  type CreateCompoundFamilyWorkflowInput,
  type UpdateCompoundFamilyWorkflowInput,
} from "./steps/manage-compound-family"
import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"

export const createCompoundFamilyWorkflow = createWorkflow(
  "create-compound-family",
  function (input: CreateCompoundFamilyWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `compound-family-key:${input.key}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const family = createCompoundFamilyStep(input)
    const audit = transform({ input, family }, ({ input, family }) => [
      {
        event_type: "compound_family_created" as const,
        outcome: "succeeded" as const,
        actor_id: input.actorId,
        product_id: null,
        variant_id: null,
        presentation_id: null,
        presentation_revision_id: null,
        registration_id: null,
        correlation_id: null,
        decision: { family_id: family.id, key: family.key },
      },
    ])
    createCompoundedProductGovernanceAuditEventsStep(audit)
    releaseLockStep(lock)

    return new WorkflowResponse(family)
  },
)

export const updateCompoundFamilyWorkflow = createWorkflow(
  "update-compound-family",
  function (input: UpdateCompoundFamilyWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `compound-family:${input.family_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const family = updateCompoundFamilyStep(input)
    const audit = transform({ input, family }, ({ input, family }) => [
      {
        event_type: "compound_family_updated" as const,
        outcome: "succeeded" as const,
        actor_id: input.actorId,
        product_id: null,
        variant_id: null,
        presentation_id: null,
        presentation_revision_id: null,
        registration_id: null,
        correlation_id: null,
        decision: { family_id: family.id, key: family.key },
      },
    ])
    createCompoundedProductGovernanceAuditEventsStep(audit)
    releaseLockStep(lock)

    return new WorkflowResponse(family)
  },
)

export const archiveCompoundFamilyWorkflow = createWorkflow(
  "archive-compound-family",
  function (input: ArchiveCompoundFamilyWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `compound-family:${input.family_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const family = archiveCompoundFamilyStep(input)
    const audit = transform({ input, family }, ({ input, family }) => [
      {
        event_type: "compound_family_archived" as const,
        outcome: "succeeded" as const,
        actor_id: input.actorId,
        product_id: null,
        variant_id: null,
        presentation_id: null,
        presentation_revision_id: null,
        registration_id: null,
        correlation_id: null,
        decision: { family_id: family.id, key: family.key },
      },
    ])
    createCompoundedProductGovernanceAuditEventsStep(audit)
    releaseLockStep(lock)

    return new WorkflowResponse(family)
  },
)

export const assignCompoundFamilyWorkflow = createWorkflow(
  "assign-compound-family",
  function (input: AssignCompoundFamilyWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `compound-family-product:${input.product_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const registration = assignCompoundFamilyStep(input)
    const audit = transform(
      { input, registration },
      ({ input, registration }) => [
        {
          event_type: input.family_id
            ? ("compound_family_assigned" as const)
            : ("compound_family_unassigned" as const),
          outcome: "succeeded" as const,
          actor_id: input.actorId,
          product_id: input.product_id,
          variant_id: null,
          presentation_id: null,
          presentation_revision_id: registration.presentation_revision_id,
          registration_id: registration.id,
          correlation_id: null,
          decision: { compound_family_id: input.family_id },
        },
      ],
    )
    createCompoundedProductGovernanceAuditEventsStep(audit)
    releaseLockStep(lock)

    return new WorkflowResponse(registration)
  },
)
