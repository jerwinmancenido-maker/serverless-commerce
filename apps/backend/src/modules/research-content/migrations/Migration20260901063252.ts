import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260901063252 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol_visibility_policy" drop constraint if exists "research_protocol_visibility_policy_series_id_unique";`);
    this.addSql(`alter table if exists "research_protocol_subscription" drop constraint if exists "research_protocol_subscription_series_id_thread_id_community_identity_id_unique";`);
    this.addSql(`alter table if exists "research_protocol_report" drop constraint if exists "research_protocol_report_thread_id_reporter_identity_id_unique";`);
    this.addSql(`alter table if exists "research_protocol_report" drop constraint if exists "research_protocol_report_comment_id_reporter_identity_id_unique";`);
    this.addSql(`alter table if exists "research_protocol_reaction" drop constraint if exists "research_protocol_reaction_comment_id_community_identity_id_unique";`);
    this.addSql(`alter table if exists "research_community_identity" drop constraint if exists "research_community_identity_display_name_unique";`);
    this.addSql(`alter table if exists "research_community_identity" drop constraint if exists "research_community_identity_customer_id_unique";`);
    this.addSql(`create table if not exists "research_community_identity" ("id" text not null, "customer_id" text not null, "display_name" text not null, "show_verified_badge" boolean not null default false, "status" text check ("status" in ('active', 'suspended')) not null default 'active', "suspended_at" timestamptz null, "suspension_reason" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_community_identity_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_community_identity_deleted_at" ON "research_community_identity" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_community_identity_customer_id_unique" ON "research_community_identity" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_community_identity_display_name_unique" ON "research_community_identity" ("display_name") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_community_identity_status" ON "research_community_identity" ("status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_comment_edit" ("id" text not null, "comment_id" text not null, "edited_by_customer_id" text not null, "previous_body" text not null, "edited_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_comment_edit_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_comment_edit_deleted_at" ON "research_protocol_comment_edit" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_comment_edit_comment_id_edited_at" ON "research_protocol_comment_edit" ("comment_id", "edited_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_moderation_event" ("id" text not null, "series_id" text not null, "thread_id" text null, "comment_id" text null, "action" text not null, "actor_id" text not null, "reason" text null, "occurred_at" timestamptz not null, "details" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_moderation_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_moderation_event_deleted_at" ON "research_protocol_moderation_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_moderation_event_series_id_occurred_at" ON "research_protocol_moderation_event" ("series_id", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_moderation_event_thread_id_occurred_at" ON "research_protocol_moderation_event" ("thread_id", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_moderation_event_comment_id_occurred_at" ON "research_protocol_moderation_event" ("comment_id", "occurred_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_reaction" ("id" text not null, "comment_id" text not null, "community_identity_id" text not null, "reaction" text check ("reaction" in ('helpful', 'like')) not null, "reacted_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_reaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_reaction_deleted_at" ON "research_protocol_reaction" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_reaction_comment_id_community_identity_id_unique" ON "research_protocol_reaction" ("comment_id", "community_identity_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_reaction_comment_id_reaction" ON "research_protocol_reaction" ("comment_id", "reaction") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_report" ("id" text not null, "series_id" text not null, "thread_id" text null, "comment_id" text null, "reporter_identity_id" text not null, "reason" text check ("reason" in ('spam', 'privacy', 'harassment', 'misleading', 'other')) not null, "details" text null, "status" text check ("status" in ('open', 'resolved', 'dismissed')) not null default 'open', "reported_at" timestamptz not null, "resolved_at" timestamptz null, "resolved_by_actor_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_report_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_report_deleted_at" ON "research_protocol_report" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_report_series_id_status_reported_at" ON "research_protocol_report" ("series_id", "status", "reported_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_report_comment_id_reporter_identity_id_unique" ON "research_protocol_report" ("comment_id", "reporter_identity_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_report_thread_id_reporter_identity_id_unique" ON "research_protocol_report" ("thread_id", "reporter_identity_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_subscription" ("id" text not null, "series_id" text not null, "thread_id" text null, "community_identity_id" text not null, "subscribed_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_subscription_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_subscription_deleted_at" ON "research_protocol_subscription" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_subscription_series_id_thread_id_community_identity_id_unique" ON "research_protocol_subscription" ("series_id", "thread_id", "community_identity_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_subscription_community_identity_id_subscribed_at" ON "research_protocol_subscription" ("community_identity_id", "subscribed_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_thread" ("id" text not null, "series_id" text not null, "community_identity_id" text not null, "title" text not null, "kind" text check ("kind" in ('idea', 'recommendation', 'question', 'general')) not null default 'question', "status" text check ("status" in ('pending', 'approved', 'rejected', 'hidden')) not null default 'pending', "is_pinned" boolean not null default false, "is_locked" boolean not null default false, "is_answered" boolean not null default false, "submitted_at" timestamptz not null, "moderated_at" timestamptz null, "moderated_by_actor_id" text null, "moderation_reason" text null, "last_activity_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_thread_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_thread_deleted_at" ON "research_protocol_thread" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_thread_series_id_status_last_activity_at" ON "research_protocol_thread" ("series_id", "status", "last_activity_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_thread_community_identity_id_submitted_at" ON "research_protocol_thread" ("community_identity_id", "submitted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_thread_series_id_is_pinned_last_activity_at" ON "research_protocol_thread" ("series_id", "is_pinned", "last_activity_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_visibility_policy" ("id" text not null, "series_id" text not null, "public_page_enabled" boolean not null default true, "public_summary" text null, "public_quick_reference" boolean not null default false, "public_faqs" boolean not null default true, "public_references" boolean not null default true, "public_products" boolean not null default true, "public_recommendations" boolean not null default true, "member_full_content" boolean not null default false, "community_read_scope" text check ("community_read_scope" in ('member', 'purchaser')) not null default 'purchaser', "community_post_scope" text check ("community_post_scope" in ('member', 'purchaser')) not null default 'purchaser', "purchaser_badge_enabled" boolean not null default true, "community_edit_window_minutes" integer not null default 15, "community_max_post_length" integer not null default 5000, "community_posts_per_hour" integer not null default 6, "community_reports_per_hour" integer not null default 10, "community_reactions_per_minute" integer not null default 30, "community_links_enabled" boolean not null default false, "community_attachments_enabled" boolean not null default false, "community_auto_hold" boolean not null default true, "community_report_hide_threshold" integer not null default 3, "search_indexable" boolean not null default true, "field_visibility" jsonb not null, "updated_by_actor_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_visibility_policy_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_visibility_policy_deleted_at" ON "research_protocol_visibility_policy" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_visibility_policy_series_id_unique" ON "research_protocol_visibility_policy" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_visibility_policy_public_page_enabled_search_indexable" ON "research_protocol_visibility_policy" ("public_page_enabled", "search_indexable") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_protocol_comment" add column if not exists "community_identity_id" text null, add column if not exists "thread_id" text null, add column if not exists "parent_comment_id" text null, add column if not exists "edited_at" timestamptz null, add column if not exists "removed_at" timestamptz null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_comment_thread_id_status_submitted_at" ON "research_protocol_comment" ("thread_id", "status", "submitted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_comment_community_identity_id_submitted_at" ON "research_protocol_comment" ("community_identity_id", "submitted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_community_identity" cascade;`);

    this.addSql(`drop table if exists "research_protocol_comment_edit" cascade;`);

    this.addSql(`drop table if exists "research_protocol_moderation_event" cascade;`);

    this.addSql(`drop table if exists "research_protocol_reaction" cascade;`);

    this.addSql(`drop table if exists "research_protocol_report" cascade;`);

    this.addSql(`drop table if exists "research_protocol_subscription" cascade;`);

    this.addSql(`drop table if exists "research_protocol_thread" cascade;`);

    this.addSql(`drop table if exists "research_protocol_visibility_policy" cascade;`);

    this.addSql(`drop index if exists "IDX_research_protocol_comment_thread_id_status_submitted_at";`);
    this.addSql(`drop index if exists "IDX_research_protocol_comment_community_identity_id_submitted_at";`);
    this.addSql(`alter table if exists "research_protocol_comment" drop column if exists "community_identity_id", drop column if exists "thread_id", drop column if exists "parent_comment_id", drop column if exists "edited_at", drop column if exists "removed_at";`);
  }

}
