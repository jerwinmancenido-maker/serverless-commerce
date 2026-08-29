import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import CompoundedProductModule from "../modules/compounded-product"

export default defineLink(
  {
    linkable: CompoundedProductModule.linkable.compoundedProductRegistration,
    field: "product_id",
  },
  ProductModule.linkable.product,
  {
    readOnly: true,
  },
)
