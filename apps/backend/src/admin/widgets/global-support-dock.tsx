import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight, XMark, ArrowUpRightOnBox } from "@medusajs/icons"
import { Badge, Button, Text, Textarea } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Link, useLocation } from "react-router-dom"

import { AdminChatCard, parseMessageCards, type ParsedCard } from "../components/admin-chat-card"
import { ChatEntityPickerModal } from "../components/chat-entity-picker-modal"
import { sdk } from "../lib/sdk"

type Conversation = {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  last_activity_at: string
  latest_message_preview: string
  unread_count: number
  waiting_since: string | null
  customer: { id: string; name: string; email: string } | null
}

type Message = {
  id: string
  sender_type: string
  sender_id: string
  sender_name?: string
  body: string
  sent_at: string
}

type Attachment = {
  id: string
  message_id: string
  file_name: string
  mime_type: string
  size_bytes: number
  scan_status?: string
}

type ConversationDetail = {
  conversation: Conversation
  customer: { id: string; name: string; email: string } | null
  messages: Message[]
  attachments?: Attachment[]
  customer_typing?: boolean
}

const EMOJI_LIST = [
  "👍", "👋", "🧪", "🔬", "💊", "📦", "✨", "😊",
  "🙌", "🙏", "❤️", "🔥", "⚡", "💡", "❓", "✅",
]

function playSupportChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08) // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch {
    // Audio context not available or user blocked audio
  }
}

