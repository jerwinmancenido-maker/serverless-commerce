import assert from "node:assert/strict"
import test from "node:test"

import { storeConfig } from "./store-config.ts"

test("Research Compounds store policy is represented without provider choices", () => {
  assert.equal(storeConfig.name, "Research Compounds")
  assert.equal("tagline" in storeConfig, false)
  assert.equal(storeConfig.countryCode, "ph")
  assert.equal(storeConfig.currencyCode, "php")
  assert.equal(storeConfig.customerAccountsRequired, true)
  assert.equal(storeConfig.address.addressLine2Label, "Barangay / Subdivision")
  assert.equal(storeConfig.address.cityLabel, "City / Municipality")
  assert.equal(storeConfig.address.postalCodePattern, "[0-9]{4}")
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
