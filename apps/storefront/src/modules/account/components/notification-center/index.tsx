"use client"

import {
  archiveCustomerNotifications,
  listCustomerNotifications,
  markAllCustomerNotificationsRead,
  mutateCustomerNotification,
  type CustomerNotification,
  type CustomerNotificationCategory,
} from "@lib/data/customer-notifications"
import { resolveNotificationHref } from "@modules/layout/components/notification-bell"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"

const CATEGORIES: Array<{ value: "all" | "unread" | "reminders" | CustomerNotificationCategory; label: string }> = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "reminders", label: "Reminders" },
  { value: "support", label: "Support" },
  { value: "community", label: "Community" },
  { value: "protocols", label: "Protocols" },
  { value: "research", label: "Research Hub" },
  { value: "rewards", label: "Rewards" },
]

const formatWhen = (value: string) =>
  new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))

export default function NotificationCenter({ initialItems, initialCount }: { initialItems: CustomerNotification[]; initialCount: number }) {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]["value"]>("all")
  const [items, setItems] = useState(initialItems)
  const [count, setCount] = useState(initialCount)
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pending, startTransition] = useTransition()
  const channelRef = useRef<BroadcastChannel | null>(null)
  const initialRender = useRef(true)
  const limit = 20

  const query = useMemo(() => ({
    ...(filter === "unread" ? { status: "unread" as const } : {}),
    ...(filter === "reminders" ? { event_key: "research.routine_reminder" } : {}),
    ...(!["all", "unread", "reminders"].includes(filter) ? { category: filter as CustomerNotificationCategory } : {}),
    offset,
    limit,
  }), [filter, offset])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await listCustomerNotifications(query)
      setItems(result.notifications)
      setCount(result.count)
      setError(null)
    } catch (requestError) {
      void requestError
      setError("Notifications could not be loaded. Try again.")
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    refresh()
  }, [filter, offset, refresh])

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return
    channelRef.current = new BroadcastChannel("pepstack:customer-notifications")
    channelRef.current.onmessage = refresh
    return () => channelRef.current?.close()
  }, [refresh])

  const changed = () => {
    channelRef.current?.postMessage({ changed: true })
    refresh()
  }

  const run = (work: () => Promise<unknown>) => startTransition(async () => {
    try {
      await work()
      changed()
    } catch (requestError) {
      void requestError
      setError("This notification could not be updated. Try again.")
    }
  })

  const open = (item: CustomerNotification) => run(async () => {
    await mutateCustomerNotification(item.id, { action: "open" })
    router.push(`/${countryCode}${resolveNotificationHref(item)}`)
  })

  return (
    <div className="space-y-6" data-testid="notification-center-page">
      <header className="flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
        <div>
          <h1 className="text-2xl-semi">Notifications</h1>
          <p className="mt-2 text-sm text-ui-fg-subtle">Support, community, protocol, Research Hub, and rewards updates in one place.</p>
        </div>
        <button type="button" onClick={() => run(markAllCustomerNotificationsRead)} disabled={pending} className="rounded-lg border border-ui-border-base px-4 py-2 text-sm font-medium hover:bg-ui-bg-subtle disabled:opacity-50">Mark all as read</button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Notification filters">
        {CATEGORIES.map((option) => (
          <button key={option.value} type="button" role="tab" aria-selected={filter === option.value} onClick={() => { setOffset(0); setFilter(option.value) }} className={`min-w-max rounded-full border px-4 py-2 text-sm ${filter === option.value ? "border-ui-fg-base bg-ui-fg-base text-white" : "border-ui-border-base hover:bg-ui-bg-subtle"}`}>{option.label}</button>
        ))}
      </div>

      {error ? <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      <section className="overflow-hidden rounded-xl border border-ui-border-base bg-white" aria-busy={loading || pending}>
        {loading ? <p className="p-6 text-sm text-ui-fg-subtle">Loading notifications…</p> : null}
        {!loading && !items.length ? <p className="p-8 text-center text-sm text-ui-fg-subtle">No notifications match this view.</p> : null}
        {!loading ? items.map((item) => (
          <article key={item.id} className={`border-b border-ui-border-base p-5 last:border-b-0 ${item.status === "unread" ? "bg-blue-50/40" : "bg-white"}`}>
            <div className="flex gap-4">
              <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${item.status === "unread" ? "bg-blue-600" : "bg-ui-bg-disabled"}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 small:flex-row small:items-start small:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ui-fg-subtle"><span>{item.category === "protocols" ? "Protocols" : item.category}</span>{["high", "urgent"].includes(item.priority) ? <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700">{item.priority}</span> : null}</p>
                    <h2 className="mt-1 text-base-semi text-ui-fg-base">{item.title}</h2>
                  </div>
                  <time className="text-xs text-ui-fg-muted" dateTime={item.created_at}>{formatWhen(item.created_at)}</time>
                </div>
                <p className="mt-2 text-sm leading-6 text-ui-fg-subtle">{item.body}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  {item.action_label ? <button type="button" onClick={() => open(item)} disabled={pending} className="font-semibold text-ui-fg-interactive">{item.action_label}</button> : null}
                  <button type="button" disabled={pending} onClick={() => run(() => mutateCustomerNotification(item.id, { action: item.status === "unread" ? "mark_read" : "mark_unread" }))} className="text-ui-fg-subtle hover:text-ui-fg-base">Mark {item.status === "unread" ? "as read" : "as unread"}</button>
                  {item.snoozable ? <button type="button" disabled={pending} onClick={() => run(() => mutateCustomerNotification(item.id, { action: "snooze", snoozed_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }))} className="text-ui-fg-subtle hover:text-ui-fg-base">Snooze 1 day</button> : null}
                  <button type="button" disabled={pending} onClick={() => run(() => archiveCustomerNotifications([item.id]))} className="text-ui-fg-subtle hover:text-ui-fg-base">Archive</button>
                </div>
              </div>
            </div>
          </article>
        )) : null}
      </section>

      <footer className="flex items-center justify-between">
        <p className="text-sm text-ui-fg-subtle">{count ? `${offset + 1}–${Math.min(offset + limit, count)} of ${count}` : "0 notifications"}</p>
        <div className="flex gap-2">
          <button type="button" disabled={!offset || loading} onClick={() => setOffset(Math.max(0, offset - limit))} className="rounded-lg border border-ui-border-base px-4 py-2 text-sm disabled:opacity-40">Previous</button>
          <button type="button" disabled={offset + limit >= count || loading} onClick={() => setOffset(offset + limit)} className="rounded-lg border border-ui-border-base px-4 py-2 text-sm disabled:opacity-40">Next</button>
        </div>
      </footer>
    </div>
  )
}
