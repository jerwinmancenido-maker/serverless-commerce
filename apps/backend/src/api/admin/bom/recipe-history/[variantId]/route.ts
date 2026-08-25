import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { PEPSTACK_BOM_MODULE } from "../../../../../modules/bom"
import type PepstackBomModuleService from "../../../../../modules/bom/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const variantId = req.params.variantId?.trim()

  if (!variantId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "variant ID is required",
    )
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "sku"],
    filters: { id: variantId },
  })
  const variant = variants[0]

  if (!variant) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `product variant ${variantId} was not found`,
    )
  }

  const bomService = req.scope.resolve<PepstackBomModuleService>(
    PEPSTACK_BOM_MODULE,
  )
  const recipeHistory = await bomService.listRecipeAuditSnapshots(
    { variant_id: variantId },
    { order: { version: "DESC" } },
  )

  res.json({
    variant,
    recipe_history: recipeHistory,
    count: recipeHistory.length,
  })
}
