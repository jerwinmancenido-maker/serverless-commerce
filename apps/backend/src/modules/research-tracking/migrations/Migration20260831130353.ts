import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831130353 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_occurrence_adjustment" drop constraint if exists "research_occurrence_adjustment_profile_id_idempotency_key_unique";`);
    this.addSql(`create table if not exists "research_occurrence_adjustment" ("id" text not null, "occurrence_id" text not null, "operation" text check ("operation" in ('skip', 'reschedule', 'restore')) not null, "planned_local_date" timestamptz not null, "planned_local_time" text not null, "rescheduled_local_date" timestamptz null, "rescheduled_local_time" text null, "timezone" text not null, "note" text null, "routine_schedule_segment_id" text null, "protocol_revision_id" text null, "prior_adjustment_id" text null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "profile_id" text not null, "routine_id" text not null, "routine_revision_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_occurrence_adjustment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_occurrence_adjustment_profile_id" ON "research_occurrence_adjustment" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_occurrence_adjustment_routine_id" ON "research_occurrence_adjustment" ("routine_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_occurrence_adjustment_routine_revision_id" ON "research_occurrence_adjustment" ("routine_revision_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_occurrence_adjustment_deleted_at" ON "research_occurrence_adjustment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_occurrence_adjustment_profile_id_occurrence_id_created_at" ON "research_occurrence_adjustment" ("profile_id", "occurrence_id", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_occurrence_adjustment_profile_id_idempotency_key_unique" ON "research_occurrence_adjustment" ("profile_id", "idempotency_key") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_occurrence_adjustment" add constraint "research_occurrence_adjustment_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_occurrence_adjustment" add constraint "research_occurrence_adjustment_routine_id_foreign" foreign key ("routine_id") references "research_routine" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_occurrence_adjustment" add constraint "research_occurrence_adjustment_routine_revision_id_foreign" foreign key ("routine_revision_id") references "research_routine_revision" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_occurrence_adjustment" cascade;`);
  }

}
