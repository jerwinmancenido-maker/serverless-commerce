import { createHash } from "node:crypto"

import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { CUSTOMER_NOTIFICATIONS_MODULE } from "../../modules/customer-notifications"
import {
  getNotificationCatalogEntry,
  NOTIFICATION_EVENT_CATALOG,
  renderNotificationTemplate,
  sanitizeNotificationMetadata,
  validateNotificationTemplate,
  type NotificationEventKey,
} from "../../modules/customer-notifications/catalog"
import type {
  AdminUpdateCustomerNotificationTemplate,
  EmitCustomerNotification,
  StoreBulkCustomerNotificationAction,
  StoreMutateCustomerNotification,
  StoreUpdateCustomerNotificationPreferences,
} from "../../modules/customer-notifications/contracts"
import type CustomerNotificationsModuleService from "../../modules/customer-notifications/service"
import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

type TemplateState = {
  template: any
  revision: any
  created_template: boolean
  created_revision: boolean
}

type EmitNotificationCompensation = {
  notificationId: string | null
  attemptId: string | null
  templateState: TemplateState | null
}

const ensureTemplate = async (
  service: CustomerNotificationsModuleService,
  eventKey: NotificationEventKey,
  actorId = "system",
): Promise<TemplateState> => {
  const catalog = getNotificationCatalogEntry(eventKey)
  let [template] = await service.listCustomerNotificationTemplates(
    { event_key: eventKey },
    { take: 1 },
  )
  let createdTemplate = false
  let createdRevision = false
  if (!template) {
    template = await service.createCustomerNotificationTemplates({
      event_key: eventKey,
      display_name: catalog.display_name,
      category: catalog.category,
      enabled: catalog.enabled,
      default_priority: catalog.priority,
      default_enabled: catalog.default_enabled,
      customer_can_disable: catalog.customer_can_disable,
      current_revision_id: null,
      retention_days: catalog.retention_days,
      updated_by_actor_id: actorId,
    })
    createdTemplate = true
  }
  let revision = template.current_revision_id
    ? await service.retrieveCustomerNotificationTemplateRevision(template.current_revision_id).catch(() => null)
    : null
  if (!revision) {
    revision = await service.createCustomerNotificationTemplateRevisions({
      template_id: template.id,
      event_key: eventKey,
      version: 1,
      title_template: catalog.title_template,
      body_template: catalog.body_template,
      action_label: catalog.action_label,
      allowed_variables: { values: catalog.allowed_variables },
      changed_by_actor_id: actorId,
      change_reason: "Initial registered notification wording",
    })
    await service.updateCustomerNotificationTemplates({
      id: template.id,
      current_revision_id: revision.id,
    })
    template.current_revision_id = revision.id
    createdRevision = true
  }
  return { template, revision, created_template: createdTemplate, created_revision: createdRevision }
}

export const customerNotificationIdempotencyKey = ({
  customerId,
  eventKey,
  sourceId,
}: {
  customerId: string
  eventKey: NotificationEventKey
  sourceId: string
}) => `customer:${createHash("sha256")
  .update(`${customerId}:${eventKey}:${sourceId}`)
  .digest("hex")}`

const deleteTemplateState = async (
  service: CustomerNotificationsModuleService,
  state: TemplateState | null,
) => {
  if (!state) return
  if (state.created_revision) await service.deleteCustomerNotificationTemplateRevisions(state.revision.id)
  if (state.created_template) await service.deleteCustomerNotificationTemplates(state.template.id)
}

export const emitCustomerNotificationStep = createStep<
  EmitCustomerNotification,
  any | null,
  EmitNotificationCompensation
