import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import {
  AdminTransitionCompoundedProductPresentation,
  type AdminTransitionCompoundedProductPresentation as AdminTransitionCompoundedProductPresentationInput,
  type CompoundedProductConfigurationStatus,
  type CompoundedProductRevisionStatus,
} from "../../modules/compounded-product/contracts/configuration"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

export type TransitionCompoundedProductPresentationWorkflowInput =
  AdminTransitionCompoundedProductPresentationInput & {
    presentationId: string
    actorId: string
  }

type RevisionRestore = {
  id: string
  status: CompoundedProductRevisionStatus
  reason: string | null
  activated_at: Date | null
  superseded_at: Date | null
  blocked_at: Date | null
  archived_at: Date | null
}

export const prepareCompoundedProductPresentationTransitionStep = createStep(
  "prepare-compounded-product-presentation-transition",
  async (input: TransitionCompoundedProductPresentationWorkflowInput, { container }) => {
    const parsed = AdminTransitionCompoundedProductPresentation.parse({
      expected_current_revision_id: input.expected_current_revision_id,
      target_status: input.target_status,
      reason: input.reason,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [presentation] = await service.listPresentationConfigurations(
      { id: input.presentationId },
      { take: 1 },
    )

    if (!presentation) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Presentation configuration was not found",
      )
    }

    if (presentation.current_revision_id !== parsed.expected_current_revision_id) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "Presentation configuration changed; reload before changing status",
      )
    }

    const [currentRevision] =
      await service.listPresentationConfigurationRevisions(
        { id: parsed.expected_current_revision_id },
        { take: 1 },
      )

    if (!currentRevision) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Current presentation revision was not found",
      )
    }

    const previousActive =
      parsed.target_status === "active"
        ? (
            await service.listPresentationConfigurationRevisions(
              {
                presentation_id: input.presentationId,
                status: "active",
              },
              { take: 1 },
            )
          )[0]
        : undefined

    if (presentation.status === "archived" && parsed.target_status !== "archived") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Archived presentation configurations cannot be reactivated",
      )
    }

    return new StepResponse({
      ...parsed,
      presentationId: input.presentationId,
      actorId: input.actorId,
      previousPresentationStatus: presentation.status,
      currentRevision,
      previousActive:
        previousActive && previousActive.id !== currentRevision.id
          ? previousActive
          : null,
    })
  },
)

export const transitionCompoundedProductRevisionStep = createStep(
  "transition-compounded-product-revision",
  async (
    input: {
      presentationId: string
      target_status: "active" | "inactive" | "blocked" | "archived"
      reason: string
      currentRevision: RevisionRestore
    },
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const now = new Date()
    const revisionStatus: CompoundedProductRevisionStatus =
      input.target_status === "inactive"
        ? input.currentRevision.status
        : input.target_status
    const revision = await service.updatePresentationConfigurationRevisions({
      id: input.currentRevision.id,
      status: revisionStatus,
      reason: input.reason,
      activated_at: input.target_status === "active" ? now : input.currentRevision.activated_at,
      blocked_at: input.target_status === "blocked" ? now : input.currentRevision.blocked_at,
      archived_at: input.target_status === "archived" ? now : input.currentRevision.archived_at,
    })

    return new StepResponse(revision, input.currentRevision)
  },
  async (
    compensation: RevisionRestore | undefined,
    { container },
  ) => {
    if (!compensation) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.updatePresentationConfigurationRevisions(compensation)
  },
)

export const supersedePreviousCompoundedProductRevisionStep = createStep(
  "supersede-previous-compounded-product-revision",
  async (
    input: { previousActive: RevisionRestore | null; target_status: string },
    { container },
  ) => {
    if (!input.previousActive || input.target_status !== "active") {
      return new StepResponse(null, null)
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const updated = await service.updatePresentationConfigurationRevisions({
      id: input.previousActive.id,
      status: "superseded",
      superseded_at: new Date(),
    })

    return new StepResponse(updated, input.previousActive)
  },
  async (compensation: RevisionRestore | null | undefined, { container }) => {
    if (!compensation) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.updatePresentationConfigurationRevisions(compensation)
  },
)

export const transitionCompoundedProductPresentationRecordStep = createStep(
  "transition-compounded-product-presentation-record",
  async (
    input: {
      presentationId: string
      target_status: CompoundedProductConfigurationStatus
      previousPresentationStatus: CompoundedProductConfigurationStatus
    },
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const presentation = await service.updatePresentationConfigurations({
      id: input.presentationId,
      status: input.target_status,
    })

    return new StepResponse(presentation, {
      presentationId: input.presentationId,
      previousStatus: input.previousPresentationStatus,
    })
  },
  async (
    compensation:
      | {
          presentationId: string
          previousStatus: CompoundedProductConfigurationStatus
        }
      | undefined,
    { container },
  ) => {
    if (!compensation) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.updatePresentationConfigurations({
      id: compensation.presentationId,
      status: compensation.previousStatus,
    })
  },
)
