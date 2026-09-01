import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminUpsertSupportCategory } from "../../../modules/customer-support/contracts"
import { upsertSupportCategoryWorkflow } from "../../../workflows/manage-support-configuration"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpsertSupportCategory>,
  res: MedusaResponse,
) {
  const { result } = await upsertSupportCategoryWorkflow(req.scope).run({
    input: { ...req.validatedBody, actor_id: req.auth_context.actor_id },
  })
  res.json({ category: result })
}
