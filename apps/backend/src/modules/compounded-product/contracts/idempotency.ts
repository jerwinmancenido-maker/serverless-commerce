import { z } from "@medusajs/framework/zod"

export const COMPOUNDED_PRODUCT_IDEMPOTENCY_OPERATIONS = [
  "create_product",
] as const

export const COMPOUNDED_PRODUCT_IDEMPOTENCY_STATUSES = [
  "in_progress",
  "succeeded",
  "failed",
] as const

export const CompoundedProductIdempotencyKey = z
  .string()
  .trim()
  .min(8)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/)

export const CompoundedProductPayloadFingerprint = z
  .string()
  .length(64)
  .regex(/^[a-f0-9]{64}$/)

export const CompoundedProductIdempotencyClaim = z.strictObject({
  operation: z.enum(COMPOUNDED_PRODUCT_IDEMPOTENCY_OPERATIONS),
  idempotency_key: CompoundedProductIdempotencyKey,
  request_fingerprint_sha256: CompoundedProductPayloadFingerprint,
  actor_id: z.string().trim().min(1).max(255),
})

export type CompoundedProductIdempotencyOperation =
  (typeof COMPOUNDED_PRODUCT_IDEMPOTENCY_OPERATIONS)[number]

export type CompoundedProductIdempotencyStatus =
  (typeof COMPOUNDED_PRODUCT_IDEMPOTENCY_STATUSES)[number]

export type CompoundedProductIdempotencyClaim = z.infer<
  typeof CompoundedProductIdempotencyClaim
>
