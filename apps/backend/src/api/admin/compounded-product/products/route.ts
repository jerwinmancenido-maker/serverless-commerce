import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminCreateCompoundedProductDraft } from "../../../../modules/compounded-product/contracts/product-creation"
import createCompoundedProductDraftWorkflow from "../../../../workflows/create-compounded-product-draft"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateCompoundedProductDraft>,
  res: MedusaResponse,
) {
  const { result } = await createCompoundedProductDraftWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      actorId: req.auth_context.actor_id,
    },
  })

  res.status(result.replayed ? 200 : 201).json(result)
}
