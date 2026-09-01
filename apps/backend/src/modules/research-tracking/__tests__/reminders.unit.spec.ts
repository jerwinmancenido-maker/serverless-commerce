import {
  isInQuietHours,
  localDateTimeParts,
  normalizeReminderPreference,
  zonedLocalDateTimeToUtc,
} from "../contracts/reminders"

describe("Research Hub reminder contract", () => {
  it("normalizes unique sorted lead times", () => {
    const result = normalizeReminderPreference({
      enabled: true,
      timezone: "Asia/Manila",
      lead_minutes: [60, 30, 60],
      quiet_hours_enabled: false,
      quiet_hours_start: null,
      quiet_hours_end: null,
      daily_summary: false,
      weekly_summary: false,
      replenishment_reminders: true,
      progress_reminders: false,
      journal_prompts: false,
      reward_notifications: true,
    })

    expect(result.lead_minutes).toEqual({ values: [30, 60] })
  })

  it("recognizes quiet hours spanning midnight", () => {
    expect(isInQuietHours("23:30", "22:00", "07:00")).toBe(true)
    expect(isInQuietHours("06:30", "22:00", "07:00")).toBe(true)
    expect(isInQuietHours("12:00", "22:00", "07:00")).toBe(false)
  })

  it("converts a Manila local schedule to the correct UTC instant", () => {
    const instant = zonedLocalDateTimeToUtc(
      "2026-09-01",
      "08:30",
      "Asia/Manila",
    )

    expect(instant.toISOString()).toBe("2026-09-01T00:30:00.000Z")
    expect(localDateTimeParts(instant, "Asia/Manila")).toEqual({
      date: "2026-09-01",
      time: "08:30",
    })
  })

  it("rejects enabled quiet hours without both boundaries", () => {
    expect(() =>
      normalizeReminderPreference({
        enabled: true,
        timezone: "Asia/Manila",
        lead_minutes: [30],
        quiet_hours_enabled: true,
        quiet_hours_start: "22:00",
        quiet_hours_end: null,
        daily_summary: false,
        weekly_summary: false,
        replenishment_reminders: true,
        progress_reminders: false,
        journal_prompts: false,
        reward_notifications: true,
      }),
    ).toThrow("quiet_hours_invalid")
  })
})
