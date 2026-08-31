import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import {
  AdminCreateResearchProtocol,
  AdminLinkResearchProtocolProduct,
  AdminPublishResearchProtocol,
  AdminUnlinkResearchProtocolProduct,
  AdminUpdateResearchProtocolDraft,
  AdminUpdateResearchProtocolProductLink,
  AdminWithdrawResearchProtocol,
  ResearchProtocolContent,
  type AdminCreateResearchProtocol as CreateRequest,
  type AdminLinkResearchProtocolProduct as LinkRequest,
  type AdminPublishResearchProtocol as PublishRequest,
  type AdminUnlinkResearchProtocolProduct as UnlinkRequest,
  type AdminUpdateResearchProtocolDraft as UpdateRequest,
  type AdminUpdateResearchProtocolProductLink as LinkUpdateRequest,
  type AdminWithdrawResearchProtocol as WithdrawRequest,
} from "../../modules/research-content/contracts/research-protocol"
import type ResearchContentModuleService from "../../modules/research-content/service"

type ActorInput = { actorId: string }
export type CreateResearchProtocolWorkflowInput = CreateRequest & ActorInput
export type UpdateResearchProtocolWorkflowInput = UpdateRequest & ActorInput & { series_id: string }
export type PublishResearchProtocolWorkflowInput = PublishRequest & ActorInput & { series_id: string }
export type WithdrawResearchProtocolWorkflowInput = WithdrawRequest & ActorInput & { series_id: string }
export type CreateResearchProtocolRevisionWorkflowInput = ActorInput & { series_id: string; reason: string }
export type LinkResearchProtocolProductWorkflowInput = LinkRequest & ActorInput & { series_id: string }
export type UpdateResearchProtocolProductLinkWorkflowInput = LinkUpdateRequest & ActorInput & { series_id: string; product_link_id: string }
export type UnlinkResearchProtocolProductWorkflowInput = UnlinkRequest & ActorInput & { series_id: string; product_link_id: string }
export type ArchiveResearchProtocolWorkflowInput = ActorInput & { series_id: string; reason: string }

function requireActor(actorId: string) {
  const value = actorId?.trim()
  if (!value) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Authenticated Admin actor is required")
  return value
}

function parseRequest<T>(
  schema: { parse: (input: unknown) => T },
  rawInput: Record<string, unknown>,
  workflowKeys: string[],
) {
  const request = { ...rawInput }
  workflowKeys.forEach((key) => delete request[key])
  return schema.parse(request)
}

async function retrieveSeries(service: ResearchContentModuleService, id: string) {
  const [series] = await service.listResearchProtocolSeries({ id }, { take: 1 })
  if (!series) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Research protocol was not found")
  return series
}

async function retrieveProductLink(service: ResearchContentModuleService, seriesId: string, linkId: string) {
  const [link] = await service.listResearchProtocolProductLinks({ id: linkId, series_id: seriesId }, { take: 1 })
  if (!link || link.archived_at) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Compatible product link was not found")
  return link
}

async function validateProductApplicability(
  container: { resolve: (key: string) => any },
  productId: string,
  scope: "entire_product" | "selected_variants",
  variantIds: string[],
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "product", fields: ["id", "variants.id"], filters: { id: productId } })
  const product = data[0] as { id: string; variants?: Array<{ id: string }> } | undefined
  if (!product) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product was not found")
  if (scope === "entire_product") {
    if (variantIds.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Do not select variants when this guide applies to the entire product")
    return
  }
  if (!variantIds.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Select at least one compatible product variant")
  const validIds = new Set((product.variants || []).map((variant) => variant.id))
  if (variantIds.some((id) => !validIds.has(id))) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Every selected variant must belong to the compatible product")
}

function assertPublicationReady(content: ResearchProtocolContent) {
  const problems: string[] = []
  if (!content.intended_application?.trim()) problems.push("Add a quick overview")
  if (!content.research_purpose.trim()) problems.push("Explain what this research guide covers")
  if (!content.explicit_exclusions?.trim()) problems.push("Add important limitations")
  if (!content.preparation_and_handling.trim()) problems.push("Add preparation and handling information")
  if (!content.research_procedure.trim()) problems.push("Add the research steps")
  if (!content.storage_and_disposal.trim()) problems.push("Add storage and disposal information")
  if (!content.references.length) problems.push("Add at least one supporting reference")
  const missingConversion = content.reference_quantities.find((item) => (item.unit === "IU" || item.concentration) && !item.conversion_basis)
  if (missingConversion) problems.push(`Explain how ${missingConversion.label} converts between the selected units`)
  if (problems.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, `This guide is not ready to publish: ${problems.join("; ")}`)
}

export const createResearchProtocolSeriesStep = createStep(
  "create-research-protocol-series",
  async (rawInput: CreateResearchProtocolWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = parseRequest(AdminCreateResearchProtocol, rawInput, ["actorId"])
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const [existing] = await service.listResearchProtocolSeries({ protocol_key: input.protocol_key }, { take: 1 })
    if (existing) throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, `Research protocol key ${input.protocol_key} already exists`)
    const series = await service.createResearchProtocolSeries({
      protocol_key: input.protocol_key,
      purpose: input.purpose,
      archived_at: null,
      created_by_actor_id: actorId,
      updated_by_actor_id: actorId,
    })
    return new StepResponse(series, series.id)
  },
  async (id: string | undefined, { container }) => {
    if (id) await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE).deleteResearchProtocolSeries(id)
  },
)

