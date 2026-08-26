import {
  type MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"

import {
  StoreCancelResearchDeletion,
  StoreActivatePurchasedSupply,
  StoreCloseResearchProfile,
  StoreCreateResearchProfile,
  StoreRecordResearchConsent,
  StoreRequestResearchDeletion,
  StoreUpdateResearchPreferences,
  StoreListPurchasedSupplies,
} from "./validators"

export const storeResearchTrackingMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/customers/me/research-tracking/purchased-items",
    method: "GET",
    middlewares: [validateAndTransformQuery(StoreListPurchasedSupplies, {})],
  },
  {
    matcher:
      "/store/customers/me/research-tracking/purchased-items/activate",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreActivatePurchasedSupply)],
  },
  {
    matcher: "/store/customers/me/research-tracking/materials",
    method: "GET",
    middlewares: [validateAndTransformQuery(StoreListPurchasedSupplies, {})],
  },
  {
    matcher: "/store/customers/me/research-tracking/profile",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreCreateResearchProfile)],
  },
  {
    matcher: "/store/customers/me/research-tracking/profile/preferences",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreUpdateResearchPreferences)],
  },
  {
    matcher: "/store/customers/me/research-tracking/profile/consents",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreRecordResearchConsent)],
  },
  {
    matcher: "/store/customers/me/research-tracking/profile/closure",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreCloseResearchProfile)],
  },
  {
    matcher:
      "/store/customers/me/research-tracking/privacy/deletion-requests",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreRequestResearchDeletion)],
  },
  {
    matcher:
      "/store/customers/me/research-tracking/privacy/deletion-requests/cancel",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreCancelResearchDeletion)],
  },
]
