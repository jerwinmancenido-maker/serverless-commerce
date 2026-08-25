import { z } from "@medusajs/framework/zod"

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
  .refine((value) => value.timezone !== undefined || value.locale !== undefined, {
    message: "timezone or locale is required",
  })

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
