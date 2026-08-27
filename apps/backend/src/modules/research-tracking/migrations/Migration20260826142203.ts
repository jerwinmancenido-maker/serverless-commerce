import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260826142203 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_routine_log" drop constraint if exists "research_routine_log_profile_id_occurrence_id_unique";`);
    this.addSql(`alter table if exists "research_routine_mutation" drop constraint if exists "research_routine_mutation_profile_id_operation_idempotency_key_unique";`);
    this.addSql(`create table if not exists "research_routine_mutation" ("id" text not null, "operation" text not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "status" text check ("status" in ('processing', 'completed', 'failed')) not null, "result_type" text null, "result_id" text null, "response_payload" jsonb null, "error_code" text null, "completed_at" timestamptz null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_routine_mutation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_mutation_profile_id" ON "research_routine_mutation" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_mutation_deleted_at" ON "research_routine_mutation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_routine_mutation_profile_id_operation_idempotency_key_unique" ON "research_routine_mutation" ("profile_id", "operation", "idempotency_key") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_routine" ("id" text not null, "status" text check ("status" in ('active', 'archived')) not null default 'active', "current_revision_id" text null, "archived_at" timestamptz null, "profile_id" text not null, "tracked_material_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_routine_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_profile_id" ON "research_routine" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_tracked_material_id" ON "research_routine" ("tracked_material_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_deleted_at" ON "research_routine" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_profile_id_status" ON "research_routine" ("profile_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_profile_id_tracked_material_id" ON "research_routine" ("profile_id", "tracked_material_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_routine_state_transition" ("id" text not null, "operation" text check ("operation" in ('archive', 'resume')) not null, "effective_date" timestamptz not null, "profile_id" text not null, "routine_id" text not null, "mutation_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_routine_state_transition_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_state_transition_profile_id" ON "research_routine_state_transition" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_state_transition_routine_id" ON "research_routine_state_transition" ("routine_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_state_transition_mutation_id" ON "research_routine_state_transition" ("mutation_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_state_transition_deleted_at" ON "research_routine_state_transition" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_state_transition_routine_id_effective_date" ON "research_routine_state_transition" ("routine_id", "effective_date") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_routine_revision" ("id" text not null, "label" text not null, "planned_quantity_base_units" integer not null, "base_unit" text check ("base_unit" in ('microgram', 'microliter', 'piece')) not null, "timezone" text not null, "recurrence_type" text check ("recurrence_type" in ('once', 'daily', 'weekly')) not null, "daily_interval" integer null, "weekly_interval" integer null, "weekdays" jsonb null, "local_time" text not null, "start_date" timestamptz not null, "end_date" timestamptz null, "effective_from_date" timestamptz not null, "superseded_revision_id" text null, "routine_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_routine_revision_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_revision_routine_id" ON "research_routine_revision" ("routine_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_revision_deleted_at" ON "research_routine_revision" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_revision_routine_id_created_at" ON "research_routine_revision" ("routine_id", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_routine_log" ("id" text not null, "occurrence_id" text not null, "status" text check ("status" in ('confirmed', 'voided')) not null default 'confirmed', "current_revision_id" text null, "profile_id" text not null, "routine_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_routine_log_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_profile_id" ON "research_routine_log" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_routine_id" ON "research_routine_log" ("routine_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_deleted_at" ON "research_routine_log" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_profile_id_status" ON "research_routine_log" ("profile_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_routine_log_profile_id_occurrence_id_unique" ON "research_routine_log" ("profile_id", "occurrence_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_routine_log_revision" ("id" text not null, "occurrence_id" text not null, "local_date" timestamptz not null, "local_time" text not null, "timezone" text not null, "confirmed_quantity_base_units" integer not null, "base_unit" text check ("base_unit" in ('microgram', 'microliter', 'piece')) not null, "operation" text check ("operation" in ('confirm', 'revise', 'void', 'restore')) not null, "prior_revision_id" text null, "profile_id" text not null, "routine_id" text not null, "log_id" text not null, "routine_revision_id" text not null, "supply_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_routine_log_revision_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_revision_profile_id" ON "research_routine_log_revision" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_revision_routine_id" ON "research_routine_log_revision" ("routine_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_revision_log_id" ON "research_routine_log_revision" ("log_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_revision_routine_revision_id" ON "research_routine_log_revision" ("routine_revision_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_revision_supply_id" ON "research_routine_log_revision" ("supply_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_revision_deleted_at" ON "research_routine_log_revision" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_routine_log_revision_log_id_created_at" ON "research_routine_log_revision" ("log_id", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_supply_adjustment" ("id" text not null, "quantity_delta_base_units" integer not null, "operation" text check ("operation" in ('confirm', 'revise', 'void', 'restore')) not null, "profile_id" text not null, "supply_id" text not null, "log_id" text not null, "log_revision_id" text not null, "mutation_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_supply_adjustment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_adjustment_profile_id" ON "research_supply_adjustment" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_adjustment_supply_id" ON "research_supply_adjustment" ("supply_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_adjustment_log_id" ON "research_supply_adjustment" ("log_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_adjustment_log_revision_id" ON "research_supply_adjustment" ("log_revision_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_adjustment_mutation_id" ON "research_supply_adjustment" ("mutation_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_adjustment_deleted_at" ON "research_supply_adjustment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_adjustment_profile_id_created_at" ON "research_supply_adjustment" ("profile_id", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_adjustment_supply_id_created_at" ON "research_supply_adjustment" ("supply_id", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_routine_mutation" add constraint "research_routine_mutation_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_routine" add constraint "research_routine_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_routine" add constraint "research_routine_tracked_material_id_foreign" foreign key ("tracked_material_id") references "tracked_material" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_routine_state_transition" add constraint "research_routine_state_transition_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_routine_state_transition" add constraint "research_routine_state_transition_routine_id_foreign" foreign key ("routine_id") references "research_routine" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_routine_state_transition" add constraint "research_routine_state_transition_mutation_id_foreign" foreign key ("mutation_id") references "research_routine_mutation" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_routine_revision" add constraint "research_routine_revision_routine_id_foreign" foreign key ("routine_id") references "research_routine" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_routine_log" add constraint "research_routine_log_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_routine_log" add constraint "research_routine_log_routine_id_foreign" foreign key ("routine_id") references "research_routine" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_routine_log_revision" add constraint "research_routine_log_revision_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_routine_log_revision" add constraint "research_routine_log_revision_routine_id_foreign" foreign key ("routine_id") references "research_routine" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_routine_log_revision" add constraint "research_routine_log_revision_log_id_foreign" foreign key ("log_id") references "research_routine_log" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_routine_log_revision" add constraint "research_routine_log_revision_routine_revision_id_foreign" foreign key ("routine_revision_id") references "research_routine_revision" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_routine_log_revision" add constraint "research_routine_log_revision_supply_id_foreign" foreign key ("supply_id") references "research_supply" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_supply_adjustment" add constraint "research_supply_adjustment_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_supply_adjustment" add constraint "research_supply_adjustment_supply_id_foreign" foreign key ("supply_id") references "research_supply" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_supply_adjustment" add constraint "research_supply_adjustment_log_id_foreign" foreign key ("log_id") references "research_routine_log" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_supply_adjustment" add constraint "research_supply_adjustment_log_revision_id_foreign" foreign key ("log_revision_id") references "research_routine_log_revision" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_supply_adjustment" add constraint "research_supply_adjustment_mutation_id_foreign" foreign key ("mutation_id") references "research_routine_mutation" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "research_routine_state_transition" drop constraint if exists "research_routine_state_transition_mutation_id_foreign";`);

    this.addSql(`alter table if exists "research_supply_adjustment" drop constraint if exists "research_supply_adjustment_mutation_id_foreign";`);

    this.addSql(`alter table if exists "research_routine_state_transition" drop constraint if exists "research_routine_state_transition_routine_id_foreign";`);

    this.addSql(`alter table if exists "research_routine_revision" drop constraint if exists "research_routine_revision_routine_id_foreign";`);

    this.addSql(`alter table if exists "research_routine_log" drop constraint if exists "research_routine_log_routine_id_foreign";`);

    this.addSql(`alter table if exists "research_routine_log_revision" drop constraint if exists "research_routine_log_revision_routine_id_foreign";`);

    this.addSql(`alter table if exists "research_routine_log_revision" drop constraint if exists "research_routine_log_revision_routine_revision_id_foreign";`);

    this.addSql(`alter table if exists "research_routine_log_revision" drop constraint if exists "research_routine_log_revision_log_id_foreign";`);

    this.addSql(`alter table if exists "research_supply_adjustment" drop constraint if exists "research_supply_adjustment_log_id_foreign";`);

    this.addSql(`alter table if exists "research_supply_adjustment" drop constraint if exists "research_supply_adjustment_log_revision_id_foreign";`);

    this.addSql(`drop table if exists "research_routine_mutation" cascade;`);

    this.addSql(`drop table if exists "research_routine" cascade;`);

    this.addSql(`drop table if exists "research_routine_state_transition" cascade;`);

    this.addSql(`drop table if exists "research_routine_revision" cascade;`);

    this.addSql(`drop table if exists "research_routine_log" cascade;`);

    this.addSql(`drop table if exists "research_routine_log_revision" cascade;`);

    this.addSql(`drop table if exists "research_supply_adjustment" cascade;`);
  }

}
