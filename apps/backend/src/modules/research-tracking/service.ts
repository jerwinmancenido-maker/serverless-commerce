import type { Context } from "@medusajs/framework/types"
import {
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaService,
} from "@medusajs/framework/utils"

import ResearchConsentEvent from "./models/research-consent-event"
import ResearchPreferenceMutation from "./models/research-preference-mutation"
import ResearchPrivacyRequest from "./models/research-privacy-request"
import ResearchProfile from "./models/research-profile"
import ResearchSupply from "./models/research-supply"
import ResearchSupplyActivation from "./models/research-supply-activation"
import ResearchSupplyActivationRequest from "./models/research-supply-activation-request"
import TrackedMaterial from "./models/tracked-material"

type PurchasedResearchSupplyWrite = {
  source_order_line_item_id: string
  initial_quantity_base_units: number
  remaining_quantity_base_units: number
  base_unit: "microgram" | "microliter" | "piece"
  acquired_at: Date
  lot_number: null
  batch_number: null
  expires_at: null
  storage_note: null
  status: "active"
  tracked_material_id: string
}

type PurchasedSupplyActivationWrite = {
  profile_id: string
  tracked_material_id: string
  source_order_id: string
  source_order_line_item_id: string
  source_product_variant_id: string
  eligible_commerce_quantity: number
  material_profile_key: string
  material_profile_revision: number
  material_quantity_base_units: number
  material_base_unit: "microgram" | "microliter" | "piece"
  idempotency_key: string
  request_fingerprint_sha256: string
  activated_at: Date
  label_snapshot: string
}

type PurchasedSupplyActivationRequestWrite = {
  profile_id: string
  idempotency_key: string
  request_fingerprint_sha256: string
  accepted_at: Date
}

class ResearchTrackingModuleService extends MedusaService({
  ResearchConsentEvent,
  ResearchPreferenceMutation,
  ResearchPrivacyRequest,
  ResearchProfile,
  ResearchSupply,
  ResearchSupplyActivation,
  ResearchSupplyActivationRequest,
  TrackedMaterial,
}) {
  @InjectManager()
  @InjectTransactionManager()
  async createPurchasedSupplyActivation(
    input: {
      supply: PurchasedResearchSupplyWrite
      activation: PurchasedSupplyActivationWrite
      request: PurchasedSupplyActivationRequestWrite
    },
    @MedusaContext() sharedContext: Context = {},
  ) {
    const supply = await this.createResearchSupplies(input.supply, sharedContext)
    const activation = await this.createResearchSupplyActivations(
      {
        ...input.activation,
        supply_id: supply.id,
      },
      sharedContext,
    )
    const request = await this.createResearchSupplyActivationRequests(
      {
        ...input.request,
        activation_id: activation.id,
      },
      sharedContext,
    )

    return { supply, activation, request }
  }

  @InjectManager()
  @InjectTransactionManager()
  async deletePurchasedSupplyActivation(
    input: {
      requestId: string
      activationId: string
      supplyId: string
    },
    @MedusaContext() sharedContext: Context = {},
  ): Promise<void> {
    await this.deleteResearchSupplyActivationRequests(
      input.requestId,
      sharedContext,
    )
    await this.deleteResearchSupplyActivations(
      input.activationId,
      sharedContext,
    )
    await this.deleteResearchSupplies(input.supplyId, sharedContext)
  }
}

export default ResearchTrackingModuleService
