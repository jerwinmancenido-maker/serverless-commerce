import { MedusaError } from "@medusajs/framework/utils"

import { MANUAL_QR_PAYMENT_PROVIDER_ID } from "../../manual-qr-payment/service"

export const MANUAL_PAYMENT_PROOF_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "expired",
] as const

export const MANUAL_PAYMENT_PROOF_EVENT_TYPES = [
  "submitted",
  "resubmitted",
  "approved",
  "rejected",
  "expired",
] as const

export const MANUAL_PAYMENT_PROOF_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const

export const MANUAL_PAYMENT_PROOF_MAX_BYTES = 10 * 1024 * 1024

export type ManualPaymentProofStatus =
  (typeof MANUAL_PAYMENT_PROOF_STATUSES)[number]
export type ManualPaymentProofEventType =
  (typeof MANUAL_PAYMENT_PROOF_EVENT_TYPES)[number]
export type ManualPaymentProofMimeType =
  (typeof MANUAL_PAYMENT_PROOF_MIME_TYPES)[number]

export type SubmitManualPaymentProofInput = {
  paymentSessionId: string
  orderId: string
  customerId: string
  providerId: string
  fileId: string
  fileName: string
  mimeType: string
  sizeBytes: number
  checksumSha256: string
  actorId: string
}

export type ReviewManualPaymentProofInput = {
  proofId: string
  decision: "approved" | "rejected"
  reason?: string | null
  actorId: string
}

export type ManualPaymentProofSubmissionState = {
  status: ManualPaymentProofStatus
  fileId: string
  checksumSha256: string
}

export type ManualPaymentProofReviewState = {
  status: ManualPaymentProofStatus
  rejectionReason?: string | null
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function requiredText(value: string, field: string): string {
  const normalized = value.trim()

  if (!normalized) {
    invalid(`${field} is required`)
  }

  return normalized
}

export function normalizeManualPaymentProofSubmission(
  input: SubmitManualPaymentProofInput,
): SubmitManualPaymentProofInput & { mimeType: ManualPaymentProofMimeType } {
  const mimeType = input.mimeType.trim().toLowerCase()
  const checksumSha256 = input.checksumSha256.trim().toLowerCase()

  if (input.providerId !== MANUAL_QR_PAYMENT_PROVIDER_ID) {
    invalid("payment session does not use the Manual QR provider")
  }

  if (
    !MANUAL_PAYMENT_PROOF_MIME_TYPES.includes(
      mimeType as ManualPaymentProofMimeType,
    )
  ) {
    invalid("proof must be a PNG, JPEG, or PDF file")
  }

  if (
    !Number.isInteger(input.sizeBytes) ||
    input.sizeBytes <= 0 ||
    input.sizeBytes > MANUAL_PAYMENT_PROOF_MAX_BYTES
  ) {
    invalid("proof size must be between 1 byte and 10 MiB")
  }

  if (!/^[a-f0-9]{64}$/.test(checksumSha256)) {
    invalid("checksumSha256 must be a lowercase SHA-256 digest")
  }

  const fileName = requiredText(input.fileName, "fileName")

  if (fileName.length > 255) {
    invalid("fileName must not exceed 255 characters")
  }

  return {
    paymentSessionId: requiredText(input.paymentSessionId, "paymentSessionId"),
    orderId: requiredText(input.orderId, "orderId"),
    customerId: requiredText(input.customerId, "customerId"),
    providerId: input.providerId,
    fileId: requiredText(input.fileId, "fileId"),
    fileName,
    mimeType: mimeType as ManualPaymentProofMimeType,
    sizeBytes: input.sizeBytes,
    checksumSha256,
    actorId: requiredText(input.actorId, "actorId"),
  }
}

export function normalizeManualPaymentProofReview(
  input: ReviewManualPaymentProofInput,
): ReviewManualPaymentProofInput {
  const reason = input.reason?.trim() || null

  if (input.decision === "rejected" && !reason) {
    invalid("a rejection reason is required")
  }

  if (input.decision === "approved" && reason) {
    invalid("an approval cannot include a rejection reason")
  }

  return {
    proofId: requiredText(input.proofId, "proofId"),
    decision: input.decision,
    reason,
    actorId: requiredText(input.actorId, "actorId"),
  }
}

export function decideManualPaymentProofSubmission(
  existing: ManualPaymentProofSubmissionState,
  input: Pick<SubmitManualPaymentProofInput, "fileId" | "checksumSha256">,
): "idempotent" | "resubmit" {
  if (existing.status === "pending") {
    if (
      existing.fileId === input.fileId &&
      existing.checksumSha256 === input.checksumSha256
    ) {
      return "idempotent"
    }

    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "a different proof cannot replace a pending submission",
    )
  }

  if (existing.status === "rejected") {
    return "resubmit"
  }

  throw new MedusaError(
    MedusaError.Types.NOT_ALLOWED,
    `${existing.status} proof cannot be replaced`,
  )
}

export function decideManualPaymentProofReview(
  existing: ManualPaymentProofReviewState,
  input: Pick<ReviewManualPaymentProofInput, "decision" | "reason">,
): "idempotent" | "apply" {
  if (existing.status === "pending") {
    return "apply"
  }

  const reason = input.reason ?? null

  if (
    existing.status === input.decision &&
    (existing.rejectionReason ?? null) === reason
  ) {
    return "idempotent"
  }

  throw new MedusaError(
    MedusaError.Types.NOT_ALLOWED,
    `${existing.status} proof cannot transition to ${input.decision}`,
  )
}
