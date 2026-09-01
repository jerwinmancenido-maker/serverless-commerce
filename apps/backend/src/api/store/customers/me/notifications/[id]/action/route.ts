import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { StoreMutateCustomerNotification } from "../../../../../../../modules/customer-notifications/contracts"
import { projectCustomerNotification } from "../../../../../../../modules/customer-notifications/projection"
import { mutateCustomerNotificationWorkflow } from "../../../../../../../workflows/manage-customer-notifications"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreMutateCustomerNotification>,
  res: MedusaResponse,
) {
  res.setHeader("Cache-Control", "private, no-store")
  const { result } = await mutateCustomerNotificationWorkflow(req.scope).run({
    input: {
      customer_id: req.auth_context.actor_id,
      notification_id: req.params.id,
      mutation: req.validatedBody,
    },
  })
  res.json({ notification: projectCustomerNotification(result) })
}
