import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import {
  assertCompoundedProductClassificationDecision,
  resolveCompoundedProductClassificationImpact,
} from "../../modules/compounded-product/classification-impact"
import {
  AdminChangeCompoundedProductClassification,
  type AdminChangeCompoundedProductClassification as ClassificationRequest,
} from "../../modules/compounded-product/contracts/classification"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

export type ChangeCompoundedProductClassificationWorkflowInput =
  ClassificationRequest & {
    productId: string
    actorId: string
  }

type RegistrationClassificationStepOutput = {
  action: "reclassify" | "remove_governance"
  registration: Record<string, unknown> | null
}

type RegistrationClassificationStepCompensation = {
  action: "reclassify" | "remove_governance"
  registrationId: string
  previousProductTypeId: string | null
  previousActorId: string
}

export const prepareCompoundedProductClassificationChangeStep = createStep(
  "prepare-compounded-product-classification-change",
  async (
    rawInput: ChangeCompoundedProductClassificationWorkflowInput,
    { container },
  ) => {
    const request = AdminChangeCompoundedProductClassification.parse({
      action: rawInput.action,
      target_product_type_id: rawInput.target_product_type_id,
      impact_fingerprint: rawInput.impact_fingerprint,
      reason: rawInput.reason,
    })
    const actorId = rawInput.actorId?.trim()

    if (!actorId) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Authenticated Admin actor is required",
      )
    }

    const impact = await resolveCompoundedProductClassificationImpact(
      container,
      {
        productId: rawInput.productId,
        action: request.action,
        target_product_type_id: request.target_product_type_id,
      },
    )
    assertCompoundedProductClassificationDecision({
      expectedFingerprint: request.impact_fingerprint,
      impact,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const registration = await service.retrieveGovernedProductRegistration(
      impact.registration_id,
    )

    return new StepResponse({
      ...request,
      productId: rawInput.productId,
      actorId,
      impact,
      registration,
    })
  },
)

export const updateCompoundedProductRegistrationClassificationStep = createStep(
  "update-compounded-product-registration-classification",
  async (
    input: {
      action: "reclassify" | "remove_governance"
      target_product_type_id: string
      actorId: string
      registration: {
        id: string
        governed_product_type_id: string | null
        updated_by_actor_id: string
      }
    },
    { container },
  ): Promise<
    StepResponse<
      RegistrationClassificationStepOutput,
      RegistrationClassificationStepCompensation
    >
  > => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )

    if (input.action === "remove_governance") {
      await service.softDeleteGovernedProductRegistrations([
        input.registration.id,
      ])
      return new StepResponse(
        { action: input.action, registration: null },
        {
          action: input.action,
          registrationId: input.registration.id,
          previousProductTypeId: input.registration.governed_product_type_id,
          previousActorId: input.registration.updated_by_actor_id,
        },
      )
    }

    const updated = await service.updateGovernedProductRegistrations({
      id: input.registration.id,
      governed_product_type_id: input.target_product_type_id,
      updated_by_actor_id: input.actorId,
    })
    return new StepResponse(
      { action: input.action, registration: updated },
      {
        action: input.action,
        registrationId: input.registration.id,
        previousProductTypeId: input.registration.governed_product_type_id,
        previousActorId: input.registration.updated_by_actor_id,
      },
    )
  },
  async (previous, { container }) => {
    if (!previous) return
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )

    if (previous.action === "remove_governance") {
      await service.restoreGovernedProductRegistrations([
        previous.registrationId,
      ])
      return
    }

    await service.updateGovernedProductRegistrations({
      id: previous.registrationId,
      governed_product_type_id: previous.previousProductTypeId,
      updated_by_actor_id: previous.previousActorId,
    })
  },
)
