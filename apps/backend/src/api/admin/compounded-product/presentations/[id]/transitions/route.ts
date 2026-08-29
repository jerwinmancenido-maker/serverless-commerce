import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminTransitionCompoundedProductPresentation } from "../../../../../../modules/compounded-product/contracts/configuration"
import transitionCompoundedProductPresentationWorkflow from "../../../../../../workflows/transition-compounded-product-presentation"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminTransitionCompoundedProductPresentation>,
  res: MedusaResponse,
) {
  const { result } = await transitionCompoundedProductPresentationWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      presentationId: req.params.id,
      actorId: req.auth_context.actor_id,
    },
  })

  res.status(200).json(result)
}
