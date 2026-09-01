import { z } from "@medusajs/framework/zod"

export const AdminUpdateResearchHubSettings = z.strictObject({
  in_app_enabled: z.boolean(),
  email_enabled: z.boolean(),
  browser_push_enabled: z.boolean(),
  mobile_push_enabled: z.boolean(),
  default_timezone: z.string().trim().min(1).max(100),
  default_lead_minutes: z.array(z.number().int().min(0).max(10_080)).min(1).max(5),
  default_quiet_hours_start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  default_quiet_hours_end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  calendar_past_days: z.number().int().min(0).max(3_650),
  calendar_future_days: z.number().int().min(1).max(3_650),
  reorder_now_days: z.number().int().min(1).max(365),
  plan_reorder_days: z.number().int().min(1).max(730),
  default_replenishment_snooze_days: z.number().int().min(1).max(365),
  attachment_max_bytes: z.number().int().min(1_024).max(104_857_600),
  attachment_allowed_types: z.array(z.string().trim().min(1)).max(20),
  reminders_enabled: z.boolean(),
  calendar_enabled: z.boolean(),
  calculator_snapshots_enabled: z.boolean(),
  goals_enabled: z.boolean(),
  referrals_enabled: z.boolean(),
}).refine(
  (settings) => settings.plan_reorder_days >= settings.reorder_now_days,
  {
    message: "Plan-reorder days must be greater than or equal to reorder-soon days",
    path: ["plan_reorder_days"],
  },
)

export type AdminUpdateResearchHubSettingsType = z.infer<
  typeof AdminUpdateResearchHubSettings
>
