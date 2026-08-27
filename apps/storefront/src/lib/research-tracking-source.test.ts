import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const sourceRoot = process.cwd()

test("gates Research & Tracking navigation on server activation", () => {
  const navigationSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/account-nav/index.tsx",
    ),
    "utf8",
  )
  const pageSource = readFileSync(
    join(
      sourceRoot,
      "src/app/[countryCode]/(main)/account/research-tracking/page.tsx",
    ),
    "utf8",
  )

  assert.match(navigationSource, /researchTrackingAvailable &&/)
  assert.match(pageSource, /!configuration\.available[\s\S]*notFound\(\)/)
})

test("does not render a cached customer after authentication is cleared", () => {
  const customerSource = readFileSync(
    join(sourceRoot, "src/lib/data/customer.ts"),
    "utf8",
  )

  assert.match(customerSource, /if \(!\("authorization" in authHeaders\)\) return null/)
  assert.match(customerSource, /cache: "no-store"/)
  assert.doesNotMatch(customerSource, /getCacheOptions\("customers"\)/)
})

test("does not infer database or collection state from runtime errors", () => {
  const componentSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/research-tracking/index.tsx",
    ),
    "utf8",
  )

  assert.doesNotMatch(componentSource, /database activation pending/i)
  assert.doesNotMatch(componentSource, /no private tracking data is being collected/i)
  assert.match(componentSource, /could not verify your current/i)
})

test("passes form-owned idempotency keys to research server actions", () => {
  const actionSource = readFileSync(
    join(sourceRoot, "src/lib/data/research-tracking.ts"),
    "utf8",
  )

  assert.match(actionSource, /formData\.get\("idempotency_key"\)/)
  assert.doesNotMatch(actionSource, /randomUUID/)
})

test("rotates consumed RT-5 submission keys and provisions refreshed entities", () => {
  const componentSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/research-tracking/personal-routines.tsx",
    ),
    "utf8",
  )

  assert.match(componentSource, /useRotatingSubmissionKey/)
  assert.match(componentSource, /initialKey \?\? createClientSubmissionKey\(\)/)
  assert.match(componentSource, /state\.submissionKeyConsumed/)
  assert.match(
    componentSource,
    /onSubmissionKeyConsumedRef\.current\?\.\(\)/,
  )
  assert.match(componentSource, /rotateOperationKey\("revise"\)/)
  assert.match(componentSource, /rotateOperationKey\("void"\)/)
  assert.match(componentSource, /rotateOperationKey\("restore"\)/)
})

test("keeps RT-5 routines and logs visible while removing read-only mutations", () => {
  const componentSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/research-tracking/personal-routines.tsx",
    ),
    "utf8",
  )

  assert.doesNotMatch(componentSource, /if \(!canMutate\)[\s\S]*return/)
  assert.match(componentSource, /Personal routines and records are read-only/)
  assert.match(componentSource, /canMutate && \([\s\S]*<CreateRoutineCard/)
  assert.match(componentSource, /canMutate=\{canMutate\}/)
  assert.match(
    componentSource,
    /canMutate && routine\.status === "active"/,
  )
  assert.match(componentSource, /canMutate && \(log\.status === "confirmed"/)
})

test("keeps RT-4 purchased activation explicit, private, and SDK-backed", () => {
  const actionSource = readFileSync(
    join(sourceRoot, "src/lib/data/research-tracking.ts"),
    "utf8",
  )
  const componentSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/research-tracking/products-and-supplies.tsx",
    ),
    "utf8",
  )

  assert.match(actionSource, /sdk\.client\.fetch/)
  assert.match(actionSource, /cache: "no-store"/)
  assert.doesNotMatch(actionSource, /JSON\.stringify/)
  assert.match(actionSource, /purchasedActivationConflictMessages/)
  assert.match(actionSource, /idempotency_key_conflict/)
  assert.match(componentSource, /Review private tracking details/)
  assert.match(componentSource, /name="confirm_tracking"/)
  assert.match(componentSource, /Purchases are\s+never added automatically/)
  assert.doesNotMatch(componentSource, /dose|dosing|inject|administration route/i)
})

test("keeps the Journal authenticated, private, SDK-backed, and revisioned", () => {
  const journalSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/research-tracking/journal.tsx",
    ),
    "utf8",
  )
  const accountSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/research-tracking/index.tsx",
    ),
    "utf8",
  )

  const actionSource = readFileSync(
    join(sourceRoot, "src/lib/data/research-tracking.ts"),
    "utf8",
  )

  assert.match(accountSource, /<Journal/)
  assert.doesNotMatch(accountSource, /\["Journal",/)
  assert.match(journalSource, /name="expected_revision_id"/)
  assert.match(journalSource, /name="confirmed"/)
  assert.match(journalSource, /disabled while this profile is closed/i)
  assert.match(actionSource, /retrieveResearchJournalEntries/)
  assert.match(actionSource, /sdk\.client\.fetch/)
  assert.match(actionSource, /cache: "no-store"/)
  assert.doesNotMatch(
    journalSource,
    /localStorage|sessionStorage|indexedDB|document\.cookie|analytics/i,
  )
})
