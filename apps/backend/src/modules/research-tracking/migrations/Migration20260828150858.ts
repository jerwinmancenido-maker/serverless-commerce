import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260828150858 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_journal_consent_event" drop constraint if exists "research_journal_consent_event_profile_id_idempotency_key_unique";`);
    this.addSql(`create table if not exists "research_journal_consent_event" ("id" text not null, "event_type" text check ("event_type" in ('accepted', 'withdrawn')) not null, "consent_version" text not null, "notice_sha256" text not null, "occurred_at" timestamptz not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_journal_consent_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_consent_event_profile_id" ON "research_journal_consent_event" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_consent_event_deleted_at" ON "research_journal_consent_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_journal_consent_event_profile_id_idempotency_key_unique" ON "research_journal_consent_event" ("profile_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_journal_consent_event_profile_id_occurred_at" ON "research_journal_consent_event" ("profile_id", "occurred_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_journal_consent_event" add constraint "research_journal_consent_event_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_journal_consent_event" cascade;`);
  }

}
