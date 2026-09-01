"use client"

import {
  createSupportConversationAction,
  markSupportRead,
  replySupportConversationAction,
  retrieveSupportConversation,
  retrieveSupportSummary,
  uploadSupportAttachmentAction,
  type SupportActionState,
  type SupportConfiguration,
  type SupportConversationDetail,
  type SupportSummary,
} from "@lib/data/customer-support"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"

const EMPTY_ACTION: SupportActionState = { success: false, error: null }
const STATUS_LABELS: Record<string, string> = {
  new: "Sent",
  open: "Support is reviewing",
  waiting_for_customer: "Your reply is needed",
  resolved: "Resolved",
  closed: "Closed",
}

type Screen = "home" | "new" | "thread"

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

const supportAvailability = (configuration: SupportConfiguration) => {
  if (!configuration.business_hours_enabled) return configuration.response_time_message
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
  const hours = configuration.business_hours.find((entry) => entry.day === day)
  if (hours?.open && hours.opens_at && hours.closes_at && time >= hours.opens_at && time < hours.closes_at) {
    return `Support is available now · ${configuration.response_time_message}`
  }
  return configuration.offline_message
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
  const [screen, setScreen] = useState<Screen>("home")
  const [summary, setSummary] = useState<SupportSummary | null>(null)
  const [conversation, setConversation] = useState<SupportConversationDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const panelRef = useRef<HTMLElement>(null)

  const hidden =
    !configuration.enabled ||
    !configuration.side_panel_enabled ||
    pathname.includes("/account/support") ||
    (!signedIn && pathname.endsWith("/account"))

  const refreshSummary = useCallback(async () => {
    if (!signedIn) return
    try {
      setSummary(await retrieveSupportSummary())
      setError(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Support could not be refreshed.")
    }
  }, [signedIn])

  const openConversation = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await markSupportRead(id)
      const result = await retrieveSupportConversation(id)
      setConversation(result.conversation)
      setScreen("thread")
      setError(null)
      await refreshSummary()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Conversation could not be opened.")
    } finally {
      setLoading(false)
    }
  }, [refreshSummary])

  useEffect(() => {
    const remembered = window.localStorage.getItem("pepstack:support-panel-open")
    if (remembered === "true") setOpen(true)
  }, [])

  useEffect(() => {
    window.localStorage.setItem("pepstack:support-panel-open", String(open))
    if (open) panelRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open || !signedIn) return
    refreshSummary()
    const refresh = () => {
      if (document.visibilityState !== "visible") return
      refreshSummary()
      if (screen === "thread" && conversation?.id) {
        retrieveSupportConversation(conversation.id)
          .then((result) => setConversation(result.conversation))
          .catch(() => undefined)
      }
    }
    const timer = window.setInterval(refresh, 25_000)
    window.addEventListener("focus", refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", refresh)
    }
  }, [conversation?.id, open, refreshSummary, screen, signedIn])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  const defaultCategory = useMemo(() => pathCategory(pathname), [pathname])
  const contextualOrderId = useMemo(() => pathOrderId(pathname), [pathname])
  const availability = useMemo(() => supportAvailability(configuration), [configuration])
  if (hidden) return null

  return (
    <div className="fixed bottom-4 right-4 z-[900] flex flex-col items-end small:bottom-6 small:right-6">
      {open ? (
        <aside
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label={configuration.display_name}
          className="fixed inset-x-0 bottom-0 flex h-[80dvh] flex-col overflow-hidden rounded-t-2xl border border-ui-border-base bg-white shadow-2xl outline-none small:static small:h-[min(680px,calc(100dvh-7rem))] small:w-[400px] small:rounded-2xl"
        >
          <header className="flex items-center justify-between border-b border-ui-border-base px-5 py-4">
            <div className="min-w-0">
              <p className="font-semibold">{configuration.display_name}</p>
              <p className="truncate text-xs text-ui-fg-subtle">{availability}</p>
            </div>
            <div className="flex gap-1">
              {screen !== "home" && signedIn ? (
                <button onClick={() => { setScreen("home"); setConversation(null) }} className="rounded-lg px-3 py-2 text-sm hover:bg-ui-bg-subtle" aria-label="Back to support home">Back</button>
              ) : null}
              <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-ui-bg-subtle" aria-label="Minimize support">Minimize</button>
              <button onClick={() => { setOpen(false); setScreen("home"); setConversation(null) }} className="rounded-lg px-3 py-2 text-sm hover:bg-ui-bg-subtle" aria-label="Close support">Close</button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-5">
            {!signedIn ? (
              <SignedOut countryCode={countryCode} pathname={pathname} configuration={configuration} />
            ) : loading ? (
              <PanelState text="Loading your support conversation…" />
            ) : screen === "new" ? (
              <NewConversation
                countryCode={countryCode}
                configuration={configuration}
                defaultCategory={defaultCategory}
                contextualOrderId={contextualOrderId}
                pending={pending}
                startTransition={startTransition}
                onCreated={async (result) => {
                  if (result.conversation_id) await openConversation(result.conversation_id)
                }}
                onError={setError}
              />
            ) : screen === "thread" && conversation ? (
              <ConversationThread
                countryCode={countryCode}
                conversation={conversation}
                pending={pending}
                startTransition={startTransition}
                onRefresh={() => openConversation(conversation.id)}
                onError={setError}
              />
            ) : (
              <SupportHome
                configuration={configuration}
                summary={summary}
                onStart={() => setScreen("new")}
                onOpen={openConversation}
              />
            )}
            {error ? <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          </div>

          <footer className="border-t border-ui-border-base px-5 py-3 text-center">
            <a href={`/${countryCode}/account/support`} className="text-sm font-medium text-ui-fg-interactive">Open Support Center</a>
          </footer>
        </aside>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="relative flex items-center gap-2 rounded-full bg-ui-fg-base px-5 py-3 text-sm font-semibold text-white shadow-xl hover:opacity-90"
          aria-label={`Open ${configuration.display_name}`}
        >
          <span aria-hidden="true">Support</span>
          {summary?.unread_count ? (
            <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white" aria-label={`${summary.unread_count} unread support messages`}>{summary.unread_count}</span>
          ) : null}
        </button>
      )}
    </div>
  )
}

