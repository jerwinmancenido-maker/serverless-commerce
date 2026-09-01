import type ResearchTrackingModuleService from "../service"
import { consecutiveDateStreak } from "../contracts/goals"

const dateKey = (value: Date | string) => new Date(value).toISOString().slice(0, 10)

function windowStart(goal: { period: string; starts_on: Date }, today: string) {
  const start = dateKey(goal.starts_on)
  if (goal.period === "ongoing") return start
  const cursor = new Date(`${today}T00:00:00.000Z`)
  if (goal.period === "weekly") cursor.setUTCDate(cursor.getUTCDate() - ((cursor.getUTCDay() + 6) % 7))
  if (goal.period === "monthly") cursor.setUTCDate(1)
  return [start, cursor.toISOString().slice(0, 10)].sort().at(-1)!
}

export async function researchGoalProgress(
  service: ResearchTrackingModuleService,
  profileId: string,
  today: string,
) {
  const [goals, logs, logRevisions, entries, journalRevisions, measurements, measurementRevisions] = await Promise.all([
    service.listResearchPersonalGoals({ profile_id: profileId }, { order: { created_at: "DESC" } }),
    service.listResearchRoutineLogs({ profile_id: profileId, status: "confirmed" }),
    service.listResearchRoutineLogRevisions({ profile_id: profileId }),
    service.listResearchJournalEntries({ profile_id: profileId, status: "active" }),
    service.listResearchJournalEntryRevisions({}),
    service.listResearchMeasurementEntries({ profile_id: profileId, status: "active" }),
    service.listResearchMeasurementRevisions({}),
  ])
  const journalIds = new Set(entries.map((entry) => entry.id))
  const logRevisionById = new Map(logRevisions.map((revision) => [revision.id, revision]))
  const measurementIds = new Set(measurements.map((entry) => entry.id))
  const latestJournal = new Map<string, { revision_number: number; local_date: Date }>()
  journalRevisions.forEach((revision) => {
    if (!journalIds.has(revision.journal_entry_id)) return
    const prior = latestJournal.get(revision.journal_entry_id)
    if (!prior || revision.revision_number > prior.revision_number) latestJournal.set(revision.journal_entry_id, revision)
  })
  const latestMeasurements = new Map<string, { revision_number: number; local_date: Date }>()
  measurementRevisions.forEach((revision) => {
    if (!measurementIds.has(revision.measurement_entry_id)) return
    const prior = latestMeasurements.get(revision.measurement_entry_id)
    if (!prior || revision.revision_number > prior.revision_number) latestMeasurements.set(revision.measurement_entry_id, revision)
  })
  const confirmedRoutineDates = logs.flatMap((log) => {
    const revision = log.current_revision_id
      ? logRevisionById.get(log.current_revision_id)
      : null
    return revision ? [dateKey(revision.local_date)] : []
  })
  const progress = goals.map((goal) => {
    const from = windowStart(goal, today)
    const to = goal.ends_on ? dateKey(goal.ends_on) : today
    const inRange = (date: string) => date >= from && date <= to
    const routineDates = logs
      .filter((log) => (!goal.routine_id || log.routine_id === goal.routine_id))
      .flatMap((log) => {
        const revision = log.current_revision_id
          ? logRevisionById.get(log.current_revision_id)
          : null
        return revision ? [dateKey(revision.local_date)] : []
      })
    let current = 0
    if (goal.goal_type === "routine_completions") current = routineDates.filter(inRange).length
    if (goal.goal_type === "journal_days") current = new Set([...latestJournal.values()].map((item) => dateKey(item.local_date)).filter(inRange)).size
    if (goal.goal_type === "measurements") current = [...latestMeasurements.values()].map((item) => dateKey(item.local_date)).filter(inRange).length
    if (goal.goal_type === "routine_streak") current = consecutiveDateStreak(routineDates, today)
    return {
      goal,
      current,
      target: goal.target_count,
      achieved: current >= goal.target_count,
      progress_percent: Math.min(100, Math.round((current / goal.target_count) * 100)),
    }
  })
  return {
    progress,
    routineStreak: consecutiveDateStreak(confirmedRoutineDates, today),
  }
}
