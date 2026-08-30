import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { COMPOUNDED_PRODUCT_MODULE } from "../../../../modules/compounded-product"
import type {
  AdminCreateCompoundProductFormat,
  AdminListCompoundProductFormats,
} from "../../../../modules/compounded-product/contracts/compound-product-format"
import type CompoundedProductModuleService from "../../../../modules/compounded-product/service"
import { createCompoundProductFormatWorkflow } from "../../../../workflows/manage-compound-product-format"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { status, limit, offset } =
    req.validatedQuery as AdminListCompoundProductFormats
  const service = req.scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const [formats, count] = await service.listAndCountCompoundProductFormats(
    status ? { status } : {},
    { take: limit, skip: offset, order: { name: "ASC" } },
  )

  res.json({ formats, count, limit, offset })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateCompoundProductFormat>,
  res: MedusaResponse,
) {
  const { result } = await createCompoundProductFormatWorkflow(req.scope).run({
    input: { ...req.validatedBody, actorId: req.auth_context.actor_id },
  })

  res.status(201).json({ format: result })
}
