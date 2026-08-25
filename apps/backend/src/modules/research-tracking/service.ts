import { MedusaService } from "@medusajs/framework/utils"

import ResearchProfile from "./models/research-profile"
import ResearchSupply from "./models/research-supply"
import TrackedMaterial from "./models/tracked-material"

class ResearchTrackingModuleService extends MedusaService({
  ResearchProfile,
  ResearchSupply,
  TrackedMaterial,
}) {}

export default ResearchTrackingModuleService
