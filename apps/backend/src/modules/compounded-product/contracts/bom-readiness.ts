import { z } from "@medusajs/framework/zod"

import { RESEARCH_NORMALIZED_POSITIVE_DECIMAL_PATTERN } from "../../../lib/research-quantity"

const RecipeComponent = z.strictObject({
  inventory_item_id: z.string().trim().min(1).max(255),
  required_display_amount: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(RESEARCH_NORMALIZED_POSITIVE_DECIMAL_PATTERN)
    .refine((value) => /[1-9]/.test(value), {
      message: "Required amount must be greater than zero",
    }),
})

export const AdminSetCompoundedProductVariantRecipe = z.strictObject({
  components: z.array(RecipeComponent).min(1).max(100),
  note: z.string().trim().min(1).max(1_000).nullable().default(null),
})

export type AdminSetCompoundedProductVariantRecipe = z.infer<
  typeof AdminSetCompoundedProductVariantRecipe
>
