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
