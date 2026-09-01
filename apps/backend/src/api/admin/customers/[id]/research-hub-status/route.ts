import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../modules/research-tracking/service"
import { REWARDS_MODULE } from "../../../../../modules/rewards"
import type RewardsModuleService from "../../../../../modules/rewards/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const research = req.scope.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
  const rewards = req.scope.resolve<RewardsModuleService>(REWARDS_MODULE)
  const [profile] = await research.listResearchProfiles({ customer_id: req.params.id }, { take: 1 })
  const [agreement] = await research.listResearchAgreementAcceptances({ customer_id: req.params.id }, { order: { accepted_at: "DESC" }, take: 1 })
  const agreementBundle = agreement
    ? await research.retrieveResearchAgreementBundle(agreement.agreement_bundle_id)
    : null
  if (!profile) {
    res.json({ research_hub: { active: false, agreement_version: agreementBundle?.public_version ?? null, protocol_entitlements: 0, active_routines: 0, reminders_enabled: false, rewards_balance: 0, last_general_activity_at: null } })
    return
  }
  const [accesses, routines, reminderPreferences, programs] = await Promise.all([
    research.listResearchProtocolProfileAccesses({ profile_id: profile.id }),
    research.listResearchRoutines({ profile_id: profile.id, status: "active" }),
    research.listResearchReminderPreferences({ profile_id: profile.id }, { take: 1 }),
    rewards.listRewardPrograms({ status: "active" }, { take: 1 }),
  ])
  const [account] = programs[0] ? await rewards.listRewardAccounts({ customer_id: req.params.id, program_id: programs[0].id }, { take: 1 }) : []
  const entries = account ? await rewards.listRewardLedgerEntries({ reward_account_id: account.id }) : []
  const rewardsBalance = entries.filter((item) => item.status === "available").reduce((total, item) => total + Number(item.points), 0)
  const activityDates = [profile.updated_at, ...accesses.map((item) => item.updated_at), ...routines.map((item) => item.updated_at)].filter(Boolean).map((value) => new Date(value).valueOf())
  res.setHeader("Cache-Control", "private, no-store")
  res.json({ research_hub: {
    active: profile.status === "active",
    agreement_version: agreementBundle?.public_version ?? null,
    protocol_entitlements: accesses.length,
    active_routines: routines.length,
    reminders_enabled: Boolean(reminderPreferences[0]?.enabled),
    rewards_balance: rewardsBalance,
    last_general_activity_at: activityDates.length ? new Date(Math.max(...activityDates)).toISOString() : null,
  } })
}
