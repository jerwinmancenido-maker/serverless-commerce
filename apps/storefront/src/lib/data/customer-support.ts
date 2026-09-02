"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { revalidatePath } from "next/cache"

export type SupportConversation = { id: string; subject: string; category: string; status: "new" | "open" | "waiting_for_customer" | "resolved" | "closed"; priority: string; order_id: string | null; protocol_series_id: string | null; opened_at: string; last_activity_at: string; unread_count?: number; latest_message_preview?: string }
export type SupportConversationDetail = SupportConversation & { staff_last_read_at?: string | null; staff_typing?: boolean; messages: Array<{ id: string; sender: "You" | "Support" | "Automatic confirmation"; sender_type: "customer" | "staff" | "system"; body: string; sent_at: string; attachments: Array<{ id: string; file_name: string; mime_type: string; size_bytes: number }> }> }
export type SupportActionState = { success: boolean; error: string | null; conversation_id?: string; message_id?: string }
export type SupportConfiguration = { enabled: boolean; side_panel_enabled: boolean; display_name: string; response_time_message: string; timezone: string; offline_message: string; business_hours_enabled: boolean; business_hours: Array<{ day: number; open: boolean; opens_at: string | null; closes_at: string | null }>; attachment_uploads_enabled: boolean; maximum_attachment_size_bytes: number; allowed_mime_types: string[]; categories: Array<{ key: string; label: string; guidance: string | null }> }
export type SupportSummary = { unread_count: number; active_count: number; conversations: SupportConversation[] }
const state = (error?: unknown): SupportActionState => error ? { success: false, error: error instanceof Error ? error.message : "Support request could not be completed." } : { success: true, error: null }

export const retrieveSupportConfiguration = async () => sdk.client.fetch<{ configuration: SupportConfiguration }>("/store/support/config", { method: "GET", next: { revalidate: 60 } })

export const listSupportConversations = async () => sdk.client.fetch<{ conversations: SupportConversation[] }>("/store/customers/me/support", { method: "GET", headers: await getAuthHeaders(), cache: "no-store" })
export const retrieveSupportSummary = async () => sdk.client.fetch<SupportSummary>("/store/customers/me/support/summary", { method: "GET", headers: await getAuthHeaders(), cache: "no-store" })
export const retrieveSupportConversation = async (id: string) => sdk.client.fetch<{ conversation: SupportConversationDetail }>(`/store/customers/me/support/${encodeURIComponent(id)}`, { method: "GET", headers: await getAuthHeaders(), cache: "no-store" })
export const retrieveSupportThread = async () => sdk.client.fetch<{ conversation: SupportConversationDetail }>("/store/customers/me/support/thread", { method: "GET", headers: await getAuthHeaders(), cache: "no-store" })

export async function postThreadMessageAction(_state: SupportActionState, formData: FormData): Promise<SupportActionState> {
  try {
    const countryCode = String(formData.get("country_code") || "ph")
    const body = String(formData.get("body") || "").trim()
    const clientRequestId = String(formData.get("client_request_id") || "") || undefined
    const orderId = String(formData.get("order_id") || "") || undefined
    const protocolSeriesId = String(formData.get("protocol_series_id") || "") || undefined
    const category = String(formData.get("category") || "") || undefined

    const result = await sdk.client.fetch<{
      conversation_id: string
      message: { id: string }
    }>("/store/customers/me/support/thread/message", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        body,
        client_request_id: clientRequestId,
        order_id: orderId || null,
        protocol_series_id: protocolSeriesId || null,
        category: category || undefined,
      },
    })

    const attachment = formData.get("attachment")
    if (attachment instanceof File && attachment.size > 0) {
      if (attachment.size > 10 * 1024 * 1024) {
        return { success: false, error: "Attachment exceeds the maximum allowed size of 10 MiB." }
      }
      const upload = new FormData()
      upload.set("attachment", attachment, attachment.name)
      await sdk.client.fetch(
        `/store/customers/me/support/${encodeURIComponent(result.conversation_id)}/messages/${encodeURIComponent(result.message.id)}/attachments`,
        {
          method: "POST",
          headers: { ...(await getAuthHeaders()), "content-type": null },
          body: upload,
        }
      )
    }

    revalidatePath(`/${countryCode}/account/support`, "page")
    return { ...state(), conversation_id: result.conversation_id, message_id: result.message.id }
  } catch (error) {
    return state(error)
  }
}

export async function createSupportConversationAction(_state: SupportActionState, formData: FormData): Promise<SupportActionState> {
  try { const result = await sdk.client.fetch<{ conversation: SupportConversation; message_id?: string }>("/store/customers/me/support", { method: "POST", headers: await getAuthHeaders(), body: { subject: String(formData.get("subject") || ""), category: String(formData.get("category") || "other"), body: String(formData.get("body") || ""), order_id: String(formData.get("order_id") || "") || null, protocol_series_id: String(formData.get("protocol_series_id") || "") || null, client_request_id: String(formData.get("client_request_id") || "") || undefined } }); revalidatePath(`/${String(formData.get("country_code") || "ph")}/account/support`, "page"); return { ...state(), conversation_id: result.conversation.id, message_id: result.message_id } } catch (error) { return state(error) }
}
export async function replySupportConversationAction(_state: SupportActionState, formData: FormData): Promise<SupportActionState> {
  const id = String(formData.get("conversation_id") || ""); try { const result = await sdk.client.fetch<{ message: { id: string } }>(`/store/customers/me/support/${encodeURIComponent(id)}/messages`, { method: "POST", headers: await getAuthHeaders(), body: { body: String(formData.get("body") || ""), client_request_id: String(formData.get("client_request_id") || "") || undefined } }); revalidatePath(`/${String(formData.get("country_code") || "ph")}/account/support/${id}`, "page"); return { ...state(), message_id: result.message.id } } catch (error) { return state(error) }
}
export async function mutateSupportConversationAction(formData: FormData) { const id = String(formData.get("conversation_id") || ""); await sdk.client.fetch(`/store/customers/me/support/${encodeURIComponent(id)}`, { method: "POST", headers: await getAuthHeaders(), body: { action: String(formData.get("action") || "close") } }); revalidatePath(`/${String(formData.get("country_code") || "ph")}/account/support/${id}`, "page") }

