import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831192948 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_replenishment_preference" drop constraint if exists "research_replenishment_preference_profile_id_routine_id_unique";`);
    this.addSql(`alter table if exists "research_reminder_preference" drop constraint if exists "research_reminder_preference_profile_id_unique";`);
    this.addSql(`alter table if exists "research_calculation_snapshot" drop constraint if exists "research_calculation_snapshot_profile_id_idempotency_key_unique";`);
    this.addSql(`alter table if exists "research_journal_attachment" drop constraint if exists "research_journal_attachment_file_id_unique";`);
    this.addSql(`alter table if exists "research_notification" drop constraint if exists "research_notification_idempotency_key_unique";`);
    this.addSql(`alter table if exists "research_hub_setting" drop constraint if exists "research_hub_setting_setting_key_unique";`);
    this.addSql(`create table if not exists "research_hub_setting" ("id" text not null, "setting_key" text not null default 'global', "in_app_enabled" boolean not null default true, "email_enabled" boolean not null default false, "browser_push_enabled" boolean not null default false, "mobile_push_enabled" boolean not null default false, "default_timezone" text not null default 'Asia/Manila', "default_lead_minutes" jsonb not null, "default_quiet_hours_start" text not null default '22:00', "default_quiet_hours_end" text not null default '07:00', "calendar_past_days" integer not null default 365, "calendar_future_days" integer not null default 365, "reorder_now_days" integer not null default 14, "plan_reorder_days" integer not null default 30, "default_replenishment_snooze_days" integer not null default 7, "attachment_max_bytes" integer not null default 10485760, "attachment_allowed_types" jsonb not null, "reminders_enabled" boolean not null default true, "calendar_enabled" boolean not null default true, "calculator_snapshots_enabled" boolean not null default true, "goals_enabled" boolean not null default true, "referrals_enabled" boolean not null default false, "updated_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_hub_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_hub_setting_deleted_at" ON "research_hub_setting" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_hub_setting_setting_key_unique" ON "research_hub_setting" ("setting_key") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_notification" ("id" text not null, "profile_id" text not null, "routine_id" text null, "routine_revision_id" text null, "occurrence_id" text null, "type" text check ("type" in ('routine_reminder', 'daily_summary', 'weekly_summary', 'replenishment', 'progress', 'journal_prompt', 'reward')) not null, "channel" text check ("channel" in ('in_app', 'email', 'browser_push', 'mobile_push')) not null, "title" text not null, "body" text not null, "status" text check ("status" in ('scheduled', 'unread', 'read', 'snoozed', 'dismissed', 'failed')) not null, "scheduled_for" timestamptz not null, "available_at" timestamptz not null, "delivered_at" timestamptz null, "read_at" timestamptz null, "dismissed_at" timestamptz null, "snoozed_until" timestamptz null, "source_local_date" timestamptz null, "source_local_time" text null, "timezone" text not null, "idempotency_key" text not null, "template_version" text not null default 'in-app-routine-reminder-v1', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_notification_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_notification_deleted_at" ON "research_notification" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_notification_idempotency_key_unique" ON "research_notification" ("idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_notification_profile_id_status_available_at" ON "research_notification" ("profile_id", "status", "available_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_notification_occurrence_id_channel" ON "research_notification" ("occurrence_id", "channel") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_notification_delivery_attempt" ("id" text not null, "notification_id" text not null, "channel" text check ("channel" in ('in_app', 'email', 'browser_push', 'mobile_push')) not null, "status" text check ("status" in ('delivered', 'failed', 'skipped')) not null, "attempted_at" timestamptz not null, "provider_reference" text null, "error_code" text null, "detail" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_notification_delivery_attempt_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_notification_delivery_attempt_deleted_at" ON "research_notification_delivery_attempt" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_notification_delivery_attempt_notification_id_attempted_at" ON "research_notification_delivery_attempt" ("notification_id", "attempted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_personal_goal" ("id" text not null, "profile_id" text not null, "goal_type" text check ("goal_type" in ('routine_completions', 'journal_days', 'measurements', 'routine_streak')) not null, "title" text not null, "target_count" integer not null, "period" text check ("period" in ('weekly', 'monthly', 'ongoing')) not null, "routine_id" text null, "starts_on" timestamptz not null, "ends_on" timestamptz null, "status" text check ("status" in ('active', 'completed', 'archived')) not null default 'active', "completed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_personal_goal_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_personal_goal_profile_id" ON "research_personal_goal" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_personal_goal_deleted_at" ON "research_personal_goal" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_personal_goal_profile_id_status_starts_on" ON "research_personal_goal" ("profile_id", "status", "starts_on") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_journal_attachment" ("id" text not null, "profile_id" text not null, "journal_entry_id" text not null, "journal_revision_id" text null, "file_id" text not null, "file_name" text not null, "mime_type" text not null, "size_bytes" integer not null, "checksum_sha256" text not null, "scan_status" text check ("scan_status" in ('pending', 'unavailable', 'clean', 'quarantined')) not null default 'unavailable', "status" text check ("status" in ('active', 'removed')) not null default 'active', "uploaded_at" timestamptz not null, "removed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_journal_attachment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_attachment_profile_id" ON "research_journal_attachment" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_attachment_deleted_at" ON "research_journal_attachment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_attachment_profile_id_journal_entry_id_status" ON "research_journal_attachment" ("profile_id", "journal_entry_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_journal_attachment_file_id_unique" ON "research_journal_attachment" ("file_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_calculation_snapshot" ("id" text not null, "profile_id" text not null, "mode" text check ("mode" in ('quick', 'protocol', 'compare')) not null, "title" text not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "protocol_series_id" text null, "protocol_revision_id" text null, "profile_protocol_access_id" text null, "routine_id" text null, "journal_entry_id" text null, "input_snapshot" jsonb not null, "result_snapshot" jsonb not null, "unit_context_snapshot" jsonb not null, "saved_at" timestamptz not null, "archived_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_calculation_snapshot_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_calculation_snapshot_profile_id" ON "research_calculation_snapshot" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_calculation_snapshot_deleted_at" ON "research_calculation_snapshot" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_calculation_snapshot_profile_id_idempotency_key_unique" ON "research_calculation_snapshot" ("profile_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_calculation_snapshot_profile_id_saved_at" ON "research_calculation_snapshot" ("profile_id", "saved_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_calculation_snapshot_profile_id_routine_id" ON "research_calculation_snapshot" ("profile_id", "routine_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_calculation_snapshot_profile_id_journal_entry_id" ON "research_calculation_snapshot" ("profile_id", "journal_entry_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_reminder_preference" ("id" text not null, "profile_id" text not null, "enabled" boolean not null default true, "timezone" text not null default 'Asia/Manila', "lead_minutes" jsonb not null, "quiet_hours_enabled" boolean not null default false, "quiet_hours_start" text null, "quiet_hours_end" text null, "daily_summary" boolean not null default false, "weekly_summary" boolean not null default false, "replenishment_reminders" boolean not null default true, "progress_reminders" boolean not null default false, "journal_prompts" boolean not null default false, "reward_notifications" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_reminder_preference_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_reminder_preference_deleted_at" ON "research_reminder_preference" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_reminder_preference_profile_id_unique" ON "research_reminder_preference" ("profile_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_replenishment_preference" ("id" text not null, "profile_id" text not null, "routine_id" text not null, "state" text check ("state" in ('visible', 'snoozed', 'dismissed')) not null default 'visible', "remind_at" timestamptz null, "last_action_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_replenishment_preference_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_replenishment_preference_profile_id" ON "research_replenishment_preference" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_replenishment_preference_deleted_at" ON "research_replenishment_preference" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_replenishment_preference_profile_id_routine_id_unique" ON "research_replenishment_preference" ("profile_id", "routine_id") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_personal_goal" add constraint "research_personal_goal_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_journal_attachment" add constraint "research_journal_attachment_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_calculation_snapshot" add constraint "research_calculation_snapshot_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_replenishment_preference" add constraint "research_replenishment_preference_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_hub_setting" cascade;`);

    this.addSql(`drop table if exists "research_notification" cascade;`);

    this.addSql(`drop table if exists "research_notification_delivery_attempt" cascade;`);

    this.addSql(`drop table if exists "research_personal_goal" cascade;`);

    this.addSql(`drop table if exists "research_journal_attachment" cascade;`);

    this.addSql(`drop table if exists "research_calculation_snapshot" cascade;`);

    this.addSql(`drop table if exists "research_reminder_preference" cascade;`);

    this.addSql(`drop table if exists "research_replenishment_preference" cascade;`);
  }

}
