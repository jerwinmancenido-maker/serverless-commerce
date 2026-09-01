"use client"

import { BellAlert, XMark } from "@medusajs/icons"
import {
  listCustomerNotifications,
  markAllCustomerNotificationsRead,
  mutateCustomerNotification,
  retrieveCustomerNotificationUnreadCount,
  type CustomerNotification,
} from "@lib/data/customer-notifications"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

const CATEGORY_LABELS: Record<string, string> = {
  support: "Support",
  community: "Community",
  protocols: "Protocols",
  research: "Research Hub",
  rewards: "Rewards",
  system: "Account",
}

const formatWhen = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))

export const resolveNotificationHref = (item: CustomerNotification) => {
  const id = item.target.id
  switch (item.target.kind) {
    case "support_conversation":
      return id ? `/account/support/${encodeURIComponent(id)}` : "/account/support"
    case "community_thread":
      return "/account/community"
    case "protocol":
      return id ? `/account/research-hub/my-protocols/${encodeURIComponent(id)}` : "/account/research-hub/my-protocols"
    case "research_hub_section":
      return id ? `/account/research-hub?section=${encodeURIComponent(id)}` : "/account/research-hub"
    case "rewards":
      return "/account/rewards"
    default:
      return "/account/notifications"
  }
}

export default function NotificationBell() {
  const router = useRouter()
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CustomerNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const panelRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  const refresh = useCallback(async (includeItems = open) => {
    try {
      const [count, list] = await Promise.all([
        retrieveCustomerNotificationUnreadCount(),
        includeItems ? listCustomerNotifications({ limit: 10 }) : Promise.resolve(null),
      ])
      setUnread(count.unread_count)
      if (list) setItems(list.notifications)
      setError(null)
    } catch (requestError) {
      void requestError
      setError("Notifications could not be loaded. Try again.")
    }
  }, [open])

  useEffect(() => {
    refresh(false)
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh(open)
    }, 60_000)
    const onFocus = () => refresh(open)
    window.addEventListener("focus", onFocus)
    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("pepstack:customer-notifications")
      channelRef.current.onmessage = () => refresh(open)
    }
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", onFocus)
      channelRef.current?.close()
    }
  }, [open, refresh])

  useEffect(() => {
    refresh(open)
  }, [open, pathname, refresh])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    refresh(true).finally(() => setLoading(false))
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onPointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("mousedown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("mousedown", onPointerDown)
    }
  }, [open, refresh])

  const notifyChange = () => {
    channelRef.current?.postMessage({ changed: true })
    refresh(true)
  }

  const openItem = (item: CustomerNotification) => {
    startTransition(async () => {
      await mutateCustomerNotification(item.id, { action: "open" })
      notifyChange()
      setOpen(false)
      router.push(`/${countryCode}${resolveNotificationHref(item)}`)
    })
  }

  const markAllRead = () => {
    startTransition(async () => {
      await markAllCustomerNotificationsRead()
      notifyChange()
    })
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-ui-bg-subtle hover:text-ui-fg-base"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
      >
        <BellAlert />
        {unread ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <aside
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-0 bottom-0 z-[950] flex max-h-[78dvh] flex-col rounded-t-2xl border border-ui-border-base bg-white shadow-2xl small:absolute small:bottom-auto small:right-0 small:top-12 small:w-[390px] small:rounded-2xl"
        >
          <header className="flex items-start justify-between gap-4 border-b border-ui-border-base px-5 py-4">
            <div>
              <h2 className="font-semibold text-ui-fg-base">Notifications</h2>
              <p className="mt-0.5 text-xs text-ui-fg-subtle">Updates that need your attention.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="rounded-lg p-2 hover:bg-ui-bg-subtle"><XMark /></button>
          </header>
          <div className="flex items-center justify-between border-b border-ui-border-base px-5 py-3">
            <span className="text-xs text-ui-fg-subtle">{unread ? `${unread} unread` : "You are up to date"}</span>
            <button type="button" disabled={!unread || pending} onClick={markAllRead} className="text-xs font-medium text-ui-fg-interactive disabled:opacity-40">Mark all as read</button>
          </div>
          <div className="min-h-32 flex-1 overflow-y-auto">
            {loading ? <p className="p-5 text-sm text-ui-fg-subtle">Loading notifications…</p> : null}
            {!loading && error ? <p role="alert" className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            {!loading && !error && !items.length ? <p className="p-5 text-sm text-ui-fg-subtle">No notifications yet.</p> : null}
            {!loading && !error ? items.map((item) => (
              <button key={item.id} type="button" onClick={() => openItem(item)} disabled={pending} className="flex w-full gap-3 border-b border-ui-border-base px-5 py-4 text-left hover:bg-ui-bg-subtle">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.status === "unread" ? "bg-blue-600" : "bg-transparent"}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-ui-fg-subtle">{CATEGORY_LABELS[item.category] || item.category}</span>
                    <span className="text-[11px] text-ui-fg-muted">{formatWhen(item.created_at)}</span>
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-ui-fg-base">{item.title}</span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-ui-fg-subtle">{item.body}</span>
                </span>
              </button>
            )) : null}
          </div>
          <footer className="border-t border-ui-border-base px-5 py-4 text-center">
            <LocalizedClientLink href="/account/notifications" onClick={() => setOpen(false)} className="text-sm font-medium text-ui-fg-interactive">View all notifications</LocalizedClientLink>
          </footer>
        </aside>
      ) : null}
    </div>
  )
}
