import {
  type MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const StoreAcceptResearchAgreement = z.object({
  agreement_bundle_id: z.string().min(1),
  acceptance_source: z.enum([
    "signup",
    "existing_customer_upgrade",
    "material_policy_renewal",
  ]),
  locale: z.string().min(2).max(20),
  idempotency_key: z.string().min(8).max(200),
})

export type StoreAcceptResearchAgreement = z.infer<
  typeof StoreAcceptResearchAgreement
>

export const storeResearchAgreementMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/customers/me/research-agreement",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreAcceptResearchAgreement)],
  },
]
