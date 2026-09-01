import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { manageRewardsWorkflow } from "../../../../../../workflows/manage-rewards"
import type { StoreRedeemRewards } from "../middlewares"

export async function POST(req: AuthenticatedMedusaRequest<StoreRedeemRewards>, res: MedusaResponse) {
  const { result } = await manageRewardsWorkflow(req.scope).run({ input: { operation: "redeem", customer_id: req.auth_context.actor_id, ...req.validatedBody } })
  res.status(201).json(result)
}
