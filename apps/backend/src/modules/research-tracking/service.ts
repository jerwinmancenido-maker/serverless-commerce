import { MedusaService } from "@medusajs/framework/utils"

import ResearchConsentEvent from "./models/research-consent-event"
import ResearchPrivacyRequest from "./models/research-privacy-request"
import ResearchProfile from "./models/research-profile"
import ResearchSupply from "./models/research-supply"
import TrackedMaterial from "./models/tracked-material"

class ResearchTrackingModuleService extends MedusaService({
  ResearchConsentEvent,
  ResearchPrivacyRequest,
  ResearchProfile,
  ResearchSupply,
  TrackedMaterial,
}) {}

export default ResearchTrackingModuleService
