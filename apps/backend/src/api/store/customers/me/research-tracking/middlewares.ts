import {
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
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
  StoreCreateResearchRoutine,
  StoreListResearchOccurrences,
  StoreTransitionResearchRoutine,
  StoreUpdateResearchRoutine,
  StoreConfirmResearchRoutineLog,
  StorePreviewResearchRoutineLog,
  StorePreviewResearchRoutineLogMutation,
  StoreRestoreResearchRoutineLog,
  StoreReviseResearchRoutineLog,
  StoreVoidResearchRoutineLog,
} from "./validators"
import { setResearchPrivateNoStore } from "./utils"

function setResearchTrackingPrivateCache(
  _req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
): void {
  setResearchPrivateNoStore(res)
  next()
}

export const storeResearchTrackingMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/customers/me/research-tracking*",
    middlewares: [setResearchTrackingPrivateCache],
  },
  {
    matcher: "/store/customers/me/research-tracking/routines",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreCreateResearchRoutine)],
  },
  {
    matcher: "/store/customers/me/research-tracking/routines/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreUpdateResearchRoutine)],
  },
  {
    matcher: "/store/customers/me/research-tracking/routines/:id/archive",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreTransitionResearchRoutine)],
  },
  {
    matcher: "/store/customers/me/research-tracking/routines/:id/resume",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreTransitionResearchRoutine)],
  },
  {
    matcher: "/store/customers/me/research-tracking/occurrences",
    method: "GET",
    middlewares: [validateAndTransformQuery(StoreListResearchOccurrences, {})],
  },
  {
    matcher: "/store/customers/me/research-tracking/logs/preview",
    method: "POST",
    middlewares: [validateAndTransformBody(StorePreviewResearchRoutineLog)],
  },
  {
    matcher: "/store/customers/me/research-tracking/logs",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreConfirmResearchRoutineLog)],
  },
  {
    matcher: "/store/customers/me/research-tracking/logs/:id/preview",
    method: "POST",
    middlewares: [
      validateAndTransformBody(StorePreviewResearchRoutineLogMutation),
    ],
  },
  {
    matcher: "/store/customers/me/research-tracking/logs/:id/revise",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreReviseResearchRoutineLog)],
  },
  {
    matcher: "/store/customers/me/research-tracking/logs/:id/void",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreVoidResearchRoutineLog)],
  },
  {
    matcher: "/store/customers/me/research-tracking/logs/:id/restore",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreRestoreResearchRoutineLog)],
  },
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
