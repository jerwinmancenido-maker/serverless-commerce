import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260827162716 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_journal_entry_revision" drop constraint if exists "research_journal_entry_revision_journal_entry_id_revision_number_unique";`);
    this.addSql(`alter table if exists "research_journal_mutation" drop constraint if exists "research_journal_mutation_profile_id_operation_idempotency_key_unique";`);
    this.addSql(`create table if not exists "research_journal_mutation" ("id" text not null, "operation" text check ("operation" in ('create', 'revise', 'void', 'restore')) not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "status" text check ("status" in ('processing', 'completed', 'failed')) not null, "journal_entry_id" text null, "journal_revision_id" text null, "response_payload" jsonb null, "error_code" text null, "completed_at" timestamptz null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_journal_mutation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_mutation_profile_id" ON "research_journal_mutation" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_mutation_deleted_at" ON "research_journal_mutation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_journal_mutation_profile_id_operation_idempotency_key_unique" ON "research_journal_mutation" ("profile_id", "operation", "idempotency_key") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_journal_entry" ("id" text not null, "status" text check ("status" in ('active', 'voided')) not null default 'active', "current_revision_id" text null, "voided_at" timestamptz null, "restored_at" timestamptz null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_journal_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_entry_profile_id" ON "research_journal_entry" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_entry_deleted_at" ON "research_journal_entry" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_entry_profile_id_status" ON "research_journal_entry" ("profile_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_entry_profile_id_created_at" ON "research_journal_entry" ("profile_id", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_journal_state_transition" ("id" text not null, "operation" text check ("operation" in ('void', 'restore')) not null, "occurred_at" timestamptz not null, "profile_id" text not null, "journal_entry_id" text not null, "mutation_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_journal_state_transition_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_state_transition_profile_id" ON "research_journal_state_transition" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_state_transition_journal_entry_id" ON "research_journal_state_transition" ("journal_entry_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_state_transition_mutation_id" ON "research_journal_state_transition" ("mutation_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_state_transition_deleted_at" ON "research_journal_state_transition" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_state_transition_journal_entry_id_occurred_at" ON "research_journal_state_transition" ("journal_entry_id", "occurred_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_journal_entry_revision" ("id" text not null, "revision_number" integer not null, "local_date" timestamptz not null, "local_time" text not null, "timezone" text not null, "title" text null, "note" text not null, "tracked_material_id" text null, "supply_id" text null, "routine_id" text null, "confirmed_log_id" text null, "prior_revision_id" text null, "journal_entry_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_journal_entry_revision_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_entry_revision_journal_entry_id" ON "research_journal_entry_revision" ("journal_entry_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_entry_revision_deleted_at" ON "research_journal_entry_revision" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_journal_entry_revision_journal_entry_id_revision_number_unique" ON "research_journal_entry_revision" ("journal_entry_id", "revision_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_entry_revision_journal_entry_id_created_at" ON "research_journal_entry_revision" ("journal_entry_id", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_journal_mutation" add constraint "research_journal_mutation_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_journal_entry" add constraint "research_journal_entry_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_journal_state_transition" add constraint "research_journal_state_transition_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_journal_state_transition" add constraint "research_journal_state_transition_journal_entry_id_foreign" foreign key ("journal_entry_id") references "research_journal_entry" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_journal_state_transition" add constraint "research_journal_state_transition_mutation_id_foreign" foreign key ("mutation_id") references "research_journal_mutation" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_journal_entry_revision" add constraint "research_journal_entry_revision_journal_entry_id_foreign" foreign key ("journal_entry_id") references "research_journal_entry" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "research_journal_state_transition" drop constraint if exists "research_journal_state_transition_mutation_id_foreign";`);

    this.addSql(`alter table if exists "research_journal_state_transition" drop constraint if exists "research_journal_state_transition_journal_entry_id_foreign";`);

    this.addSql(`alter table if exists "research_journal_entry_revision" drop constraint if exists "research_journal_entry_revision_journal_entry_id_foreign";`);

    this.addSql(`drop table if exists "research_journal_mutation" cascade;`);

    this.addSql(`drop table if exists "research_journal_entry" cascade;`);

    this.addSql(`drop table if exists "research_journal_state_transition" cascade;`);

    this.addSql(`drop table if exists "research_journal_entry_revision" cascade;`);
  }

}
