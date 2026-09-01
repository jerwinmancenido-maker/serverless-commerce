import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { manageRewardsWorkflow } from "../../../../../workflows/manage-rewards"
import type { AdminConfigureRewardRule } from "../../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminConfigureRewardRule>,
  res: MedusaResponse,
) {
  const { result } = await manageRewardsWorkflow(req.scope).run({
    input: {
      operation: "configure_rule",
      rule_id: req.params.id,
      ...req.validatedBody,
    },
  })
  res.json(result)
}
