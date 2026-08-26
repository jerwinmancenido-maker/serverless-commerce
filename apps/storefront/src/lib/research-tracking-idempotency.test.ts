import assert from "node:assert/strict"
import test from "node:test"

import {
  classifyResearchSubmissionFailure,
  createResearchSubmissionKey,
  createRoutineSubmissionKeys,
  createResearchSubmissionKeys,
  normalizeResearchSubmissionKey,
  RESEARCH_MUTATION_NAMES,
} from "./research-tracking-idempotency.ts"
import { researchTrackingQueryKeys } from "./research-tracking-query-keys.ts"

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

test("creates distinct keys for routine and occurrence mutations", () => {
  let sequence = 0
  const keys = createRoutineSubmissionKeys(
    ["routine-1", "routine-2"],
    ["occurrence-1"],
    ["log-1"],
    () => `key-${++sequence}`,
  )

  assert.equal(keys.create, "storefront:key-1")
  assert.equal(keys.updates["routine-1"], "storefront:key-2")
  assert.equal(keys.transitions["routine-1"], "storefront:key-4")
  assert.equal(keys.confirmations["occurrence-1"], "storefront:key-6")
  assert.equal(keys.logMutations["log-1"].revise, "storefront:key-7")
  assert.equal(keys.logMutations["log-1"].void, "storefront:key-8")
  assert.equal(keys.logMutations["log-1"].restore, "storefront:key-9")
  assert.equal(
    new Set([
      keys.logMutations["log-1"].revise,
      keys.logMutations["log-1"].void,
      keys.logMutations["log-1"].restore,
    ]).size,
    3,
  )
})

test("creates a fresh valid key for each client submission", () => {
  let sequence = 0

  assert.equal(
    createResearchSubmissionKey(() => `client-${++sequence}`),
    "storefront:client-1",
  )
  assert.equal(
    createResearchSubmissionKey(() => `client-${++sequence}`),
    "storefront:client-2",
  )
})

test("rotates only keys known to be terminally consumed", () => {
  assert.deepEqual(
    classifyResearchSubmissionFailure(
      "submission_key_consumed:insufficient_supply",
    ),
    {
      reason: "insufficient_supply",
      submissionKeyConsumed: true,
    },
  )
  assert.equal(
    classifyResearchSubmissionFailure("idempotency_key_conflict")
      .submissionKeyConsumed,
    true,
  )
  assert.equal(
    classifyResearchSubmissionFailure("previous_request_failed")
      .submissionKeyConsumed,
    true,
  )
  assert.equal(
    classifyResearchSubmissionFailure("request_in_progress")
      .submissionKeyConsumed,
    false,
  )
  assert.equal(
    classifyResearchSubmissionFailure("network_request_failed")
      .submissionKeyConsumed,
    false,
  )
})

test("scopes RT-5 query keys hierarchically to the current customer", () => {
  const customerRoot = ["research-tracking", "customer", "me"]

  assert.deepEqual(
    researchTrackingQueryKeys.routines.list.slice(0, customerRoot.length),
    customerRoot,
  )
  assert.deepEqual(
    researchTrackingQueryKeys.occurrences.list(
      "2026-08-26",
      "2026-09-01",
    ),
    [
      ...customerRoot,
      "occurrences",
      "list",
      "2026-08-26",
      "2026-09-01",
    ],
  )
  assert.deepEqual(researchTrackingQueryKeys.logs.detail("log-1"), [
    ...customerRoot,
    "logs",
    "detail",
    "log-1",
  ])
  assert.deepEqual(researchTrackingQueryKeys.supplies.detail("supply-1"), [
    ...customerRoot,
    "supplies",
    "detail",
    "supply-1",
  ])
})
