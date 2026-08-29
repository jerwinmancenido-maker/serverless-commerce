import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminTransitionCompoundedProductClassificationMapping } from "../../../../../../modules/compounded-product/contracts/classification"
import transitionCompoundedProductClassificationMappingWorkflow from "../../../../../../workflows/transition-compounded-product-classification-mapping"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminTransitionCompoundedProductClassificationMapping>,
  res: MedusaResponse,
) {
  const { result } =
    await transitionCompoundedProductClassificationMappingWorkflow(
      req.scope,
    ).run({
      input: {
        ...req.validatedBody,
        mappingId: req.params.id,
        actorId: req.auth_context.actor_id,
      },
    })

  res.status(200).json({ mapping: result })
}
