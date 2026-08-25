import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import PepstackBomModule from "../modules/bom"

export default defineLink(
  {
    linkable: PepstackBomModule.linkable.recipeAuditSnapshot,
    field: "variant_id",
    isList: true,
  },
  ProductModule.linkable.productVariant,
  {
    readOnly: true,
  },
)