>(
  "emit-customer-notification",
  async (input: EmitCustomerNotification, { container }) => {
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    const catalog = getNotificationCatalogEntry(input.event_key)
    const key = customerNotificationIdempotencyKey({
      customerId: input.customer_id,
      eventKey: input.event_key,
      sourceId: input.source_id,
    })
    const [existing] = await service.listCustomerNotifications({ idempotency_key: key }, { take: 1 })
    if (existing) {
      return new StepResponse(existing, {
        notificationId: null,
        attemptId: null,
        templateState: null,
      })
    }

    const state = await ensureTemplate(service, input.event_key)
    const template = state.template
    const revision = state.revision
    if (!template.enabled) {
      return new StepResponse(null, {
        notificationId: null,
        attemptId: null,
        templateState: state,
      })
    }

    if (template.customer_can_disable) {
      const [preference] = await service.listCustomerNotificationPreferences(
        { customer_id: input.customer_id, event_key: input.event_key },
        { take: 1 },
      )
      if ((preference?.enabled ?? template.default_enabled) === false) {
        return new StepResponse(null, {
          notificationId: null,
          attemptId: null,
          templateState: state,
        })
      }
    }

    validateNotificationTemplate({
      title: revision.title_template,
      body: revision.body_template,
      allowed: revision.allowed_variables?.values || [],
    })
    const now = new Date()
    const scheduledFor = input.scheduled_for ? new Date(input.scheduled_for) : now
    const availableAt = input.available_at ? new Date(input.available_at) : scheduledFor
    const status = availableAt > now ? "scheduled" : "unread"
    const notification = await service.createCustomerNotifications({
      customer_id: input.customer_id,
      event_key: input.event_key,
      category: template.category,
      priority: template.default_priority,
      title: renderNotificationTemplate(revision.title_template, input.variables),
      body: renderNotificationTemplate(revision.body_template, input.variables),
      target_kind: input.target_kind,
      target_id: input.target_id || null,
      secondary_target_id: input.secondary_target_id || null,
      action_label: revision.action_label,
      status,
      scheduled_for: scheduledFor,
      available_at: availableAt,
      delivered_at: status === "unread" ? now : null,
      read_at: null,
      archived_at: null,
      snoozed_until: null,
      expires_at: input.expires_at
        ? new Date(input.expires_at)
        : new Date(availableAt.getTime() + template.retention_days * 86_400_000),
      idempotency_key: key,
      group_key: input.group_key || null,
      template_revision_id: revision.id,
      payload_schema_version: "1",
      metadata: sanitizeNotificationMetadata({
        ...input.metadata,
        ...(input.is_test ? { is_test: true } : {}),
      }),
    })
    const attempt = await service.createCustomerNotificationDeliveryAttempts({
      notification_id: notification.id,
      channel: "in_app",
      status: status === "unread" ? "delivered" : "skipped",
      attempted_at: now,
      provider_reference: null,
      failure_code: null,
      retry_at: null,
    })
    return new StepResponse(notification, {
      notificationId: notification.id,
      attemptId: attempt.id,
      templateState: state,
    })
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    if (data.attemptId) await service.deleteCustomerNotificationDeliveryAttempts(data.attemptId)
    if (data.notificationId) await service.deleteCustomerNotifications(data.notificationId)
    await deleteTemplateState(service, data.templateState || null)
  },
)

export type MutateNotificationInput = {
  customer_id: string
  notification_id: string
  mutation: StoreMutateCustomerNotification
}

export const mutateCustomerNotificationStep = createStep(
  "mutate-customer-notification",
  async (input: MutateNotificationInput, { container }) => {
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    const [notification] = await service.listCustomerNotifications(
      { id: input.notification_id, customer_id: input.customer_id },
      { take: 1 },
    )
    if (!notification) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Notification was not found")
    const prior = {
      id: notification.id,
      status: notification.status,
      read_at: notification.read_at,
      archived_at: notification.archived_at,
      snoozed_until: notification.snoozed_until,
      available_at: notification.available_at,
    }
    const now = new Date()
    const changes: any = { id: notification.id }
    switch (input.mutation.action) {
      case "mark_read":
      case "open":
        changes.status = "read"
        changes.read_at = now
        break
      case "mark_unread":
        changes.status = "unread"
        changes.read_at = null
        changes.archived_at = null
        break
      case "archive":
        changes.status = "archived"
        changes.archived_at = now
        break
      case "snooze": {
        const catalog = getNotificationCatalogEntry(notification.event_key)
        const until = new Date(input.mutation.snoozed_until)
        if (!catalog.snoozable || until <= now) {
          throw new MedusaError(MedusaError.Types.INVALID_DATA, "This notification cannot be snoozed")
        }
        changes.status = "snoozed"
        changes.snoozed_until = until
        changes.available_at = until
        break
      }
    }
    const updated = await service.updateCustomerNotifications(changes)
    return new StepResponse(updated, prior)
  },
  async (prior, { container }) => {
    if (!prior) return
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    await service.updateCustomerNotifications(prior)
  },
)

