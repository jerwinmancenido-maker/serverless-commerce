"use client"

import {
  broadcastSupportTyping,
  markSupportRead,
  postThreadMessageAction,
  retrieveSupportAttachmentUrl,
  retrieveSupportSummary,
  retrieveSupportThread,
  type SupportActionState,
  type SupportConfiguration,
  type SupportConversationDetail,
  type SupportSummary,
} from "@lib/data/customer-support"
import {
  ChatCard,
  parseMessageCards,
  type ParsedCard,
} from "@modules/account/components/customer-support/chat-card"
import CustomerEntityPickerModal from "@modules/account/components/customer-support/customer-entity-picker-modal"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"

const EMPTY_ACTION: SupportActionState = { success: false, error: null }

const EMOJI_LIST = [
  "👍", "👋", "🧪", "🔬", "💊", "📦", "✨", "😊",
  "🙌", "🙏", "❤️", "🔥", "⚡", "💡", "❓", "✅",
]

type AttachmentItem = {
  id: string
  file_name: string
  mime_type: string
  size_bytes: number
  scan_status?: string
  local_preview?: string
}

type MessageItem = {
  id: string
  sender?: string
  sender_type: "customer" | "staff" | "system"
  body: string
  sent_at: string
  status?: "sending" | "sent" | "failed"
  attachment_file?: File
  attachments: AttachmentItem[]
}

const pathCategory = (pathname: string) => {
  if (pathname.includes("/order")) return "order"
  if (pathname.includes("/checkout")) return "payment"
  if (pathname.includes("/research-protocol")) return "protocol_access"
  if (pathname.includes("/rewards")) return "rewards"
  if (pathname.includes("/settings")) return "account"
  if (pathname.includes("/products/")) return "product"
  return "other"
}

