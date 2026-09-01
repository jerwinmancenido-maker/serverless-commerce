import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import {
  AdminUpdateResearchProtocolVisibility,
  type AdminUpdateResearchProtocolVisibility as UpdateRequest,
} from "../../modules/research-content/contracts/research-protocol-visibility"
import type ResearchContentModuleService from "../../modules/research-content/service"

export type UpdateResearchProtocolVisibilityWorkflowInput = UpdateRequest & {
  series_id: string
  actorId: string
}

type VisibilityCompensation =
  | { mode: "created"; id: string }
  | { mode: "updated"; previous: Record<string, unknown> }

const snapshotPolicy = (policy: any): Record<string, unknown> => ({
  id: policy.id,
  series_id: policy.series_id,
  public_page_enabled: policy.public_page_enabled,
  public_summary: policy.public_summary,
  public_quick_reference: policy.public_quick_reference,
  public_faqs: policy.public_faqs,
  public_references: policy.public_references,
  public_products: policy.public_products,
  public_recommendations: policy.public_recommendations,
  member_full_content: policy.member_full_content,
  community_read_scope: policy.community_read_scope,
  community_post_scope: policy.community_post_scope,
  purchaser_badge_enabled: policy.purchaser_badge_enabled,
  community_edit_window_minutes: policy.community_edit_window_minutes,
  community_max_post_length: policy.community_max_post_length,
  community_posts_per_hour: policy.community_posts_per_hour,
  community_reports_per_hour: policy.community_reports_per_hour,
  community_reactions_per_minute: policy.community_reactions_per_minute,
  community_links_enabled: policy.community_links_enabled,
  community_attachments_enabled: policy.community_attachments_enabled,
  community_auto_hold: policy.community_auto_hold,
  community_report_hide_threshold: policy.community_report_hide_threshold,
  search_indexable: policy.search_indexable,
  field_visibility: policy.field_visibility,
  updated_by_actor_id: policy.updated_by_actor_id,
})

export const updateResearchProtocolVisibilityStep = createStep(
  "update-research-protocol-visibility",
  async (rawInput: UpdateResearchProtocolVisibilityWorkflowInput, { container }) => {
    const actorId = rawInput.actorId?.trim()
    if (!actorId) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Authenticated Admin actor is required",
      )
    }
    const input = AdminUpdateResearchProtocolVisibility.parse({
      reason: rawInput.reason,
      public_page_enabled: rawInput.public_page_enabled,
      public_summary: rawInput.public_summary,
      public_quick_reference: rawInput.public_quick_reference,
      public_faqs: rawInput.public_faqs,
      public_references: rawInput.public_references,
      public_products: rawInput.public_products,
      public_recommendations: rawInput.public_recommendations,
      member_full_content: rawInput.member_full_content,
      community_read_scope: rawInput.community_read_scope,
      community_post_scope: rawInput.community_post_scope,
      purchaser_badge_enabled: rawInput.purchaser_badge_enabled,
      community_edit_window_minutes: rawInput.community_edit_window_minutes,
      community_max_post_length: rawInput.community_max_post_length,
      community_posts_per_hour: rawInput.community_posts_per_hour,
      community_reports_per_hour: rawInput.community_reports_per_hour,
      community_reactions_per_minute: rawInput.community_reactions_per_minute,
      community_links_enabled: rawInput.community_links_enabled,
      community_attachments_enabled: rawInput.community_attachments_enabled,
      community_auto_hold: rawInput.community_auto_hold,
      community_report_hide_threshold: rawInput.community_report_hide_threshold,
      search_indexable: rawInput.search_indexable,
      field_visibility: rawInput.field_visibility,
    })
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const [series] = await service.listResearchProtocolSeries(
      { id: rawInput.series_id, archived_at: null },
      { take: 1 },
    )
    if (!series) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Research protocol was not found",
      )
    }
    const [existing] = await service.listResearchProtocolVisibilityPolicies(
      { series_id: series.id },
      { take: 1 },
    )
    const values = {
      series_id: series.id,
      public_page_enabled: input.public_page_enabled,
      public_summary: input.public_summary,
      public_quick_reference: input.public_quick_reference,
      public_faqs: input.public_faqs,
      public_references: input.public_references,
      public_products: input.public_products,
      public_recommendations: input.public_recommendations,
      member_full_content: input.member_full_content,
      community_read_scope: input.community_read_scope,
      community_post_scope: input.community_post_scope,
      purchaser_badge_enabled: input.purchaser_badge_enabled,
      community_edit_window_minutes: input.community_edit_window_minutes,
      community_max_post_length: input.community_max_post_length,
      community_posts_per_hour: input.community_posts_per_hour,
      community_reports_per_hour: input.community_reports_per_hour,
      community_reactions_per_minute: input.community_reactions_per_minute,
      community_links_enabled: input.community_links_enabled,
      community_attachments_enabled: input.community_attachments_enabled,
      community_auto_hold: input.community_auto_hold,
      community_report_hide_threshold: input.community_report_hide_threshold,
      search_indexable: input.search_indexable,
      field_visibility: input.field_visibility,
      updated_by_actor_id: actorId,
    }
    const policy = existing
      ? await service.updateResearchProtocolVisibilityPolicies({
          id: existing.id,
          ...values,
        })
      : await service.createResearchProtocolVisibilityPolicies(values)
    const compensation: VisibilityCompensation = existing
      ? { mode: "updated", previous: snapshotPolicy(existing) }
      : { mode: "created", id: policy.id }
    return new StepResponse(policy, compensation)
  },
  async (compensation: VisibilityCompensation | undefined, { container }) => {
    if (!compensation) return
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    if (compensation.mode === "created") {
      await service.deleteResearchProtocolVisibilityPolicies(compensation.id)
      return
    }
    await service.updateResearchProtocolVisibilityPolicies(
      compensation.previous as any,
    )
  },
)

export const recordResearchProtocolVisibilityAuditStep = createStep(
  "record-research-protocol-visibility-audit",
  async (input: UpdateResearchProtocolVisibilityWorkflowInput, { container }) => {
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const event = await service.createResearchProtocolModerationEvents({
      series_id: input.series_id,
      thread_id: null,
      comment_id: null,
      action: "visibility_updated",
      actor_id: input.actorId,
      reason: input.reason,
      occurred_at: new Date(),
      details: {
        public_page_enabled: input.public_page_enabled,
        community_read_scope: input.community_read_scope,
        community_post_scope: input.community_post_scope,
        search_indexable: input.search_indexable,
      },
    })
    return new StepResponse(event, event.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) return
    await container
      .resolve<ResearchContentModuleService>(RESEARCH_CONTENT_MODULE)
      .deleteResearchProtocolModerationEvents(id)
  },
)
