import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REWARDS_MODULE } from "../../../../../modules/rewards"
import type RewardsModuleService from "../../../../../modules/rewards/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<RewardsModuleService>(REWARDS_MODULE)
  const programs = await service.listRewardPrograms({ status: "active" }, { take: 1 })
  const program = programs[0] || null
  const accounts = program ? await service.listRewardAccounts({ customer_id: req.auth_context.actor_id, program_id: program.id }, { take: 1 }) : []
  const account = accounts[0] || null
  const entries = account ? await service.listRewardLedgerEntries({ reward_account_id: account.id }, { order: { created_at: "DESC" }, take: 100 }) : []
  const rules = program ? await service.listRewardRules({ program_id: program.id, status: "active" }, { order: { name: "ASC" } }) : []
  const available = entries.filter((entry) => entry.status === "available").reduce((sum, entry) => sum + Number(entry.points), 0)
  const pending = entries.filter((entry) => entry.status === "pending").reduce((sum, entry) => sum + Number(entry.points), 0)
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ program, account, rules, entries, balance: { available, pending, peso_value: program ? available * Number(program.peso_value_per_point) : 0, lifetime_earned: Number(account?.lifetime_earned || 0) } })
}
