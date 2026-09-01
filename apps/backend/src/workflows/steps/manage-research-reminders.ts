import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import {
  normalizeReminderPreference,
  type ResearchReminderPreferenceInput,
} from "../../modules/research-tracking/contracts/reminders"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

async function activeProfile(
  service: ResearchTrackingModuleService,
  customerId: string,
) {
  const [profile] = await service.listResearchProfiles(
    { customer_id: customerId, status: "active" },
    { take: 1 },
  )
  if (!profile) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "research_profile_action_required",
    )
  }
  return profile
}

export type UpdateReminderPreferencesInput = {
  customerId: string
  preferences: ResearchReminderPreferenceInput
}

export const updateReminderPreferencesStep = createStep(
  "update-reminder-preferences",
  async (input: UpdateReminderPreferencesInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    const profile = await activeProfile(service, input.customerId)
    let normalized: ReturnType<typeof normalizeReminderPreference>
    try {
      normalized = normalizeReminderPreference(input.preferences)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        error instanceof Error ? error.message : "reminder_preferences_invalid",
      )
    }
    const [prior] = await service.listResearchReminderPreferences(
      { profile_id: profile.id },
      { take: 1 },
    )
    const preference = prior
      ? await service.updateResearchReminderPreferences({
          id: prior.id,
          ...normalized,
        })
      : await service.createResearchReminderPreferences({
          profile_id: profile.id,
          ...normalized,
        })

    return new StepResponse(preference, {
      createdId: prior ? null : preference.id,
      prior: prior
        ? {
            id: prior.id,
            enabled: prior.enabled,
            timezone: prior.timezone,
            lead_minutes: prior.lead_minutes,
            quiet_hours_enabled: prior.quiet_hours_enabled,
            quiet_hours_start: prior.quiet_hours_start,
            quiet_hours_end: prior.quiet_hours_end,
            daily_summary: prior.daily_summary,
            weekly_summary: prior.weekly_summary,
            replenishment_reminders: prior.replenishment_reminders,
            progress_reminders: prior.progress_reminders,
            journal_prompts: prior.journal_prompts,
            reward_notifications: prior.reward_notifications,
          }
        : null,
    })
  },
  async (compensation, { container }) => {
    if (!compensation) return
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    if (compensation.createdId) {
      await service.deleteResearchReminderPreferences(compensation.createdId)
    } else if (compensation.prior) {
      await service.updateResearchReminderPreferences(compensation.prior)
    }
  },
)

export type MutateResearchNotificationInput = {
  customerId: string
  notificationId: string
  action: "read" | "dismiss" | "snooze"
  snoozedUntil?: string | null
}

export const mutateResearchNotificationStep = createStep(
  "mutate-research-notification",
  async (input: MutateResearchNotificationInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    const profile = await activeProfile(service, input.customerId)
    const [notification] = await service.listResearchNotifications(
      { id: input.notificationId, profile_id: profile.id },
      { take: 1 },
    )
    if (!notification) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "notification_not_found")
    }
    const now = new Date()
    const snoozedUntil = input.snoozedUntil
      ? new Date(input.snoozedUntil)
      : null
    if (
      input.action === "snooze" &&
      (!snoozedUntil || Number.isNaN(snoozedUntil.getTime()) || snoozedUntil <= now)
    ) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "snooze_time_invalid")
    }
    const prior = {
      id: notification.id,
      status: notification.status,
      available_at: notification.available_at,
      read_at: notification.read_at,
      dismissed_at: notification.dismissed_at,
      snoozed_until: notification.snoozed_until,
    }
    const updated = await service.updateResearchNotifications({
      id: notification.id,
      status:
        input.action === "read"
          ? "read"
          : input.action === "dismiss"
            ? "dismissed"
            : "snoozed",
      available_at: input.action === "snooze" ? snoozedUntil! : notification.available_at,
      read_at: input.action === "read" ? now : notification.read_at,
      dismissed_at: input.action === "dismiss" ? now : notification.dismissed_at,
      snoozed_until: input.action === "snooze" ? snoozedUntil : notification.snoozed_until,
    })
    return new StepResponse(updated, prior)
  },
  async (prior, { container }) => {
    if (prior) {
      await container
        .resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
        .updateResearchNotifications(prior)
    }
  },
)

export type ScheduleResearchNotificationsInput = {
  notifications: Array<{
    profile_id: string
    routine_id: string
    routine_revision_id: string
    occurrence_id: string
    title: string
    body: string
    scheduled_for: Date
    available_at: Date
    source_local_date: Date
    source_local_time: string
    timezone: string
    idempotency_key: string
    metadata: Record<string, unknown>
  }>
}

export const scheduleResearchNotificationsStep = createStep(
  "schedule-research-notifications",
  async (input: ScheduleResearchNotificationsInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(
      RESEARCH_TRACKING_MODULE,
    )
    const createdIds: string[] = []
    const notifications: unknown[] = []

    for (const candidate of input.notifications) {
      const [existing] = await service.listResearchNotifications(
        { idempotency_key: candidate.idempotency_key },
        { take: 1 },
      )
      if (existing) {
        notifications.push(existing)
        continue
      }
      const notification = await service.createResearchNotifications({
        ...candidate,
        type: "routine_reminder",
        channel: "in_app",
        status: "unread",
        delivered_at: new Date(),
        read_at: null,
        dismissed_at: null,
        snoozed_until: null,
        template_version: "in-app-routine-reminder-v1",
      })
      await service.createResearchNotificationDeliveryAttempts({
        notification_id: notification.id,
        channel: "in_app",
        status: "delivered",
        attempted_at: new Date(),
        provider_reference: null,
        error_code: null,
        detail: "Stored in the private in-app notification inbox.",
      })
      createdIds.push(notification.id)
      notifications.push(notification)
    }

    return new StepResponse(notifications, createdIds)
  },
  async (ids, { container }) => {
    if (ids?.length) {
      await container
        .resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
        .deleteResearchNotifications(ids)
    }
  },
)
