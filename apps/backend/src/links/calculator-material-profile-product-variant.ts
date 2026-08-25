import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import ResearchContentModule from "../modules/research-content"

export default defineLink(
  {
    linkable: ResearchContentModule.linkable.calculatorMaterialProfile,
    field: "product_variant_id",
    isList: true,
  },
  ProductModule.linkable.productVariant,
  {
    readOnly: true,
  },
)
