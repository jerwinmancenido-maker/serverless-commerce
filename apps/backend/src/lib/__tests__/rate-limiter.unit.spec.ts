/**
 * @file    apps/backend/src/lib/__tests__/rate-limiter.unit.spec.ts
 * @module  RateLimiterUnitSpec (Unit Test)
 * @purpose Verify sliding-window rate limiting, HTTP 429 status, headers, and IP partitioning.
 * @contracts
 *   Target: rate-limiter.ts
 */

import { createRateLimiter, resetRateLimitStore, resolveClientIp } from "../rate-limiter"

describe("Rate Limiter Middleware", () => {
  beforeEach(() => {
    resetRateLimitStore()
    jest.useRealTimers()
  })

  function createMockContext(ip = "192.168.1.10", headers: Record<string, string> = {}) {
    const req = {
      headers: { ...headers },
      socket: { remoteAddress: ip },
    } as any

    const responseHeaders: Record<string, string | number> = {}
    let statusCode = 200
    let jsonBody: any = null

    const res = {
      setHeader: jest.fn((key: string, val: any) => {
        responseHeaders[key] = val
      }),
      status: jest.fn((code: number) => {
        statusCode = code
        return res
      }),
      json: jest.fn((body: any) => {
        jsonBody = body
        return res
      }),
    } as any

    const next = jest.fn()

    return { req, res, next, responseHeaders, getStatus: () => statusCode, getBody: () => jsonBody }
  }

  it("resolves client IP from x-forwarded-for header", () => {
    const { req } = createMockContext("127.0.0.1", { "x-forwarded-for": "203.0.113.195, 70.41.3.18" })
    expect(resolveClientIp(req)).toBe("203.0.113.195")
  })

  it("resolves client IP from x-real-ip header when x-forwarded-for is missing", () => {
    const { req } = createMockContext("127.0.0.1", { "x-real-ip": "198.51.100.42" })
    expect(resolveClientIp(req)).toBe("198.51.100.42")
  })

  it("allows requests within the configured max threshold", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3 })

    for (let i = 0; i < 3; i++) {
      const ctx = createMockContext("10.0.0.1")
      limiter(ctx.req, ctx.res, ctx.next)
      expect(ctx.next).toHaveBeenCalledTimes(1)
      expect(ctx.getStatus()).toBe(200)
      expect(ctx.responseHeaders["X-RateLimit-Limit"]).toBe(3)
    }
  })

  it("blocks requests exceeding the max limit with HTTP 429 and Retry-After", () => {
    const limiter = createRateLimiter({
      windowMs: 60_000,
      max: 2,
      message: "Exceeded research query quota.",
    })

    // Request 1: allowed
    const ctx1 = createMockContext("10.0.0.2")
    limiter(ctx1.req, ctx1.res, ctx1.next)
    expect(ctx1.next).toHaveBeenCalled()

    // Request 2: allowed
    const ctx2 = createMockContext("10.0.0.2")
    limiter(ctx2.req, ctx2.res, ctx2.next)
    expect(ctx2.next).toHaveBeenCalled()

    // Request 3: blocked (exceeds 2)
    const ctx3 = createMockContext("10.0.0.2")
    limiter(ctx3.req, ctx3.res, ctx3.next)
    expect(ctx3.next).not.toHaveBeenCalled()
    expect(ctx3.getStatus()).toBe(429)
    expect(ctx3.getBody()).toEqual(
      expect.objectContaining({
        success: false,
        message: "Exceeded research query quota.",
      }),
    )
    expect(ctx3.responseHeaders["Retry-After"]).toBeGreaterThan(0)
    expect(ctx3.responseHeaders["X-RateLimit-Remaining"]).toBe(0)
  })

  it("isolates request counts across different client IPs", () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 })

    // Client A request 1: allowed
    const ctxA1 = createMockContext("10.0.0.100")
    limiter(ctxA1.req, ctxA1.res, ctxA1.next)
    expect(ctxA1.next).toHaveBeenCalled()

    // Client A request 2: blocked
    const ctxA2 = createMockContext("10.0.0.100")
    limiter(ctxA2.req, ctxA2.res, ctxA2.next)
    expect(ctxA2.getStatus()).toBe(429)

    // Client B request 1: allowed (different IP)
    const ctxB1 = createMockContext("10.0.0.200")
    limiter(ctxB1.req, ctxB1.res, ctxB1.next)
    expect(ctxB1.next).toHaveBeenCalled()
    expect(ctxB1.getStatus()).toBe(200)
  })
})
