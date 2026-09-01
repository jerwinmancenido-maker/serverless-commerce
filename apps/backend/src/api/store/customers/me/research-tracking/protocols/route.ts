import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../../modules/research-content"
import type ResearchContentModuleService from "../../../../../../modules/research-content/service"
import { ResearchProtocolContent } from "../../../../../../modules/research-content/contracts/research-protocol"
import { RESEARCH_TRACKING_MODULE } from "../../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../../modules/research-tracking/service"
import { setResearchPrivateNoStore } from "../utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const customerId = req.auth_context.actor_id
  const trackingService =
    req.scope.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
  const contentService =
    req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const [profile] = await trackingService.listResearchProfiles(
    { customer_id: customerId },
    { take: 1 },
  )

  if (!profile) {
    return res.json({ protocols: [] })
  }

  const accesses = await trackingService.listResearchProtocolProfileAccesses(
    { profile_id: profile.id, status: "active" },
    { order: { granted_at: "DESC" } },
  )

  if (!accesses.length) {
    return res.json({ protocols: [] })
  }

  const seriesIds = Array.from(
    new Set(accesses.map((access) => access.protocol_series_id)),
  )
  const orderAccessIds = accesses.map(
    (access) => access.order_protocol_access_id,
  )
  const revisionIds = Array.from(
    new Set(accesses.map((access) => access.protocol_revision_id)),
  )
  const productIds = Array.from(
    new Set(accesses.map((access) => access.product_id)),
  )
  const orderIds = Array.from(new Set(accesses.map((access) => access.order_id)))
  const [currentRevisions, orderAccesses, preservedRevisions] = await Promise.all([
    contentService.listResearchProtocols(
      { series_id: seriesIds, status: "published" },
      { order: { revision: "DESC" } },
    ),
    contentService.listResearchProtocolOrderAccesses({ id: orderAccessIds }),
    contentService.listResearchProtocols({ id: revisionIds }),
  ])
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const [{ data: products }, { data: orders }] = await Promise.all([
    query.graph({
      entity: "product",
      fields: ["id", "title", "thumbnail", "variants.id", "variants.title"],
      filters: { id: productIds },
    }),
    query.graph({
      entity: "order",
      fields: ["id", "display_id", "created_at"],
      filters: { id: orderIds },
    }),
  ])
  const currentRevisionBySeries = new Map<string, number>()

  currentRevisions.forEach((revision) => {
    const current = currentRevisionBySeries.get(revision.series_id)
    if (current === undefined || revision.revision > current) {
      currentRevisionBySeries.set(revision.series_id, revision.revision)
    }
  })
  const orderAccessById = new Map(
    orderAccesses.map((access) => [access.id, access]),
  )
  const preservedRevisionById = new Map(
    preservedRevisions.map((revision) => [revision.id, revision]),
  )
  const productById = new Map(products.map((product) => [product.id, product]))
  const orderById = new Map(orders.map((order) => [order.id, order]))

  res.json({
    protocols: accesses.map((access) => {
      const currentRevision =
        currentRevisionBySeries.get(access.protocol_series_id) ??
        access.revision_number_snapshot
      const product = productById.get(access.product_id)
      const variant = product?.variants?.find(
        (item) => item.id === access.product_variant_id,
      )
      const order = orderById.get(access.order_id)
      const orderAccess = orderAccessById.get(access.order_protocol_access_id)
      const preservedRevision = preservedRevisionById.get(
        access.protocol_revision_id,
      )
      const parsedContent = preservedRevision
        ? ResearchProtocolContent.safeParse(preservedRevision.content)
        : null
      const routineLevels = parsedContent?.success
        ? parsedContent.data.protocol_levels
            .filter((level) => level.routine_enabled && level.rows.length)
            .map((level) => ({
              key: level.key,
              title: level.title,
              summary: level.summary,
              duration: level.duration,
              rows: level.rows.map((row, position) => ({
                row_key:
                  row.row_key ?? `${level.key}-row-${position + 1}`,
                period: row.period,
                amount: row.amount,
                unit: row.unit,
                frequency: row.frequency,
                recurrence_type: row.recurrence_type,
                suggested_local_times: row.suggested_local_times,
                routine_ready:
                  row.start_offset_days !== null &&
                  row.recurrence_type !== "custom" &&
                  row.suggested_local_times.length > 0,
              })),
            }))
        : []

      return {
        profile_access_id: access.id,
        protocol_handle: access.protocol_handle_snapshot,
        protocol_title: access.protocol_title_snapshot,
        preserved_revision: access.revision_number_snapshot,
        current_revision: currentRevision,
        has_newer_revision: currentRevision > access.revision_number_snapshot,
        granted_at: access.granted_at,
        first_viewed_at: access.first_viewed_at,
        last_viewed_at: access.last_viewed_at,
        routine_started_at: access.routine_started_at,
        routine_id: access.routine_id,
        routine_levels: routineLevels,
        protocol_series_id: access.protocol_series_id,
        protocol_revision_id: access.protocol_revision_id,
        calculator: parsedContent?.success
          ? parsedContent.data.calculator
          : null,
        order: {
          id: access.order_id,
          display_id: order?.display_id ?? access.order_id,
          created_at: order?.created_at ?? access.granted_at,
        },
        product: {
          id: access.product_id,
          title: product?.title ?? access.protocol_title_snapshot,
          thumbnail: product?.thumbnail ?? null,
        },
        variant: access.product_variant_id
          ? {
              id: access.product_variant_id,
              title: variant?.title ?? null,
            }
          : null,
        access_token: orderAccess?.access_token ?? null,
      }
    }),
  })
}
