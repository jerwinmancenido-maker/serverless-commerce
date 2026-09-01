import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { manageReferralsWorkflow } from "../../../../../../../workflows/manage-referrals"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await manageReferralsWorkflow(req.scope).run({
    input: { operation: "ensure_account", customerId: req.auth_context.actor_id },
  })
  res.status(201).json(result)
}
