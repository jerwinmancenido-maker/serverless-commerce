import {
  shouldRedirectCustomerCreate,
  shouldRedirectInventoryCreate,
  shouldRedirectPriceListCreate,
  shouldRedirectPromotionCreate,
  shouldRedirectCampaignCreate,
} from "../../lib/studio-redirect-routes"

describe("Admin Studio Redirect Routes", () => {
  describe("shouldRedirectCustomerCreate", () => {
    it.each([
      "/customers/create",
      "/customers/create/",
      "/app/customers/create",
      "/app/customers/create/",
    ])("redirects native customer create route %s", (pathname) => {
      expect(shouldRedirectCustomerCreate(pathname)).toBe(true)
    })

    it("bypasses redirect when view=raw_modal is present in search", () => {
      expect(shouldRedirectCustomerCreate("/app/customers/create", "?view=raw_modal")).toBe(false)
    })

    it("allows redirect when unrelated query parameters are present", () => {
      expect(shouldRedirectCustomerCreate("/app/customers/create", "?tab=overview")).toBe(true)
    })

    it.each([
      "/customers",
      "/app/customers",
      "/app/customers/cus_123",
      "/app/orders/create",
    ])("does not redirect unrelated route %s", (pathname) => {
      expect(shouldRedirectCustomerCreate(pathname)).toBe(false)
    })
  })

  describe("shouldRedirectInventoryCreate", () => {
    it.each([
      "/inventory/create",
      "/inventory/create/",
      "/app/inventory/create",
      "/app/inventory/create/",
    ])("redirects native inventory create route %s", (pathname) => {
      expect(shouldRedirectInventoryCreate(pathname)).toBe(true)
    })

    it("bypasses redirect when view=raw_modal is present", () => {
      expect(shouldRedirectInventoryCreate("/app/inventory/create", "?view=raw_modal")).toBe(false)
    })

    it.each([
      "/inventory",
      "/app/inventory",
      "/app/inventory/item_123",
    ])("does not redirect unrelated route %s", (pathname) => {
      expect(shouldRedirectInventoryCreate(pathname)).toBe(false)
    })
  })

  describe("shouldRedirectPriceListCreate", () => {
    it.each([
      "/price-lists/create",
      "/price-lists/create/",
      "/app/price-lists/create",
      "/app/price-lists/create/",
    ])("redirects native price-list create route %s", (pathname) => {
      expect(shouldRedirectPriceListCreate(pathname)).toBe(true)
    })

    it("bypasses redirect when view=raw_modal is present", () => {
      expect(shouldRedirectPriceListCreate("/app/price-lists/create", "?view=raw_modal")).toBe(false)
    })

    it.each([
      "/price-lists",
      "/app/price-lists",
      "/app/price-lists/pl_123",
    ])("does not redirect unrelated route %s", (pathname) => {
      expect(shouldRedirectPriceListCreate(pathname)).toBe(false)
    })
  })

  describe("shouldRedirectPromotionCreate", () => {
    it.each([
      "/promotions/create",
      "/promotions/create/",
      "/app/promotions/create",
      "/app/promotions/create/",
    ])("redirects native promotion create route %s", (pathname) => {
      expect(shouldRedirectPromotionCreate(pathname)).toBe(true)
    })

    it("bypasses redirect when view=raw_modal is present", () => {
      expect(shouldRedirectPromotionCreate("/app/promotions/create", "?view=raw_modal")).toBe(false)
    })

    it.each([
      "/promotions",
      "/app/promotions",
      "/app/promotions/promo_123",
    ])("does not redirect unrelated route %s", (pathname) => {
      expect(shouldRedirectPromotionCreate(pathname)).toBe(false)
    })
  })

  describe("shouldRedirectCampaignCreate", () => {
    it.each([
      "/campaigns/create",
      "/campaigns/create/",
      "/app/campaigns/create",
      "/app/campaigns/create/",
    ])("redirects native campaign create route %s", (pathname) => {
      expect(shouldRedirectCampaignCreate(pathname)).toBe(true)
    })

    it("bypasses redirect when view=raw_modal is present", () => {
      expect(shouldRedirectCampaignCreate("/app/campaigns/create", "?view=raw_modal")).toBe(false)
    })

    it.each([
      "/campaigns",
      "/app/campaigns",
      "/app/campaigns/camp_123",
    ])("does not redirect unrelated route %s", (pathname) => {
      expect(shouldRedirectCampaignCreate(pathname)).toBe(false)
    })
  })
})
