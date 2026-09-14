/**
 * @file    apps/storefront/src/lib/line-item-thumbnail.test.ts
 * @module  LineItemThumbnailTest
 * @purpose Verifies line-item variant photography resolution across Cart, Checkout, and Orders.
 */

import assert from "node:assert/strict"
import test from "node:test"
import { HttpTypes } from "@medusajs/types"
import { getLineItemThumbnail } from "./util/get-line-item-thumbnail.ts"
import { resolveVariantImageIndex } from "./util/resolve-variant-image-index.ts"

test("getLineItemThumbnail prioritizes direct variant metadata image_urls", () => {
  const item = {
    thumbnail: "http://localhost:9000/static/catalog/retatrutide/slide1_hero.webp",
    product_handle: "retatrutide",
    variant_title: "15MG / Complete SubQ Set",
    variant: {
      metadata: {
        image_urls: [
          "http://localhost:9000/static/catalog/retatrutide/variant_complete_set.webp",
        ],
      },
    },
  }

  const result = getLineItemThumbnail(item)
  assert.equal(
    result,
    "http://localhost:9000/static/catalog/retatrutide/variant_complete_set.webp"
  )
})

test("getLineItemThumbnail prioritizes compounded_product image_urls", () => {
  const item = {
    thumbnail: "http://localhost:9000/static/catalog/bpc-157-vial/slide1_hero.webp",
    product_handle: "bpc-157-vial",
    variant_title: "10MG / Vial + BAC Water",
    variant: {
      metadata: {
        compounded_product: {
          image_urls: [
            "http://localhost:9000/static/catalog/bpc-157-vial/variant_vial_bac.webp",
          ],
        },
      },
    },
  }

  const result = getLineItemThumbnail(item)
  assert.equal(
    result,
    "http://localhost:9000/static/catalog/bpc-157-vial/variant_vial_bac.webp"
  )
})

test("getLineItemThumbnail falls back to title matching for Complete SubQ Set", () => {
  const item = {
    thumbnail: "http://localhost:9000/static/catalog/cagrisema-blend/slide1_hero.webp",
    product_handle: "cagrisema-blend",
    variant_title: "10mg / Complete SubQ Set",
  }

  const result = getLineItemThumbnail(item)
  assert.ok(result?.includes("/static/catalog/cagrisema-blend/variant_complete_set.webp"))
})

test("getLineItemThumbnail falls back to title matching for Vial + BAC Water", () => {
  const item = {
    thumbnail: "http://localhost:9000/static/catalog/retatrutide/slide1_hero.webp",
    product_handle: "retatrutide",
    variant_title: "15MG / Vial + BAC Water",
  }

  const result = getLineItemThumbnail(item)
  assert.ok(result?.includes("/static/catalog/retatrutide/variant_vial_bac.webp"))
})

test("getLineItemThumbnail falls back to title matching for Vial Only", () => {
  const item = {
    thumbnail: "http://localhost:9000/static/catalog/retatrutide/slide1_hero.webp",
    product_handle: "retatrutide",
    variant_title: "15MG / Vial Only",
  }

  const result = getLineItemThumbnail(item)
  assert.ok(result?.includes("/static/catalog/retatrutide/variant_vial.webp"))
})

test("getLineItemThumbnail safely handles missing variant title and returns item thumbnail", () => {
  const item = {
    thumbnail: "http://localhost:9000/static/catalog/retatrutide/slide1_hero.webp",
    product_handle: "retatrutide",
  }

  const result = getLineItemThumbnail(item)
  assert.equal(
    result,
    "http://localhost:9000/static/catalog/retatrutide/slide1_hero.webp"
  )
})

test("resolveVariantImageIndex correctly resolves image index for 15MG / Vial + BAC Water", () => {
  const images = [
    { url: "http://localhost:9000/static/catalog/retatrutide/slide1_hero.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/slide2_molecular.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/slide3_reconstitution.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/slide4_benefits.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/slide5_kit.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/slide6_superapp.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/variant_vial.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/variant_vial_bac.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/variant_complete_set.webp" },
  ] as unknown as HttpTypes.StoreProductImage[]

  const variant = {
    id: "variant_01M1RWY75P03C98XF7BZ23ZC5E",
    title: "15MG / Vial + BAC Water",
    options: [{ value: "15MG" }, { value: "Vial + BAC Water" }],
    metadata: {
      image_urls: ["http://localhost:9000/static/catalog/retatrutide/variant_vial_bac.webp"],
    },
  } as unknown as HttpTypes.StoreProductVariant

  const idx = resolveVariantImageIndex(variant, images)
  assert.equal(idx, 7, `Expected index 7 for variant_vial_bac.webp, got ${idx}`)
})

test("resolveVariantImageIndex resolves Complete SubQ Set to image index 8", () => {
  const images = [
    { url: "http://localhost:9000/static/catalog/retatrutide/slide1_hero.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/variant_vial.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/variant_vial_bac.webp" },
    { url: "http://localhost:9000/static/catalog/retatrutide/variant_complete_set.webp" },
  ] as unknown as HttpTypes.StoreProductImage[]

  const variant = {
    id: "var_subq",
    title: "20MG / Complete SubQ Set",
    options: [{ value: "20MG" }, { value: "Complete SubQ Set" }],
  } as unknown as HttpTypes.StoreProductVariant

  const idx = resolveVariantImageIndex(variant, images)
  assert.equal(idx, 3, `Expected index 3 for variant_complete_set.webp, got ${idx}`)
})

test("resolveVariantImageIndex falls back to 0 when no variant is provided", () => {
  const images = [
    { url: "http://localhost:9000/static/catalog/retatrutide/slide1_hero.webp" },
  ] as unknown as HttpTypes.StoreProductImage[]

  assert.equal(resolveVariantImageIndex(null, images), 0)
})
