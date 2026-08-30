import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import {
  AdminArchiveCompoundProductFormat,
  AdminAssignCompoundProductFormat,
  AdminCreateCompoundProductFormat,
  AdminUpdateCompoundProductFormat,
  type AdminArchiveCompoundProductFormat as ArchiveCompoundProductFormatRequest,
  type AdminAssignCompoundProductFormat as AssignCompoundProductFormatRequest,
  type AdminCreateCompoundProductFormat as CreateCompoundProductFormatRequest,
  type AdminUpdateCompoundProductFormat as UpdateCompoundProductFormatRequest,
} from "../../modules/compounded-product/contracts/compound-product-format"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

type ActorInput = { actorId: string }

export type CreateCompoundProductFormatWorkflowInput =
  CreateCompoundProductFormatRequest & ActorInput
export type UpdateCompoundProductFormatWorkflowInput =
  UpdateCompoundProductFormatRequest & ActorInput
export type ArchiveCompoundProductFormatWorkflowInput =
  ArchiveCompoundProductFormatRequest & ActorInput
export type AssignCompoundProductFormatWorkflowInput =
  AssignCompoundProductFormatRequest & ActorInput

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

async function retrieveFormat(
  service: CompoundedProductModuleService,
  formatId: string,
) {
  const [format] = await service.listCompoundProductFormats(
    { id: formatId },
    { take: 1 },
  )

  if (!format) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Compound product presentation was not found",
    )
  }

  return format
}

export const createCompoundProductFormatStep = createStep(
  "create-compound-product-format",
  async (rawInput: CreateCompoundProductFormatWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminCreateCompoundProductFormat.parse({
      key: rawInput.key,
      name: rawInput.name,
      description: rawInput.description,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const [existing] = await service.listCompoundProductFormats(
      { key: input.key },
      { take: 1 },
    )

    if (existing) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        `Compound product presentation key ${input.key} already exists`,
      )
    }

    const format = await service.createCompoundProductFormats({
      ...input,
      status: "active",
      created_by_actor_id: actorId,
      updated_by_actor_id: actorId,
      archived_at: null,
    })

    return new StepResponse(format, format.id)
  },
  async (formatId: string | undefined, { container }) => {
    if (!formatId) {
      return
    }

    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    await service.deleteCompoundProductFormats(formatId)
  },
)

export const updateCompoundProductFormatStep = createStep(
  "update-compound-product-format",
  async (rawInput: UpdateCompoundProductFormatWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminUpdateCompoundProductFormat.parse({
      format_id: rawInput.format_id,
      name: rawInput.name,
      description: rawInput.description,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const previous = await retrieveFormat(service, input.format_id)

    if (previous.status !== "active") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Archived product presentations cannot be edited",
      )
    }

    const format = await service.updateCompoundProductFormats({
      id: previous.id,
      name: input.name,
      description: input.description,
      updated_by_actor_id: actorId,
    })

    return new StepResponse(format, {
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
    await service.updateCompoundProductFormats(previous)
  },
)

export const archiveCompoundProductFormatStep = createStep(
  "archive-compound-product-format",
  async (rawInput: ArchiveCompoundProductFormatWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminArchiveCompoundProductFormat.parse({
      format_id: rawInput.format_id,
    })
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const previous = await retrieveFormat(service, input.format_id)

    if (previous.status === "archived") {
      return new StepResponse(previous, null)
    }

    const format = await service.updateCompoundProductFormats({
      id: previous.id,
      status: "archived",
      updated_by_actor_id: actorId,
      archived_at: new Date(),
    })

    return new StepResponse(format, {
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
    await service.updateCompoundProductFormats(previous)
  },
)

export const assignCompoundProductFormatStep = createStep(
  "assign-compound-product-format",
  async (rawInput: AssignCompoundProductFormatWorkflowInput, { container }) => {
    const actorId = requireActor(rawInput.actorId)
    const input = AdminAssignCompoundProductFormat.parse({
      product_id: rawInput.product_id,
      format_id: rawInput.format_id,
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
        "Withdraw a published product before changing its presentation",
      )
    }

    if (input.format_id) {
      const format = await retrieveFormat(service, input.format_id)

      if (format.status !== "active") {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "Archived product presentations cannot be assigned",
        )
      }
    }

    const previous = {
      id: registration.id,
      compound_format_id: registration.compound_format_id || null,
      updated_by_actor_id: registration.updated_by_actor_id,
    }
    const updated = await service.updateGovernedProductRegistrations({
      id: registration.id,
      compound_format_id: input.format_id,
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
