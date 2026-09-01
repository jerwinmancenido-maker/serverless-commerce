import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260901063254 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "support_participant" drop constraint if exists "support_participant_conversation_id_participant_type_participant_id_unique";`);
    this.addSql(`alter table if exists "support_attachment" drop constraint if exists "support_attachment_file_id_unique";`);
    this.addSql(`create table if not exists "support_assignment" ("id" text not null, "conversation_id" text not null, "assigned_to_actor_id" text null, "assigned_by_actor_id" text not null, "assigned_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_assignment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_assignment_deleted_at" ON "support_assignment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_assignment_conversation_id_assigned_at" ON "support_assignment" ("conversation_id", "assigned_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "support_attachment" ("id" text not null, "conversation_id" text not null, "message_id" text not null, "file_id" text not null, "file_name" text not null, "mime_type" text not null, "size_bytes" integer not null, "checksum_sha256" text not null, "scan_status" text check ("scan_status" in ('pending', 'clean', 'blocked', 'unavailable')) not null default 'unavailable', "status" text check ("status" in ('active', 'removed')) not null default 'active', "uploaded_at" timestamptz not null, "removed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_attachment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_attachment_deleted_at" ON "support_attachment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_attachment_conversation_id_message_id" ON "support_attachment" ("conversation_id", "message_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_support_attachment_file_id_unique" ON "support_attachment" ("file_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "support_conversation" ("id" text not null, "customer_id" text not null, "subject" text not null, "category" text check ("category" in ('order', 'payment', 'shipping', 'product', 'protocol_access', 'account', 'rewards', 'technical', 'other')) not null, "status" text check ("status" in ('new', 'open', 'waiting_for_customer', 'resolved', 'closed')) not null default 'new', "priority" text check ("priority" in ('low', 'normal', 'high', 'urgent')) not null default 'normal', "order_id" text null, "protocol_series_id" text null, "assigned_to_actor_id" text null, "opened_at" timestamptz not null, "last_activity_at" timestamptz not null, "resolved_at" timestamptz null, "closed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_conversation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_conversation_deleted_at" ON "support_conversation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_conversation_customer_id_last_activity_at" ON "support_conversation" ("customer_id", "last_activity_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_conversation_status_priority_last_activity_at" ON "support_conversation" ("status", "priority", "last_activity_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_conversation_assigned_to_actor_id_status" ON "support_conversation" ("assigned_to_actor_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_conversation_order_id" ON "support_conversation" ("order_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "support_internal_note" ("id" text not null, "conversation_id" text not null, "actor_id" text not null, "body" text not null, "edited_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_internal_note_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_internal_note_deleted_at" ON "support_internal_note" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_internal_note_conversation_id_created_at" ON "support_internal_note" ("conversation_id", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "support_message" ("id" text not null, "conversation_id" text not null, "sender_type" text check ("sender_type" in ('customer', 'staff')) not null, "sender_id" text not null, "body" text not null, "sent_at" timestamptz not null, "edited_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_message_deleted_at" ON "support_message" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_message_conversation_id_sent_at" ON "support_message" ("conversation_id", "sent_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_message_sender_type_sender_id_sent_at" ON "support_message" ("sender_type", "sender_id", "sent_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "support_participant" ("id" text not null, "conversation_id" text not null, "participant_type" text check ("participant_type" in ('customer', 'staff')) not null, "participant_id" text not null, "joined_at" timestamptz not null, "left_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_participant_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_participant_deleted_at" ON "support_participant" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_support_participant_conversation_id_participant_type_participant_id_unique" ON "support_participant" ("conversation_id", "participant_type", "participant_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "support_status_event" ("id" text not null, "conversation_id" text not null, "from_status" text null, "to_status" text not null, "actor_type" text check ("actor_type" in ('customer', 'staff', 'system')) not null, "actor_id" text null, "reason" text null, "occurred_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_status_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_status_event_deleted_at" ON "support_status_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_status_event_conversation_id_occurred_at" ON "support_status_event" ("conversation_id", "occurred_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "support_assignment" cascade;`);

    this.addSql(`drop table if exists "support_attachment" cascade;`);

    this.addSql(`drop table if exists "support_conversation" cascade;`);

    this.addSql(`drop table if exists "support_internal_note" cascade;`);

    this.addSql(`drop table if exists "support_message" cascade;`);

    this.addSql(`drop table if exists "support_participant" cascade;`);

    this.addSql(`drop table if exists "support_status_event" cascade;`);
  }

}
