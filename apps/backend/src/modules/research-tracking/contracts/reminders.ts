import { MedusaError } from "@medusajs/framework/utils"

const CLOCK_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export type ResearchReminderPreferenceInput = {
  enabled: boolean
  timezone: string
  lead_minutes: number[]
  quiet_hours_enabled: boolean
  quiet_hours_start?: string | null
  quiet_hours_end?: string | null
  daily_summary: boolean
  weekly_summary: boolean
  replenishment_reminders: boolean
  progress_reminders: boolean
  journal_prompts: boolean
  reward_notifications: boolean
  community_reply_notifications?: boolean
  community_moderation_notifications?: boolean
  support_reply_notifications?: boolean
}

export function normalizeReminderPreference(
  input: ResearchReminderPreferenceInput,
) {
  const leadMinutes = Array.from(new Set(input.lead_minutes))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 10_080)
    .sort((left, right) => left - right)

  if (!leadMinutes.length || leadMinutes.length > 5) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "reminder_lead_times_invalid",
    )
  }
  if (!input.timezone || input.timezone.length > 100) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "reminder_timezone_invalid",
    )
  }
  try {
    new Intl.DateTimeFormat("en", { timeZone: input.timezone }).format()
  } catch {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "reminder_timezone_invalid",
    )
  }
  if (
    input.quiet_hours_enabled &&
    (!input.quiet_hours_start ||
      !input.quiet_hours_end ||
      !CLOCK_PATTERN.test(input.quiet_hours_start) ||
      !CLOCK_PATTERN.test(input.quiet_hours_end))
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "quiet_hours_invalid",
    )
  }

  return {
    ...input,
    community_reply_notifications:
      input.community_reply_notifications ?? true,
    community_moderation_notifications:
      input.community_moderation_notifications ?? true,
    support_reply_notifications: input.support_reply_notifications ?? true,
    lead_minutes: { values: leadMinutes },
    quiet_hours_start: input.quiet_hours_enabled
      ? input.quiet_hours_start ?? null
      : null,
    quiet_hours_end: input.quiet_hours_enabled
      ? input.quiet_hours_end ?? null
      : null,
  }
}

export function localDateTimeParts(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  }
}

export function isInQuietHours(
  time: string,
  start: string | null,
  end: string | null,
) {
  if (!start || !end || start === end) return false
  return start < end
    ? time >= start && time < end
    : time >= start || time < end
}

export function zonedLocalDateTimeToUtc(
  localDate: string,
  localTime: string,
  timezone: string,
) {
  const [year, month, day] = localDate.split("-").map(Number)
  const [hour, minute] = localTime.split(":").map(Number)
  const intended = Date.UTC(year, month - 1, day, hour, minute)
  let candidate = new Date(intended)

  for (let index = 0; index < 3; index += 1) {
    const rendered = localDateTimeParts(candidate, timezone)
    const [renderYear, renderMonth, renderDay] = rendered.date.split("-").map(Number)
    const [renderHour, renderMinute] = rendered.time.split(":").map(Number)
    const renderedUtc = Date.UTC(
      renderYear,
      renderMonth - 1,
      renderDay,
      renderHour,
      renderMinute,
    )
    candidate = new Date(candidate.getTime() + intended - renderedUtc)
  }

  return candidate
}
