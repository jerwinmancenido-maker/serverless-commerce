"use client"

import {
  updateResearchReminderPreferencesAction,
  type ResearchReminderPreferences,
  type ResearchTrackingActionState,
} from "@lib/data/research-tracking"
import { useResearchSubmissionKey } from "./use-research-submission-key"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

const initialState: ResearchTrackingActionState = { success: false, error: null }

function SaveButton() {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending} className="rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-ui-bg-base disabled:opacity-50">{pending ? "Saving…" : "Save reminder preferences"}</button>
}

export default function ReminderPreferences({
  countryCode,
  preferences,
}: {
  countryCode: string
  preferences: ResearchReminderPreferences
}) {
  const [state, action] = useActionState(updateResearchReminderPreferencesAction, initialState)
  const submissionKey = useResearchSubmissionKey(state)
  const checkbox = "h-4 w-4 rounded border-ui-border-base"

  return (
    <form action={action} className="space-y-6 rounded-xl border border-ui-border-base bg-white p-5">
      <input type="hidden" name="country_code" value={countryCode} />
      <input type="hidden" name="idempotency_key" value={submissionKey} />
      <div>
        <h2 className="text-lg font-semibold">Research Hub reminders</h2>
        <p className="mt-2 text-sm leading-6 text-ui-fg-subtle">Choose which private in-app reminders appear and when. Email and push remain off until separately configured.</p>
      </div>
      <label className="flex items-center gap-3 text-sm font-medium"><input className={checkbox} type="checkbox" name="enabled" defaultChecked={preferences.enabled} />Enable in-app reminders</label>
      <div className="grid grid-cols-1 gap-4 small:grid-cols-2">
        <label className="text-sm font-medium">Timezone<select name="timezone" defaultValue={preferences.timezone} className="mt-2 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2"><option value="Asia/Manila">Asia/Manila</option><option value="UTC">UTC</option></select></label>
        <fieldset><legend className="text-sm font-medium">Reminder lead times</legend><div className="mt-3 flex flex-wrap gap-4">{[[0,"At time"],[15,"15 min"],[30,"30 min"],[60,"1 hour"],[1440,"1 day"]].map(([value,label]) => <label key={value} className="flex items-center gap-2 text-sm"><input className={checkbox} type="checkbox" name="lead_minutes" value={value} defaultChecked={preferences.lead_minutes.includes(Number(value))} />{label}</label>)}</div></fieldset>
      </div>
      <div className="rounded-lg bg-ui-bg-subtle p-4">
        <label className="flex items-center gap-3 text-sm font-medium"><input className={checkbox} type="checkbox" name="quiet_hours_enabled" defaultChecked={preferences.quiet_hours_enabled} />Use quiet hours</label>
        <div className="mt-3 grid grid-cols-2 gap-3"><label className="text-sm">Start<input className="mt-1 w-full rounded-lg border border-ui-border-base px-3 py-2" type="time" name="quiet_hours_start" defaultValue={preferences.quiet_hours_start ?? "22:00"} /></label><label className="text-sm">End<input className="mt-1 w-full rounded-lg border border-ui-border-base px-3 py-2" type="time" name="quiet_hours_end" defaultValue={preferences.quiet_hours_end ?? "07:00"} /></label></div>
      </div>
      <fieldset><legend className="text-sm font-medium">Optional notifications</legend><div className="mt-3 grid grid-cols-1 gap-3 small:grid-cols-2">{[["daily_summary","Daily summary",preferences.daily_summary],["weekly_summary","Weekly schedule summary",preferences.weekly_summary],["replenishment_reminders","Replenishment reminders",preferences.replenishment_reminders],["progress_reminders","Progress measurement reminders",preferences.progress_reminders],["journal_prompts","Journal prompts",preferences.journal_prompts],["reward_notifications","Rewards and achievements",preferences.reward_notifications]].map(([name,label,checked]) => <label key={String(name)} className="flex items-center gap-2 text-sm"><input className={checkbox} type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} />{label}</label>)}</div></fieldset>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">Reminder preferences saved.</p> : null}
      <SaveButton />
    </form>
  )
}
