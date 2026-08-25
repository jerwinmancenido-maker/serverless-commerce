"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { revalidatePath } from "next/cache"

export type StoreManualPaymentProof = {
  id: string
  order_id: string
  file_name: string
  mime_type: string
  size_bytes: number
  status: "pending" | "approved" | "rejected" | "expired"
  revision: number
  submitted_at: string
  reviewed_at: string | null
  rejection_reason: string | null
}

export type ManualQrPaymentContext = {
  eligible: boolean
  display_name?: string
  instructions?: string
  qr_image_url?: string
  expires_in_minutes?: number
}

export type ManualPaymentProofResponse = {
  manual_payment_proof: StoreManualPaymentProof | null
  manual_qr_payment: ManualQrPaymentContext
}

export type ManualPaymentProofActionState = {
  success: boolean
  error: string | null
  proof: StoreManualPaymentProof | null
}

export async function retrieveManualPaymentProof(
  orderId: string,
): Promise<ManualPaymentProofResponse | null> {
  const headers = await getAuthHeaders()

  return sdk.client
    .fetch<ManualPaymentProofResponse>(
      `/store/customers/me/orders/${orderId}/manual-payment-proof`,
      {
        headers,
        cache: "no-store",
      },
    )
    .catch(() => null)
}

export async function submitManualPaymentProof(
  _currentState: ManualPaymentProofActionState,
  formData: FormData,
): Promise<ManualPaymentProofActionState> {
  const orderId = String(formData.get("order_id") ?? "").trim()
  const proof = formData.get("proof")

  if (!orderId) {
    return { success: false, error: "Order ID is required", proof: null }
  }

  if (!(proof instanceof File) || proof.size === 0) {
    return {
      success: false,
      error: "Choose a PNG, JPEG, or PDF payment proof",
      proof: null,
    }
  }

  if (proof.size > 10 * 1024 * 1024) {
    return {
      success: false,
      error: "Payment proof must not exceed 10 MiB",
      proof: null,
    }
  }

  const body = new FormData()
  body.set("proof", proof, proof.name)

  try {
    const headers = await getAuthHeaders()
    const response = await sdk.client.fetch<{
      manual_payment_proof: StoreManualPaymentProof
    }>(`/store/customers/me/orders/${orderId}/manual-payment-proof`, {
      method: "POST",
      headers,
      body,
    })

    revalidatePath("/account/orders", "layout")

    return {
      success: true,
      error: null,
      proof: response.manual_payment_proof,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Payment proof could not be submitted",
      proof: null,
    }
  }
}
