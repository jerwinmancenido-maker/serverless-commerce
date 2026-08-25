import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260825111859 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "manual_payment_settlement_event" drop constraint if exists "manual_payment_settlement_event_proof_id_proof_revision_attempt_id_event_type_unique";`,
    )
    this.addSql(
      `alter table if exists "manual_payment_settlement" drop constraint if exists "manual_payment_settlement_proof_id_proof_revision_unique";`,
    )
    this.addSql(
      `create table if not exists "manual_payment_settlement" ("id" text not null, "proof_id" text not null, "proof_revision" integer not null, "payment_session_id" text not null, "order_id" text not null, "status" text check ("status" in ('not_started', 'authorizing', 'authorized', 'capturing', 'captured', 'failed')) not null default 'not_started', "attempt_count" integer not null default 0, "current_attempt_id" text null, "payment_id" text null, "capture_id" text null, "requested_at" timestamptz null, "authorization_confirmed_at" timestamptz null, "capture_confirmed_at" timestamptz null, "failed_at" timestamptz null, "last_error_category" text check ("last_error_category" in ('validation_failed', 'authorization_failed', 'capture_failed', 'reconciliation_failed', 'internal_error')) null, "last_attempted_by_actor_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "manual_payment_settlement_pkey" primary key ("id"));`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_deleted_at" ON "manual_payment_settlement" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_proof_id_proof_revision_unique" ON "manual_payment_settlement" ("proof_id", "proof_revision") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_payment_session_id_status" ON "manual_payment_settlement" ("payment_session_id", "status") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_order_id_status" ON "manual_payment_settlement" ("order_id", "status") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_payment_id" ON "manual_payment_settlement" ("payment_id") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_capture_id" ON "manual_payment_settlement" ("capture_id") WHERE deleted_at IS NULL;`,
    )

    this.addSql(
      `create table if not exists "manual_payment_settlement_event" ("id" text not null, "attempt_id" text not null, "proof_id" text not null, "proof_revision" integer not null, "payment_session_id" text not null, "order_id" text not null, "event_type" text check ("event_type" in ('settlement_requested', 'authorization_confirmed', 'capture_confirmed', 'settlement_failed', 'proof_approved_after_capture')) not null, "status" text check ("status" in ('not_started', 'authorizing', 'authorized', 'capturing', 'captured', 'failed')) not null, "actor_id" text not null, "payment_id" text null, "capture_id" text null, "error_category" text check ("error_category" in ('validation_failed', 'authorization_failed', 'capture_failed', 'reconciliation_failed', 'internal_error')) null, "occurred_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "manual_payment_settlement_event_pkey" primary key ("id"));`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_event_deleted_at" ON "manual_payment_settlement_event" ("deleted_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_event_proof_id_proof_revision_attempt_id_event_type_unique" ON "manual_payment_settlement_event" ("proof_id", "proof_revision", "attempt_id", "event_type") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_event_payment_session_id_occurred_at" ON "manual_payment_settlement_event" ("payment_session_id", "occurred_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_event_order_id_occurred_at" ON "manual_payment_settlement_event" ("order_id", "occurred_at") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_event_payment_id" ON "manual_payment_settlement_event" ("payment_id") WHERE deleted_at IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_manual_payment_settlement_event_capture_id" ON "manual_payment_settlement_event" ("capture_id") WHERE deleted_at IS NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "manual_payment_settlement" cascade;`)

    this.addSql(
      `drop table if exists "manual_payment_settlement_event" cascade;`,
    )
  }
}
