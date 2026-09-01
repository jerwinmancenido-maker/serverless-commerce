import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { manageRewardsWorkflow } from "../../../../workflows/manage-rewards"
import type { AdminAdjustRewards } from "../middlewares"

export async function POST(req: AuthenticatedMedusaRequest<AdminAdjustRewards>, res: MedusaResponse) {
  const { result } = await manageRewardsWorkflow(req.scope).run({ input: { operation: "adjust", actor_id: req.auth_context.actor_id, ...req.validatedBody } })
  res.status(201).json(result)
}
