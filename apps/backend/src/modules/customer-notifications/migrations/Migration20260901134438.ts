import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260901134438 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_notification_template_revision" drop constraint if exists "customer_notification_template_revision_template_id_version_unique";`);
    this.addSql(`alter table if exists "customer_notification_template" drop constraint if exists "customer_notification_template_event_key_unique";`);
    this.addSql(`alter table if exists "customer_notification_preference" drop constraint if exists "customer_notification_preference_customer_id_event_key_unique";`);
    this.addSql(`alter table if exists "customer_notification" drop constraint if exists "customer_notification_idempotency_key_unique";`);
    this.addSql(`create table if not exists "customer_notification" ("id" text not null, "customer_id" text not null, "event_key" text not null, "category" text check ("category" in ('support', 'community', 'protocols', 'research', 'rewards', 'system')) not null, "priority" text check ("priority" in ('low', 'normal', 'high', 'urgent')) not null, "title" text not null, "body" text not null, "target_kind" text check ("target_kind" in ('support_conversation', 'community_thread', 'protocol', 'research_hub_section', 'rewards', 'notifications')) not null, "target_id" text null, "secondary_target_id" text null, "action_label" text null, "status" text check ("status" in ('scheduled', 'unread', 'read', 'snoozed', 'archived')) not null, "scheduled_for" timestamptz not null, "available_at" timestamptz not null, "delivered_at" timestamptz null, "read_at" timestamptz null, "archived_at" timestamptz null, "snoozed_until" timestamptz null, "expires_at" timestamptz null, "idempotency_key" text not null, "group_key" text null, "template_revision_id" text null, "payload_schema_version" text not null default '1', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_notification_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_deleted_at" ON "customer_notification" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_notification_idempotency_key_unique" ON "customer_notification" ("idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_customer_id_status_available_at" ON "customer_notification" ("customer_id", "status", "available_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_customer_id_created_at" ON "customer_notification" ("customer_id", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_customer_id_category" ON "customer_notification" ("customer_id", "category") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_group_key_status_available_at" ON "customer_notification" ("group_key", "status", "available_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customer_notification_audit_event" ("id" text not null, "event_type" text check ("event_type" in ('template_created', 'template_updated', 'template_restored', 'test_sent', 'preference_changed', 'legacy_backfilled', 'retention_expired')) not null, "event_key" text null, "notification_id" text null, "actor_type" text check ("actor_type" in ('customer', 'admin', 'system')) not null, "actor_id" text null, "details" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_notification_audit_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_audit_event_deleted_at" ON "customer_notification_audit_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_audit_event_event_type_created_at" ON "customer_notification_audit_event" ("event_type", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customer_notification_delivery_attempt" ("id" text not null, "notification_id" text not null, "channel" text check ("channel" in ('in_app', 'email', 'browser_push', 'mobile_push', 'sms')) not null, "status" text check ("status" in ('delivered', 'failed', 'skipped', 'retry_pending')) not null, "attempted_at" timestamptz not null, "provider_reference" text null, "failure_code" text null, "retry_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_notification_delivery_attempt_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_delivery_attempt_deleted_at" ON "customer_notification_delivery_attempt" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_delivery_attempt_notification_id_attempted_at" ON "customer_notification_delivery_attempt" ("notification_id", "attempted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_delivery_attempt_status_attempted_at" ON "customer_notification_delivery_attempt" ("status", "attempted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customer_notification_preference" ("id" text not null, "customer_id" text not null, "event_key" text not null, "enabled" boolean not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_notification_preference_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_preference_deleted_at" ON "customer_notification_preference" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_notification_preference_customer_id_event_key_unique" ON "customer_notification_preference" ("customer_id", "event_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_preference_customer_id" ON "customer_notification_preference" ("customer_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customer_notification_template" ("id" text not null, "event_key" text not null, "display_name" text not null, "category" text check ("category" in ('support', 'community', 'protocols', 'research', 'rewards', 'system')) not null, "enabled" boolean not null default true, "default_priority" text check ("default_priority" in ('low', 'normal', 'high', 'urgent')) not null, "default_enabled" boolean not null default true, "customer_can_disable" boolean not null default true, "current_revision_id" text null, "retention_days" integer not null default 180, "updated_by_actor_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_notification_template_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_template_deleted_at" ON "customer_notification_template" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_notification_template_event_key_unique" ON "customer_notification_template" ("event_key") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customer_notification_template_revision" ("id" text not null, "template_id" text not null, "event_key" text not null, "version" integer not null, "title_template" text not null, "body_template" text not null, "action_label" text null, "allowed_variables" jsonb not null, "changed_by_actor_id" text not null, "change_reason" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_notification_template_revision_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_template_revision_deleted_at" ON "customer_notification_template_revision" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_notification_template_revision_template_id_version_unique" ON "customer_notification_template_revision" ("template_id", "version") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_notification_template_revision_event_key_created_at" ON "customer_notification_template_revision" ("event_key", "created_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_notification" cascade;`);

    this.addSql(`drop table if exists "customer_notification_audit_event" cascade;`);

    this.addSql(`drop table if exists "customer_notification_delivery_attempt" cascade;`);

    this.addSql(`drop table if exists "customer_notification_preference" cascade;`);

    this.addSql(`drop table if exists "customer_notification_template" cascade;`);

    this.addSql(`drop table if exists "customer_notification_template_revision" cascade;`);
  }

}
