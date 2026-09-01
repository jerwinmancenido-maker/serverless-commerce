import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { StoreClaimReferral } from "../../middlewares"
import { manageReferralsWorkflow } from "../../../../../../../workflows/manage-referrals"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreClaimReferral>,
  res: MedusaResponse,
) {
  const { result } = await manageReferralsWorkflow(req.scope).run({
    input: {
      operation: "claim",
      customerId: req.auth_context.actor_id,
      code: req.validatedBody.code,
    },
  })
  res.status(201).json(result)
}
