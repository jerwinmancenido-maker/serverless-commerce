import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import {
  AdminArchiveResearchProtocolMerchandisingLink,
  AdminCreateResearchProtocolMerchandisingLink,
  AdminUpdateResearchProtocolMerchandisingLink,
  StoreRecordResearchProtocolRecommendationEvent,
  type AdminArchiveResearchProtocolMerchandisingLink as ArchiveRequest,
  type AdminCreateResearchProtocolMerchandisingLink as CreateRequest,
  type AdminUpdateResearchProtocolMerchandisingLink as UpdateRequest,
  type StoreRecordResearchProtocolRecommendationEvent as EventRequest,
} from "../../modules/research-content/contracts/research-protocol-merchandising"
import type ResearchContentModuleService from "../../modules/research-content/service"

type ActorInput = { actorId: string }
export type CreateResearchProtocolMerchandisingLinkWorkflowInput =
  CreateRequest & ActorInput & { series_id: string }
export type UpdateResearchProtocolMerchandisingLinkWorkflowInput =
  UpdateRequest & ActorInput & { series_id: string; merchandising_link_id: string }
export type ArchiveResearchProtocolMerchandisingLinkWorkflowInput =
  ArchiveRequest & ActorInput & { series_id: string; merchandising_link_id: string }
export type RecordResearchProtocolRecommendationEventWorkflowInput =
  EventRequest & { series_id: string; customer_id: string | null }

function requireActor(actorId: string) {
  const value = actorId?.trim()
  if (!value) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Authenticated Admin actor is required",
    )
  }
  return value
}

function requestWithout(
  input: Record<string, unknown>,
  keys: string[],
) {
  const request = { ...input }
  keys.forEach((key) => delete request[key])
  return request
}

async function validateProduct(
  container: { resolve: (key: string) => any },
  productId: string,
  variantIds: string[],
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "variants.id"],
    filters: { id: productId },
  })
  const product = data[0] as
    | { id: string; variants?: Array<{ id: string }> }
    | undefined
  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product was not found")
  }
  const validIds = new Set((product.variants || []).map((variant) => variant.id))
  if (variantIds.some((id) => !validIds.has(id))) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Every selected variant must belong to the recommended product",
    )
  }
}

function dateOrNull(value: string | null) {
  return value ? new Date(value) : null
}

function snapshotLink(link: any) {
  return {
    id: link.id,
    product_id: link.product_id,
    product_variant_ids: link.product_variant_ids,
    relationship_type: link.relationship_type,
    placements: link.placements,
    priority: link.priority,
    status: link.status,
    heading: link.heading,
    reason: link.reason,
    quick_add_enabled: link.quick_add_enabled,
    hide_after_purchase: link.hide_after_purchase,
    bundle_reference: link.bundle_reference,
    promotion_reference: link.promotion_reference,
    starts_at: link.starts_at,
    ends_at: link.ends_at,
    archived_at: link.archived_at,
    created_by_actor_id: link.created_by_actor_id,
    updated_by_actor_id: link.updated_by_actor_id,
  }
}

function assertDateWindow(startsAt: string | null, endsAt: string | null) {
  if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Recommendation end date must be after its start date",
    )
  }
}

async function retrieveLink(
  service: ResearchContentModuleService,
  seriesId: string,
  linkId: string,
) {
  const [link] = await service.listResearchProtocolMerchandisingLinks(
    { id: linkId, series_id: seriesId },
    { take: 1 },
  )
  if (!link || link.archived_at) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Product merchandising recommendation was not found",
    )
  }
  return link
}

