import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { COMPOUNDED_PRODUCT_MODULE } from "../../../../../modules/compounded-product"
import type { AdminPreviewCompoundedProductVariantMatrix } from "../../../../../modules/compounded-product/contracts/product-creation"
import { CompoundedProductPresentationSnapshot } from "../../../../../modules/compounded-product/contracts/configuration"
import {
  previewCompoundedProductVariantMatrix,
  previewDirectCompoundedProductVariantMatrix,
} from "../../../../../modules/compounded-product/preview-product-matrix"
import { resolveCompoundedProductVariantServerMaximum } from "../../../../../modules/compounded-product/readiness-policy"
import type CompoundedProductModuleService from "../../../../../modules/compounded-product/service"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminPreviewCompoundedProductVariantMatrix>,
  res: MedusaResponse,
) {
  if (req.validatedBody.configuration_snapshot) {
    const snapshot = CompoundedProductPresentationSnapshot.parse(
      req.validatedBody.configuration_snapshot,
    )

    res.json(
      previewDirectCompoundedProductVariantMatrix({
        request: req.validatedBody,
        snapshot,
        serverMaximum: resolveCompoundedProductVariantServerMaximum(),
      }),
    )
    return
  }

  const service = req.scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const [revision] = await service.listPresentationConfigurationRevisions(
    { id: req.validatedBody.presentation_revision_id! },
    { take: 1 },
  )

  if (!revision) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Compounded product presentation revision was not found",
    )
  }

  res.json(
    previewCompoundedProductVariantMatrix({
      request: req.validatedBody,
      revision,
      serverMaximum: resolveCompoundedProductVariantServerMaximum(),
    }),
  )
}
