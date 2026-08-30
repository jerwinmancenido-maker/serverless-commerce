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
import { storeManualPaymentProofMiddlewares } from "./store/customers/me/orders/[id]/manual-payment-proof/middlewares"
import { storeResearchTrackingMiddlewares } from "./store/customers/me/research-tracking/middlewares"

const defaultErrorHandler = errorHandler()

export function isResearchTrackingRequest(req: MedusaRequest): boolean {
  const path = req.originalUrl.split("?", 1)[0]

  return path.startsWith("/store/customers/me/research-tracking")
}

export function privateResearchTrackingErrorHandler(
  error: unknown,
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  if (isResearchTrackingRequest(req)) {
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
    ...storeManualPaymentProofMiddlewares,
    ...storeResearchTrackingMiddlewares,
  ],
})
