"use client"

import {
  createResearchPersonalGoalAction,
  mutateResearchPersonalGoalAction,
  type ResearchPersonalGoal,
  type ResearchRoutine,
  type ResearchTrackingActionState,
} from "@lib/data/research-tracking"
import type { RewardsSummary } from "@lib/data/rewards"
import { useResearchSubmissionKey } from "./use-research-submission-key"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

const initialState: ResearchTrackingActionState = { success: false, error: null }
const inputClass = "mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return <button disabled={pending} className="rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-ui-bg-base disabled:opacity-50">{pending ? "Saving…" : children}</button>
}

export default function ResearchGoals({
  countryCode,
  today,
  goals,
  routineStreak,
  routines,
  rewards,
}: {
  countryCode: string
  today: string
  goals: ResearchPersonalGoal[]
  routineStreak: number
  routines: ResearchRoutine[]
  rewards: RewardsSummary | null
}) {
  const [createState, createAction] = useActionState(createResearchPersonalGoalAction, initialState)
  const [mutationState, mutationAction] = useActionState(mutateResearchPersonalGoalAction, initialState)
  const createSubmissionKey = useResearchSubmissionKey(createState)
  const mutationSubmissionKey = useResearchSubmissionKey(mutationState)
  const earnedTypes = new Set(rewards?.entries.filter((entry) => entry.points > 0).map((entry) => entry.source_type) || [])
  const badges = rewards?.rules.filter((rule) => rule.show_as_badge) || []

  return <section className="mt-10 space-y-5" data-testid="research-goals">
    <div className="grid gap-4 medium:grid-cols-3">
      <div className="rounded-xl border border-ui-border-base bg-white p-5"><p className="text-sm text-ui-fg-subtle">Current routine streak</p><p className="mt-2 text-3xl font-semibold">{routineStreak} {routineStreak === 1 ? "day" : "days"}</p><p className="mt-2 text-xs text-ui-fg-muted">Calculated from confirmed activity records. Rescheduled dates use the confirmed activity date.</p></div>
      <div className="rounded-xl border border-ui-border-base bg-white p-5"><p className="text-sm text-ui-fg-subtle">Available points</p><p className="mt-2 text-3xl font-semibold">{rewards?.balance.available || 0}</p><p className="mt-2 text-xs text-ui-fg-muted">Worth ₱{rewards?.balance.peso_value || 0} under the current Admin configuration.</p></div>
      <div className="rounded-xl border border-ui-border-base bg-white p-5"><p className="text-sm text-ui-fg-subtle">Goals completed</p><p className="mt-2 text-3xl font-semibold">{goals.filter((goal) => goal.status === "completed" || goal.achieved).length}</p><p className="mt-2 text-xs text-ui-fg-muted">Only confirmed eligible actions can complete a goal or award points.</p></div>
    </div>

    <div className="rounded-xl border border-ui-border-base bg-white p-5">
      <h2 className="text-lg font-semibold">Goals</h2>
      <div className="mt-4 space-y-3">{goals.length ? goals.map((goal) => <div key={goal.id} className="rounded-lg border border-ui-border-base p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{goal.title}</p><p className="mt-1 text-xs text-ui-fg-muted">{goal.current_count} of {goal.target_count} · {goal.period.replaceAll("_", " ")} · {goal.status}</p></div><span className="rounded-full bg-ui-bg-subtle px-2.5 py-1 text-xs">{goal.progress_percent}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-ui-bg-subtle"><div className="h-full bg-emerald-500" style={{ width: `${goal.progress_percent}%` }} /></div>{goal.status !== "archived" ? <form action={mutationAction} className="mt-3"><input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="idempotency_key" value={mutationSubmissionKey} /><input type="hidden" name="goal_id" value={goal.id} /><button name="action" value="archive" className="text-xs text-ui-fg-subtle underline">Archive goal</button></form> : null}</div>) : <p className="text-sm text-ui-fg-subtle">Create a personal goal below.</p>}</div>
      {mutationState.error ? <p className="mt-3 text-sm text-red-600">{mutationState.error}</p> : null}
      <details className="mt-5 rounded-lg bg-ui-bg-subtle p-4"><summary className="cursor-pointer text-sm font-medium">Create goal</summary><form action={createAction} className="mt-4 grid gap-4 small:grid-cols-2 medium:grid-cols-4"><input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="idempotency_key" value={createSubmissionKey} /><label className="text-sm font-medium">Goal name<input name="title" required maxLength={120} className={inputClass} /></label><label className="text-sm font-medium">Goal type<select name="goal_type" className={inputClass}><option value="routine_completions">Routine completions</option><option value="routine_streak">Routine streak</option><option value="journal_days">Journal days</option><option value="measurements">Measurements</option></select></label><label className="text-sm font-medium">Target<input name="target_count" type="number" min="1" max="365" required defaultValue="7" className={inputClass} /></label><label className="text-sm font-medium">Period<select name="period" className={inputClass}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="ongoing">Ongoing</option></select></label><label className="text-sm font-medium">Routine (optional)<select name="routine_id" className={inputClass}><option value="">All routines</option>{routines.map((routine) => <option key={routine.routine_id} value={routine.routine_id}>{routine.current_revision.label}</option>)}</select></label><label className="text-sm font-medium">Starts<input name="starts_on" type="date" required defaultValue={today} className={inputClass} /></label><label className="text-sm font-medium">Ends (optional)<input name="ends_on" type="date" className={inputClass} /></label><div className="flex items-end"><Submit>Create goal</Submit></div>{createState.error ? <p className="text-sm text-red-600 small:col-span-2">{createState.error}</p> : null}</form></details>
    </div>

    <div className="rounded-xl border border-ui-border-base bg-white p-5"><h2 className="text-lg font-semibold">Achievements</h2><div className="mt-4 grid gap-3 small:grid-cols-2 medium:grid-cols-3">{badges.map((badge) => <div key={badge.id} className={`rounded-lg border p-4 ${earnedTypes.has(badge.event_type) ? "border-emerald-200 bg-emerald-50" : "border-ui-border-base bg-ui-bg-subtle opacity-60"}`}><p className="text-xl">{earnedTypes.has(badge.event_type) ? "✓" : "○"}</p><p className="mt-2 text-sm font-medium">{badge.badge_name || badge.name}</p><p className="mt-1 text-xs text-ui-fg-muted">{earnedTypes.has(badge.event_type) ? "Earned" : "Not earned yet"}{badge.point_value ? ` · ${badge.point_value} points` : ""}</p></div>)}</div>{!badges.length ? <p className="mt-3 text-sm text-ui-fg-subtle">Admin has not enabled achievement badges yet.</p> : null}</div>
  </section>
}
