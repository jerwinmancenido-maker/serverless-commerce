import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REWARDS_MODULE } from "../../../../modules/rewards"
import type RewardsModuleService from "../../../../modules/rewards/service"
import { manageRewardsWorkflow } from "../../../../workflows/manage-rewards"
import type { AdminConfigureRewardsProgram } from "../middlewares"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<RewardsModuleService>(REWARDS_MODULE)
  const programs = await service.listRewardPrograms({}, { order: { updated_at: "DESC" } })
  const rules = programs[0] ? await service.listRewardRules({ program_id: programs[0].id }, { order: { name: "ASC" } }) : []
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ program: programs[0] || null, rules })
}

export async function POST(req: AuthenticatedMedusaRequest<AdminConfigureRewardsProgram>, res: MedusaResponse) {
  const { result } = await manageRewardsWorkflow(req.scope).run({ input: { operation: "configure_program", ...req.validatedBody } })
  res.json(result)
}
