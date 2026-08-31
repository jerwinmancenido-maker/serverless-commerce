"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { ResearchProtocolContent } from "@modules/research-protocols/types"

export type StoreResearchProtocol = {
  handle: string
  revision: number
  title: string
  summary: string | null
  published_at: string | null
  updated_at: string
  content: ResearchProtocolContent
  products: Array<{ id: string; title: string; handle: string; thumbnail?: string | null }>
}

export const listResearchProtocols = async () => sdk.client.fetch<{ protocols: StoreResearchProtocol[]; count: number }>("/store/research-protocols", { method: "GET", cache: "no-store" })

export const retrieveResearchProtocol = async (handle: string) => sdk.client.fetch<{ protocol: StoreResearchProtocol }>(`/store/research-protocols/${encodeURIComponent(handle)}`, { method: "GET", cache: "no-store" })

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
