import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { CUSTOMER_SUPPORT_MODULE } from "../../modules/customer-support"
import {
  AdminCreateSupportInternalNote,
  AdminCreateSupportMessage,
  AdminAssignSupportConversation,
  AdminPrioritizeSupportConversation,
  AdminUpdateSupportConversation,
  StoreCreateSupportConversation,
  StoreCreateSupportReply,
  StoreMutateSupportConversation,
  parseStoreCreateSupportConversationPayload,
  parseStoreCreateSupportReplyPayload,
  parseStoreMutateSupportConversationPayload,
} from "../../modules/customer-support/contracts"
import type CustomerSupportModuleService from "../../modules/customer-support/service"
import { getCustomerProtocolEligibility } from "../../modules/research-content/community-access"
import {
  createCustomerNotification,
  deleteCustomerNotifications,
} from "../../modules/research-tracking/customer-notifications"
import { resolveSupportConfiguration } from "../../modules/customer-support/configuration"
import { emitCustomerNotificationWorkflow } from "../manage-customer-notifications"

const cleanText = (value: string) => {
  const text = value.trim()
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Message contains unsupported characters")
  return text
}

const ownedConversation = async (service: CustomerSupportModuleService, customerId: string, conversationId: string) => {
  const [conversation] = await service.listSupportConversations({ id: conversationId, customer_id: customerId }, { take: 1 })
  if (!conversation) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Support conversation was not found")
  return conversation
}

const validateOwnedOrder = async (container: any, customerId: string, orderId: string | null) => {
  if (!orderId) return
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "order", fields: ["id", "customer_id"], filters: { id: orderId }, pagination: { take: 1 } })
  if (!data[0] || data[0].customer_id !== customerId) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "The selected order is not available")
}

export type CreateSupportConversationInput = StoreCreateSupportConversation & { customer_id: string }
export const createSupportConversationStep = createStep("create-support-conversation", async (raw: CreateSupportConversationInput, { container }) => {
  const input = parseStoreCreateSupportConversationPayload(raw)
  await validateOwnedOrder(container, raw.customer_id, input.order_id)
  if (input.protocol_series_id) {
    const eligibility = await getCustomerProtocolEligibility({
      container,
      customerId: raw.customer_id,
      seriesId: input.protocol_series_id,
    })
    if (!eligibility.purchaser) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "The selected protocol is not available",
      )
    }
  }
  const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
  if (input.client_request_id) {
    const [existing] = await service.listSupportConversations(
      { customer_id: raw.customer_id, client_request_id: input.client_request_id },
      { take: 1 },
    )
    if (existing) {
      const [message] = await service.listSupportMessages(
        { conversation_id: existing.id, client_request_id: input.client_request_id },
        { take: 1 },
      )
      return new StepResponse({ conversation: existing, message }, null)
    }
  }
  const { settings, categories } = await resolveSupportConfiguration(container)
  if (!settings.support_enabled) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Customer support is currently unavailable")
  }
  const recent = await service.listSupportMessages({ sender_type: "customer", sender_id: raw.customer_id }, { take: 100, order: { sent_at: "DESC" } })
  const hourAgo = Date.now() - 3_600_000
  if (recent.filter((item) => new Date(item.sent_at).getTime() >= hourAgo).length >= settings.customer_message_limit_per_hour) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Support message limit reached. Try again later.")
  const now = new Date()
  const category = categories.find((item: any) => item.key === input.category)
  if (category && !category.enabled) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "The selected support category is unavailable")
  }
  const conversation = await service.createSupportConversations({ customer_id: raw.customer_id, client_request_id: input.client_request_id || null, subject: input.subject, category: input.category, status: "new", priority: category?.default_priority || "normal", order_id: input.order_id, protocol_series_id: input.protocol_series_id, assigned_to_actor_id: null, opened_at: now, last_activity_at: now, latest_customer_message_at: now, latest_staff_message_at: null, first_staff_response_at: null, resolved_at: null, closed_at: null })
  const participant = await service.createSupportParticipants({ conversation_id: conversation.id, participant_type: "customer", participant_id: raw.customer_id, joined_at: now, last_read_at: now, last_notified_at: null, left_at: null })
  const message = await service.createSupportMessages({ conversation_id: conversation.id, sender_type: "customer", sender_id: raw.customer_id, body: cleanText(input.body), client_request_id: input.client_request_id || null, sent_at: now, edited_at: null })
  const acknowledgement = settings.auto_acknowledgement_enabled
    ? await service.createSupportMessages({
        conversation_id: conversation.id,
        sender_type: "system",
        sender_id: "automatic-acknowledgement",
        body: cleanText(settings.auto_acknowledgement_text),
        client_request_id: null,
        sent_at: now,
        edited_at: null,
      })
    : null
  const event = await service.createSupportStatusEvents({ conversation_id: conversation.id, from_status: null, to_status: "new", actor_type: "customer", actor_id: raw.customer_id, reason: null, occurred_at: now })
  return new StepResponse({ conversation, message }, { conversationId: conversation.id, participantId: participant.id, messageIds: [message.id, acknowledgement?.id].filter(Boolean) as string[], eventId: event.id })
}, async (ids, { container }) => {
  if (!ids) return
  const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
  await service.deleteSupportStatusEvents(ids.eventId); await service.deleteSupportMessages(ids.messageIds); await service.deleteSupportParticipants(ids.participantId); await service.deleteSupportConversations(ids.conversationId)
})

