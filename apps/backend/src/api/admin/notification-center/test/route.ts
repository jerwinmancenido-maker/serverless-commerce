import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { AdminSendCustomerNotificationTest } from "../../../../modules/customer-notifications/contracts"
import { emitCustomerNotificationWorkflow } from "../../../../workflows/manage-customer-notifications"

export async function POST(
  req: AuthenticatedMedusaRequest<AdminSendCustomerNotificationTest>,
  res: MedusaResponse,
) {
  const { result } = await emitCustomerNotificationWorkflow(req.scope).run({
    input: {
      customer_id: req.validatedBody.customer_id,
      event_key: "system.test",
      source_id: `${req.auth_context.actor_id}:${Date.now()}`,
      variables: {},
      target_kind: "notifications",
      target_id: null,
      secondary_target_id: null,
      metadata: { is_test: true },
      is_test: true,
    },
  })
  res.json({ notification_id: result?.id || null })
}
