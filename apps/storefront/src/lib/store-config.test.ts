import assert from "node:assert/strict"
import test from "node:test"

import { storeConfig } from "./store-config.ts"

test("PepStack store policy is represented without provider choices", () => {
  assert.equal(storeConfig.name, "PepStack Labs")
  assert.equal(storeConfig.tagline, "Precision in Every Molecule")
  assert.equal(storeConfig.countryCode, "ph")
  assert.equal(storeConfig.currencyCode, "php")
  assert.equal(storeConfig.customerAccountsRequired, true)
  assert.equal("paymentMethod" in storeConfig, false)
  assert.equal("shippingMethod" in storeConfig, false)
})

test("all required printable document types remain in the contract", () => {
  assert.deepEqual(storeConfig.printableDocumentTypes, [
    "receipt",
    "packing-list",
    "box-label",
    "bottle-label",
  ])
})
