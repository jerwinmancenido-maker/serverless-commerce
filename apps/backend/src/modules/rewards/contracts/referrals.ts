export function normalizeReferralCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "")
}

export function isReferralCampaignActive(input: {
  now: Date
  startsAt: Date | null
  endsAt: Date | null
}) {
  return !(
    (input.startsAt && input.startsAt > input.now) ||
    (input.endsAt && input.endsAt <= input.now)
  )
}

export function isReferralOrderEligible(input: {
  eligibleAmount: number
  minimumAmount: number
  productIds: string[]
  eligibleProductIds: string[]
}) {
  return (
    input.eligibleAmount >= input.minimumAmount &&
    (!input.eligibleProductIds.length ||
      input.productIds.some((id) => input.eligibleProductIds.includes(id)))
  )
}
