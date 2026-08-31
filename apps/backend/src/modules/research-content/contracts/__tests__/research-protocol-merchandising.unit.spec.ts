import {
  AdminCreateResearchProtocolMerchandisingLink,
  StoreListResearchProtocolRecommendations,
  StoreRecordResearchProtocolRecommendationEvent,
} from "../research-protocol-merchandising"

describe("research protocol merchandising contracts", () => {
  it("keeps merchandising placements explicit and independent", () => {
    const parsed = AdminCreateResearchProtocolMerchandisingLink.parse({
      product_id: "prod_supply",
      relationship_type: "optional",
      placements: ["protocol", "my_protocols"],
      reason: "Useful optional supply for this protocol.",
    })

    expect(parsed.product_id).toBe("prod_supply")
    expect(parsed.placements).toEqual(["protocol", "my_protocols"])
    expect(parsed.priority).toBe(100)
    expect(parsed.status).toBe("active")
  })

  it("normalizes recommendation limits and exclusions", () => {
    const parsed = StoreListResearchProtocolRecommendations.parse({
      placement: "dashboard",
      limit: "6",
      exclude_product_ids: "prod_1, prod_2,prod_1",
    })

    expect(parsed.limit).toBe(6)
    expect(parsed.exclude_product_ids).toEqual([
      "prod_1",
      "prod_2",
      "prod_1",
    ])
  })

  it("rejects events for an unknown placement", () => {
    expect(() =>
      StoreRecordResearchProtocolRecommendationEvent.parse({
        merchandising_link_id: "link_1",
        event_type: "click",
        placement: "journal_entry",
        product_id: "prod_1",
      }),
    ).toThrow()
  })
})
