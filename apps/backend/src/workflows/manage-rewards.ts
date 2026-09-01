import { createHash } from "node:crypto"

import {
  createPromotionsWorkflow,
  deletePromotionsWorkflow,
  updateCartPromotionsWorkflow,
} from "@medusajs/core-flows"
import {
  ContainerRegistrationKeys,
  MedusaError,
  PromotionActions,
} from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { REWARDS_MODULE } from "../modules/rewards"
import type RewardsModuleService from "../modules/rewards/service"
import { emitCustomerNotificationWorkflow } from "./manage-customer-notifications"

type ConfigureProgramInput = {
  operation: "configure_program"
  program_id?: string
  name: string
  status: "draft" | "active" | "paused"
  currency_code: string
  purchase_amount_per_point: number
  peso_value_per_point: number
  minimum_redemption_points: number
  maximum_redemption_points?: number | null
  points_expire_after_days?: number | null
  pending_period_days: number
  referral_enabled?: boolean
  referral_minimum_order_amount?: number
  referral_waiting_period_days?: number
  referral_maximum_per_customer?: number | null
  referral_refund_reversal_enabled?: boolean
  referral_eligible_product_ids?: string[]
  referral_starts_at?: string | null
  referral_ends_at?: string | null
}

type AwardInput = {
  operation: "award"
  customer_id: string
  rule_id: string
  source_type: string
  source_id: string
  order_id?: string | null
  points?: number
  eligible_amount?: number
  status?: "pending" | "available"
  idempotency_key: string
  pending_days?: number
}

type AwardEventInput = Omit<AwardInput, "operation" | "rule_id"> & {
  operation: "award_event"
  event_type: string
}

type RedeemInput = {
  operation: "redeem"
  customer_id: string
  points: number
  cart_id: string
  idempotency_key: string
}

type ReversePurchaseInput = {
  operation: "reverse_purchase"
  customer_id: string
  order_id: string
  refund_id: string
  eligible_refunded_amount: number
  idempotency_key: string
}

type AdjustInput = {
  operation: "adjust"
  customer_id: string
  points: number
  reason: string
  actor_id: string
  idempotency_key: string
}

type ReleaseDueInput = { operation: "release_due" }

type ReverseEventInput = {
  operation: "reverse_event"
  customer_id: string
  source_type: string
  source_id: string
  reversal_source_id: string
  order_id?: string | null
  idempotency_key: string
}

type ConfigureRuleInput = {
  operation: "configure_rule"
  rule_id: string
  name: string
  point_value?: number | null
  purchase_amount_per_point?: number | null
  daily_cap?: number | null
  weekly_cap?: number | null
  lifetime_cap?: number | null
  starts_at?: string | null
  ends_at?: string | null
  status: "active" | "inactive"
  show_as_badge?: boolean
  badge_name?: string | null
  badge_icon?: string | null
  streak_target?: number | null
  skip_policy?: "ignore" | "break"
}

type RewardMutationInput =
  | ConfigureProgramInput
  | AwardInput
  | AwardEventInput
  | RedeemInput
  | ReversePurchaseInput
  | AdjustInput
  | ConfigureRuleInput
  | ReleaseDueInput
  | ReverseEventInput

async function activeProgram(service: RewardsModuleService) {
  const programs = await service.listRewardPrograms(
    { status: "active" },
    { order: { updated_at: "DESC" }, take: 1 },
  )
  if (!programs[0]) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No active rewards program is configured",
    )
  }
  return programs[0]
}

async function rewardAccount(
  service: RewardsModuleService,
  customerId: string,
  programId: string,
) {
  const accounts = await service.listRewardAccounts(
    { customer_id: customerId, program_id: programId },
    { take: 1 },
  )
  return (
    accounts[0] ||
    (await service.createRewardAccounts({
      customer_id: customerId,
      program_id: programId,
      status: "active",
      lifetime_earned: 0,
    }))
  )
}

function availableBalance(entries: Array<{ points: number; status: string }>) {
  return entries
    .filter((entry) => entry.status === "available")
    .reduce((total, entry) => total + entry.points, 0)
}

