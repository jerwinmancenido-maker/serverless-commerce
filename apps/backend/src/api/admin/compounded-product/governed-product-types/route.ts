import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { COMPOUNDED_PRODUCT_MODULE } from "../../../../modules/compounded-product"
import type {
  AdminCreateCompoundedProductClassificationMapping,
  AdminListCompoundedProductClassificationMappings,
} from "../../../../modules/compounded-product/contracts/classification"
import type CompoundedProductModuleService from "../../../../modules/compounded-product/service"
import createCompoundedProductClassificationMappingWorkflow from "../../../../workflows/create-compounded-product-classification-mapping"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { limit, offset } =
    req.validatedQuery as AdminListCompoundedProductClassificationMappings
  const service = req.scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const [mappings, count] = await service.listAndCountGovernedProductTypeMappings(
    {},
    {
      take: limit,
      skip: offset,
      order: { created_at: "DESC" },
    },
  )

  res.json({ mappings, count, limit, offset })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateCompoundedProductClassificationMapping>,
  res: MedusaResponse,
) {
  const { result } =
    await createCompoundedProductClassificationMappingWorkflow(req.scope).run({
      input: {
        ...req.validatedBody,
        actorId: req.auth_context.actor_id,
      },
    })

  res.status(201).json({ mapping: result })
}
