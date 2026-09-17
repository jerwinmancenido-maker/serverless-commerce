/**
 * @file    apps/storefront/src/lib/data/onboarding.ts
 * @module  OnboardingData (Storefront Data Layer)
 * @purpose Resets merchant onboarding state cookie and redirects to Medusa 2.x admin order view.
 * @contracts
 *   Action: resetOnboardingState()
 */

"use server"
import { cookies as nextCookies } from "next/headers"
import { redirect } from "next/navigation"

export async function resetOnboardingState(orderId: string) {
  const cookies = await nextCookies()
  cookies.set("_medusa_onboarding", "false", { maxAge: -1 })
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  redirect(`${backendUrl}/app/orders/${orderId}`)
}
