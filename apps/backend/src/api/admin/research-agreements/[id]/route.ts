import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { manageResearchAgreementWorkflow } from "../../../../workflows/manage-research-agreement"
import type { AdminResearchAgreementBundle } from "../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminResearchAgreementBundle>,
  res: MedusaResponse,
) {
  const { result } = await manageResearchAgreementWorkflow(req.scope).run({
    input: {
      operation: "update",
      id: req.params.id,
      actor_id: req.auth_context.actor_id,
      ...req.validatedBody,
    },
  })
  res.json({ agreement_bundle: result })
}
