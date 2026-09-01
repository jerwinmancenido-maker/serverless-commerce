import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { CUSTOMER_SUPPORT_MODULE } from "../../modules/customer-support"
import {
  AdminUpdateSupportSettings,
  AdminUpsertSupportCategory,
} from "../../modules/customer-support/contracts"
import type CustomerSupportModuleService from "../../modules/customer-support/service"

export type UpdateSupportSettingsInput = AdminUpdateSupportSettings & {
  actor_id: string
}

export const updateSupportSettingsStep = createStep(
  "update-support-settings",
  async (raw: UpdateSupportSettingsInput, { container }) => {
    const input = AdminUpdateSupportSettings.parse(raw)
    const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
    const [existing] = await service.listSupportSettings(
      { singleton_key: "default" },
      { take: 1 },
    )
    const data: any = {
      ...input,
      business_hours: { days: input.business_hours },
      allowed_mime_types: { values: input.allowed_mime_types },
      singleton_key: "default",
      updated_by_actor_id: raw.actor_id,
    }
    const setting = existing
      ? await service.updateSupportSettings({ id: existing.id, ...data })
      : await service.createSupportSettings(data)

    return new StepResponse(setting, {
      createdId: existing ? null : setting.id,
      prior: existing || null,
    })
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
    if (data.createdId) await service.deleteSupportSettings(data.createdId)
    else if (data.prior) await service.updateSupportSettings(data.prior)
  },
)

export type UpsertSupportCategoryInput = AdminUpsertSupportCategory & {
  actor_id: string
}

export const upsertSupportCategoryStep = createStep(
  "upsert-support-category",
  async (raw: UpsertSupportCategoryInput, { container }) => {
    const input = AdminUpsertSupportCategory.parse(raw)
    const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
    const [existing] = await service.listSupportCategories(
      { key: input.key },
      { take: 1 },
    )
    const category = existing
      ? await service.updateSupportCategories({ id: existing.id, ...input })
      : await service.createSupportCategories(input)

    return new StepResponse(category, {
      createdId: existing ? null : category.id,
      prior: existing || null,
    })
  },
  async (data, { container }) => {
    if (!data) return
    const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
    if (data.createdId) await service.deleteSupportCategories(data.createdId)
    else if (data.prior) await service.updateSupportCategories(data.prior)
  },
)

export type MarkSupportReadInput = {
  participant_type: "customer" | "staff"
  participant_id: string
  conversation_id?: string
  customer_id?: string
  all?: boolean
}

export const markSupportReadStep = createStep(
  "mark-support-read",
  async (input: MarkSupportReadInput, { container }) => {
    const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
    let conversationIds: string[] = []

    if (input.participant_type === "customer") {
      if (!input.customer_id || input.customer_id !== input.participant_id) {
        throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Support read state is unavailable")
      }
      const conversations = await service.listSupportConversations({
        customer_id: input.customer_id,
        ...(input.conversation_id ? { id: input.conversation_id } : {}),
      })
      conversationIds = conversations.map((conversation) => conversation.id)
    } else if (input.conversation_id) {
      const [conversation] = await service.listSupportConversations(
        { id: input.conversation_id },
        { take: 1 },
      )
      if (!conversation) {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, "Support conversation was not found")
      }
      conversationIds = [conversation.id]
    }

    if (!conversationIds.length) return new StepResponse({ marked: 0 }, [])

    const now = new Date()
    const prior: Array<{ id: string; last_read_at: Date | null }> = []
    for (const conversationId of conversationIds) {
      const [participant] = await service.listSupportParticipants(
        {
          conversation_id: conversationId,
          participant_type: input.participant_type,
          participant_id: input.participant_id,
        },
        { take: 1 },
      )
      if (participant) {
        prior.push({ id: participant.id, last_read_at: participant.last_read_at })
        await service.updateSupportParticipants({ id: participant.id, last_read_at: now })
      } else {
        const created = await service.createSupportParticipants({
          conversation_id: conversationId,
          participant_type: input.participant_type,
          participant_id: input.participant_id,
          joined_at: now,
          last_read_at: now,
          last_notified_at: null,
          left_at: null,
        })
        prior.push({ id: created.id, last_read_at: null })
      }
    }

    return new StepResponse({ marked: conversationIds.length }, prior)
  },
)
