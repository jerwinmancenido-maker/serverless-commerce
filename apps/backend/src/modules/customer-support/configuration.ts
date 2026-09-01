import { CUSTOMER_SUPPORT_MODULE } from "."
import { SUPPORT_CATEGORIES, SUPPORT_PRIORITIES } from "./contracts"
import type CustomerSupportModuleService from "./service"

export const DEFAULT_SUPPORT_SETTINGS = {
  support_enabled: true,
  side_panel_enabled: true,
  display_name: "Customer support",
  response_time_message: "We usually reply within one business day.",
  timezone: "Asia/Manila",
  offline_message: "Send us a message and our support team will follow up.",
  business_hours_enabled: false,
  business_hours: [
    { day: 0, open: false, opens_at: null, closes_at: null },
    { day: 1, open: true, opens_at: "09:00", closes_at: "17:00" },
    { day: 2, open: true, opens_at: "09:00", closes_at: "17:00" },
    { day: 3, open: true, opens_at: "09:00", closes_at: "17:00" },
    { day: 4, open: true, opens_at: "09:00", closes_at: "17:00" },
    { day: 5, open: true, opens_at: "09:00", closes_at: "17:00" },
    { day: 6, open: false, opens_at: null, closes_at: null },
  ],
  attachment_uploads_enabled: true,
  maximum_attachment_size_bytes: 10 * 1024 * 1024,
  allowed_mime_types: ["image/jpeg", "image/png", "application/pdf"],
  customer_message_limit_per_hour: 12,
  email_notifications_enabled: false,
  auto_acknowledgement_enabled: false,
  auto_acknowledgement_text:
    "Thanks for contacting us. We received your message and usually reply within one business day.",
  retention_days: null,
} as const

const labels: Record<(typeof SUPPORT_CATEGORIES)[number], string> = {
  order: "Order",
  payment: "Payment",
  shipping: "Shipping",
  product: "Product",
  protocol_access: "Protocol access",
  account: "Account",
  rewards: "Rewards",
  technical: "Technical issue",
  other: "Other",
}

export const DEFAULT_SUPPORT_CATEGORIES = SUPPORT_CATEGORIES.map((key, index) => ({
  key,
  label: labels[key],
  guidance: null,
  enabled: true,
  sort_order: index,
  default_priority: SUPPORT_PRIORITIES[1],
}))

export async function resolveSupportConfiguration(container: any) {
  const service = container.resolve(CUSTOMER_SUPPORT_MODULE) as CustomerSupportModuleService
  const [stored] = await service.listSupportSettings({ singleton_key: "default" }, { take: 1 })
  const categories = await service.listSupportCategories({}, { order: { sort_order: "ASC" } })

  return {
    settings: stored
      ? {
          ...DEFAULT_SUPPORT_SETTINGS,
          ...stored,
          business_hours: (stored.business_hours as any)?.days || DEFAULT_SUPPORT_SETTINGS.business_hours,
          allowed_mime_types: (stored.allowed_mime_types as any)?.values || DEFAULT_SUPPORT_SETTINGS.allowed_mime_types,
        }
      : DEFAULT_SUPPORT_SETTINGS,
    categories: categories.length ? categories : DEFAULT_SUPPORT_CATEGORIES,
  }
}

export async function resolvePublicSupportConfiguration(container: any) {
  const { settings, categories } = await resolveSupportConfiguration(container)

  return {
    enabled: settings.support_enabled,
    side_panel_enabled: settings.side_panel_enabled,
    display_name: settings.display_name,
    response_time_message: settings.response_time_message,
    timezone: settings.timezone,
    offline_message: settings.offline_message,
    business_hours_enabled: settings.business_hours_enabled,
    business_hours: settings.business_hours,
    attachment_uploads_enabled: settings.attachment_uploads_enabled,
    maximum_attachment_size_bytes: settings.maximum_attachment_size_bytes,
    allowed_mime_types: settings.allowed_mime_types,
    categories: categories
      .filter((category: any) => category.enabled)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((category: any) => ({
        key: category.key,
        label: category.label,
        guidance: category.guidance,
      })),
  }
}
