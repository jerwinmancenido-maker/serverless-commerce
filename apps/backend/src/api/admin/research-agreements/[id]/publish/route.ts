import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { manageResearchAgreementWorkflow } from "../../../../../workflows/manage-research-agreement"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const { result } = await manageResearchAgreementWorkflow(req.scope).run({
    input: {
      operation: "publish",
      id: req.params.id,
      actor_id: req.auth_context.actor_id,
    },
  })
  res.json({ agreement_bundle: result })
}
