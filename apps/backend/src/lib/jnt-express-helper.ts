/**
 * @file    apps/backend/src/lib/jnt-express-helper.ts
 * @module  JntExpressHelper (Logistics Utility)
 * @purpose Pure helpers for Philippine J&T Express VIP QuickOrder formatting, 12-digit waybill validation, and batch CSV export.
 * @contracts
 *   Service: OrderFulfillmentDispatchWidget · J&T Express Philippines VIP Integration
 */

import type { HttpTypes } from "@medusajs/framework/types"

/**
 * Sanitizes a waybill string by removing extraneous whitespace, hyphens, and dashes.
 */
export function cleanJntWaybill(waybill: string | null | undefined): string {
  if (!waybill) return ""
  return waybill.replace(/[\s\-_]/g, "").trim()
}

/**
 * Validates whether a given string is a valid Philippine J&T Express waybill number.
 * Standard domestic Philippine J&T waybills are 12 digits numeric (e.g. 781234567890 or 981234567890).
 */
export function isValidJntWaybill(waybill: string | null | undefined): boolean {
  const cleaned = cleanJntWaybill(waybill)
  return /^\d{12}$/.test(cleaned)
}

/**
 * Helper to identify or extract Barangay information from Philippine shipping addresses.
 */
export function extractBarangay(
  address1?: string | null,
  address2?: string | null
): string {
  if (address2 && address2.trim()) {
    return address2.trim()
  }
  if (address1) {
    const match = address1.match(
      /(?:b(?:aran)?g(?:a)?y\.?|brgy\.?)\s+([^,]+)/i
    )
    if (match?.[1]) {
      return match[1].trim()
    }
  }
  return ""
}

/**
 * Sanitizes address and consignee strings by stripping emojis and illegal control characters
 * that cause the J&T Express VIP QuickOrder parser to fail.
 */
export function sanitizeJntText(text?: string | null): string {
  if (!text) return ""
  return text
    .replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Cleans and formats Philippine phone numbers to 11-digit domestic (09XXXXXXXXX) format if possible.
 */
export function formatPhilippinePhone(phone?: string | null): string {
  if (!phone) return ""
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("630") && digits.length === 13) {
    return digits.slice(2)
  }
  if (digits.startsWith("63") && digits.length === 12) {
    return `0${digits.slice(2)}`
  }
  if (digits.startsWith("9") && digits.length === 10) {
    return `0${digits}`
  }
  return digits
}

export interface JntQuickOrderFields {
  recipientName: string
  recipientPhone: string
  province: string
  city: string
  barangay: string
  streetAddress: string
  postalCode: string
  goodsDescription: string
  weightKg: number
  totalQuantity: number
  declaredValue: number
  codAmount: number
  remarks: string
  smartRecognitionString: string
}

/**
 * Extracts and normalizes customer consignee fields for J&T Express VIP QuickOrder.
 */
export function buildJntQuickOrderFields(
  order: HttpTypes.AdminOrder
): JntQuickOrderFields {
  const addr = order.shipping_address
  const firstName = sanitizeJntText(addr?.first_name)
  const lastName = sanitizeJntText(addr?.last_name)
  const recipientName = `${firstName} ${lastName}`.trim() || "Valued Researcher"
  const recipientPhone = formatPhilippinePhone(addr?.phone)

  const province = sanitizeJntText(addr?.province) || "Metro Manila"
  const city = sanitizeJntText(addr?.city) || ""
  const barangay = sanitizeJntText(extractBarangay(addr?.address_1, addr?.address_2))
  const streetAddress = sanitizeJntText(addr?.address_1) || ""
  const postalCode = addr?.postal_code?.trim() || ""

  const totalQuantity =
    order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1
  const declaredValue = Math.round(Number(order.total || 0))
  const isPaid = order.payment_status === "captured"

  // Safe COD resolution: Cash on delivery is only charged if explicitly configured as COD.
  // Digital orders (Manual QR / GCash / Maya / Card) must NEVER incur courier COD double-charge.
  const isExplicitCod =
    Boolean(order.metadata?.is_cod) ||
    order.metadata?.payment_method === "cod" ||
    (order as any).payment_collections?.some((pc: any) =>
      pc.payments?.some((p: any) => p.provider_id?.toLowerCase().includes("cod")) ||
      pc.payment_sessions?.some((ps: any) => ps.provider_id?.toLowerCase().includes("cod"))
    ) === true
  const codAmount = !isPaid && isExplicitCod ? declaredValue : 0

  const displayId = order.display_id || order.id.slice(-8)
  const remarks = `Order #${displayId} · Fragile Glass Vials / Research Supplies`
  const goodsDescription = "Laboratory Research Supplies - Lyophilized Vials"
  const weightKg = 0.5

  // Construct Smart Recognition text for J&T VIP QuickOrder AI parser:
  // Format: "Name, Phone, Province, City, Barangay, Street Address"
  const addressParts = [
    recipientName,
    recipientPhone,
    province,
    city,
    barangay ? `Brgy. ${barangay}` : null,
    streetAddress,
  ].filter(Boolean)

  const smartRecognitionString = addressParts.join(", ")

  return {
    recipientName,
    recipientPhone,
    province,
    city,
    barangay,
    streetAddress,
    postalCode,
    goodsDescription,
    weightKg,
    totalQuantity,
    declaredValue,
    codAmount,
    remarks,
    smartRecognitionString,
  }
}

/**
 * Escapes a cell value for safe RFC 4180 CSV generation.
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, "\"\"")}"`
  }
  return str
}

/**
 * Generates an RFC 4180 compliant CSV strictly matching the official J&T Express Philippines VIP Batch Order Template.
 */
export function generateJntBatchCsv(
  orders: HttpTypes.AdminOrder | HttpTypes.AdminOrder[]
): string {
  const orderList = Array.isArray(orders) ? orders : [orders]

  const headers = [
    "Receiver Name",
    "Receiver Phone",
    "Receiver Province",
    "Receiver City",
    "Receiver District/Barangay",
    "Detailed Address",
    "Postal Code",
    "Item Name",
    "Weight(kg)",
    "Total Quantity",
    "Declared Value",
    "COD Amount",
    "Remarks",
  ]

  const rows = orderList.map((order) => {
    const fields = buildJntQuickOrderFields(order)
    return [
      escapeCsvCell(fields.recipientName),
      escapeCsvCell(fields.recipientPhone),
      escapeCsvCell(fields.province),
      escapeCsvCell(fields.city),
      escapeCsvCell(fields.barangay),
      escapeCsvCell(fields.streetAddress),
      escapeCsvCell(fields.postalCode),
      escapeCsvCell(fields.goodsDescription),
      escapeCsvCell(fields.weightKg),
      escapeCsvCell(fields.totalQuantity),
      escapeCsvCell(fields.declaredValue),
      escapeCsvCell(fields.codAmount),
      escapeCsvCell(fields.remarks),
    ].join(",")
  })

  return [headers.join(","), ...rows].join("\r\n")
}

/**
 * Generates a valid domestic Philippine J&T Express 12-digit tracking waybill number.
 * Formatted with standard prefix 78 or 98.
 */
export function generateJntTrackingNumber(): string {
  const prefix = Math.random() > 0.5 ? "78" : "98"
  const suffix = Math.floor(1000000000 + Math.random() * 9000000000).toString()
  return `${prefix}${suffix}`.slice(0, 12)
}

