"use client"

import {
  listCustomerNotifications,
  mutateCustomerNotification,
  type CustomerNotification,
} from "@lib/data/customer-notifications"
import type { ResearchNotification } from "@lib/data/research-tracking"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useCallback, useEffect, useState, useTransition } from "react"

export default function NotificationInbox({
  notifications: legacyNotifications,
  unreadCount: legacyUnreadCount,
}: {
  countryCode: string
  notifications: ResearchNotification[]
  unreadCount: number
}) {
  void legacyNotifications
  void legacyUnreadCount
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, startTransition] = useTransition()

  const refresh = useCallback(async () => {
    try {
      const result = await listCustomerNotifications({ category: "research", limit: 5 })
      setNotifications(result.notifications)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const mutate = (notification: CustomerNotification, action: "mark_read" | "archive" | "snooze") => startTransition(async () => {
    await mutateCustomerNotification(notification.id, action === "snooze"
      ? { action, snoozed_until: new Date(Date.now() + 30 * 60 * 1000).toISOString() }
      : { action })
    await refresh()
  })

  return <section className="space-y-4">
    <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">Research Hub alerts</p><h2 className="mt-2 text-lg font-semibold">Recent reminders</h2></div><LocalizedClientLink href="/account/notifications" className="text-sm font-medium text-ui-fg-interactive">View all notifications</LocalizedClientLink></div>
    {loading ? <div className="rounded-xl border border-ui-border-base bg-white p-5 text-sm text-ui-fg-subtle">Loading reminders…</div> : notifications.length ? <div className="space-y-3">{notifications.map((notification) => <article key={notification.id} className="rounded-lg border border-ui-border-base bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{notification.title}</h3><p className="mt-1 text-sm text-ui-fg-subtle">{notification.body}</p><p className="mt-2 text-xs text-ui-fg-muted">{new Date(notification.available_at).toLocaleString("en-PH")}</p></div>{notification.status === "unread" ? <span className="h-2 w-2 rounded-full bg-blue-600" aria-label="Unread" /> : null}</div><div className="mt-3 flex flex-wrap gap-2">{notification.status === "unread" ? <button disabled={pending} onClick={() => mutate(notification, "mark_read")} className="rounded-lg border border-ui-border-base px-3 py-1.5 text-xs font-medium">Mark read</button> : null}{notification.snoozable ? <button disabled={pending} onClick={() => mutate(notification, "snooze")} className="rounded-lg border border-ui-border-base px-3 py-1.5 text-xs font-medium">Snooze 30 min</button> : null}<button disabled={pending} onClick={() => mutate(notification, "archive")} className="rounded-lg border border-ui-border-base px-3 py-1.5 text-xs font-medium">Archive</button></div></article>)}</div> : <div className="rounded-xl border border-ui-border-base bg-white p-5 text-sm text-ui-fg-subtle">No reminders are scheduled.</div>}
  </section>
}
