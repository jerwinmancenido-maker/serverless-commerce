import { Module } from "@medusajs/framework/utils"

import ResearchTrackingModuleService from "./service"

export const RESEARCH_TRACKING_MODULE = "researchTracking"

export default Module(RESEARCH_TRACKING_MODULE, {
  service: ResearchTrackingModuleService,
})
