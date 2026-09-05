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
import { BellAlert, CheckCircleSolid } from "@medusajs/icons"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"

const CATEGORIES: Array<{ value: "all" | "unread" | "reminders" | CustomerNotificationCategory; label: string }> = [
  { value: "all", label: "All Alerts" },
  { value: "unread", label: "Unread" },
  { value: "protocols", label: "Protocols" },
  { value: "research", label: "Research Hub" },
  { value: "reminders", label: "Reminders" },
  { value: "support", label: "Support" },
  { value: "community", label: "Community" },
  { value: "rewards", label: "Rewards" },
]

const getCategoryBadgeStyle = (category: string) => {
  switch (category) {
    case "protocols":
      return "bg-emerald-50 text-emerald-800 border-emerald-200/80"
    case "rewards":
      return "bg-amber-50 text-amber-800 border-amber-200/80"
    case "support":
      return "bg-sky-50 text-sky-800 border-sky-200/80"
    case "community":
      return "bg-indigo-50 text-indigo-800 border-indigo-200/80"
    case "research":
      return "bg-teal-50 text-teal-800 border-teal-200/80"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200/80"
  }
}

const formatWhen = (value: string) =>
  new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))

const formatProtocolName = (handle?: string | null) => {
  if (!handle) return null
  return handle
    .split("-")
    .map((part) =>
      part.length <= 4 || /\d/.test(part)
        ? part.toUpperCase()
        : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ")
}

export default function NotificationCenter({
  initialItems,
  initialCount,
}: {
  initialItems: CustomerNotification[]
  initialCount: number
}) {
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

  const markAllReadOptimistic = () => {
    setItems((prev) => prev.map((item) => ({ ...item, status: "read" as const })))
    run(markAllCustomerNotificationsRead)
  }

  return (
    <div className="space-y-6" data-testid="notification-center-page">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block mb-2">
            System &amp; Laboratory Telemetry
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Notifications &amp; Activity Log
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Support conversations, protocol access grants, Research Hub updates, and order activity.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllReadOptimistic}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors disabled:opacity-40 cursor-pointer shrink-0"
        >
          <CheckCircleSolid className="h-4 w-4 text-emerald-600" />
          <span>Mark all as read</span>
        </button>
      </header>

      {/* Segmented Filter Pills */}
      <div
        className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar w-full"
        role="tablist"
        aria-label="Notification category filters"
      >
        {CATEGORIES.map((option) => {
          const isActive = filter === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setOffset(0)
                setFilter(option.value)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {/* Notifications List Card */}
      <section
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs"
        aria-busy={loading || pending}
      >
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            Loading notifications…
          </div>
        ) : null}

        {!loading && !items.length ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BellAlert className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Alerts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              There are no notifications matching the current filter view.
            </p>
          </div>
        ) : null}

        {!loading ? (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const isUnread = item.status === "unread"
              const protocolName =
                item.target.kind === "protocol" ? formatProtocolName(item.target.id) : null
              const displayTitle =
                protocolName && item.title.toLowerCase().includes("protocol")
                  ? `${protocolName} · Protocol Access Ready`
                  : item.title
              const displayBody = item.body.replace("1 points were added", "1 point was added")

              return (
                <article
                  key={item.id}
                  className={`p-5 transition-colors ${
                    isUnread ? "bg-emerald-50/20" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        isUnread ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryBadgeStyle(
                                item.category
                              )}`}
                            >
                              {item.category === "protocols" ? "Protocols" : item.category}
                            </span>
                            {["high", "urgent"].includes(item.priority) && (
                              <span className="rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase">
                                {item.priority}
                              </span>
                            )}
                          </div>
                          <h2 className="text-sm font-bold text-slate-900">{displayTitle}</h2>
                        </div>
                        <time
                          className="text-[11px] text-slate-400 font-medium whitespace-nowrap"
                          dateTime={item.created_at}
                        >
                          {formatWhen(item.created_at)}
                        </time>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {displayBody}
                      </p>
                      <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                        {item.action_label && (
                          <button
                            type="button"
                            onClick={() => open(item)}
                            disabled={pending}
                            className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer mr-2"
                          >
                            {item.action_label} &rarr;
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            run(() =>
                              mutateCustomerNotification(item.id, {
                                action: isUnread ? "mark_read" : "mark_unread",
                              })
                            )
                          }
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          Mark {isUnread ? "read" : "unread"}
                        </button>
                        {item.snoozable && (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              run(() =>
                                mutateCustomerNotification(item.id, {
                                  action: "snooze",
                                  snoozed_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                                })
                              )
                            }
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            Snooze 1 day
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => archiveCustomerNotifications([item.id]))}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>

      {/* Pagination Footer */}
      <footer className="flex items-center justify-between text-xs text-slate-500">
        <p className="font-medium">
          {count ? `${offset + 1}–${Math.min(offset + limit, count)} of ${count} alerts` : "0 notifications"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!offset || loading}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={offset + limit >= count || loading}
            onClick={() => setOffset(offset + limit)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  )
}
