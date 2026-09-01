import { readFileSync } from "node:fs"
import { join } from "node:path"

const srcRoot = join(process.cwd(), "src")
const read = (path: string) => readFileSync(join(srcRoot, path), "utf8")

describe("rewards integration source", () => {
  it("keeps all onboarding milestones server-verified and idempotent", () => {
    const address = read(
      "api/store/customers/me/rewards/achievements/address/route.ts",
    )
    const protocol = read(
      "api/store/customers/me/research-tracking/protocols/[id]/start-routine/route.ts",
    )
    const routine = read(
      "api/store/customers/me/research-tracking/logs/route.ts",
    )

    expect(address).toContain('fields: ["id", "addresses.id"]')
    expect(address).toContain('event_type: "first_address"')
    expect(protocol).toContain('event_type: "first_protocol_review"')
    expect(routine).toContain('event_type: "first_weekly_goal"')
    expect(routine).toContain('occurrence.status === "confirmed"')
  })

  it("does not copy private Journal or measurement values to reward events", () => {
    const journal = read(
      "api/store/customers/me/research-tracking/journal/route.ts",
    )
    const measurement = read(
      "api/store/customers/me/research-tracking/measurements/route.ts",
    )
    const award = read("workflows/award-reward-event.ts")

    expect(journal).not.toMatch(/eligible_amount:\s*body\.note/)
    expect(measurement).not.toMatch(/eligible_amount:\s*req\.validatedBody\.value/)
    expect(award).not.toContain("note:")
    expect(award).not.toContain("measurement_value")
  })

  it("uses payment confirmation rather than order placement for purchase points", () => {
    const subscriber = read("subscribers/award-captured-order-rewards.ts")

    expect(subscriber).toContain('event: "payment.captured"')
    expect(subscriber).toContain('event_type: "purchase_confirmed"')
    expect(subscriber).not.toContain('event: "order.placed"')
  })

  it("reverses purchase points cumulatively when a refund is created", () => {
    const subscriber = read("subscribers/reverse-refunded-order-rewards.ts")
    const workflow = read("workflows/manage-rewards.ts")

    expect(subscriber).toContain('event: "refund.created"')
    expect(subscriber).toContain("cumulativeRefundedAmount")
    expect(workflow).toContain('operation: "reverse_purchase"')
    expect(workflow).toContain('source_type: "purchase_refund"')
  })

  it("applies redemptions through a customer-limited native cart promotion", () => {
    const workflow = read("workflows/manage-rewards.ts")

    expect(workflow).toContain("createPromotionsWorkflow")
    expect(workflow).toContain('attribute: "customer_id"')
    expect(workflow).toContain("updateCartPromotionsWorkflow")
    expect(workflow).toContain('status: "applied"')
    expect(workflow).toContain("deletePromotionsWorkflow")
  })
})
