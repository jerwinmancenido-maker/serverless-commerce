import {
  getResearchTrackingCustomerConfiguration,
  getResearchTrackingPurchasedActivationConfiguration,
} from "../config"
import {
  StoreActivatePurchasedSupply,
  StoreCancelResearchDeletion,
  StoreCloseResearchProfile,
  StoreCreateResearchProfile,
  StoreRecordResearchConsent,
  StoreRequestResearchDeletion,
  StoreUpdateResearchPreferences,
} from "../../../api/store/customers/me/research-tracking/validators"
import { createResearchWorkflowContext } from "../../../api/store/customers/me/research-tracking/utils"
import { isResearchTrackingRequest } from "../../../api/middlewares"

const noticeSha256 = "a".repeat(64)

describe("research tracking customer API contract", () => {
  it("keeps customer access unavailable by default", () => {
    expect(getResearchTrackingCustomerConfiguration({})).toEqual({
      available: false,
      purchasedActivationAvailable: false,
      activeConsentVersion: null,
      noticeSha256: null,
      noticeUrl: null,
    })
  })

  it("validates an enabled customer configuration", () => {
    expect(
      getResearchTrackingCustomerConfiguration({
        RESEARCH_TRACKING_CUSTOMER_API_ENABLED: "true",
        RESEARCH_TRACKING_CONSENT_VERSION: "2026-08-25.v1",
        RESEARCH_TRACKING_NOTICE_SHA256: noticeSha256,
        RESEARCH_TRACKING_NOTICE_URL: "https://example.com/privacy/research",
      }),
    ).toEqual({
      available: true,
      purchasedActivationAvailable: false,
      activeConsentVersion: "2026-08-25.v1",
      noticeSha256,
      noticeUrl: "https://example.com/privacy/research",
    })
  })

  it("enables purchased activation only with a normalized channel allowlist", () => {
    expect(
      getResearchTrackingPurchasedActivationConfiguration({
        RESEARCH_TRACKING_ELIGIBLE_SALES_CHANNEL_IDS: " sc_1,sc_2,sc_1 ",
      }),
    ).toEqual({
      available: true,
      eligibleSalesChannelIds: ["sc_1", "sc_2"],
    })
  })

  it("rejects partial enabled configuration", () => {
    expect(() =>
      getResearchTrackingCustomerConfiguration({
        RESEARCH_TRACKING_CUSTOMER_API_ENABLED: "true",
      }),
    ).toThrow("enabled customer access requires")
  })

  it("accepts the documented mutation bodies", () => {
    expect(
      StoreCreateResearchProfile.safeParse({
        timezone: "Asia/Manila",
        locale: "en-PH",
        consent_version: "2026-08-25.v1",
        accepted: true,
      }).success,
    ).toBe(true)
    expect(
      StoreUpdateResearchPreferences.safeParse({ timezone: "Asia/Manila" })
        .success,
    ).toBe(true)
    expect(
      StoreRecordResearchConsent.safeParse({
        consent_version: "2026-08-25.v1",
        accepted: true,
      }).success,
    ).toBe(true)
    expect(
      StoreCloseResearchProfile.safeParse({ acknowledge_closure: true })
        .success,
    ).toBe(true)
    expect(
      StoreRequestResearchDeletion.safeParse({
        acknowledge_deletion_request: true,
      }).success,
    ).toBe(true)
    expect(
      StoreCancelResearchDeletion.safeParse({
        acknowledge_cancellation: true,
      }).success,
    ).toBe(true)
    expect(
      StoreActivatePurchasedSupply.safeParse({
        order_id: "order_1",
        line_item_id: "ordli_1",
      }).success,
    ).toBe(true)
  })

  it.each([
    [
      StoreCreateResearchProfile,
      {
        timezone: "Asia/Manila",
        locale: "en-PH",
        consent_version: "2026-08-25.v1",
        accepted: true,
        customer_id: "cus_other",
      },
    ],
    [StoreUpdateResearchPreferences, {}],
    [StoreRecordResearchConsent, { accepted: false }],
    [StoreCloseResearchProfile, { acknowledge_closure: false }],
    [
      StoreActivatePurchasedSupply,
      {
        order_id: "order_1",
        line_item_id: "ordli_1",
        customer_id: "cus_other",
      },
    ],
    [
      StoreRequestResearchDeletion,
      { acknowledge_deletion_request: true, profile_id: "rprof_other" },
    ],
  ])("rejects an invalid or ownership-bearing body", (schema, value) => {
    expect(schema.safeParse(value).success).toBe(false)
  })

  it("derives a stable workflow transaction id without exposing the raw key", () => {
    const first = createResearchWorkflowContext(
      "cus_test",
      "profile-create",
      "profile:create:1",
    )
    const replay = createResearchWorkflowContext(
      "cus_test",
      "profile-create",
      "profile:create:1",
    )

    expect(first).toEqual(replay)
    expect(first.transactionId).not.toContain("profile:create:1")
    expect(first.transactionId).not.toContain("cus_test")
  })

  it("separates workflow transactions when one key is reused for different input", () => {
    const first = createResearchWorkflowContext(
      "cus_test",
      "purchased-supply-activate",
      "activation:key:1",
      "a".repeat(64),
    )
    const conflict = createResearchWorkflowContext(
      "cus_test",
      "purchased-supply-activate",
      "activation:key:1",
      "b".repeat(64),
    )

    expect(first.transactionId).not.toBe(conflict.transactionId)
  })

  it("identifies research tracking errors even when the URL has a query", () => {
    expect(
      isResearchTrackingRequest({
        originalUrl:
          "/store/customers/me/research-tracking/profile?fields=id",
      } as never),
    ).toBe(true)
    expect(
      isResearchTrackingRequest({
        originalUrl: "/store/customers/me/orders",
      } as never),
    ).toBe(false)
  })
})