export type BulkNotificationInput = {
  customer_id: string
  mutation: StoreBulkCustomerNotificationAction
}

export const bulkMutateCustomerNotificationsStep = createStep(
  "bulk-mutate-customer-notifications",
  async (input: BulkNotificationInput, { container }) => {
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    const filters: any = { customer_id: input.customer_id }
    if (input.mutation.action === "mark_all_read") {
      filters.status = ["unread", "snoozed"]
      if (input.mutation.category) filters.category = input.mutation.category
    } else {
      filters.id = input.mutation.ids
    }
    const now = new Date()
    const prior: Array<{ id: string; status: "scheduled" | "unread" | "read" | "snoozed" | "archived"; read_at: Date | null; archived_at: Date | null }> = []
    let batch: any[] = []
    do {
      batch = await service.listCustomerNotifications(filters, { take: 500 })
      prior.push(...batch.map((item) => ({
        id: item.id,
        status: item.status,
        read_at: item.read_at,
        archived_at: item.archived_at,
      })))
      if (batch.length) {
        await service.updateCustomerNotifications(batch.map((item) => input.mutation.action === "mark_all_read"
          ? { id: item.id, status: "read" as const, read_at: now }
          : { id: item.id, status: "archived" as const, archived_at: now }))
      }
    } while (input.mutation.action === "mark_all_read" && batch.length === 500)
    if (input.mutation.action === "archive" && prior.length !== input.mutation.ids.length) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "One or more notifications were not found")
    }
    return new StepResponse({ updated: prior.length }, prior)
  },
  async (prior, { container }) => {
    if (!prior?.length) return
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    await service.updateCustomerNotifications(prior)
  },
)

export type UpdateNotificationPreferencesInput = {
  customer_id: string
  preferences: StoreUpdateCustomerNotificationPreferences["preferences"]
}

export const updateCustomerNotificationPreferencesStep = createStep(
  "update-customer-notification-preferences",
  async (input: UpdateNotificationPreferencesInput, { container }) => {
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    const existing = await service.listCustomerNotificationPreferences({ customer_id: input.customer_id })
    const before = existing.map((item) => ({ id: item.id, enabled: item.enabled }))
    const createdIds: string[] = []
    for (const requested of input.preferences) {
      const state = await ensureTemplate(service, requested.event_key)
      if (!state.template.customer_can_disable && !requested.enabled) {
        throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This operational notification is required")
      }
      const current = existing.find((item) => item.event_key === requested.event_key)
      if (current) {
        await service.updateCustomerNotificationPreferences({ id: current.id, enabled: requested.enabled })
      } else {
        const created = await service.createCustomerNotificationPreferences({
          customer_id: input.customer_id,
          event_key: requested.event_key,
          enabled: requested.enabled,
        })
        createdIds.push(created.id)
      }
    }
    await service.createCustomerNotificationAuditEvents({
      event_type: "preference_changed",
      event_key: null,
      notification_id: null,
      actor_type: "customer",
      actor_id: input.customer_id,
      details: { changed_event_keys: input.preferences.map((item) => item.event_key) },
    })
    const current = await service.listCustomerNotificationPreferences({ customer_id: input.customer_id })
    return new StepResponse(current, { before, createdIds })
  },
  async (state, { container }) => {
    if (!state) return
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    if (state.createdIds.length) await service.deleteCustomerNotificationPreferences(state.createdIds)
    if (state.before.length) await service.updateCustomerNotificationPreferences(state.before)
  },
)

export type UpdateNotificationTemplateInput = AdminUpdateCustomerNotificationTemplate & {
  event_key: NotificationEventKey
  actor_id: string
}

