import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import uploadAdminManualPaymentProofWorkflow from "../../../../../../workflows/upload-admin-manual-payment-proof"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const file = req.file

  if (!file) {
    return res.status(400).json({
      type: "invalid_data",
      message: "A payment receipt file is required",
    })
  }

  const actorId = req.auth_context.actor_id

  const { result } = await uploadAdminManualPaymentProofWorkflow(
    req.scope,
  ).run({
    input: {
      orderId: req.params.id,
      actorId,
      file: {
        fileName: file.originalname,
        mimeType: file.mimetype,
        contentBase64: file.buffer.toString("base64"),
      },
    },
  })

  res.status(200).json({ manual_payment_proof: result.proof })
}
