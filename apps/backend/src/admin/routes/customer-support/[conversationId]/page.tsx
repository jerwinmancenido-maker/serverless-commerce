import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { AdminChatCard, parseMessageCards, type ParsedCard } from "../../../components/admin-chat-card"
import { ChatEntityPickerModal } from "../../../components/chat-entity-picker-modal"
import { sdk } from "../../../lib/sdk"

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
  customer: { id: string; name: string; email: string; created_at: string; orders_count: number; total_spent: number; recent_orders: any[] } | null
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

type SupportStaff = { id: string; name: string; email: string; roles: string[] }

const CustomerSupportDetailPage = () => {
  const { conversationId } = useParams()
  const client = useQueryClient()
  const [reply, setReply] = useState("")
  const [note, setNote] = useState("")
  const [reason, setReason] = useState("")
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null)
  const [slashQuery, setSlashQuery] = useState<string | null>(null)
  const [attachedCard, setAttachedCard] = useState<ParsedCard | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [pickerModal, setPickerModal] = useState<{
    isOpen: boolean
    tab: "product" | "protocol" | "promo"
  }>({ isOpen: false, tab: "product" })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertEmoji = (emoji: string) => {
    setReply((prev) => `${prev}${emoji}`)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const query = useQuery({
    queryKey: ["customer-support", conversationId],
    queryFn: () =>
      sdk.client.fetch<Detail>(`/admin/customer-support/${conversationId}`),
    enabled: Boolean(conversationId),
    refetchInterval: 3500,
  })

  const savedResponseQuery = useQuery({
    queryKey: ["support-saved-responses"],
    queryFn: () =>
      sdk.client.fetch<{ responses: SavedResponse[] }>(
        "/admin/support-saved-responses",
      ),
  })

  const productsQuery = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: () =>
      sdk.client.fetch<{ products: Array<{ id: string; title: string; handle: string; variants?: Array<{ id: string; title: string }> }> }>(
        "/admin/products",
        {
          query: {
            limit: 20,
            fields: "id,title,handle,+variants.id,+variants.title",
          },
        }
      ),
  })

  const smartReplyQuery = useQuery({
    queryKey: ["customer-support-smart-reply", conversationId],
    queryFn: () =>
      sdk.client.fetch<{
        smart_replies: Array<{ id: string; label: string; text: string }>
        sentiment: { sentiment: string; priorityScore: string; urgencyReasons: string[] }
      }>(`/admin/customer-support/${conversationId}/smart-reply`, { method: "POST" }),
    enabled: Boolean(conversationId),
  })


  const permissionQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: () =>
      sdk.client.fetch<{ permissions: string[] }>("/admin/rbac/me/permissions"),
  })
  const canAssign = Boolean(
    permissionQuery.data?.permissions.includes("customer_support_assign:update"),
  )

  const staffQuery = useQuery({
    queryKey: ["customer-support-staff"],
    queryFn: () =>
      sdk.client.fetch<{ staff: SupportStaff[] }>(
        "/admin/customer-support/staff",
      ),
    enabled: canAssign,
  })

  const invalidate = () =>
    client.invalidateQueries({
      queryKey: ["customer-support", conversationId],
    })

  const messageMutation = useMutation({
    mutationFn: () => {
      const cardTag = attachedCard
        ? attachedCard.type === "protocol"
          ? `[card:protocol:${attachedCard.handle}:${attachedCard.title}:${attachedCard.duration}]`
          : attachedCard.type === "product"
          ? `[card:product:${attachedCard.variantId}:${attachedCard.title}:${attachedCard.price}:${attachedCard.handle}]`
          : `[card:promo:${attachedCard.code}:${attachedCard.title}:${attachedCard.description}]`
        : ""
      const fullBody = [reply.trim(), cardTag].filter(Boolean).join("\n")
      if (!fullBody) throw new Error("Empty message")
      return sdk.client.fetch<{ message: { id: string } }>(
        `/admin/customer-support/${conversationId}/messages`,
        {
          method: "POST",
          body: { body: fullBody },
        },
      )
    },
    onSuccess: async (result) => {
      if (replyAttachment) {
        const body = new FormData()
        body.set("attachment", replyAttachment, replyAttachment.name)
        await sdk.client.fetch(
          `/admin/customer-support/${conversationId}/messages/${result.message.id}/attachments`,
          {
            method: "POST",
            headers: { "content-type": null },
            body,
          },
        )
      }
      setReply("")
      setAttachedCard(null)
      setReplyAttachment(null)
      await invalidate()
      toast.success("Reply sent to customer")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send reply")
    },
  })

  const noteMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/customer-support/${conversationId}/notes`, {
        method: "POST",
        body: { body: note },
      }),
    onSuccess: async () => {
      setNote("")
      await invalidate()
      toast.success("Internal note saved")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      endpoint = "",
      body,
    }: {
      endpoint?: string
      body: Record<string, unknown>
    }) =>
      sdk.client.fetch(`/admin/customer-support/${conversationId}${endpoint}`, {
        method: "POST",
        body: { ...body, reason: reason || null },
      }),
    onSuccess: invalidate,
  })

  const openAttachment = async (attachment: Attachment) => {
    if (attachment.scan_status === "blocked") {
      toast.error("This attachment was blocked by security scan")
      return
    }
    const response = await sdk.client.fetch<{ url: string }>(
      `/admin/customer-support/${conversationId}/attachments/${attachment.id}/file`,
    )
    window.open(response.url, "_blank", "noopener,noreferrer")
  }

  // Handle slash commands (/dosage, /refund, etc.) and broadcast staff typing
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setReply(val)
    if (conversationId) {
      sdk.client
        .fetch(`/admin/customer-support/${conversationId}/typing`, { method: "POST" })
        .catch(() => undefined)
    }
    const match = val.match(/\/([a-zA-Z0-9_-]*)$/)
    if (match) {
      setSlashQuery(match[1].toLowerCase())
    } else {
      setSlashQuery(null)
    }
  }

  const insertSavedResponse = (savedBody: string) => {
    if (slashQuery !== null) {
      setReply((prev) => prev.replace(/\/([a-zA-Z0-9_-]*)$/, savedBody))
      setSlashQuery(null)
    } else {
      setReply(savedBody)
    }
    textareaRef.current?.focus()
  }

  // Cmd+Enter / Ctrl+Enter shortcut to send
  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      if ((reply.trim().length > 0 || attachedCard) && !messageMutation.isPending) {
        messageMutation.mutate()
      }
    }
  }

  const data = query.data

  useEffect(() => {
    if (!data || !conversationId) return
    sdk.client
      .fetch(`/admin/customer-support/${conversationId}/read`, { method: "POST" })
      .catch(() => undefined)
  }, [conversationId, data])

  if (!data) {
    return (
      <Container>
        <Text>Loading support conversation…</Text>
      </Container>
    )
  }

  const conversation = data.conversation
  const customer = data.customer

  const filteredSavedResponses = (savedResponseQuery.data?.responses || []).filter(
    (r) =>
      (!r.category || r.category === conversation.category) &&
      (!slashQuery ||
        r.title.toLowerCase().includes(slashQuery) ||
        r.body.toLowerCase().includes(slashQuery)),
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Main Conversation Column */}
      <div className="flex flex-col gap-4">
        {/* Header & Controls */}
        <Container>
          <div className="flex items-center justify-between">
            <Link to="/customer-support" className="text-sm text-ui-fg-interactive">
              ← Support inbox
            </Link>
            <div className="flex items-center gap-2">
              {smartReplyQuery.data?.sentiment && (
                <Badge
                  color={
                    smartReplyQuery.data.sentiment.sentiment === "urgent" ||
                    smartReplyQuery.data.sentiment.sentiment === "frustrated"
                      ? "red"
                      : smartReplyQuery.data.sentiment.sentiment === "positive"
                      ? "green"
                      : "grey"
                  }
                >
                  {smartReplyQuery.data.sentiment.sentiment === "urgent"
                    ? "🚨 Urgent"
                    : smartReplyQuery.data.sentiment.sentiment === "frustrated"
                    ? "⚠️ Frustrated"
                    : smartReplyQuery.data.sentiment.sentiment === "positive"
                    ? "😊 Positive"
                    : "⚪ Neutral"}
                </Badge>
              )}
              <Badge color={conversation.status === "resolved" ? "green" : "orange"}>
                {conversation.status.replaceAll("_", " ")}
              </Badge>
              <Badge
                color={
                  conversation.priority === "urgent"
                    ? "red"
                    : conversation.priority === "high"
                    ? "orange"
                    : "grey"
                }
              >
                {conversation.priority}
              </Badge>
            </div>
          </div>

          <div className="mt-3">
            <Heading>{conversation.subject}</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-0.5">
              {conversation.category.replaceAll("_", " ")} · Customer:{" "}
              {customer ? customer.name : conversation.customer_id}
            </Text>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-sm">
              Status
              <Select
                value={conversation.status}
                onValueChange={(status) =>
                  updateMutation.mutate({ body: { status } })
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {[
                    "new",
                    "open",
                    "waiting_for_customer",
                    "resolved",
                    "closed",
                  ].map((value) => (
                    <Select.Item key={value} value={value}>
                      {value.replaceAll("_", " ")}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </label>

            {canAssign ? (
              <label className="grid gap-2 text-sm">
                Priority
                <Select
                  value={conversation.priority}
                  onValueChange={(priority) =>
                    updateMutation.mutate({
                      endpoint: "/priority",
                      body: { priority },
                    })
                  }
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {["low", "normal", "high", "urgent"].map((value) => (
                      <Select.Item key={value} value={value}>
                        {value}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </label>
            ) : null}

            {canAssign ? (
              <label className="grid gap-2 text-sm">
                Assigned staff
                <Select
                  value={conversation.assigned_to_actor_id || "unassigned"}
                  onValueChange={(assigned_to_actor_id) =>
                    updateMutation.mutate({
                      endpoint: "/assignment",
                      body: {
                        assigned_to_actor_id:
                          assigned_to_actor_id === "unassigned"
                            ? null
                            : assigned_to_actor_id,
                      },
                    })
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Unassigned" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="unassigned">Unassigned</Select.Item>
                    {staffQuery.data?.staff.map((staff) => (
                      <Select.Item key={staff.id} value={staff.id}>
                        {staff.name} · {staff.roles.join(", ")}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </label>
            ) : null}
          </div>

          <Label className="mt-4 block">Audit reason</Label>
          <Input
            className="mt-1"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Optional audit reason"
          />
        </Container>

        {/* Message Feed */}
        <Container>
          <Heading level="h2">Message stream</Heading>
          <div className="mt-4 space-y-3">
            {data.messages.map((message) => {
              const attachments = data.attachments.filter(
                (attachment) => attachment.message_id === message.id,
              )
              const isStaff = message.sender_type === "staff"
              const isSystem = message.sender_type === "system"

              return (
                <div
                  key={message.id}
                  className={`rounded-xl p-4 transition-all ${
                    isStaff
                      ? "ml-10 bg-blue-50/80 border border-blue-100"
                      : isSystem
                      ? "mx-auto bg-zinc-100/70 border border-zinc-200 text-center max-w-lg"
                      : "mr-10 bg-ui-bg-subtle border border-ui-border-base"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Text size="small" weight="plus">
                      {message.sender_name || (isStaff ? "Support Staff" : isSystem ? "Automatic" : "Customer")}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {new Date(message.sent_at).toLocaleString("en-PH")}
                    </Text>
                  </div>

                  {(() => {
                    const { cleanText, cards } = parseMessageCards(message.body)
                    return (
                      <>
                        {cleanText && (
                          <Text size="small" className="mt-2 whitespace-pre-wrap leading-relaxed">
                            {cleanText}
                          </Text>
                        )}
                        {cards.map((card, cIdx) => (
                          <div key={cIdx} className="mt-2 max-w-md">
                            <AdminChatCard card={card} />
                          </div>
                        ))}
                      </>
                    )
                  })()}

                  {attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {attachments.map((attachment) => (
                        <Button
                          key={attachment.id}
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() => openAttachment(attachment)}
                        >
                          📄 {attachment.file_name} (
                          {(attachment.size_bytes / 1024).toFixed(0)} KB)
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Reply Box */}
          <div className="relative mt-6 rounded-xl border border-ui-border-base bg-zinc-50/50 p-4">
            {/* AI Smart Suggestion Chips */}
            {smartReplyQuery.data?.smart_replies && smartReplyQuery.data.smart_replies.length > 0 && (
              <div className="mb-3 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50/80 to-indigo-50/60 p-2.5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1">
                    ✨ Gemini Smart Replies:
                  </span>
                  <span className="text-[10px] text-purple-700">Click to insert</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {smartReplyQuery.data.smart_replies.map((replyOption) => (
                    <button
                      key={replyOption.id}
                      type="button"
                      onClick={() => {
                        setReply(replyOption.text)
                        textareaRef.current?.focus()
                      }}
                      className="group flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-2.5 py-1 text-xs text-purple-900 shadow-sm hover:border-purple-400 hover:bg-purple-100/50 transition-all text-left"
                      title={replyOption.text}
                    >
                      <span className="font-semibold">{replyOption.label}</span>
                      <span className="text-[10px] text-purple-600 group-hover:text-purple-800">↳ Insert</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Label className="font-semibold">Reply to customer</Label>
                {data.customer_typing && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Customer is typing…
                  </span>
                )}
              </div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Press <kbd className="rounded bg-zinc-200 px-1 font-mono">Cmd+Enter</kbd> to send · Type <kbd className="rounded bg-zinc-200 px-1 font-mono">/</kbd> for quick reply
              </Text>
            </div>

            {/* Quick response & Rich Card buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="flex-1 min-w-[200px]">
                <Select onValueChange={(responseId) => {
                  const saved = savedResponseQuery.data?.responses.find((item) => item.id === responseId)
                  if (saved) insertSavedResponse(saved.body)
                }}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select template or type /" />
                  </Select.Trigger>
                  <Select.Content>
                    {savedResponseQuery.data?.responses.map((response) => (
                      <Select.Item key={response.id} value={response.id}>
                        {response.title}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

            </div>

            {/* Visual Attached Card Chip */}
            {attachedCard && (
              <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/90 px-3 py-1.5 text-xs text-indigo-950 mb-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold">
                    {attachedCard.type === "protocol"
                      ? "🔬 Attached Protocol:"
                      : attachedCard.type === "product"
                      ? "🧪 Attached Product:"
                      : "🎁 Attached Promo:"}
                  </span>
                  <span className="truncate font-semibold">{attachedCard.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedCard(null)}
                  className="ml-2 rounded px-1.5 py-0.5 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-950 font-bold"
                  title="Remove attached card"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Visual Attached File Chip */}
            {replyAttachment && (
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-800 mb-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-zinc-900">📄 File:</span>
                  <span className="truncate font-medium">{replyAttachment.name}</span>
                  <span className="text-[10px] text-zinc-500">({(replyAttachment.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyAttachment(null)}
                  className="ml-2 rounded px-1.5 py-0.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 font-bold"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Slash Command Autocomplete Popover */}
            {slashQuery !== null && filteredSavedResponses.length > 0 && (
              <div className="absolute bottom-full left-4 mb-2 w-80 max-h-48 overflow-y-auto rounded-xl border border-ui-border-base bg-white p-2 shadow-xl z-20 space-y-1">
                <Text size="xsmall" className="px-2 py-1 font-semibold text-ui-fg-subtle">
                  Quick Reply Suggestions:
                </Text>
                {filteredSavedResponses.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => insertSavedResponse(res.body)}
                    className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-ui-bg-subtle transition-colors"
                  >
                    <p className="font-semibold text-ui-fg-base">{res.title}</p>
                    <p className="line-clamp-1 text-[11px] text-ui-fg-subtle">{res.body}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error("File exceeds 10 MiB limit")
                    return
                  }
                  setReplyAttachment(file)
                }
              }}
            />

            <Textarea
              ref={textareaRef}
              rows={3}
              value={reply}
              onChange={handleReplyChange}
              onKeyDown={handleReplyKeyDown}
              placeholder="Type your reply to the customer… (Cmd+Enter to send)"
              className="bg-white"
            />

            <div className="mt-2.5 flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                {/* 📎 Attach Button with Popover Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(!showAttachMenu)
                      setShowEmojiPicker(false)
                    }}
                    className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
                      showAttachMenu
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                    title="Attach file, product, protocol, or promo"
                  >
                    <span>📎</span>
                    <span>Attach</span>
                  </button>

                  {showAttachMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl z-50 animate-fade-in text-xs space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachMenu(false)
                          fileInputRef.current?.click()
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        <span className="text-base">📄</span>
                        <div>
                          <p className="font-semibold">Attach File / Photo</p>
                          <p className="text-[10px] text-zinc-400">PDF, JPG, PNG up to 10MB</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachMenu(false)
                          setPickerModal({ isOpen: true, tab: "product" })
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-zinc-700 hover:bg-emerald-50 hover:text-emerald-950 transition-colors"
                      >
                        <span className="text-base">🧪</span>
                        <div>
                          <p className="font-semibold">Recommend Product</p>
                          <p className="text-[10px] text-zinc-400">Live compound catalog</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachMenu(false)
                          setPickerModal({ isOpen: true, tab: "protocol" })
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-zinc-700 hover:bg-indigo-50 hover:text-indigo-950 transition-colors"
                      >
                        <span className="text-base">🔬</span>
                        <div>
                          <p className="font-semibold">Recommend Protocol</p>
                          <p className="text-[10px] text-zinc-400">Verified research guide</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachMenu(false)
                          setPickerModal({ isOpen: true, tab: "promo" })
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-zinc-700 hover:bg-amber-50 hover:text-amber-950 transition-colors"
                      >
                        <span className="text-base">🎁</span>
                        <div>
                          <p className="font-semibold">Send Promo Voucher</p>
                          <p className="text-[10px] text-zinc-400">Active store coupon</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 😊 Emoji Picker Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker)
                      setShowAttachMenu(false)
                    }}
                    className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all ${
                      showEmojiPicker
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                    title="Insert emoji"
                  >
                    <span>😊</span>
                    <span>Emoji</span>
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl z-50 animate-fade-in">
                      <div className="grid grid-cols-8 gap-1">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-base hover:bg-zinc-100 transition-colors"
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
              >
                Send reply (Cmd+↵)
              </Button>
            </div>
          </div>

          {/* Real Entity Search & Select Picker Modal */}
          <ChatEntityPickerModal
            isOpen={pickerModal.isOpen}
            initialTab={pickerModal.tab}
            onClose={() => setPickerModal((prev) => ({ ...prev, isOpen: false }))}
            onSelect={(card) => setAttachedCard(card)}
          />
        </Container>

        {/* Status Events Audit Trail */}
        {data.status_events && data.status_events.length > 0 && (
          <Container>
            <Heading level="h2">Status event history</Heading>
            <div className="mt-3 space-y-2">
              {data.status_events.map((event) => (
                <div key={event.id} className="flex items-start justify-between rounded-lg bg-zinc-50 p-3 text-xs">
                  <div>
                    <span className="font-semibold">
                      {event.actor_name || "System"}:
                    </span>{" "}
                    Changed status to{" "}
                    <Badge color="grey">{event.to_status.replaceAll("_", " ")}</Badge>
                    {event.reason && (
                      <p className="mt-1 italic text-ui-fg-subtle">
                        Reason: &quot;{event.reason}&quot;
                      </p>
                    )}
                  </div>
                  <time className="text-ui-fg-muted">
                    {new Date(event.occurred_at).toLocaleString("en-PH")}
                  </time>
                </div>
              ))}
            </div>
          </Container>
        )}

        {/* Internal Notes */}
        <Container>
          <Heading level="h2">Internal staff notes</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Only visible to authorized staff. Never returned to the customer.
          </Text>
          <div className="mt-3 space-y-2">
            {data.internal_notes.map((item) => (
              <div key={item.id} className="rounded-lg bg-amber-50/60 border border-amber-200/60 p-3">
                <div className="flex items-center justify-between">
                  <Text size="xsmall" weight="plus" className="text-amber-900">
                    {item.actor_name || "Staff note"}
                  </Text>
                  <Text size="xsmall" className="text-amber-700">
                    {new Date(item.created_at).toLocaleString("en-PH")}
                  </Text>
                </div>
                <Text size="small" className="mt-1 text-amber-950 whitespace-pre-wrap">
                  {item.body}
                </Text>
              </div>
            ))}
          </div>
          <Textarea
            className="mt-4"
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Write a private internal note for staff…"
          />
          <Button
            className="mt-2"
            variant="secondary"
            size="small"
            disabled={note.trim().length < 3}
            isLoading={noteMutation.isPending}
            onClick={() => noteMutation.mutate()}
          >
            Add internal note
          </Button>
        </Container>
      </div>

      {/* Customer Profile Sidebar Column */}
      <div className="space-y-4">
        <Container>
          <Heading level="h2">Customer profile</Heading>
          {customer ? (
            <div className="mt-4 space-y-3">
              <div>
                <Text size="small" weight="plus">
                  {customer.name}
                </Text>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {customer.email}
                </Text>
                <Text size="xsmall" className="text-ui-fg-muted mt-0.5">
                  Member since {new Date(customer.created_at).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}
                </Text>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-ui-bg-subtle p-3">
                <div>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Total orders
                  </Text>
                  <Text size="small" weight="plus">
                    {customer.orders_count}
                  </Text>
                </div>
                <div>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Total spent
                  </Text>
                  <Text size="small" weight="plus">
                    ₱{customer.total_spent.toLocaleString()}
                  </Text>
                </div>
              </div>

              {customer.recent_orders && customer.recent_orders.length > 0 && (
                <div>
                  <Text size="xsmall" className="font-semibold text-ui-fg-subtle mb-2">
                    Recent orders:
                  </Text>
                  <div className="space-y-1.5">
                    {customer.recent_orders.map((order) => (
                      <Link
                        key={order.id}
                        to={`/orders/${order.id}`}
                        className="flex items-center justify-between rounded-lg border border-ui-border-base p-2 hover:bg-ui-bg-subtle transition-colors text-xs"
                      >
                        <div>
                          <span className="font-semibold">#{order.display_id || order.id.slice(-6)}</span>
                          <span className="text-ui-fg-muted ml-2">
                            {new Date(order.created_at).toLocaleDateString("en-PH")}
                          </span>
                        </div>
                        <Badge color={order.status === "completed" ? "green" : "grey"}>
                          {order.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Text size="small" className="mt-3 text-ui-fg-subtle">
              No customer account linked.
            </Text>
          )}
        </Container>
      </div>
    </div>
  )
}

export default CustomerSupportDetailPage
