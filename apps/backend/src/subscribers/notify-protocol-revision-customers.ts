import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  emitProtocolRevisionNotificationsInBatches,
  type ProtocolRevisionNotificationEvent,
} from "../workflows/steps/emit-protocol-notifications"

export default async function notifyProtocolRevisionCustomers({
  event: { data },
  container,
}: SubscriberArgs<ProtocolRevisionNotificationEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const result = await emitProtocolRevisionNotificationsInBatches(
      container,
      data,
    )
    logger.info(
      `Protocol notification fan-out processed ${result.notified_count} customers in ${result.batch_count} access batches.`,
    )
  } catch (error) {
    logger.error(
      `Protocol notification fan-out failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }
}

export const config: SubscriberConfig = {
  event: "customer-notifications.protocol-revision",
}
