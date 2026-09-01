import type { MedusaContainer } from "@medusajs/framework/types"

import { manageRewardsWorkflow } from "../workflows/manage-rewards"

export default async function releasePendingRewardPoints(
  container: MedusaContainer,
) {
  await manageRewardsWorkflow(container).run({
    input: { operation: "release_due" },
  })
}

export const config = {
  name: "release-pending-reward-points",
  schedule: "*/15 * * * *",
}
