import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { CUSTOMER_SUPPORT_MODULE } from "../../../modules/customer-support"
import type { AdminUpsertSupportSavedResponse } from "../../../modules/customer-support/contracts"
import type CustomerSupportModuleService from "../../../modules/customer-support/service"
import { manageSupportSavedResponseWorkflow } from "../../../workflows/manage-support-saved-response"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CustomerSupportModuleService>(
    CUSTOMER_SUPPORT_MODULE,
  )
  const responses = await service.listSupportSavedResponses(
    { active: true },
    { take: 250, order: { sort_order: "ASC", title: "ASC" } },
  )
  res.json({ responses })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpsertSupportSavedResponse>,
  res: MedusaResponse,
) {
  const { result } = await manageSupportSavedResponseWorkflow(req.scope).run({
    input: {
      operation: "create",
      actor_id: req.auth_context.actor_id,
      value: req.validatedBody,
    },
  })
  res.status(201).json({ response: result })
}
