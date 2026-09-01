import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { StoreBulkCustomerNotificationAction } from "../../../../../../modules/customer-notifications/contracts"
import { bulkMutateCustomerNotificationsWorkflow } from "../../../../../../workflows/manage-customer-notifications"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreBulkCustomerNotificationAction>,
  res: MedusaResponse,
) {
  res.setHeader("Cache-Control", "private, no-store")
  const { result } = await bulkMutateCustomerNotificationsWorkflow(req.scope).run({
    input: { customer_id: req.auth_context.actor_id, mutation: req.validatedBody },
  })
  res.json(result)
}
