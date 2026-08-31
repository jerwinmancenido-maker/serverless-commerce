import { MedusaError } from "@medusajs/framework/utils"

import {
  measurementMutationIdentity,
  normalizeResearchMeasurementContent,
  RESEARCH_MEASUREMENT_ALLOWLIST_VERSION,
} from "../contracts/measurements"

const common = {
  localDate: "2026-08-31",
  localTime: "18:30",
  timezone: "Asia/Manila",
} as const

describe("progress-metrics-v1 contract", () => {
  it("normalizes pounds to kilograms while retaining the entered unit", () => {
    expect(
      normalizeResearchMeasurementContent({
        ...common,
        metricType: "weight",
        value: "220.462262",
        unit: "lb",
      }),
    ).toMatchObject({
      metricType: "weight",
      originalValue: "220.462262",
      originalUnit: "lb",
      normalizedValue: "100",
      normalizedUnit: "kg",
    })
  })

  it("normalizes inches to centimeters and preserves explicit context", () => {
    expect(
      normalizeResearchMeasurementContent({
        ...common,
        metricType: "waist",
        value: "40",
        unit: "in",
        routineId: " routine_1 ",
        note: " weekly check ",
      }),
    ).toMatchObject({
      originalValue: "40",
      originalUnit: "in",
      normalizedValue: "101.6",
      normalizedUnit: "cm",
      routineId: "routine_1",
      note: "weekly check",
    })
  })

  it("rejects units outside the metric allowlist", () => {
    expect(RESEARCH_MEASUREMENT_ALLOWLIST_VERSION).toBe("progress-metrics-v1")
    expect(() =>
      normalizeResearchMeasurementContent({
        ...common,
        metricType: "body_fat",
        value: "20",
        unit: "kg",
      }),
    ).toThrow(MedusaError)
  })

  it("creates operation- and value-bound mutation identities", () => {
    const first = measurementMutationIdentity({
      operation: "create",
      idempotencyKey: "measurement-create-1",
      values: ["weight", "80", "kg"],
    })
    const second = measurementMutationIdentity({
      operation: "create",
      idempotencyKey: "measurement-create-2",
      values: ["weight", "81", "kg"],
    })

    expect(first.fingerprint).toMatch(/^[a-f0-9]{64}$/)
    expect(first.fingerprint).not.toBe(second.fingerprint)
  })
})
