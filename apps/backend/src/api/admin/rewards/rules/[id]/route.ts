/**
 * @file    apps/backend/src/api/admin/rewards/rules/[id]/route.ts
 * @module  AdminRewardsRuleItemRoute
 * @purpose Admin endpoint for updating and deleting specific customer rewards earning rules.
 * @contracts
 *   API:     POST /admin/rewards/rules/:id · DELETE /admin/rewards/rules/:id
 *   Service: RewardsModuleService
 */

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

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { result } = await manageRewardsWorkflow(req.scope).run({
    input: {
      operation: "delete_rule",
      rule_id: req.params.id,
    },
  })
  res.json(result)
}
