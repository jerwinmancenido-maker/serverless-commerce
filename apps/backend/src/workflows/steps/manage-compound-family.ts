import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import {
  AdminArchiveCompoundFamily,
  AdminAssignCompoundFamily,
  AdminCreateCompoundFamily,
  AdminUpdateCompoundFamily,
  type AdminArchiveCompoundFamily as ArchiveCompoundFamilyRequest,
  type AdminAssignCompoundFamily as AssignCompoundFamilyRequest,
  type AdminCreateCompoundFamily as CreateCompoundFamilyRequest,
  type AdminUpdateCompoundFamily as UpdateCompoundFamilyRequest,
} from "../../modules/compounded-product/contracts/compound-family"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

type ActorInput = { actorId: string }

export type CreateCompoundFamilyWorkflowInput = CreateCompoundFamilyRequest &
  ActorInput
export type UpdateCompoundFamilyWorkflowInput = UpdateCompoundFamilyRequest &
  ActorInput
export type ArchiveCompoundFamilyWorkflowInput = ArchiveCompoundFamilyRequest &
  ActorInput
export type AssignCompoundFamilyWorkflowInput = AssignCompoundFamilyRequest &
  ActorInput

function requireActor(actorId: string) {
  const normalized = actorId?.trim()

  if (!normalized) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Authenticated Admin actor is required",
    )
  }

  return normalized
}

async function retrieveFamily(
  service: CompoundedProductModuleService,
  familyId: string,
) {
  const [family] = await service.listCompoundFamilies(
    { id: familyId },
    { take: 1 },
  )

  if (!family) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Compound family was not found",
    )
  }

  return family
}

export const createCompoundFamilyStep = createStep(
  "create-compound-family",
  async (rawInput: CreateCompoundFamilyWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminCreateCompoundFamily.parse({
      key: rawInput.key,
      name: rawInput.name,
      description: rawInput.description,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [existing] = await service.listCompoundFamilies(
      { key: input.key },
      { take: 1 },
    )

    if (existing) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        `Compound family key ${input.key} already exists`,
      )
    }

    const family = await service.createCompoundFamilies({
      ...input,
      status: "active",
      created_by_actor_id: actorId,
      updated_by_actor_id: actorId,
      archived_at: null,
    })

    return new StepResponse(family, family.id)
  },
  async (familyId: string | undefined, { container }) => {
    if (!familyId) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.deleteCompoundFamilies(familyId)
  },
)

export const updateCompoundFamilyStep = createStep(
  "update-compound-family",
  async (rawInput: UpdateCompoundFamilyWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminUpdateCompoundFamily.parse({
      family_id: rawInput.family_id,
      name: rawInput.name,
      description: rawInput.description,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const previous = await retrieveFamily(service, input.family_id)

    if (previous.status !== "active") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Archived compound families cannot be edited",
      )
    }

    const family = await service.updateCompoundFamilies({
      id: previous.id,
      name: input.name,
      description: input.description,
      updated_by_actor_id: actorId,
    })

    return new StepResponse(family, {
      id: previous.id,
      name: previous.name,
      description: previous.description,
      updated_by_actor_id: previous.updated_by_actor_id,
    })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.updateCompoundFamilies(previous)
  },
)

export const archiveCompoundFamilyStep = createStep(
  "archive-compound-family",
  async (rawInput: ArchiveCompoundFamilyWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminArchiveCompoundFamily.parse({
      family_id: rawInput.family_id,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const previous = await retrieveFamily(service, input.family_id)

    if (previous.status === "archived") {
      return new StepResponse(previous, null)
    }

    const family = await service.updateCompoundFamilies({
      id: previous.id,
      status: "archived",
      updated_by_actor_id: actorId,
      archived_at: new Date(),
    })

    return new StepResponse(family, {
      id: previous.id,
      status: previous.status,
      updated_by_actor_id: previous.updated_by_actor_id,
      archived_at: previous.archived_at,
    })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.updateCompoundFamilies(previous)
  },
)

export const assignCompoundFamilyStep = createStep(
  "assign-compound-family",
  async (rawInput: AssignCompoundFamilyWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminAssignCompoundFamily.parse({
      product_id: rawInput.product_id,
      family_id: rawInput.family_id,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [registration] = await service.listGovernedProductRegistrations(
      { product_id: input.product_id },
      { take: 1 },
    )

    if (!registration) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Governed compounded product ${input.product_id} was not found`,
      )
    }

    if (registration.state === "published") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Withdraw a published product before changing its compound family",
      )
    }

    if (input.family_id) {
      const family = await retrieveFamily(service, input.family_id)

      if (family.status !== "active") {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "Archived compound families cannot be assigned",
        )
      }
    }

    const previous = {
      id: registration.id,
      compound_family_id: registration.compound_family_id || null,
      updated_by_actor_id: registration.updated_by_actor_id,
    }
    const updated = await service.updateGovernedProductRegistrations({
      id: registration.id,
      compound_family_id: input.family_id,
      updated_by_actor_id: actorId,
    })

    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.updateGovernedProductRegistrations(previous)
  },
)
