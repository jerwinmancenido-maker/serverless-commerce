import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

import { PEPSTACK_BOM_MODULE } from "../../../../../../../../modules/bom"
import type PepstackBomModuleService from "../../../../../../../../modules/bom/service"
import { COMPOUNDED_PRODUCT_MODULE } from "../../../../../../../../modules/compounded-product"
import { normalizeCompoundedProductRecipe } from "../../../../../../../../modules/compounded-product/bom-recipe"
import type { AdminSetCompoundedProductVariantRecipe } from "../../../../../../../../modules/compounded-product/contracts/bom-readiness"
import { resolveCompoundedProductReadiness } from "../../../../../../../../modules/compounded-product/resolve-product-readiness"
import type CompoundedProductModuleService from "../../../../../../../../modules/compounded-product/service"
import setCompoundedProductVariantRecipeWorkflow from "../../../../../../../../workflows/set-compounded-product-variant-recipe"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminSetCompoundedProductVariantRecipe>,
  res: MedusaResponse,
) {
  const compoundedProductService =
    req.scope.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
  const bomService = req.scope.resolve<PepstackBomModuleService>(
    PEPSTACK_BOM_MODULE,
  )
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const [registration] =
    await compoundedProductService.listGovernedProductRegistrations({
      product_id: req.params.id,
    })

  if (!registration) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Governed compounded product ${req.params.id} was not found`,
    )
  }

  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "product_id"],
    filters: { id: req.params.variantId },
  })
  const variant = variants[0] as
    | { id: string; product_id: string }
    | undefined

  if (!variant || variant.product_id !== req.params.id) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Variant ${req.params.variantId} does not belong to product ${req.params.id}`,
    )
  }

  const profiles = await bomService.listComponentProfiles({
    inventory_item_id: req.validatedBody.components.map(
      (component) => component.inventory_item_id,
    ),
  })
  const components = normalizeCompoundedProductRecipe({
    request: req.validatedBody,
    profiles,
  })
  const { result } = await setCompoundedProductVariantRecipeWorkflow(
    req.scope,
  ).run({
    input: {
      productId: req.params.id,
      registrationId: registration.id,
      variantId: req.params.variantId,
      components: components.map(({ inventoryItemId, requiredQuantity }) => ({
        inventoryItemId,
        requiredQuantity,
      })),
      actorId: req.auth_context.actor_id,
      note: req.validatedBody.note || undefined,
    },
  })
  const readiness = await resolveCompoundedProductReadiness(
    req.scope,
    req.params.id,
  )

  res.status(200).json({
    change: result.change,
    audit_snapshot: result.auditSnapshot,
    normalized_components: components,
    readiness,
  })
}
