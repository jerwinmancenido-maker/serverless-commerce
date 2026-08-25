import assert from "node:assert/strict"
import test from "node:test"

import {
  createResearchSubmissionKeys,
  normalizeResearchSubmissionKey,
  RESEARCH_MUTATION_NAMES,
} from "./research-tracking-idempotency.ts"

test("creates one distinct stable key for every research mutation form", () => {
  let sequence = 0
  const keys = createResearchSubmissionKeys(() => `key-${++sequence}`)
  const values = Object.values(keys)

  assert.deepEqual(Object.keys(keys), [...RESEARCH_MUTATION_NAMES])
  assert.equal(new Set(values).size, RESEARCH_MUTATION_NAMES.length)
  assert.equal(keys.profileCreate, "storefront:key-1")
})

test("rejects missing and malformed research mutation keys", () => {
  assert.throws(() => normalizeResearchSubmissionKey(null))
  assert.throws(() => normalizeResearchSubmissionKey("short"))
  assert.throws(() => normalizeResearchSubmissionKey("contains spaces"))
})
