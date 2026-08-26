import { MedusaError } from "@medusajs/framework/utils"

import {
  assertResearchRoutineLogConfirmationPreviewToken,
  assertResearchRoutineLogMutationPreviewToken,
  createOccurrenceId,
  createResearchRoutineLogConfirmationPreviewToken,
  createResearchRoutineLogMutationPreviewToken,
  normalizeResearchRoutineInput,
  projectResearchOccurrences,
  validateOccurrenceRange,
} from "../contracts/personal-routines"
import {
  consumedRoutineMutationError,
  ROUTINE_MUTATION_KEY_CONSUMED_PREFIX,
} from "../../../workflows/steps/research-routine-mutation"

const baseInput = {
  customerId: "cus_test",
  activeConsentVersion: "2026-08-25.v1",
  trackedMaterialId: "rmat_test",
  label: "Morning research record",
  plannedQuantityBaseUnits: 250,
  baseUnit: "microgram" as const,
  localTime: "08:30",
  timezone: "Asia/Manila",
  startDate: "2026-08-26",
  endDate: null,
  effectiveFromDate: "2026-08-26",
  idempotencyKey: "routine:test-key",
}

describe("RT-5 personal routine contract", () => {
  const previousJwtSecret = process.env.JWT_SECRET

  beforeAll(() => {
    process.env.JWT_SECRET = "rt5-source-test-secret"
  })

  afterAll(() => {
    if (previousJwtSecret === undefined) {
      delete process.env.JWT_SECRET
    } else {
      process.env.JWT_SECRET = previousJwtSecret
    }
  })

  it("normalizes a bounded daily recurrence", () => {
    const normalized = normalizeResearchRoutineInput({
      ...baseInput,
      recurrenceType: "daily",
      dailyInterval: 2,
    })

    expect(normalized.schedule).toMatchObject({
      recurrence_type: "daily",
      daily_interval: 2,
      weekly_interval: null,
      weekdays: [],
      timezone: "Asia/Manila",
    })
    expect(normalized.requestFingerprintSha256).toMatch(/^[a-f0-9]{64}$/)
  })

  it("marks a durably failed mutation key as consumed", () => {
    const error = consumedRoutineMutationError(
      new MedusaError(MedusaError.Types.CONFLICT, "insufficient_supply"),
    )

    expect(error.type).toBe(MedusaError.Types.CONFLICT)
    expect(error.message).toBe(
      `${ROUTINE_MUTATION_KEY_CONSUMED_PREFIX}insufficient_supply`,
    )
  })

  it("canonicalizes weekly weekdays before fingerprinting", () => {
    const first = normalizeResearchRoutineInput({
      ...baseInput,
      recurrenceType: "weekly",
      weeklyInterval: 2,
      weekdays: [5, 1, 5],
    })
    const second = normalizeResearchRoutineInput({
      ...baseInput,
      recurrenceType: "weekly",
      weeklyInterval: 2,
      weekdays: [1, 5],
    })

    expect(first.schedule.weekdays).toEqual([1, 5])
    expect(first.requestFingerprintSha256).toBe(second.requestFingerprintSha256)
  })

  it("rejects unsupported unbounded recurrence", () => {
    expect(() =>
      normalizeResearchRoutineInput({
        ...baseInput,
        recurrenceType: "daily",
        dailyInterval: 31,
      }),
    ).toThrow(MedusaError)
  })

  it("projects deterministic occurrence identities without persistence", () => {
    const revision = {
      id: "rrrev_test",
      routine_id: "rroutine_test",
      label: "Morning research record",
      planned_quantity_base_units: 250,
      base_unit: "microgram" as const,
      recurrence_type: "daily" as const,
      daily_interval: 2,
      weekly_interval: null,
      weekdays: [],
      local_time: "08:30",
      start_date: "2026-08-26",
      end_date: null,
      effective_from_date: "2026-08-26",
      timezone: "Asia/Manila",
    }
    const projected = projectResearchOccurrences({
      revision,
      from: "2026-08-26",
      to: "2026-08-30",
    })

    expect(projected.map((item) => item.local_date)).toEqual([
      "2026-08-26",
      "2026-08-28",
      "2026-08-30",
    ])
    expect(projected[0].occurrence_id).toBe(
      createOccurrenceId("rrrev_test", "2026-08-26", "08:30"),
    )
  })

  it("rejects occurrence ranges longer than 31 inclusive dates", () => {
    expect(() => validateOccurrenceRange("2026-08-01", "2026-09-01")).toThrow(
      MedusaError,
    )
  })

  it("requires a fresh preview token for the exact log mutation", () => {
    const claims = {
      customerId: "cus_test",
      logId: "rrlog_test",
      operation: "revise" as const,
      currentRevisionId: "rrlogrev_test",
      currentStatus: "confirmed" as const,
      supplyId: "rsupply_test",
      confirmedQuantityBaseUnits: 250,
      baseUnit: "microgram" as const,
      supplyBalances: [
        {
          supplyId: "rsupply_test",
          remainingQuantityBaseUnits: 750,
        },
      ],
    }
    const issuedAt = new Date("2026-08-26T00:00:00.000Z")
    const token = createResearchRoutineLogMutationPreviewToken(claims, issuedAt)

    expect(() =>
      assertResearchRoutineLogMutationPreviewToken(
        token,
        claims,
        new Date("2026-08-26T00:04:59.000Z"),
      ),
    ).not.toThrow()
    expect(() =>
      assertResearchRoutineLogMutationPreviewToken(
        token,
        { ...claims, confirmedQuantityBaseUnits: 251 },
        new Date("2026-08-26T00:04:59.000Z"),
      ),
    ).toThrow(MedusaError)
    expect(() =>
      assertResearchRoutineLogMutationPreviewToken(
        token,
        { ...claims, currentRevisionId: "rrlogrev_changed" },
        new Date("2026-08-26T00:04:59.000Z"),
      ),
    ).toThrow(MedusaError)
    expect(() =>
      assertResearchRoutineLogMutationPreviewToken(
        token,
        {
          ...claims,
          supplyBalances: [
            {
              supplyId: "rsupply_test",
              remainingQuantityBaseUnits: 749,
            },
          ],
        },
        new Date("2026-08-26T00:04:59.000Z"),
      ),
    ).toThrow(MedusaError)
    expect(() =>
      assertResearchRoutineLogMutationPreviewToken(
        token,
        claims,
        new Date("2026-08-26T00:05:01.000Z"),
      ),
    ).toThrow(MedusaError)
  })

  it("requires the exact confirmation preview before creating a log", () => {
    const claims = {
      customerId: "cus_test",
      routineId: "rroutine_test",
      routineRevisionId: "rrrev_test",
      occurrenceId: "occ_test",
      localDate: "2026-08-26",
      supplyId: "rsupply_test",
      confirmedQuantityBaseUnits: 250,
      baseUnit: "microgram" as const,
    }
    const issuedAt = new Date("2026-08-26T00:00:00.000Z")
    const token = createResearchRoutineLogConfirmationPreviewToken(
      claims,
      issuedAt,
    )

    expect(() =>
      assertResearchRoutineLogConfirmationPreviewToken(
        token,
        claims,
        new Date("2026-08-26T00:04:59.000Z"),
      ),
    ).not.toThrow()
    expect(() =>
      assertResearchRoutineLogConfirmationPreviewToken(
        token,
        { ...claims, supplyId: "rsupply_changed" },
        new Date("2026-08-26T00:04:59.000Z"),
      ),
    ).toThrow(MedusaError)
  })

  it("keeps voided occurrences visible and excludes archived intervals", () => {
    const revision = {
      id: "rrrev_test",
      routine_id: "rroutine_test",
      label: "Morning research record",
      planned_quantity_base_units: 250,
      base_unit: "microgram" as const,
      recurrence_type: "daily" as const,
      daily_interval: 1,
      weekly_interval: null,
      weekdays: [],
      local_time: "08:30",
      start_date: "2026-08-26",
      end_date: null,
      effective_from_date: "2026-08-26",
      timezone: "Asia/Manila",
    }
    const voidedOccurrenceId = createOccurrenceId(
      revision.id,
      "2026-08-26",
      revision.local_time,
    )
    const projected = projectResearchOccurrences({
      revision,
      from: "2026-08-26",
      to: "2026-08-30",
      loggedOccurrences: new Map([
        [
          voidedOccurrenceId,
          { logId: "rrlog_test", status: "voided" as const },
        ],
      ]),
      inactiveDateRanges: [{ from: "2026-08-27", to: "2026-08-29" }],
    })

    expect(projected.map((item) => item.local_date)).toEqual([
      "2026-08-26",
      "2026-08-29",
      "2026-08-30",
    ])
    expect(projected[0]).toMatchObject({
      status: "voided",
      log_id: "rrlog_test",
    })
  })
})
