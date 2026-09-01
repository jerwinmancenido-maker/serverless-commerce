import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260901084222 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "support_message" drop constraint if exists "support_message_conversation_id_sender_type_client_request_id_unique";`);
    this.addSql(`alter table if exists "support_conversation" drop constraint if exists "support_conversation_customer_id_client_request_id_unique";`);
    this.addSql(`alter table if exists "support_setting" drop constraint if exists "support_setting_singleton_key_unique";`);
    this.addSql(`alter table if exists "support_category" drop constraint if exists "support_category_key_unique";`);
    this.addSql(`create table if not exists "support_category" ("id" text not null, "key" text not null, "label" text not null, "guidance" text null, "enabled" boolean not null default true, "sort_order" integer not null default 0, "default_priority" text check ("default_priority" in ('low', 'normal', 'high', 'urgent')) not null default 'normal', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_category_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_category_deleted_at" ON "support_category" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_support_category_key_unique" ON "support_category" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_category_enabled_sort_order" ON "support_category" ("enabled", "sort_order") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "support_setting" ("id" text not null, "singleton_key" text not null default 'default', "support_enabled" boolean not null default true, "side_panel_enabled" boolean not null default true, "display_name" text not null default 'Customer support', "response_time_message" text not null default 'We usually reply within one business day.', "timezone" text not null default 'Asia/Manila', "offline_message" text not null default 'Send us a message and our support team will follow up.', "business_hours_enabled" boolean not null default false, "business_hours" jsonb null, "attachment_uploads_enabled" boolean not null default true, "maximum_attachment_size_bytes" integer not null default 10485760, "allowed_mime_types" jsonb not null default '{"values":["image/jpeg","image/png","application/pdf"]}', "customer_message_limit_per_hour" integer not null default 12, "email_notifications_enabled" boolean not null default false, "auto_acknowledgement_enabled" boolean not null default false, "auto_acknowledgement_text" text not null default 'Thanks for contacting us. We received your message and usually reply within one business day.', "retention_days" integer null, "updated_by_actor_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_setting_deleted_at" ON "support_setting" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_support_setting_singleton_key_unique" ON "support_setting" ("singleton_key") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "support_conversation" add column if not exists "client_request_id" text null, add column if not exists "latest_customer_message_at" timestamptz null, add column if not exists "latest_staff_message_at" timestamptz null, add column if not exists "first_staff_response_at" timestamptz null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_support_conversation_customer_id_client_request_id_unique" ON "support_conversation" ("customer_id", "client_request_id") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "support_message" add column if not exists "client_request_id" text null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_support_message_conversation_id_sender_type_client_request_id_unique" ON "support_message" ("conversation_id", "sender_type", "client_request_id") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "support_participant" add column if not exists "last_read_at" timestamptz null, add column if not exists "last_notified_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "support_category" cascade;`);

    this.addSql(`drop table if exists "support_setting" cascade;`);

    this.addSql(`drop index if exists "IDX_support_conversation_customer_id_client_request_id_unique";`);
    this.addSql(`alter table if exists "support_conversation" drop column if exists "client_request_id", drop column if exists "latest_customer_message_at", drop column if exists "latest_staff_message_at", drop column if exists "first_staff_response_at";`);

    this.addSql(`drop index if exists "IDX_support_message_conversation_id_sender_type_client_request_id_unique";`);
    this.addSql(`alter table if exists "support_message" drop column if exists "client_request_id";`);

    this.addSql(`alter table if exists "support_participant" drop column if exists "last_read_at", drop column if exists "last_notified_at";`);
  }

}
