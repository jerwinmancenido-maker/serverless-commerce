import { researchGoalProgress } from "../queries/goals"

describe("Research Hub goal progress", () => {
  it("reports a confirmed-activity streak without requiring a streak goal", async () => {
    const service = {
      listResearchPersonalGoals: jest.fn().mockResolvedValue([]),
      listResearchRoutineLogs: jest.fn().mockResolvedValue([
        { current_revision_id: "revision_1" },
      ]),
      listResearchRoutineLogRevisions: jest.fn().mockResolvedValue([
        { id: "revision_1", local_date: new Date("2026-09-01T00:00:00.000Z") },
      ]),
      listResearchJournalEntries: jest.fn().mockResolvedValue([]),
      listResearchJournalEntryRevisions: jest.fn().mockResolvedValue([]),
      listResearchMeasurementEntries: jest.fn().mockResolvedValue([]),
      listResearchMeasurementRevisions: jest.fn().mockResolvedValue([]),
    }

    const result = await researchGoalProgress(
      service as never,
      "profile_1",
      "2026-09-01",
    )

    expect(result.progress).toEqual([])
    expect(result.routineStreak).toBe(1)
  })
})
