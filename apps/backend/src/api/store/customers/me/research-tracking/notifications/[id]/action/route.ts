import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { mutateResearchNotificationWorkflow } from "../../../../../../../../workflows/manage-research-reminders"
import type { StoreMutateResearchNotificationType } from "../../../validators"
import { setResearchPrivateNoStore } from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreMutateResearchNotificationType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const { result } = await mutateResearchNotificationWorkflow(req.scope).run({
    input: {
      customerId: req.auth_context.actor_id,
      notificationId: req.params.id,
      action: req.validatedBody.action,
      snoozedUntil: req.validatedBody.snoozed_until,
    },
  })
  res.json({ notification: result })
}
