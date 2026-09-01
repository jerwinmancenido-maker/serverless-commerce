import {
  isReferralCampaignActive,
  isReferralOrderEligible,
  normalizeReferralCode,
} from "../contracts/referrals"

describe("referral rules", () => {
  it("normalizes referral codes without accepting arbitrary punctuation", () => {
    expect(normalizeReferralCode(" pep-ab_12! ")).toBe("PEP-AB12")
  })

  it("requires both the configured minimum and an eligible product when restricted", () => {
    expect(isReferralOrderEligible({ eligibleAmount: 999, minimumAmount: 1000, productIds: ["prod_a"], eligibleProductIds: ["prod_a"] })).toBe(false)
    expect(isReferralOrderEligible({ eligibleAmount: 1000, minimumAmount: 1000, productIds: ["prod_b"], eligibleProductIds: ["prod_a"] })).toBe(false)
    expect(isReferralOrderEligible({ eligibleAmount: 1000, minimumAmount: 1000, productIds: ["prod_a"], eligibleProductIds: ["prod_a"] })).toBe(true)
  })

  it("uses an inclusive start and exclusive end campaign window", () => {
    const now = new Date("2026-09-01T00:00:00.000Z")
    expect(isReferralCampaignActive({ now, startsAt: now, endsAt: new Date("2026-09-02T00:00:00.000Z") })).toBe(true)
    expect(isReferralCampaignActive({ now, startsAt: null, endsAt: now })).toBe(false)
  })
})
