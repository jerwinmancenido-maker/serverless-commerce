import { z } from "@medusajs/framework/zod"

import { BOM_BASE_UNITS } from "../../../modules/bom/contracts/inventory-kit"
import {
  BOM_COMPONENT_CLASSIFICATIONS,
  BOM_SUPPLIER_UNITS,
} from "../../../modules/bom/contracts/component-profile"

const POSTGRES_INTEGER_MAX = 2_147_483_647

export const AdminSetComponentProfile = z.strictObject({
  inventory_item_id: z.string().trim().min(1),
  base_unit: z.enum(BOM_BASE_UNITS),
  display_unit: z.string().trim().min(1),
  base_units_per_display_unit: z
    .number()
    .int()
    .positive()
    .max(POSTGRES_INTEGER_MAX),
  display_precision: z.number().int().nonnegative().max(POSTGRES_INTEGER_MAX),
  reorder_threshold_base_units: z
    .number()
    .int()
    .nonnegative()
    .max(POSTGRES_INTEGER_MAX),
  classification: z.enum(BOM_COMPONENT_CLASSIFICATIONS),
  supplier_unit: z.enum(BOM_SUPPLIER_UNITS),
  inventory_units_per_supplier_unit: z
    .number()
    .int()
    .positive()
    .max(POSTGRES_INTEGER_MAX),
  category: z.string().trim().min(1),
  lot_tracking_required: z.boolean(),
  expiry_tracking_required: z.boolean(),
})

export type AdminSetComponentProfileType = z.infer<
  typeof AdminSetComponentProfile
>

export const AdminGetBomAvailability = z.strictObject({
  variant_ids: z.string().trim().min(1),
  location_id: z.string().trim().min(1),
})

export type AdminGetBomAvailabilityType = z.infer<
  typeof AdminGetBomAvailability
>

export const AdminGetBuildableProducts = z.strictObject({
  location_id: z.string().trim().min(1),
  q: z.string().trim().max(200).optional(),
  limit: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(1).max(100).default(20),
  ),
  offset: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(0).default(0),
  ),
})

export type AdminGetBuildableProductsType = z.infer<
  typeof AdminGetBuildableProducts
>
