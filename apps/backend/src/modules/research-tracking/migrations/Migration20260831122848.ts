import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831122848 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_measurement_consent_event" drop constraint if exists "research_measurement_consent_event_profile_id_idempotency_key_unique";`);
    this.addSql(`alter table if exists "research_measurement_revision" drop constraint if exists "research_measurement_revision_measurement_entry_id_revision_number_unique";`);
    this.addSql(`alter table if exists "research_measurement_mutation" drop constraint if exists "research_measurement_mutation_profile_id_operation_idempotency_key_unique";`);
    this.addSql(`create table if not exists "research_measurement_mutation" ("id" text not null, "operation" text check ("operation" in ('create', 'revise', 'void', 'restore')) not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "status" text check ("status" in ('processing', 'completed', 'failed')) not null, "measurement_entry_id" text null, "measurement_revision_id" text null, "response_payload" jsonb null, "error_code" text null, "completed_at" timestamptz null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_measurement_mutation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_mutation_profile_id" ON "research_measurement_mutation" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_mutation_deleted_at" ON "research_measurement_mutation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_measurement_mutation_profile_id_operation_idempotency_key_unique" ON "research_measurement_mutation" ("profile_id", "operation", "idempotency_key") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_measurement_entry" ("id" text not null, "metric_type" text check ("metric_type" in ('weight', 'waist', 'body_fat')) not null, "status" text check ("status" in ('active', 'voided')) not null default 'active', "current_revision_id" text null, "voided_at" timestamptz null, "restored_at" timestamptz null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_measurement_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_entry_profile_id" ON "research_measurement_entry" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_entry_deleted_at" ON "research_measurement_entry" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_entry_profile_id_metric_type_created_at" ON "research_measurement_entry" ("profile_id", "metric_type", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_entry_profile_id_status" ON "research_measurement_entry" ("profile_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_measurement_revision" ("id" text not null, "revision_number" integer not null, "measured_at" timestamptz not null, "local_date" timestamptz not null, "local_time" text not null, "timezone" text not null, "original_value" text not null, "original_unit" text check ("original_unit" in ('kg', 'lb', 'cm', 'in', 'percent')) not null, "normalized_value" text not null, "normalized_unit" text check ("normalized_unit" in ('kg', 'cm', 'percent')) not null, "secondary_value" text null, "note" text null, "allowlist_version" text not null, "source" text check ("source" in ('customer', 'activity', 'journal')) not null default 'customer', "routine_id" text null, "protocol_revision_id" text null, "profile_protocol_access_id" text null, "tracked_material_id" text null, "routine_log_id" text null, "prior_revision_id" text null, "measurement_entry_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_measurement_revision_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_revision_measurement_entry_id" ON "research_measurement_revision" ("measurement_entry_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_revision_deleted_at" ON "research_measurement_revision" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_measurement_revision_measurement_entry_id_revision_number_unique" ON "research_measurement_revision" ("measurement_entry_id", "revision_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_revision_measurement_entry_id_created_at" ON "research_measurement_revision" ("measurement_entry_id", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_measurement_consent_event" ("id" text not null, "event_type" text check ("event_type" in ('accepted', 'withdrawn')) not null, "consent_version" text not null, "notice_sha256" text not null, "occurred_at" timestamptz not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_measurement_consent_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_consent_event_profile_id" ON "research_measurement_consent_event" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_consent_event_deleted_at" ON "research_measurement_consent_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_measurement_consent_event_profile_id_occurred_at" ON "research_measurement_consent_event" ("profile_id", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_measurement_consent_event_profile_id_idempotency_key_unique" ON "research_measurement_consent_event" ("profile_id", "idempotency_key") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_routine_schedule_segment" ("id" text not null, "position" integer not null, "source_row_key" text null, "label" text not null, "start_offset_days" integer not null, "end_offset_days" integer null, "planned_quantity_base_units" integer not null, "base_unit" text check ("base_unit" in ('microgram', 'microliter', 'piece')) not null, "original_amount" text not null, "original_unit" text check ("original_unit" in ('mcg', 'mg', 'g', 'µL', 'mL', 'L', 'IU', 'piece')) not null, "recurrence_type" text check ("recurrence_type" in ('once', 'daily', 'weekly')) not null, "daily_interval" integer null, "weekly_interval" integer null, "weekdays" jsonb null, "local_times" jsonb not null, "notes" text null, "reference_keys" jsonb null, "routine_revision_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_routine_schedule_segment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_schedule_segment_routine_revision_id" ON "research_routine_schedule_segment" ("routine_revision_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_schedule_segment_deleted_at" ON "research_routine_schedule_segment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_schedule_segment_routine_revision_id_position" ON "research_routine_schedule_segment" ("routine_revision_id", "position") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_schedule_segment_routine_revision_id_source_row_key" ON "research_routine_schedule_segment" ("routine_revision_id", "source_row_key") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_measurement_mutation" add constraint "research_measurement_mutation_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_measurement_entry" add constraint "research_measurement_entry_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_measurement_revision" add constraint "research_measurement_revision_measurement_entry_id_foreign" foreign key ("measurement_entry_id") references "research_measurement_entry" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_measurement_consent_event" add constraint "research_measurement_consent_event_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_routine_schedule_segment" add constraint "research_routine_schedule_segment_routine_revision_id_foreign" foreign key ("routine_revision_id") references "research_routine_revision" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_journal_entry_revision" add column if not exists "routine_revision_id" text null, add column if not exists "protocol_revision_id" text null, add column if not exists "profile_protocol_access_id" text null, add column if not exists "measurement_entry_id" text null, add column if not exists "order_id" text null, add column if not exists "product_id" text null, add column if not exists "product_variant_id" text null;`);

    this.addSql(`alter table if exists "research_protocol_profile_access" add column if not exists "routine_id" text null;`);

    this.addSql(`alter table if exists "research_routine_revision" add column if not exists "source_protocol_series_id" text null, add column if not exists "source_protocol_revision_id" text null, add column if not exists "source_protocol_level_key" text null, add column if not exists "source_profile_access_id" text null, add column if not exists "source_order_id" text null, add column if not exists "source_product_id" text null, add column if not exists "source_product_variant_id" text null, add column if not exists "source_schedule_snapshot" jsonb null, add column if not exists "calculator_result_snapshot" jsonb null, add column if not exists "customer_modified_schedule" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "research_measurement_revision" drop constraint if exists "research_measurement_revision_measurement_entry_id_foreign";`);

    this.addSql(`drop table if exists "research_measurement_mutation" cascade;`);

    this.addSql(`drop table if exists "research_measurement_entry" cascade;`);

    this.addSql(`drop table if exists "research_measurement_revision" cascade;`);

    this.addSql(`drop table if exists "research_measurement_consent_event" cascade;`);

    this.addSql(`drop table if exists "research_routine_schedule_segment" cascade;`);

    this.addSql(`alter table if exists "research_journal_entry_revision" drop column if exists "routine_revision_id", drop column if exists "protocol_revision_id", drop column if exists "profile_protocol_access_id", drop column if exists "measurement_entry_id", drop column if exists "order_id", drop column if exists "product_id", drop column if exists "product_variant_id";`);

    this.addSql(`alter table if exists "research_protocol_profile_access" drop column if exists "routine_id";`);

    this.addSql(`alter table if exists "research_routine_revision" drop column if exists "source_protocol_series_id", drop column if exists "source_protocol_revision_id", drop column if exists "source_protocol_level_key", drop column if exists "source_profile_access_id", drop column if exists "source_order_id", drop column if exists "source_product_id", drop column if exists "source_product_variant_id", drop column if exists "source_schedule_snapshot", drop column if exists "calculator_result_snapshot", drop column if exists "customer_modified_schedule";`);
  }

}
