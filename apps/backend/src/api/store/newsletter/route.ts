/**
 * @file    apps/backend/src/api/store/newsletter/route.ts
 * @module  StoreNewsletterRoute (Storefront API)
 * @purpose Public storefront endpoint for researcher newsletter subscription backed by Medusa Customer Module and PostgreSQL.
 * @contracts
 *   API:      POST /store/newsletter
 *   Workflow: subscribeNewsletterWorkflow
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { subscribeNewsletterWorkflow } from "../../../workflows/subscribe-newsletter"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DISCOUNT_CODE = "RESEARCH10"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email, source } = (req.body as { email?: string; source?: string }) || {}

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid laboratory or organizational email address.",
    })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const leadSource = typeof source === "string" && source.trim() ? source.trim() : "footer_lead_widget"

  try {
    await subscribeNewsletterWorkflow(req.scope).run({
      input: {
        email: normalizedEmail,
        source: leadSource,
        discountCode: DISCOUNT_CODE,
      },
    })

    return res.status(200).json({
      success: true,
      discountCode: DISCOUNT_CODE,
      message: "Subscription confirmed. Use voucher code RESEARCH10 for 10% off your research kit order.",
    })
  } catch {
    return res.status(500).json({
      success: false,
      message: "An error occurred while saving your subscription. Please try again.",
    })
  }
}