export const createInitialResearchProtocolRevisionStep = createStep(
  "create-initial-research-protocol-revision",
  async (input: CreateResearchProtocolWorkflowInput & { series_id: string }, { container }) => {
    const actorId = requireActor(input.actorId)
    const parsed = parseRequest(AdminCreateResearchProtocol, input, [
      "actorId",
      "series_id",
    ])
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const revision = await service.createResearchProtocols({
      series_id: input.series_id,
      protocol_key: parsed.protocol_key,
      revision: 1,
      schema_version: 2,
      title: parsed.title,
      summary: parsed.summary,
      content: ResearchProtocolContent.parse(parsed.content),
      status: "draft",
      evidence_scope: parsed.evidence_scope,
      effective_at: null,
      published_at: null,
      withdrawn_at: null,
      created_by_actor_id: actorId,
      published_by_actor_id: null,
      decision_reason: null,
    })
    return new StepResponse(revision, revision.id)
  },
  async (id: string | undefined, { container }) => {
    if (id) await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE).deleteResearchProtocols(id)
  },
)

export const updateResearchProtocolDraftStep = createStep(
  "update-research-protocol-draft",
  async (rawInput: UpdateResearchProtocolWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = parseRequest(AdminUpdateResearchProtocolDraft, rawInput, [
      "actorId",
      "series_id",
    ])
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const series = await retrieveSeries(service, rawInput.series_id)
    const [draft] = await service.listResearchProtocols({ series_id: series.id, status: "draft" }, { take: 1, order: { revision: "DESC" } })
    if (!draft) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Create a new draft revision before editing this guide")
    const previous = {
      revision: { id: draft.id, title: draft.title, summary: draft.summary, content: draft.content, evidence_scope: draft.evidence_scope },
      series: { id: series.id, purpose: series.purpose, updated_by_actor_id: series.updated_by_actor_id },
    }
    const revision = await service.updateResearchProtocols({ id: draft.id, title: input.title, summary: input.summary, content: ResearchProtocolContent.parse(input.content), evidence_scope: input.evidence_scope, decision_reason: null })
    await service.updateResearchProtocolSeries({ id: series.id, purpose: input.purpose, updated_by_actor_id: actorId })
    return new StepResponse(revision, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await service.updateResearchProtocols(previous.revision)
    await service.updateResearchProtocolSeries(previous.series)
  },
)

export const createNextResearchProtocolRevisionStep = createStep(
  "create-next-research-protocol-revision",
  async (input: CreateResearchProtocolRevisionWorkflowInput, { container }) => {
    const actorId = requireActor(input.actorId)
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const series = await retrieveSeries(service, input.series_id)
    const revisions = await service.listResearchProtocols({ series_id: series.id }, { take: 100, order: { revision: "DESC" } })
    if (revisions.some((item) => item.status === "draft")) throw new MedusaError(MedusaError.Types.CONFLICT, "This research guide already has a draft revision")
    const latest = revisions[0]
    if (!latest) throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Research guide has no revision to copy")
    const revision = await service.createResearchProtocols({
      series_id: series.id,
      protocol_key: series.protocol_key,
      revision: latest.revision + 1,
      schema_version: latest.schema_version,
      title: latest.title,
      summary: latest.summary,
      content: latest.content,
      status: "draft",
      evidence_scope: latest.evidence_scope,
      effective_at: null,
      published_at: null,
      withdrawn_at: null,
      created_by_actor_id: actorId,
      published_by_actor_id: null,
      decision_reason: input.reason,
    })
    return new StepResponse(revision, revision.id)
  },
  async (id: string | undefined, { container }) => {
    if (id) await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE).deleteResearchProtocols(id)
  },
)

