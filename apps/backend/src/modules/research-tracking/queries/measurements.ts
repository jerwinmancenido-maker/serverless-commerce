import type { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_TRACKING_MODULE } from ".."
import { retrieveResearchProfileForRead } from "./personal-routines"
import type ResearchTrackingModuleService from "../service"

type MeasurementEntryRecord = {
  id: string
  metric_type: "weight" | "waist" | "body_fat"
  status: "active" | "voided"
  current_revision_id: string | null
  created_at: Date
  updated_at: Date
  voided_at: Date | null
  restored_at: Date | null
}

function service(container: MedusaContainer) {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

export async function listOwnedResearchMeasurements(input: {
  container: MedusaContainer
  customerId: string
  metricType?: "weight" | "waist" | "body_fat"
  includeVoided?: boolean
}) {
  const profile = await retrieveResearchProfileForRead(
    input.container,
    input.customerId,
  )
  const tracking = service(input.container)
  const entries = (await tracking.listResearchMeasurementEntries(
    {
      profile_id: profile.id,
      ...(input.metricType ? { metric_type: input.metricType } : {}),
      ...(input.includeVoided ? {} : { status: "active" as const }),
    },
    { order: { created_at: "DESC" } },
  )) as MeasurementEntryRecord[]

  return await Promise.all(
    entries.map(async (entry) => {
      if (!entry.current_revision_id) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "measurement has no current revision",
        )
      }
      const revision = await tracking.retrieveResearchMeasurementRevision(
        entry.current_revision_id,
      )

      return {
        measurement_entry_id: entry.id,
        metric_type: entry.metric_type,
        status: entry.status,
        current_revision: {
          revision_id: revision.id,
          revision_number: revision.revision_number,
          measured_at: revision.measured_at,
          local_date: revision.local_date.toISOString().slice(0, 10),
          local_time: revision.local_time,
          timezone: revision.timezone,
          original_value: revision.original_value,
          original_unit: revision.original_unit,
          normalized_value: revision.normalized_value,
          normalized_unit: revision.normalized_unit,
          note: revision.note,
          routine_id: revision.routine_id,
          protocol_revision_id: revision.protocol_revision_id,
          profile_protocol_access_id: revision.profile_protocol_access_id,
          tracked_material_id: revision.tracked_material_id,
          routine_log_id: revision.routine_log_id,
          created_at: revision.created_at,
        },
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        voided_at: entry.voided_at,
        restored_at: entry.restored_at,
      }
    }),
  )
}

export async function summarizeOwnedResearchMeasurements(input: {
  container: MedusaContainer
  customerId: string
  metricType: "weight" | "waist" | "body_fat"
}) {
  const entries = await listOwnedResearchMeasurements(input)
  const points = entries
    .map((entry) => ({
      id: entry.measurement_entry_id,
      date: entry.current_revision.local_date,
      value: Number(entry.current_revision.normalized_value),
      unit: entry.current_revision.normalized_unit,
      routine_id: entry.current_revision.routine_id,
      protocol_revision_id: entry.current_revision.protocol_revision_id,
    }))
    .sort((left, right) => left.date.localeCompare(right.date))

  if (!points.length) {
    return { metric_type: input.metricType, summary: null, points: [] }
  }

  const first = points[0]
  const last = points[points.length - 1]
  const values = points.map((point) => point.value)
  const change = last.value - first.value
  const elapsedWeeks = Math.max(
    1 / 7,
    (Date.parse(`${last.date}T00:00:00Z`) -
      Date.parse(`${first.date}T00:00:00Z`)) /
      (7 * 86_400_000),
  )

  return {
    metric_type: input.metricType,
    summary: {
      starting_value: first.value,
      current_value: last.value,
      absolute_change: change,
      percentage_change: (change / first.value) * 100,
      lowest_value: Math.min(...values),
      highest_value: Math.max(...values),
      measurement_count: points.length,
      average_weekly_change: change / elapsedWeeks,
      normalized_unit: first.unit,
    },
    points,
  }
}
