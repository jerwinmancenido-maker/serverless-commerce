import assert from "node:assert/strict"
import test from "node:test"
import {
  COA_DOCUMENTS,
  listCoaDocuments,
  retrieveCoaDocument,
} from "./data/compound-coa-documents.ts"

test("returns all registered CoA documents", () => {
  const docs = listCoaDocuments()
  assert.equal(Array.isArray(docs), true)
  assert.equal(docs.length >= 3, true)
  const ids = docs.map((d) => d.id)
  assert.equal(ids.includes("ghk-cu-2026b"), true)
  assert.equal(ids.includes("bpc-157-2026-03"), true)
  assert.equal(ids.includes("tirzepatide-2026-01"), true)
})

test("retrieves document by exact ID", () => {
  const ghk = retrieveCoaDocument("ghk-cu-2026b")
  assert.notEqual(ghk, null)
  assert.equal(ghk?.lotNumber, "PH8-GHK-2026B")
  assert.equal(ghk?.purityDisplay, "≥99.34% HPLC")
  assert.equal(ghk?.fileUrl, "/coa/ghk-cu-coa.svg")
})

test("retrieves document by lot number case-insensitively", () => {
  const bpc = retrieveCoaDocument("bpc-2026-03")
  assert.notEqual(bpc, null)
  assert.equal(bpc?.compoundName.includes("BPC-157"), true)
})

test("retrieves document by compound name match", () => {
  const tirz = retrieveCoaDocument("tirzepatide")
  assert.notEqual(tirz, null)
  assert.equal(tirz?.id, "tirzepatide-2026-01")
})

test("returns null when document is not found", () => {
  assert.equal(retrieveCoaDocument("non-existent-peptide"), null)
  assert.equal(retrieveCoaDocument(""), null)
})
