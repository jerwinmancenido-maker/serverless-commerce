import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { CUSTOMER_SUPPORT_MODULE } from "../../modules/customer-support"
import {
  AdminUpsertSupportSavedResponse,
  type AdminUpsertSupportSavedResponse as SavedResponseInput,
} from "../../modules/customer-support/contracts"
import type CustomerSupportModuleService from "../../modules/customer-support/service"

export type ManageSupportSavedResponseInput = {
  id?: string
  operation: "create" | "update" | "delete"
  actor_id: string
  value?: SavedResponseInput
}

export const manageSupportSavedResponseStep = createStep(
  "manage-support-saved-response",
  async (
    input: ManageSupportSavedResponseInput,
    { container },
  ): Promise<StepResponse<any, any>> => {
    const service = container.resolve<CustomerSupportModuleService>(
      CUSTOMER_SUPPORT_MODULE,
    )
    if (input.operation === "create") {
      const value = AdminUpsertSupportSavedResponse.parse(input.value)
      const response = await service.createSupportSavedResponses({
        ...value,
        created_by_actor_id: input.actor_id,
        updated_by_actor_id: input.actor_id,
      })
      return new StepResponse(response, {
        operation: "create",
        id: response.id,
      })
    }
    if (!input.id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Saved response ID is required",
      )
    }
    const [existing] = await service.listSupportSavedResponses(
      { id: input.id },
      { take: 1 },
    )
    if (!existing) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Saved response was not found",
      )
    }
    const prior = {
      id: existing.id,
      title: existing.title,
      body: existing.body,
      category: existing.category,
      active: existing.active,
      sort_order: existing.sort_order,
      updated_by_actor_id: existing.updated_by_actor_id,
    }
    if (input.operation === "delete") {
      await service.softDeleteSupportSavedResponses(existing.id)
      return new StepResponse({ id: existing.id }, {
        operation: "delete",
        prior,
      })
    }
    const value = AdminUpsertSupportSavedResponse.parse(input.value)
    const response = await service.updateSupportSavedResponses({
      id: existing.id,
      ...value,
      updated_by_actor_id: input.actor_id,
    })
    return new StepResponse(response, { operation: "update", prior })
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<CustomerSupportModuleService>(
      CUSTOMER_SUPPORT_MODULE,
    )
    if (data.operation === "create") {
      await service.deleteSupportSavedResponses(data.id)
    } else if (data.operation === "delete") {
      await service.restoreSupportSavedResponses(data.prior.id)
      await service.updateSupportSavedResponses(data.prior)
    } else {
      await service.updateSupportSavedResponses(data.prior)
    }
  },
)
