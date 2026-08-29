import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import {
  AdminChangeCompoundedProductPublication,
  type AdminChangeCompoundedProductPublication as PublicationRequest,
} from "../../modules/compounded-product/contracts/audit"
import { resolveCompoundedProductReadiness } from "../../modules/compounded-product/resolve-product-readiness"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"
import type { CompoundedProductRegistrationState } from "../../modules/compounded-product/contracts/governance"

export type ChangeCompoundedProductPublicationWorkflowInput =
  PublicationRequest & {
    productId: string
    actorId: string
  }

export const prepareCompoundedProductPublicationChangeStep = createStep(
  "prepare-compounded-product-publication-change",
  async (rawInput: ChangeCompoundedProductPublicationWorkflowInput, { container }) => {
    const request = AdminChangeCompoundedProductPublication.parse({
      action: rawInput.action,
      reason: rawInput.reason,
    })
    const actorId = rawInput.actorId?.trim()

    if (!actorId) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Authenticated Admin actor is required",
      )
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [registration] = await service.listGovernedProductRegistrations({
      product_id: rawInput.productId,
    })

    if (!registration) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Governed compounded product ${rawInput.productId} was not found`,
      )
    }

    const readiness = await resolveCompoundedProductReadiness(
      container,
      rawInput.productId,
    )
    const accepted = request.action === "withdraw" || readiness.ready

    if (request.action === "withdraw" && registration.state !== "published") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Only a published governed product can be withdrawn",
      )
    }

    return new StepResponse({
      ...request,
      actorId,
      productId: rawInput.productId,
      registration,
      readiness,
      accepted,
    })
  },
)

export const updateCompoundedProductRegistrationPublicationStep = createStep(
  "update-compounded-product-registration-publication",
  async (
    input: {
      registration: {
        id: string
        state: CompoundedProductRegistrationState
        updated_by_actor_id: string
        published_at: Date | null
        withdrawn_at: Date | null
      }
      action: "publish" | "withdraw"
      actorId: string
    },
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const now = new Date()
    const updated = await service.updateGovernedProductRegistrations({
      id: input.registration.id,
      state: input.action === "publish" ? "published" : "withdrawn",
      updated_by_actor_id: input.actorId,
      published_at:
        input.action === "publish" ? now : input.registration.published_at,
      withdrawn_at: input.action === "withdraw" ? now : null,
    })

    return new StepResponse(updated, input.registration)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.updateGovernedProductRegistrations({
      id: previous.id,
      state: previous.state,
      updated_by_actor_id: previous.updated_by_actor_id,
      published_at: previous.published_at,
      withdrawn_at: previous.withdrawn_at,
    })
  },
)
