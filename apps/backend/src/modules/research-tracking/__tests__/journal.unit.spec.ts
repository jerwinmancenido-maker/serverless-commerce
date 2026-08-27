import { MedusaError } from "@medusajs/framework/utils"

import {
  normalizeCreateResearchJournalInput,
  normalizeResearchJournalContent,
  normalizeReviseResearchJournalInput,
  normalizeTransitionResearchJournalInput,
} from "../contracts/journal"

const content = {
  title: "  Bench observation  ",
  note: "  Clear descriptive note.  ",
  localDate: "2026-08-28",
  localTime: "14:30",
  timezone: "Asia/Manila",
}

describe("RT-6 Journal contract", () => {
  it("normalizes bounded private journal content", () => {
    expect(normalizeResearchJournalContent(content)).toEqual({
      title: "Bench observation",
      note: "Clear descriptive note.",
      localDate: "2026-08-28",
      localTime: "14:30",
      timezone: "Asia/Manila",
      relations: {
        trackedMaterialId: null,
        supplyId: null,
        routineId: null,
        confirmedLogId: null,
      },
    })
  })

  it("rejects invalid dates, empty notes, and unconfirmed writes", () => {
    expect(() =>
      normalizeResearchJournalContent({ ...content, localDate: "2026-02-30" }),
    ).toThrow(MedusaError)
    expect(() =>
      normalizeResearchJournalContent({ ...content, note: "   " }),
    ).toThrow(MedusaError)
    expect(() =>
      normalizeCreateResearchJournalInput({
        ...content,
        customerId: "cus_test",
        activeConsentVersion: "2026-08-25.v1",
        confirmed: false,
        idempotencyKey: "journal-create-test",
      }),
    ).toThrow(MedusaError)
  })

  it("fingerprints normalized create and revision requests deterministically", () => {
    const create = normalizeCreateResearchJournalInput({
      ...content,
      customerId: "cus_test",
      activeConsentVersion: "2026-08-25.v1",
      confirmed: true,
      idempotencyKey: "journal-create-test",
    })
    const revision = normalizeReviseResearchJournalInput({
      ...content,
      customerId: "cus_test",
      activeConsentVersion: "2026-08-25.v1",
      journalEntryId: "rjournal_test",
      expectedRevisionId: "rjournalrev_test",
      confirmed: true,
      idempotencyKey: "journal-revise-test",
    })

    expect(create.requestFingerprintSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(revision.requestFingerprintSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(create.requestFingerprintSha256).not.toBe(
      revision.requestFingerprintSha256,
    )
  })

  it("binds transitions to the entry and expected revision", () => {
    const first = normalizeTransitionResearchJournalInput({
      customerId: "cus_test",
      activeConsentVersion: "2026-08-25.v1",
      journalEntryId: "rjournal_test",
      expectedRevisionId: "rjournalrev_1",
      operation: "void",
      confirmed: true,
      idempotencyKey: "journal-void-test",
    })
    const second = normalizeTransitionResearchJournalInput({
      customerId: "cus_test",
      activeConsentVersion: "2026-08-25.v1",
      journalEntryId: "rjournal_test",
      expectedRevisionId: "rjournalrev_2",
      operation: "void",
      confirmed: true,
      idempotencyKey: "journal-void-test-2",
    })

    expect(first.requestFingerprintSha256).not.toBe(
      second.requestFingerprintSha256,
    )
  })
})