async function notifyReward(
  container: any,
  input: {
    customerId: string
    eventKey: "reward.points_earned" | "reward.points_available" | "reward.points_redeemed" | "reward.points_reversed" | "reward.referral_completed"
    sourceId: string
    points?: number
  },
) {
  await emitCustomerNotificationWorkflow(container).run({
    input: {
      customer_id: input.customerId,
      event_key: input.eventKey,
      source_id: input.sourceId,
      variables: input.points === undefined ? {} : { points: Math.abs(input.points) },
      target_kind: "rewards",
      target_id: null,
      secondary_target_id: null,
      metadata: {},
    },
  })
}

const manageRewardsStep = createStep<
  RewardMutationInput,
  Record<string, unknown>,
  void
>(
  "manage-rewards",
  async (input: RewardMutationInput, { container }) => {
    const service = container.resolve<RewardsModuleService>(REWARDS_MODULE)
    if (input.operation === "release_due") {
      const now = new Date()
      const entries = await service.listRewardLedgerEntries({ status: "pending" })
      const due = entries.filter(
        (entry) => entry.available_at && entry.available_at <= now,
      )
      for (const entry of due) {
        await service.updateRewardLedgerEntries({ id: entry.id, status: "available" })
        const account = await service.retrieveRewardAccount(entry.reward_account_id)
        await notifyReward(container, { customerId: account.customer_id, eventKey: "reward.points_available", sourceId: `available:${entry.id}`, points: Number(entry.points) })
      }
      return new StepResponse({ released: due.length })
    }
    if (input.operation === "configure_program") {
      if (
        input.purchase_amount_per_point <= 0 ||
        input.peso_value_per_point <= 0 ||
        input.minimum_redemption_points < 0
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Rewards rates and limits must be positive",
        )
      }
      if (input.status === "active") {
        const active = await service.listRewardPrograms({ status: "active" })
        for (const program of active) {
          if (program.id !== input.program_id) {
            await service.updateRewardPrograms({ id: program.id, status: "paused" })
          }
        }
      }
      const data = {
        name: input.name,
        status: input.status,
        currency_code: input.currency_code.toLowerCase(),
        purchase_amount_per_point: input.purchase_amount_per_point,
        peso_value_per_point: input.peso_value_per_point,
        minimum_redemption_points: input.minimum_redemption_points,
        maximum_redemption_points: input.maximum_redemption_points || null,
        points_expire_after_days: input.points_expire_after_days || null,
        pending_period_days: input.pending_period_days,
        referral_enabled: input.referral_enabled ?? false,
        referral_minimum_order_amount:
          input.referral_minimum_order_amount ?? 0,
        referral_waiting_period_days:
          input.referral_waiting_period_days ?? 0,
        referral_maximum_per_customer:
          input.referral_maximum_per_customer ?? null,
        referral_refund_reversal_enabled:
          input.referral_refund_reversal_enabled ?? true,
        referral_eligible_product_ids: {
          values: input.referral_eligible_product_ids ?? [],
        },
        referral_starts_at: input.referral_starts_at
          ? new Date(input.referral_starts_at)
          : null,
        referral_ends_at: input.referral_ends_at
          ? new Date(input.referral_ends_at)
          : null,
      }
      const program = input.program_id
        ? await service.updateRewardPrograms({ id: input.program_id, ...data })
        : await service.createRewardPrograms(data)
      const existingRules = await service.listRewardRules({ program_id: program.id })
      if (!existingRules.length) {
        const createdRules = await service.createRewardRules([
          { program_id: program.id, name: "Purchase", event_type: "purchase_confirmed", award_type: "purchase_rate", point_value: null, purchase_amount_per_point: input.purchase_amount_per_point, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: null, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "Complete profile", event_type: "profile_completed", award_type: "fixed", point_value: 10, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: 10, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "First address", event_type: "first_address", award_type: "fixed", point_value: 10, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: 10, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "Review first protocol", event_type: "first_protocol_review", award_type: "fixed", point_value: 10, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: 10, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "Start first routine", event_type: "first_routine", award_type: "fixed", point_value: 20, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: 20, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "First measurement", event_type: "first_measurement", award_type: "fixed", point_value: 15, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: 15, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "First Journal entry", event_type: "first_journal", award_type: "fixed", point_value: 15, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: 15, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "First routine activity", event_type: "first_routine_activity", award_type: "fixed", point_value: 10, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: 10, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "First weekly goal", event_type: "first_weekly_goal", award_type: "fixed", point_value: 10, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: 10, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "Journal activity", event_type: "journal_daily", award_type: "fixed", point_value: 1, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: 1, weekly_cap: 5, lifetime_cap: null, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "Weekly measurement", event_type: "measurement_weekly", award_type: "fixed", point_value: 2, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: null, lifetime_cap: null, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "Routine activity", event_type: "routine_activity_daily", award_type: "fixed", point_value: 1, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: 1, weekly_cap: null, lifetime_cap: null, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "Weekly routine goal", event_type: "weekly_routine_goal", award_type: "fixed", point_value: 5, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: 5, lifetime_cap: null, starts_at: null, ends_at: null, status: "active" },
          { program_id: program.id, name: "Personal goal completed", event_type: "personal_goal_completed", award_type: "fixed", point_value: 5, purchase_amount_per_point: null, eligible_product_ids: null, eligible_category_ids: null, daily_cap: null, weekly_cap: 25, lifetime_cap: null, starts_at: null, ends_at: null, status: "active" },
        ])
        const badges: Record<string, [string, string]> = {
          first_protocol_review: ["Protocol explorer", "book"],
          first_routine: ["Routine starter", "calendar"],
          first_routine_activity: ["First check-in", "check"],
          first_measurement: ["Progress tracker", "chart"],
          first_journal: ["Journal keeper", "journal"],
          first_weekly_goal: ["Weekly finisher", "star"],
          personal_goal_completed: ["Goal achiever", "target"],
        }
        for (const rule of createdRules) {
          const badge = badges[rule.event_type]
          if (badge) {
            await service.updateRewardRules({
              id: rule.id,
              show_as_badge: true,
              badge_name: badge[0],
              badge_icon: badge[1],
              streak_target: null,
              skip_policy: "ignore",
            })
          }
        }
      }
      if (existingRules.length && !existingRules.some((rule) => rule.event_type === "personal_goal_completed")) {
        await service.createRewardRules({
          program_id: program.id,
          name: "Personal goal completed",
          event_type: "personal_goal_completed",
          award_type: "fixed",
          point_value: 5,
          purchase_amount_per_point: null,
          eligible_product_ids: null,
          eligible_category_ids: null,
          daily_cap: null,
          weekly_cap: 25,
          lifetime_cap: null,
          starts_at: null,
          ends_at: null,
          status: "active",
        })
      }
      const refreshedRules = await service.listRewardRules({ program_id: program.id })
      if (!refreshedRules.some((rule) => rule.event_type === "referral_referrer")) {
        await service.createRewardRules({
          program_id: program.id,
          name: "Qualified referral · referrer",
          event_type: "referral_referrer",
          award_type: "fixed",
          point_value: 1,
          purchase_amount_per_point: null,
          eligible_product_ids: null,
          eligible_category_ids: null,
          daily_cap: null,
          weekly_cap: null,
          lifetime_cap: null,
          starts_at: null,
          ends_at: null,
          status: "inactive",
        })
      }
      if (!refreshedRules.some((rule) => rule.event_type === "referral_referred")) {
        await service.createRewardRules({
          program_id: program.id,
          name: "Qualified referral · new customer",
          event_type: "referral_referred",
          award_type: "fixed",
          point_value: 1,
          purchase_amount_per_point: null,
          eligible_product_ids: null,
          eligible_category_ids: null,
          daily_cap: null,
          weekly_cap: null,
          lifetime_cap: null,
          starts_at: null,
          ends_at: null,
          status: "inactive",
        })
      }
      return new StepResponse({ program })
    }

    if (input.operation === "configure_rule") {
      const rule = await service.retrieveRewardRule(input.rule_id)
      const startsAt = input.starts_at ? new Date(input.starts_at) : null
      const endsAt = input.ends_at ? new Date(input.ends_at) : null
      if (
        (startsAt && Number.isNaN(startsAt.valueOf())) ||
        (endsAt && Number.isNaN(endsAt.valueOf())) ||
        (startsAt && endsAt && startsAt >= endsAt)
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Reward rule dates are invalid",
        )
      }
      if (
        rule.award_type === "fixed" &&
        (!Number.isInteger(input.point_value) || Number(input.point_value) <= 0)
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "A fixed reward rule requires positive whole points",
        )
      }
      if (
        rule.award_type === "purchase_rate" &&
        Number(input.purchase_amount_per_point) <= 0
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "A purchase reward rule requires a positive amount per point",
        )
      }
      const updated = await service.updateRewardRules({
        id: rule.id,
        name: input.name.trim(),
        point_value:
          rule.award_type === "fixed" ? Number(input.point_value) : null,
        purchase_amount_per_point:
          rule.award_type === "purchase_rate"
            ? Number(input.purchase_amount_per_point)
            : null,
        daily_cap: input.daily_cap ?? null,
        weekly_cap: input.weekly_cap ?? null,
        lifetime_cap: input.lifetime_cap ?? null,
        starts_at: startsAt,
        ends_at: endsAt,
        status: input.status,
        show_as_badge: input.show_as_badge ?? rule.show_as_badge,
        badge_name: input.badge_name ?? null,
        badge_icon: input.badge_icon ?? null,
        streak_target: input.streak_target ?? null,
        skip_policy: input.skip_policy ?? rule.skip_policy,
      })
      return new StepResponse({ rule: updated })
    }

    const program = await activeProgram(service)
    const account = await rewardAccount(service, input.customer_id, program.id)
    if (account.status !== "active") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Rewards account is not active",
      )
    }
    const prior = await service.listRewardLedgerEntries(
      { reward_account_id: account.id, idempotency_key: input.idempotency_key },
      { take: 1 },
    )
    if (prior[0]) return new StepResponse({ account, ledger_entry: prior[0] })

    if (input.operation === "award" || input.operation === "award_event") {
      const rule = input.operation === "award"
        ? await service.retrieveRewardRule(input.rule_id)
        : (
            await service.listRewardRules(
              {
                program_id: program.id,
                event_type: input.event_type,
                status: "active",
              },
              { take: 1 },
            )
          )[0]
      if (!rule) {
        return new StepResponse({ account, skipped: "rule_not_configured" })
      }
      if (rule.status !== "active" || rule.program_id !== program.id) {
        throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Reward rule is inactive")
      }
      let points =
        rule.award_type === "purchase_rate"
          ? Math.floor(Number(input.eligible_amount || 0) / Number(rule.purchase_amount_per_point || program.purchase_amount_per_point))
          : Number(input.points ?? rule.point_value ?? 0)
      if (!Number.isInteger(points) || points <= 0) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Reward award is zero or invalid")
      }
      const now = new Date()
      if (
        (rule.starts_at && rule.starts_at > now) ||
        (rule.ends_at && rule.ends_at <= now)
      ) {
        return new StepResponse({ account, skipped: "outside_rule_window" })
      }
      const ruleEntries = await service.listRewardLedgerEntries({
        reward_account_id: account.id,
        rule_id: rule.id,
      })
      const earned = (from?: Date) =>
        ruleEntries
          .filter(
            (entry) =>
              entry.points > 0 &&
              entry.status !== "reversed" &&
              entry.status !== "cancelled" &&
              (!from || entry.created_at >= from),
          )
          .reduce((sum, entry) => sum + Number(entry.points), 0)
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)
      const startOfWeek = new Date(startOfDay)
      startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7))
      const remaining = [
        rule.daily_cap ? Number(rule.daily_cap) - earned(startOfDay) : Infinity,
        rule.weekly_cap ? Number(rule.weekly_cap) - earned(startOfWeek) : Infinity,
        rule.lifetime_cap ? Number(rule.lifetime_cap) - earned() : Infinity,
      ]
      points = Math.min(points, ...remaining)
      if (points <= 0) {
        return new StepResponse({ account, skipped: "rule_cap_reached" })
      }
      const status = input.status || "available"
      const pendingDays = input.pending_days ?? Number(program.pending_period_days)
      const availableAt = status === "available"
        ? now
        : new Date(now.valueOf() + pendingDays * 86_400_000)
      const entry = await service.createRewardLedgerEntries({
        reward_account_id: account.id,
        entry_type: "earn",
        points,
        status,
        rule_id: rule.id,
        source_type: input.source_type,
        source_id: input.source_id,
        order_id: input.order_id || null,
        idempotency_key: input.idempotency_key,
        available_at: availableAt,
        expires_at: program.points_expire_after_days
          ? new Date(availableAt.valueOf() + Number(program.points_expire_after_days) * 86_400_000)
          : null,
        reversal_entry_id: null,
        admin_reason: null,
      })
      await service.updateRewardAccounts({
        id: account.id,
        lifetime_earned: Number(account.lifetime_earned) + points,
      })
      await notifyReward(container, { customerId: input.customer_id, eventKey: "reward.points_earned", sourceId: entry.id, points })
      return new StepResponse({ account, ledger_entry: entry })
    }

    if (input.operation === "reverse_purchase") {
      const purchaseRules = await service.listRewardRules(
        {
          program_id: program.id,
          event_type: "purchase_confirmed",
        },
        { take: 1 },
      )
      const purchaseRule = purchaseRules[0]
      const entries = await service.listRewardLedgerEntries({
        reward_account_id: account.id,
        order_id: input.order_id,
      })
      const originalPoints = entries
        .filter(
          (entry) =>
            entry.entry_type === "earn" &&
            entry.rule_id === purchaseRule?.id &&
            entry.status !== "reversed" &&
            entry.status !== "cancelled",
        )
        .reduce((sum, entry) => sum + Number(entry.points), 0)
      const alreadyReversed = Math.abs(
        entries
          .filter(
            (entry) =>
              entry.entry_type === "reverse" &&
              entry.source_type === "purchase_refund",
          )
          .reduce((sum, entry) => sum + Number(entry.points), 0),
      )
      const amountPerPoint = Number(
        purchaseRule?.purchase_amount_per_point ||
          program.purchase_amount_per_point,
      )
      const targetReversed = Math.min(
        originalPoints,
        Math.floor(input.eligible_refunded_amount / amountPerPoint),
      )
      const points = targetReversed - alreadyReversed
      if (points <= 0) {
        return new StepResponse({ account, skipped: "no_refund_points_due" })
      }
      const originalEntry = entries.find(
        (entry) =>
          entry.entry_type === "earn" && entry.rule_id === purchaseRule?.id,
      )
      const reversal = await service.createRewardLedgerEntries({
        reward_account_id: account.id,
        entry_type: "reverse",
        points: -points,
        status: "available",
        rule_id: purchaseRule?.id || null,
        source_type: "purchase_refund",
        source_id: input.refund_id,
        order_id: input.order_id,
        idempotency_key: input.idempotency_key,
        available_at: new Date(),
        expires_at: null,
        reversal_entry_id: originalEntry?.id || null,
        admin_reason: null,
      })
      await notifyReward(container, { customerId: input.customer_id, eventKey: "reward.points_reversed", sourceId: reversal.id, points })
      return new StepResponse({ account, ledger_entry: reversal })
    }

    if (input.operation === "reverse_event") {
      const entries = await service.listRewardLedgerEntries({
        reward_account_id: account.id,
        source_type: input.source_type,
        source_id: input.source_id,
      })
      const originals = entries.filter(
        (entry) =>
          entry.entry_type === "earn" &&
          entry.status !== "reversed" &&
          entry.status !== "cancelled",
      )
      let reversed = 0
      for (const original of originals) {
        const reversalKey = `reverse-event:${input.reversal_source_id}:${original.id}`
        const priorReversal = await service.listRewardLedgerEntries(
          { reward_account_id: account.id, idempotency_key: reversalKey },
          { take: 1 },
        )
        if (priorReversal[0]) continue
        if (original.status === "pending") {
          await service.updateRewardLedgerEntries({
            id: original.id,
            status: "cancelled",
          })
        } else {
          await service.createRewardLedgerEntries({
            reward_account_id: account.id,
            entry_type: "reverse",
            points: -Number(original.points),
            status: "available",
            rule_id: original.rule_id,
            source_type: "referral_refund",
            source_id: input.reversal_source_id,
            order_id: input.order_id ?? original.order_id,
            idempotency_key: reversalKey,
            available_at: new Date(),
            expires_at: null,
            reversal_entry_id: original.id,
            admin_reason: null,
          })
        }
        reversed += Number(original.points)
      }
      if (reversed > 0) await notifyReward(container, { customerId: input.customer_id, eventKey: "reward.points_reversed", sourceId: `reverse:${input.reversal_source_id}`, points: reversed })
      return new StepResponse({ account, reversed })
    }

    if (input.operation === "adjust") {
      if (!Number.isInteger(input.points) || input.points === 0 || !input.reason.trim()) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Adjustment points and reason are required")
      }
      const entries = await service.listRewardLedgerEntries({ reward_account_id: account.id })
      if (availableBalance(entries) + input.points < 0) {
        throw new MedusaError(MedusaError.Types.CONFLICT, "Adjustment exceeds available balance")
      }
      const entry = await service.createRewardLedgerEntries({
        reward_account_id: account.id,
        entry_type: "adjustment",
        points: input.points,
        status: "available",
        rule_id: null,
        source_type: "admin_adjustment",
        source_id: input.actor_id,
        order_id: null,
        idempotency_key: input.idempotency_key,
        available_at: new Date(),
        expires_at: null,
        reversal_entry_id: null,
        admin_reason: input.reason.trim(),
      })
      await notifyReward(container, { customerId: input.customer_id, eventKey: input.points < 0 ? "reward.points_reversed" : "reward.points_earned", sourceId: entry.id, points: input.points })
      return new StepResponse({ account, ledger_entry: entry })
    }

    if (!Number.isInteger(input.points) || input.points < Number(program.minimum_redemption_points)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Minimum redemption is ${program.minimum_redemption_points} points`,
      )
    }
    if (program.maximum_redemption_points && input.points > Number(program.maximum_redemption_points)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Redemption exceeds the configured maximum")
    }
    const entries = await service.listRewardLedgerEntries({ reward_account_id: account.id })
    if (availableBalance(entries) < input.points) {
      throw new MedusaError(MedusaError.Types.CONFLICT, "Insufficient available points")
    }
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "customer_id", "currency_code", "subtotal"],
      filters: { id: input.cart_id },
      pagination: { take: 1 },
    })
    const cart = carts[0]
    if (!cart || cart.customer_id !== input.customer_id) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart was not found")
    }
    if (cart.currency_code?.toLowerCase() !== program.currency_code.toLowerCase()) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Rewards currency does not match the cart",
      )
    }
    const pesoValue = input.points * Number(program.peso_value_per_point)
    if (pesoValue > Number(cart.subtotal || 0)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Redemption value exceeds the eligible cart subtotal",
      )
    }
    const code = `RW-${createHash("sha256")
      .update(`${input.customer_id}:${input.idempotency_key}`)
      .digest("hex")
      .slice(0, 16)
      .toUpperCase()}`
    let promotionId: string | null = null
    try {
      const { result: promotions } = await createPromotionsWorkflow(container).run({
        input: {
          promotionsData: [
            {
              code,
              type: "standard",
              status: "active",
              is_automatic: false,
              limit: 1,
              application_method: {
                type: "fixed",
                target_type: "order",
                allocation: "across",
                value: pesoValue,
                currency_code: program.currency_code.toLowerCase(),
              },
              rules: [
                {
                  attribute: "customer_id",
                  operator: "eq",
                  values: [input.customer_id],
                },
              ],
            },
          ],
        },
      })
      promotionId = promotions[0].id
      await updateCartPromotionsWorkflow(container).run({
        input: {
          cart_id: input.cart_id,
          promo_codes: [code],
          action: PromotionActions.ADD,
          force_refresh_payment_collection: true,
        },
      })
      const redemption = await service.createRewardRedemptions({
        customer_id: input.customer_id,
        reward_account_id: account.id,
        points: input.points,
        peso_value: pesoValue,
        reward_type: "order_discount",
        promotion_id: promotionId,
        order_id: null,
        status: "applied",
        idempotency_key: input.idempotency_key,
        redeemed_at: new Date(),
      })
      const entry = await service.createRewardLedgerEntries({
        reward_account_id: account.id,
        entry_type: "redeem",
        points: -input.points,
        status: "available",
        rule_id: null,
        source_type: "redemption",
        source_id: redemption.id,
        order_id: null,
        idempotency_key: input.idempotency_key,
        available_at: new Date(),
        expires_at: null,
        reversal_entry_id: null,
        admin_reason: null,
      })
      await notifyReward(container, { customerId: input.customer_id, eventKey: "reward.points_redeemed", sourceId: entry.id, points: input.points })
      return new StepResponse({ account, ledger_entry: entry, redemption, code })
    } catch (error) {
      if (promotionId) {
        await updateCartPromotionsWorkflow(container).run({
          input: {
            cart_id: input.cart_id,
            promo_codes: [code],
            action: PromotionActions.REMOVE,
            force_refresh_payment_collection: true,
          },
        }).catch(() => null)
        await deletePromotionsWorkflow(container).run({
          input: { ids: [promotionId] },
        }).catch(() => null)
      }
      throw error
    }
  },
)

export const manageRewardsWorkflow = createWorkflow(
  "manage-rewards",
  function (input: RewardMutationInput) {
    const result = manageRewardsStep(input)
    return new WorkflowResponse(result)
  },
)
