import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import CompoundedProductModule from "../modules/compounded-product"

export default defineLink(
  {
    linkable: CompoundedProductModule.linkable.compoundedProductTypeMapping,
    field: "product_type_id",
    isList: true,
  },
  ProductModule.linkable.productType,
  {
    readOnly: true,
  },
)
