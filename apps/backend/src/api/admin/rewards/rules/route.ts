/**
 * @file    apps/backend/src/api/admin/rewards/rules/route.ts
 * @module  AdminRewardsRulesRoute
 * @purpose Admin endpoint for creating new customer rewards earning rules.
 * @contracts
 *   API:     POST /admin/rewards/rules
 *   Service: RewardsModuleService
 */

import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { manageRewardsWorkflow } from "../../../../workflows/manage-rewards"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const body = req.body as any
  const { result } = await manageRewardsWorkflow(req.scope).run({
    input: {
      operation: "create_rule",
      name: body.name,
      event_type: body.event_type,
      award_type: body.award_type || "fixed",
      point_value: body.point_value,
      purchase_amount_per_point: body.purchase_amount_per_point,
      daily_cap: body.daily_cap,
      weekly_cap: body.weekly_cap,
      lifetime_cap: body.lifetime_cap,
      starts_at: body.starts_at,
      ends_at: body.ends_at,
      status: body.status || "active",
      show_as_badge: body.show_as_badge,
      badge_name: body.badge_name,
      badge_icon: body.badge_icon,
      streak_target: body.streak_target,
      skip_policy: body.skip_policy,
    },
  })
  res.status(201).json(result)
}
