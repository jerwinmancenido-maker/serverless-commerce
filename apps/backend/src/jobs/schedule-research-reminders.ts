import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_TRACKING_MODULE } from "../modules/research-tracking"
import {
  isInQuietHours,
  localDateTimeParts,
  zonedLocalDateTimeToUtc,
} from "../modules/research-tracking/contracts/reminders"
import { listOwnedResearchOccurrences } from "../modules/research-tracking/queries/personal-routines"
import type ResearchTrackingModuleService from "../modules/research-tracking/service"
import { scheduleResearchNotificationsWorkflow } from "../workflows/manage-research-reminders"

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export default async function scheduleResearchReminders(
  container: MedusaContainer,
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const now = new Date()
  let scheduled = 0

  try {
    const profiles = await service.listResearchProfiles({ status: "active" })
    for (const profile of profiles) {
      const [storedPreference] = await service.listResearchReminderPreferences(
        { profile_id: profile.id },
        { take: 1 },
      )
      const enabled = storedPreference?.enabled ?? true
      if (!enabled) continue
      const timezone = storedPreference?.timezone ?? profile.timezone
      const localNow = localDateTimeParts(now, timezone)
      if (
        storedPreference?.quiet_hours_enabled &&
        isInQuietHours(
          localNow.time,
          storedPreference.quiet_hours_start,
          storedPreference.quiet_hours_end,
        )
      ) {
        continue
      }
      const occurrences = await listOwnedResearchOccurrences({
        container,
        customerId: profile.customer_id,
        from: localNow.date,
        to: addDays(localNow.date, 7),
      })
      const leadMinutes =
        (storedPreference?.lead_minutes as { values?: number[] } | undefined)
          ?.values ?? [30]
      const candidates = occurrences.flatMap((occurrence) => {
        if (occurrence.status !== "scheduled") return []
        const occurrenceAt = zonedLocalDateTimeToUtc(
          occurrence.local_date,
          occurrence.local_time,
          occurrence.timezone,
        )
        return leadMinutes.flatMap((leadMinutesValue) => {
          const scheduledFor = new Date(
            occurrenceAt.getTime() - leadMinutesValue * 60_000,
          )
          if (scheduledFor > now || occurrenceAt < now) return []
          return [{
            profile_id: profile.id,
            routine_id: occurrence.routine_id,
            routine_revision_id: occurrence.routine_revision_id,
            occurrence_id: occurrence.occurrence_id,
            title: `Upcoming: ${occurrence.label}`,
            body: `${occurrence.local_time} · Review this scheduled activity in Research Hub.`,
            scheduled_for: scheduledFor,
            available_at: now,
            source_local_date: new Date(`${occurrence.local_date}T00:00:00.000Z`),
            source_local_time: occurrence.local_time,
            timezone: occurrence.timezone,
            idempotency_key: `${occurrence.occurrence_id}:lead:${leadMinutesValue}:in_app`,
            metadata: {
              lead_minutes: leadMinutesValue,
              planned_quantity_base_units: occurrence.planned_quantity_base_units,
              base_unit: occurrence.base_unit,
            },
          }]
        })
      })
      if (candidates.length) {
        const { result } = await scheduleResearchNotificationsWorkflow(
          container,
        ).run({ input: { notifications: candidates } })
        scheduled += result.length
      }
    }
    logger.info(`Research reminder scheduler processed ${scheduled} reminders.`)
  } catch (error) {
    logger.error(
      `Research reminder scheduler failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export const config = {
  name: "schedule-research-reminders",
  schedule: "*/5 * * * *",
}
