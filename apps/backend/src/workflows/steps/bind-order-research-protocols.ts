import { randomBytes } from "node:crypto"

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import type ResearchContentModuleService from "../../modules/research-content/service"
import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

type OrderItem = { id: string; product_id: string | null; variant_id: string | null }

export const bindOrderResearchProtocolsStep = createStep(
  "bind-order-research-protocols",
  async ({ order_id }: { order_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    const { data } = await query.graph({ entity: "order", fields: ["id", "customer_id", "items.id", "items.product_id", "items.variant_id"], filters: { id: order_id }, pagination: { take: 1 } })
    const order = data[0] as { id: string; customer_id?: string | null; items?: OrderItem[] } | undefined
    if (!order) {
      return new StepResponse([], {
        orderAccessIds: [],
        profileAccessIds: [],
      })
    }
    const existing = await service.listResearchProtocolOrderAccesses({ order_id })
    const existingKeys = new Set(existing.map((access) => `${access.line_item_id}:${access.revision_id}`))
    const productIds = Array.from(new Set((order.items || []).map((item) => item.product_id).filter((id): id is string => Boolean(id))))
    const links = productIds.length ? await service.listResearchProtocolProductLinks({ product_id: productIds, archived_at: null }, { relations: ["series", "variant_targets"] }) : []
    const records: Array<Record<string, unknown>> = []
    for (const item of order.items || []) {
      if (!item.product_id) continue
      const eligible = links.filter((link) => link.product_id === item.product_id && (link.applicability_scope === "entire_product" || link.variant_targets.some((target) => target.product_variant_id === item.variant_id))).sort((left, right) => Number(right.is_primary) - Number(left.is_primary))
      for (const link of eligible) {
        const [revision] = await service.listResearchProtocols({ series_id: link.series_id, status: "published" }, { take: 1, order: { revision: "DESC" } })
        if (!revision) continue
        if (!existingKeys.has(`${item.id}:${revision.id}`)) {
          records.push({ access_token: randomBytes(32).toString("base64url"), order_id, line_item_id: item.id, product_id: item.product_id, product_variant_id: item.variant_id, protocol_handle_snapshot: link.series.protocol_key, protocol_title_snapshot: revision.title, revision_number_snapshot: revision.revision, issued_at: new Date(), revoked_at: null, revision_id: revision.id })
        }
        break
      }
    }
    const created = records.length ? await service.createResearchProtocolOrderAccesses(records) : []
    const trackingService = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    const [profile] = order.customer_id
      ? await trackingService.listResearchProfiles(
          { customer_id: order.customer_id },
          { take: 1 },
        )
      : []
    const profileAccessIds: string[] = []

    if (profile) {
      const orderAccesses = await service.listResearchProtocolOrderAccesses(
        { order_id },
        { relations: ["revision"] },
      )
      const existingProfileAccesses = orderAccesses.length
        ? await trackingService.listResearchProtocolProfileAccesses({
            order_protocol_access_id: orderAccesses.map((access) => access.id),
          })
        : []
      const existingOrderAccessIds = new Set(
        existingProfileAccesses.map((access) => access.order_protocol_access_id),
      )
      const profileAccessRecords = orderAccesses
        .filter((access) => !existingOrderAccessIds.has(access.id))
        .map((access) => ({
          profile_id: profile.id,
          customer_id: order.customer_id!,
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

      if (profileAccessRecords.length) {
        const createdProfileAccesses =
          await trackingService.createResearchProtocolProfileAccesses(
            profileAccessRecords,
          )
        profileAccessIds.push(
          ...createdProfileAccesses.map((access) => access.id),
        )
      }
    }

    return new StepResponse(
      created,
      {
        orderAccessIds: created.map((access) => access.id),
        profileAccessIds,
      },
    )
  },
  async (ids: { orderAccessIds: string[]; profileAccessIds: string[] }, { container }) => {
    if (ids.profileAccessIds.length) {
      await container
        .resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
        .deleteResearchProtocolProfileAccesses(ids.profileAccessIds)
    }
    if (!ids.orderAccessIds.length) return
    const service = container.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
    await service.deleteResearchProtocolOrderAccesses(ids.orderAccessIds)
  },
)
