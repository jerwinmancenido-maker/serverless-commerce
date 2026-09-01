export type ReplenishmentUrgency =
  | "not_projected"
  | "reorder_now"
  | "plan_reorder"
  | "on_track"

export function classifyReplenishmentUrgency(input: {
  estimatedDaysRemaining: number | null
  reorderNowDays: number
  planReorderDays: number
}): ReplenishmentUrgency {
  if (input.estimatedDaysRemaining === null) return "not_projected"

  const reorderNowDays = Math.max(1, input.reorderNowDays)
  const planReorderDays = Math.max(reorderNowDays, input.planReorderDays)

  if (input.estimatedDaysRemaining <= reorderNowDays) return "reorder_now"
  if (input.estimatedDaysRemaining <= planReorderDays) return "plan_reorder"
  return "on_track"
}
