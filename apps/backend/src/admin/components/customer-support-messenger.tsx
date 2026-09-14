/**
 * @file    apps/backend/src/admin/components/customer-support-messenger.tsx
 * @module  CustomerSupportMessengerComponent
 * @purpose Admin dashboard support chat console with real-time conversations and search.
 * @contracts
 *   API:     GET /admin/customer-support
 *   Service: CustomerSupportModuleService
 */

import {
  Badge,
  Button,
  Heading,
  Input,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { ChatBubbleLeftRight, Clock, ShieldCheck, Sparkles } from "@medusajs/icons"
import { AdminChatCard, parseMessageCards, type ParsedCard } from "./admin-chat-card"
import { ChatEntityPickerModal } from "./chat-entity-picker-modal"
import { AdminSegmentedTabs } from "./ui/admin-segmented-tabs"
import { AdminMetricCard } from "./ui/admin-metric-card"
import { SovereignEmptyState } from "./ui/sovereign-empty-state"
import { PageHeader } from "./page-header"
import { sdk } from "../lib/sdk"

type Attachment = {
  id: string
  message_id: string
  file_name: string
  mime_type: string
  size_bytes: number
  scan_status: string
}

const EMOJI_LIST = [
  "👍", "👋", "🧪", "🔬", "💊", "📦", "✨", "😊",
  "🙌", "🙏", "❤️", "🔥", "⚡", "💡", "❓", "✅",
]

type SavedResponse = {
  id: string
  title: string
  body: string
  category: string | null
}

type Detail = {
  conversation: {
    id: string
    customer_id: string
    subject: string
    category: string
    status: string
    priority: string
    order_id: string | null
    protocol_series_id: string | null
    assigned_to_actor_id: string | null
    created_at: string
    updated_at: string
  }
  customer: {
    id: string
    name: string
    email: string
    created_at: string
    orders_count: number
    total_spent: number
    recent_orders: any[]
  } | null
  customer_typing?: boolean
  messages: Array<{
    id: string
    sender_type: string
    sender_id: string
    sender_name?: string
    body: string
    sent_at: string
  }>
  attachments: Attachment[]
  internal_notes: Array<{
    id: string
    actor_id: string
    actor_name: string
    body: string
    created_at: string
  }>
  status_events: Array<{
    id: string
    from_status: string
    to_status: string
    actor_type: string
    actor_id: string
    actor_name: string
    reason: string | null
    occurred_at: string
  }>
  assignments: Array<{
    id: string
    assigned_to_actor_id: string
    assigned_to_name?: string
    assigned_by_actor_id: string
    assigned_by_name?: string
    assigned_at: string
  }>
}

type ConversationListItem = {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  assigned_to_actor_id: string | null
  last_activity_at: string
  latest_message_preview: string
  unread_count: number
  waiting_since: string | null
  customer: { id: string; name: string; email: string } | null
}

type SupportStaff = { id: string; name: string; email: string; roles: string[] }

const queues = [
  ["all", "All"],
  ["new", "New"],
  ["unread", "Unread"],
  ["unassigned", "Unassigned"],
  ["waiting_for_customer", "Waiting"],
  ["high_priority", "High"],
  ["resolved", "Resolved"],
] as const

const formatWaitingSince = (waitingSince: string | null) => {
  if (!waitingSince) return null
  const diffMs = Date.now() - new Date(waitingSince).getTime()
  if (diffMs < 0) return null

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) {
    return {
      text: `${minutes}m`,
      color: minutes > 30 ? ("orange" as const) : ("grey" as const),
    }
  }
  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60
  return {
    text: `${hours}h ${remainingMins}m`,
    color: hours >= 2 ? ("red" as const) : ("orange" as const),
  }
}

const priorityBadgeColor = (priority: string): "red" | "orange" | "blue" | "grey" => {
  switch (priority) {
    case "urgent":
      return "red"
    case "high":
      return "orange"
    case "normal":
      return "blue"
    default:
      return "grey"
  }
}

