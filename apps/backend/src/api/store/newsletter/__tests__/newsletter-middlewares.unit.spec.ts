/**
 * @file    apps/backend/src/api/store/newsletter/__tests__/newsletter-middlewares.unit.spec.ts
 * @module  NewsletterMiddlewaresUnitSpec
 * @purpose Unit tests validating route-level rate limiting middleware registration and throttling for newsletter subscriptions.
 */

import { storeNewsletterMiddlewares } from "../middlewares"

describe("Store Newsletter Middlewares", () => {
  it("defines POST route configuration with rate limiter on /store/newsletter", () => {
    expect(storeNewsletterMiddlewares).toHaveLength(1)
    const config = storeNewsletterMiddlewares[0]

    expect(config.matcher).toBe("/store/newsletter")
    expect(config.methods).toEqual(["POST"])
    expect(config.middlewares).toHaveLength(1)
  })

  it("enforces sliding-window rate limit barrier of 5 requests per 15 minutes", () => {
    const limiter = storeNewsletterMiddlewares[0].middlewares![0] as Function

    const createReqRes = (ip: string) => {
      const req: any = {
        headers: { "x-forwarded-for": ip },
        socket: {},
      }
      const res: any = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        setHeader: jest.fn().mockImplementation((k: string, v: string) => {
          res.headers[k.toLowerCase()] = v
        }),
        status: jest.fn().mockImplementation((code: number) => {
          res.statusCode = code
          return res
        }),
        json: jest.fn().mockImplementation((body: any) => {
          res.body = body
          return res
        }),
      }
      const next = jest.fn()
      return { req, res, next }
    }

    const testIp = "203.0.113.88"

    // 5 allowed requests
    for (let i = 1; i <= 5; i++) {
      const { req, res, next } = createReqRes(testIp)
      limiter(req, res, next)
      expect(next).toHaveBeenCalledTimes(1)
      expect(res.status).not.toHaveBeenCalled()
      expect(res.headers["x-ratelimit-remaining"]).toBe(5 - i)
    }

    // 6th request must be throttled with 429
    const blocked = createReqRes(testIp)
    limiter(blocked.req, blocked.res, blocked.next)

    expect(blocked.next).not.toHaveBeenCalled()
    expect(blocked.res.status).toHaveBeenCalledWith(429)
    expect(blocked.res.body.message).toContain("Too many newsletter subscription attempts")
    expect(blocked.res.headers["retry-after"]).toBeDefined()
  })
})
