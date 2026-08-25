import { MedusaError } from "@medusajs/framework/utils"

export const MANUAL_PAYMENT_SETTLEMENT_STATUSES = [
  "not_started",
  "authorizing",
  "authorized",
  "capturing",
  "captured",
  "failed",
] as const

export const MANUAL_PAYMENT_SETTLEMENT_EVENT_TYPES = [
  "settlement_requested",
  "authorization_confirmed",
  "capture_confirmed",
  "settlement_failed",
  "proof_approved_after_capture",
] as const

export const MANUAL_PAYMENT_SETTLEMENT_ERROR_CATEGORIES = [
  "validation_failed",
  "authorization_failed",
  "capture_failed",
  "reconciliation_failed",
  "internal_error",
] as const

export type ManualPaymentSettlementStatus =
  (typeof MANUAL_PAYMENT_SETTLEMENT_STATUSES)[number]
export type ManualPaymentSettlementEventType =
  (typeof MANUAL_PAYMENT_SETTLEMENT_EVENT_TYPES)[number]
export type ManualPaymentSettlementErrorCategory =
  (typeof MANUAL_PAYMENT_SETTLEMENT_ERROR_CATEGORIES)[number]

export type ManualPaymentSettlementAttemptInput = {
  attemptId: string
  proofId: string
  proofRevision: number
  paymentSessionId: string
  orderId: string
  actorId: string
}

export type ManualPaymentSettlementEventInput =
  ManualPaymentSettlementAttemptInput & {
    eventType: ManualPaymentSettlementEventType
    status: ManualPaymentSettlementStatus
    paymentId?: string | null
    captureId?: string | null
    errorCategory?: ManualPaymentSettlementErrorCategory | null
  }

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function requiredIdentifier(value: string, field: string): string {
  const normalized = value.trim()

  if (!normalized) {
    invalid(`${field} is required`)
  }

  if (normalized.length > 255) {
    invalid(`${field} must not exceed 255 characters`)
  }

  return normalized
}

export function normalizeManualPaymentSettlementAttempt(
  input: ManualPaymentSettlementAttemptInput,
): ManualPaymentSettlementAttemptInput {
  if (!Number.isInteger(input.proofRevision) || input.proofRevision < 1) {
    invalid("proofRevision must be a positive integer")
  }

  return {
    attemptId: requiredIdentifier(input.attemptId, "attemptId"),
    proofId: requiredIdentifier(input.proofId, "proofId"),
    proofRevision: input.proofRevision,
    paymentSessionId: requiredIdentifier(
      input.paymentSessionId,
      "paymentSessionId",
    ),
    orderId: requiredIdentifier(input.orderId, "orderId"),
    actorId: requiredIdentifier(input.actorId, "actorId"),
  }
}

export function normalizeManualPaymentSettlementEvent(
  input: ManualPaymentSettlementEventInput,
): ManualPaymentSettlementEventInput {
  const attempt = normalizeManualPaymentSettlementAttempt(input)
  const paymentId = input.paymentId?.trim() || null
  const captureId = input.captureId?.trim() || null
  const errorCategory = input.errorCategory ?? null

  if (
    input.eventType === "settlement_requested" &&
    input.status !== "authorizing" &&
    input.status !== "capturing"
  ) {
    invalid("settlement_requested must be authorizing or capturing")
  }

  if (
    input.eventType === "authorization_confirmed" &&
    (input.status !== "authorized" || !paymentId)
  ) {
    invalid("authorization_confirmed requires an authorized payment")
  }

  if (
    (input.eventType === "capture_confirmed" ||
      input.eventType === "proof_approved_after_capture") &&
    (input.status !== "captured" || !paymentId || !captureId)
  ) {
    invalid(`${input.eventType} requires a captured payment and capture`)
  }

  if (
    input.eventType === "settlement_failed" &&
    (input.status !== "failed" || !errorCategory)
  ) {
    invalid("settlement_failed requires a sanitized error category")
  }

  if (input.eventType !== "settlement_failed" && errorCategory) {
    invalid("only settlement_failed can include an error category")
  }

  return {
    ...attempt,
    eventType: input.eventType,
    status: input.status,
    paymentId,
    captureId,
    errorCategory,
  }
}
