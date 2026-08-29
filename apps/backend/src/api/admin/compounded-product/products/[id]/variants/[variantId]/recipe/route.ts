import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AdminSetCompoundedProductVariantRecipe } from "../../../../../../../../modules/compounded-product/contracts/bom-readiness"
import setCompoundedProductVariantRecipeWorkflow from "../../../../../../../../workflows/set-compounded-product-variant-recipe"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminSetCompoundedProductVariantRecipe>,
  res: MedusaResponse,
) {
  const { result } = await setCompoundedProductVariantRecipeWorkflow(
    req.scope,
  ).run({
    input: {
      productId: req.params.id,
      variantId: req.params.variantId,
      request: req.validatedBody,
      actorId: req.auth_context.actor_id,
    },
  })

  res.status(200).json({
    change: result.change,
    audit_snapshot: result.auditSnapshot,
    normalized_components: result.normalizedComponents,
    readiness: result.readiness,
  })
}
