import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { PEPSTACK_BOM_MODULE } from "../../modules/bom"
import type PepstackBomModuleService from "../../modules/bom/service"
import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import { normalizeCompoundedProductRecipe } from "../../modules/compounded-product/bom-recipe"
import type { AdminSetCompoundedProductVariantRecipe } from "../../modules/compounded-product/contracts/bom-readiness"
import { resolveCompoundedProductReadiness } from "../../modules/compounded-product/resolve-product-readiness"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

export type SetCompoundedProductVariantRecipeWorkflowInput = {
  productId: string
  variantId: string
  request: AdminSetCompoundedProductVariantRecipe
  actorId: string
}

export type PreparedCompoundedProductVariantRecipe = {
  productId: string
  registrationId: string
  variantId: string
  components: Array<{
    inventoryItemId: string
    requiredQuantity: number
  }>
  normalizedComponents: ReturnType<typeof normalizeCompoundedProductRecipe>
  actorId: string
  note?: string
}

export const prepareCompoundedProductVariantRecipeStep = createStep(
  "prepare-compounded-product-variant-recipe",
  async (
    input: SetCompoundedProductVariantRecipeWorkflowInput,
    { container },
  ) => {
    const compoundedProductService =
      container.resolve<CompoundedProductModuleService>(
        COMPOUNDED_PRODUCT_MODULE,
      )
    const bomService = container.resolve<PepstackBomModuleService>(
      PEPSTACK_BOM_MODULE,
    )
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const [registration] =
      await compoundedProductService.listGovernedProductRegistrations(
        { product_id: input.productId },
        { take: 1 },
      )

    if (!registration) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Governed compounded product ${input.productId} was not found`,
      )
    }

    const { data: variants } = await query.graph({
      entity: "variant",
      fields: ["id", "product_id"],
      filters: { id: input.variantId },
    })
    const variant = variants[0] as
      | { id: string; product_id: string }
      | undefined

    if (!variant || variant.product_id !== input.productId) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Variant ${input.variantId} does not belong to product ${input.productId}`,
      )
    }

    const profiles = await bomService.listComponentProfiles({
      inventory_item_id: input.request.components.map(
        (component) => component.inventory_item_id,
      ),
    })
    const normalizedComponents = normalizeCompoundedProductRecipe({
      request: input.request,
      profiles,
    })

    return new StepResponse<PreparedCompoundedProductVariantRecipe>({
      productId: input.productId,
      registrationId: registration.id,
      variantId: input.variantId,
      components: normalizedComponents.map(
        ({ inventoryItemId, requiredQuantity }) => ({
          inventoryItemId,
          requiredQuantity,
        }),
      ),
      normalizedComponents,
      actorId: input.actorId,
      note: input.request.note || undefined,
    })
  },
)

export const resolveCompoundedProductRecipeReadinessStep = createStep(
  "resolve-compounded-product-recipe-readiness",
  async (input: { productId: string }, { container }) => {
    const readiness = await resolveCompoundedProductReadiness(
      container,
      input.productId,
    )

    return new StepResponse(readiness)
  },
)
