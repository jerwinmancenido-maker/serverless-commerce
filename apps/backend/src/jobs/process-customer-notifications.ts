import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  expireCustomerNotificationsWorkflow,
  releaseScheduledCustomerNotificationsWorkflow,
} from "../workflows/manage-customer-notifications"

export default async function processCustomerNotifications(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const { result: released } = await releaseScheduledCustomerNotificationsWorkflow(container).run()
    const { result: expired } = await expireCustomerNotificationsWorkflow(container).run()
    logger.info(`Customer Notification Center released ${released.released_count} and expired ${expired.expired_count} notifications.`)
  } catch (error) {
    logger.error(`Customer Notification Center job failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export const config = {
  name: "process-customer-notifications",
  schedule: "*/5 * * * *",
}
