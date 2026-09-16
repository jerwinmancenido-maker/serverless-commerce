/**
 * @file    apps/backend/src/lib/rate-limiter.ts
 * @module  RateLimiter (Security & Compute Efficiency)
 * @purpose Sliding-window rate-limiting middleware factory for sensitive public store endpoints.
 * @contracts
 *   Middleware: createRateLimiter
 *   Headers:    X-RateLimit-Limit · X-RateLimit-Remaining · X-RateLimit-Reset · Retry-After
 */

import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export type RateLimiterOptions = {
  windowMs: number
  max: number
  message?: string
  keyGenerator?: (req: MedusaRequest) => string
}

type ClientRecord = {
  timestamps: number[]
}

const stores = new Map<string, Map<string, ClientRecord>>()

export function resolveClientIp(req: MedusaRequest): string {
  const forwarded = req.headers["x-forwarded-for"]
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim()
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim()
  }
  const realIp = req.headers["x-real-ip"]
  if (typeof realIp === "string" && realIp.trim()) {
    return realIp.trim()
  }
  return (req as any).ip || req.socket?.remoteAddress || "127.0.0.1"
}

export function resetRateLimitStore(storeKey?: string): void {
  if (storeKey) {
    stores.delete(storeKey)
  } else {
    stores.clear()
  }
}

export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    max,
    message = "Too many requests. Please try again later.",
    keyGenerator = resolveClientIp,
  } = options

  const storeKey = `limiter_${windowMs}_${max}`
  if (!stores.has(storeKey)) {
    stores.set(storeKey, new Map())
  }
  const store = stores.get(storeKey)!

  return function rateLimiterMiddleware(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction,
  ) {
    const now = Date.now()
    const clientKey = keyGenerator(req)
    const windowStart = now - windowMs

    let record = store.get(clientKey)
    if (!record) {
      record = { timestamps: [] }
      store.set(clientKey, record)
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

    const count = record.timestamps.length

    const resetTimeSeconds = Math.ceil(
      (record.timestamps.length > 0 ? record.timestamps[0] + windowMs : now + windowMs) / 1000,
    )
    const remaining = Math.max(0, max - count - 1)

    res.setHeader("X-RateLimit-Limit", max)
    res.setHeader("X-RateLimit-Remaining", remaining)
    res.setHeader("X-RateLimit-Reset", resetTimeSeconds)

    if (count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.timestamps[0] + windowMs - now) / 1000))
      res.setHeader("Retry-After", retryAfterSeconds)
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      })
    }

    record.timestamps.push(now)
    return next()
  }
}
