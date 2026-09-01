import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  acquireLockStep,
  emitEventStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"

import {
  createInitialResearchProtocolRevisionStep,
  createNextResearchProtocolRevisionStep,
  createResearchProtocolAuditEventStep,
  createResearchProtocolSeriesStep,
  archiveResearchProtocolSeriesStep,
  linkResearchProtocolProductStep,
  publishResearchProtocolRevisionStep,
  unlinkResearchProtocolProductStep,
  updateResearchProtocolProductLinkStep,
  updateResearchProtocolDraftStep,
  withdrawResearchProtocolRevisionStep,
  type CreateResearchProtocolRevisionWorkflowInput,
  type CreateResearchProtocolWorkflowInput,
  type ArchiveResearchProtocolWorkflowInput,
  type LinkResearchProtocolProductWorkflowInput,
  type PublishResearchProtocolWorkflowInput,
  type UpdateResearchProtocolWorkflowInput,
  type UnlinkResearchProtocolProductWorkflowInput,
  type UpdateResearchProtocolProductLinkWorkflowInput,
  type WithdrawResearchProtocolWorkflowInput,
} from "./steps/manage-research-protocol"

const PROTOCOL_NOTIFICATION_EVENT = "customer-notifications.protocol-revision"

export const createResearchProtocolWorkflow = createWorkflow(
  "create-research-protocol",
  function (input: CreateResearchProtocolWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-key:${input.protocol_key}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const series = createResearchProtocolSeriesStep(input)
    const revisionInput = transform({ input, series }, ({ input, series }) => ({
      ...input,
      series_id: series.id,
    }))
    const revision = createInitialResearchProtocolRevisionStep(revisionInput)
    const auditInput = transform(
      { input, series, revision },
      ({ input, series, revision }) => ({
        series_id: series.id,
        revision_id: revision.id,
        event_type: "series_created" as const,
        actor_id: input.actorId,
        reason: null,
        details: { revision: 1 },
      }),
    )
    createResearchProtocolAuditEventStep(auditInput)
    releaseLockStep(lock)

    return new WorkflowResponse({ series, revision })
  },
)

