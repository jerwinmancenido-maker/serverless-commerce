import { createHash } from "node:crypto"

import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { REWARDS_MODULE } from "../modules/rewards"
import type RewardsModuleService from "../modules/rewards/service"
import { emitCustomerNotificationWorkflow } from "../workflows/manage-customer-notifications"

export default async function notifyExpiringRewardPoints(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<RewardsModuleService>(REWARDS_MODULE)
  const now = new Date()
  const warningDays = Math.max(1, Number(process.env.REWARD_EXPIRY_WARNING_DAYS || 30))
  const warningEnd = new Date(now.getTime() + warningDays * 86_400_000)

  try {
    const entries = await service.listRewardLedgerEntries({
      entry_type: "earn",
      status: "available",
      expires_at: { $gte: now, $lte: warningEnd },
    }, { take: 10_000 })
    const entriesByAccount = new Map<string, typeof entries>()
    for (const entry of entries) {
      const accountEntries = entriesByAccount.get(entry.reward_account_id) || []
      accountEntries.push(entry)
      entriesByAccount.set(entry.reward_account_id, accountEntries)
    }
    const accounts = entriesByAccount.size
      ? await service.listRewardAccounts({ id: [...entriesByAccount.keys()], status: "active" })
      : []
    for (const account of accounts) {
      const expiring = entriesByAccount.get(account.id) || []
      if (!expiring.length) continue
      const earliest = expiring.reduce((value, entry) => {
        const date = new Date(entry.expires_at!)
        return date < value ? date : value
      }, new Date(expiring[0].expires_at!))
      const points = expiring.reduce((total, entry) => total + Number(entry.points), 0)
      const fingerprint = createHash("sha256").update(expiring.map((entry) => entry.id).sort().join(":" )).digest("hex")
      await emitCustomerNotificationWorkflow(container).run({ input: {
        customer_id: account.customer_id,
        event_key: "reward.points_expiring",
        source_id: `expiry-warning:${fingerprint}`,
        variables: {
          points,
          date: earliest.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }),
        },
        target_kind: "rewards",
        target_id: null,
        metadata: {},
      } })
    }
  } catch (error) {
    logger.error(`Reward expiry notification job failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export const config = {
  name: "notify-expiring-reward-points",
  schedule: "15 8 * * *",
}
