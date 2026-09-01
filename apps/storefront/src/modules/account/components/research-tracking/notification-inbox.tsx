"use client"

import {
  mutateResearchNotificationAction,
  type ResearchNotification,
  type ResearchTrackingActionState,
} from "@lib/data/research-tracking"
import { useResearchSubmissionKey } from "./use-research-submission-key"
import { useActionState } from "react"

const initialState: ResearchTrackingActionState = { success: false, error: null }

function NotificationRow({ countryCode, notification }: { countryCode: string; notification: ResearchNotification }) {
  const [state, action] = useActionState(mutateResearchNotificationAction, initialState)
  const submissionKey = useResearchSubmissionKey(state)
  return (
    <article className="rounded-lg border border-ui-border-base bg-white p-4">
      <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{notification.title}</h3><p className="mt-1 text-sm text-ui-fg-subtle">{notification.body}</p><p className="mt-2 text-xs text-ui-fg-muted">{new Date(notification.available_at).toLocaleString("en-PH")}</p></div>{notification.status === "unread" ? <span className="h-2 w-2 rounded-full bg-blue-600" aria-label="Unread" /> : null}</div>
      <form action={action} className="mt-3 flex flex-wrap gap-2">
        <input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="idempotency_key" value={submissionKey} /><input type="hidden" name="notification_id" value={notification.id} />
        {notification.status !== "read" ? <button name="action" value="read" className="rounded-lg border border-ui-border-base px-3 py-1.5 text-xs font-medium">Mark read</button> : null}
        <button name="action" value="snooze" className="rounded-lg border border-ui-border-base px-3 py-1.5 text-xs font-medium">Snooze 30 min</button><input type="hidden" name="snooze_minutes" value="30" />
        <button name="action" value="dismiss" className="rounded-lg border border-ui-border-base px-3 py-1.5 text-xs font-medium">Dismiss</button>
      </form>
      {state.error ? <p className="mt-2 text-xs text-red-600">{state.error}</p> : null}
    </article>
  )
}

export default function NotificationInbox({ countryCode, notifications, unreadCount }: { countryCode: string; notifications: ResearchNotification[]; unreadCount: number }) {
  return <section className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">In-app reminders</p><h2 className="mt-2 text-lg font-semibold">Notifications {unreadCount ? `(${unreadCount})` : ""}</h2></div>{notifications.length ? <div className="space-y-3">{notifications.map((notification) => <NotificationRow key={notification.id} countryCode={countryCode} notification={notification} />)}</div> : <div className="rounded-xl border border-ui-border-base bg-white p-5 text-sm text-ui-fg-subtle">No reminders yet.</div>}</section>
}
