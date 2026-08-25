import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { MANUAL_PAYMENT_MODULE } from "../../../../../../../modules/manual-payment"
import type ManualPaymentModuleService from "../../../../../../../modules/manual-payment/service"
import { MANUAL_QR_PAYMENT_PROVIDER_ID } from "../../../../../../../modules/manual-qr-payment/service"
import uploadCustomerManualPaymentProofWorkflow from "../../../../../../../workflows/upload-customer-manual-payment-proof"

type ManualQrSession = {
  id: string
  provider_id: string
  data?: Record<string, unknown> | null
}

type StoreOrderPaymentContext = {
  id: string
  payment_collections?: Array<{
    payment_sessions?: ManualQrSession[]
  }>
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const customerId = req.auth_context.actor_id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const service = req.scope.resolve<ManualPaymentModuleService>(
    MANUAL_PAYMENT_MODULE,
  )
  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "payment_collections.payment_sessions.id",
      "payment_collections.payment_sessions.provider_id",
      "payment_collections.payment_sessions.data",
    ],
    filters: { id: req.params.id, customer_id: customerId },
    pagination: { take: 1 },
  })
  const order = data[0] as StoreOrderPaymentContext | undefined

  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "order was not found")
  }

  const paymentSession = order.payment_collections
    ?.flatMap((collection) => collection.payment_sessions ?? [])
    .find((session) => session.provider_id === MANUAL_QR_PAYMENT_PROVIDER_ID)
  const [proof] = await service.listManualPaymentProofs(
    { order_id: req.params.id, customer_id: customerId },
    { take: 1 },
  )
  const paymentData = paymentSession?.data ?? {}

  res.json({
    manual_payment_proof: proof ?? null,
    manual_qr_payment: paymentSession
      ? {
          eligible: true,
          display_name: paymentData.display_name,
          instructions: paymentData.instructions,
          qr_image_url: paymentData.qr_image_url,
          expires_in_minutes: paymentData.expires_in_minutes,
        }
      : { eligible: false },
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const file = req.file

  if (!file) {
    return res.status(400).json({
      type: "invalid_data",
      message: "A payment proof file is required",
    })
  }

  const customerId = req.auth_context.actor_id
  const { result } = await uploadCustomerManualPaymentProofWorkflow(
    req.scope,
  ).run({
    input: {
      orderId: req.params.id,
      customerId,
      actorId: customerId,
      file: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        contentBase64: file.buffer.toString("base64"),
      },
    },
  })

  res.status(200).json({ manual_payment_proof: result.proof })
}
