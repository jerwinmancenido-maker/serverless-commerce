/**
 * @file    apps/backend/src/api/admin/research-agreements/[id]/route.ts
 * @module  AdminResearchAgreementDetailRoute (Research Tracking Module)
 * @purpose Admin endpoint for fetching agreement bundle details with acceptance signatures, and updating drafts.
 * @contracts
 *   API:     GET/POST /admin/research-agreements/:id
 *   Service: ResearchTrackingModuleService
 */

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_TRACKING_MODULE } from "../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../modules/research-tracking/service"
import { manageResearchAgreementWorkflow } from "../../../../workflows/manage-research-agreement"
import type { AdminResearchAgreementBundle } from "../middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const [bundle] = await service.listResearchAgreementBundles({
    id: req.params.id,
  })

  if (!bundle) {
    res.status(404).json({ message: `Agreement bundle ${req.params.id} not found` })
    return
  }

  const acceptances = await service.listResearchAgreementAcceptances({
    agreement_bundle_id: req.params.id,
  })

  const customerIds = Array.from(new Set(acceptances.map((a) => a.customer_id)))
  const customersMap = new Map<string, { email: string; first_name?: string; last_name?: string; company_name?: string }>()

  if (customerIds.length > 0) {
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name", "company_name"],
      filters: { id: customerIds },
    })
    customers.forEach((c: any) => customersMap.set(c.id, c))
  }

  const enrichedAcceptances = acceptances.map((a) => ({
    ...a,
    customer_email: customersMap.get(a.customer_id)?.email || a.customer_id,
    customer_name: [customersMap.get(a.customer_id)?.first_name, customersMap.get(a.customer_id)?.last_name].filter(Boolean).join(" ") || undefined,
    customer_company: customersMap.get(a.customer_id)?.company_name || undefined,
  }))

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    agreement_bundle: bundle,
    acceptances: enrichedAcceptances,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminResearchAgreementBundle>,
  res: MedusaResponse,
) {
  const { result } = await manageResearchAgreementWorkflow(req.scope).run({
    input: {
      operation: "update",
      id: req.params.id,
      actor_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })
  res.json({ agreement_bundle: result })
}

