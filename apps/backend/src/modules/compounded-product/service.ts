import { MedusaService } from "@medusajs/framework/utils"

import PresentationConfiguration from "./models/presentation-configuration"
import PresentationConfigurationRevision from "./models/presentation-configuration-revision"
import ProductCreationRequest from "./models/product-creation-request"

class CompoundedProductModuleService extends MedusaService({
  PresentationConfiguration,
  PresentationConfigurationRevision,
  ProductCreationRequest,
}) {}

export default CompoundedProductModuleService
