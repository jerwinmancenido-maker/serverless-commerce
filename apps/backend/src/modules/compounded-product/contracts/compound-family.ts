import { z } from "@medusajs/framework/zod"

export const COMPOUND_FAMILY_STATUSES = ["active", "archived"] as const

export const CompoundFamilyKey = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const CompoundFamilyName = z.string().trim().min(1).max(255)
const OptionalDescription = z
  .string()
  .trim()
  .max(2_000)
  .nullable()
  .default(null)
const RequiredId = z.string().trim().min(1).max(255)
const PaginationLimit = z.coerce.number().int().min(1).max(100).default(50)
const PaginationOffset = z.coerce.number().int().min(0).default(0)

export const AdminCreateCompoundFamily = z.strictObject({
  key: CompoundFamilyKey,
  name: CompoundFamilyName,
  description: OptionalDescription,
})

export const AdminUpdateCompoundFamily = z.strictObject({
  family_id: RequiredId,
  name: CompoundFamilyName,
  description: OptionalDescription,
})

export const AdminArchiveCompoundFamily = z.strictObject({
  family_id: RequiredId,
})

export const AdminAssignCompoundFamily = z.strictObject({
  product_id: RequiredId,
  family_id: RequiredId.nullable(),
})

export const AdminListCompoundFamilies = z.strictObject({
  status: z.enum(COMPOUND_FAMILY_STATUSES).optional(),
  limit: PaginationLimit,
  offset: PaginationOffset,
})

export const AdminUpdateCompoundFamilyBody = z.strictObject({
  name: CompoundFamilyName,
  description: OptionalDescription,
})

export const AdminAssignCompoundFamilyBody = z.strictObject({
  family_id: RequiredId.nullable(),
})

export type CompoundFamilyStatus = (typeof COMPOUND_FAMILY_STATUSES)[number]

export type AdminCreateCompoundFamily = z.infer<
  typeof AdminCreateCompoundFamily
>
export type AdminUpdateCompoundFamily = z.infer<
  typeof AdminUpdateCompoundFamily
>
export type AdminArchiveCompoundFamily = z.infer<
  typeof AdminArchiveCompoundFamily
>
export type AdminAssignCompoundFamily = z.infer<
  typeof AdminAssignCompoundFamily
>
export type AdminListCompoundFamilies = z.infer<
  typeof AdminListCompoundFamilies
>
export type AdminUpdateCompoundFamilyBody = z.infer<
  typeof AdminUpdateCompoundFamilyBody
>
export type AdminAssignCompoundFamilyBody = z.infer<
  typeof AdminAssignCompoundFamilyBody
>
