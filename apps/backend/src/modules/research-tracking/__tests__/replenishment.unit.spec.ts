import { classifyReplenishmentUrgency } from "../contracts/replenishment"
import { legacyRevisionSegment } from "../queries/replenishment"

describe("replenishment contract", () => {
  it("uses merchant-configured thresholds", () => {
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: 10,
        reorderNowDays: 10,
        planReorderDays: 24,
      }),
    ).toBe("reorder_now")
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: 18,
        reorderNowDays: 10,
        planReorderDays: 24,
      }),
    ).toBe("plan_reorder")
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: 25,
        reorderNowDays: 10,
        planReorderDays: 24,
      }),
    ).toBe("on_track")
  })

  it("reports unavailable projections without guessing", () => {
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: null,
        reorderNowDays: 14,
        planReorderDays: 30,
      }),
    ).toBe("not_projected")
  })

  it("never allows the planning threshold below the urgent threshold", () => {
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: 14,
        reorderNowDays: 14,
        planReorderDays: 7,
      }),
    ).toBe("reorder_now")
  })

  it("classifies depleted or zero-day balance as urgent reorder", () => {
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: 0,
        reorderNowDays: 14,
        planReorderDays: 30,
      }),
    ).toBe("reorder_now")
  })

  it("handles exact boundary transitions between urgency levels", () => {
    // Exactly at reorderNowDays threshold
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: 14,
        reorderNowDays: 14,
        planReorderDays: 30,
      }),
    ).toBe("reorder_now")

    // One day above reorderNowDays
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: 15,
        reorderNowDays: 14,
        planReorderDays: 30,
      }),
    ).toBe("plan_reorder")

    // Exactly at planReorderDays
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: 30,
        reorderNowDays: 14,
        planReorderDays: 30,
      }),
    ).toBe("plan_reorder")

    // One day above planReorderDays
    expect(
      classifyReplenishmentUrgency({
        estimatedDaysRemaining: 31,
        reorderNowDays: 14,
        planReorderDays: 30,
      }),
    ).toBe("on_track")
  })

  it("projects customer-created routines that predate schedule segments", () => {
    expect(
      legacyRevisionSegment({
        planned_quantity_base_units: 1_000,
        base_unit: "microgram",
        recurrence_type: "daily",
        daily_interval: 1,
        weekly_interval: null,
        weekdays: null,
        local_time: "09:00",
      }),
    ).toMatchObject({
      label: "Current schedule",
      planned_quantity_base_units: 1_000,
      recurrence_type: "daily",
      local_times: { values: ["09:00"] },
    })
  })
})
