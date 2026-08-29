import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminCreateCompoundedProductPresentationRevision } from "../../../../../../modules/compounded-product/contracts/configuration"
import reviseCompoundedProductPresentationWorkflow from "../../../../../../workflows/revise-compounded-product-presentation"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateCompoundedProductPresentationRevision>,
  res: MedusaResponse,
) {
  const { result } = await reviseCompoundedProductPresentationWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      presentationId: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.status(201).json(result)
}
