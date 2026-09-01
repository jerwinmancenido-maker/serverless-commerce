import { Module } from "@medusajs/framework/utils"
import CustomerSupportModuleService from "./service"

export const CUSTOMER_SUPPORT_MODULE = "customerSupport"
export default Module(CUSTOMER_SUPPORT_MODULE, { service: CustomerSupportModuleService })
