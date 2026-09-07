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
  assert.equal(resolveProductHandle("epithalon"), "epithalon")
  assert.equal(resolveProductHandle("epithalon-10mg"), "epithalon")
  assert.equal(resolveProductHandle("bac-water"), "bacteriostatic-water")
  assert.equal(resolveProductHandle("bac-water-10ml"), "bacteriostatic-water")
  assert.equal(resolveProductHandle("bacteriostatic-water"), "bacteriostatic-water")
})

test("resolves Adamax shorthand aliases to canonical database handle", () => {
  assert.equal(resolveProductHandle("adamax"), "adamax-1032")
  assert.equal(resolveProductHandle("adamax-10mg"), "adamax-1032")
  assert.equal(resolveProductHandle("adamax1032"), "adamax-1032")
  assert.equal(resolveProductHandle("adamax-1032"), "adamax-1032")
})

test("resolves HMG, HGH, TB-500, and CJC shorthand aliases to database handles", () => {
  assert.equal(resolveProductHandle("hmg"), "hmg-75iu")
  assert.equal(resolveProductHandle("hmg-75"), "hmg-75iu")
  assert.equal(resolveProductHandle("hgh"), "hgh-somatropin")
  assert.equal(resolveProductHandle("somatropin"), "hgh-somatropin")
  assert.equal(resolveProductHandle("tb500"), "tb-500")
  assert.equal(resolveProductHandle("cjc-ipam"), "cjc-1295-ipamorelin")
  assert.equal(resolveProductHandle("pt141"), "pt-141")
  assert.equal(resolveProductHandle("ta1"), "thymosin-alpha-1")
  assert.equal(resolveProductHandle("nasemax"), "na-semax-amidate")
  assert.equal(resolveProductHandle("naselank"), "na-selank-amidate")
  assert.equal(resolveProductHandle("5-amino"), "5-amino-1mq")
  assert.equal(resolveProductHandle("aod9604"), "aod-9604")
  assert.equal(resolveProductHandle("motsc"), "mots-c")
})

test("maps internal database handles to clean canonical slugs", () => {
  assert.equal(
    getCanonicalProductSlug("ghk-cu-50mg"),
    "ghk-cu"
  )
  assert.equal(getCanonicalProductSlug("bpc-157-vial"), "bpc-157")
  assert.equal(getCanonicalProductSlug("tirzepatide"), "tirzepatide")
  assert.equal(getCanonicalProductSlug("ghk-cu"), "ghk-cu")
  assert.equal(getCanonicalProductSlug("adamax-1032"), "adamax-1032")
  assert.equal(getCanonicalProductSlug("hmg-75iu"), "hmg-75iu")
  assert.equal(getCanonicalProductSlug("hgh-somatropin"), "hgh-somatropin")
  assert.equal(getCanonicalProductSlug("tb-500"), "tb-500")
  assert.equal(getCanonicalProductSlug("epithalon"), "epithalon")
  assert.equal(getCanonicalProductSlug("bacteriostatic-water"), "bacteriostatic-water")
})

test("identifies canonical product slugs correctly", () => {
  assert.equal(isCanonicalProductSlug("ghk-cu"), true)
  assert.equal(isCanonicalProductSlug("bpc-157"), true)
  assert.equal(isCanonicalProductSlug("tirzepatide"), true)
  assert.equal(isCanonicalProductSlug("adamax-1032"), true)
  assert.equal(isCanonicalProductSlug("hmg-75iu"), true)
  assert.equal(isCanonicalProductSlug("tb-500"), true)
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
