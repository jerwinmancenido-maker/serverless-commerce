import { z } from "@medusajs/framework/zod"

export const StoreCreatePersonalGoal = z.strictObject({
  title: z.string().trim().min(1).max(120),
  goal_type: z.enum(["routine_completions", "journal_days", "measurements", "routine_streak"]),
  target_count: z.number().int().min(1).max(365),
  period: z.enum(["weekly", "monthly", "ongoing"]),
  routine_id: z.string().trim().min(1).max(255).nullable().default(null),
  starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
})
export type StoreCreatePersonalGoalType = z.infer<typeof StoreCreatePersonalGoal>

export const StoreMutatePersonalGoal = z.strictObject({
  action: z.enum(["archive", "restore"]),
})
export type StoreMutatePersonalGoalType = z.infer<typeof StoreMutatePersonalGoal>

export function consecutiveDateStreak(localDates: string[], throughDate: string) {
  const dates = new Set(localDates)
  const cursor = new Date(`${throughDate}T00:00:00.000Z`)
  if (!dates.has(throughDate)) cursor.setUTCDate(cursor.getUTCDate() - 1)
  let streak = 0
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}
