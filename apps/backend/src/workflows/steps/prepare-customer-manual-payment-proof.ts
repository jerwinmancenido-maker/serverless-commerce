import { createHash } from "node:crypto"

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import {
  decideManualPaymentProofSubmission,
  MANUAL_PAYMENT_PROOF_MAX_BYTES,
  MANUAL_PAYMENT_PROOF_MIME_TYPES,
  type ManualPaymentProofMimeType,
  type SubmitManualPaymentProofInput,
} from "../../modules/manual-payment/contracts/payment-proof"
import { MANUAL_PAYMENT_MODULE } from "../../modules/manual-payment"
import type ManualPaymentModuleService from "../../modules/manual-payment/service"
import { MANUAL_QR_PAYMENT_PROVIDER_ID } from "../../modules/manual-qr-payment/service"

export type CustomerManualPaymentProofInput = {
  orderId: string
  customerId: string
  actorId: string
  file: {
    fileName: string
    mimeType: string
    contentBase64: string
  }
}

type OrderWithPaymentSessions = {
  id: string
  customer_id: string | null
  payment_collections?: Array<{
    payment_sessions?: Array<{
      id: string
      provider_id: string
    }>
  }>
}

export type PreparedCustomerManualPaymentProof = {
  shouldUpload: boolean
  existingProof: {
    id: string
    payment_session_id: string
    order_id: string
    customer_id: string
    provider_id: string
    file_id: string
    file_name: string
    mime_type: string
    size_bytes: number
    checksum_sha256: string
    status: "pending" | "approved" | "rejected" | "expired"
    revision: number
  } | null
  submission: Omit<SubmitManualPaymentProofInput, "fileId">
  upload: {
    filename: string
    mimeType: ManualPaymentProofMimeType
    content: string
    access: "private"
  }
}

function invalid(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function decodeBase64(content: string): Buffer {
  const normalized = content.trim()
  const decoded = Buffer.from(normalized, "base64")

  if (!normalized || decoded.toString("base64") !== normalized) {
    invalid("proof content must be valid base64")
  }

  return decoded
}

export const prepareCustomerManualPaymentProofStep = createStep(
  "prepare-customer-manual-payment-proof",
  async (
    input: CustomerManualPaymentProofInput,
    { container },
  ): Promise<StepResponse<PreparedCustomerManualPaymentProof>> => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const service = container.resolve<ManualPaymentModuleService>(
      MANUAL_PAYMENT_MODULE,
    )
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "customer_id",
        "payment_collections.payment_sessions.id",
        "payment_collections.payment_sessions.provider_id",
      ],
      filters: { id: input.orderId },
      pagination: { take: 1 },
    })
    const order = data[0] as OrderWithPaymentSessions | undefined

    if (!order || order.customer_id !== input.customerId) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "order was not found")
    }

    const paymentSession = order.payment_collections
      ?.flatMap((collection) => collection.payment_sessions ?? [])
      .find((session) => session.provider_id === MANUAL_QR_PAYMENT_PROVIDER_ID)

    if (!paymentSession) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "order does not use the Manual QR payment provider",
      )
    }

    const fileName = input.file.fileName.trim()
    const mimeType = input.file.mimeType.trim().toLowerCase()
    const content = input.file.contentBase64.trim()
    const bytes = decodeBase64(content)

    if (!fileName || fileName.length > 255) {
      invalid("proof file name must be between 1 and 255 characters")
    }

    if (
      !MANUAL_PAYMENT_PROOF_MIME_TYPES.includes(
        mimeType as ManualPaymentProofMimeType,
      )
    ) {
      invalid("proof must be a PNG, JPEG, or PDF file")
    }

    if (bytes.length <= 0 || bytes.length > MANUAL_PAYMENT_PROOF_MAX_BYTES) {
      invalid("proof size must be between 1 byte and 10 MiB")
    }

    const checksumSha256 = createHash("sha256").update(bytes).digest("hex")
    const [existing] = await service.listManualPaymentProofs(
      { payment_session_id: paymentSession.id },
      { take: 1 },
    )
    let shouldUpload = true

    if (existing) {
      const transition = decideManualPaymentProofSubmission(
        {
          status: existing.status,
          fileId: existing.file_id,
          checksumSha256: existing.checksum_sha256,
        },
        {
          fileId:
            existing.checksum_sha256 === checksumSha256
              ? existing.file_id
              : "new-file",
          checksumSha256,
        },
      )
      shouldUpload = transition !== "idempotent"
    }

    return new StepResponse({
      shouldUpload,
      existingProof: existing ?? null,
      submission: {
        paymentSessionId: paymentSession.id,
        orderId: order.id,
        customerId: input.customerId,
        providerId: MANUAL_QR_PAYMENT_PROVIDER_ID,
        fileName,
        mimeType,
        sizeBytes: bytes.length,
        checksumSha256,
        actorId: input.actorId,
      },
      upload: {
        filename: fileName,
        mimeType: mimeType as ManualPaymentProofMimeType,
        content,
        access: "private",
      },
    })
  },
)