export type CustomerSupportReplyInput = StoreCreateSupportReply & { customer_id: string; conversation_id: string }
export const createCustomerSupportReplyStep = createStep("create-customer-support-reply", async (raw: CustomerSupportReplyInput, { container }) => {
  const input = parseStoreCreateSupportReplyPayload(raw)
  const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
  const conversation = await ownedConversation(service, raw.customer_id, raw.conversation_id)
  if (input.client_request_id) {
    const [existing] = await service.listSupportMessages(
      {
        conversation_id: conversation.id,
        sender_type: "customer",
        client_request_id: input.client_request_id,
      },
      { take: 1 },
    )
    if (existing) return new StepResponse(existing, null)
  }
  if (conversation.status === "closed") throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Reopen this conversation before replying")
  const recent = await service.listSupportMessages(
    { sender_type: "customer", sender_id: raw.customer_id },
    { take: 20, order: { sent_at: "DESC" } },
  )
  const { settings } = await resolveSupportConfiguration(container)
  if (
    recent.filter(
      (item) => new Date(item.sent_at).getTime() >= Date.now() - 3_600_000,
    ).length >= settings.customer_message_limit_per_hour
  ) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Support message limit reached. Try again later.",
    )
  }
  const now = new Date(); const prior = { id: conversation.id, status: conversation.status, last_activity_at: conversation.last_activity_at }
  const message = await service.createSupportMessages({ conversation_id: conversation.id, sender_type: "customer", sender_id: raw.customer_id, body: cleanText(input.body), client_request_id: input.client_request_id || null, sent_at: now, edited_at: null })
  await service.updateSupportConversations({ id: conversation.id, status: "open", last_activity_at: now, latest_customer_message_at: now, resolved_at: null, closed_at: null })
  return new StepResponse(message, { messageId: message.id, prior })
}, async (data, { container }) => { if (data) { const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE); await service.deleteSupportMessages(data.messageId); await service.updateSupportConversations(data.prior) } })

