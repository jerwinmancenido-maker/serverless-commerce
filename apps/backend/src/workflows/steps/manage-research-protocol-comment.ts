import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import {
  AdminModerateResearchProtocolComment,
  StoreCreateResearchProtocolComment,
  type AdminModerateResearchProtocolComment as ModerateRequest,
  type StoreCreateResearchProtocolComment as CreateRequest,
} from "../../modules/research-content/contracts/research-protocol-comment"
import type ResearchContentModuleService from "../../modules/research-content/service"

export type CreateResearchProtocolCommentInput = CreateRequest & {
  customer_id: string
}

export type ModerateResearchProtocolCommentInput = ModerateRequest & {
  comment_id: string
  series_id: string
  actor_id: string
}

const required = (value: string, message: string) => {
  const normalized = value?.trim()
  if (!normalized) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, message)
  }
  return normalized
}

export const createResearchProtocolCommentStep = createStep(
  "create-research-protocol-comment",
  async (rawInput: CreateResearchProtocolCommentInput, { container }) => {
    const customerId = required(
      rawInput.customer_id,
      "Sign in before joining the protocol discussion",
    )
    const input = StoreCreateResearchProtocolComment.parse({
      protocol_handle: rawInput.protocol_handle,
      kind: rawInput.kind,
      body: rawInput.body,
    })
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const [series] = await service.listResearchProtocolSeries(
      { protocol_key: input.protocol_handle, archived_at: null },
      { take: 1 },
    )
    if (!series) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Research protocol was not found",
      )
    }
    const [published] = await service.listResearchProtocols(
      { series_id: series.id, status: "published" },
      { take: 1 },
    )
    if (!published) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Comments are available after this protocol is published",
      )
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "customer",
      fields: ["id", "first_name"],
      filters: { id: customerId },
      pagination: { take: 1 },
    })
    const customer = data[0] as
      | { id: string; first_name?: string | null }
      | undefined
    if (!customer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Customer account was not found",
      )
    }

    const comment = await service.createResearchProtocolComments({
      series_id: series.id,
      customer_id: customerId,
      author_name_snapshot: customer.first_name?.trim() || "Community member",
      kind: input.kind,
      body: input.body,
      status: "pending",
      submitted_at: new Date(),
      moderated_at: null,
      moderated_by_actor_id: null,
      moderation_reason: null,
    })

    return new StepResponse(comment, comment.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) return
    await container
      .resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
      .deleteResearchProtocolComments(id)
  },
)

export const moderateResearchProtocolCommentStep = createStep(
  "moderate-research-protocol-comment",
  async (rawInput: ModerateResearchProtocolCommentInput, { container }) => {
    const actorId = required(rawInput.actor_id, "Authenticated Admin is required")
    const input = AdminModerateResearchProtocolComment.parse({
      action: rawInput.action,
      reason: rawInput.reason,
    })
    if (
      (input.action === "reject" || input.action === "hide") &&
      !input.reason?.trim()
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Enter a moderation reason before rejecting or hiding a comment",
      )
    }
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const [comment] = await service.listResearchProtocolComments(
      { id: rawInput.comment_id, series_id: rawInput.series_id },
      { take: 1 },
    )
    if (!comment) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Community comment was not found",
      )
    }
    const previous = {
      id: comment.id,
      status: comment.status,
      moderated_at: comment.moderated_at,
      moderated_by_actor_id: comment.moderated_by_actor_id,
      moderation_reason: comment.moderation_reason,
    }
    const status =
      input.action === "approve"
        ? "approved"
        : input.action === "reject"
          ? "rejected"
          : "hidden"
    const updated = await service.updateResearchProtocolComments({
      id: comment.id,
      status,
      moderated_at: new Date(),
      moderated_by_actor_id: actorId,
      moderation_reason: input.reason,
    })

    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    await container
      .resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
      .updateResearchProtocolComments(previous)
  },
)
