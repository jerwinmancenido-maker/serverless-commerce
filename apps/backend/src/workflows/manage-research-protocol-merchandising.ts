import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows"

import {
  archiveResearchProtocolMerchandisingLinkStep,
  createResearchProtocolMerchandisingLinkStep,
  recordResearchProtocolRecommendationEventStep,
  updateResearchProtocolMerchandisingLinkStep,
  type ArchiveResearchProtocolMerchandisingLinkWorkflowInput,
  type CreateResearchProtocolMerchandisingLinkWorkflowInput,
  type RecordResearchProtocolRecommendationEventWorkflowInput,
  type UpdateResearchProtocolMerchandisingLinkWorkflowInput,
} from "./steps/manage-research-protocol-merchandising"
import { createResearchProtocolAuditEventStep } from "./steps/manage-research-protocol"

export const createResearchProtocolMerchandisingLinkWorkflow = createWorkflow(
  "create-research-protocol-merchandising-link",
  function (input: CreateResearchProtocolMerchandisingLinkWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-merchandising:${input.series_id}:${input.product_id}:${input.relationship_type}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const link = createResearchProtocolMerchandisingLinkStep(input)
    const auditInput = transform({ input, link }, ({ input, link }) => ({
      series_id: input.series_id,
      revision_id: null,
      product_link_id: null,
      event_type: "merchandising_link_created" as const,
      actor_id: input.actorId,
      reason: input.reason,
      details: {
        merchandising_link_id: link.id,
        product_id: input.product_id,
        relationship_type: input.relationship_type,
        placements: input.placements,
      },
    }))
    createResearchProtocolAuditEventStep(auditInput)
    releaseLockStep(lock)
    return new WorkflowResponse(link)
  },
)

export const updateResearchProtocolMerchandisingLinkWorkflow = createWorkflow(
  "update-research-protocol-merchandising-link",
  function (input: UpdateResearchProtocolMerchandisingLinkWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-merchandising:${input.merchandising_link_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const link = updateResearchProtocolMerchandisingLinkStep(input)
    const auditInput = transform({ input, link }, ({ input, link }) => ({
      series_id: input.series_id,
      revision_id: null,
      product_link_id: null,
      event_type: "merchandising_link_updated" as const,
      actor_id: input.actorId,
      reason: input.reason,
      details: {
        merchandising_link_id: link.id,
        product_id: link.product_id,
        relationship_type: input.relationship_type,
        placements: input.placements,
      },
    }))
    createResearchProtocolAuditEventStep(auditInput)
    releaseLockStep(lock)
    return new WorkflowResponse(link)
  },
)

export const archiveResearchProtocolMerchandisingLinkWorkflow = createWorkflow(
  "archive-research-protocol-merchandising-link",
  function (input: ArchiveResearchProtocolMerchandisingLinkWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-merchandising:${input.merchandising_link_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const link = archiveResearchProtocolMerchandisingLinkStep(input)
    const auditInput = transform({ input, link }, ({ input, link }) => ({
      series_id: input.series_id,
      revision_id: null,
      product_link_id: null,
      event_type: "merchandising_link_archived" as const,
      actor_id: input.actorId,
      reason: input.reason,
      details: {
        merchandising_link_id: link.id,
        product_id: link.product_id,
      },
    }))
    createResearchProtocolAuditEventStep(auditInput)
    releaseLockStep(lock)
    return new WorkflowResponse(link)
  },
)

export const recordResearchProtocolRecommendationEventWorkflow = createWorkflow(
  "record-research-protocol-recommendation-event",
  function (input: RecordResearchProtocolRecommendationEventWorkflowInput) {
    const event = recordResearchProtocolRecommendationEventStep(input)
    return new WorkflowResponse(event)
  },
)