export type MutateCustomerSupportInput = StoreMutateSupportConversation & { customer_id: string; conversation_id: string }
export const mutateCustomerSupportStep = createStep("mutate-customer-support", async (raw: MutateCustomerSupportInput, { container }) => {
  const input = parseStoreMutateSupportConversationPayload(raw); const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE); const conversation = await ownedConversation(service, raw.customer_id, raw.conversation_id)
  const next = input.action === "close" ? "closed" : "open"; const prior = { id: conversation.id, status: conversation.status, closed_at: conversation.closed_at, resolved_at: conversation.resolved_at, last_activity_at: conversation.last_activity_at }; const now = new Date()
  await service.updateSupportConversations({ id: conversation.id, status: next, closed_at: next === "closed" ? now : null, resolved_at: next === "closed" ? conversation.resolved_at : null, last_activity_at: now })
  const event = await service.createSupportStatusEvents({ conversation_id: conversation.id, from_status: conversation.status, to_status: next, actor_type: "customer", actor_id: raw.customer_id, reason: null, occurred_at: now })
  return new StepResponse({ status: next }, { prior, eventId: event.id })
}, async (data, { container }) => { if (data) { const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE); await service.deleteSupportStatusEvents(data.eventId); await service.updateSupportConversations(data.prior) } })

