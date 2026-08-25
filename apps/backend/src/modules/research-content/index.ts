import { Module } from "@medusajs/framework/utils"

import ResearchContentModuleService from "./service"

export const RESEARCH_CONTENT_MODULE = "researchContent"

export default Module(RESEARCH_CONTENT_MODULE, {
  service: ResearchContentModuleService,
})
