import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { COMPOUNDED_PRODUCT_MODULE } from "../../../../modules/compounded-product"
import type {
  AdminCreateCompoundFamily,
  AdminListCompoundFamilies,
} from "../../../../modules/compounded-product/contracts/compound-family"
import type CompoundedProductModuleService from "../../../../modules/compounded-product/service"
import { createCompoundFamilyWorkflow } from "../../../../workflows/manage-compound-family"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { status, limit, offset } =
    req.validatedQuery as AdminListCompoundFamilies
  const service = req.scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const [families, count] = await service.listAndCountCompoundFamilies(
    status ? { status } : {},
    { take: limit, skip: offset, order: { name: "ASC" } },
  )

  res.json({ families, count, limit, offset })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateCompoundFamily>,
  res: MedusaResponse,
) {
  const { result } = await createCompoundFamilyWorkflow(req.scope).run({
    input: { ...req.validatedBody, actorId: req.auth_context.actor_id },
  })

  res.status(201).json({ family: result })
}