function SignedOut({ countryCode, pathname, configuration }: { countryCode: string; pathname: string; configuration: SupportConfiguration }) {
  const callback = encodeURIComponent(pathname)
  return <div><h2 className="text-xl font-semibold">How can we help?</h2><p className="mt-2 text-sm text-ui-fg-subtle">{configuration.response_time_message}</p><p className="mt-5 rounded-xl bg-ui-bg-subtle p-4 text-sm">Sign in to start a private conversation or view your support history.</p><a href={`/${countryCode}/account?callbackUrl=${callback}`} className="mt-4 inline-flex rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-semibold text-white">Sign in</a><a href={`/${countryCode}/account`} className="ml-3 text-sm font-medium text-ui-fg-interactive">Account recovery</a></div>
}

function SupportHome({ configuration, summary, onStart, onOpen }: { configuration: SupportConfiguration; summary: SupportSummary | null; onStart: () => void; onOpen: (id: string) => void }) {
  return <div><h2 className="text-xl font-semibold">How can we help?</h2><p className="mt-2 text-sm text-ui-fg-subtle">{configuration.response_time_message}</p><button onClick={onStart} className="mt-5 w-full rounded-lg bg-ui-fg-base px-4 py-3 text-sm font-semibold text-white">Start a conversation</button><div className="mt-6 flex items-center justify-between"><h3 className="font-semibold">Recent conversations</h3>{summary?.unread_count ? <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">{summary.unread_count} unread</span> : null}</div><div className="mt-3 space-y-2">{summary?.conversations.map((item) => <button key={item.id} onClick={() => onOpen(item.id)} className="w-full rounded-xl border border-ui-border-base p-4 text-left hover:bg-ui-bg-subtle"><div className="flex items-start justify-between gap-3"><p className="font-medium">{item.subject}</p>{item.unread_count ? <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{item.unread_count}</span> : null}</div><p className="mt-1 line-clamp-2 text-xs text-ui-fg-subtle">{item.latest_message_preview || "No preview available"}</p><p className="mt-2 text-xs font-medium">{STATUS_LABELS[item.status] || item.status}</p></button>)}{summary && !summary.conversations.length ? <p className="rounded-xl bg-ui-bg-subtle p-4 text-sm text-ui-fg-subtle">You have no support conversations yet. Start one whenever you need help with an order, payment, product, or protocol access.</p> : null}</div></div>
}

function NewConversation({ countryCode, configuration, defaultCategory, contextualOrderId, pending, startTransition, onCreated, onError }: { countryCode: string; configuration: SupportConfiguration; defaultCategory: string; contextualOrderId: string | null; pending: boolean; startTransition: React.TransitionStartFunction; onCreated: (result: SupportActionState) => void; onError: (value: string | null) => void }) {
  const [draft, setDraft] = useState(() => ({ category: defaultCategory, subject: "", body: "" }))
  const [includeOrder, setIncludeOrder] = useState(Boolean(contextualOrderId))
  const [file, setFile] = useState<File | null>(null)
  const requestId = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-support`)
  useEffect(() => {
    const saved = window.localStorage.getItem("pepstack:support-draft")
    if (saved) {
      try { setDraft(JSON.parse(saved)) } catch { window.localStorage.removeItem("pepstack:support-draft") }
    }
  }, [])
  useEffect(() => { window.localStorage.setItem("pepstack:support-draft", JSON.stringify(draft)) }, [draft])
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    onError(null)
    startTransition(async () => {
      const data = new FormData()
      data.set("country_code", countryCode)
      data.set("category", draft.category)
      data.set("subject", draft.subject)
      data.set("body", draft.body)
      data.set("client_request_id", requestId.current)
      if (includeOrder && contextualOrderId) data.set("order_id", contextualOrderId)
      const result = await createSupportConversationAction(EMPTY_ACTION, data)
      if (!result.success) { onError(result.error); return }
      if (file && result.conversation_id && result.message_id) {
        const upload = new FormData()
        upload.set("country_code", countryCode)
        upload.set("conversation_id", result.conversation_id)
        upload.set("message_id", result.message_id)
        upload.set("attachment", file)
        const uploadResult = await uploadSupportAttachmentAction(EMPTY_ACTION, upload)
        if (!uploadResult.success) onError(uploadResult.error)
      }
      window.localStorage.removeItem("pepstack:support-draft")
      setDraft({ category: defaultCategory, subject: "", body: "" })
      onCreated(result)
    })
  }
  return <form onSubmit={submit} className="space-y-4"><div><h2 className="text-xl font-semibold">Start a conversation</h2><p className="mt-1 text-sm text-ui-fg-subtle">Only you and authorized support staff can read it. Research Hub records are never attached automatically.</p></div><Field label="Category"><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="w-full rounded-lg border border-ui-border-base bg-white px-3 py-2">{configuration.categories.map((category) => <option key={category.key} value={category.key}>{category.label}</option>)}</select></Field>{contextualOrderId ? <label className="flex items-start gap-3 rounded-lg bg-ui-bg-subtle p-3 text-sm"><input type="checkbox" checked={includeOrder} onChange={(event) => setIncludeOrder(event.target.checked)} className="mt-0.5" /><span><strong>Include this order</strong><span className="block text-xs text-ui-fg-subtle">Support can use the order you are viewing to help answer your question.</span></span></label> : null}<Field label="Subject"><input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} minLength={5} maxLength={180} required className="w-full rounded-lg border border-ui-border-base px-3 py-2" /></Field><Field label="Message"><textarea value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} minLength={3} maxLength={10_000} rows={5} required className="w-full rounded-lg border border-ui-border-base p-3" /></Field>{configuration.attachment_uploads_enabled ? <Field label="Optional attachment"><input type="file" accept={configuration.allowed_mime_types.join(",")} onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full text-sm" /><p className="mt-1 text-xs text-ui-fg-subtle">PDF, PNG, or JPEG · up to {Math.floor(configuration.maximum_attachment_size_bytes / 1024 / 1024)} MiB</p></Field> : null}<button disabled={pending} className="w-full rounded-lg bg-ui-fg-base px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Sending…" : "Send message"}</button></form>
}

function ConversationThread({ countryCode, conversation, pending, startTransition, onRefresh, onError }: { countryCode: string; conversation: SupportConversationDetail; pending: boolean; startTransition: React.TransitionStartFunction; onRefresh: () => void; onError: (value: string | null) => void }) {
  const [body, setBody] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const requestId = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-reply`)
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    startTransition(async () => {
      const data = new FormData()
      data.set("country_code", countryCode)
      data.set("conversation_id", conversation.id)
      data.set("body", body)
      data.set("client_request_id", requestId.current)
      const result = await replySupportConversationAction(EMPTY_ACTION, data)
      if (!result.success) { onError(result.error); return }
      if (file && result.message_id) {
        const upload = new FormData()
        upload.set("country_code", countryCode)
        upload.set("conversation_id", conversation.id)
        upload.set("message_id", result.message_id)
        upload.set("attachment", file)
        const uploadResult = await uploadSupportAttachmentAction(EMPTY_ACTION, upload)
        if (!uploadResult.success) onError(uploadResult.error)
      }
      setBody("")
      setFile(null)
      requestId.current = globalThis.crypto?.randomUUID?.() || `${Date.now()}-reply`
      onRefresh()
    })
  }
  return <div><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{conversation.subject}</h2><p className="mt-1 text-xs text-ui-fg-subtle">{conversation.category.replaceAll("_", " ")} · {STATUS_LABELS[conversation.status] || conversation.status}</p></div></div><div className="mt-5 space-y-3">{conversation.messages.map((message) => <div key={message.id} className={`max-w-[86%] rounded-2xl p-3 ${message.sender_type === "customer" ? "ml-auto bg-ui-fg-base text-white" : "bg-ui-bg-subtle"}`}><p className="text-xs font-semibold opacity-70">{message.sender}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{message.body}</p><p className="mt-2 text-[11px] opacity-60">{new Date(message.sent_at).toLocaleString("en-PH")}</p></div>)}</div>{conversation.status !== "closed" ? <form onSubmit={submit} className="mt-5 space-y-3 border-t border-ui-border-base pt-4"><textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={3} maxLength={10_000} rows={3} required placeholder="Write a reply" className="w-full rounded-lg border border-ui-border-base p-3" /><input type="file" accept="image/png,image/jpeg,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full text-xs" /><button disabled={pending} className="w-full rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Sending…" : "Send reply"}</button></form> : <p className="mt-5 rounded-lg bg-ui-bg-subtle p-3 text-sm">This conversation is closed. Reopen it in the Support Center to continue.</p>}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium"><span className="mb-1 block">{label}</span>{children}</label> }
function PanelState({ text }: { text: string }) { return <div role="status" className="rounded-xl bg-ui-bg-subtle p-5 text-sm text-ui-fg-subtle">{text}</div> }
