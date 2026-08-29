import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { COMPOUNDED_PRODUCT_MODULE } from "../../../../../modules/compounded-product"
import { compareCompoundedProductConfigurationRevisions } from "../../../../../modules/compounded-product/configuration-revision-impact"
import type { AdminCompareCompoundedProductConfigurationRevisions } from "../../../../../modules/compounded-product/contracts/product-creation"
import type CompoundedProductModuleService from "../../../../../modules/compounded-product/service"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCompareCompoundedProductConfigurationRevisions>,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const revisions = await service.listPresentationConfigurationRevisions({
    id: [
      req.validatedBody.from_revision_id,
      req.validatedBody.to_revision_id,
    ],
  })
  const byId = new Map(revisions.map((revision) => [revision.id, revision]))
  const from = byId.get(req.validatedBody.from_revision_id)
  const to = byId.get(req.validatedBody.to_revision_id)

  if (!from || !to) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "One or more compounded-product configuration revisions were not found",
    )
  }

  res.json({
    impact: compareCompoundedProductConfigurationRevisions({ from, to }),
  })
}
