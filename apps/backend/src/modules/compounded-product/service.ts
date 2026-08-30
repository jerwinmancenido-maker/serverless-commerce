import { MedusaError, MedusaService } from "@medusajs/framework/utils"

import PresentationConfiguration from "./models/presentation-configuration"
import PresentationConfigurationRevision from "./models/presentation-configuration-revision"
import ProductCreationRequest from "./models/product-creation-request"
import GovernedProductRegistration from "./models/governed-product-registration"
import GovernanceAuditEvent from "./models/governance-audit-event"
import GovernedProductTypeMapping from "./models/governed-product-type-mapping"
import CompoundFamily from "./models/compound-family"
import CompoundProductFormat from "./models/compound-product-format"

class CompoundedProductModuleService extends MedusaService({
  PresentationConfiguration,
  PresentationConfigurationRevision,
  ProductCreationRequest,
  GovernedProductRegistration,
  GovernanceAuditEvent,
  GovernedProductTypeMapping,
  CompoundFamily,
  CompoundProductFormat,
}) {
  override updateGovernanceAuditEvents = async (
    ..._updates: unknown[]
  ): Promise<never> => {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Governance audit events are immutable",
    )
  }

  override deleteGovernanceAuditEvents = async (
    ..._ids: unknown[]
  ): Promise<never> => {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Governance audit events cannot be deleted",
    )
  }
}

export default CompoundedProductModuleService
