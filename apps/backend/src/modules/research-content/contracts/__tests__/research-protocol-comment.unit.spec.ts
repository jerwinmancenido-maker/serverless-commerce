import {
  AdminModerateResearchProtocolComment,
  StoreCreateResearchProtocolComment,
} from "../research-protocol-comment"

describe("research protocol community comment contract", () => {
  it("accepts a bounded customer idea for Admin moderation", () => {
    const parsed = StoreCreateResearchProtocolComment.parse({
      protocol_handle: "ghk-cu",
      kind: "idea",
      body: "Please add a clearer preparation example.",
    })

    expect(parsed.kind).toBe("idea")
    expect(parsed.body).toBe("Please add a clearer preparation example.")
  })

  it("rejects empty and oversized comments", () => {
    expect(() =>
      StoreCreateResearchProtocolComment.parse({
        protocol_handle: "ghk-cu",
        kind: "general",
        body: "",
      }),
    ).toThrow()
    expect(() =>
      StoreCreateResearchProtocolComment.parse({
        protocol_handle: "ghk-cu",
        kind: "general",
        body: "x".repeat(2_001),
      }),
    ).toThrow()
  })

  it("allows only explicit Admin moderation actions", () => {
    expect(
      AdminModerateResearchProtocolComment.parse({
        action: "approve",
        reason: null,
      }).action,
    ).toBe("approve")
    expect(() =>
      AdminModerateResearchProtocolComment.parse({
        action: "publish_protocol",
        reason: null,
      }),
    ).toThrow()
  })
})
