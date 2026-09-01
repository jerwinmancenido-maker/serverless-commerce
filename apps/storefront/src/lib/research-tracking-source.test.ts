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

  assert.match(
    navigationSource,
    /researchTrackingAvailable[\s\S]*account\/research-hub/,
  )
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
  assert.match(
    journalSource,
    /name="attachment_id"[\s\S]*name="idempotency_key"/,
  )
  assert.match(journalSource, /disabled while this profile is closed/i)
  assert.match(actionSource, /retrieveResearchJournalEntries/)
  assert.match(actionSource, /retrieveResearchPrivateRecordsConfiguration/)
  assert.match(actionSource, /recordResearchJournalConsentAction/)
  assert.match(actionSource, /sdk\.client\.fetch/)
  assert.match(
    actionSource,
    /journal\/\$\{encodeURIComponent\(entryId\)\}\/attachments[\s\S]*"content-type": null/,
  )
  assert.match(actionSource, /cache: "no-store"/)
  assert.doesNotMatch(journalSource, /Journal privacy choice/)
  assert.doesNotMatch(accountSource, /Journal privacy choice/)
  assert.match(journalSource, /canMutate/)
  assert.doesNotMatch(journalSource, /useRotateConsumedKey\(consentState/)
  assert.match(journalSource, /Page \{currentPage\} of \{totalPages\}/)
  assert.doesNotMatch(
    journalSource,
    /localStorage|sessionStorage|indexedDB|document\.cookie|analytics/i,
  )
})

test("shows and preserves saved calculator attachments", () => {
  const calculatorSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/research-tracking/research-calculator.tsx",
    ),
    "utf8",
  )

  assert.match(calculatorSource, /defaultValue=\{item\.routine_id \|\| ""\}/)
  assert.match(
    calculatorSource,
    /defaultValue=\{item\.journal_entry_id \|\| ""\}/,
  )
  assert.match(calculatorSource, /Attached to/)
  assert.match(calculatorSource, /Calculation updated\./)
})

test("gives every Research Hub mutation a rotating submission key", () => {
  const componentNames = [
    "research-goals.tsx",
    "research-calculator.tsx",
    "reminder-preferences.tsx",
    "notification-inbox.tsx",
    "replenishment.tsx",
  ]

  for (const componentName of componentNames) {
    const source = readFileSync(
      join(
        sourceRoot,
        "src/modules/account/components/research-tracking",
        componentName,
      ),
      "utf8",
    )
    assert.match(source, /useResearchSubmissionKey/)
    assert.match(source, /name="idempotency_key"/)
  }
})

test("keeps agreement and privacy controls out of the working Research Hub", () => {
  const hubSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/research-tracking/index.tsx",
    ),
    "utf8",
  )
  const privacySource = readFileSync(
    join(
      sourceRoot,
      "src/app/[countryCode]/(main)/account/settings/privacy/page.tsx",
    ),
    "utf8",
  )
  const signupSource = readFileSync(
    join(sourceRoot, "src/modules/account/components/register/index.tsx"),
    "utf8",
  )

  assert.doesNotMatch(hubSource, /Journal privacy choice/)
  assert.match(privacySource, /PrivacyCard/)
  assert.match(privacySource, /Download my records/)
  assert.match(privacySource, /These controls do not affect rewards/)
  assert.match(signupSource, /agreement_accepted/)
  assert.match(signupSource, /marketing_opt_in/)
  assert.match(signupSource, /href=\{agreement\?\.terms_url/)
  assert.match(signupSource, /href=\{agreement\?\.privacy_url/)
  assert.match(signupSource, /href=\{agreement\?\.research_hub_url/)
  assert.doesNotMatch(signupSource, /LocalizedClientLink/)
})

test("uses task-oriented account navigation and an editable rewards destination", () => {
  const navigationSource = readFileSync(
    join(sourceRoot, "src/modules/account/components/account-nav/index.tsx"),
    "utf8",
  )
  const researchHubNavigationSource = readFileSync(
    join(
      sourceRoot,
      "src/modules/account/components/research-hub-nav/index.tsx",
    ),
    "utf8",
  )
  const rewardsSource = readFileSync(
    join(
      sourceRoot,
      "src/app/[countryCode]/(main)/account/rewards/page.tsx",
    ),
    "utf8",
  )

  for (const label of [
    "Home",
    "Research Hub",
    "Orders",
    "Rewards",
    "Profile & Settings",
  ]) {
    assert.match(navigationSource, new RegExp(label.replace("&", "&")))
  }
  assert.doesNotMatch(navigationSource, /href: "\/account\/addresses"/)
  assert.match(researchHubNavigationSource, /flex-wrap/)
  assert.match(researchHubNavigationSource, /small:flex-nowrap/)
  assert.match(rewardsSource, /Getting started/)
  assert.match(rewardsSource, /Points history/)
  assert.match(rewardsSource, /RewardsRedemption/)
})
