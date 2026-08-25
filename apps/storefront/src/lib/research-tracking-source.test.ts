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
