/**
 * @file    apps/storefront/src/lib/data/research-protocols.ts
 * @module  ResearchProtocolsData (Research Protocols Storefront)
 * @purpose Data access layer and server actions for research protocols and community discussions.
 * @contracts
 *   API: GET /store/research-protocols · GET /store/customers/me/research-protocol-community/:handle/threads
 */

"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { revalidatePath } from "next/cache"
import {
  PublicResearchProtocolContent,
  ResearchProtocolContent,
} from "@modules/research-protocols/types"

export type StoreResearchProtocol = {
  handle: string
  revision: number
  title: string
  summary: string | null
  published_at: string | null
  updated_at: string
  content: PublicResearchProtocolContent
  products: Array<{ id: string; title: string; handle: string; thumbnail?: string | null }>
  access: {
    full_protocol: "purchaser"
    community: "member" | "purchaser"
    community_count_visible?: boolean
  }
  search_indexable?: boolean
  recommendations_enabled?: boolean
}

export const listResearchProtocols = async (params?: { limit?: number; offset?: number }) => {
  const limit = params?.limit ?? 100
  const offset = params?.offset ?? 0
  return sdk.client.fetch<{ protocols: StoreResearchProtocol[]; count: number }>(
    `/store/research-protocols?limit=${limit}&offset=${offset}`,
    { method: "GET", cache: "no-store" }
  )
}

export const retrieveResearchProtocol = async (handle: string) => sdk.client.fetch<{ protocol: StoreResearchProtocol }>(`/store/research-protocols/${encodeURIComponent(handle)}`, { method: "GET", cache: "no-store" })

export type ResearchProtocolRecommendation = {
  id: string
  protocol_revision_id: string
  product_id: string
  product_variant_ids: string[]
  relationship_type: string
  placement: string
  heading: string | null
  reason: string
  quick_add_enabled: boolean
  hide_after_purchase: boolean
  priority: number
}

export const listResearchProtocolRecommendations = async ({
  handle,
  placement,
  excludeProductIds = [],
  limit = 6,
}: {
  handle: string
  placement: string
  excludeProductIds?: string[]
  limit?: number
}) =>
  sdk.client.fetch<{ recommendations: ResearchProtocolRecommendation[] }>(
    `/store/research-protocols/${encodeURIComponent(handle)}/recommendations`,
    {
      method: "GET",
      query: {
        placement,
        limit,
        exclude_product_ids: excludeProductIds.join(","),
      },
      cache: "no-store",
    }
  )

export const recordResearchProtocolRecommendationEvent = async ({
  handle,
  recommendation,
  eventType,
  productVariantId = null,
}: {
  handle: string
  recommendation: ResearchProtocolRecommendation
  eventType: "impression" | "click" | "add_to_cart" | "dismiss" | "purchase"
  productVariantId?: string | null
}) => {
  const headers = await getAuthHeaders()
  await sdk.client.fetch(
    `/store/research-protocols/${encodeURIComponent(handle)}/recommendations/events`,
    {
      method: "POST",
      headers,
      body: {
        merchandising_link_id: recommendation.id,
        event_type: eventType,
        placement: recommendation.placement,
        product_id: recommendation.product_id,
        product_variant_id: productVariantId,
        protocol_revision_id: recommendation.protocol_revision_id,
        context: null,
      },
      cache: "no-store",
    }
  )
}

export type OrderResearchProtocolAccess = { line_item_id: string; title: string; handle: string; revision: number; access_token: string }

export const listOrderResearchProtocols = async (orderId: string) => {
  const headers = await getAuthHeaders()

  return sdk.client.fetch<{ research_protocols: OrderResearchProtocolAccess[] }>(
    `/store/customers/me/orders/${orderId}/research-protocols`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  )
}

export type ResearchProtocolCommunityComment = {
  id: string
  author_name: string
  kind: "idea" | "recommendation" | "question" | "general"
  body: string
  submitted_at: string
}

export const listResearchProtocolComments = async (handle: string) =>
  sdk.client.fetch<{
    comments: ResearchProtocolCommunityComment[]
    count: number
  }>(`/store/research-protocols/${encodeURIComponent(handle)}/comments`, {
    method: "GET",
    cache: "no-store",
  })

export type SubmitProtocolCommentState =
  | { state: "success"; message: string }
  | { state: "error"; message: string }
  | null

export async function submitResearchProtocolComment(
  handle: string,
  _previousState: SubmitProtocolCommentState,
  formData: FormData,
): Promise<SubmitProtocolCommentState> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { state: "error", message: "Sign in to share an idea." }
  }

  try {
    await sdk.client.fetch("/store/customers/me/research-protocol-comments", {
      method: "POST",
      headers,
      body: {
        protocol_handle: handle,
        kind: String(formData.get("kind") || "idea"),
        body: String(formData.get("body") || ""),
      },
    })
    return {
      state: "success",
      message: "Thank you. Your comment is waiting for Admin review.",
    }
  } catch (error) {
    return {
      state: "error",
      message:
        error instanceof Error
          ? error.message
          : "Your comment could not be submitted.",
    }
  }
}

