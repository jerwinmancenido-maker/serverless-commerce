import { Module } from "@medusajs/framework/utils"

import CompoundedProductModuleService from "./service"

export const COMPOUNDED_PRODUCT_MODULE = "compoundedProduct"

export default Module(COMPOUNDED_PRODUCT_MODULE, {
  service: CompoundedProductModuleService,
})
