import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../modules/research-tracking/service"
import { updateResearchHubSettingsWorkflow } from "../../../../workflows/manage-research-hub-settings"
import type { AdminUpdateResearchHubSettingsType } from "../validators"

const defaults = {
  in_app_enabled: true,
  email_enabled: false,
  browser_push_enabled: false,
  mobile_push_enabled: false,
  default_timezone: "Asia/Manila",
  default_lead_minutes: [30],
  default_quiet_hours_start: "22:00",
  default_quiet_hours_end: "07:00",
  calendar_past_days: 365,
  calendar_future_days: 365,
  reorder_now_days: 14,
  plan_reorder_days: 30,
  default_replenishment_snooze_days: 7,
  attachment_max_bytes: 10_485_760,
  attachment_allowed_types: ["image/jpeg", "image/png", "application/pdf"],
  reminders_enabled: true,
  calendar_enabled: true,
  calculator_snapshots_enabled: true,
  goals_enabled: true,
  referrals_enabled: false,
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [record] = await service.listResearchHubSettings(
    { setting_key: "global" },
    { take: 1 },
  )
  res.json({
    settings: record
      ? {
          ...record,
          default_lead_minutes:
            (record.default_lead_minutes as { values?: number[] }).values ?? [30],
          attachment_allowed_types:
            (record.attachment_allowed_types as { values?: string[] }).values ?? [],
        }
      : defaults,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminUpdateResearchHubSettingsType>,
  res: MedusaResponse,
) {
  const { result } = await updateResearchHubSettingsWorkflow(req.scope).run({
    input: {
      adminUserId: req.auth_context.actor_id,
      settings: req.validatedBody,
    },
  })
  res.json({ settings: result })
}