export async function uploadSupportAttachmentAction(_state: SupportActionState, formData: FormData): Promise<SupportActionState> { const conversationId = String(formData.get("conversation_id") || ""); const messageId = String(formData.get("message_id") || ""); const attachment = formData.get("attachment"); if (!(attachment instanceof File) || !attachment.size) return state(new Error("Choose a PNG, JPEG, or PDF file.")); if (attachment.size > 10 * 1024 * 1024) return state(new Error("Attachment must not exceed 10 MiB.")); if (!["image/jpeg", "image/png", "application/pdf"].includes(attachment.type)) return state(new Error("Only PNG, JPEG, and PDF files are supported.")); const body = new FormData(); body.set("attachment", attachment, attachment.name); try { await sdk.client.fetch(`/store/customers/me/support/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/attachments`, { method: "POST", headers: { ...await getAuthHeaders(), "content-type": null }, body }); revalidatePath(`/${String(formData.get("country_code") || "ph")}/account/support/${conversationId}`, "page"); return state() } catch (error) { return state(error) } }
export async function retrieveSupportAttachmentUrl(attachmentId: string) { const result = await sdk.client.fetch<{ url: string }>(`/store/customers/me/support/attachments/${encodeURIComponent(attachmentId)}/file`, { method: "GET", headers: await getAuthHeaders(), cache: "no-store" }); return result.url }

export async function markSupportRead(conversationId?: string) {
  await sdk.client.fetch("/store/customers/me/support-read", {
    method: "POST",
    headers: await getAuthHeaders(),
    body: { conversation_id: conversationId, all: !conversationId },
    cache: "no-store",
  })
}

export async function broadcastSupportTyping() {
  try {
    await sdk.client.fetch("/store/customers/me/support/typing", {
      method: "POST",
      headers: await getAuthHeaders(),
      cache: "no-store",
    })
  } catch {
    // Non-critical background telemetry
  }
}

type RawStoreOrder = {
  id: string
  display_id?: string | number | null
  created_at: string
  status?: string | null
  total?: number | null
  currency_code?: string | null
  items?: Array<{ title?: string | null }>
}

type RawStoreProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  variants?: Array<{
    id: string
    calculated_price?: {
      calculated_amount?: number | null
    }
  }>
}

type RawStoreProtocol = {
  handle: string
  title: string
  summary?: string | null
  content?: {
    duration_cycle?: string
    duration?: string
  }
}

export async function listCustomerOrdersForChat(): Promise<Array<{
  id: string
  display_id: string | number
  created_at: string
  status: string
  total: string
  items_summary: string
}>> {
  try {
    const headers = await getAuthHeaders()
    const { orders } = await sdk.client.fetch<{ orders: RawStoreOrder[] }>("/store/orders", {
      method: "GET",
      query: {
        limit: 10,
        order: "-created_at",
        fields: "id,display_id,created_at,status,total,currency_code,*items",
      },
      headers,
      cache: "no-store",
    })

    return (orders || []).map((o) => {
      const itemsCount = (o.items || []).length
      const firstItem = o.items?.[0]?.title || "Item"
      const itemsSummary = itemsCount > 1 ? `${firstItem} + ${itemsCount - 1} more` : firstItem
      const formattedTotal = o.currency_code === "php" || !o.currency_code
        ? `₱${Number(o.total || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : `${(o.currency_code || "").toUpperCase()} ${o.total}`

      return {
        id: o.id,
        display_id: o.display_id ?? o.id.slice(-6),
        created_at: o.created_at,
        status: o.status || "completed",
        total: formattedTotal,
        items_summary: itemsSummary,
      }
    })
  } catch {
    return []
  }
}

export async function listStoreProductsForChat(): Promise<Array<{
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  variant_id: string
  price: string
}>> {
  try {
    const { products } = await sdk.client.fetch<{ products: RawStoreProduct[] }>("/store/products", {
      method: "GET",
      query: {
        limit: 30,
        fields: "id,title,handle,thumbnail,*variants,*variants.calculated_price",
      },
      cache: "no-store",
    })

    return (products || []).map((p) => {
      const firstVariant = p.variants?.[0]
      const calculatedAmount = firstVariant?.calculated_price?.calculated_amount
      const priceStr = calculatedAmount !== undefined && calculatedAmount !== null
        ? `₱${Number(calculatedAmount).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : "Inquire price"

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        thumbnail: p.thumbnail,
        variant_id: firstVariant?.id || p.id,
        price: priceStr,
      }
    })
  } catch {
    return []
  }
}

export async function listStoreProtocolsForChat(): Promise<Array<{
  handle: string
  title: string
  summary: string
  duration: string
}>> {
  try {
    const { protocols } = await sdk.client.fetch<{ protocols: RawStoreProtocol[] }>("/store/research-protocols", {
      method: "GET",
      cache: "no-store",
    })

    return (protocols || []).map((proto) => {
      const duration = proto.content?.duration_cycle || proto.content?.duration || "Standard Protocol Cycle"
      return {
        handle: proto.handle,
        title: proto.title,
        summary: proto.summary || "Verified research protocol guide",
        duration,
      }
    })
  } catch {
    return []
  }
}

