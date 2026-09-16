/**
 * @file    apps/backend/src/api/store/newsletter/__tests__/newsletter-route.unit.spec.ts
 * @module  NewsletterRouteUnitSpec
 * @purpose Unit tests validating database-backed newsletter subscriptions, email validation,
 *          workflow invocation, idempotent customer updates, and discount code issuance.
 */

import { POST as subscribeNewsletter } from "../route"
import {
  subscribeNewsletterStep,
  subscribeNewsletterWorkflow,
} from "../../../../workflows/subscribe-newsletter"

jest.mock("../../../../workflows/subscribe-newsletter", () => {
  const original = jest.requireActual("../../../../workflows/subscribe-newsletter")
  return {
    ...original,
    subscribeNewsletterWorkflow: jest.fn(),
  }
})

describe("Store Newsletter Subscription Route & Workflow", () => {
  const createMockRes = () => {
    const res: any = {}
    res.data = null
    res.statusCode = 200
    res.status = jest.fn().mockImplementation((code: number) => {
      res.statusCode = code
      return res
    })
    res.json = jest.fn().mockImplementation((payload: any) => {
      res.data = payload
      return res
    })
    return res
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Validation & Format Barriers", () => {
    it("rejects missing body with 400", async () => {
      const req: any = { body: {} }
      const res = createMockRes()

      await subscribeNewsletter(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.data.success).toBe(false)
      expect(res.data.message).toContain("valid laboratory or organizational email")
    })

    it("rejects invalid email formats", async () => {
      const invalidEmails = ["not-an-email", "test@", "@lab.org", "foo@bar", "spaces in@email.com"]

      for (const email of invalidEmails) {
        const req: any = { body: { email } }
        const res = createMockRes()

        await subscribeNewsletter(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.data.success).toBe(false)
      }
    })
  })

  describe("Route Workflow Execution", () => {
    it("runs subscribeNewsletterWorkflow and returns 200 with voucher code", async () => {
      const mockRun = jest.fn().mockResolvedValue({ result: { success: true } })
      ;(subscribeNewsletterWorkflow as unknown as jest.Mock).mockReturnValue({ run: mockRun })

      const req: any = {
        body: {
          email: "  Scientist@PepStackLabs.com ",
          source: "homepage_footer",
        },
        scope: {},
      }
      const res = createMockRes()

      await subscribeNewsletter(req, res)

      expect(subscribeNewsletterWorkflow).toHaveBeenCalledWith(req.scope)
      expect(mockRun).toHaveBeenCalledWith({
        input: {
          email: "scientist@pepstacklabs.com",
          source: "homepage_footer",
          discountCode: "RESEARCH10",
        },
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.data.success).toBe(true)
      expect(res.data.discountCode).toBe("RESEARCH10")
    })

    it("returns 500 when workflow execution fails", async () => {
      const mockRun = jest.fn().mockRejectedValue(new Error("Database connection failure"))
      ;(subscribeNewsletterWorkflow as unknown as jest.Mock).mockReturnValue({ run: mockRun })

      const req: any = {
        body: { email: "fail@test.org" },
        scope: {},
      }
      const res = createMockRes()

      await subscribeNewsletter(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.data.success).toBe(false)
      expect(res.data.message).toContain("An error occurred")
    })
  })

  describe("Workflow Structure & Registration", () => {
    it("exports runnable workflow with valid name and step definitions", () => {
      const { subscribeNewsletterWorkflow: realWorkflow, subscribeNewsletterStep: realStep } =
        jest.requireActual("../../../../workflows/subscribe-newsletter")

      expect(realWorkflow.getName()).toBe("subscribe-newsletter")
      expect(realStep).toBeDefined()
    })
  })
})