export type AdminManageSupportInput = { conversation_id: string; actor_id: string; operation: "update" | "priority" | "assignment" | "reply" | "note"; payload: unknown }
export const adminManageSupportStep = createStep("admin-manage-support", async (raw: AdminManageSupportInput, { container }): Promise<StepResponse<any, any>> => {
  const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE); const [conversation] = await service.listSupportConversations({ id: raw.conversation_id }, { take: 1 }); if (!conversation) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Support conversation was not found"); const now = new Date()
  if (raw.operation === "reply") {
    const input = AdminCreateSupportMessage.parse(raw.payload)
    const message = await service.createSupportMessages({ conversation_id: conversation.id, sender_type: "staff", sender_id: raw.actor_id, body: cleanText(input.body), client_request_id: null, sent_at: now, edited_at: null })
    const prior = { id: conversation.id, status: conversation.status, last_activity_at: conversation.last_activity_at, latest_staff_message_at: conversation.latest_staff_message_at, first_staff_response_at: conversation.first_staff_response_at }
    await service.updateSupportConversations({ id: conversation.id, status: "waiting_for_customer", last_activity_at: now, latest_staff_message_at: now, first_staff_response_at: conversation.first_staff_response_at || now })
    const notificationId = await createCustomerNotification({
      container,
      customerId: conversation.customer_id,
      type: "support_reply",
      title: "Support replied",
      body: `There is a new reply to “${conversation.subject}”.`,
      idempotencySource: message.id,
      metadata: { conversation_id: conversation.id },
      preference: "support_reply_notifications",
      variables: { subject: `“${conversation.subject}”` },
      targetKind: "support_conversation",
      targetId: conversation.id,
    })
    return new StepResponse(message, {
      kind: "message",
      id: message.id,
      prior,
      notificationIds: notificationId ? [notificationId] : [],
    })
  }
  if (raw.operation === "note") { const input = AdminCreateSupportInternalNote.parse(raw.payload); const note = await service.createSupportInternalNotes({ conversation_id: conversation.id, actor_id: raw.actor_id, body: cleanText(input.body), edited_at: null }); return new StepResponse(note, { kind: "note", id: note.id }) }
  const input: any = raw.operation === "priority"
    ? AdminPrioritizeSupportConversation.parse(raw.payload)
    : raw.operation === "assignment"
      ? AdminAssignSupportConversation.parse(raw.payload)
      : AdminUpdateSupportConversation.parse(raw.payload)
  const prior = {
    id: conversation.id,
    status: conversation.status,
    priority: conversation.priority,
    assigned_to_actor_id: conversation.assigned_to_actor_id,
    resolved_at: conversation.resolved_at,
    closed_at: conversation.closed_at,
    last_activity_at: conversation.last_activity_at,
  }
  const changes: any = { id: conversation.id, last_activity_at: now }
  if (input.status) {
    changes.status = input.status
    changes.resolved_at = input.status === "resolved" ? now : conversation.resolved_at
    changes.closed_at = input.status === "closed" ? now : null
  }
  if (input.priority) changes.priority = input.priority
  if (input.assigned_to_actor_id !== undefined) {
    changes.assigned_to_actor_id = input.assigned_to_actor_id
  }
  await service.updateSupportConversations(changes)

  const created: Array<{ kind: "status_event" | "assignment" | "participant" | "notification"; id: string }> = []
  const reactivatedParticipants: Array<{ id: string; left_at: Date }> = []
  if (input.status && input.status !== conversation.status) {
    const event = await service.createSupportStatusEvents({ conversation_id: conversation.id, from_status: conversation.status, to_status: input.status, actor_type: "staff", actor_id: raw.actor_id, reason: input.reason, occurred_at: now })
    created.push({ kind: "status_event", id: event.id })
    const eventKey = input.status === "resolved" || input.status === "closed"
      ? "support.conversation_resolved"
      : conversation.status === "resolved" || conversation.status === "closed"
        ? "support.conversation_reopened"
        : "support.status_changed"
    const { result: statusNotification } = await emitCustomerNotificationWorkflow(container).run({
      input: {
        customer_id: conversation.customer_id,
        event_key: eventKey,
        source_id: event.id,
        variables: { status: String(input.status).replaceAll("_", " ") },
        target_kind: "support_conversation",
        target_id: conversation.id,
        secondary_target_id: null,
        metadata: {},
      },
    })
    if (statusNotification?.id) created.push({ kind: "notification", id: statusNotification.id })
  }
  if (
    input.assigned_to_actor_id !== undefined &&
    input.assigned_to_actor_id !== conversation.assigned_to_actor_id
  ) {
    const assignment = await service.createSupportAssignments({ conversation_id: conversation.id, assigned_to_actor_id: input.assigned_to_actor_id, assigned_by_actor_id: raw.actor_id, assigned_at: now })
    created.push({ kind: "assignment", id: assignment.id })

    if (input.assigned_to_actor_id) {
      const [existingParticipant] = await service.listSupportParticipants(
        {
          conversation_id: conversation.id,
          participant_type: "staff",
          participant_id: input.assigned_to_actor_id,
        },
        { take: 1 },
      )
      if (!existingParticipant) {
        const participant = await service.createSupportParticipants({
          conversation_id: conversation.id,
          participant_type: "staff",
          participant_id: input.assigned_to_actor_id,
          joined_at: now,
          last_read_at: now,
          last_notified_at: null,
          left_at: null,
        })
        created.push({ kind: "participant", id: participant.id })
      } else if (existingParticipant.left_at) {
        reactivatedParticipants.push({
          id: existingParticipant.id,
          left_at: existingParticipant.left_at,
        })
        await service.updateSupportParticipants({
          id: existingParticipant.id,
          left_at: null,
        })
      }
    }
  }
  return new StepResponse(changes, {
    kind: "update",
    prior,
    created,
    reactivatedParticipants,
  })
}, async (data, { container }) => {
  if (!data) return
  const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
  if (data.kind === "message") {
    await deleteCustomerNotifications({
      container,
      ids: data.notificationIds || [],
    })
    await service.deleteSupportMessages(data.id)
    await service.updateSupportConversations(data.prior)
    return
  }
  if (data.kind === "note") {
    await service.deleteSupportInternalNotes(data.id)
    return
  }
  for (const item of [...(data.created || [])].reverse()) {
    if (item.kind === "status_event") {
      await service.deleteSupportStatusEvents(item.id)
    } else if (item.kind === "assignment") {
      await service.deleteSupportAssignments(item.id)
    } else if (item.kind === "participant") {
      await service.deleteSupportParticipants(item.id)
    } else {
      await deleteCustomerNotifications({ container, ids: [item.id] })
    }
  }
  for (const participant of data.reactivatedParticipants || []) {
    await service.updateSupportParticipants(participant)
  }
  await service.updateSupportConversations(data.prior)
})
