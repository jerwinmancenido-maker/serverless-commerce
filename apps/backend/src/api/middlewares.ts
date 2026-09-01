import {
  defineMiddlewares,
  errorHandler,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http"

import { adminBomMiddlewares } from "./admin/bom/middlewares"
import { adminCompoundedProductProductMiddlewares } from "./admin/compounded-product/products/middlewares"
import { adminCompoundedProductClassificationMiddlewares } from "./admin/compounded-product/governed-product-types/middlewares"
import { adminCompoundedProductPresentationMiddlewares } from "./admin/compounded-product/presentations/middlewares"
import { adminCompoundCatalogMiddlewares } from "./admin/compounded-product/families/middlewares"
import { adminManualPaymentProofMiddlewares } from "./admin/manual-payment-proofs/middlewares"
import { adminResearchProtocolMiddlewares } from "./admin/research-protocols/middlewares"
import { adminResearchAgreementMiddlewares } from "./admin/research-agreements/middlewares"
import { adminRewardsMiddlewares } from "./admin/rewards/middlewares"
import { adminResearchHubMiddlewares } from "./admin/research-hub/middlewares"
import { storeManualPaymentProofMiddlewares } from "./store/customers/me/orders/[id]/manual-payment-proof/middlewares"
import { storeResearchTrackingMiddlewares } from "./store/customers/me/research-tracking/middlewares"
import { storeResearchAgreementMiddlewares } from "./store/customers/me/research-agreement/middlewares"
import { storeRewardsMiddlewares } from "./store/customers/me/rewards/middlewares"
import { storeResearchProtocolCommentMiddlewares } from "./store/research-protocol-comments/middlewares"
import { storeResearchProtocolCommunityMiddlewares } from "./store/customers/me/research-protocol-community/middlewares"
import { storeResearchProtocolRecommendationMiddlewares } from "./store/research-protocols/[handle]/recommendations/middlewares"
import { storeCustomerSupportMiddlewares } from "./store/customers/me/support/middlewares"
import { adminCustomerSupportMiddlewares } from "./admin/customer-support/middlewares"
import { storeCustomerNotificationMiddlewares } from "./store/customers/me/notifications/middlewares"
import { adminCustomerNotificationMiddlewares } from "./admin/notification-center/middlewares"

const defaultErrorHandler = errorHandler()

export function isResearchTrackingRequest(req: MedusaRequest): boolean {
  const path = req.originalUrl.split("?", 1)[0]

  return path.startsWith("/store/customers/me/research-tracking")
}

export function isPrivateCustomerNotificationRequest(req: MedusaRequest): boolean {
  const path = req.originalUrl.split("?", 1)[0]
  return path.startsWith("/store/customers/me/notifications") ||
    path.startsWith("/store/customers/me/notification-preferences")
}

export function privateResearchTrackingErrorHandler(
  error: unknown,
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  if (isResearchTrackingRequest(req) || isPrivateCustomerNotificationRequest(req)) {
    res.setHeader("Cache-Control", "private, no-store")
  }

  return defaultErrorHandler(error, req, res, next)
}

export default defineMiddlewares({
  errorHandler: privateResearchTrackingErrorHandler,
  routes: [
    ...adminBomMiddlewares,
    ...adminCompoundedProductClassificationMiddlewares,
    ...adminCompoundCatalogMiddlewares,
    ...adminCompoundedProductProductMiddlewares,
    ...adminCompoundedProductPresentationMiddlewares,
    ...adminManualPaymentProofMiddlewares,
    ...adminResearchAgreementMiddlewares,
    ...adminRewardsMiddlewares,
    ...adminResearchHubMiddlewares,
    ...adminResearchProtocolMiddlewares,
    ...adminCustomerSupportMiddlewares,
    ...adminCustomerNotificationMiddlewares,
    ...storeManualPaymentProofMiddlewares,
    ...storeResearchProtocolCommentMiddlewares,
    ...storeResearchProtocolCommunityMiddlewares,
    ...storeCustomerSupportMiddlewares,
    ...storeResearchProtocolRecommendationMiddlewares,
    ...storeResearchAgreementMiddlewares,
    ...storeRewardsMiddlewares,
    ...storeResearchTrackingMiddlewares,
    ...storeCustomerNotificationMiddlewares,
  ],
})
