import { MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../modules/research-tracking"
import type ResearchTrackingModuleService from "../modules/research-tracking/service"
import { emitCustomerNotificationWorkflow } from "./manage-customer-notifications"

type Input = {
  customerId: string
  routineId: string
  action: "remind" | "dismiss" | "restore"
  remindAt?: string | null
}

const manageResearchReplenishmentStep = createStep(
  "manage-research-replenishment",
  async (input: Input, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const [profile] = await service.listResearchProfiles({ customer_id: input.customerId, status: "active" }, { take: 1 })
    if (!profile) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "research_profile_action_required")
    const [routine] = await service.listResearchRoutines({ id: input.routineId, profile_id: profile.id }, { take: 1 })
    if (!routine) throw new MedusaError(MedusaError.Types.NOT_FOUND, "routine_not_found")
    const [existing] = await service.listResearchReplenishmentPreferences({ profile_id: profile.id, routine_id: routine.id }, { take: 1 })
    const now = new Date()
    const remindAt = input.action === "remind" && input.remindAt ? new Date(input.remindAt) : null
    if (input.action === "remind" && (!remindAt || Number.isNaN(remindAt.valueOf()) || remindAt <= now)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "A future reminder time is required")
    }
    const data = {
      profile_id: profile.id,
      routine_id: routine.id,
      state: input.action === "remind" ? "snoozed" as const : input.action === "dismiss" ? "dismissed" as const : "visible" as const,
      remind_at: remindAt,
      last_action_at: now,
    }
    const preference = existing
      ? await service.updateResearchReplenishmentPreferences({ id: existing.id, ...data })
      : await service.createResearchReplenishmentPreferences(data)
    if (remindAt) {
      const key = `replenishment:${routine.id}:${remindAt.toISOString()}`
      await emitCustomerNotificationWorkflow(container).run({ input: {
        customer_id: profile.customer_id,
        event_key: "research.replenishment_reminder",
        source_id: key,
        variables: {},
        target_kind: "research_hub_section",
        target_id: "routines",
        secondary_target_id: routine.id,
        scheduled_for: remindAt.toISOString(),
        available_at: remindAt.toISOString(),
        metadata: {},
      } })
    }
    return new StepResponse({ preference })
  },
)

export const manageResearchReplenishmentWorkflow = createWorkflow(
  "manage-research-replenishment",
  (input: Input) => new WorkflowResponse(manageResearchReplenishmentStep(input)),
)
