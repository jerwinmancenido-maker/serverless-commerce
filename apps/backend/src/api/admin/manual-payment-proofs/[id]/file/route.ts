import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { IFileModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"

import { MANUAL_PAYMENT_MODULE } from "../../../../../modules/manual-payment"
import type ManualPaymentModuleService from "../../../../../modules/manual-payment/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const manualPaymentService = req.scope.resolve<ManualPaymentModuleService>(
    MANUAL_PAYMENT_MODULE,
  )
  const fileService = req.scope.resolve<IFileModuleService>(Modules.FILE)
  const proof = await manualPaymentService.retrieveManualPaymentProof(
    req.params.id,
  )

  if (proof.deleted_at) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "proof was not found")
  }

  const file = await fileService.retrieveFile(proof.file_id)

  res.json({ url: file.url })
}
