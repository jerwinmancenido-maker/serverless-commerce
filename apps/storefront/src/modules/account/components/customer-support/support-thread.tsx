"use client"

import {
  broadcastSupportTyping,
  postThreadMessageAction,
  retrieveSupportAttachmentUrl,
  retrieveSupportThread,
  type SupportActionState,
  type SupportConversationDetail,
} from "@lib/data/customer-support"
import {
  ChatCard,
  parseMessageCards,
  type ParsedCard,
} from "./chat-card"
import CustomerEntityPickerModal from "./customer-entity-picker-modal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"


import { useCallback, useEffect, useRef, useState, useTransition } from "react"

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
  attachments: AttachmentItem[]
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

export default function SupportThread({
  countryCode,
  conversation: initialConversation,
}: {
  countryCode: string
  conversation: SupportConversationDetail
}) {
  const [conversation, setConversation] = useState<SupportConversationDetail>(initialConversation)
  const [optimisticMessages, setOptimisticMessages] = useState<MessageItem[]>([])
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
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [pending, startTransition] = useTransition()

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }, [])

  // Background polling every 8 seconds
  useEffect(() => {
    const poll = async () => {
      if (document.visibilityState !== "visible") return
      try {
        const res = await retrieveSupportThread()
        setConversation(res.conversation)
        setOptimisticMessages([])
      } catch {
        // Background silent poll
      }
    }
    const timer = window.setInterval(poll, 8000)
    window.addEventListener("focus", poll)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", poll)
    }
  }, [])

  // Auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`
    }
  }, [text])

  // File preview URL
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

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom(false)
  }, [conversation.messages.length, optimisticMessages.length, scrollToBottom])

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage(`File is too large (${formatFileSize(selectedFile.size)}). Max allowed is 10 MiB.`)
      return
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(selectedFile.type)) {
      setErrorMessage("Only PNG, JPEG, and PDF files are supported.")
      return
    }
    setErrorMessage(null)
    setFile(selectedFile)
  }

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed && !file && !attachedCard) return

    setErrorMessage(null)
    const clientRequestId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-account-chat`
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
      attachment_file: currentFile || undefined,
    }

    setOptimisticMessages((prev) => [...prev, optMsg])

    setText("")
    setFile(null)
    setAttachedCard(null)
    setShowEmojis(false)
    setShowAttachMenu(false)
    scrollToBottom(true)

    startTransition(async () => {
      const data = new FormData()
      data.set("country_code", countryCode)
      data.set("body", messageText)
      data.set("category", conversation.category)
      data.set("client_request_id", clientRequestId)
      const effectiveOrderId = currentCard?.type === "order" ? currentCard.orderId : conversation.order_id
      if (effectiveOrderId) data.set("order_id", effectiveOrderId)
      if (currentFile) data.set("attachment", currentFile)

      const result = await postThreadMessageAction(EMPTY_ACTION, data)
      if (!result.success) {
        setErrorMessage(result.error)
        setOptimisticMessages((prev) =>
          prev.map((m) => (m.id === clientRequestId ? { ...m, status: "failed" } : m))
        )
      } else {
        const refreshed = await retrieveSupportThread().catch(() => null)
        if (refreshed) {
          setConversation(refreshed.conversation)
          setOptimisticMessages([])
        }
      }
    })
  }

  const handleRetry = (failedMsg: MessageItem) => {
    setOptimisticMessages((prev) =>
      prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "sending" } : m))
    )
    startTransition(async () => {
      const data = new FormData()
      data.set("country_code", countryCode)
      data.set("body", failedMsg.body)
      data.set("category", conversation.category)
      data.set("client_request_id", failedMsg.id)
      if (conversation.order_id) data.set("order_id", conversation.order_id)
      if (failedMsg.attachment_file) data.set("attachment", failedMsg.attachment_file)

      const result = await postThreadMessageAction(EMPTY_ACTION, data)
      if (!result.success) {
        setErrorMessage(result.error)
        setOptimisticMessages((prev) =>
          prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "failed" } : m))
        )
      } else {
        const refreshed = await retrieveSupportThread().catch(() => null)
        if (refreshed) {
          setConversation(refreshed.conversation)
          setOptimisticMessages([])
        }
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const allMessages: MessageItem[] = [
    ...conversation.messages,
    ...optimisticMessages.filter((opt) => !conversation.messages.some((m) => m.id === opt.id)),
  ]

  const filteredMessages = searchQuery.trim()
    ? allMessages.filter((m) => m.body.toLowerCase().includes(searchQuery.toLowerCase()))
    : allMessages

  const staffReadTime = conversation.staff_last_read_at
    ? new Date(conversation.staff_last_read_at).getTime()
    : 0

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <LocalizedClientLink
          href="/account"
          className="text-sm font-medium text-ui-fg-interactive hover:underline"
        >
          ← Account overview
        </LocalizedClientLink>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSearching(!isSearching)}
            className="flex items-center gap-1.5 rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium text-ui-fg-subtle hover:bg-ui-bg-subtle transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>{isSearching ? "Close Search" : "Search Messages"}</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Container */}
      <article className="overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-sm flex flex-col h-[75vh] min-h-[550px]">
        {/* Thread Header */}
        <header className="border-b border-ui-border-base bg-ui-bg-subtle/40 px-6 py-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-ui-fg-base">{conversation.subject}</h1>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Continuous Thread
              </span>
            </div>
            <p className="text-xs text-ui-fg-subtle">
              Direct and private channel with PepStack Support
              {conversation.order_id ? " · Linked to order" : ""}
              {conversation.protocol_series_id ? " · Linked to protocol access" : ""}
            </p>
          </div>
        </header>

        {/* Search Bar when Active */}
        {isSearching && (
          <div className="flex items-center gap-2 border-b border-ui-border-base bg-zinc-50 px-6 py-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across this thread…"
              className="w-full rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs outline-none focus:border-ui-fg-base"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-ui-fg-muted hover:text-ui-fg-base font-medium"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-center text-xs font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
          {filteredMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-2 text-ui-fg-subtle">
              <div className="h-12 w-12 rounded-full bg-ui-bg-subtle flex items-center justify-center text-2xl">
                💬
              </div>
              <p className="text-sm font-semibold text-ui-fg-base">No messages found</p>
              <p className="text-xs max-w-sm">
                {searchQuery ? "Try a different search term." : "Send a message below to reach out to our team."}
              </p>
            </div>
          ) : (
            filteredMessages.map((message, idx) => {
              const prevMessage = filteredMessages[idx - 1]
              const showDateDivider =
                !prevMessage ||
                getDateDividerLabel(message.sent_at) !== getDateDividerLabel(prevMessage.sent_at)
              const showNewSession = isNewSession(message.sent_at, prevMessage?.sent_at)
              const isCustomer = message.sender_type === "customer"
              const isSeen = isCustomer && new Date(message.sent_at).getTime() <= staffReadTime

              return (
                <div key={message.id || idx} className="space-y-2">
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-4">
                      <span className="rounded-full bg-zinc-200/80 px-3 py-0.5 text-[11px] font-semibold text-zinc-600">
                        {getDateDividerLabel(message.sent_at)}
                      </span>
                    </div>
                  )}

                  {showNewSession && (
                    <div className="flex items-center justify-center my-3">
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-3.5 py-0.5 text-xs font-medium text-blue-700">
                        New Session · {new Date(message.sent_at).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  )}

                  {message.sender_type === "system" ? (
                    <div className="mx-auto max-w-[80%] text-center my-2">
                      <p className="rounded-xl bg-zinc-100 px-4 py-2 text-xs text-zinc-600 italic">
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
                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                                  isCustomer
                                    ? "bg-zinc-900 text-white rounded-tr-xs"
                                    : "bg-white border border-zinc-200/90 text-zinc-900 rounded-tl-xs"
                                }`}
                              >
                                {!isCustomer && (
                                  <p className="text-[10px] font-semibold text-zinc-400 mb-1">
                                    {message.sender || "PepStack Support"}
                                  </p>
                                )}
                                {cleanText && (
                                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed break-words">
                                    {cleanText}
                                  </p>
                                )}

                                {/* Attachments */}
                                {message.attachments?.map((attachment) => (
                                  <ThreadAttachment key={attachment.id || attachment.file_name} attachment={attachment} isCustomer={isCustomer} />
                                ))}
                              </div>
                            )}

                            {/* Standalone cards: unbundled, clean, perfectly aligned */}
                            {cards.map((card, cIdx) => (
                              <div key={cIdx} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                                <ChatCard key={cIdx} card={card} countryCode={countryCode} />
                              </div>
                            ))}
                          </div>
                        )
                      })()}

                      {/* Timestamp and Seen Status */}
                      <div className="flex items-center gap-1.5 mt-1 px-1 text-[11px] text-zinc-400">
                        <time>{formatMessageTime(message.sent_at)}</time>
                        {isCustomer && (
                          <span>
                            {message.status === "sending" ? (
                              <span className="text-zinc-400">⏳ Sending…</span>
                            ) : message.status === "failed" ? (
                              <button
                                type="button"
                                onClick={() => handleRetry(message)}
                                className="text-red-600 font-semibold underline hover:text-red-700"
                              >
                                Failed · Retry
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
            })
          )}

          {/* Live Staff Typing Indicator Bubble */}
          {conversation.staff_typing && (
            <div className="flex items-center gap-2 pl-2 py-1 text-xs text-ui-fg-muted animate-fade-in">
              <div className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 border border-zinc-200 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-1.5 text-[11px] font-medium text-zinc-700">Support is typing…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Composer */}
        <footer className="border-t border-zinc-200/90 bg-white p-4">
          {/* Attached Card Chip */}
          {attachedCard && (
            <div className="mb-2.5 flex items-center justify-between rounded-xl border border-zinc-200/90 bg-zinc-50 px-3 py-2 text-xs max-w-sm shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">
                  {attachedCard.type === "order"
                    ? "📦"
                    : attachedCard.type === "product"
                    ? "🧪"
                    : attachedCard.type === "protocol"
                    ? "🔬"
                    : "🎁"}
                </span>
                <span className="font-semibold text-zinc-900 truncate">
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
            <div className="mb-2.5 flex items-center justify-between rounded-xl border border-zinc-200/90 bg-zinc-50 px-3 py-2 text-xs max-w-sm shadow-2xs">
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
                  <p className="truncate font-medium text-zinc-900 text-xs">{file.name}</p>
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

          {/* Emoji Popover */}
          {showEmojis && (
            <div className="mb-2 grid grid-cols-8 gap-1.5 rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-xl max-w-xs z-30">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setText((prev) => prev + emoji)
                    setShowEmojis(false)
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-100 text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Hidden File Input */}
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
          <div className="flex flex-col rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-2.5 focus-within:bg-white focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                broadcastSupportTyping()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message… (Press Enter to send, Shift+Enter for new line)"
              rows={2}
              maxLength={10_000}
              className="w-full resize-none bg-transparent px-1.5 py-1 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 outline-none"
            />

            {/* Action Toolbar */}
            <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100 mt-1">
              <div className="flex items-center gap-1">
                {/* Emoji Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojis(!showEmojis)
                    setShowAttachMenu(false)
                  }}
                  className={`rounded-lg p-2 transition-colors text-sm ${
                    showEmojis ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800"
                  }`}
                  aria-label="Toggle emoji picker"
                >
                  😊
                </button>

                {/* Attachment Button with Popover Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachMenu(!showAttachMenu)
                      setShowEmojis(false)
                    }}
                    className={`rounded-lg p-2 transition-colors ${
                      showAttachMenu ? "bg-zinc-200 text-zinc-900" : "text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-800"
                    }`}
                    aria-label="Attach item"
                    title="Attach photo, previous order, compound, or protocol"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>

                  {showAttachMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 rounded-2xl border border-zinc-200/90 bg-white p-1.5 shadow-xl z-30 text-xs space-y-0.5 animate-fade-in">
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
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white shadow hover:bg-black disabled:opacity-25 transition-all active:scale-95"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </footer>
      </article>

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

function ThreadAttachment({ attachment, isCustomer }: { attachment: AttachmentItem; isCustomer: boolean }) {
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
      <div className="mt-2 overflow-hidden rounded-xl border border-black/10">
        <button type="button" onClick={handleOpen} className="block group relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.local_preview || `/api/store/customers/me/support/attachments/${attachment.id}/file`}
            alt={attachment.file_name}
            className="max-h-56 max-w-full rounded-xl object-cover transition-transform group-hover:scale-[1.01]"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
            View Image ↗
          </div>
        </button>
        <span className="block px-2.5 py-1 text-[11px] truncate opacity-75">
          {attachment.file_name} ({formatFileSize(attachment.size_bytes)})
        </span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`mt-2 flex items-center gap-3 rounded-xl p-3 text-left border transition-all ${
        isCustomer
          ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
          : "bg-zinc-50 border-ui-border-base text-ui-fg-base hover:bg-zinc-100"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 text-lg font-bold">
        {isPdf ? "📄" : "📎"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">{attachment.file_name}</p>
        <p className="text-[11px] opacity-75">{formatFileSize(attachment.size_bytes)} · Click to open</p>
      </div>
    </button>
  )
}
