"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { revalidatePath } from "next/cache"

export type SupportConversation = { id: string; subject: string; category: string; status: "new" | "open" | "waiting_for_customer" | "resolved" | "closed"; priority: string; order_id: string | null; protocol_series_id: string | null; opened_at: string; last_activity_at: string; unread_count?: number; latest_message_preview?: string }
export type SupportConversationDetail = SupportConversation & { messages: Array<{ id: string; sender: "You" | "Support" | "Automatic confirmation"; sender_type: "customer" | "staff" | "system"; body: string; sent_at: string; attachments: Array<{ id: string; file_name: string; mime_type: string; size_bytes: number }> }> }
export type SupportActionState = { success: boolean; error: string | null; conversation_id?: string; message_id?: string }
export type SupportConfiguration = { enabled: boolean; side_panel_enabled: boolean; display_name: string; response_time_message: string; timezone: string; offline_message: string; business_hours_enabled: boolean; business_hours: Array<{ day: number; open: boolean; opens_at: string | null; closes_at: string | null }>; attachment_uploads_enabled: boolean; maximum_attachment_size_bytes: number; allowed_mime_types: string[]; categories: Array<{ key: string; label: string; guidance: string | null }> }
export type SupportSummary = { unread_count: number; active_count: number; conversations: SupportConversation[] }
const state = (error?: unknown): SupportActionState => error ? { success: false, error: error instanceof Error ? error.message : "Support request could not be completed." } : { success: true, error: null }

export const retrieveSupportConfiguration = async () => sdk.client.fetch<{ configuration: SupportConfiguration }>("/store/support/config", { method: "GET", next: { revalidate: 60 } })

export const listSupportConversations = async () => sdk.client.fetch<{ conversations: SupportConversation[] }>("/store/customers/me/support", { method: "GET", headers: await getAuthHeaders(), cache: "no-store" })
export const retrieveSupportSummary = async () => sdk.client.fetch<SupportSummary>("/store/customers/me/support/summary", { method: "GET", headers: await getAuthHeaders(), cache: "no-store" })
export const retrieveSupportConversation = async (id: string) => sdk.client.fetch<{ conversation: SupportConversationDetail }>(`/store/customers/me/support/${encodeURIComponent(id)}`, { method: "GET", headers: await getAuthHeaders(), cache: "no-store" })

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