export const publishResearchProtocolRevisionStep = createStep(
  "publish-research-protocol-revision",
  async (rawInput: PublishResearchProtocolWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = parseRequest(AdminPublishResearchProtocol, rawInput, [
      "actorId",
      "series_id",
    ])
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await retrieveSeries(service, rawInput.series_id)
    const [revision] = await service.listResearchProtocols({ id: input.revision_id, series_id: rawInput.series_id }, { take: 1 })
    if (!revision || revision.status !== "draft") throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Only a draft research guide can be published")
    assertPublicationReady(ResearchProtocolContent.parse(revision.content))
    const [published] = await service.listResearchProtocols({ series_id: rawInput.series_id, status: "published" }, { take: 1 })
    const previous = [revision, published].filter(Boolean).map((item) => ({ id: item!.id, status: item!.status, effective_at: item!.effective_at, published_at: item!.published_at, withdrawn_at: item!.withdrawn_at, published_by_actor_id: item!.published_by_actor_id, decision_reason: item!.decision_reason }))
    if (published) await service.updateResearchProtocols({ id: published.id, status: "withdrawn", withdrawn_at: new Date(), decision_reason: `Superseded by revision ${revision.revision}` })
    const updated = await service.updateResearchProtocols({ id: revision.id, status: "published", effective_at: input.effective_at ? new Date(input.effective_at) : new Date(), published_at: new Date(), withdrawn_at: null, published_by_actor_id: actorId, decision_reason: input.reason })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (previous?.length) await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE).updateResearchProtocols(previous)
  },
)

export const withdrawResearchProtocolRevisionStep = createStep(
  "withdraw-research-protocol-revision",
  async (rawInput: WithdrawResearchProtocolWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = parseRequest(AdminWithdrawResearchProtocol, rawInput, [
      "actorId",
      "series_id",
    ])
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await retrieveSeries(service, rawInput.series_id)
    const [revision] = await service.listResearchProtocols({ id: input.revision_id, series_id: rawInput.series_id }, { take: 1 })
    if (!revision || revision.status !== "published") throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Only a published research guide can be withdrawn")
    const previous = { id: revision.id, status: revision.status, withdrawn_at: revision.withdrawn_at, decision_reason: revision.decision_reason, published_by_actor_id: revision.published_by_actor_id }
    const updated = await service.updateResearchProtocols({ id: revision.id, status: "withdrawn", withdrawn_at: new Date(), published_by_actor_id: actorId, decision_reason: input.reason })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (previous) await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE).updateResearchProtocols(previous)
  },
)

export const linkResearchProtocolProductStep = createStep(
  "link-research-protocol-product",
  async (rawInput: LinkResearchProtocolProductWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = parseRequest(AdminLinkResearchProtocolProduct, rawInput, [
      "actorId",
      "series_id",
    ])
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await retrieveSeries(service, rawInput.series_id)
    await validateProductApplicability(container as any, input.product_id, input.applicability_scope, input.variant_ids)
    const [duplicate] = await service.listResearchProtocolProductLinks({ series_id: rawInput.series_id, product_id: input.product_id }, { take: 1 })
    if (duplicate && !duplicate.archived_at) throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, "This product is already linked to the research guide")
    if (input.is_primary) {
      const [primary] = await service.listResearchProtocolProductLinks({ product_id: input.product_id, is_primary: true, archived_at: null }, { take: 1 })
      if (primary) throw new MedusaError(MedusaError.Types.CONFLICT, "This product already has a primary research guide")
    }
    const link = duplicate
      ? await service.updateResearchProtocolProductLinks({ id: duplicate.id, applicability_scope: input.applicability_scope, is_primary: input.is_primary, archived_at: null, updated_by_actor_id: actorId })
      : await service.createResearchProtocolProductLinks({ series_id: rawInput.series_id, product_id: input.product_id, applicability_scope: input.applicability_scope, is_primary: input.is_primary, archived_at: null, created_by_actor_id: actorId, updated_by_actor_id: actorId })
    if (input.variant_ids.length) await service.createResearchProtocolVariantTargets(input.variant_ids.map((productVariantId) => ({ product_link_id: link.id, product_variant_id: productVariantId })))
    return new StepResponse(link, link.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const targets = await service.listResearchProtocolVariantTargets({ product_link_id: id })
    if (targets.length) await service.deleteResearchProtocolVariantTargets(targets.map((item) => item.id))
    await service.deleteResearchProtocolProductLinks(id)
  },
)

