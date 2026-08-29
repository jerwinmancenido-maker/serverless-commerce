import type { IProductModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import {
  AdminCreateCompoundedProductClassificationMapping,
  AdminTransitionCompoundedProductClassificationMapping,
  type AdminCreateCompoundedProductClassificationMapping as CreateMappingInput,
  type AdminTransitionCompoundedProductClassificationMapping as TransitionMappingInput,
} from "../../modules/compounded-product/contracts/classification"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

export type CreateCompoundedProductClassificationMappingWorkflowInput =
  CreateMappingInput & { actorId: string }

export type TransitionCompoundedProductClassificationMappingWorkflowInput =
  TransitionMappingInput & { mappingId: string; actorId: string }

function requireActor(actorId: string) {
  if (!actorId?.trim()) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Authenticated Admin actor is required",
    )
  }
}

export const createCompoundedProductClassificationMappingStep = createStep(
  "create-compounded-product-classification-mapping",
  async (
    rawInput: CreateCompoundedProductClassificationMappingWorkflowInput,
    { container },
  ) => {
    requireActor(rawInput.actorId)
    const input = AdminCreateCompoundedProductClassificationMapping.parse({
      product_type_id: rawInput.product_type_id,
      presentation_id: rawInput.presentation_id,
      reason: rawInput.reason,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const productService = container.resolve<IProductModuleService>(
      Modules.PRODUCT,
    )
    const [presentation] = await service.listPresentationConfigurations(
      { id: input.presentation_id },
      { take: 1 },
    )

    if (!presentation || presentation.status === "archived") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A non-archived presentation configuration is required",
      )
    }

    await productService.retrieveProductType(input.product_type_id)
    const [existing] = await service.listGovernedProductTypeMappings(
      {
        product_type_id: input.product_type_id,
        presentation_id: input.presentation_id,
      },
      { take: 1 },
    )

    if (existing) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "This product type is already mapped to the presentation",
      )
    }

    const now = new Date()
    const mapping = await service.createGovernedProductTypeMappings({
      product_type_id: input.product_type_id,
      presentation_id: input.presentation_id,
      status: "active",
      reason: input.reason,
      created_by_actor_id: rawInput.actorId,
      updated_by_actor_id: rawInput.actorId,
      activated_at: now,
      deactivated_at: null,
      archived_at: null,
    })

    return new StepResponse(mapping, mapping.id)
  },
  async (mappingId: string | undefined, { container }) => {
    if (!mappingId) return

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.deleteGovernedProductTypeMappings(mappingId)
  },
)

export const transitionCompoundedProductClassificationMappingStep = createStep(
  "transition-compounded-product-classification-mapping",
  async (
    rawInput: TransitionCompoundedProductClassificationMappingWorkflowInput,
    { container },
  ) => {
    requireActor(rawInput.actorId)
    const input = AdminTransitionCompoundedProductClassificationMapping.parse({
      expected_status: rawInput.expected_status,
      target_status: rawInput.target_status,
      reason: rawInput.reason,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [mapping] = await service.listGovernedProductTypeMappings(
      { id: rawInput.mappingId },
      { take: 1 },
    )

    if (!mapping) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Governed product-type mapping was not found",
      )
    }

    if (mapping.status !== input.expected_status) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "classification_mapping_status_changed",
      )
    }

    if (mapping.status === "archived") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Archived mappings cannot be reactivated",
      )
    }

    const now = new Date()
    const updated = await service.updateGovernedProductTypeMappings({
      id: mapping.id,
      status: input.target_status,
      reason: input.reason,
      updated_by_actor_id: rawInput.actorId,
      activated_at:
        input.target_status === "active" ? now : mapping.activated_at,
      deactivated_at:
        input.target_status === "inactive" ? now : mapping.deactivated_at,
      archived_at:
        input.target_status === "archived" ? now : mapping.archived_at,
    })

    return new StepResponse(updated, mapping)
  },
  async (previous: Record<string, unknown> | undefined, { container }) => {
    if (!previous?.id) return

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.updateGovernedProductTypeMappings(previous as never)
  },
)
