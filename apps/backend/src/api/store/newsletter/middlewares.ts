/**
 * @file    apps/backend/src/api/store/newsletter/middlewares.ts
 * @module  StoreNewsletterMiddlewares (Store API)
 * @purpose Configure sliding-window rate limiting for public newsletter subscriptions.
 * @contracts
 *   Matcher: /store/newsletter
 */

import type { MiddlewareRoute } from "@medusajs/framework/http"

import { createRateLimiter } from "../../../lib/rate-limiter"

const newsletterRateLimiter = createRateLimiter({
  windowMs: 15 * 60_000,
  max: 5,
  message: "Too many newsletter subscription attempts from this IP. Please try again later.",
})

export const storeNewsletterMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/newsletter",
    methods: ["POST"],
    middlewares: [newsletterRateLimiter],
  },
]
