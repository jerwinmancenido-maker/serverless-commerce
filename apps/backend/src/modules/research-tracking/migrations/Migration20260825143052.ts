import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260825143052 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_consent_event" drop constraint if exists "research_consent_event_profile_id_idempotency_key_unique";`);
    this.addSql(`alter table if exists "research_preference_mutation" drop constraint if exists "research_preference_mutation_profile_id_idempotency_key_unique";`);
    this.addSql(`alter table if exists "research_privacy_request" drop constraint if exists "research_privacy_request_profile_id_cancellation_idempotency_key_unique";`);
    this.addSql(`alter table if exists "research_privacy_request" drop constraint if exists "research_privacy_request_profile_id_idempotency_key_unique";`);
    this.addSql(`alter table if exists "research_privacy_request" drop constraint if exists "research_privacy_request_open_request_key_unique";`);
    this.addSql(`create table if not exists "research_privacy_request" ("id" text not null, "request_type" text check ("request_type" in ('deletion')) not null, "status" text check ("status" in ('requested', 'cancelled', 'processing', 'completed', 'rejected')) not null, "prior_profile_status" text check ("prior_profile_status" in ('active', 'closed')) not null, "open_request_key" text null, "requested_at" timestamptz not null, "cancelled_at" timestamptz null, "started_at" timestamptz null, "completed_at" timestamptz null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "cancellation_idempotency_key" text null, "cancellation_fingerprint_sha256" text null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_privacy_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_privacy_request_open_request_key_unique" ON "research_privacy_request" ("open_request_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_privacy_request_profile_id" ON "research_privacy_request" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_privacy_request_deleted_at" ON "research_privacy_request" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_privacy_request_profile_id_idempotency_key_unique" ON "research_privacy_request" ("profile_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_privacy_request_profile_id_cancellation_idempotency_key_unique" ON "research_privacy_request" ("profile_id", "cancellation_idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_privacy_request_profile_id_status" ON "research_privacy_request" ("profile_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_preference_mutation" ("id" text not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "response_payload" jsonb not null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_preference_mutation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_preference_mutation_profile_id" ON "research_preference_mutation" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_preference_mutation_deleted_at" ON "research_preference_mutation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_preference_mutation_profile_id_idempotency_key_unique" ON "research_preference_mutation" ("profile_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_preference_mutation_profile_id_created_at" ON "research_preference_mutation" ("profile_id", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_consent_event" ("id" text not null, "event_type" text check ("event_type" in ('accepted', 'withdrawn')) not null, "consent_version" text not null, "notice_sha256" text not null, "occurred_at" timestamptz not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_consent_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_consent_event_profile_id" ON "research_consent_event" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_consent_event_deleted_at" ON "research_consent_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_consent_event_profile_id_idempotency_key_unique" ON "research_consent_event" ("profile_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_consent_event_profile_id_occurred_at" ON "research_consent_event" ("profile_id", "occurred_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_privacy_request" add constraint "research_privacy_request_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_preference_mutation" add constraint "research_preference_mutation_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_consent_event" add constraint "research_consent_event_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_privacy_request" cascade;`);

    this.addSql(`drop table if exists "research_preference_mutation" cascade;`);

    this.addSql(`drop table if exists "research_consent_event" cascade;`);
  }

}
