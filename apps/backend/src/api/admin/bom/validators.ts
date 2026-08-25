import { z } from "@medusajs/framework/zod"

import { BOM_BASE_UNITS } from "../../../modules/bom/contracts/inventory-kit"

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
  category: z.string().trim().min(1),
  lot_tracking_required: z.boolean(),
  expiry_tracking_required: z.boolean(),
})

export type AdminSetComponentProfileType = z.infer<
  typeof AdminSetComponentProfile
>