export type CustomerResearchProtocol = {
  handle: string
  title: string
  summary: string | null
  revision: number
  updated_at: string
  access_level: "member" | "purchaser"
  purchaser: boolean
  content: ResearchProtocolContent
  community: { read_scope: "member" | "purchaser"; post_scope: "member" | "purchaser" }
}

export type ResearchCommunityIdentity = {
  display_name: string
  show_verified_badge: boolean
  status: "active" | "suspended"
}

export type ResearchCommunityThread = {
  id: string
  title: string
  kind: "idea" | "recommendation" | "question" | "general"
  status: "pending" | "approved" | "rejected" | "hidden"
  is_pinned: boolean
  is_locked: boolean
  is_answered: boolean
  submitted_at: string
  last_activity_at: string
  reply_count: number
  followed: boolean
  owned_by_customer: boolean
  author: { alias: string; verified_customer: boolean }
  preview: null | { id: string; body: string; edited_at: string | null; removed: boolean }
}

export type ResearchCommunityComment = {
  id: string
  parent_comment_id: string | null
  kind: "idea" | "recommendation" | "question" | "general"
  body: string
  status: "pending" | "approved" | "rejected" | "hidden"
  submitted_at: string
  edited_at: string | null
  removed: boolean
  owned_by_customer: boolean
  author: { alias: string; verified_customer: boolean }
  reactions: { helpful: number; like: number }
  customer_reaction: "helpful" | "like" | null
}

export type ResearchCommunityThreadDetail = ResearchCommunityThread & {
  comments: ResearchCommunityComment[]
}

export type ResearchCommunityReport = {
  id: string
  reason: "spam" | "privacy" | "harassment" | "misleading" | "other"
  status: "open" | "resolved" | "dismissed"
  reported_at: string
  resolved_at: string | null
}

export const retrieveCustomerResearchProtocol = async (handle: string) => {
  const headers = await getAuthHeaders()
  return sdk.client.fetch<{ protocol: CustomerResearchProtocol }>(
    `/store/customers/me/research-protocols/${encodeURIComponent(handle)}`,
    { method: "GET", headers, cache: "no-store" },
  )
}

export const retrieveResearchCommunityIdentity = async () => {
  const headers = await getAuthHeaders()
  return sdk.client.fetch<{ identity: ResearchCommunityIdentity | null }>(
    "/store/customers/me/research-protocol-community/identity",
    { method: "GET", headers, cache: "no-store" },
  )
}

export const listResearchCommunityThreads = async (handle: string) => {
  const headers = await getAuthHeaders()
  return sdk.client.fetch<{ threads: ResearchCommunityThread[]; count: number }>(
    `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/threads`,
    { method: "GET", headers, cache: "no-store" },
  )
}

export const listResearchCommunityReports = async (handle: string) => {
  const headers = await getAuthHeaders()
  return sdk.client.fetch<{ reports: ResearchCommunityReport[] }>(
    `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/reports`,
    { method: "GET", headers, cache: "no-store" },
  )
}

export const retrieveResearchCommunityThread = async (handle: string, threadId: string) => {
  const headers = await getAuthHeaders()
  return sdk.client.fetch<{ thread: ResearchCommunityThreadDetail; notice: string }>(
    `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/threads/${encodeURIComponent(threadId)}`,
    { method: "GET", headers, cache: "no-store" },
  )
}

export type CommunityActionState = { success: boolean; error: string | null }
const communityState = (error?: unknown): CommunityActionState =>
  error
    ? { success: false, error: error instanceof Error ? error.message : "The community action could not be completed." }
    : { success: true, error: null }
const communityPath = (countryCode: string, handle?: string, threadId?: string) => {
  if (handle && threadId) {
    return `/${countryCode}/research-protocols/${encodeURIComponent(handle)}/community/${encodeURIComponent(threadId)}`
  }
  if (handle) {
    return `/${countryCode}/research-protocols/${encodeURIComponent(handle)}/community`
  }
  return `/${countryCode}/account/community`
}

export async function updateResearchCommunityIdentityAction(
  _state: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  try {
    await sdk.client.fetch("/store/customers/me/research-protocol-community/identity", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        display_name: String(formData.get("display_name") || ""),
        show_verified_badge: formData.get("show_verified_badge") === "on",
      },
    })
    const countryCode = String(formData.get("country_code") || "ph")
    revalidatePath(communityPath(countryCode), "layout")
    return communityState()
  } catch (error) {
    return communityState(error)
  }
}

