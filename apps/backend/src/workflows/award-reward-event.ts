import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { manageRewardsWorkflow } from "./manage-rewards"

export async function awardRewardEventSafely(
  container: MedusaContainer,
  input: {
    customer_id: string
    event_type: string
    source_type: string
    source_id: string
    idempotency_key: string
    order_id?: string | null
    eligible_amount?: number
    status?: "pending" | "available"
    pending_days?: number
  },
) {
  try {
    return await manageRewardsWorkflow(container).run({
      input: { operation: "award_event", ...input },
    })
  } catch (error) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.warn(
      `Reward event ${input.event_type} was not awarded: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    )
    return null
  }
}
