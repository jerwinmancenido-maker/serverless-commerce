import { MedusaService } from "@medusajs/framework/utils"

import CalculatorMaterialProfile from "./models/calculator-material-profile"
import ResearchProtocol from "./models/research-protocol"

class ResearchContentModuleService extends MedusaService({
  CalculatorMaterialProfile,
  ResearchProtocol,
}) {}

export default ResearchContentModuleService
