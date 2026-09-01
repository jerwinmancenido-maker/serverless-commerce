import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

export type UpdateResearchHubSettingsInput = {
  adminUserId: string
  settings: {
    in_app_enabled: boolean
    email_enabled: boolean
    browser_push_enabled: boolean
    mobile_push_enabled: boolean
    default_timezone: string
    default_lead_minutes: number[]
    default_quiet_hours_start: string
    default_quiet_hours_end: string
    calendar_past_days: number
    calendar_future_days: number
    reorder_now_days: number
    plan_reorder_days: number
    default_replenishment_snooze_days: number
    attachment_max_bytes: number
    attachment_allowed_types: string[]
    reminders_enabled: boolean
    calendar_enabled: boolean
    calculator_snapshots_enabled: boolean
    goals_enabled: boolean
    referrals_enabled: boolean
  }
}

export const updateResearchHubSettingsStep = createStep(
  "update-research-hub-settings",
  async (input: UpdateResearchHubSettingsInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    const [prior] = await service.listResearchHubSettings(
      { setting_key: "global" },
      { take: 1 },
    )
    const data = {
      ...input.settings,
      default_lead_minutes: { values: input.settings.default_lead_minutes },
      attachment_allowed_types: {
        values: input.settings.attachment_allowed_types,
      },
      updated_by: input.adminUserId,
    }
    const settings = prior
      ? await service.updateResearchHubSettings({ id: prior.id, ...data })
      : await service.createResearchHubSettings({
          setting_key: "global",
          ...data,
        })
    return new StepResponse(settings, prior ? { prior } : { createdId: settings.id })
  },
  async (compensation, { container }) => {
    if (!compensation) return
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    if ("createdId" in compensation) {
      if (compensation.createdId) {
        await service.deleteResearchHubSettings(compensation.createdId)
      }
    } else {
      await service.updateResearchHubSettings(compensation.prior)
    }
  },
)