export const updateResearchProtocolWorkflow = createWorkflow(
  "update-research-protocol",
  function (input: UpdateResearchProtocolWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-series:${input.series_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const revision = updateResearchProtocolDraftStep(input)
    const auditInput = transform({ input, revision }, ({ input, revision }) => ({
      series_id: input.series_id,
      revision_id: revision.id,
      event_type: "draft_updated" as const,
      actor_id: input.actorId,
      reason: null,
      details: null,
    }))
    createResearchProtocolAuditEventStep(auditInput)
    releaseLockStep(lock)

    return new WorkflowResponse(revision)
  },
)

export const linkResearchProtocolProductWorkflow = createWorkflow(
  "link-research-protocol-product",
  function (input: LinkResearchProtocolProductWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-product:${input.product_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const link = linkResearchProtocolProductStep(input)
    const auditInput = transform({ input, link }, ({ input, link }) => ({
      series_id: input.series_id,
      revision_id: null,
      product_link_id: link.id,
      event_type: "product_linked" as const,
      actor_id: input.actorId,
      reason: null,
      details: { product_id: input.product_id },
    }))
    createResearchProtocolAuditEventStep(auditInput)
    const primaryAuditInput = transform({ input, link }, ({ input, link }) => ({
      series_id: input.series_id,
      revision_id: null,
      product_link_id: link.id,
      event_type: "primary_protocol_changed" as const,
      actor_id: input.actorId,
      reason: null,
      details: { product_id: input.product_id, is_primary: true },
    }))
    when(
      "audit-linked-primary-research-protocol",
      { input },
      ({ input }) => input.is_primary,
    ).then(() =>
      createResearchProtocolAuditEventStep(primaryAuditInput).config({
        name: "create-linked-primary-research-protocol-audit-event",
      }),
    )
    releaseLockStep(lock)
    return new WorkflowResponse(link)
  },
)

export const updateResearchProtocolProductLinkWorkflow = createWorkflow(
  "update-research-protocol-product-link",
  function (input: UpdateResearchProtocolProductLinkWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-product-link:${input.product_link_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const link = updateResearchProtocolProductLinkStep(input)
    const auditInput = transform({ input, link }, ({ input, link }) => ({
      series_id: input.series_id,
      revision_id: null,
      product_link_id: link.id,
      event_type: "product_link_updated" as const,
      actor_id: input.actorId,
      reason: null,
      details: null,
    }))
    createResearchProtocolAuditEventStep(auditInput)
    const primaryAuditInput = transform({ input, link }, ({ input, link }) => ({
      series_id: input.series_id,
      revision_id: null,
      product_link_id: link.id,
      event_type: "primary_protocol_changed" as const,
      actor_id: input.actorId,
      reason: null,
      details: { is_primary: true },
    }))
    when(
      "audit-updated-primary-research-protocol",
      { input },
      ({ input }) => input.is_primary,
    ).then(() =>
      createResearchProtocolAuditEventStep(primaryAuditInput).config({
        name: "create-updated-primary-research-protocol-audit-event",
      }),
    )
    releaseLockStep(lock)
    return new WorkflowResponse(link)
  },
)

export const unlinkResearchProtocolProductWorkflow = createWorkflow(
  "unlink-research-protocol-product",
  function (input: UnlinkResearchProtocolProductWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-product-link:${input.product_link_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const link = unlinkResearchProtocolProductStep(input)
    const auditInput = transform({ input, link }, ({ input, link }) => ({
      series_id: input.series_id,
      revision_id: null,
      product_link_id: link.id,
      event_type: "product_unlinked" as const,
      actor_id: input.actorId,
      reason: input.reason,
      details: null,
    }))
    createResearchProtocolAuditEventStep(auditInput)
    releaseLockStep(lock)
    return new WorkflowResponse(link)
  },
)

export const archiveResearchProtocolWorkflow = createWorkflow(
  "archive-research-protocol",
  function (input: ArchiveResearchProtocolWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-series:${input.series_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const series = archiveResearchProtocolSeriesStep(input)
    const auditInput = transform({ input }, ({ input }) => ({
      series_id: input.series_id,
      revision_id: null,
      product_link_id: null,
      event_type: "series_archived" as const,
      actor_id: input.actorId,
      reason: input.reason,
      details: null,
    }))
    createResearchProtocolAuditEventStep(auditInput)
    releaseLockStep(lock)
    return new WorkflowResponse(series)
  },
)

export const createResearchProtocolRevisionWorkflow = createWorkflow(
  "create-research-protocol-revision",
  function (input: CreateResearchProtocolRevisionWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-series:${input.series_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const revision = createNextResearchProtocolRevisionStep(input)
    const auditInput = transform({ input, revision }, ({ input, revision }) => ({
      series_id: input.series_id,
      revision_id: revision.id,
      event_type: "revision_created" as const,
      actor_id: input.actorId,
      reason: input.reason,
      details: { revision: revision.revision },
    }))
    createResearchProtocolAuditEventStep(auditInput)
    releaseLockStep(lock)

    return new WorkflowResponse(revision)
  },
)

export const publishResearchProtocolWorkflow = createWorkflow(
  "publish-research-protocol",
  function (input: PublishResearchProtocolWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-series:${input.series_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const revision = publishResearchProtocolRevisionStep(input)
    const readinessAuditInput = transform(
      { input, revision },
      ({ input, revision }) => ({
        series_id: input.series_id,
        revision_id: revision.id,
        product_link_id: null,
        event_type: "publication_readiness_evaluated" as const,
        actor_id: input.actorId,
        reason: input.reason,
        details: { revision: revision.revision, ready: true },
      }),
    )
    createResearchProtocolAuditEventStep(readinessAuditInput).config({
      name: "create-research-protocol-readiness-audit-event",
    })
    const auditInput = transform({ input, revision }, ({ input, revision }) => ({
      series_id: input.series_id,
      revision_id: revision.id,
      event_type: "revision_published" as const,
      actor_id: input.actorId,
      reason: input.reason,
      details: { revision: revision.revision },
    }))
    createResearchProtocolAuditEventStep(auditInput).config({
      name: "create-research-protocol-published-audit-event",
    })
    const notificationInput = transform({ input, revision }, ({ input, revision }) => ({
      series_id: input.series_id,
      revision_id: revision.id,
      operation: "published" as const,
    }))
    emitEventStep({
      eventName: PROTOCOL_NOTIFICATION_EVENT,
      data: notificationInput,
    }).config({ name: "emit-research-protocol-published-notification-event" })
    releaseLockStep(lock)

    return new WorkflowResponse(revision)
  },
)

export const withdrawResearchProtocolWorkflow = createWorkflow(
  "withdraw-research-protocol",
  function (input: WithdrawResearchProtocolWorkflowInput) {
    const lock = transform({ input }, ({ input }) => ({
      key: `research-protocol-series:${input.series_id}`,
      timeout: 10,
      ttl: 120,
    }))
    acquireLockStep(lock)
    const revision = withdrawResearchProtocolRevisionStep(input)
    const auditInput = transform({ input, revision }, ({ input, revision }) => ({
      series_id: input.series_id,
      revision_id: revision.id,
      event_type: "revision_withdrawn" as const,
      actor_id: input.actorId,
      reason: input.reason,
      details: { revision: revision.revision },
    }))
    createResearchProtocolAuditEventStep(auditInput)
    const notificationInput = transform({ input, revision }, ({ input, revision }) => ({
      series_id: input.series_id,
      revision_id: revision.id,
      operation: "withdrawn" as const,
    }))
    emitEventStep({
      eventName: PROTOCOL_NOTIFICATION_EVENT,
      data: notificationInput,
    }).config({ name: "emit-research-protocol-withdrawn-notification-event" })
    releaseLockStep(lock)

    return new WorkflowResponse(revision)
  },
)
