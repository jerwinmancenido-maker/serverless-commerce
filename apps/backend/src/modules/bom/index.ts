import { Module } from "@medusajs/framework/utils"

import PepstackBomModuleService from "./service"

export const PEPSTACK_BOM_MODULE = "pepstack_bom"

export default Module(PEPSTACK_BOM_MODULE, {
  service: PepstackBomModuleService,
})