export const updateResearchProtocolProductLinkStep = createStep(
  "update-research-protocol-product-link",
  async (rawInput: UpdateResearchProtocolProductLinkWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = parseRequest(
      AdminUpdateResearchProtocolProductLink,
      rawInput,
      ["actorId", "series_id", "product_link_id"],
    )
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const link = await retrieveProductLink(service, rawInput.series_id, rawInput.product_link_id)
    await validateProductApplicability(container as any, link.product_id, input.applicability_scope, input.variant_ids)
    if (input.is_primary && !link.is_primary) {
      const [primary] = await service.listResearchProtocolProductLinks({ product_id: link.product_id, is_primary: true, archived_at: null }, { take: 1 })
      if (primary && primary.id !== link.id) throw new MedusaError(MedusaError.Types.CONFLICT, "This product already has a primary research guide")
    }
    const oldTargets = await service.listResearchProtocolVariantTargets({ product_link_id: link.id })
    const previous = { link: { id: link.id, applicability_scope: link.applicability_scope, is_primary: link.is_primary, updated_by_actor_id: link.updated_by_actor_id }, variant_ids: oldTargets.map((item) => item.product_variant_id) }
    if (oldTargets.length) await service.deleteResearchProtocolVariantTargets(oldTargets.map((item) => item.id))
    if (input.variant_ids.length) await service.createResearchProtocolVariantTargets(input.variant_ids.map((productVariantId) => ({ product_link_id: link.id, product_variant_id: productVariantId })))
    const updated = await service.updateResearchProtocolProductLinks({ id: link.id, applicability_scope: input.applicability_scope, is_primary: input.is_primary, updated_by_actor_id: actorId })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const targets = await service.listResearchProtocolVariantTargets({ product_link_id: previous.link.id })
    if (targets.length) await service.deleteResearchProtocolVariantTargets(targets.map((item) => item.id))
    if (previous.variant_ids.length) await service.createResearchProtocolVariantTargets(previous.variant_ids.map((productVariantId: string) => ({ product_link_id: previous.link.id, product_variant_id: productVariantId })))
    await service.updateResearchProtocolProductLinks(previous.link)
  },
)

export const unlinkResearchProtocolProductStep = createStep(
  "unlink-research-protocol-product",
  async (rawInput: UnlinkResearchProtocolProductWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = parseRequest(AdminUnlinkResearchProtocolProduct, rawInput, [
      "actorId",
      "series_id",
      "product_link_id",
    ])
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const link = await retrieveProductLink(service, rawInput.series_id, rawInput.product_link_id)
    if (link.is_primary && !input.confirm_primary) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Confirm that you want to unlink this product's primary research guide")
    const previous = { id: link.id, archived_at: link.archived_at, is_primary: link.is_primary, updated_by_actor_id: link.updated_by_actor_id }
    const updated = await service.updateResearchProtocolProductLinks({ id: link.id, archived_at: new Date(), is_primary: false, updated_by_actor_id: actorId })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (previous) await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE).updateResearchProtocolProductLinks(previous)
  },
)

export const archiveResearchProtocolSeriesStep = createStep(
  "archive-research-protocol-series",
  async (input: ArchiveResearchProtocolWorkflowInput, { container }) => {
    const actorId = requireActor(input.actorId)
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const series = await retrieveSeries(service, input.series_id)
    if (series.archived_at) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This research guide is already archived")
    const activeLinks = await service.listResearchProtocolProductLinks({
      series_id: series.id,
      archived_at: null,
    })
    const previous = {
      series: {
        id: series.id,
        archived_at: series.archived_at,
        updated_by_actor_id: series.updated_by_actor_id,
      },
      links: activeLinks.map((link) => ({
        id: link.id,
        archived_at: link.archived_at,
        is_primary: link.is_primary,
        updated_by_actor_id: link.updated_by_actor_id,
      })),
    }
    if (activeLinks.length) {
      await service.updateResearchProtocolProductLinks(
        activeLinks.map((link) => ({
          id: link.id,
          archived_at: new Date(),
          is_primary: false,
          updated_by_actor_id: actorId,
        })),
      )
    }
    const updated = await service.updateResearchProtocolSeries({ id: series.id, archived_at: new Date(), updated_by_actor_id: actorId })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await service.updateResearchProtocolSeries(previous.series)
    if (previous.links.length) {
      await service.updateResearchProtocolProductLinks(previous.links)
    }
  },
)

export const createResearchProtocolAuditEventStep = createStep(
  "create-research-protocol-audit-event",
  async (input: { series_id: string; revision_id: string | null; product_link_id?: string | null; event_type: "series_created" | "draft_updated" | "revision_created" | "revision_published" | "revision_withdrawn" | "applicability_changed" | "product_linked" | "product_link_updated" | "product_unlinked" | "primary_protocol_changed" | "publication_readiness_evaluated" | "series_archived"; actor_id: string; reason: string | null; details?: Record<string, unknown> | null }, { container }) => {
    requireActor(input.actor_id)
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const event = await service.createResearchProtocolAuditEvents({ series_id: input.series_id, revision_id: input.revision_id, product_link_id: input.product_link_id || null, event_type: input.event_type, actor_id: input.actor_id, reason: input.reason, details: input.details || null })
    return new StepResponse(event, event.id)
  },
  async (id: string | undefined, { container }) => {
    if (id) await container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE).deleteResearchProtocolAuditEvents(id)
  },
)
