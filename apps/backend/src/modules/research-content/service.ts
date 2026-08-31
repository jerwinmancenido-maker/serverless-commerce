import { MedusaService } from "@medusajs/framework/utils"

import CalculatorMaterialProfile from "./models/calculator-material-profile"
import ResearchProtocol from "./models/research-protocol"
import ResearchProtocolAuditEvent from "./models/research-protocol-audit-event"
import ResearchProtocolComment from "./models/research-protocol-comment"
import ResearchProtocolProductLink from "./models/research-protocol-product-link"
import ResearchProtocolOrderAccess from "./models/research-protocol-order-access"
import ResearchProtocolSeries from "./models/research-protocol-series"
import ResearchProtocolVariantTarget from "./models/research-protocol-variant-target"

class ResearchContentModuleService extends MedusaService({
  CalculatorMaterialProfile,
  ResearchProtocol,
  ResearchProtocolAuditEvent,
  ResearchProtocolComment,
  ResearchProtocolProductLink,
  ResearchProtocolOrderAccess,
  ResearchProtocolSeries,
  ResearchProtocolVariantTarget,
}) {}

export default ResearchContentModuleService
