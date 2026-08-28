import {
  calculateInitialSupplyBaseUnits,
  evaluateEligibleCommerceQuantity,
  normalizeActivatePurchasedSupplyInput,
  normalizeActivationLabel,
  purchasedActivationConflictReason,
  selectCurrentPublishedMaterialProfile,
} from "../contracts/purchased-supplies"

const fulfilledDetail = {
  quantity: 3,
  fulfilled_quantity: 3,
  return_requested_quantity: 0,
  return_received_quantity: 0,
  return_dismissed_quantity: 0,
  written_off_quantity: 0,
}

describe("RT-4 purchased supplies contract", () => {
  it("normalizes activation ownership input and fingerprints only the resource", () => {
    const normalized = normalizeActivatePurchasedSupplyInput({
      customerId: " cus_1 ",
      orderId: " order_1 ",
      lineItemId: " ordli_1 ",
      activeConsentVersion: "2026-08-25.v1",
      eligibleSalesChannelIds: [" sc_1 ", "sc_1"],
      idempotencyKey: "rt4:key-1234",
    })

    expect(normalized.customerId).toBe("cus_1")
    expect(normalized.eligibleSalesChannelIds).toEqual(["sc_1"])
    expect(normalized.requestFingerprintSha256).toMatch(/^[a-f0-9]{64}$/)
  })

  it("uses fulfilled quantity less all return counters", () => {
    expect(
      evaluateEligibleCommerceQuantity(
        {
          ...fulfilledDetail,
          quantity: 5,
          fulfilled_quantity: 5,
          return_requested_quantity: 1,
          return_received_quantity: 1,
          return_dismissed_quantity: 1,
        },
        false,
      ),
    ).toEqual({ eligible: true, commerceQuantity: 2 })
  })

  it.each([
    [{ ...fulfilledDetail, fulfilled_quantity: 2 }, false, "not_fulfilled"],
    [fulfilledDetail, true, "order_cancelled"],
    [
      { ...fulfilledDetail, written_off_quantity: 1 },
      false,
      "returned_or_reversed",
    ],
    [
      { ...fulfilledDetail, return_received_quantity: 3 },
      false,
      "returned_or_reversed",
    ],
    [
      { ...fulfilledDetail, quantity: 1.5, fulfilled_quantity: 1.5 },
      false,
      "quantity_unavailable",
    ],
  ])("rejects unsafe quantity state", (detail, cancelled, reason) => {
    expect(evaluateEligibleCommerceQuantity(detail, cancelled)).toEqual({
      eligible: false,
      reason,
    })
  })

  it("selects the latest uniquely current eligible material profile", () => {
    const selected = selectCurrentPublishedMaterialProfile(
      [
        {
          profile_key: "ghk-cu",
          revision: 1,
          product_variant_id: "variant_1",
          material_quantity_base_units: 1000,
          material_base_unit: "microgram",
          display_unit: "mg",
          base_units_per_display_unit: 1000,
          display_precision: 2,
          status: "published",
          evidence_scope: "sku",
          effective_at: new Date("2026-01-01T00:00:00.000Z"),
          published_at: new Date("2026-01-01T00:00:00.000Z"),
          withdrawn_at: null,
        },
        {
          profile_key: "ghk-cu",
          revision: 2,
          product_variant_id: "variant_1",
          material_quantity_base_units: 2000,
          material_base_unit: "microgram",
          display_unit: "mg",
          base_units_per_display_unit: 1000,
          display_precision: 2,
          status: "published",
          evidence_scope: "formulation",
          effective_at: new Date("2026-06-01T00:00:00.000Z"),
          published_at: new Date("2026-06-01T00:00:00.000Z"),
          withdrawn_at: null,
        },
      ],
      new Date("2026-08-26T00:00:00.000Z"),
    )

    expect(selected).toMatchObject({
      revision: 2,
      materialQuantityBaseUnits: 2000,
      materialBaseUnit: "microgram",
    })
  })

  it("rejects ambiguous equally current material profiles", () => {
    const base = {
      revision: 1,
      product_variant_id: "variant_1",
      material_quantity_base_units: 1000,
      material_base_unit: "microgram",
      display_unit: "mcg",
      base_units_per_display_unit: 1,
      display_precision: 0,
      status: "published" as const,
      evidence_scope: "sku" as const,
      effective_at: new Date("2026-01-01T00:00:00.000Z"),
      published_at: new Date("2026-01-01T00:00:00.000Z"),
      withdrawn_at: null,
    }

    expect(
      selectCurrentPublishedMaterialProfile(
        [
          { ...base, profile_key: "profile-a" },
          { ...base, profile_key: "profile-b" },
        ],
        new Date("2026-08-26T00:00:00.000Z"),
      ),
    ).toBeNull()
  })

  it("rejects a material profile with unsafe display-unit metadata", () => {
    expect(
      selectCurrentPublishedMaterialProfile(
        [
          {
            profile_key: "unsafe-iu",
            revision: 1,
            product_variant_id: "variant_1",
            material_quantity_base_units: 1000,
            material_base_unit: "piece",
            display_unit: "IU",
            base_units_per_display_unit: 1,
            display_precision: 0,
            status: "published",
            evidence_scope: "sku",
            effective_at: new Date("2026-01-01T00:00:00.000Z"),
            published_at: new Date("2026-01-01T00:00:00.000Z"),
            withdrawn_at: null,
          },
        ],
        new Date("2026-08-26T00:00:00.000Z"),
      ),
    ).toBeNull()
  })

  it("guards supply multiplication overflow", () => {
    expect(calculateInitialSupplyBaseUnits(2, 5000)).toBe(10000)
    expect(
      calculateInitialSupplyBaseUnits(Number.MAX_SAFE_INTEGER, 2),
    ).toBeNull()
  })

  it("creates a bounded customer-safe label snapshot", () => {
    expect(normalizeActivationLabel("  GHK-Cu\u0000 10 mg  ")).toBe(
      "GHK-Cu  10 mg",
    )
    expect(normalizeActivationLabel("x".repeat(250))).toHaveLength(200)
  })

  it("exposes only approved activation conflict reason codes", () => {
    expect(
      purchasedActivationConflictReason(
        new Error("material_profile_unavailable"),
      ),
    ).toBe("material_profile_unavailable")
    expect(purchasedActivationConflictReason(new Error("database detail"))).toBeNull()
    expect(purchasedActivationConflictReason("quantity_unavailable")).toBeNull()
  })
})