export async function createResearchCommunityThreadAction(
  _state: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const handle = String(formData.get("protocol_handle") || "")
  const countryCode = String(formData.get("country_code") || "ph")
  try {
    await sdk.client.fetch(
      `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/threads`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: {
          protocol_handle: handle,
          kind: String(formData.get("kind") || "question"),
          title: String(formData.get("title") || ""),
          body: String(formData.get("body") || ""),
        },
      },
    )
    revalidatePath(communityPath(countryCode, handle), "page")
    revalidatePath(communityPath(countryCode), "page")
    return communityState()
  } catch (error) {
    return communityState(error)
  }
}

export async function createResearchCommunityReplyAction(
  _state: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const handle = String(formData.get("protocol_handle") || "")
  const threadId = String(formData.get("thread_id") || "")
  const countryCode = String(formData.get("country_code") || "ph")
  try {
    await sdk.client.fetch(
      `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/threads/${encodeURIComponent(threadId)}/replies`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: {
          body: String(formData.get("body") || ""),
          parent_comment_id: String(formData.get("parent_comment_id") || "") || null,
        },
      },
    )
    revalidatePath(communityPath(countryCode, handle, threadId), "page")
    revalidatePath(communityPath(countryCode, handle), "page")
    revalidatePath(communityPath(countryCode), "page")
    return communityState()
  } catch (error) {
    return communityState(error)
  }
}

export async function reactResearchCommunityCommentAction(formData: FormData) {
  const handle = String(formData.get("protocol_handle") || "")
  const threadId = String(formData.get("thread_id") || "")
  const commentId = String(formData.get("comment_id") || "")
  const active = formData.get("active") === "true"
  await sdk.client.fetch(
    `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/comments/${encodeURIComponent(commentId)}/reaction`,
    {
      method: active ? "DELETE" : "POST",
      headers: await getAuthHeaders(),
      ...(active ? {} : { body: { reaction: String(formData.get("reaction") || "helpful") } }),
    },
  )
  const countryCode = String(formData.get("country_code") || "ph")
  revalidatePath(communityPath(countryCode, handle, threadId), "page")
}

export async function followResearchCommunityThreadAction(formData: FormData) {
  const handle = String(formData.get("protocol_handle") || "")
  const threadId = String(formData.get("thread_id") || "")
  await sdk.client.fetch(
    `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/threads/${encodeURIComponent(threadId)}/subscription`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { subscribed: formData.get("subscribed") !== "true" },
    },
  )
  const countryCode = String(formData.get("country_code") || "ph")
  revalidatePath(communityPath(countryCode, handle, threadId), "page")
}

export async function reportResearchCommunityContentAction(
  _state: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const handle = String(formData.get("protocol_handle") || "")
  const threadId = String(formData.get("thread_id") || "")
  try {
    await sdk.client.fetch(
      `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/reports`,
      {
        method: "POST",
        headers: await getAuthHeaders(),
        body: {
          thread_id: threadId,
          comment_id: formData.get("comment_id") ? String(formData.get("comment_id")) : null,
          reason: String(formData.get("reason") || "other"),
          details: String(formData.get("details") || "") || null,
        },
      },
    )
    return communityState()
  } catch (error) {
    return communityState(error)
  }
}

export async function editResearchCommunityCommentAction(
  _state: CommunityActionState,
  formData: FormData,
): Promise<CommunityActionState> {
  const handle = String(formData.get("protocol_handle") || "")
  const threadId = String(formData.get("thread_id") || "")
  const commentId = String(formData.get("comment_id") || "")
  try {
    await sdk.client.fetch(
      `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/comments/${encodeURIComponent(commentId)}/edit`,
      { method: "POST", headers: await getAuthHeaders(), body: { body: String(formData.get("body") || "") } },
    )
    const countryCode = String(formData.get("country_code") || "ph")
    revalidatePath(communityPath(countryCode, handle, threadId), "page")
    return communityState()
  } catch (error) {
    return communityState(error)
  }
}

export async function removeResearchCommunityCommentAction(formData: FormData) {
  const handle = String(formData.get("protocol_handle") || "")
  const threadId = String(formData.get("thread_id") || "")
  const commentId = String(formData.get("comment_id") || "")
  await sdk.client.fetch(
    `/store/customers/me/research-protocol-community/${encodeURIComponent(handle)}/comments/${encodeURIComponent(commentId)}/remove`,
    { method: "POST", headers: await getAuthHeaders(), body: {} },
  )
  const countryCode = String(formData.get("country_code") || "ph")
  revalidatePath(communityPath(countryCode, handle, threadId), "page")
}