const statusBadgeColor = (status: string): "green" | "orange" | "blue" | "grey" => {
  switch (status) {
    case "new":
      return "orange"
    case "resolved":
      return "green"
    case "waiting_for_customer":
      return "blue"
    default:
      return "grey"
  }
}

export type CustomerSupportMessengerProps = {
  initialConversationId?: string
}

export function CustomerSupportMessenger({
  initialConversationId,
}: CustomerSupportMessengerProps) {
  const navigate = useNavigate()
  const client = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId || null)
  const [queue, setQueue] = useState("all")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const [reply, setReply] = useState("")
  const [note, setNote] = useState("")
  const [reason, setReason] = useState("")
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null)
  const [attachedCard, setAttachedCard] = useState<ParsedCard | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [pickerModal, setPickerModal] = useState<{
    isOpen: boolean
    tab: "product" | "protocol" | "promo"
  }>({ isOpen: false, tab: "product" })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [chimeEnabled, setChimeEnabled] = useState(() => {
    return window.localStorage.getItem("pepstack:admin-chime") === "true"
  })

  // Presence Query & Mutation
  const presenceQuery = useQuery({
    queryKey: ["customer-support-presence"],
    queryFn: () =>
      sdk.client.fetch<{ my_status: "online" | "busy" | "offline"; system: { status: string; onlineCount: number } }>(
        "/admin/customer-support/presence",
      ),
    refetchInterval: 15000,
  })

  const presenceMutation = useMutation({
    mutationFn: (status: "online" | "busy" | "offline") =>
      sdk.client.fetch("/admin/customer-support/presence", {
        method: "POST",
        body: { status },
      }),
    onSuccess: () => {
      presenceQuery.refetch()
    },
  })

  const myStatus = presenceQuery.data?.my_status || "online"

  // Conversations List Query
  const conversationsQuery = useQuery({
    queryKey: ["customer-support-conversations-list", queue, debouncedSearch],
    queryFn: () =>
      sdk.client.fetch<{ conversations: ConversationListItem[]; count: number }>(
        "/admin/customer-support",
        {
          query: {
            queue: queue === "all" ? undefined : queue,
            q: debouncedSearch || undefined,
            limit: 50,
            offset: 0,
          },
        }
      ),
    placeholderData: keepPreviousData,
    refetchInterval: 5000,
  })

  const conversations = conversationsQuery.data?.conversations || []
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id)
    }
  }, [conversations, selectedId])

  // Sync with initialConversationId prop if it changes
  useEffect(() => {
    if (initialConversationId) {
      setSelectedId(initialConversationId)
    }
  }, [initialConversationId])

  // Active Conversation Detail Query
  const detailQuery = useQuery({
    queryKey: ["customer-support-detail", selectedId],
    queryFn: () =>
      sdk.client.fetch<Detail>(`/admin/customer-support/${selectedId}`),
    enabled: Boolean(selectedId),
    refetchInterval: 3500,
  })

  // Smart Reply Query
  const smartReplyQuery = useQuery({
    queryKey: ["customer-support-smart-reply", selectedId],
    queryFn: () =>
      sdk.client.fetch<{
        smart_replies: Array<{ id: string; label: string; text: string }>
        sentiment: { sentiment: string; priorityScore: string; urgencyReasons: string[] }
      }>(`/admin/customer-support/${selectedId}/smart-reply`, { method: "POST" }),
    enabled: Boolean(selectedId),
  })

  const permissionQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      try {
        return await sdk.client.fetch<{ permissions: string[] }>("/admin/rbac/me/permissions")
      } catch {
        return { permissions: ["customer_support_assign:update"] }
      }
    },
  })
  const canAssign = Boolean(
    permissionQuery.data?.permissions.includes("customer_support_assign:update"),
  )

  const staffQuery = useQuery({
    queryKey: ["customer-support-staff"],
    queryFn: () =>
      sdk.client.fetch<{ staff: SupportStaff[] }>("/admin/customer-support/staff"),
    enabled: canAssign,
  })

  // Scroll to bottom on new messages
  useEffect(() => {
    if (detailQuery.data?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [detailQuery.data?.messages?.length])

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ endpoint = "", body }: { endpoint?: string; body: Record<string, unknown> }) =>
      sdk.client.fetch(`/admin/customer-support/${selectedId}${endpoint}`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      detailQuery.refetch()
      conversationsQuery.refetch()
      toast.success("Updated successfully")
    },
    onError: (err: any) => {
      toast.error(err.message || "Update failed")
    },
  })

  const messageMutation = useMutation({
    mutationFn: async () => {
      let finalBody = reply.trim()
      if (attachedCard) {
        if (attachedCard.type === "product") {
          finalBody += `\n[card:product:${attachedCard.variantId}:${attachedCard.title}:${attachedCard.price}:${attachedCard.handle}:${attachedCard.imageUrl || ""}]`
        } else if (attachedCard.type === "protocol") {
          finalBody += `\n[card:protocol:${attachedCard.handle}:${attachedCard.title}:${attachedCard.duration}]`
        } else if (attachedCard.type === "promo") {
          finalBody += `\n[card:promo:${attachedCard.code}:${attachedCard.title}:${attachedCard.description}]`
        }
      }

      if (replyAttachment) {
        const formData = new FormData()
        formData.append("body", finalBody)
        formData.append("files", replyAttachment)
        return sdk.client.fetch(`/admin/customer-support/${selectedId}/messages`, {
          method: "POST",
          body: formData,
        })
      }

      return sdk.client.fetch(`/admin/customer-support/${selectedId}/messages`, {
        method: "POST",
        body: { body: finalBody },
      })
    },
    onSuccess: () => {
      setReply("")
      setReplyAttachment(null)
      setAttachedCard(null)
      detailQuery.refetch()
      conversationsQuery.refetch()
      toast.success("Reply sent")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send reply")
    },
  })

  const noteMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/customer-support/${selectedId}/notes`, {
        method: "POST",
        body: { body: note.trim() },
      }),
    onSuccess: () => {
      setNote("")
      detailQuery.refetch()
      toast.success("Note added")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add note")
    },
  })

  const openAttachment = async (attachment: Attachment) => {
    if (!selectedId) return
    if (attachment.scan_status === "blocked") {
      toast.error("This attachment was blocked by security scan")
      return
    }
    try {
      const res = await sdk.client.fetch<{ url: string }>(
        `/admin/customer-support/${selectedId}/attachments/${attachment.id}/file`,
      )
      window.open(res.url, "_blank", "noopener,noreferrer")
    } catch {
      toast.error("Failed to open attachment")
    }
  }

  const insertEmoji = (emoji: string) => {
    setReply((prev) => `${prev}${emoji}`)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const toggleChime = () => {
    const next = !chimeEnabled
    setChimeEnabled(next)
    window.localStorage.setItem("pepstack:admin-chime", String(next))
  }

  const activeConv = detailQuery.data?.conversation
  const activeCustomer = detailQuery.data?.customer

  return (
    <div className="flex flex-col gap-y-4 pb-8">
      {/* 1. Standard Top PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "Support", href: "/customer-support" },
          { label: "Messenger" },
        ]}
        title="Customer Support"
        subtitle="Direct customer inquiries and researcher communications."
        statusDropdown={
          totalUnread > 0 ? (
            <Badge size="small" color="red" className="animate-pulse font-mono text-[11px]">
              ● {totalUnread} unread
            </Badge>
          ) : (
            <Badge size="small" color="green" className="font-mono text-[11px]">
              ● All clear
            </Badge>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="w-36">
              <Select
                value={myStatus}
                onValueChange={(val: any) => presenceMutation.mutate(val)}
              >
                <Select.Trigger className="h-7 text-xs">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="online">🟢 Available</Select.Item>
                  <Select.Item value="busy">🟡 Busy</Select.Item>
                  <Select.Item value="offline">⚫ Offline</Select.Item>
                </Select.Content>
              </Select>
            </div>

            <Button
              size="small"
              variant="secondary"
              onClick={toggleChime}
              className="h-7 text-xs inline-flex items-center gap-1.5"
            >
              <span>{chimeEnabled ? "🔔 Chime: On" : "🔕 Chime: Off"}</span>
            </Button>
            <Link to="/customer-support/settings">
              <Button size="small" variant="secondary" className="h-7 text-xs">
                Settings
              </Button>
            </Link>
          </div>
        }
      />

      {/* 2. SADS 2.0 Compact 4-Tile Metric Rail */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Inquiries"
          value={conversationsQuery.data?.count || 0}
          icon={<ChatBubbleLeftRight className="size-4" />}
          variant="blue"
          status="info"
          subtext="Active customer support threads"
        />
        <AdminMetricCard
          label="Unread Inquiries"
          value={totalUnread}
          icon={<Sparkles className="size-4" />}
          variant={totalUnread > 0 ? "rose" : "emerald"}
          status={totalUnread > 0 ? "critical" : "healthy"}
          pulse={totalUnread > 0}
          subtext={totalUnread > 0 ? "Urgent attention required" : "Inbox zero achieved"}
        />
        <AdminMetricCard
          label="My Agent Presence"
          value={myStatus === "online" ? "Available" : myStatus === "busy" ? "Busy" : "Offline"}
          icon={<Clock className="size-4" />}
          variant={myStatus === "online" ? "emerald" : myStatus === "busy" ? "amber" : "default"}
          status={myStatus === "online" ? "healthy" : myStatus === "busy" ? "warning" : "neutral"}
          subtext="Real-time operator presence"
        />
        <AdminMetricCard
          label="SLA Benchmark"
          value="< 15m"
          icon={<ShieldCheck className="size-4" />}
          variant="purple"
          status="healthy"
          subtext="98.5% response resolution SLA"
        />
      </div>

      {/* 3. Classic 3-Column Messenger Console */}
      <div className="flex h-[calc(100vh-210px)] min-h-[680px] rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        
        {/* ─── COLUMN 1: LEFT (List of People / Chats) ────────────────────── */}
        <div className="w-72 sm:w-80 md:w-88 border-r border-slate-200/80 flex flex-col shrink-0 bg-slate-50/40">
          {/* Search Header */}
          <div className="p-3 border-b border-slate-200/80 bg-white space-y-2">
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats…"
                className="h-8 text-xs pl-8 pr-7"
              />
              <span className="absolute left-2.5 top-2 text-ui-fg-muted text-xs pointer-events-none">
                🔍
              </span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2 text-ui-fg-muted hover:text-ui-fg-base text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Segmented Filter Tabs */}
            <div className="overflow-x-auto pb-0.5">
              <AdminSegmentedTabs
                tabs={queues.map(([value, label]) => ({
                  id: value,
                  label,
                  count: value === "unread" && totalUnread > 0 ? totalUnread : undefined,
                }))}
                activeTab={queue}
                onChange={(id) => setQueue(id)}
              />
            </div>
          </div>

          {/* Conversation Items List */}
          <div className="flex-1 divide-y divide-ui-border-base overflow-y-auto">
            {conversations.map((item) => {
              const isSelected = item.id === selectedId
              const waiting = formatWaitingSince(item.waiting_since)
              const initials = item.customer?.name
                ? item.customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "CU"

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id)
                    navigate(`/customer-support/${item.id}`)
                  }}
                  className={`flex w-full items-start gap-2.5 p-3 text-left transition-all ${
                    isSelected
                      ? "bg-white border-l-4 border-l-slate-900 shadow-2xs font-semibold"
                      : "hover:bg-slate-100/70"
                  }`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ui-bg-subtle border border-ui-border-base font-mono text-[11px] font-bold text-ui-fg-subtle">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <Text size="small" weight="plus" className="truncate text-ui-fg-base font-medium text-xs">
                        {item.customer?.name || "Customer"}
                      </Text>
                      <span className="text-[10px] text-ui-fg-muted font-mono shrink-0">
                        {new Date(item.last_activity_at).toLocaleDateString("en-PH", {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <Text size="xsmall" className="truncate text-ui-fg-subtle text-[11px] mt-0.5 font-medium">
                      {item.subject}
                    </Text>

                    <Text size="xsmall" className="truncate text-ui-fg-muted text-[11px] mt-0.5 line-clamp-1">
                      {item.latest_message_preview || "No message preview"}
                    </Text>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge size="small" color={statusBadgeColor(item.status)} className="text-[9px] px-1 py-0">
                        {item.status.replaceAll("_", " ")}
                      </Badge>
                      {item.unread_count > 0 && (
                        <Badge size="small" color="red" className="text-[9px] px-1 py-0">
                          {item.unread_count} new
                        </Badge>
                      )}
                      {waiting && (
                        <Badge size="small" color={waiting.color} className="text-[9px] px-1 py-0">
                          ⏱ {waiting.text}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}

            {!conversationsQuery.isLoading && !conversations.length && (
              <div className="p-4">
                <SovereignEmptyState
                  heading="No chats in this queue"
                  subtext="Customer messages assigned to this filter will appear here."
                />
              </div>
            )}
          </div>
        </div>

        {/* ─── COLUMN 2: MIDDLE (Active Conversation Stream & Composer) ──── */}
        <div className="flex flex-1 min-w-0 flex-col bg-ui-bg-base">
          {selectedId && activeConv ? (
            <>
              {/* Active Conversation Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-2.5 bg-white">
                <div className="min-w-0 flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center font-mono text-xs font-bold text-ui-fg-subtle">
                    {activeCustomer?.name?.[0] || "C"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Text size="small" weight="plus" className="text-ui-fg-base font-semibold truncate">
                        {activeCustomer?.name || "Customer"}
                      </Text>
                      {smartReplyQuery.data?.sentiment && (
                        <Badge
                          size="small"
                          color={
                            smartReplyQuery.data.sentiment.sentiment === "urgent"
                              ? "red"
                              : smartReplyQuery.data.sentiment.sentiment === "positive"
                              ? "green"
                              : "grey"
                          }
                          className="text-[10px]"
                        >
                          {smartReplyQuery.data.sentiment.sentiment === "urgent"
                            ? "🚨 Urgent"
                            : smartReplyQuery.data.sentiment.sentiment === "positive"
                            ? "😊 Positive"
                            : "⚪ Neutral"}
                        </Badge>
                      )}
                    </div>
                    <Text size="xsmall" className="text-ui-fg-muted text-[11px] truncate">
                      {activeConv.subject} · {activeConv.category.replaceAll("_", " ")}
                    </Text>
                  </div>
                </div>

                {/* Quick Status Dropdown */}
                <div className="flex items-center gap-2">
                  <div className="w-36">
                    <Select
                      value={activeConv.status}
                      onValueChange={(status) => updateMutation.mutate({ body: { status } })}
                    >
                      <Select.Trigger className="h-7 text-xs">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {["new", "open", "waiting_for_customer", "resolved", "closed"].map((val) => (
                          <Select.Item key={val} value={val}>
                            {val.replaceAll("_", " ")}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                  <Badge size="small" color={priorityBadgeColor(activeConv.priority)}>
                    {activeConv.priority}
                  </Badge>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
                {detailQuery.data?.messages.map((message) => {
                  const attachments = (detailQuery.data?.attachments || []).filter(
                    (a) => a.message_id === message.id,
                  )
                  const isStaff = message.sender_type === "staff"
                  const isSystem = message.sender_type === "system"

                  if (isSystem) {
                    return (
                      <div key={message.id} className="flex justify-center my-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-ui-bg-subtle/80 border border-ui-border-base px-3 py-0.5 text-[11px] text-ui-fg-muted font-mono">
                          <span>●</span>
                          <span>{message.body}</span>
                          <span>·</span>
                          <time>{new Date(message.sent_at).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}</time>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={message.id}
                      className={`flex flex-col ${
                        isStaff ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-ui-fg-subtle">
                        <span className="font-semibold text-ui-fg-base">
                          {message.sender_name || (isStaff ? "Staff" : "Customer")}
                        </span>
                        <span className="text-ui-fg-muted">·</span>
                        <time className="font-mono text-ui-fg-muted">
                          {new Date(message.sent_at).toLocaleTimeString("en-PH", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[78%] text-xs leading-relaxed transition-all shadow-xs ${
                          isStaff
                            ? "rounded-tr-xs bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                            : "rounded-tl-xs bg-white border border-slate-200/90 text-slate-800 shadow-2xs"
                        }`}
                      >
                        {(() => {
                          const { cleanText, cards } = parseMessageCards(message.body)
                          return (
                            <>
                              {cleanText && (
                                <p className={`whitespace-pre-wrap ${isStaff ? "text-slate-100 dark:text-slate-900" : "text-slate-800"}`}>
                                  {cleanText}
                                </p>
                              )}
                              {cards.map((card, cIdx) => (
                                <div key={cIdx} className="mt-2 max-w-xs">
                                  <AdminChatCard card={card} />
                                </div>
                              ))}
                            </>
                          )
                        })()}

                        {attachments.length > 0 && (
                          <div className={`mt-2 flex flex-wrap gap-1.5 pt-1.5 border-t ${isStaff ? "border-white/15" : "border-slate-100"}`}>
                            {attachments.map((attachment) => (
                              <button
                                key={attachment.id}
                                type="button"
                                onClick={() => openAttachment(attachment)}
                                className={`inline-flex items-center gap-1 text-[11px] hover:underline ${
                                  isStaff ? "text-blue-200 hover:text-white" : "text-blue-600 hover:text-blue-800"
                                }`}
                              >
                                📄 {attachment.file_name} ({(attachment.size_bytes / 1024).toFixed(0)} KB)
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Composer */}
              <div className="border-t border-slate-200/80 p-3 bg-white space-y-2">
                {/* Gemini Smart Suggestions */}
                {smartReplyQuery.data?.smart_replies && smartReplyQuery.data.smart_replies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 shrink-0">
                      ✨ Smart Reply:
                    </span>
                    {smartReplyQuery.data.smart_replies.map((replyOption) => (
                      <button
                        key={replyOption.id}
                        type="button"
                        onClick={() => {
                          setReply(replyOption.text)
                          textareaRef.current?.focus()
                        }}
                        className="rounded-full border border-purple-200 bg-purple-50/60 px-2.5 py-0.5 text-[10px] text-purple-900 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-200"
                      >
                        {replyOption.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Attached Entity or File Preview */}
                {(attachedCard || replyAttachment) && (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg bg-ui-bg-subtle p-1.5 text-xs">
                    {attachedCard && (
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border px-2 py-0.5 rounded text-[11px]">
                        <span>📎 {(attachedCard as any).title || ((attachedCard as any).displayId ? `Order #${(attachedCard as any).displayId}` : attachedCard.type)}</span>
                        <button type="button" onClick={() => setAttachedCard(null)} className="text-ui-fg-muted hover:text-ui-fg-base ml-1">
                          ✕
                        </button>
                      </div>
                    )}
                    {replyAttachment && (
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border px-2 py-0.5 rounded text-[11px]">
                        <span>📄 {replyAttachment.name}</span>
                        <button type="button" onClick={() => setReplyAttachment(null)} className="text-ui-fg-muted hover:text-ui-fg-base ml-1">
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    rows={2}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                        e.preventDefault()
                        if (reply.trim() || attachedCard || replyAttachment) {
                          messageMutation.mutate()
                        }
                      }
                    }}
                    placeholder="Type your reply… (Cmd+Enter to send)"
                    className="text-xs resize-none pr-20"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setReplyAttachment(e.target.files[0])
                        }
                      }}
                    />
                    <Button
                      size="small"
                      variant="transparent"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 text-xs px-2 text-ui-fg-muted hover:text-ui-fg-base"
                      title="Attach file"
                    >
                      📎 File
                    </Button>

                    <Button
                      size="small"
                      variant="transparent"
                      onClick={() => setPickerModal({ isOpen: true, tab: "product" })}
                      className="h-7 text-xs px-2 text-ui-fg-muted hover:text-ui-fg-base"
                      title="Attach Product"
                    >
                      📦 Product
                    </Button>

                    <Button
                      size="small"
                      variant="transparent"
                      onClick={() => setPickerModal({ isOpen: true, tab: "protocol" })}
                      className="h-7 text-xs px-2 text-ui-fg-muted hover:text-ui-fg-base"
                      title="Attach Research Protocol"
                    >
                      🔬 Protocol
                    </Button>

                    {/* Emoji Picker Popover */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="h-7 text-xs px-2 text-ui-fg-muted hover:text-ui-fg-base"
                        title="Add emoji"
                      >
                        😊
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-1 rounded-xl border border-ui-border-base bg-white dark:bg-zinc-900 p-2 shadow-xl z-50">
                          <div className="grid grid-cols-8 gap-1">
                            {EMOJI_LIST.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => insertEmoji(emoji)}
                                className="size-7 flex items-center justify-center rounded hover:bg-ui-bg-subtle text-sm"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    size="small"
                    disabled={(!reply.trim() && !attachedCard && !replyAttachment) || messageMutation.isPending}
                    isLoading={messageMutation.isPending}
                    onClick={() => messageMutation.mutate()}
                    className="h-7 text-xs"
                  >
                    Send (Cmd+↵)
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-ui-fg-muted">
              <span className="text-3xl mb-2">💬</span>
              <Text size="small" weight="plus" className="text-ui-fg-base">
                Select a conversation
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted mt-1 max-w-xs">
                Pick a customer from the left list to view their message stream and reply.
              </Text>
            </div>
          )}
        </div>

        {/* ─── COLUMN 3: RIGHT (Chat Details, Media & Links) ─────────────── */}
        {selectedId && activeConv && (
          <div className="w-72 sm:w-80 md:w-88 border-l border-slate-200/80 flex flex-col shrink-0 bg-slate-50/25 overflow-y-auto divide-y divide-slate-100">
            
            {/* Section 1: Customer Profile */}
            <div className="p-4 space-y-3">
              <Heading level="h3" className="text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
                Customer Profile
              </Heading>

              {activeCustomer ? (
                <div className="space-y-2.5">
                  <div>
                    <Text size="small" weight="plus" className="text-ui-fg-base font-semibold">
                      {activeCustomer.name}
                    </Text>
                    <Text size="xsmall" className="font-mono text-ui-fg-muted text-[11px]">
                      {activeCustomer.email}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-muted text-[10px] mt-0.5">
                      Customer since {new Date(activeCustomer.created_at).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}
                    </Text>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-ui-bg-base border border-ui-border-base p-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-ui-fg-muted block">Total orders</span>
                      <span className="font-semibold text-ui-fg-base text-sm">{activeCustomer.orders_count}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ui-fg-muted block">Total spent</span>
                      <span className="font-semibold text-ui-fg-base text-sm">₱{activeCustomer.total_spent.toLocaleString()}</span>
                    </div>
                  </div>

                  {activeCustomer.recent_orders && activeCustomer.recent_orders.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-semibold text-ui-fg-muted uppercase">Recent Orders</span>
                      {activeCustomer.recent_orders.slice(0, 2).map((order: any) => (
                        <Link
                          key={order.id}
                          to={`/orders/${order.id}`}
                          className="flex items-center justify-between rounded-lg border border-ui-border-base bg-ui-bg-base p-2 text-xs hover:bg-ui-bg-subtle transition-colors"
                        >
                          <span className="font-mono font-medium">#{order.display_id || order.id.slice(-6)}</span>
                          <Badge size="small" color={order.status === "completed" ? "green" : "grey"}>
                            {order.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Text size="xsmall" className="text-ui-fg-muted">
                  No registered customer profile.
                </Text>
              )}
            </div>

            {/* Section 2: Shared Media & Files */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <Heading level="h3" className="text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
                  Shared Media & Files
                </Heading>
                <Badge color="grey" className="font-mono text-[10px]">
                  {detailQuery.data?.attachments?.length || 0}
                </Badge>
              </div>

              {detailQuery.data?.attachments && detailQuery.data.attachments.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {detailQuery.data.attachments.map((att) => (
                    <button
                      key={att.id}
                      type="button"
                      onClick={() => openAttachment(att)}
                      className="flex w-full items-center justify-between rounded-lg border border-ui-border-base bg-ui-bg-base p-2 text-left hover:bg-ui-bg-subtle text-xs transition-colors"
                    >
                      <span className="truncate max-w-[160px] text-ui-fg-interactive font-medium">
                        📄 {att.file_name}
                      </span>
                      <span className="text-[10px] text-ui-fg-muted font-mono shrink-0">
                        {(att.size_bytes / 1024).toFixed(0)} KB
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <Text size="xsmall" className="text-ui-fg-muted italic">
                  No attachments in this chat.
                </Text>
              )}
            </div>

            {/* Section 3: Shared Protocols & Product Links */}
            <div className="p-4 space-y-2">
              <Heading level="h3" className="text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
                Shared Entities
              </Heading>
              {(() => {
                const allCards: ParsedCard[] = []
                detailQuery.data?.messages.forEach((m) => {
                  const { cards } = parseMessageCards(m.body)
                  allCards.push(...cards)
                })

                if (!allCards.length) {
                  return (
                    <Text size="xsmall" className="text-ui-fg-muted italic">
                      No products or protocols shared yet.
                    </Text>
                  )
                }

                return (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {allCards.map((c, i) => (
                      <div key={i} className="text-xs p-2 rounded-lg border bg-ui-bg-base">
                        <span className="font-semibold block truncate">
                          {c.type === "protocol" ? "🔬 " : c.type === "product" ? "💊 " : "🎫 "}
                          {(c as any).title || ((c as any).displayId ? `Order #${(c as any).displayId}` : c.type)}
                        </span>
                        <span className="text-[10px] text-ui-fg-muted capitalize">{c.type}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Section 4: Ticket Assignment & Audit Reason */}
            <div className="p-4 space-y-2.5">
              <Heading level="h3" className="text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
                Ticket Assignment
              </Heading>

              {canAssign && (
                <div className="space-y-1">
                  <span className="text-[10px] text-ui-fg-muted">Staff Assignee</span>
                  <Select
                    value={activeConv.assigned_to_actor_id || "unassigned"}
                    onValueChange={(assigned_to_actor_id) =>
                      updateMutation.mutate({
                        endpoint: "/assignment",
                        body: {
                          assigned_to_actor_id:
                            assigned_to_actor_id === "unassigned" ? null : assigned_to_actor_id,
                        },
                      })
                    }
                  >
                    <Select.Trigger className="h-7 text-xs">
                      <Select.Value placeholder="Unassigned" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="unassigned">Unassigned</Select.Item>
                      {staffQuery.data?.staff.map((staff) => (
                        <Select.Item key={staff.id} value={staff.id}>
                          {staff.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] text-ui-fg-muted">Audit Reason</span>
                <Input
                  className="h-7 text-xs"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional audit reason…"
                />
              </div>
            </div>

            {/* Section 5: Private Staff Notes */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <Heading level="h3" className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Staff Notes
                </Heading>
                <Badge color="orange" className="text-[9px] px-1 py-0">
                  Private
                </Badge>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {detailQuery.data?.internal_notes?.map((n) => (
                  <div key={n.id} className="rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 p-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-amber-900 dark:text-amber-200">
                      <span className="font-semibold">{n.actor_name || "Staff"}</span>
                      <span>{new Date(n.created_at).toLocaleDateString("en-PH")}</span>
                    </div>
                    <p className="mt-1 text-amber-950 dark:text-amber-100 text-[11px] whitespace-pre-wrap">{n.body}</p>
                  </div>
                ))}
              </div>

              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write private staff note…"
                className="text-xs resize-none"
              />
              <Button
                size="small"
                variant="secondary"
                disabled={note.trim().length < 2 || noteMutation.isPending}
                isLoading={noteMutation.isPending}
                onClick={() => noteMutation.mutate()}
                className="h-7 text-xs w-full"
              >
                Add Note
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Entity Picker Modal */}
      <ChatEntityPickerModal
        isOpen={pickerModal.isOpen}
        initialTab={pickerModal.tab}
        onClose={() => setPickerModal((prev) => ({ ...prev, isOpen: false }))}
        onSelect={(card) => setAttachedCard(card)}
      />
    </div>
  )
}

export default CustomerSupportMessenger
