import assert from "node:assert/strict"
import test from "node:test"
import {
  resolveProductHandle,
  getCanonicalProductSlug,
  isCanonicalProductSlug,
} from "./util/product-handles.ts"

test("resolves GHK-Cu aliases to internal database handle", () => {
  assert.equal(
    resolveProductHandle("ghk-cu"),
    "ghk-cu"
  )
  assert.equal(
    resolveProductHandle("GHK-CU"),
    "ghk-cu"
  )
  assert.equal(
    resolveProductHandle("ghk-cu-50mg"),
    "ghk-cu"
  )
})

test("resolves BPC-157 aliases to internal database handle", () => {
  assert.equal(resolveProductHandle("bpc-157"), "bpc-157-vial")
  assert.equal(resolveProductHandle("bpc157"), "bpc-157-vial")
  assert.equal(resolveProductHandle("bpc-157-vial"), "bpc-157-vial")
})

test("resolves chemical aliases for Glutathione, NAD+, Epithalon, and Bac Water", () => {
  assert.equal(resolveProductHandle("glutathione"), "glutathione-1500mg")
  assert.equal(resolveProductHandle("glutathione-vial"), "glutathione-1500mg")
  assert.equal(resolveProductHandle("nad"), "nad-plus-500mg")
  assert.equal(resolveProductHandle("nad-plus"), "nad-plus-500mg")
  assert.equal(resolveProductHandle("epithalon"), "epithalon-10mg")
  assert.equal(resolveProductHandle("bac-water"), "bacteriostatic-water-10ml")
})

test("maps internal database handles to clean canonical slugs", () => {
  assert.equal(
    getCanonicalProductSlug("ghk-cu-50mg"),
    "ghk-cu"
  )
  assert.equal(getCanonicalProductSlug("bpc-157-vial"), "bpc-157")
  assert.equal(getCanonicalProductSlug("tirzepatide"), "tirzepatide")
  assert.equal(getCanonicalProductSlug("ghk-cu"), "ghk-cu")
})

test("identifies canonical product slugs correctly", () => {
  assert.equal(isCanonicalProductSlug("ghk-cu"), true)
  assert.equal(isCanonicalProductSlug("bpc-157"), true)
  assert.equal(isCanonicalProductSlug("tirzepatide"), true)
  assert.equal(
    isCanonicalProductSlug("ghk-cu-50mg"),
    false
  )
  assert.equal(isCanonicalProductSlug("bpc-157-vial"), false)
})

test("safely handles empty or unknown handles without errors", () => {
  assert.equal(resolveProductHandle(""), "")
  assert.equal(getCanonicalProductSlug(""), "")
  assert.equal(isCanonicalProductSlug(""), false)
  assert.equal(resolveProductHandle("unknown-compound"), "unknown-compound")
  assert.equal(getCanonicalProductSlug("unknown-compound"), "unknown-compound")
})
