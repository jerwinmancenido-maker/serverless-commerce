import { type MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const StoreRedeemRewards = z.object({
  points: z.number().int().positive(),
  cart_id: z.string().min(1),
  idempotency_key: z.string().min(8).max(200),
})
export type StoreRedeemRewards = z.infer<typeof StoreRedeemRewards>

export const StoreClaimReferral = z.object({
  code: z.string().trim().min(5).max(40),
})
export type StoreClaimReferral = z.infer<typeof StoreClaimReferral>

export const storeRewardsMiddlewares: MiddlewareRoute[] = [
  { matcher: "/store/customers/me/rewards/redemptions", method: "POST", middlewares: [validateAndTransformBody(StoreRedeemRewards)] },
  { matcher: "/store/customers/me/rewards/referrals/claim", method: "POST", middlewares: [validateAndTransformBody(StoreClaimReferral)] },
]
