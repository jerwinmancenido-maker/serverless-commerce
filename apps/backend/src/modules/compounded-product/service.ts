import { MedusaService } from "@medusajs/framework/utils"

import PresentationConfiguration from "./models/presentation-configuration"
import PresentationConfigurationRevision from "./models/presentation-configuration-revision"

class CompoundedProductModuleService extends MedusaService({
  PresentationConfiguration,
  PresentationConfigurationRevision,
}) {}

export default CompoundedProductModuleService
