import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../../../modules/research-tracking/service"
import { retrieveResearchProfileForRead } from "../../../../../../../modules/research-tracking/queries/personal-routines"
import { updateResearchReminderPreferencesWorkflow } from "../../../../../../../workflows/manage-research-reminders"
import type { StoreUpdateResearchReminderPreferencesType } from "../../validators"
import { setResearchPrivateNoStore } from "../../utils"

const defaultPreferences = {
  enabled: true,
  timezone: "Asia/Manila",
  lead_minutes: [30],
  quiet_hours_enabled: false,
  quiet_hours_start: null,
  quiet_hours_end: null,
  daily_summary: false,
  weekly_summary: false,
  replenishment_reminders: true,
  progress_reminders: false,
  journal_prompts: false,
  reward_notifications: true,
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const profile = await retrieveResearchProfileForRead(
    req.scope,
    req.auth_context.actor_id,
  )
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [preference] = await service.listResearchReminderPreferences(
    { profile_id: profile.id },
    { take: 1 },
  )

  res.json({
    preferences: preference
      ? {
          ...preference,
          lead_minutes:
            (preference.lead_minutes as { values?: number[] })?.values ?? [30],
        }
      : { ...defaultPreferences, timezone: profile.timezone },
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<StoreUpdateResearchReminderPreferencesType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const { result } = await updateResearchReminderPreferencesWorkflow(
    req.scope,
  ).run({
    input: {
      customerId: req.auth_context.actor_id,
      preferences: req.validatedBody,
    },
  })
  res.json({ preferences: result })
}