export const createResearchProtocolMerchandisingLinkStep = createStep(
  "create-research-protocol-merchandising-link",
  async (rawInput: CreateResearchProtocolMerchandisingLinkWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminCreateResearchProtocolMerchandisingLink.parse(
      requestWithout(rawInput, ["actorId", "series_id"]),
    )
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const [series] = await service.listResearchProtocolSeries(
      { id: rawInput.series_id, archived_at: null },
      { take: 1 },
    )
    if (!series) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Research protocol was not found",
      )
    }
    await validateProduct(container as any, input.product_id, input.product_variant_ids)
    assertDateWindow(input.starts_at, input.ends_at)
    const [existing] = await service.listResearchProtocolMerchandisingLinks(
      {
        series_id: rawInput.series_id,
        product_id: input.product_id,
        relationship_type: input.relationship_type,
      },
      { take: 1 },
    )
    if (existing && !existing.archived_at) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        "This product already has that recommendation type for the guide",
      )
    }
    const values = {
      ...input,
      series_id: rawInput.series_id,
      starts_at: dateOrNull(input.starts_at),
      ends_at: dateOrNull(input.ends_at),
      archived_at: null,
      updated_by_actor_id: actorId,
    }
    const link = existing
      ? await service.updateResearchProtocolMerchandisingLinks({
          id: existing.id,
          ...values,
        })
      : await service.createResearchProtocolMerchandisingLinks({
          ...values,
          created_by_actor_id: actorId,
        })
    return new StepResponse(link, link.id)
  },
  async (id: string | undefined, { container }) => {
    if (id) {
      await container
        .resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
        .deleteResearchProtocolMerchandisingLinks(id)
    }
  },
)

export const updateResearchProtocolMerchandisingLinkStep = createStep(
  "update-research-protocol-merchandising-link",
  async (rawInput: UpdateResearchProtocolMerchandisingLinkWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminUpdateResearchProtocolMerchandisingLink.parse(
      requestWithout(rawInput, [
        "actorId",
        "series_id",
        "merchandising_link_id",
      ]),
    )
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const link = await retrieveLink(
      service,
      rawInput.series_id,
      rawInput.merchandising_link_id,
    )
    await validateProduct(container as any, link.product_id, input.product_variant_ids)
    assertDateWindow(input.starts_at, input.ends_at)
    const previous = snapshotLink(link)
    const updated = await service.updateResearchProtocolMerchandisingLinks({
      id: link.id,
      ...input,
      starts_at: dateOrNull(input.starts_at),
      ends_at: dateOrNull(input.ends_at),
      updated_by_actor_id: actorId,
    })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (previous) {
      await container
        .resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
        .updateResearchProtocolMerchandisingLinks(previous)
    }
  },
)

export const archiveResearchProtocolMerchandisingLinkStep = createStep(
  "archive-research-protocol-merchandising-link",
  async (rawInput: ArchiveResearchProtocolMerchandisingLinkWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    AdminArchiveResearchProtocolMerchandisingLink.parse(
      requestWithout(rawInput, [
        "actorId",
        "series_id",
        "merchandising_link_id",
      ]),
    )
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const link = await retrieveLink(
      service,
      rawInput.series_id,
      rawInput.merchandising_link_id,
    )
    const previous = snapshotLink(link)
    const updated = await service.updateResearchProtocolMerchandisingLinks({
      id: link.id,
      status: "paused",
      archived_at: new Date(),
      updated_by_actor_id: actorId,
    })
    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (previous) {
      await container
        .resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
        .updateResearchProtocolMerchandisingLinks(previous)
    }
  },
)

export const recordResearchProtocolRecommendationEventStep = createStep(
  "record-research-protocol-recommendation-event",
  async (rawInput: RecordResearchProtocolRecommendationEventWorkflowInput, { container }) => {
    const input = StoreRecordResearchProtocolRecommendationEvent.parse(
      requestWithout(rawInput, ["series_id", "customer_id"]),
    )
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const link = await retrieveLink(
      service,
      rawInput.series_id,
      input.merchandising_link_id,
    )
    if (link.product_id !== input.product_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Recommendation event does not match the configured product",
      )
    }
    const event = await service.createResearchProtocolRecommendationEvents({
      series_id: rawInput.series_id,
      merchandising_link_id: link.id,
      event_type: input.event_type,
      placement: input.placement,
      product_id: input.product_id,
      product_variant_id: input.product_variant_id,
      customer_id: rawInput.customer_id,
      protocol_revision_id: input.protocol_revision_id,
      occurred_at: new Date(),
      context: input.context,
    })
    return new StepResponse(event, event.id)
  },
  async (id: string | undefined, { container }) => {
    if (id) {
      await container
        .resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
        .deleteResearchProtocolRecommendationEvents(id)
    }
  },
)
