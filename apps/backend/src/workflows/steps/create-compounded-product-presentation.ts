import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import { PEPSTACK_BOM_MODULE } from "../../modules/bom"
import type PepstackBomModuleService from "../../modules/bom/service"
import { fingerprintCompoundedProductConfiguration } from "../../modules/compounded-product/configuration-fingerprint"
import {
  AdminCreateCompoundedProductPresentation,
  type AdminCreateCompoundedProductPresentation as AdminCreateCompoundedProductPresentationInput,
} from "../../modules/compounded-product/contracts/configuration"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"
import { validateAndNormalizeCompoundedProductRecipeRules } from "../../modules/compounded-product/recipe-rules"

export type CreateCompoundedProductPresentationWorkflowInput =
  AdminCreateCompoundedProductPresentationInput & {
    actorId: string
  }

export const validateCompoundedProductPresentationStep = createStep(
  "validate-compounded-product-presentation",
  async (
    input: CreateCompoundedProductPresentationWorkflowInput,
    { container },
  ) => {
    const parsed = AdminCreateCompoundedProductPresentation.parse({
      key: input.key,
      snapshot: input.snapshot,
    })
    const inventoryItemIds = Array.from(
      new Set(
        parsed.snapshot.recipe_rules.flatMap((rule) =>
          rule.components.map((component) => component.inventory_item_id),
        ),
      ),
    )

    if (inventoryItemIds.length) {
      const bomService = container.resolve<PepstackBomModuleService>(
        PEPSTACK_BOM_MODULE,
      )
      const profiles = await bomService.listComponentProfiles({
        inventory_item_id: inventoryItemIds,
      })

      validateAndNormalizeCompoundedProductRecipeRules({
        rules: parsed.snapshot.recipe_rules,
        profiles,
      })
    }

    return new StepResponse({ ...parsed, actorId: input.actorId })
  },
)

export const createCompoundedProductPresentationRecordStep = createStep(
  "create-compounded-product-presentation-record",
  async (
    input: CreateCompoundedProductPresentationWorkflowInput,
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [existing] = await service.listPresentationConfigurations(
      { key: input.key },
      { take: 1 },
    )

    if (existing) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        `Presentation key ${input.key} already exists`,
      )
    }

    const presentation = await service.createPresentationConfigurations({
      key: input.key,
      status: "draft",
      current_revision_id: null,
      latest_revision: 0,
    })

    return new StepResponse(presentation, presentation.id)
  },
  async (presentationId: string | undefined, { container }) => {
    if (!presentationId) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.deletePresentationConfigurations(presentationId)
  },
)

export const createCompoundedProductPresentationRevisionStep = createStep(
  "create-compounded-product-presentation-revision",
  async (
    input: {
      presentationId: string
      snapshot: AdminCreateCompoundedProductPresentationInput["snapshot"]
      actorId: string
    },
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const revision = await service.createPresentationConfigurationRevisions({
      revision: 1,
      schema_version: input.snapshot.schema_version,
      status: "draft",
      snapshot: input.snapshot,
      fingerprint: fingerprintCompoundedProductConfiguration(input.snapshot),
      reason: "Initial configuration draft",
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

export const setCompoundedProductCurrentRevisionStep = createStep(
  "set-compounded-product-current-revision",
  async (
    input: { presentationId: string; revisionId: string },
    { container },
  ) => {
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const presentation = await service.updatePresentationConfigurations({
      id: input.presentationId,
      current_revision_id: input.revisionId,
      latest_revision: 1,
    })

    return new StepResponse(presentation, input.presentationId)
  },
  async (presentationId: string | undefined, { container }) => {
    if (!presentationId) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.updatePresentationConfigurations({
      id: presentationId,
      current_revision_id: null,
      latest_revision: 0,
    })
  },
)
