import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import ResearchTrackingModule from "../modules/research-tracking"

export default defineLink(
  {
    linkable: ResearchTrackingModule.linkable.trackedMaterial,
    field: "product_variant_id",
    isList: true,
  },
  ProductModule.linkable.productVariant,
  {
    readOnly: true,
  },
)
