import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchTrackingCustomerConfiguration,
  getResearchTrackingPurchasedActivationConfiguration,
} from "../../../../../../../modules/research-tracking/config"
import {
  createResearchRequestFingerprint,
} from "../../../../../../../modules/research-tracking/contracts/ownership"
import { purchasedActivationConflictReason } from "../../../../../../../modules/research-tracking/contracts/purchased-supplies"
import { activatePurchasedResearchSupplyWorkflow } from "../../../../../../../workflows/activate-purchased-research-supply"
import type { StoreActivatePurchasedSupplyType } from "../../validators"
import {
  createResearchWorkflowContext,
  getResearchIdempotencyKey,
  setResearchPrivateNoStore,
} from "../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreActivatePurchasedSupplyType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const customerConfiguration = getResearchTrackingCustomerConfiguration()
  const activationConfiguration =
    getResearchTrackingPurchasedActivationConfiguration()

  if (!customerConfiguration.available || !activationConfiguration.available) {
    return res.status(503).json({
      type: "not_allowed",
      message: "Purchased-item tracking is not available",
    })
  }

  const customerId = req.auth_context.actor_id
  const idempotencyKey = getResearchIdempotencyKey(req)
  const requestFingerprintSha256 = createResearchRequestFingerprint(
    "activate-purchased-research-supply",
    [req.validatedBody.order_id, req.validatedBody.line_item_id],
  )
  try {
    const { result } = await activatePurchasedResearchSupplyWorkflow(
      req.scope,
    ).run({
      input: {
        customerId,
        orderId: req.validatedBody.order_id,
        lineItemId: req.validatedBody.line_item_id,
        activeConsentVersion: customerConfiguration.activeConsentVersion,
        eligibleSalesChannelIds: activationConfiguration.eligibleSalesChannelIds,
        idempotencyKey,
      },
      context: createResearchWorkflowContext(
        customerId,
        "purchased-supply-activate",
        idempotencyKey,
        requestFingerprintSha256,
      ),
    })

    return res.status(result.created ? 201 : 200).json({
      activation: result.activation,
    })
  } catch (error) {
    const reason = purchasedActivationConflictReason(error)

    if (!reason) {
      throw error
    }

    return res.status(409).json({
      type: "conflict",
      reason,
      message: reason,
    })
  }
}
