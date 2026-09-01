import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../../../../modules/research-content"
import type ResearchContentModuleService from "../../../../../modules/research-content/service"
import { RESEARCH_TRACKING_MODULE } from "../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../modules/research-tracking/service"
import { bindOrderResearchProtocolsWorkflow } from "../../../../../workflows/bind-order-research-protocols"

async function delivery(req: AuthenticatedMedusaRequest) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const content = req.scope.resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
  const tracking = req.scope.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "items.id", "items.title", "items.variant_title"],
    filters: { id: req.params.id },
    pagination: { take: 1 },
  })
  const order = data[0] as {
    id: string
    customer_id?: string | null
    items?: Array<{ id: string; title?: string; variant_title?: string }>
  } | undefined
  if (!order) return null
  const accesses = await content.listResearchProtocolOrderAccesses(
    { order_id: order.id },
    { relations: ["revision"], order: { issued_at: "DESC" } },
  )
  const profiles = order.customer_id
    ? await tracking.listResearchProfiles({ customer_id: order.customer_id }, { take: 1 })
    : []
  const profileAccesses = profiles[0]
    ? await tracking.listResearchProtocolProfileAccesses({
        profile_id: profiles[0].id,
        order_protocol_access_id: accesses.map((access) => access.id),
      })
    : []
  const profileByOrderAccess = new Map(
    profileAccesses.map((access) => [access.order_protocol_access_id, access]),
  )
  const itemById = new Map((order.items || []).map((item) => [item.id, item]))
  return {
    order_id: order.id,
    customer_id: order.customer_id || null,
    profile_status: profiles[0]?.status || null,
    accesses: accesses.map((access) => ({
      id: access.id,
      line_item_id: access.line_item_id,
      line_item_label: itemById.get(access.line_item_id)?.title || access.line_item_id,
      protocol_title: access.protocol_title_snapshot,
      protocol_handle: access.protocol_handle_snapshot,
      revision: access.revision_number_snapshot,
      qr_status: access.revoked_at ? "revoked" : "active",
      entitlement_status: profileByOrderAccess.has(access.id) ? "granted" : "not_granted",
      issued_at: access.issued_at,
    })),
  }
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const result = await delivery(req)
  if (!result) return res.status(404).json({ message: "Order not found" })
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ protocol_delivery: result })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  await bindOrderResearchProtocolsWorkflow(req.scope).run({
    input: { order_id: req.params.id },
  })
  const result = await delivery(req)
  res.json({ protocol_delivery: result })
}
