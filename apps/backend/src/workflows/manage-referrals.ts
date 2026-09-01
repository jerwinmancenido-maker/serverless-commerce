import { createHash, randomUUID } from "node:crypto"

import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { REWARDS_MODULE } from "../modules/rewards"
import type RewardsModuleService from "../modules/rewards/service"
import {
  isReferralCampaignActive,
  isReferralOrderEligible,
  normalizeReferralCode,
} from "../modules/rewards/contracts/referrals"

type ReferralInput =
  | { operation: "ensure_account"; customerId: string }
  | { operation: "claim"; customerId: string; code: string }
  | {
      operation: "qualify"
      customerId: string
      orderId: string
      paymentId: string
      eligibleAmount: number
      productIds: string[]
    }
  | {
      operation: "reverse"
      orderId: string
      reversalId: string
    }

function referralCode(customerId: string) {
  const suffix = createHash("sha256")
    .update(`${customerId}:${randomUUID()}`)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase()
  return `PEP-${suffix}`
}

const manageReferralStep = createStep<
  ReferralInput,
  Record<string, unknown>,
  void
>(
  "manage-referral",
  async (input: ReferralInput, { container }) => {
    const service = container.resolve<RewardsModuleService>(REWARDS_MODULE)
    const [program] = await service.listRewardPrograms(
      { status: "active" },
      { take: 1 },
    )
    if (!program) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "No active rewards program is configured",
      )
    }

    if (input.operation === "reverse") {
      const [event] = await service.listReferralEvents(
        { qualifying_order_id: input.orderId, status: "qualified" },
        { take: 1 },
      )
      if (!event || !program.referral_refund_reversal_enabled) {
        return new StepResponse({ skipped: "referral_reversal_not_required" })
      }
      const updated = await service.updateReferralEvents({
        id: event.id,
        status: "reversed",
        reversed_at: new Date(),
        rejection_reason: `Refund ${input.reversalId}`,
      })
      return new StepResponse({ event: updated })
    }

    if (!program.referral_enabled) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Referral program is not enabled",
      )
    }
    const now = new Date()
    if (!isReferralCampaignActive({ now, startsAt: program.referral_starts_at, endsAt: program.referral_ends_at })) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Referral campaign is not active",
      )
    }

    if (input.operation === "ensure_account") {
      const [existing] = await service.listReferralAccounts(
        { program_id: program.id, customer_id: input.customerId },
        { take: 1 },
      )
      if (existing) return new StepResponse({ account: existing })
      const account = await service.createReferralAccounts({
        program_id: program.id,
        customer_id: input.customerId,
        code: referralCode(input.customerId),
        status: "active",
        qualified_referrals: 0,
      })
      return new StepResponse({ account })
    }

    if (input.operation === "claim") {
      const code = normalizeReferralCode(input.code)
      const [referrer] = await service.listReferralAccounts(
        { program_id: program.id, code, status: "active" },
        { take: 1 },
      )
      if (!referrer) {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, "Referral code was not found")
      }
      if (referrer.customer_id === input.customerId) {
        throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Self-referrals are not allowed")
      }
      const [existing] = await service.listReferralEvents(
        { program_id: program.id, referred_customer_id: input.customerId },
        { take: 1 },
      )
      if (existing) {
        if (existing.referral_account_id === referrer.id) {
          return new StepResponse({ event: existing })
        }
        throw new MedusaError(
          MedusaError.Types.CONFLICT,
          "A referral is already attached to this account",
        )
      }
      const event = await service.createReferralEvents({
        program_id: program.id,
        referral_account_id: referrer.id,
        referral_code_snapshot: referrer.code,
        referrer_customer_id: referrer.customer_id,
        referred_customer_id: input.customerId,
        status: "pending",
        qualifying_order_id: null,
        qualifying_payment_id: null,
        eligible_amount: null,
        referrer_points: 0,
        referred_customer_points: 0,
        waiting_period_days: Number(program.referral_waiting_period_days),
        claimed_at: now,
        qualified_at: null,
        available_at: null,
        reversed_at: null,
        rejection_reason: null,
      })
      return new StepResponse({ event })
    }

    const [event] = await service.listReferralEvents(
      {
        program_id: program.id,
        referred_customer_id: input.customerId,
        status: "pending",
      },
      { take: 1 },
    )
    if (!event) return new StepResponse({ skipped: "no_pending_referral" })
    const eligibleProductIds =
      (program.referral_eligible_product_ids as { values?: string[] } | null)
        ?.values ?? []
    if (!isReferralOrderEligible({ eligibleAmount: input.eligibleAmount, minimumAmount: Number(program.referral_minimum_order_amount), productIds: input.productIds, eligibleProductIds })) {
      return new StepResponse({ skipped: "qualifying_order_not_eligible" })
    }
    const account = await service.retrieveReferralAccount(
      event.referral_account_id,
    )
    if (
      program.referral_maximum_per_customer &&
      Number(account.qualified_referrals) >=
        Number(program.referral_maximum_per_customer)
    ) {
      return new StepResponse({ skipped: "referrer_limit_reached" })
    }
    const rules = await service.listRewardRules({
      program_id: program.id,
      status: "active",
    })
    const referrerRule = rules.find(
      (rule) => rule.event_type === "referral_referrer",
    )
    const referredRule = rules.find(
      (rule) => rule.event_type === "referral_referred",
    )
    if (!referrerRule || !referredRule) {
      return new StepResponse({ skipped: "referral_reward_rules_inactive" })
    }
    const waitingDays = Number(program.referral_waiting_period_days)
    const availableAt = new Date(now.valueOf() + waitingDays * 86_400_000)
    const updated = await service.updateReferralEvents({
      id: event.id,
      status: "qualified",
      qualifying_order_id: input.orderId,
      qualifying_payment_id: input.paymentId,
      eligible_amount: input.eligibleAmount,
      referrer_points: Number(referrerRule.point_value || 0),
      referred_customer_points: Number(referredRule.point_value || 0),
      waiting_period_days: waitingDays,
      qualified_at: now,
      available_at: availableAt,
    })
    await service.updateReferralAccounts({
      id: account.id,
      qualified_referrals: Number(account.qualified_referrals) + 1,
    })
    return new StepResponse({ event: updated })
  },
)

export const manageReferralsWorkflow = createWorkflow(
  "manage-referrals",
  (input: ReferralInput) =>
    new WorkflowResponse(manageReferralStep(input)),
)
