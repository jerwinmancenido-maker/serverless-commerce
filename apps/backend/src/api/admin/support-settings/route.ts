import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { resolveSupportConfiguration } from "../../../modules/customer-support/configuration"
import type { AdminUpdateSupportSettings } from "../../../modules/customer-support/contracts"
import { updateSupportSettingsWorkflow } from "../../../workflows/manage-support-configuration"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json(await resolveSupportConfiguration(req.scope))
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateSupportSettings>,
  res: MedusaResponse,
) {
  const { result } = await updateSupportSettingsWorkflow(req.scope).run({
    input: { ...req.validatedBody, actor_id: req.auth_context.actor_id },
  })
  res.json({ settings: result })
}
