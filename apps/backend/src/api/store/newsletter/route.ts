/**
 * @file apps/backend/src/api/store/newsletter/route.ts
 * @module StorefrontAPI · Newsletter
 * @purpose Public storefront endpoint for researcher newsletter subscription with instant discount voucher.
 * @contracts POST /store/newsletter -> { success: boolean, discountCode: string, message: string }
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "node:fs/promises"
import path from "node:path"

type SubscriberEntry = {
  email: string
  source?: string
  subscribedAt: string
  discountCode: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SUBSCRIBERS_FILE = path.join(
  process.cwd(),
  "data",
  "newsletter-subscribers.json"
)

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { email, source } = (req.body as { email?: string; source?: string }) || {}

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid laboratory or organizational email address.",
    })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const discountCode = "RESEARCH10"

  try {
    let subscribers: SubscriberEntry[] = []

    try {
      const fileContent = await fs.readFile(SUBSCRIBERS_FILE, "utf8")
      subscribers = JSON.parse(fileContent)
    } catch {
      // File does not exist yet or empty; start fresh
      subscribers = []
    }

    const existing = subscribers.find((s) => s.email === normalizedEmail)

    if (!existing) {
      subscribers.push({
        email: normalizedEmail,
        source: source || "footer_lead_widget",
        subscribedAt: new Date().toISOString(),
        discountCode,
      })

      await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf8")
    }

    return res.status(200).json({
      success: true,
      discountCode,
      message: "Subscription confirmed. Use voucher code RESEARCH10 for 10% off your research kit order.",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while saving your subscription. Please try again.",
    })
  }
}
