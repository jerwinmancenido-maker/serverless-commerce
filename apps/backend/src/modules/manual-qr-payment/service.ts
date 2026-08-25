import { randomUUID } from "node:crypto"

import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CreateAccountHolderInput,
  CreateAccountHolderOutput,
  DeleteAccountHolderInput,
  DeleteAccountHolderOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrieveAccountHolderInput,
  RetrieveAccountHolderOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import {
  AbstractPaymentProvider,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"

export const MANUAL_QR_PAYMENT_IDENTIFIER = "manual-qr"
export const MANUAL_QR_PAYMENT_PROVIDER_ID = "pp_manual-qr_manual-qr"

export type ManualQrPaymentProviderOptions = {
  displayName?: string
  instructions?: string
  qrImageUrl?: string
  expiresInMinutes?: number
}

type ManualQrPaymentData = Record<string, unknown> & {
  manual_qr_reference?: string
  manual_qr_review_status?: "pending" | "approved" | "rejected" | "expired"
  session_id?: string
}

const DEFAULT_DISPLAY_NAME = "Manual QR payment"
const DEFAULT_EXPIRY_MINUTES = 24 * 60

function optionalTrimmed(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function paymentData(input: {
  data?: Record<string, unknown>
}): ManualQrPaymentData {
  return { ...(input.data ?? {}) } as ManualQrPaymentData
}

class ManualQrPaymentProviderService extends AbstractPaymentProvider<ManualQrPaymentProviderOptions> {
  static identifier = MANUAL_QR_PAYMENT_IDENTIFIER

  protected readonly options_: Required<
    Pick<ManualQrPaymentProviderOptions, "displayName" | "expiresInMinutes">
  > &
    Pick<ManualQrPaymentProviderOptions, "instructions" | "qrImageUrl">

  constructor(
    container: Record<string, unknown>,
    options: ManualQrPaymentProviderOptions = {},
  ) {
    super(container, options)
    this.options_ = {
      displayName: optionalTrimmed(options.displayName) ?? DEFAULT_DISPLAY_NAME,
      instructions: optionalTrimmed(options.instructions),
      qrImageUrl: optionalTrimmed(options.qrImageUrl),
      expiresInMinutes: options.expiresInMinutes ?? DEFAULT_EXPIRY_MINUTES,
    }
  }

  static validateOptions(options: Record<string, unknown>): void {
    const expiresInMinutes = options.expiresInMinutes

    if (
      expiresInMinutes !== undefined &&
      (!Number.isInteger(expiresInMinutes) || Number(expiresInMinutes) <= 0)
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Manual QR expiresInMinutes must be a positive integer",
      )
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentOutput> {
    const reference = randomUUID()
    const sessionId = optionalTrimmed(input.data?.session_id)

    return {
      id: reference,
      status: PaymentSessionStatus.PENDING,
      data: {
        manual_qr_reference: reference,
        manual_qr_review_status: "pending",
        session_id: sessionId,
        display_name: this.options_.displayName,
        instructions: this.options_.instructions,
        qr_image_url: this.options_.qrImageUrl,
        expires_in_minutes: this.options_.expiresInMinutes,
        currency_code: input.currency_code.toLowerCase(),
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput,
  ): Promise<AuthorizePaymentOutput> {
    const data = paymentData(input)

    return {
      data,
      status:
        data.manual_qr_review_status === "approved"
          ? PaymentSessionStatus.AUTHORIZED
          : PaymentSessionStatus.PENDING_AUTHORIZATION,
    }
  }

  async capturePayment(
    input: CapturePaymentInput,
  ): Promise<CapturePaymentOutput> {
    const data = paymentData(input)

    if (data.manual_qr_review_status !== "approved") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Manual QR payment cannot be captured before proof approval",
      )
    }

    return {
      data: {
        ...data,
        manual_qr_captured_at:
          data.manual_qr_captured_at ?? new Date().toISOString(),
      },
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const data = paymentData(input)

    return {
      data: {
        ...data,
        manual_qr_refunded_at:
          data.manual_qr_refunded_at ?? new Date().toISOString(),
      },
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const data = paymentData(input)

    return {
      data: {
        ...data,
        manual_qr_canceled_at:
          data.manual_qr_canceled_at ?? new Date().toISOString(),
      },
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: paymentData(input) }
  }

  async retrievePayment(
    input: RetrievePaymentInput,
  ): Promise<RetrievePaymentOutput> {
    return { data: paymentData(input) }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: paymentData(input) }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput,
  ): Promise<GetPaymentStatusOutput> {
    const data = paymentData(input)

    if (data.manual_qr_canceled_at) {
      return { data, status: PaymentSessionStatus.CANCELED }
    }

    if (data.manual_qr_captured_at) {
      return { data, status: PaymentSessionStatus.CAPTURED }
    }

    if (data.manual_qr_review_status === "approved") {
      return { data, status: PaymentSessionStatus.AUTHORIZED }
    }

    return { data, status: PaymentSessionStatus.PENDING_AUTHORIZATION }
  }

  async createAccountHolder(
    input: CreateAccountHolderInput,
  ): Promise<CreateAccountHolderOutput> {
    return { id: input.context.customer.id }
  }

  async retrieveAccountHolder(
    input: RetrieveAccountHolderInput,
  ): Promise<RetrieveAccountHolderOutput> {
    return { id: input.id }
  }

  async deleteAccountHolder(
    _input: DeleteAccountHolderInput,
  ): Promise<DeleteAccountHolderOutput> {
    return { data: {} }
  }

  async getWebhookActionAndData(
    _payload: ProviderWebhookPayload["payload"],
  ): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }
}

export default ManualQrPaymentProviderService
