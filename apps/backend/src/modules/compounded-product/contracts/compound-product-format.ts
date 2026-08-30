import { z } from "@medusajs/framework/zod"

export const COMPOUND_PRODUCT_FORMAT_STATUSES = ["active", "archived"] as const

export const CompoundProductFormatKey = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const CompoundProductFormatName = z.string().trim().min(1).max(255)
const OptionalDescription = z
  .string()
  .trim()
  .max(2_000)
  .nullable()
  .default(null)
const RequiredId = z.string().trim().min(1).max(255)
const PaginationLimit = z.coerce.number().int().min(1).max(100).default(50)
const PaginationOffset = z.coerce.number().int().min(0).default(0)

export const AdminCreateCompoundProductFormat = z.strictObject({
  key: CompoundProductFormatKey,
  name: CompoundProductFormatName,
  description: OptionalDescription,
})

export const AdminUpdateCompoundProductFormat = z.strictObject({
  format_id: RequiredId,
  name: CompoundProductFormatName,
  description: OptionalDescription,
})

export const AdminArchiveCompoundProductFormat = z.strictObject({
  format_id: RequiredId,
})

export const AdminAssignCompoundProductFormat = z.strictObject({
  product_id: RequiredId,
  format_id: RequiredId.nullable(),
})

export const AdminListCompoundProductFormats = z.strictObject({
  status: z.enum(COMPOUND_PRODUCT_FORMAT_STATUSES).optional(),
  limit: PaginationLimit,
  offset: PaginationOffset,
})

export const AdminUpdateCompoundProductFormatBody = z.strictObject({
  name: CompoundProductFormatName,
  description: OptionalDescription,
})

export const AdminAssignCompoundProductFormatBody = z.strictObject({
  format_id: RequiredId.nullable(),
})

export type CompoundProductFormatStatus =
  (typeof COMPOUND_PRODUCT_FORMAT_STATUSES)[number]
export type AdminCreateCompoundProductFormat = z.infer<
  typeof AdminCreateCompoundProductFormat
>
export type AdminUpdateCompoundProductFormat = z.infer<
  typeof AdminUpdateCompoundProductFormat
>
export type AdminArchiveCompoundProductFormat = z.infer<
  typeof AdminArchiveCompoundProductFormat
>
export type AdminAssignCompoundProductFormat = z.infer<
  typeof AdminAssignCompoundProductFormat
>
export type AdminListCompoundProductFormats = z.infer<
  typeof AdminListCompoundProductFormats
>
export type AdminUpdateCompoundProductFormatBody = z.infer<
  typeof AdminUpdateCompoundProductFormatBody
>
export type AdminAssignCompoundProductFormatBody = z.infer<
  typeof AdminAssignCompoundProductFormatBody
>
