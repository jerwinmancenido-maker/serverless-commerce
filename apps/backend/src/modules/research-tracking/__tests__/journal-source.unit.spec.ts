import { readFileSync } from "node:fs"
import path from "node:path"

const backendRoot = path.resolve(__dirname, "../../../..")

function source(relativePath: string): string {
  return readFileSync(path.join(backendRoot, relativePath), "utf8")
}

describe("RT-6 Journal source-only architecture", () => {
  it("registers journal models in the Research Tracking module", () => {
    const service = source("src/modules/research-tracking/service.ts")
    const profile = source(
      "src/modules/research-tracking/models/research-profile.ts",
    )

    expect(service).toContain("ResearchJournalEntry")
    expect(service).toContain("ResearchJournalEntryRevision")
    expect(service).toContain("ResearchJournalMutation")
    expect(service).toContain("ResearchJournalConsentEvent")
    expect(profile).toContain("journal_entries")
    expect(profile).toContain("journal_consent_events")
  })

  it("requires purpose-specific Journal consent inside the mutation step", () => {
    const step = source(
      "src/workflows/steps/manage-research-journal-entry.ts",
    )
    const query = source("src/modules/research-tracking/queries/journal.ts")
    const configuration = source("src/modules/research-tracking/config.ts")

    expect(step).toContain("activeJournalConsentVersion")
    expect(step).toContain("activeJournalNoticeSha256")
    expect(query).toContain("research_journal_consent_required")
    expect(query).toContain("consent.notice_sha256")
    expect(query).toContain('occurred_at: "DESC", id: "DESC"')
    expect(query).toContain("is_current:")
    expect(query).toContain("event.notice_sha256 === input.activeNoticeSha256")
    expect(configuration).toContain("RESEARCH_TRACKING_JOURNAL_ENABLED")
  })

  it("serializes purpose-specific consent transitions per customer", () => {
    const workflow = source("src/workflows/record-research-journal-consent.ts")
    const step = source(
      "src/workflows/steps/record-research-journal-consent.ts",
    )

    expect(workflow).toContain("research-journal-consent-state")
    expect(workflow).toContain("acquire-journal-consent-state-lock")
    expect(step).toContain("latestOccurredAt + 1")
  })

  it("keeps all Journal writes behind a workflow and durable mutation record", () => {
    const workflow = source("src/workflows/manage-research-journal-entry.ts")
    const step = source(
      "src/workflows/steps/manage-research-journal-entry.ts",
    )
    const mutation = source(
      "src/workflows/steps/research-journal-mutation.ts",
    )

    expect(workflow).toContain("acquireLockStep")
    expect(step).toContain("beginJournalMutationOrReplay")
    expect(step).toContain("validateOwnedJournalRelations")
    expect(mutation).toContain("idempotency_key_conflict")
    expect(mutation).toContain("submission_key_consumed:")
  })

  it("uses authenticated customer routes with private no-store handling", () => {
    const route = source(
      "src/api/store/customers/me/research-tracking/journal/route.ts",
    )
    const detailRoute = source(
      "src/api/store/customers/me/research-tracking/journal/[id]/route.ts",
    )
    const middleware = source(
      "src/api/store/customers/me/research-tracking/middlewares.ts",
    )

    expect(route).toContain("AuthenticatedMedusaRequest")
    expect(route).toContain("req.auth_context.actor_id")
    expect(route).toContain("setResearchPrivateNoStore")
    expect(detailRoute).toContain("retrieveOwnedResearchJournalProjection")
    expect(middleware).toContain("journal/:id/revise")
    expect(middleware).toContain("journal/:id/void")
    expect(middleware).toContain("journal/:id/restore")
  })

  it("does not introduce Measurements collection source", () => {
    const service = source("src/modules/research-tracking/service.ts")
    const middleware = source(
      "src/api/store/customers/me/research-tracking/middlewares.ts",
    )

    expect(service).not.toMatch(/ResearchMeasurement/)
    expect(middleware).not.toMatch(/research-tracking\/measurements/)
  })
})
