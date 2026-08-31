import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_TRACKING_MODULE } from ".."
import type ResearchTrackingModuleService from "../service"
import { retrieveResearchProfileForRead } from "./personal-routines"

type Segment = {
  id: string
  label: string
  start_offset_days: number
  end_offset_days: number | null
  planned_quantity_base_units: number
  base_unit: string
  recurrence_type: "once" | "daily" | "weekly"
  daily_interval: number | null
  weekly_interval: number | null
  weekdays: { values: number[] } | null
  local_times: { values: string[] }
}

type ReplenishmentProjection = {
  routine_id: string
  routine_revision_id: string
  tracked_material_id: string
  tracked_material_label: string
  product_variant_id: string | null
  source_protocol_series_id: string | null
  source_protocol_revision_id: string | null
  source_product_id: string | null
  source_product_variant_id: string | null
  current_phase: string
  base_unit: string
  remaining_quantity_base_units: number
  planned_quantity_base_units: number
  estimated_uses_per_week: number
  estimated_days_remaining: number | null
  estimated_runout_at: string | null
  urgency: "not_projected" | "reorder_now" | "plan_reorder" | "on_track"
  calculation_basis: string
}

function calendarDaysBetween(start: Date, end: Date) {
  const startDay = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  )
  const endDay = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  )
  return Math.floor((endDay - startDay) / 86_400_000)
}

function usesPerWeek(segment: Segment) {
  const times = Math.max(1, segment.local_times?.values?.length || 1)
  if (segment.recurrence_type === "daily") {
    return (7 / Math.max(1, segment.daily_interval || 1)) * times
  }
  if (segment.recurrence_type === "weekly") {
    const weekdays = segment.weekdays?.values?.length || 1
    return (weekdays / Math.max(1, segment.weekly_interval || 1)) * times
  }
  return 0
}

export async function listOwnedResearchReplenishmentProjections(input: {
  container: MedusaContainer
  customerId: string
  now?: Date
}) {
  const profile = await retrieveResearchProfileForRead(
    input.container,
    input.customerId,
  )
  const service = input.container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const routines = await service.listResearchRoutines(
    { profile_id: profile.id, status: "active" },
    { order: { created_at: "DESC" } },
  )
  const now = input.now || new Date()
  const projections: ReplenishmentProjection[] = []

  for (const routine of routines) {
    if (!routine.current_revision_id) continue
    const revision = await service.retrieveResearchRoutineRevision(
      routine.current_revision_id,
    )
    const material = await service.retrieveTrackedMaterial(
      routine.tracked_material_id,
    )
    const supplies = await service.listResearchSupplies({
      tracked_material_id: material.id,
      status: "active",
    })
    const segments = (await service.listResearchRoutineScheduleSegments(
      { routine_revision_id: revision.id },
      { order: { position: "ASC" } },
    )) as unknown as Segment[]
    const elapsedDays = Math.max(
      0,
      calendarDaysBetween(revision.start_date, now),
    )
    const segment =
      segments.find(
        (item) =>
          elapsedDays >= item.start_offset_days &&
          (item.end_offset_days === null || elapsedDays <= item.end_offset_days),
      ) || segments.at(-1)
    if (!segment) continue
    const remaining = supplies
      .filter((supply) => supply.base_unit === segment.base_unit)
      .reduce(
        (total, supply) => total + supply.remaining_quantity_base_units,
        0,
      )
    const weeklyUses = usesPerWeek(segment)
    const weeklyConsumption = segment.planned_quantity_base_units * weeklyUses
    const dailyConsumption = weeklyConsumption / 7
    const estimatedDaysRemaining =
      dailyConsumption > 0 ? Math.floor(remaining / dailyConsumption) : null
    const estimatedRunoutAt =
      estimatedDaysRemaining === null
        ? null
        : new Date(now.getTime() + estimatedDaysRemaining * 86_400_000)
    const urgency =
      estimatedDaysRemaining === null
        ? "not_projected"
        : estimatedDaysRemaining <= 14
          ? "reorder_now"
          : estimatedDaysRemaining <= 30
            ? "plan_reorder"
            : "on_track"

    projections.push({
      routine_id: routine.id,
      routine_revision_id: revision.id,
      tracked_material_id: material.id,
      tracked_material_label: material.label,
      product_variant_id: material.product_variant_id,
      source_protocol_series_id: revision.source_protocol_series_id,
      source_protocol_revision_id: revision.source_protocol_revision_id,
      source_product_id: revision.source_product_id,
      source_product_variant_id: revision.source_product_variant_id,
      current_phase: segment.label,
      base_unit: segment.base_unit,
      remaining_quantity_base_units: remaining,
      planned_quantity_base_units: segment.planned_quantity_base_units,
      estimated_uses_per_week: Number(weeklyUses.toFixed(2)),
      estimated_days_remaining: estimatedDaysRemaining,
      estimated_runout_at: estimatedRunoutAt?.toISOString() || null,
      urgency,
      calculation_basis:
        "Estimated from the current routine phase and private tracked supply balance.",
    })
  }

  const productIds = projections
    .map((projection) => projection.source_product_id)
    .filter((id): id is string => Boolean(id))
  const query = input.container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = productIds.length
    ? await query.graph({
        entity: "product",
        fields: ["id", "handle"],
        filters: { id: productIds },
      })
    : { data: [] }
  const handleById = new Map(
    products.map((product: any) => [product.id, product.handle]),
  )

  return projections.map((projection) => ({
    ...projection,
    source_product_handle: projection.source_product_id
      ? handleById.get(projection.source_product_id) || null
      : null,
  }))
}
