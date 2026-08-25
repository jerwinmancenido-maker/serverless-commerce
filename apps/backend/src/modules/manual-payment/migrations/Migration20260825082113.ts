import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260825082113 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "manual_payment_proof_event" drop constraint if exists "manual_payment_proof_event_proof_id_revision_event_type_unique";`,
    )
    this.addSql(
      `alter table if exists "manual_payment_proof" drop constraint if exists "manual_payment_proof_payment_session_id_unique";`,
    )
    this.addSql(
      `create table if not exists "manual_payment_proof" ("id" text not null, "payment_session_id" text not null, "order_id" text not null, "customer_id" text not null, "provider_id" text not null, "file_id" text not null, "file_name" text not null, "mime_type" text not null, "size_bytes" integer not null, "checksum_sha256" text not null, "status" text check ("status" in ('pending', 'approved', 'rejected', 'expired')) not null default 'pending', "revision" integer not null default 1, "submitted_at" timestamptz not null, "expires_at" timestamptz null, "reviewed_at" timestamptz null, "submitted_by_actor_id" text not null, "reviewed_by_actor_id" text null, "rejection_reason" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "manual_payment_proof_pkey" primary key ("id"));`,
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_manual_payment_proof_payment_session_id_unique" ON "manual_payment_proof" ("payment_session_id") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_proof_deleted_at" ON "manual_payment_proof" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_proof_order_id" ON "manual_payment_proof" ("order_id") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_proof_customer_id_status" ON "manual_payment_proof" ("customer_id", "status") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_proof_status_expires_at" ON "manual_payment_proof" ("status", "expires_at") WHERE deleted_at IS NULL;`,
    )

    this.addSql(
      `create table if not exists "manual_payment_proof_event" ("id" text not null, "proof_id" text not null, "payment_session_id" text not null, "order_id" text not null, "revision" integer not null, "event_type" text check ("event_type" in ('submitted', 'resubmitted', 'approved', 'rejected', 'expired')) not null, "status" text check ("status" in ('pending', 'approved', 'rejected', 'expired')) not null, "file_id" text not null, "file_name" text not null, "mime_type" text not null, "size_bytes" integer not null, "checksum_sha256" text not null, "actor_id" text not null, "reason" text null, "occurred_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "manual_payment_proof_event_pkey" primary key ("id"));`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_proof_event_deleted_at" ON "manual_payment_proof_event" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_manual_payment_proof_event_proof_id_revision_event_type_unique" ON "manual_payment_proof_event" ("proof_id", "revision", "event_type") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_proof_event_payment_session_id_occurred_at" ON "manual_payment_proof_event" ("payment_session_id", "occurred_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_proof_event_order_id_occurred_at" ON "manual_payment_proof_event" ("order_id", "occurred_at") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "manual_payment_proof" cascade;`)

    this.addSql(`drop table if exists "manual_payment_proof_event" cascade;`)
  }
}
