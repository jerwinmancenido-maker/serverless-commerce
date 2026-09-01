import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { awardRewardEventSafely } from "../../../../../../../workflows/award-reward-event"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "addresses.id"],
    filters: { id: req.auth_context.actor_id },
  })
  const addressId = customers[0]?.addresses?.[0]?.id

  if (!addressId) {
    return res.status(409).json({
      type: "not_allowed",
      message: "Add an address before completing this achievement.",
    })
  }

  const result = await awardRewardEventSafely(req.scope, {
    customer_id: req.auth_context.actor_id,
    event_type: "first_address",
    source_type: "first_address",
    source_id: addressId,
    idempotency_key: `first-address:${req.auth_context.actor_id}`,
  })

  res.json({ awarded: Boolean(result) })
}
