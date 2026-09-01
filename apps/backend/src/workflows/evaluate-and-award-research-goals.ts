import type { MedusaContainer } from "@medusajs/framework/types"

import { evaluateResearchPersonalGoalsWorkflow } from "./manage-research-personal-goals"
import { awardRewardEventSafely } from "./award-reward-event"

export async function evaluateAndAwardResearchGoals(
  container: MedusaContainer,
  input: { customerId: string; today: string },
) {
  const { result } = await evaluateResearchPersonalGoalsWorkflow(container).run({ input })
  for (const goalId of result.completed) {
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
