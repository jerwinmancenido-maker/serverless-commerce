import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import type ResearchContentModuleService from "../../modules/research-content/service"
import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

export type GrantResearchProtocolProfileAccessesInput = {
  customerId: string
  profileId: string
}

export const grantResearchProtocolProfileAccessesStep = createStep(
  "grant-research-protocol-profile-accesses",
  async (
    input: GrantResearchProtocolProfileAccessesInput,
    { container },
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const contentService =
      container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const trackingService =
      container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id"],
      filters: { customer_id: input.customerId },
      pagination: { take: 500 },
    })
    const orderIds = orders.map((order) => order.id)

    if (!orderIds.length) {
      return new StepResponse([], [])
    }

    const orderAccesses = await contentService.listResearchProtocolOrderAccesses(
      { order_id: orderIds, revoked_at: null },
      { relations: ["revision"] },
    )

    if (!orderAccesses.length) {
      return new StepResponse([], [])
    }

    const existing =
      await trackingService.listResearchProtocolProfileAccesses({
        order_protocol_access_id: orderAccesses.map((access) => access.id),
      })
    const existingOrderAccessIds = new Set(
      existing.map((access) => access.order_protocol_access_id),
    )
    const records = orderAccesses
      .filter((access) => !existingOrderAccessIds.has(access.id))
      .map((access) => ({
        profile_id: input.profileId,
        customer_id: input.customerId,
        order_protocol_access_id: access.id,
        protocol_series_id: access.revision.series_id,
        protocol_revision_id: access.revision_id,
        order_id: access.order_id,
        line_item_id: access.line_item_id,
        product_id: access.product_id,
        product_variant_id: access.product_variant_id,
        protocol_handle_snapshot: access.protocol_handle_snapshot,
        protocol_title_snapshot: access.protocol_title_snapshot,
        revision_number_snapshot: access.revision_number_snapshot,
        granted_at: access.issued_at,
        first_viewed_at: null,
        last_viewed_at: null,
        status: "active" as const,
        routine_started_at: null,
      }))
    const created = records.length
      ? await trackingService.createResearchProtocolProfileAccesses(records)
      : []

    return new StepResponse(
      created,
      created.map((access) => access.id),
    )
  },
  async (ids: string[], { container }) => {
    if (!ids.length) {
      return
    }

    await container
      .resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
      .deleteResearchProtocolProfileAccesses(ids)
  },
)
