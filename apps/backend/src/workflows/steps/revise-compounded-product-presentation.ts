import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import { fingerprintCompoundedProductConfiguration } from "../../modules/compounded-product/configuration-fingerprint"
import {
  AdminCreateCompoundedProductPresentationRevision,
  type AdminCreateCompoundedProductPresentationRevision as AdminCreateCompoundedProductPresentationRevisionInput,
  type CompoundedProductConfigurationStatus,
} from "../../modules/compounded-product/contracts/configuration"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

export type ReviseCompoundedProductPresentationWorkflowInput =
  AdminCreateCompoundedProductPresentationRevisionInput & {
    presentationId: string
    actorId: string
  }

export const validateCompoundedProductPresentationRevisionStep = createStep(
  "validate-compounded-product-presentation-revision",
  async (input: ReviseCompoundedProductPresentationWorkflowInput) => {
    const parsed = AdminCreateCompoundedProductPresentationRevision.parse({
      expected_current_revision_id: input.expected_current_revision_id,
      snapshot: input.snapshot,
      reason: input.reason,
    })

    return new StepResponse({
      ...parsed,
      presentationId: input.presentationId,
      actorId: input.actorId,
    })
  },
)

export const prepareCompoundedProductPresentationRevisionStep = createStep(
  "prepare-compounded-product-presentation-revision",
  async (
    input: ReturnType<
      typeof AdminCreateCompoundedProductPresentationRevision.parse
    > & { presentationId: string; actorId: string },
    { container },
  ) => {
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

    if (
      presentation.current_revision_id !== input.expected_current_revision_id
    ) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "Presentation configuration changed; reload before saving",
      )
    }

    if (presentation.status === "archived") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Archived presentation configurations cannot be revised",
      )
    }

    return new StepResponse({
      ...input,
      nextRevision: presentation.latest_revision + 1,
      previousStatus: presentation.status,
      previousRevisionId: presentation.current_revision_id,
      previousLatestRevision: presentation.latest_revision,
    })
  },
)

export const createCompoundedProductRevisionStep = createStep(
  "create-compounded-product-revision",
  async (
    input: {
      presentationId: string
      actorId: string
      snapshot: AdminCreateCompoundedProductPresentationRevisionInput["snapshot"]
      reason: string
      nextRevision: number
    },
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const revision = await service.createPresentationConfigurationRevisions({
      revision: input.nextRevision,
      schema_version: input.snapshot.schema_version,
      status: "draft",
      snapshot: input.snapshot,
      fingerprint: fingerprintCompoundedProductConfiguration(input.snapshot),
      reason: input.reason,
      created_by_actor_id: input.actorId,
      activated_at: null,
      superseded_at: null,
      blocked_at: null,
      archived_at: null,
      presentation_id: input.presentationId,
    })

    return new StepResponse(revision, revision.id)
  },
  async (revisionId: string | undefined, { container }) => {
    if (!revisionId) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.deletePresentationConfigurationRevisions(revisionId)
  },
)

export const pointCompoundedProductPresentationToDraftStep = createStep(
  "point-compounded-product-presentation-to-draft",
  async (
    input: {
      presentationId: string
      revisionId: string
      nextRevision: number
      previousStatus: CompoundedProductConfigurationStatus
      previousRevisionId: string
      previousLatestRevision: number
    },
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const presentation = await service.updatePresentationConfigurations({
      id: input.presentationId,
      status: "draft",
      current_revision_id: input.revisionId,
      latest_revision: input.nextRevision,
    })

    return new StepResponse(presentation, {
      presentationId: input.presentationId,
      previousStatus: input.previousStatus,
      previousRevisionId: input.previousRevisionId,
      previousLatestRevision: input.previousLatestRevision,
    })
  },
  async (
    compensation:
      | {
          presentationId: string
          previousStatus: CompoundedProductConfigurationStatus
          previousRevisionId: string
          previousLatestRevision: number
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
      current_revision_id: compensation.previousRevisionId,
      latest_revision: compensation.previousLatestRevision,
    })
  },
)
