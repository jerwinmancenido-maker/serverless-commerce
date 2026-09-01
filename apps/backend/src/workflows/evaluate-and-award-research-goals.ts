import type { MedusaContainer } from "@medusajs/framework/types"

import { evaluateResearchPersonalGoalsWorkflow } from "./manage-research-personal-goals"
import { awardRewardEventSafely } from "./award-reward-event"
import { emitCustomerNotificationWorkflow } from "./manage-customer-notifications"

export async function evaluateAndAwardResearchGoals(
  container: MedusaContainer,
  input: { customerId: string; today: string },
) {
  const { result } = await evaluateResearchPersonalGoalsWorkflow(container).run({ input })
  for (const goalId of result.completed) {
    await emitCustomerNotificationWorkflow(container).run({
      input: {
        customer_id: input.customerId,
        event_key: "research.goal_completed",
        source_id: goalId,
        variables: { goal_title: "your personal goal" },
        target_kind: "research_hub_section",
        target_id: "progress",
        secondary_target_id: goalId,
        metadata: {},
      },
    })
    await awardRewardEventSafely(container, {
      customer_id: input.customerId,
      event_type: "personal_goal_completed",
      source_type: "personal_goal",
      source_id: goalId,
      idempotency_key: `personal-goal-completed:${goalId}`,
    })
  }
  return result
}
