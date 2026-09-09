/**
 * @file    apps/backend/src/workflows/steps/revoke-order-research-protocols.ts
 * @module  RevokeOrderResearchProtocolsStep (Research Content & Tracking Modules)
 * @purpose Revokes order-bound protocol tokens and flips linked customer profile accesses to revoked on cancellation or admin action.
 * @contracts
 *   Step: revokeOrderResearchProtocolsStep
 *   Service: ResearchContentModuleService · ResearchTrackingModuleService
 */

import type { MedusaContainer } from "@medusajs/framework/types"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import type ResearchContentModuleService from "../../modules/research-content/service"
import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

export type RevokeOrderResearchProtocolsInput = {
  order_id: string
  reason?: string
}

export type RevokeOrderResearchProtocolsCompensationState = {
  restorableOrderAccessIds: string[]
  restorableProfileAccessIds: string[]
}

export async function executeRevokeOrderResearchProtocols(
  input: RevokeOrderResearchProtocolsInput,
  container: MedusaContainer,
) {
  const contentService = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const trackingService = container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )

  const activeOrderAccesses =
    await contentService.listResearchProtocolOrderAccesses({
      order_id: input.order_id,
      revoked_at: null,
    })

  if (!activeOrderAccesses.length) {
    return {
      result: {
        revoked_order_access_count: 0,
        revoked_profile_access_count: 0,
      },
      compensation: {
        restorableOrderAccessIds: [],
        restorableProfileAccessIds: [],
      },
    }
  }

  const orderAccessIds = activeOrderAccesses.map((access) => access.id)
  const activeProfileAccesses =
    await trackingService.listResearchProtocolProfileAccesses({
      order_protocol_access_id: orderAccessIds,
      status: "active",
    })

  const now = new Date()

  await contentService.updateResearchProtocolOrderAccesses(
    activeOrderAccesses.map((access) => ({
      id: access.id,
      revoked_at: now,
    })),
  )

  if (activeProfileAccesses.length) {
    await trackingService.updateResearchProtocolProfileAccesses(
      activeProfileAccesses.map((profileAccess) => ({
        id: profileAccess.id,
        status: "revoked" as const,
      })),
    )
  }

  return {
    result: {
      revoked_order_access_count: activeOrderAccesses.length,
      revoked_profile_access_count: activeProfileAccesses.length,
    },
    compensation: {
      restorableOrderAccessIds: orderAccessIds,
      restorableProfileAccessIds: activeProfileAccesses.map((pa) => pa.id),
    },
  }
}

export async function executeRestoreOrderResearchProtocols(
  state: RevokeOrderResearchProtocolsCompensationState,
  container: MedusaContainer,
) {
  if (state.restorableOrderAccessIds.length) {
    const contentService = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    await contentService.updateResearchProtocolOrderAccesses(
      state.restorableOrderAccessIds.map((id) => ({
        id,
        revoked_at: null,
      })),
    )
  }

  if (state.restorableProfileAccessIds.length) {
    const trackingService = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    await trackingService.updateResearchProtocolProfileAccesses(
      state.restorableProfileAccessIds.map((id) => ({
        id,
        status: "active" as const,
      })),
    )
  }
}

export const revokeOrderResearchProtocolsStep = createStep(
  "revoke-order-research-protocols",
  async (input: RevokeOrderResearchProtocolsInput, { container }) => {
    const { result, compensation } =
      await executeRevokeOrderResearchProtocols(input, container)
    return new StepResponse(result, compensation)
  },
  async (state: RevokeOrderResearchProtocolsCompensationState, { container }) => {
    await executeRestoreOrderResearchProtocols(state, container)
  },
)

export default revokeOrderResearchProtocolsStep
