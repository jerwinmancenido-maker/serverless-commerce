import { z } from "@medusajs/framework/zod"

import { RESEARCH_BASE_UNITS } from "../../../../../lib/research-quantity"
import {
  RESEARCH_JOURNAL_NOTE_MAX_LENGTH,
  RESEARCH_JOURNAL_TITLE_MAX_LENGTH,
} from "../../../../../modules/research-tracking/contracts/journal"

export const StoreCreateResearchProfile = z.strictObject({
  timezone: z.string().min(1),
  locale: z.literal("en-PH"),
  consent_version: z.string().min(1),
  accepted: z.literal(true),
})

export type StoreCreateResearchProfileType = z.infer<
  typeof StoreCreateResearchProfile
>

export const StoreUpdateResearchPreferences = z
  .strictObject({
    timezone: z.string().min(1).optional(),
    locale: z.literal("en-PH").optional(),
  })
  .refine(
    (value) => value.timezone !== undefined || value.locale !== undefined,
    {
      message: "timezone or locale is required",
    },
  )

export type StoreUpdateResearchPreferencesType = z.infer<
  typeof StoreUpdateResearchPreferences
>

export const StoreRecordResearchConsent = z.strictObject({
  consent_version: z.string().min(1),
  accepted: z.literal(true),
})

export type StoreRecordResearchConsentType = z.infer<
  typeof StoreRecordResearchConsent
>

export const StoreCloseResearchProfile = z.strictObject({
  acknowledge_closure: z.literal(true),
})

export type StoreCloseResearchProfileType = z.infer<
  typeof StoreCloseResearchProfile
>

export const StoreRequestResearchDeletion = z.strictObject({
  acknowledge_deletion_request: z.literal(true),
})

export type StoreRequestResearchDeletionType = z.infer<
  typeof StoreRequestResearchDeletion
>

export const StoreCancelResearchDeletion = z.strictObject({
  acknowledge_cancellation: z.literal(true),
})

export type StoreCancelResearchDeletionType = z.infer<
  typeof StoreCancelResearchDeletion
>

export const StoreListPurchasedSupplies = z.strictObject({
  limit: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(1).max(50).default(20),
  ),
  offset: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(0).default(0),
  ),
})

export type StoreListPurchasedSuppliesType = z.infer<
  typeof StoreListPurchasedSupplies
>

export const StoreActivatePurchasedSupply = z.strictObject({
  order_id: z.string().trim().min(1),
  line_item_id: z.string().trim().min(1),
})

export type StoreActivatePurchasedSupplyType = z.infer<
  typeof StoreActivatePurchasedSupply
>

