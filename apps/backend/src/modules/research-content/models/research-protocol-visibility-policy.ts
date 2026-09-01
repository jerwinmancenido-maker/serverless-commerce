import { model } from "@medusajs/framework/utils"

import {
  RESEARCH_PROTOCOL_ACCESS_LEVELS,
  RESEARCH_PROTOCOL_COMMUNITY_SCOPES,
} from "../contracts/research-protocol-visibility"

const ResearchProtocolVisibilityPolicy = model
  .define("research_protocol_visibility_policy", {
    id: model.id().primaryKey(),
    series_id: model.text(),
    public_page_enabled: model.boolean().default(true),
    public_summary: model.text().nullable(),
    public_quick_reference: model.boolean().default(false),
    public_faqs: model.boolean().default(true),
    public_references: model.boolean().default(true),
    public_products: model.boolean().default(true),
    public_recommendations: model.boolean().default(true),
    member_full_content: model.boolean().default(false),
    community_read_scope: model
      .enum([...RESEARCH_PROTOCOL_COMMUNITY_SCOPES])
      .default("purchaser"),
    community_post_scope: model
      .enum([...RESEARCH_PROTOCOL_COMMUNITY_SCOPES])
      .default("purchaser"),
    purchaser_badge_enabled: model.boolean().default(true),
    community_edit_window_minutes: model.number().default(15),
    community_max_post_length: model.number().default(5000),
    community_posts_per_hour: model.number().default(6),
    community_reports_per_hour: model.number().default(10),
    community_reactions_per_minute: model.number().default(30),
    community_links_enabled: model.boolean().default(false),
    community_attachments_enabled: model.boolean().default(false),
    community_auto_hold: model.boolean().default(true),
    community_report_hide_threshold: model.number().default(3),
    search_indexable: model.boolean().default(true),
    field_visibility: model.json<
      Record<string, (typeof RESEARCH_PROTOCOL_ACCESS_LEVELS)[number]>
    >(),
    updated_by_actor_id: model.text().nullable(),
  })
  .indexes([
    { on: ["series_id"], unique: true },
    { on: ["public_page_enabled", "search_indexable"] },
  ])

export default ResearchProtocolVisibilityPolicy
