import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { REWARDS_MODULE } from "../../../../../../modules/rewards"
import type RewardsModuleService from "../../../../../../modules/rewards/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<RewardsModuleService>(REWARDS_MODULE)
  const [program] = await service.listRewardPrograms({ status: "active" }, { take: 1 })
  const [account] = program
    ? await service.listReferralAccounts({ program_id: program.id, customer_id: req.auth_context.actor_id }, { take: 1 })
    : []
  const referredByCustomer = program
    ? await service.listReferralEvents({ program_id: program.id, referred_customer_id: req.auth_context.actor_id }, { order: { claimed_at: "DESC" } })
    : []
  const referredByAccount = account
    ? await service.listReferralEvents({ referral_account_id: account.id }, { order: { claimed_at: "DESC" } })
    : []
  const events = [...referredByCustomer, ...referredByAccount.filter((item) => !referredByCustomer.some((other) => other.id === item.id))]
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    enabled: Boolean(program?.referral_enabled),
    account,
    events: events.map((event) => ({
      id: event.id,
      role: event.referred_customer_id === req.auth_context.actor_id ? "referred_customer" : "referrer",
      status: event.status,
      referrer_points: event.referrer_points,
      referred_customer_points: event.referred_customer_points,
      claimed_at: event.claimed_at,
      qualified_at: event.qualified_at,
      available_at: event.available_at,
      reversed_at: event.reversed_at,
    })),
    configuration: program
      ? {
          minimum_order_amount: Number(program.referral_minimum_order_amount),
          waiting_period_days: Number(program.referral_waiting_period_days),
          maximum_per_customer: program.referral_maximum_per_customer,
        }
      : null,
  })
}