const StoreRoutineSchedule = z.strictObject({
  label: z.string().trim().min(1).max(120),
  planned_quantity_base_units: z.number().int().positive(),
  base_unit: z.enum(RESEARCH_BASE_UNITS),
  recurrence_type: z.enum(["once", "daily", "weekly"]),
  daily_interval: z.number().int().min(1).max(30).nullable().optional(),
  weekly_interval: z.number().int().min(1).max(12).nullable().optional(),
  weekdays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  local_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  effective_from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const StoreCreateResearchRoutine = StoreRoutineSchedule.extend({
  tracked_material_id: z.string().trim().min(1),
})

export type StoreCreateResearchRoutineType = z.infer<
  typeof StoreCreateResearchRoutine
>

export const StoreUpdateResearchRoutine = StoreRoutineSchedule

export type StoreUpdateResearchRoutineType = z.infer<
  typeof StoreUpdateResearchRoutine
>

export const StoreTransitionResearchRoutine = z.strictObject({
  effective_from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type StoreTransitionResearchRoutineType = z.infer<
  typeof StoreTransitionResearchRoutine
>

export const StoreListResearchOccurrences = z.strictObject({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export type StoreListResearchOccurrencesType = z.infer<
  typeof StoreListResearchOccurrences
>

export const StorePreviewResearchRoutineLog = z.strictObject({
  routine_id: z.string().trim().min(1),
  routine_revision_id: z.string().trim().min(1),
  occurrence_id: z.string().trim().min(1),
  local_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  supply_id: z.string().trim().min(1),
  confirmed_quantity_base_units: z.number().int().positive(),
  base_unit: z.enum(RESEARCH_BASE_UNITS),
})

export type StorePreviewResearchRoutineLogType = z.infer<
  typeof StorePreviewResearchRoutineLog
>

export const StoreConfirmResearchRoutineLog =
  StorePreviewResearchRoutineLog.extend({
    preview_token: z.string().trim().min(1),
  })

export type StoreConfirmResearchRoutineLogType = z.infer<
  typeof StoreConfirmResearchRoutineLog
>

export const StorePreviewResearchRoutineLogMutation = z
  .strictObject({
    operation: z.enum(["revise", "void", "restore"]),
    supply_id: z.string().trim().min(1).optional(),
    confirmed_quantity_base_units: z.number().int().positive().optional(),
    base_unit: z.enum(RESEARCH_BASE_UNITS).optional(),
  })
  .superRefine((value, context) => {
    if (value.operation === "void") {
      return
    }

    if (
      !value.supply_id ||
      value.confirmed_quantity_base_units === undefined ||
      !value.base_unit
    ) {
      context.addIssue({
        code: "custom",
        message:
          "supply_id, confirmed_quantity_base_units, and base_unit are required",
      })
    }
  })

export type StorePreviewResearchRoutineLogMutationType = z.infer<
  typeof StorePreviewResearchRoutineLogMutation
>

export const StoreReviseResearchRoutineLog = z.strictObject({
  preview_token: z.string().trim().min(1),
  supply_id: z.string().trim().min(1),
  confirmed_quantity_base_units: z.number().int().positive(),
  base_unit: z.enum(RESEARCH_BASE_UNITS),
})

export type StoreReviseResearchRoutineLogType = z.infer<
  typeof StoreReviseResearchRoutineLog
>

export const StoreVoidResearchRoutineLog = z.strictObject({
  preview_token: z.string().trim().min(1),
})

export type StoreVoidResearchRoutineLogType = z.infer<
  typeof StoreVoidResearchRoutineLog
>

export const StoreRestoreResearchRoutineLog = StoreReviseResearchRoutineLog

export type StoreRestoreResearchRoutineLogType = z.infer<
  typeof StoreRestoreResearchRoutineLog
>

export const StoreListResearchJournalEntries = z.strictObject({
  limit: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(1).max(50).default(20),
  ),
  offset: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(0).default(0),
  ),
  include_voided: z.preprocess(
    (value) => value === true || value === "true",
    z.boolean().default(true),
  ),
})

export type StoreListResearchJournalEntriesType = z.infer<
  typeof StoreListResearchJournalEntries
>

const StoreResearchJournalContent = z.strictObject({
  title: z
    .string()
    .trim()
    .max(RESEARCH_JOURNAL_TITLE_MAX_LENGTH)
    .nullable()
    .optional(),
  note: z.string().trim().min(1).max(RESEARCH_JOURNAL_NOTE_MAX_LENGTH),
  local_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  local_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  timezone: z.string().trim().min(1),
  tracked_material_id: z.string().trim().min(1).nullable().optional(),
  supply_id: z.string().trim().min(1).nullable().optional(),
  routine_id: z.string().trim().min(1).nullable().optional(),
  confirmed_log_id: z.string().trim().min(1).nullable().optional(),
  confirmed: z.literal(true),
})

export const StoreCreateResearchJournalEntry = StoreResearchJournalContent

export type StoreCreateResearchJournalEntryType = z.infer<
  typeof StoreCreateResearchJournalEntry
>

export const StoreReviseResearchJournalEntry =
  StoreResearchJournalContent.extend({
    expected_revision_id: z.string().trim().min(1),
  })

export type StoreReviseResearchJournalEntryType = z.infer<
  typeof StoreReviseResearchJournalEntry
>

export const StoreTransitionResearchJournalEntry = z.strictObject({
  expected_revision_id: z.string().trim().min(1),
  confirmed: z.literal(true),
})

export type StoreTransitionResearchJournalEntryType = z.infer<
  typeof StoreTransitionResearchJournalEntry
>
