import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { backfillLegacyCustomerNotificationsWorkflow } from "../workflows/manage-customer-notifications"

export default async function backfillCustomerNotifications({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const { result } = await backfillLegacyCustomerNotificationsWorkflow(container).run()
  logger.info(`Customer Notification Center backfill compared ${result.legacy_count} legacy rows and created ${result.created_count} customer-scoped rows.`)
}
