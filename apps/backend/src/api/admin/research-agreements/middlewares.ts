import {
  type MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

const digest = z.string().regex(/^[a-f0-9]{64}$/i)
const absoluteUrl = z.url()

export const AdminResearchAgreementBundle = z.object({
  public_version: z.string().min(1).max(100),
  terms_version: z.string().min(1).max(100),
  terms_digest: digest,
  terms_url: absoluteUrl,
  privacy_version: z.string().min(1).max(100),
  privacy_digest: digest,
  privacy_url: absoluteUrl,
  research_hub_version: z.string().min(1).max(100),
  research_hub_digest: digest,
  research_hub_url: absoluteUrl,
  locale: z.string().min(2).max(20),
  effective_at: z.iso.datetime(),
})

export type AdminResearchAgreementBundle = z.infer<
  typeof AdminResearchAgreementBundle
>

export const adminResearchAgreementMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/research-agreements",
    method: "POST",
    middlewares: [validateAndTransformBody(AdminResearchAgreementBundle)],
  },
  {
    matcher: "/admin/research-agreements/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(AdminResearchAgreementBundle)],
  },
]
