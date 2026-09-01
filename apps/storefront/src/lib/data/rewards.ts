"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCartId } from "@lib/data/cookies"
import { revalidatePath } from "next/cache"

export type RewardsSummary = {
  program: null | {
    id: string
    name: string
    currency_code: string
    purchase_amount_per_point: number
    peso_value_per_point: number
    minimum_redemption_points: number
  }
  account: null | { id: string; lifetime_earned: number; status: string }
  balance: { available: number; pending: number; peso_value: number; lifetime_earned: number }
  rules: Array<{ id: string; name: string; event_type: string; point_value: number | null; lifetime_cap: number | null; show_as_badge: boolean; badge_name: string | null; badge_icon: string | null; streak_target: number | null; skip_policy: "ignore" | "break" }>
  entries: Array<{ id: string; entry_type: string; points: number; status: string; source_type: string; created_at: string }>
}

export type ReferralSummary = {
  enabled: boolean
  account: null | {
    id: string
    code: string
    status: string
    qualified_referrals: number
  }
  events: Array<{
    id: string
    role: "referrer" | "referred_customer"
    status: "pending" | "qualified" | "reversed" | "rejected"
    referrer_points: number
    referred_customer_points: number
    claimed_at: string
    qualified_at: string | null
    available_at: string | null
    reversed_at: string | null
  }>
  configuration: null | {
    minimum_order_amount: number
    waiting_period_days: number
    maximum_per_customer: number | null
  }
}

export async function retrieveRewardsSummary(): Promise<RewardsSummary> {
  return sdk.client.fetch("/store/customers/me/rewards", {
    method: "GET",
    headers: await getAuthHeaders(),
    cache: "no-store",
  })
}

export async function retrieveReferralSummary(): Promise<ReferralSummary> {
  return sdk.client.fetch("/store/customers/me/rewards/referrals", {
    method: "GET",
    headers: await getAuthHeaders(),
    cache: "no-store",
  })
}

export async function activateReferralAccountAction(
  _state: { success: boolean; error: string | null },
): Promise<{ success: boolean; error: string | null }> {
  try {
    await sdk.client.fetch("/store/customers/me/rewards/referrals/activate", {
      method: "POST",
      headers: await getAuthHeaders(),
    })
    revalidatePath("/account/rewards", "page")
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Referral code could not be created." }
  }
}

export async function claimReferralCodeAction(
  _state: { success: boolean; error: string | null },
  formData: FormData,
): Promise<{ success: boolean; error: string | null }> {
  try {
    await sdk.client.fetch("/store/customers/me/rewards/referrals/claim", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { code: String(formData.get("code") || "") },
    })
    revalidatePath("/account/rewards", "page")
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Referral code could not be applied." }
  }
}

export async function redeemRewardsAction(
  _state: { success: boolean; error: string | null } | null,
  formData: FormData,
) {
  const points = Number(formData.get("points"))
  const idempotencyKey = String(formData.get("idempotency_key") || "")
  const cartId = await getCartId()
  if (!cartId) {
    return {
      success: false,
      error: "Add an eligible product to your cart before redeeming points.",
    }
  }
  try {
    await sdk.client.fetch("/store/customers/me/rewards/redemptions", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        points,
        cart_id: cartId,
        idempotency_key: idempotencyKey,
      },
    })
    revalidatePath("/account/rewards", "page")
    revalidatePath("/cart", "page")
    return { success: true, error: null }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Points could not be applied to your cart.",
    }
  }
}
