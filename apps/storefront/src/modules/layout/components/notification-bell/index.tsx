"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import {
  Beaker,
  BellAlert,
  ChatBubble,
  ChatBubbleLeftRight,
  CogSixTooth,
  Gift,
  XMark,
} from "@medusajs/icons"
import {
  listCustomerNotifications,
  markAllCustomerNotificationsRead,
  mutateCustomerNotification,
  retrieveCustomerNotificationUnreadCount,
  type CustomerNotification,
} from "@lib/data/customer-notifications"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, usePathname, useRouter } from "next/navigation"
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"

const CATEGORY_LABELS: Record<string, string> = {
  support: "Support",
  community: "Community",
  protocols: "Protocols",
  research: "Research Hub",
  rewards: "Rewards",
  system: "Account",
}

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

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "protocols":
      return <Beaker className="h-5 w-5 text-emerald-600" />
    case "rewards":
      return <Gift className="h-5 w-5 text-amber-600" />
    case "support":
      return <ChatBubbleLeftRight className="h-5 w-5 text-sky-600" />
    case "community":
      return <ChatBubble className="h-5 w-5 text-indigo-600" />
    default:
      return <BellAlert className="h-5 w-5 text-slate-600" />
  }
}

const formatWhen = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))

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

export const resolveNotificationHref = (item: CustomerNotification) => {
  const id = item.target.id
  switch (item.target.kind) {
    case "support_conversation":
      return id ? `/account/support/${encodeURIComponent(id)}` : "/account/support"
    case "community_thread":
      return "/account/community"
    case "protocol":
      return id
        ? `/account/research-hub/my-protocols/${encodeURIComponent(id)}`
        : "/account/research-hub/my-protocols"
    case "research_hub_section":
      return id
        ? `/account/research-hub?section=${encodeURIComponent(id)}`
        : "/account/research-hub"
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
  const [activeTimer, setActiveTimer] = useState<
    ReturnType<typeof setTimeout> | undefined
  >(undefined)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CustomerNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const channelRef = useRef<BroadcastChannel | null>(null)

  const handleOpen = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("pepstack:header-popover-opened", {
          detail: "notifications",
        })
      )
    }
    setOpen(true)
  }

  const handleClose = useCallback(() => {
    if (activeTimer) {
      clearTimeout(activeTimer)
      setActiveTimer(undefined)
    }
    setOpen(false)
  }, [activeTimer])

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
      setActiveTimer(undefined)
    }
    handleOpen()
  }

  const handleMouseLeave = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }
    const timer = setTimeout(handleClose, 120)
    setActiveTimer(timer)
  }

  // Listen for other header popovers opening to maintain mutual exclusivity
  useEffect(() => {
    const handleOtherPopover = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      if (customEvent.detail !== "notifications") {
        handleClose()
      }
    }

    window.addEventListener("pepstack:header-popover-opened", handleOtherPopover)
    return () => {
      window.removeEventListener(
        "pepstack:header-popover-opened",
        handleOtherPopover
      )
    }
  }, [handleClose])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  // Close when route changes
  useEffect(() => {
    handleClose()
  }, [pathname, handleClose])

  const refresh = useCallback(
    async (includeItems = open) => {
      try {
        const [count, list] = await Promise.all([
          retrieveCustomerNotificationUnreadCount(),
          includeItems
            ? listCustomerNotifications({ limit: 10 })
            : Promise.resolve(null),
        ])
        setUnread(count.unread_count)
        if (list) setItems(list.notifications)
        setError(null)
      } catch (requestError) {
        void requestError
        setError("Notifications could not be loaded. Try again.")
      }
    },
    [open]
  )

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
    if (open) {
      setLoading(true)
      refresh(true).finally(() => setLoading(false))
    }
  }, [open, refresh])

  const notifyChange = () => {
    channelRef.current?.postMessage({ changed: true })
    refresh(true)
  }

  const openItem = (item: CustomerNotification) => {
    if (item.status === "unread") {
      setUnread((prev) => Math.max(0, prev - 1))
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "read" as const } : i))
      )
    }
    startTransition(async () => {
      try {
        await mutateCustomerNotification(item.id, { action: "open" })
        notifyChange()
      } catch (err) {
        void err
      }
      handleClose()
      router.push(`/${countryCode}${resolveNotificationHref(item)}`)
    })
  }

  const markAllRead = () => {
    setUnread(0)
    setItems((prev) => prev.map((item) => ({ ...item, status: "read" as const })))
    startTransition(async () => {
      try {
        await markAllCustomerNotificationsRead()
        notifyChange()
      } catch (err) {
        void err
        refresh(true)
      }
    })
  }

  return (
    <div
      className="h-full z-50 relative flex items-center"
      onMouseEnter={openAndCancel}
      onMouseLeave={handleMouseLeave}
    >
      <Popover className="relative h-full flex items-center">
        <PopoverButton
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer focus:outline-none"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          onClick={() => setOpen((prev) => !prev)}
        >
          <BellAlert className="h-5 w-5" />
          {unread ? (
            <span className="absolute -top-1 -right-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-xs border-2 border-white">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </PopoverButton>

        {/* Desktop Panel: Matches CartDropdown structure and transitions */}
        <Transition
          show={open}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute small:absolute top-[calc(100%+8px)] right-0 bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-[420px] text-slate-800 overflow-hidden z-50 before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
            data-testid="nav-notifications-dropdown"
          >
            {/* Header: Mirroring CartDropdown */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Research Alerts</h3>
                <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {unread} {unread === 1 ? "Update" : "Updates"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LocalizedClientLink
                  href="/account/settings/notifications"
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                  title="Notification Preferences"
                  aria-label="Notification Preferences"
                >
                  <CogSixTooth className="h-4 w-4" />
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/account/notifications"
                  onClick={handleClose}
                  className="text-xs font-medium text-slate-500 hover:text-emerald-700 transition-colors"
                >
                  View full history &rarr;
                </LocalizedClientLink>
              </div>
            </div>

            {/* Notification Item Cards / Empty State */}
            {items && items.length ? (
              <>
                <div className="overflow-y-scroll max-h-[380px] p-3 flex flex-col gap-y-2.5 no-scrollbar">
                  {loading && !items.length ? (
                    <div className="p-6 text-center text-xs text-slate-500 font-medium">
                      Loading notifications…
                    </div>
                  ) : null}
                  {error ? (
                    <p
                      role="alert"
                      className="m-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700"
                    >
                      {error}
                    </p>
                  ) : null}
                  {items.map((item) => {
                    const isUnread = item.status === "unread"
                    const protocolName =
                      item.target.kind === "protocol"
                        ? formatProtocolName(item.target.id)
                        : null
                    const displayTitle =
                      protocolName && item.title.toLowerCase().includes("protocol")
                        ? `${protocolName} · Protocol Access Ready`
                        : item.title
                    const displayBody = item.body.replace(
                      "1 points were added",
                      "1 point was added"
                    )

                    return (
                      <div
                        key={item.id}
                        onClick={() => openItem(item)}
                        className={`grid grid-cols-[44px_1fr] gap-x-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isUnread
                            ? "border-emerald-200/80 bg-emerald-50/20 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-2xs"
                            : "border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/60"
                        }`}
                        data-testid="notification-card-item"
                      >
                        <div className="w-11 h-11 rounded-lg border border-slate-200/70 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {displayTitle}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-medium shrink-0 whitespace-nowrap">
                                {formatWhen(item.created_at)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mt-0.5">
                              {displayBody}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 text-[10px]">
                            <span
                              className={`font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border text-[9px] ${getCategoryBadgeStyle(
                                item.category
                              )}`}
                            >
                              {CATEGORY_LABELS[item.category] || item.category}
                            </span>
                            <span className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1">
                              <span>Open alert</span>
                              <span>&rarr;</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Footer: Exact match to CartDropdown footer */}
                <div className="p-4 flex flex-col gap-y-3 bg-slate-50/70 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      {unread > 0
                        ? `${unread} unread update${unread === 1 ? "" : "s"}`
                        : "All alerts reviewed"}
                    </span>
                    {unread > 0 && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={markAllRead}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer disabled:opacity-40"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Real-time research alert stream &middot; Metro Manila Hub</span>
                  </div>
                  <LocalizedClientLink
                    href="/account/notifications"
                    onClick={handleClose}
                    className="w-full"
                  >
                    <button
                      type="button"
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                      data-testid="go-to-notifications-button"
                    >
                      <span>Open Notification Center</span>
                      <span>&rarr;</span>
                    </button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3 border border-slate-200/80">
                  <BellAlert className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  All Laboratory Alerts Caught Up
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  No unread research protocol, routine, or delivery notices.
                </p>
                <div className="mt-4">
                  <LocalizedClientLink
                    href="/account/notifications"
                    onClick={handleClose}
                  >
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all">
                      View Notification History &rarr;
                    </span>
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>

      {/* Mobile Drawer/Backdrop Sheet for small viewports */}
      {open && (
        <div className="small:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[940]"
            onClick={handleClose}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-label="Notifications"
            className="fixed inset-x-3 bottom-3 z-[950] flex max-h-[82dvh] flex-col rounded-2xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden"
          >
            {/* Mobile Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Research Alerts</h3>
                <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {unread} {unread === 1 ? "Update" : "Updates"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <LocalizedClientLink
                  href="/account/settings/notifications"
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <CogSixTooth className="h-4 w-4" />
                </LocalizedClientLink>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <XMark className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile Item List */}
            <div className="overflow-y-scroll max-h-[60vh] p-3 flex flex-col gap-y-2.5 no-scrollbar">
              {items && items.length ? (
                items.map((item) => {
                  const isUnread = item.status === "unread"
                  const protocolName =
                    item.target.kind === "protocol"
                      ? formatProtocolName(item.target.id)
                      : null
                  const displayTitle =
                    protocolName && item.title.toLowerCase().includes("protocol")
                      ? `${protocolName} · Protocol Access Ready`
                      : item.title
                  const displayBody = item.body.replace(
                    "1 points were added",
                    "1 point was added"
                  )

                  return (
                    <div
                      key={item.id}
                      onClick={() => openItem(item)}
                      className={`grid grid-cols-[44px_1fr] gap-x-3 p-2.5 rounded-xl border transition-all ${
                        isUnread
                          ? "border-emerald-200/80 bg-emerald-50/20"
                          : "border-slate-100 bg-white"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-lg border border-slate-200/70 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {displayTitle}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {formatWhen(item.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mt-0.5">
                            {displayBody}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80 text-[10px]">
                          <span
                            className={`font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border text-[9px] ${getCategoryBadgeStyle(
                              item.category
                            )}`}
                          >
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <span>Open alert</span>
                            <span>&rarr;</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  All laboratory alerts caught up.
                </div>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="p-4 flex flex-col gap-y-3 bg-slate-50/70 border-t border-slate-100">
              <LocalizedClientLink
                href="/account/notifications"
                onClick={handleClose}
                className="w-full"
              >
                <button
                  type="button"
                  className="w-full h-11 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs"
                >
                  <span>Open Notification Center</span>
                  <span>&rarr;</span>
                </button>
              </LocalizedClientLink>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
