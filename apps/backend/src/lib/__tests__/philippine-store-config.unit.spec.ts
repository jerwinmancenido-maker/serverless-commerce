import {
  mergeProviderIds,
  PHILIPPINE_STORE_CONFIG,
  resolveJntShippingConfiguration,
  selectPreferredRecord,
} from "../philippine-store-config"

describe("Philippine store configuration", () => {
  it("uses merchant-facing Philippine defaults", () => {
    expect(PHILIPPINE_STORE_CONFIG).toMatchObject({
      countryCode: "ph",
      currencyCode: "php",
      regionName: "Philippines",
      storeName: "Research Compounds",
      salesChannelName: "Online Store",
      stockLocationName: "Philippine Warehouse",
      shippingOptionName: "J&T Express",
    })
  })

  it("keeps J&T disabled until the merchant supplies a rate", () => {
    expect(resolveJntShippingConfiguration(undefined)).toEqual({
      amount: 0,
      enabledInStore: false,
    })

    expect(resolveJntShippingConfiguration("175")).toEqual({
      amount: 175,
      enabledInStore: true,
    })
  })

  it("rejects invalid J&T rates instead of guessing", () => {
    expect(() => resolveJntShippingConfiguration("not-a-number")).toThrow(
      "JNT_DEFAULT_SHIPPING_AMOUNT"
    )
    expect(() => resolveJntShippingConfiguration("-1")).toThrow(
      "JNT_DEFAULT_SHIPPING_AMOUNT"
    )
  })

  it("keeps both system and manual QR payment providers without duplicates", () => {
    expect(
      mergeProviderIds(
        [PHILIPPINE_STORE_CONFIG.systemPaymentProviderId],
        [
          PHILIPPINE_STORE_CONFIG.systemPaymentProviderId,
          PHILIPPINE_STORE_CONFIG.manualQrPaymentProviderId,
        ]
      )
    ).toEqual([
      PHILIPPINE_STORE_CONFIG.systemPaymentProviderId,
      PHILIPPINE_STORE_CONFIG.manualQrPaymentProviderId,
    ])
  })

  it("prefers the configured record and falls back through legacy names", () => {
    const records = [
      { id: "first", name: "Unrelated" },
      { id: "legacy", name: "European Warehouse" },
      { id: "preferred", name: "Philippine Warehouse" },
    ]

    expect(
      selectPreferredRecord(records, "Philippine Warehouse", [
        "European Warehouse",
      ])?.id
    ).toBe("preferred")

    expect(
      selectPreferredRecord(records.slice(0, 2), "Philippine Warehouse", [
        "European Warehouse",
      ])?.id
    ).toBe("legacy")
  })
})
