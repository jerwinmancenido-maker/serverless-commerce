import {
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
  type MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import multer from "multer"

import { JOURNAL_ATTACHMENT_MAX_BYTES } from "../../../../../workflows/steps/manage-research-journal-attachment"

import {
  StoreCancelResearchDeletion,
  StoreActivatePurchasedSupply,
  StoreCloseResearchProfile,
  StoreCreateResearchProfile,
  StoreRecordResearchConsent,
  StoreRecordResearchJournalConsent,
  StoreRequestResearchDeletion,
  StoreUpdateResearchPreferences,
  StoreListPurchasedSupplies,
  StoreCreateResearchRoutine,
  StoreStartProtocolRoutine,
  StoreCreateResearchMeasurement,
  StoreReviseResearchMeasurement,
  StoreTransitionResearchMeasurement,
  StoreListResearchMeasurements,
  StoreAdjustResearchOccurrence,
  StoreListResearchOccurrences,
  StoreTransitionResearchRoutine,
  StoreUpdateResearchRoutine,
  StoreConfirmResearchRoutineLog,
  StorePreviewResearchRoutineLog,
  StorePreviewResearchRoutineLogMutation,
  StoreRestoreResearchRoutineLog,
  StoreReviseResearchRoutineLog,
  StoreVoidResearchRoutineLog,
  StoreCreateResearchJournalEntry,
  StoreListResearchJournalEntries,
  StoreReviseResearchJournalEntry,
  StoreTransitionResearchJournalEntry,
  StoreMutateResearchNotification,
  StoreUpdateResearchReminderPreferences,
  StoreCreateCalculationSnapshot,
  StoreMutateCalculationSnapshot,
  StoreCreatePersonalGoal,
  StoreMutatePersonalGoal,
  StoreMutateResearchReplenishment,
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

const journalAttachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: JOURNAL_ATTACHMENT_MAX_BYTES,
  },
})

export const storeResearchTrackingMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/customers/me/research-tracking*",
    middlewares: [setResearchTrackingPrivateCache],
  },
  {
    matcher:
      "/store/customers/me/research-tracking/journal/:id/attachments",
    method: "POST",
    middlewares: [journalAttachmentUpload.single("attachment")],
  },
  {
    matcher:
      "/store/customers/me/research-tracking/replenishment/:id/action",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreMutateResearchReplenishment)],
  },
  {
    matcher: "/store/customers/me/research-tracking/goals",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreCreatePersonalGoal)],
  },
  {
    matcher: "/store/customers/me/research-tracking/goals/:id/action",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreMutatePersonalGoal)],
  },
  {
    matcher: "/store/customers/me/research-tracking/calculations",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreCreateCalculationSnapshot)],
  },
  {
    matcher: "/store/customers/me/research-tracking/calculations/:id/action",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreMutateCalculationSnapshot)],
  },
  {
    matcher: "/store/customers/me/research-tracking/reminders/preferences",
    method: "POST",
    middlewares: [
      validateAndTransformBody(StoreUpdateResearchReminderPreferences),
    ],
  },
  {
    matcher: "/store/customers/me/research-tracking/notifications/:id/action",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreMutateResearchNotification)],
  },
  {
    matcher: "/store/customers/me/research-tracking/journal",
    method: "GET",
    middlewares: [
      validateAndTransformQuery(StoreListResearchJournalEntries, {}),
    ],
  },
  {
    matcher: "/store/customers/me/research-tracking/journal",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreCreateResearchJournalEntry)],
  },
  {
    matcher: "/store/customers/me/research-tracking/journal/:id/revise",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreReviseResearchJournalEntry)],
  },
  {
    matcher: "/store/customers/me/research-tracking/journal/:id/void",
    method: "POST",
    middlewares: [
      validateAndTransformBody(StoreTransitionResearchJournalEntry),
    ],
  },
  {
    matcher: "/store/customers/me/research-tracking/journal/:id/restore",
    method: "POST",
    middlewares: [
      validateAndTransformBody(StoreTransitionResearchJournalEntry),
    ],
  },
  {
    matcher: "/store/customers/me/research-tracking/routines",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreCreateResearchRoutine)],
  },
  {
    matcher:
      "/store/customers/me/research-tracking/protocols/:id/start-routine",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreStartProtocolRoutine)],
  },
  {
    matcher: "/store/customers/me/research-tracking/measurements",
    method: "GET",
    middlewares: [validateAndTransformQuery(StoreListResearchMeasurements, {})],
  },
  {
    matcher: "/store/customers/me/research-tracking/measurements",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreCreateResearchMeasurement)],
  },
  {
    matcher: "/store/customers/me/research-tracking/measurements/summary",
    method: "GET",
    middlewares: [validateAndTransformQuery(StoreListResearchMeasurements, {})],
  },
  {
    matcher: "/store/customers/me/research-tracking/measurements/chart",
    method: "GET",
    middlewares: [validateAndTransformQuery(StoreListResearchMeasurements, {})],
  },
  {
    matcher: "/store/customers/me/research-tracking/measurements/:id/revise",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreReviseResearchMeasurement)],
  },
  {
    matcher: "/store/customers/me/research-tracking/measurements/:id/void",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreTransitionResearchMeasurement)],
  },
  {
    matcher: "/store/customers/me/research-tracking/measurements/:id/restore",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreTransitionResearchMeasurement)],
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
    matcher: "/store/customers/me/research-tracking/occurrences/:id/adjust",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreAdjustResearchOccurrence)],
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
    matcher:
      "/store/customers/me/research-tracking/private-records/consents",
    method: "POST",
    middlewares: [
      validateAndTransformBody(StoreRecordResearchJournalConsent),
    ],
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