export const updateCustomerNotificationTemplateStep = createStep(
  "update-customer-notification-template",
  async (input: UpdateNotificationTemplateInput, { container }) => {
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    const catalog = getNotificationCatalogEntry(input.event_key)
    try {
      validateNotificationTemplate({ title: input.title_template, body: input.body_template, allowed: catalog.allowed_variables })
    } catch (error) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, error instanceof Error ? error.message : "Notification template is invalid")
    }
    const state = await ensureTemplate(service, input.event_key, input.actor_id)
    const revisions = await service.listCustomerNotificationTemplateRevisions(
      { template_id: state.template.id },
      { order: { version: "DESC" }, take: 1 },
    )
    const revision = await service.createCustomerNotificationTemplateRevisions({
      template_id: state.template.id,
      event_key: input.event_key,
      version: (revisions[0]?.version || 0) + 1,
      title_template: input.title_template,
      body_template: input.body_template,
      action_label: input.action_label,
      allowed_variables: { values: catalog.allowed_variables },
      changed_by_actor_id: input.actor_id,
      change_reason: input.change_reason,
    })
    const prior = {
      id: state.template.id,
      enabled: state.template.enabled,
      default_priority: state.template.default_priority,
      default_enabled: state.template.default_enabled,
      current_revision_id: state.template.current_revision_id,
      retention_days: state.template.retention_days,
      updated_by_actor_id: state.template.updated_by_actor_id,
    }
    const template = await service.updateCustomerNotificationTemplates({
      id: state.template.id,
      enabled: input.enabled,
      default_priority: input.priority,
      default_enabled: input.default_enabled,
      current_revision_id: revision.id,
      retention_days: input.retention_days,
      updated_by_actor_id: input.actor_id,
    })
    const audit = await service.createCustomerNotificationAuditEvents({
      event_type: "template_updated",
      event_key: input.event_key,
      notification_id: null,
      actor_type: "admin",
      actor_id: input.actor_id,
      details: { template_version: revision.version, change_reason: input.change_reason },
    })
    return new StepResponse({ template, revision }, { revisionId: revision.id, auditId: audit.id, prior })
  },
  async (state, { container }) => {
    if (!state) return
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    await service.deleteCustomerNotificationAuditEvents(state.auditId)
    await service.updateCustomerNotificationTemplates(state.prior)
    await service.deleteCustomerNotificationTemplateRevisions(state.revisionId)
  },
)

export const backfillLegacyCustomerNotificationsStep = createStep(
  "backfill-legacy-customer-notifications",
  async (_input: Record<string, never>, { container }) => {
    const newService = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    const legacy = container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const profiles = await legacy.listResearchProfiles({}, { take: 10_000 })
    const customerByProfile = new Map(profiles.map((profile) => [profile.id, profile.customer_id]))
    const notifications = await legacy.listResearchNotifications({}, { take: 10_000, order: { created_at: "ASC" } })
    const createdIds: string[] = []
    const eventMap: Record<string, NotificationEventKey> = {
      routine_reminder: "research.routine_reminder",
      daily_summary: "research.daily_summary",
      weekly_summary: "research.weekly_summary",
      replenishment: "research.replenishment_reminder",
      progress: "research.progress_prompt",
      journal_prompt: "research.journal_prompt",
      reward: "reward.points_earned",
      community_reply: "community.reply_received",
      community_moderation: "community.moderation_completed",
      support_reply: "support.reply_received",
    }
    for (const item of notifications) {
      const customerId = customerByProfile.get(item.profile_id)
      const eventKey = eventMap[item.type]
      if (!customerId || !eventKey) continue
      const idempotencyKey = `legacy:${item.idempotency_key}`
      const [existing] = await newService.listCustomerNotifications({ idempotency_key: idempotencyKey }, { take: 1 })
      if (existing) continue
      const catalog = getNotificationCatalogEntry(eventKey)
      const created = await newService.createCustomerNotifications({
        customer_id: customerId,
        event_key: eventKey,
        category: catalog.category,
        priority: catalog.priority,
        title: item.title,
        body: item.body,
        target_kind: eventKey.startsWith("support.") ? "support_conversation" : eventKey.startsWith("community.") ? "community_thread" : "research_hub_section",
        target_id: null,
        secondary_target_id: null,
        action_label: catalog.action_label,
        status: item.status === "dismissed" ? "archived" : item.status === "failed" ? "archived" : item.status,
        scheduled_for: item.scheduled_for,
        available_at: item.available_at,
        delivered_at: item.delivered_at,
        read_at: item.read_at,
        archived_at: item.dismissed_at,
        snoozed_until: item.snoozed_until,
        expires_at: new Date(new Date(item.available_at).getTime() + catalog.retention_days * 86_400_000),
        idempotency_key: idempotencyKey,
        group_key: null,
        template_revision_id: null,
        payload_schema_version: "legacy-1",
        metadata: { legacy_notification_id: item.id, legacy_profile_id: item.profile_id },
      })
      createdIds.push(created.id)
    }
    const audit = await newService.createCustomerNotificationAuditEvents({
      event_type: "legacy_backfilled",
      event_key: null,
      notification_id: null,
      actor_type: "system",
      actor_id: null,
      details: { created_count: createdIds.length, legacy_count: notifications.length },
    })
    return new StepResponse({ created_count: createdIds.length, legacy_count: notifications.length }, { createdIds, auditId: audit.id })
  },
  async (state, { container }) => {
    if (!state) return
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    if (state.createdIds.length) await service.deleteCustomerNotifications(state.createdIds)
    await service.deleteCustomerNotificationAuditEvents(state.auditId)
  },
)

