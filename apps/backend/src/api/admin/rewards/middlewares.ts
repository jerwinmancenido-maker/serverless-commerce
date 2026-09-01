import { type MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const AdminConfigureRewardsProgram = z.object({
  program_id: z.string().optional(),
  name: z.string().min(1).max(100),
  status: z.enum(["draft", "active", "paused"]),
  currency_code: z.string().length(3),
  purchase_amount_per_point: z.number().positive(),
  peso_value_per_point: z.number().positive(),
  minimum_redemption_points: z.number().int().nonnegative(),
  maximum_redemption_points: z.number().int().positive().nullable().optional(),
  points_expire_after_days: z.number().int().positive().nullable().optional(),
  pending_period_days: z.number().int().nonnegative(),
  referral_enabled: z.boolean().default(false),
  referral_minimum_order_amount: z.number().nonnegative().default(0),
  referral_waiting_period_days: z.number().int().nonnegative().max(365).default(0),
  referral_maximum_per_customer: z.number().int().positive().nullable().optional(),
  referral_refund_reversal_enabled: z.boolean().default(true),
  referral_eligible_product_ids: z.array(z.string().min(1)).max(500).default([]),
  referral_starts_at: z.iso.datetime().nullable().optional(),
  referral_ends_at: z.iso.datetime().nullable().optional(),
})
export type AdminConfigureRewardsProgram = z.infer<typeof AdminConfigureRewardsProgram>

export const AdminAdjustRewards = z.object({
  customer_id: z.string().min(1),
  points: z.number().int().refine((value) => value !== 0),
  reason: z.string().min(3).max(500),
  idempotency_key: z.string().min(8).max(200),
})
export type AdminAdjustRewards = z.infer<typeof AdminAdjustRewards>

export const AdminConfigureRewardRule = z.object({
  name: z.string().min(1).max(100),
  point_value: z.number().int().positive().nullable().optional(),
  purchase_amount_per_point: z.number().positive().nullable().optional(),
  daily_cap: z.number().int().positive().nullable().optional(),
  weekly_cap: z.number().int().positive().nullable().optional(),
  lifetime_cap: z.number().int().positive().nullable().optional(),
  starts_at: z.iso.datetime().nullable().optional(),
  ends_at: z.iso.datetime().nullable().optional(),
  status: z.enum(["active", "inactive"]),
  show_as_badge: z.boolean().default(false),
  badge_name: z.string().trim().min(1).max(100).nullable().optional(),
  badge_icon: z.string().trim().min(1).max(40).nullable().optional(),
  streak_target: z.number().int().positive().max(365).nullable().optional(),
  skip_policy: z.enum(["ignore", "break"]).default("ignore"),
})
export type AdminConfigureRewardRule = z.infer<typeof AdminConfigureRewardRule>

export const adminRewardsMiddlewares: MiddlewareRoute[] = [
  { matcher: "/admin/rewards/program", method: "POST", middlewares: [validateAndTransformBody(AdminConfigureRewardsProgram)] },
  { matcher: "/admin/rewards/adjustments", method: "POST", middlewares: [validateAndTransformBody(AdminAdjustRewards)] },
  { matcher: "/admin/rewards/rules/:id", method: "POST", middlewares: [validateAndTransformBody(AdminConfigureRewardRule)] },
]
