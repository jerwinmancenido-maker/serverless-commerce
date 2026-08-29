import { MedusaError } from "@medusajs/framework/utils"

import { normalizeJournalRevisionConflict } from "../research-journal-mutation"

describe("normalizeJournalRevisionConflict", () => {
  it("maps a concurrent journal revision uniqueness collision to conflict", () => {
    const normalized = normalizeJournalRevisionConflict(
      new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Research journal entry revision with journal_entry_id: rjournal_01, revision_number: 2, already exists.",
      ),
    )

    expect(normalized).toBeInstanceOf(MedusaError)
    expect((normalized as MedusaError).type).toBe(MedusaError.Types.CONFLICT)
    expect((normalized as MedusaError).message).toBe(
      "research_journal_changed",
    )
  })

  it("preserves unrelated Medusa validation errors", () => {
    const error = new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "journal title is invalid",
    )

    expect(normalizeJournalRevisionConflict(error)).toBe(error)
  })

  it("preserves non-Medusa errors", () => {
    const error = new Error("database unavailable")

    expect(normalizeJournalRevisionConflict(error)).toBe(error)
  })
})