const pathOrderId = (pathname: string) => {
  const match = pathname.match(/\/(?:order|orders)\/(order_[^/]+)/)
  return match?.[1] || null
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`
}

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

const getDateDividerLabel = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
}

const isNewSession = (currentDate: string, previousDate?: string) => {
  if (!previousDate) return false
  const diffHours = (new Date(currentDate).getTime() - new Date(previousDate).getTime()) / (1000 * 60 * 60)
  return diffHours >= 24
}

const getAvailabilityStatus = (configuration: SupportConfiguration) => {
  if (!configuration.enabled) {
    return { status: "offline", label: "Support is offline", details: configuration.offline_message }
  }
  if (!configuration.business_hours_enabled) {
    return { status: "online", label: "Support is online", details: configuration.response_time_message }
  }

  const now = new Date()
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: configuration.timezone,
    weekday: "short",
  }).format(now)
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday)
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: configuration.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now)

  const todayHours = configuration.business_hours.find((entry) => entry.day === day)
  if (todayHours?.open && todayHours.opens_at && todayHours.closes_at && time >= todayHours.opens_at && time < todayHours.closes_at) {
    return { status: "online", label: "Support is online", details: `Open today until ${todayHours.closes_at}` }
  }

  let nextOpen = "soon"
  for (let i = 1; i <= 7; i++) {
    const nextDay = (day + i) % 7
    const entry = configuration.business_hours.find((h) => h.day === nextDay)
    if (entry?.open && entry.opens_at) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      nextOpen = i === 1 ? `tomorrow at ${entry.opens_at}` : `${dayNames[nextDay]} at ${entry.opens_at}`
      break
    }
  }

  return { status: "away", label: "Away", details: `Back ${nextOpen} (PHT)` }
}

export default function SupportPanel({
  signedIn,
  configuration,
}: {
  signedIn: boolean
  configuration: SupportConfiguration
}) {
  const pathname = usePathname()
  const countryCode = pathname.split("/").filter(Boolean)[0] || "ph"
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState<SupportSummary | null>(null)
  const [conversation, setConversation] = useState<SupportConversationDetail | null>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [nudge, setNudge] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const hidden =
    !configuration.enabled ||
    !configuration.side_panel_enabled ||
    pathname.includes("/account/support")

  const availability = useMemo(() => getAvailabilityStatus(configuration), [configuration])
  const currentCategory = useMemo(() => pathCategory(pathname), [pathname])
  const currentOrderId = useMemo(() => pathOrderId(pathname), [pathname])

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }, [])

  const refreshSummary = useCallback(async () => {
    if (!signedIn) return
    try {
      setSummary(await retrieveSupportSummary())
    } catch {
      // Ignore background summary errors
    }
  }, [signedIn])

  const loadThread = useCallback(async () => {
    if (!signedIn) return
    try {
      setLoading(true)
      setErrorMessage(null)
      const res = await retrieveSupportThread()
      setConversation(res.conversation)
      setOptimisticMessages([])
      await markSupportRead(res.conversation.id).catch(() => undefined)
      await refreshSummary()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Support could not be loaded.")
    } finally {
      setLoading(false)
    }
  }, [signedIn, refreshSummary])

  useEffect(() => {
    if (open && signedIn) {
      loadThread()
    }
  }, [open, signedIn, loadThread])

  useEffect(() => {
    if (!open || !signedIn || !conversation?.id) return
    const poll = async () => {
      if (document.visibilityState !== "visible") return
      try {
        const res = await retrieveSupportThread()
        setConversation(res.conversation)
        setOptimisticMessages([])
      } catch {
        // Silent poll error handling
      }
    }
    const timer = window.setInterval(poll, 3500)
    window.addEventListener("focus", poll)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", poll)
    }
  }, [open, signedIn, conversation?.id])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    if (open) return
    const isTargetPage = pathname.includes("/products/") || pathname.includes("/research-protocol")
    if (!isTargetPage) return

    const sessionKey = `pepstack:nudge-seen:${pathname}`
    if (window.sessionStorage.getItem(sessionKey)) return

    const timer = window.setTimeout(() => {
      setNudge(true)
      window.sessionStorage.setItem(sessionKey, "true")
    }, 60_000)

    return () => window.clearTimeout(timer)
  }, [pathname, open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  useEffect(() => {
    if (open) {
      scrollToBottom(false)
    }
  }, [conversation?.messages.length, optimisticMessages.length, open, scrollToBottom])

  if (hidden) return null

  const allMessages: MessageItem[] = [
    ...(conversation?.messages || []),
    ...optimisticMessages.filter((opt) => !(conversation?.messages || []).some((m) => m.id === opt.id)),
  ]

  const filteredMessages = searchQuery.trim()
    ? allMessages.filter((m) => m.body.toLowerCase().includes(searchQuery.toLowerCase()))
    : allMessages

  return (
    <div className="fixed bottom-4 right-4 z-[900] flex flex-col items-end small:bottom-6 small:right-6">
      {open ? (
        <aside
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label={configuration.display_name}
          className="fixed inset-x-0 bottom-0 flex h-[85dvh] flex-col overflow-hidden rounded-t-3xl border border-zinc-200/90 bg-white shadow-2xl outline-none small:static small:h-[620px] small:w-[400px] small:rounded-3xl"
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-zinc-100 bg-white/95 backdrop-blur-md px-4 py-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex items-center justify-center">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    availability.status === "online"
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                      : availability.status === "away"
                      ? "bg-amber-500"
                      : "bg-zinc-400"
                  }`}
                />
                {availability.status === "online" && (
                  <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold leading-tight truncate text-zinc-900">
                  {configuration.display_name}
                </h2>
                <p className="text-[11px] text-zinc-400 truncate">
                  {availability.label} · {availability.details}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {signedIn && (
                <button
                  type="button"
                  onClick={() => setIsSearching(!isSearching)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
                  aria-label="Search conversation"
                  title="Search in messages"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
                aria-label="Minimize support"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </header>

          {/* Search bar when toggled */}
          {isSearching && signedIn && (
            <div className="flex items-center gap-2 border-b border-ui-border-base bg-ui-bg-subtle px-3 py-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in conversation…"
                className="w-full rounded-md border border-ui-border-base bg-white px-2.5 py-1 text-xs outline-none focus:border-ui-fg-base"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-ui-fg-muted hover:text-ui-fg-base"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Connection offline alert */}
          {!isOnline && (
            <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 text-center text-[11px] font-medium text-amber-800">
              ⚠️ Connection lost. Trying to reconnect…
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border-b border-red-200 px-3 py-1.5 text-center text-[11px] font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50">
            {!signedIn ? (
              <GuestVoucherPanel countryCode={countryCode} pathname={pathname} />
            ) : loading && !conversation ? (
              <div className="flex h-full flex-col items-center justify-center space-y-2 text-ui-fg-subtle">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-ui-fg-base border-t-transparent" />
                <p className="text-xs">Connecting to secure chat…</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center px-4 space-y-2 text-ui-fg-subtle">
                <div className="h-10 w-10 rounded-full bg-ui-bg-subtle flex items-center justify-center text-lg">
                  🧪
                </div>
                <p className="text-sm font-semibold text-ui-fg-base">Start your private thread</p>
                <p className="text-xs text-ui-fg-subtle max-w-[260px]">
                  Ask about research protocols, peptide compounds, orders, or delivery. Our support team is here to assist.
                </p>
              </div>
            ) : (
              <MessageList
                messages={filteredMessages}
                countryCode={countryCode}
                staffLastReadAt={conversation?.staff_last_read_at}
                staffTyping={conversation?.staff_typing}
                onRetry={(failedMsg) => {
                  setOptimisticMessages((prev) =>
                    prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "sending" } : m))
                  )
                  startTransition(async () => {
                    const data = new FormData()
                    data.set("country_code", countryCode)
                    data.set("body", failedMsg.body)
                    data.set("category", currentCategory)
                    data.set("client_request_id", failedMsg.id)
                    if (currentOrderId) data.set("order_id", currentOrderId)
                    if (failedMsg.attachment_file) data.set("attachment", failedMsg.attachment_file)

                    const result = await postThreadMessageAction(EMPTY_ACTION, data)
                    if (!result.success) {
                      setErrorMessage(result.error)
                      setOptimisticMessages((prev) =>
                        prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "failed" } : m))
                      )
                    } else {
                      loadThread()
                    }
                  })
                }}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Messenger input bar (only for logged-in users) */}
          {signedIn && (
            <MessengerInput
              countryCode={countryCode}
              configuration={configuration}
              category={currentCategory}
              orderId={currentOrderId}
              onSendOptimistic={(optMsg) => {
                setOptimisticMessages((prev) => [...prev, optMsg])
                scrollToBottom(true)
              }}
              onSent={() => {
                loadThread()
              }}
              onError={(err, reqId) => {
                setErrorMessage(err)
                if (reqId) {
                  setOptimisticMessages((prev) =>
                    prev.map((m) => (m.id === reqId ? { ...m, status: "failed" } : m))
                  )
                }
              }}
            />
          )}

          {/* Footer */}
          <footer className="border-t border-ui-border-base bg-ui-bg-subtle/30 px-4 py-2 text-center text-[11px] text-ui-fg-subtle flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Private & Encrypted
            </span>
            <a
              href={`/${countryCode}/account/support`}
              className="font-medium text-ui-fg-interactive hover:underline"
            >
              Full Center ↗
            </a>
          </footer>
        </aside>
      ) : (
        /* Floating Support Pill */
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            setNudge(false)
          }}
          className={`relative flex items-center gap-2.5 rounded-full bg-ui-fg-base px-5 py-3 text-sm font-semibold text-white shadow-xl hover:opacity-95 transition-all active:scale-95 ${
            nudge ? "animate-bounce ring-4 ring-emerald-400/50" : ""
          }`}
          aria-label={`Open ${configuration.display_name}`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              availability.status === "online" ? "bg-emerald-400" : "bg-zinc-400"
            }`}
          />
          <span>Support</span>
          {summary?.unread_count ? (
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white shadow"
              aria-label={`${summary.unread_count} unread support messages`}
            >
              {summary.unread_count}
            </span>
          ) : null}
        </button>
      )}
    </div>
  )
}

/**
 * Guest Conversion Panel with ₱200 Sign-up Voucher
 */
function GuestVoucherPanel({ countryCode, pathname }: { countryCode: string; pathname: string }) {
  const registerUrl = `/${countryCode}/account?ref=support_chat&callbackUrl=${encodeURIComponent(pathname)}`
  return (
    <div className="flex h-full flex-col justify-between py-2 text-center">
      <div className="space-y-4 pt-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ui-bg-base border border-ui-border-base shadow-sm text-2xl">
          💬
        </div>
        <div className="space-y-1.5 px-4">
          <h3 className="text-base font-bold text-ui-fg-base">Chat with PepStack Support</h3>
          <p className="text-xs text-ui-fg-subtle">
            Sign in to start a private, encrypted conversation about your research protocols, compounds, and orders.
          </p>
        </div>

        {/* Voucher Incentive Card */}
        <div className="mx-2 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              New Member Gift
            </span>
            <span className="text-xs font-bold text-emerald-800">✨ ₱200 OFF</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-emerald-950">
            Get ₱200 off your first compound order
          </p>
          <p className="text-[11px] text-emerald-700">
            Create an account in 30 seconds to unlock instant support chat and your welcome voucher.
          </p>
        </div>
      </div>

      <div className="space-y-2 px-2 pt-4">
        <a
          href={registerUrl}
          className="flex w-full items-center justify-center rounded-xl bg-ui-fg-base py-3 text-sm font-semibold text-white shadow-md hover:bg-black transition-all"
        >
          Create Account & Claim ₱200
        </a>
        <a
          href={`/${countryCode}/account?callbackUrl=${encodeURIComponent(pathname)}`}
          className="block text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base"
        >
          Already have an account? <span className="underline">Sign in</span>
        </a>
      </div>
    </div>
  )
}

/**
 * Message Feed with Date Separators, Attachments, and Seen Receipts
 */
function MessageList({
  messages,
  countryCode = "ph",
  staffLastReadAt,
  staffTyping,
  onRetry,
}: {
  messages: MessageItem[]
  countryCode?: string
  staffLastReadAt?: string | null
  staffTyping?: boolean
  onRetry: (msg: MessageItem) => void
}) {
  const staffReadTime = staffLastReadAt ? new Date(staffLastReadAt).getTime() : 0

  return (
    <div className="space-y-3">
      {messages.map((message, idx) => {
        const prevMessage = messages[idx - 1]
        const showDateDivider = !prevMessage || getDateDividerLabel(message.sent_at) !== getDateDividerLabel(prevMessage.sent_at)
        const showNewSession = isNewSession(message.sent_at, prevMessage?.sent_at)
        const isCustomer = message.sender_type === "customer"
        const isSeen = isCustomer && new Date(message.sent_at).getTime() <= staffReadTime

        return (
          <div key={message.id || idx} className="space-y-2">
            {showDateDivider && (
              <div className="flex items-center justify-center my-3">
                <span className="rounded-full bg-zinc-200/70 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                  {getDateDividerLabel(message.sent_at)}
                </span>
              </div>
            )}
            {showNewSession && (
              <div className="flex items-center justify-center my-2">
                <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-[10px] font-medium text-blue-700">
                  New Session · {new Date(message.sent_at).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            )}

            {message.sender_type === "system" ? (
              <div className="mx-auto max-w-[90%] text-center my-2">
                <p className="rounded-lg bg-zinc-100 px-3 py-1.5 text-[11px] text-zinc-600 italic">
                  {message.body}
                </p>
              </div>
            ) : (
              <div className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                {(() => {
                  const { cleanText, cards } = parseMessageCards(message.body)
                  const hasAttachments = Boolean(message.attachments && message.attachments.length > 0)
                  const showBubble = Boolean(cleanText || hasAttachments)

                  return (
                    <div className={`flex flex-col gap-1.5 ${isCustomer ? "items-end" : "items-start"}`}>
                      {showBubble && (
                        <div
                          className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                            isCustomer
                              ? "bg-zinc-900 text-white rounded-tr-xs"
                              : "bg-white border border-zinc-200/90 text-zinc-900 rounded-tl-xs"
                          }`}
                        >
                          {!isCustomer && (
                            <p className="text-[10px] font-semibold text-zinc-400 mb-0.5">
                              {message.sender || "Support Team"}
                            </p>
                          )}

                          {cleanText && (
                            <p className="whitespace-pre-wrap break-words text-[13px]">
                              {cleanText}
                            </p>
                          )}

                          {/* Attachments */}
                          {message.attachments?.map((attachment) => (
                            <AttachmentBubble key={attachment.id || attachment.file_name} attachment={attachment} isCustomer={isCustomer} />
                          ))}
                        </div>
                      )}

                      {/* Standalone cards: unbundled, clean, perfectly aligned */}
                      {cards.map((card, cIdx) => (
                        <div key={cIdx} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                          <ChatCard card={card} countryCode={countryCode} />
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* Status and Timestamp below bubble */}
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-ui-fg-muted">
                  <time>{formatMessageTime(message.sent_at)}</time>
                  {isCustomer && (
                    <span>
                      {message.status === "sending" ? (
                        <span className="text-zinc-400">⏳ Sending…</span>
                      ) : message.status === "failed" ? (
                        <button
                          type="button"
                          onClick={() => onRetry(message)}
                          className="text-red-600 underline font-semibold"
                        >
                          Retry
                        </button>
                      ) : isSeen ? (
                        <span className="text-emerald-600 font-semibold">✓✓ Seen</span>
                      ) : (
                        <span>✓ Sent</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Live Staff Typing Indicator Bubble */}
      {staffTyping && (
        <div className="flex items-center gap-2 px-2 py-1 text-xs text-ui-fg-muted animate-fade-in">
          <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 border border-zinc-200 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            <span className="ml-1.5 text-[11px] font-medium text-zinc-700">Support is typing…</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Inline Attachment Bubble (Images thumbnail or PDF card)
 */
function AttachmentBubble({ attachment, isCustomer }: { attachment: AttachmentItem; isCustomer: boolean }) {
  const isImage = attachment.mime_type?.startsWith("image/")
  const isPdf = attachment.mime_type === "application/pdf"

  const handleOpen = async () => {
    if (attachment.local_preview) {
      window.open(attachment.local_preview, "_blank")
      return
    }
    if (attachment.id) {
      try {
        const url = await retrieveSupportAttachmentUrl(attachment.id)
        window.open(url, "_blank", "noopener,noreferrer")
      } catch {
        alert("Attachment could not be opened.")
      }
    }
  }

  if (isImage) {
    return (
      <div className="mt-2 overflow-hidden rounded-lg border border-black/10">
        <button type="button" onClick={handleOpen} className="block group relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.local_preview || `/api/store/customers/me/support/attachments/${attachment.id}/file`}
            alt={attachment.file_name}
            className="max-h-48 max-w-full rounded-lg object-cover transition-transform group-hover:scale-[1.02]"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
            View Image ↗
          </div>
        </button>
        <span className="block px-2 py-1 text-[10px] truncate opacity-70">
          {attachment.file_name} ({formatFileSize(attachment.size_bytes)})
        </span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`mt-2 flex items-center gap-2.5 rounded-xl p-2.5 text-left border transition-all ${
        isCustomer
          ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
          : "bg-zinc-50 border-ui-border-base text-ui-fg-base hover:bg-zinc-100"
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 text-base">
        {isPdf ? "📄" : "📎"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{attachment.file_name}</p>
        <p className="text-[10px] opacity-70">{formatFileSize(attachment.size_bytes)} · Click to view</p>
      </div>
    </button>
  )
}

/**
 * Messenger Input Bar with Attachments, Emoji & Enter to Send
 */
function MessengerInput({
  countryCode,
  configuration,
  category,
  orderId,
  onSendOptimistic,
  onSent,
  onError,
}: {
  countryCode: string
  configuration: SupportConfiguration
  category: string
  orderId: string | null
  onSendOptimistic: (msg: MessageItem) => void
  onSent: () => void
  onError: (err: string | null) => void
}) {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [attachedCard, setAttachedCard] = useState<ParsedCard | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [pickerModal, setPickerModal] = useState<{
    isOpen: boolean
    tab: "order" | "product" | "protocol"
  }>({ isOpen: false, tab: "order" })
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [text])

  useEffect(() => {
    if (!file) {
      setFilePreview(null)
      return
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setFilePreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  const handleFileSelect = (selectedFile: File) => {
    const maxBytes = configuration.maximum_attachment_size_bytes || 10 * 1024 * 1024
    if (selectedFile.size > maxBytes) {
      onError(`File is too large (${formatFileSize(selectedFile.size)}). Max allowed is ${formatFileSize(maxBytes)}.`)
      return
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(selectedFile.type)) {
      onError("Only PNG, JPEG, and PDF files are supported.")
      return
    }
    onError(null)
    setFile(selectedFile)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const pastedFile = items[i].getAsFile()
        if (pastedFile) {
          handleFileSelect(pastedFile)
          break
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed && !file && !attachedCard) return

    onError(null)
    const clientRequestId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-chat`
    const nowIso = new Date().toISOString()

    const cardTag = attachedCard
      ? attachedCard.type === "order"
        ? `[card:order:${attachedCard.displayId}:${attachedCard.total}:${attachedCard.status}:${attachedCard.orderId}]`
        : attachedCard.type === "product"
        ? `[card:product:${attachedCard.variantId}:${attachedCard.title}:${attachedCard.price}:${attachedCard.handle}${attachedCard.imageUrl ? `:${attachedCard.imageUrl}` : ""}]`
        : attachedCard.type === "protocol"
        ? `[card:protocol:${attachedCard.handle}:${attachedCard.title}:${attachedCard.duration}]`
        : `[card:promo:${attachedCard.code}:${attachedCard.title}:${attachedCard.description}]`
      : ""

    const messageText = [trimmed, cardTag].filter(Boolean).join("\n") || (file ? `Attached ${file.name}` : "")
    const currentFile = file
    const currentCard = attachedCard

    const optMsg: MessageItem = {
      id: clientRequestId,
      sender: "You",
      sender_type: "customer",
      body: messageText,
      sent_at: nowIso,
      status: "sending",
      attachment_file: file || undefined,
      attachments: file
        ? [
            {
              id: "temp-opt",
              file_name: file.name,
              mime_type: file.type,
              size_bytes: file.size,
              local_preview: filePreview || undefined,
            },
          ]
        : [],
    }

    onSendOptimistic(optMsg)

    setText("")
    setFile(null)
    setAttachedCard(null)
    setShowEmojis(false)
    setShowAttachMenu(false)

    startTransition(async () => {
      const data = new FormData()
      data.set("country_code", countryCode)
      data.set("body", messageText)
      data.set("category", category)
      data.set("client_request_id", clientRequestId)
      const effectiveOrderId = currentCard?.type === "order" ? currentCard.orderId : orderId
      if (effectiveOrderId) data.set("order_id", effectiveOrderId)
      if (currentFile) data.set("attachment", currentFile)

      const result = await postThreadMessageAction(EMPTY_ACTION, data)
      if (!result.success) {
        onError(result.error, clientRequestId)
      } else {
        onSent()
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-t border-ui-border-base bg-white p-3 transition-colors ${
        isDragging ? "bg-emerald-50 ring-2 ring-emerald-400" : ""
      }`}
    >
      {/* Drag overlay notice */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-500/90 text-sm font-bold text-white">
          Drop file here to attach
        </div>
      )}

      {/* Attached Card Chip */}
      {attachedCard && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-zinc-200/90 bg-zinc-50 px-2.5 py-1.5 text-xs animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">
              {attachedCard.type === "order"
                ? "📦"
                : attachedCard.type === "product"
                ? "🧪"
                : attachedCard.type === "protocol"
                ? "🔬"
                : "🎁"}
            </span>
            <span className="font-semibold text-zinc-800 truncate">
              {attachedCard.type === "order"
                ? `Order #${attachedCard.displayId}`
                : attachedCard.type === "product"
                ? attachedCard.title
                : attachedCard.type === "protocol"
                ? attachedCard.title
                : attachedCard.code}
            </span>
            {attachedCard.type === "order" && (
              <span className="text-[11px] text-zinc-500 font-medium">({attachedCard.total})</span>
            )}
            {attachedCard.type === "product" && (
              <span className="text-[11px] text-emerald-700 font-semibold">({attachedCard.price})</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setAttachedCard(null)}
            className="rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 transition-colors"
            title="Remove attached item"
          >
            ✕
          </button>
        </div>
      )}

      {/* Attachment Preview Chip */}
      {file && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-zinc-200/90 bg-zinc-50 px-2.5 py-1.5 text-xs shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            {filePreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={filePreview} alt="Preview" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-xs">
                PDF
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-800 text-xs">{file.name}</p>
              <p className="text-[10px] text-zinc-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 transition-colors"
            aria-label="Remove attachment"
          >
            ✕
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojis && (
        <div className="absolute bottom-full left-3 mb-2 grid grid-cols-8 gap-1 rounded-2xl border border-zinc-200/90 bg-white p-2.5 shadow-xl z-20">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setText((prev) => prev + emoji)
                setShowEmojis(false)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-100 text-base"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFileSelect(f)
        }}
        className="hidden"
      />

      {/* Unified Composer Container */}
      <div className="flex flex-col rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-2 focus-within:bg-white focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            broadcastSupportTyping()
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type your message…"
          rows={1}
          maxLength={10_000}
          className="w-full resize-none bg-transparent px-1.5 py-1 text-xs leading-relaxed text-zinc-900 placeholder:text-zinc-400 outline-none"
        />

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100/80 mt-1">
          <div className="flex items-center gap-1">
            {/* Emoji Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowEmojis(!showEmojis)
                setShowAttachMenu(false)
              }}
              className={`rounded-lg p-1.5 transition-colors text-xs ${
                showEmojis ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800"
              }`}
              aria-label="Toggle emoji picker"
            >
              😊
            </button>

            {/* Attachment Button with Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(!showAttachMenu)
                  setShowEmojis(false)
                }}
                className={`rounded-lg p-1.5 transition-colors ${
                  showAttachMenu ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800"
                }`}
                aria-label="Attach item"
                title="Attach photo, previous order, compound, or protocol"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Popover Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-52 rounded-2xl border border-zinc-200/90 bg-white p-1.5 shadow-xl z-30 text-xs space-y-0.5 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(false)
                      fileInputRef.current?.click()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <span className="text-base">📄</span>
                    <div>
                      <p className="font-semibold text-zinc-900">Attach Photo / File</p>
                      <p className="text-[10px] text-zinc-500">JPG, PNG, PDF up to 10MB</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(false)
                      setPickerModal({ isOpen: true, tab: "order" })
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <span className="text-base">📦</span>
                    <div>
                      <p className="font-semibold text-zinc-900">Inquire About Order</p>
                      <p className="text-[10px] text-zinc-500">Pick from your past orders</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(false)
                      setPickerModal({ isOpen: true, tab: "product" })
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <span className="text-base">🧪</span>
                    <div>
                      <p className="font-semibold text-zinc-900">Ask About Product</p>
                      <p className="text-[10px] text-zinc-500">Search compound catalog</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(false)
                      setPickerModal({ isOpen: true, tab: "protocol" })
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <span className="text-base">🔬</span>
                    <div>
                      <p className="font-semibold text-zinc-900">Ask About Protocol</p>
                      <p className="text-[10px] text-zinc-500">Select research guide</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <button
            type="button"
            disabled={(!text.trim() && !file && !attachedCard) || pending}
            onClick={handleSend}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-900 text-white shadow hover:bg-black disabled:opacity-25 transition-all active:scale-95"
            aria-label="Send message"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Customer Entity Search & Select Modal */}
      <CustomerEntityPickerModal
        isOpen={pickerModal.isOpen}
        initialTab={pickerModal.tab}
        onClose={() => setPickerModal((prev) => ({ ...prev, isOpen: false }))}
        onSelect={(card) => setAttachedCard(card)}
      />
    </div>
  )
}