export const registeredNotificationTemplates = () => Object.values(NOTIFICATION_EVENT_CATALOG)

export const releaseScheduledCustomerNotificationsStep = createStep(
  "release-scheduled-customer-notifications",
  async (_input: Record<string, never>, { container }) => {
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    const due = await service.listCustomerNotifications(
      { status: ["scheduled", "snoozed"], available_at: { $lte: new Date() } },
      { take: 500, order: { available_at: "ASC" } },
    )
    const now = new Date()
    const attemptIds: string[] = []
    if (due.length) {
      await service.updateCustomerNotifications(due.map((item) => ({ id: item.id, status: "unread" as const, delivered_at: item.delivered_at || now, snoozed_until: null })))
      for (const item of due) {
        const attempt = await service.createCustomerNotificationDeliveryAttempts({ notification_id: item.id, channel: "in_app", status: "delivered", attempted_at: now, provider_reference: null, failure_code: null, retry_at: null })
        attemptIds.push(attempt.id)
      }
    }
    return new StepResponse({ released_count: due.length }, { due: due.map((item) => ({ id: item.id, status: item.status, delivered_at: item.delivered_at, snoozed_until: item.snoozed_until })), attemptIds })
  },
  async (state, { container }) => {
    if (!state) return
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    if (state.attemptIds.length) await service.deleteCustomerNotificationDeliveryAttempts(state.attemptIds)
    if (state.due.length) await service.updateCustomerNotifications(state.due)
  },
)

export const expireCustomerNotificationsStep = createStep(
  "expire-customer-notifications",
  async (_input: Record<string, never>, { container }) => {
    const service = container.resolve<CustomerNotificationsModuleService>(CUSTOMER_NOTIFICATIONS_MODULE)
    const expired = await service.listCustomerNotifications({ status: ["read", "archived"], expires_at: { $lte: new Date() } }, { take: 500 })
    const ids = expired.map((item) => item.id)
    const attempts = ids.length ? await service.listCustomerNotificationDeliveryAttempts({ notification_id: ids }) : []
    if (attempts.length) await service.deleteCustomerNotificationDeliveryAttempts(attempts.map((item) => item.id))
    if (ids.length) await service.deleteCustomerNotifications(ids)
    if (ids.length) await service.createCustomerNotificationAuditEvents({ event_type: "retention_expired", event_key: null, notification_id: null, actor_type: "system", actor_id: null, details: { expired_count: ids.length } })
    return new StepResponse({ expired_count: ids.length })
  },
)
