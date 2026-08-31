import type { MedusaContainer } from "@medusajs/framework/types"

import { RESEARCH_TRACKING_MODULE } from ".."
import { listOwnedResearchJournalEntries } from "./journal"
import { listOwnedResearchMeasurements } from "./measurements"
import { retrieveResearchProfileForRead } from "./personal-routines"
import type ResearchTrackingModuleService from "../service"

export async function listOwnedResearchTimeline(input: {
  container: MedusaContainer
  customerId: string
}) {
  const profile = await retrieveResearchProfileForRead(
    input.container,
    input.customerId,
  )
  const service = input.container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [accesses, routines, logs, activations, measurements, journal] =
    await Promise.all([
      service.listResearchProtocolProfileAccesses(
        { profile_id: profile.id },
        { order: { granted_at: "DESC" } },
      ),
      service.listResearchRoutines(
        { profile_id: profile.id },
        { order: { created_at: "DESC" } },
      ),
      service.listResearchRoutineLogs(
        { profile_id: profile.id },
        { order: { created_at: "DESC" } },
      ),
      service.listResearchSupplyActivations(
        { profile_id: profile.id },
        { order: { activated_at: "DESC" } },
      ),
      listOwnedResearchMeasurements({
        container: input.container,
        customerId: input.customerId,
        includeVoided: true,
      }),
      listOwnedResearchJournalEntries({
        container: input.container,
        customerId: input.customerId,
        limit: 50,
        offset: 0,
        includeVoided: true,
      }),
    ])
  const events: Array<{
    id: string
    type: string
    occurred_at: Date | string
    title: string
    detail: string | null
    related_id: string
  }> = []

  accesses.forEach((access) =>
    events.push({
      id: `protocol:${access.id}`,
      type: "protocol_acquired",
      occurred_at: access.granted_at,
      title: "Protocol added",
      detail: `${access.protocol_title_snapshot} · revision ${access.revision_number_snapshot}`,
      related_id: access.id,
    }),
  )
  routines.forEach((routine) =>
    events.push({
      id: `routine:${routine.id}`,
      type: "routine_started",
      occurred_at: routine.created_at,
      title: "Routine started",
      detail: routine.status,
      related_id: routine.id,
    }),
  )
  logs.forEach((log) =>
    events.push({
      id: `activity:${log.id}`,
      type: log.status === "voided" ? "activity_voided" : "activity_completed",
      occurred_at: log.updated_at,
      title: log.status === "voided" ? "Activity voided" : "Activity completed",
      detail: null,
      related_id: log.id,
    }),
  )
  activations.forEach((activation) =>
    events.push({
      id: `supply:${activation.id}`,
      type: "supply_activated",
      occurred_at: activation.activated_at,
      title: "Supply added",
      detail: activation.label_snapshot,
      related_id: activation.id,
    }),
  )
  measurements.forEach((measurement) =>
    events.push({
      id: `measurement:${measurement.measurement_entry_id}`,
      type:
        measurement.status === "voided"
          ? "measurement_voided"
          : "measurement_recorded",
      occurred_at: measurement.current_revision.measured_at,
      title: `${measurement.metric_type.replace("_", " ")} recorded`,
      detail: `${measurement.current_revision.original_value} ${measurement.current_revision.original_unit}`,
      related_id: measurement.measurement_entry_id,
    }),
  )
  journal.entries.forEach((entry) =>
    events.push({
      id: `journal:${entry.journal_entry_id}`,
      type: entry.status === "voided" ? "journal_voided" : "journal_note",
      occurred_at: entry.updated_at,
      title: entry.current_revision.title ?? "Journal note",
      detail: entry.current_revision.note,
      related_id: entry.journal_entry_id,
    }),
  )

  return events.sort((left, right) =>
    new Date(right.occurred_at).getTime() - new Date(left.occurred_at).getTime(),
  )
}
