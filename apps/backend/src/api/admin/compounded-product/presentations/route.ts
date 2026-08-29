import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { COMPOUNDED_PRODUCT_MODULE } from "../../../../modules/compounded-product"
import type {
  AdminCreateCompoundedProductPresentation,
  AdminListCompoundedProductPresentations,
} from "../../../../modules/compounded-product/contracts/configuration"
import type CompoundedProductModuleService from "../../../../modules/compounded-product/service"
import createCompoundedProductPresentationWorkflow from "../../../../workflows/create-compounded-product-presentation"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { limit, offset } =
    req.validatedQuery as AdminListCompoundedProductPresentations
  const service = req.scope.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const [presentations, count] =
    await service.listAndCountPresentationConfigurations(
      {},
      {
        take: limit,
        skip: offset,
        order: { key: "ASC" },
      },
    )
  const revisionIds = presentations
    .map((presentation) => presentation.current_revision_id)
    .filter((id): id is string => Boolean(id))
  const revisions = revisionIds.length
    ? await service.listPresentationConfigurationRevisions({ id: revisionIds })
    : []
  const revisionsById = new Map(
    revisions.map((revision) => [revision.id, revision]),
  )

  res.json({
    presentations: presentations.map((presentation) => ({
      presentation,
      current_revision: presentation.current_revision_id
        ? revisionsById.get(presentation.current_revision_id) || null
        : null,
    })),
    count,
    limit,
    offset,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminCreateCompoundedProductPresentation>,
  res: MedusaResponse,
) {
  const { result } = await createCompoundedProductPresentationWorkflow(
    req.scope,
  ).run({
    input: {
      ...req.validatedBody,
      actorId: req.auth_context.actor_id,
    },
  })

  res.status(201).json(result)
}
