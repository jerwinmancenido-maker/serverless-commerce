import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { REWARDS_MODULE } from "../modules/rewards"
import type RewardsModuleService from "../modules/rewards/service"
import { manageRewardsWorkflow } from "../workflows/manage-rewards"

export default async function configureDefaultRewards({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<RewardsModuleService>(REWARDS_MODULE)
  const existing = await service.listRewardPrograms({}, { take: 1 })
  if (existing[0]) {
    const existingRules = await service.listRewardRules({
      program_id: existing[0].id,
    })
    const eventTypes = new Set(existingRules.map((rule) => rule.event_type))
    const additions = [
      { name: "Journal activity", event_type: "journal_daily", point_value: 1, daily_cap: 1, weekly_cap: 5 },
      { name: "Weekly measurement", event_type: "measurement_weekly", point_value: 2, daily_cap: null, weekly_cap: null },
      { name: "Routine activity", event_type: "routine_activity_daily", point_value: 1, daily_cap: 1, weekly_cap: null },
      { name: "Weekly routine goal", event_type: "weekly_routine_goal", point_value: 5, daily_cap: null, weekly_cap: 5 },
    ].filter((rule) => !eventTypes.has(rule.event_type))
    if (additions.length) {
      await service.createRewardRules(
        additions.map((rule) => ({
          program_id: existing[0].id,
          name: rule.name,
          event_type: rule.event_type,
          award_type: "fixed" as const,
          point_value: rule.point_value,
          purchase_amount_per_point: null,
          eligible_product_ids: null,
          eligible_category_ids: null,
          daily_cap: rule.daily_cap,
          weekly_cap: rule.weekly_cap,
          lifetime_cap: null,
          starts_at: null,
          ends_at: null,
          status: "active" as const,
        })),
      )
    }
    logger.info("Rewards program preserved; missing default rules were added.")
    return
  }

  await manageRewardsWorkflow(container).run({
    input: {
      operation: "configure_program",
      name: "PepStack Rewards",
      status: "active",
      currency_code: "PHP",
      purchase_amount_per_point: 100,
      peso_value_per_point: 1,
      minimum_redemption_points: 100,
      maximum_redemption_points: null,
      points_expire_after_days: null,
      pending_period_days: 0,
    },
  })
  logger.info("Configured the editable default rewards program.")
}
