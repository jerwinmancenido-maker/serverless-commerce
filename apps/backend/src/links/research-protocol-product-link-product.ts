import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"

import ResearchContentModule from "../modules/research-content"

export default defineLink(
  {
    linkable: ResearchContentModule.linkable.researchProtocolProductLink,
    field: "product_id",
    isList: true,
  },
  ProductModule.linkable.product,
  {
    readOnly: true,
  },
)
