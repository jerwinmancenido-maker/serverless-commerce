import {
  createCompoundedProductCreationReview,
  suggestCompoundedProductHandle,
} from "../creation-review"

const policy = {
  require_price: true,
  require_sales_channel: true,
  require_bom_for_managed_inventory: true,
}

describe("compounded-product creation review", () => {
  it("suggests an editable Medusa handle from the product identity", () => {
    expect(suggestCompoundedProductHandle("5-Amino-1MQ  Nasal")).toBe(
      "5-amino-1mq-nasal",
    )
    expect(suggestCompoundedProductHandle("  GHK-Cu®  ")).toBe("ghk-cu")
  })

  it("separates draft-save blockers from publication follow-up", () => {
    const review = createCompoundedProductCreationReview({
      title: "",
      shippingProfileId: "",
      rows: [{ key: "one" }, { key: "two" }],
      drafts: {
        one: {
          sku: "",
          priceAmount: "",
          currencyCode: "",
          imageUrls: [],
          manageInventory: true,
          allowBackorder: false,
          configuredValues: {},
        },
        two: {
          sku: "SECOND",
          priceAmount: "1000",
          currencyCode: "php",
          imageUrls: [],
          manageInventory: false,
          allowBackorder: false,
          configuredValues: {},
        },
      },
      policy,
      salesChannelCount: 0,
      largeMatrixRequiresConfirmation: true,
      largeMatrixConfirmed: false,
    })

    expect(review).toEqual({
      missingSkuCount: 1,
      missingPriceCount: 1,
      managedVariantCount: 1,
      draftSaveBlockers: [
        "Product title is required",
        "Shipping profile is required",
        "1 variant needs a SKU",
        "The current large variant matrix needs confirmation",
      ],
      publicationReviewItems: [
        "1 variant has no price",
        "No sales channel is selected",
        "1 managed-inventory variant requires a reviewed BOM recipe after draft creation",
      ],
    })
  })

  it("reports a draft as saveable without overstating publication readiness", () => {
    const review = createCompoundedProductCreationReview({
      title: "Configured compound",
      shippingProfileId: "sp_default",
      rows: [{ key: "one" }],
      drafts: {
        one: {
          sku: "CONFIGURED-ONE",
          priceAmount: "1250",
          currencyCode: "php",
          imageUrls: [],
          manageInventory: false,
          allowBackorder: false,
          configuredValues: {},
        },
      },
      policy,
      salesChannelCount: 1,
      largeMatrixRequiresConfirmation: false,
      largeMatrixConfirmed: false,
    })

    expect(review.draftSaveBlockers).toEqual([])
    expect(review.publicationReviewItems).toEqual([])
    expect(review.managedVariantCount).toBe(0)
  })
})