const GlobalSupportDock = () => {
  const location = useLocation()
  const client = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [attachedCard, setAttachedCard] = useState<ParsedCard | null>(null)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [pickerModal, setPickerModal] = useState<{
    isOpen: boolean
    tab: "product" | "protocol" | "promo"
  }>({ isOpen: false, tab: "product" })
  const [chimeEnabled, setChimeEnabled] = useState(() => {
    return window.localStorage.getItem("pepstack:admin-chime") !== "false"
  })
  const prevUnreadRef = useRef<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Poll for open/active support conversations across all admin pages

  // Poll for open/active support conversations across all admin pages
  const inboxQuery = useQuery({
    queryKey: ["global-admin-support-inbox"],
    queryFn: () =>
      sdk.client.fetch<{ conversations: Conversation[]; count: number }>("/admin/customer-support", {
        query: { limit: 10, queue: "unread" },
      }),
    refetchInterval: 5000,
  })

  const conversations = inboxQuery.data?.conversations || []
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)

  // Audio chime when new unread messages arrive
  useEffect(() => {
    if (totalUnread > prevUnreadRef.current && chimeEnabled && prevUnreadRef.current !== 0) {
      playSupportChime()
    }
    prevUnreadRef.current = totalUnread
  }, [totalUnread, chimeEnabled])

  // Select first conversation if none selected
  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id)
    }
  }, [conversations, selectedId])

  // Active conversation details query
  const detailQuery = useQuery({
    queryKey: ["global-admin-support-detail", selectedId],
    queryFn: () =>
      selectedId
        ? sdk.client.fetch<ConversationDetail>(`/admin/customer-support/${selectedId}`)
        : null,
    enabled: Boolean(selectedId && isOpen),
    refetchInterval: isOpen ? 3500 : false,
  })

  // Smart reply suggestions
  const smartReplyQuery = useQuery({
    queryKey: ["global-admin-smart-reply", selectedId],
    queryFn: () =>
      selectedId
        ? sdk.client.fetch<{
            smart_replies: Array<{ id: string; label: string; text: string }>
            sentiment: { sentiment: string; priorityScore: string }
          }>(`/admin/customer-support/${selectedId}/smart-reply`, { method: "POST" })
        : null,
    enabled: Boolean(selectedId && isOpen),
  })

  // Open attachment handler
  const openAttachment = async (attachment: Attachment) => {
    if (!selectedId) return
    if (attachment.scan_status === "blocked") {
      alert("This attachment was blocked by security scan")
      return
    }
    const response = await sdk.client.fetch<{ url: string }>(
      `/admin/customer-support/${selectedId}/attachments/${attachment.id}/file`,
    )
    window.open(response.url, "_blank", "noopener,noreferrer")
  }

  // Insert emoji helper
  const insertEmoji = (emoji: string) => {
    setReplyText((prev) => `${prev}${emoji}`)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  // Send reply mutation
  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("No conversation selected")
      const cardTag = attachedCard
        ? attachedCard.type === "protocol"
          ? `[card:protocol:${attachedCard.handle}:${attachedCard.title}:${attachedCard.duration}]`
          : attachedCard.type === "product"
          ? `[card:product:${attachedCard.variantId}:${attachedCard.title}:${attachedCard.price}:${attachedCard.handle}]`
          : attachedCard.type === "promo"
          ? `[card:promo:${attachedCard.code}:${attachedCard.title}:${attachedCard.description}]`
          : `[card:order:${attachedCard.displayId}:${attachedCard.total}:${attachedCard.status}:${attachedCard.orderId}]`
        : ""
      const fullBody = [replyText.trim(), cardTag].filter(Boolean).join("\n")
      if (!fullBody && !attachedFile) throw new Error("Empty message")

      const res = await sdk.client.fetch<{ message: { id: string } }>(
        `/admin/customer-support/${selectedId}/messages`,
        {
          method: "POST",
          body: { body: fullBody || "Attached file" },
        }
      )

      if (attachedFile && res.message?.id) {
        const formData = new FormData()
        formData.set("attachment", attachedFile, attachedFile.name)
        await sdk.client.fetch(
          `/admin/customer-support/${selectedId}/messages/${res.message.id}/attachments`,
          {
            method: "POST",
            headers: { "content-type": null },
            body: formData,
          }
        ).catch(() => undefined)
      }

      return res
    },
    onSuccess: () => {
      setReplyText("")
      setAttachedCard(null)
      setAttachedFile(null)
      setShowAttachMenu(false)
      setShowEmojiPicker(false)
      client.invalidateQueries({ queryKey: ["global-admin-support-detail", selectedId] })
      client.invalidateQueries({ queryKey: ["global-admin-support-inbox"] })
    },
  })

  // Typing broadcast as staff types
  const handleTyping = (val: string) => {
    setReplyText(val)
    if (!selectedId) return
    sdk.client
      .fetch(`/admin/customer-support/${selectedId}/typing`, { method: "POST" })
      .catch(() => undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      if ((replyText.trim() || attachedCard || attachedFile) && !replyMutation.isPending) {
        replyMutation.mutate()
      }
    }
  }

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [detailQuery.data?.messages.length, isOpen])

  const content = (
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col items-end font-sans">
      {/* Floating Popup Window */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="Live Customer Support"
          className="mb-3 flex h-[580px] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl animate-fade-in"
        >
          {/* Header */}
          <header className="flex items-center justify-between border-b border-zinc-200 bg-zinc-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                💬
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold truncate">Live Customer Support</h3>
                  {totalUnread > 0 && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                      {totalUnread}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 truncate">
                  {conversations.length} active · Auto-refreshing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = !chimeEnabled
                  setChimeEnabled(next)
                  window.localStorage.setItem("pepstack:admin-chime", String(next))
                }}
                className="rounded p-1 text-xs text-zinc-400 hover:text-white transition-colors"
                title={chimeEnabled ? "Mute audio alerts" : "Enable audio alerts"}
              >
                {chimeEnabled ? "🔔" : "🔕"}
              </button>

              {selectedId && (
                <Link
                  to={`/customer-support/${selectedId}`}
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 text-zinc-400 hover:text-white transition-colors"
                  title="Open full page view"
                >
                  <ArrowUpRightOnBox className="h-4 w-4" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-zinc-400 hover:text-white transition-colors"
              >
                <XMark className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Conversation Selector Strip (if multiple chats) */}
          {conversations.length > 1 && (
            <div className="flex overflow-x-auto border-b border-zinc-100 bg-zinc-50/80 px-2 py-1.5 gap-1 scrollbar-none">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                    selectedId === conv.id
                      ? "bg-zinc-900 font-bold text-white"
                      : "bg-white text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200/60"
                  }`}
                >
                  <span className="truncate max-w-[110px]">
                    {conv.customer ? conv.customer.name : conv.subject}
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Chat Stream Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-zinc-50/40">
            {detailQuery.isLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                Loading live thread…
              </div>
            ) : !detailQuery.data ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400 space-y-1">
                <span className="text-2xl">📥</span>
                <p className="text-xs font-semibold text-zinc-600">No active unread chats</p>
                <p className="text-[11px] text-zinc-400">You're all caught up with customers!</p>
              </div>
            ) : (
              <>
                {/* Customer Context Bar */}
                <div className="rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        {detailQuery.data.customer?.name || "Customer"}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {detailQuery.data.customer?.email || "No email"} · {detailQuery.data.conversation.category}
                      </p>
                    </div>
                    <Badge color={detailQuery.data.conversation.priority === "urgent" ? "red" : "orange"}>
                      {detailQuery.data.conversation.priority}
                    </Badge>
                  </div>
                </div>

                {/* Messages */}
                {detailQuery.data.messages.map((msg) => {
                  const isStaff = msg.sender_type === "staff" || msg.sender_type === "admin"
                  const { cleanText, cards } = parseMessageCards(msg.body)
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] text-zinc-400 mb-0.5 px-1">
                        {isStaff ? "You (Staff)" : detailQuery.data?.customer?.name || "Customer"} ·{" "}
                        {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {cleanText && (
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                            isStaff
                              ? "rounded-br-sm bg-zinc-900 text-white"
                              : "rounded-bl-sm border border-zinc-200 bg-white text-zinc-900 shadow-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{cleanText}</p>
                        </div>
                      )}
                      {cards.map((card, cIdx) => (
                        <div key={cIdx} className="w-full max-w-[88%] mt-1">
                          <AdminChatCard card={card} />
                        </div>
                      ))}

                      {/* Attached Files in Message */}
                      {detailQuery.data?.attachments
                        ?.filter((a) => a.message_id === msg.id)
                        .map((attachment) => (
                          <button
                            key={attachment.id}
                            type="button"
                            onClick={() => openAttachment(attachment)}
                            className="mt-1 flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-800 hover:bg-zinc-100 transition-colors shadow-2xs"
                            title="Click to view attachment"
                          >
                            <span>📄</span>
                            <span className="truncate max-w-[170px]">{attachment.file_name}</span>
                            <span className="text-[10px] text-zinc-400">
                              ({(attachment.size_bytes / 1024).toFixed(0)} KB)
                            </span>
                          </button>
                        ))}
                    </div>
                  )
                })}

                {/* Customer Typing Indicator */}
                {detailQuery.data?.customer_typing && (
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-800 animate-pulse w-fit">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Customer is typing…
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* AI Smart Suggestion Chips */}
          {smartReplyQuery.data?.smart_replies && smartReplyQuery.data.smart_replies.length > 0 && (
            <div className="border-t border-purple-100 bg-purple-50/50 px-3 py-1.5">
              <div className="flex items-center gap-1 text-[10px] font-bold text-purple-900 mb-1">
                <span>✨ AI Suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {smartReplyQuery.data.smart_replies.slice(0, 2).map((sr) => (
                  <button
                    key={sr.id}
                    type="button"
                    onClick={() => setReplyText(sr.text)}
                    className="truncate max-w-[180px] rounded border border-purple-200 bg-white px-2 py-0.5 text-[10px] text-purple-900 hover:bg-purple-100/70 transition-colors text-left"
                    title={sr.text}
                  >
                    {sr.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Streamlined Reply Box */}
          <footer className="border-t border-zinc-200 bg-white p-2.5 relative">
            {/* Visual Attached Card Chip */}
            {attachedCard && (
              <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/90 px-2.5 py-1 text-xs text-indigo-950 mb-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold">
                    {attachedCard.type === "protocol"
                      ? "🔬 Attached Protocol:"
                      : attachedCard.type === "product"
                      ? "🧪 Attached Product:"
                      : attachedCard.type === "promo"
                      ? "🎁 Attached Promo:"
                      : "📦 Attached Order:"}
                  </span>
                  <span className="truncate font-medium">
                    {attachedCard.type === "order"
                      ? `Order #${attachedCard.displayId} (${attachedCard.total})`
                      : attachedCard.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedCard(null)}
                  className="ml-2 rounded px-1 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-950 font-bold"
                  title="Remove attached card"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Visual Attached File Chip */}
            {attachedFile && (
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-800 mb-2 shadow-xs animate-fade-in">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-zinc-900">📄 File:</span>
                  <span className="truncate font-medium">{attachedFile.name}</span>
                  <span className="text-[10px] text-zinc-500">({(attachedFile.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="ml-2 rounded px-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 font-bold"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Attachment Popover Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-14 left-2 w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl z-50 animate-fade-in text-xs space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false)
                    fileInputRef.current?.click()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-zinc-700 hover:bg-zinc-100 transition-colors"
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
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-zinc-700 hover:bg-emerald-50 hover:text-emerald-950 transition-colors"
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
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-zinc-700 hover:bg-indigo-50 hover:text-indigo-950 transition-colors"
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
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-zinc-700 hover:bg-amber-50 hover:text-amber-950 transition-colors"
                >
                  <span className="text-base">🎁</span>
                  <div>
                    <p className="font-semibold">Send Promo Voucher</p>
                    <p className="text-[10px] text-zinc-400">Active store coupon</p>
                  </div>
                </button>
              </div>
            )}

            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-14 left-10 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl z-50 animate-fade-in">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertEmoji(emoji)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-base hover:bg-zinc-100 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  if (file.size > 10 * 1024 * 1024) {
                    alert("File exceeds 10 MiB limit")
                    return
                  }
                  setAttachedFile(file)
                }
              }}
            />

            {/* Compact Action Bar + Textarea */}
            <div className="flex items-end gap-1.5">
              <div className="flex items-center gap-1 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(!showAttachMenu)
                    setShowEmojiPicker(false)
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-all ${
                    showAttachMenu
                      ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  title="Attach file, product, protocol, or promo"
                >
                  📎
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker)
                    setShowAttachMenu(false)
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-all ${
                    showEmojiPicker
                      ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                  title="Insert emoji"
                >
                  😊
                </button>
              </div>

              <div className="relative flex-1">
                <Textarea
                  ref={textareaRef}
                  rows={2}
                  value={replyText}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type reply message… (Cmd+Enter to send)"
                  className="text-xs resize-none pr-14"
                />
                <div className="absolute right-1.5 bottom-1.5">
                  <Button
                    size="small"
                    variant="primary"
                    disabled={(!replyText.trim() && !attachedCard && !attachedFile) || replyMutation.isPending}
                    onClick={() => replyMutation.mutate()}
                    className="h-6 px-2 text-[11px] font-semibold"
                  >
                    {replyMutation.isPending ? "…" : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </footer>
        </aside>
      )}

      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
        title="Open Live Customer Support Dock"
      >
        {isOpen ? (
          <XMark className="h-6 w-6 transition-transform" />
        ) : (
          <div className="relative flex items-center justify-center">
            <ChatBubbleLeftRight className="h-6 w-6" />
            {totalUnread > 0 && (
              <span className="absolute -top-3 -right-3 flex h-5.5 min-w-5.5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-md animate-bounce">
                {totalUnread}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Search & Select Catalog Entity Picker Modal */}
      <ChatEntityPickerModal
        isOpen={pickerModal.isOpen}
        initialTab={pickerModal.tab}
        onClose={() => setPickerModal((prev) => ({ ...prev, isOpen: false }))}
        onSelect={(card) => setAttachedCard(card)}
      />
    </div>
  )

  return typeof document !== "undefined" ? createPortal(content, document.body) : null
}

export const config = defineWidgetConfig({
  zone: [
    "order.list.before",
    "order.list.after",
    "order.details.before",
    "order.details.after",
    "draft_order.list.before",
    "draft_order.list.after",
    "draft_order.details.before",
    "draft_order.details.after",
    "product.list.before",
    "product.list.after",
    "product.details.before",
    "product.details.after",
    "customer.list.before",
    "customer.list.after",
    "customer.details.before",
    "customer.details.after",
    "inventory_item.list.before",
    "inventory_item.list.after",
    "inventory_item.details.before",
    "inventory_item.details.after",
    "promotion.list.before",
    "promotion.list.after",
    "price_list.list.before",
    "price_list.list.after",
    "campaign.list.before",
    "campaign.list.after",
  ],
})

export default GlobalSupportDock
