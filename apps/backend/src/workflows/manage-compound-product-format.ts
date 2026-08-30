import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows"

import {
  archiveCompoundProductFormatStep,
  assignCompoundProductFormatStep,
  createCompoundProductFormatStep,
  updateCompoundProductFormatStep,
  type ArchiveCompoundProductFormatWorkflowInput,
  type AssignCompoundProductFormatWorkflowInput,
  type CreateCompoundProductFormatWorkflowInput,
  type UpdateCompoundProductFormatWorkflowInput,
} from "./steps/manage-compound-product-format"
import { createCompoundedProductGovernanceAuditEventsStep } from "./steps/create-compounded-product-governance-audit-events"

export const createCompoundProductFormatWorkflow = createWorkflow(
  "create-compound-product-format",
  function (input: CreateCompoundProductFormatWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `compound-format-key:${input.key}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const format = createCompoundProductFormatStep(input)
    const audit = transform({ input, format }, ({ input, format }) => [
      {
        event_type: "compound_format_created" as const,
        outcome: "succeeded" as const,
        actor_id: input.actorId,
        product_id: null,
        variant_id: null,
        presentation_id: null,
        presentation_revision_id: null,
        registration_id: null,
        correlation_id: null,
        decision: { format_id: format.id, key: format.key },
      },
    ])
    createCompoundedProductGovernanceAuditEventsStep(audit)
    releaseLockStep(lock)

    return new WorkflowResponse(format)
  },
)

export const updateCompoundProductFormatWorkflow = createWorkflow(
  "update-compound-product-format",
  function (input: UpdateCompoundProductFormatWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `compound-format:${input.format_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const format = updateCompoundProductFormatStep(input)
    const audit = transform({ input, format }, ({ input, format }) => [
      {
        event_type: "compound_format_updated" as const,
        outcome: "succeeded" as const,
        actor_id: input.actorId,
        product_id: null,
        variant_id: null,
        presentation_id: null,
        presentation_revision_id: null,
        registration_id: null,
        correlation_id: null,
        decision: { format_id: format.id, key: format.key },
      },
    ])
    createCompoundedProductGovernanceAuditEventsStep(audit)
    releaseLockStep(lock)

    return new WorkflowResponse(format)
  },
)

export const archiveCompoundProductFormatWorkflow = createWorkflow(
  "archive-compound-product-format",
  function (input: ArchiveCompoundProductFormatWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `compound-format:${input.format_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const format = archiveCompoundProductFormatStep(input)
    const audit = transform({ input, format }, ({ input, format }) => [
      {
        event_type: "compound_format_archived" as const,
        outcome: "succeeded" as const,
        actor_id: input.actorId,
        product_id: null,
        variant_id: null,
        presentation_id: null,
        presentation_revision_id: null,
        registration_id: null,
        correlation_id: null,
        decision: { format_id: format.id, key: format.key },
      },
    ])
    createCompoundedProductGovernanceAuditEventsStep(audit)
    releaseLockStep(lock)

    return new WorkflowResponse(format)
  },
)

export const assignCompoundProductFormatWorkflow = createWorkflow(
  "assign-compound-product-format",
  function (input: AssignCompoundProductFormatWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `compound-format-product:${input.product_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const registration = assignCompoundProductFormatStep(input)
    const audit = transform(
      { input, registration },
      ({ input, registration }) => [
        {
          event_type: input.format_id
            ? ("compound_format_assigned" as const)
            : ("compound_format_unassigned" as const),
          outcome: "succeeded" as const,
          actor_id: input.actorId,
          product_id: input.product_id,
          variant_id: null,
          presentation_id: null,
          presentation_revision_id: registration.presentation_revision_id,
          registration_id: registration.id,
          correlation_id: null,
          decision: { compound_format_id: input.format_id },
        },
      ],
    )
    createCompoundedProductGovernanceAuditEventsStep(audit)
    releaseLockStep(lock)

    return new WorkflowResponse(registration)
  },
)
