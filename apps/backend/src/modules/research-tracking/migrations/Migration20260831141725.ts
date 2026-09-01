import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831141725 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_agreement_bundle" drop constraint if exists "research_agreement_bundle_public_version_unique";`);
    this.addSql(`alter table if exists "research_agreement_acceptance" drop constraint if exists "research_agreement_acceptance_customer_id_agreement_bundle_id_unique";`);
    this.addSql(`alter table if exists "research_agreement_acceptance" drop constraint if exists "research_agreement_acceptance_customer_id_idempotency_key_unique";`);
    this.addSql(`create table if not exists "research_agreement_acceptance" ("id" text not null, "customer_id" text not null, "agreement_bundle_id" text not null, "acceptance_source" text check ("acceptance_source" in ('signup', 'existing_customer_upgrade', 'material_policy_renewal')) not null, "accepted_at" timestamptz not null, "locale" text not null, "idempotency_key" text not null, "terms_version_snapshot" text not null, "terms_digest_snapshot" text not null, "privacy_version_snapshot" text not null, "privacy_digest_snapshot" text not null, "research_hub_version_snapshot" text not null, "research_hub_digest_snapshot" text not null, "superseded_acceptance_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_agreement_acceptance_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_agreement_acceptance_deleted_at" ON "research_agreement_acceptance" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_agreement_acceptance_customer_id_idempotency_key_unique" ON "research_agreement_acceptance" ("customer_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_agreement_acceptance_customer_id_agreement_bundle_id_unique" ON "research_agreement_acceptance" ("customer_id", "agreement_bundle_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_agreement_acceptance_customer_id_accepted_at" ON "research_agreement_acceptance" ("customer_id", "accepted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_agreement_bundle" ("id" text not null, "public_version" text not null, "terms_version" text not null, "terms_digest" text not null, "terms_url" text not null, "privacy_version" text not null, "privacy_digest" text not null, "privacy_url" text not null, "research_hub_version" text not null, "research_hub_digest" text not null, "research_hub_url" text not null, "locale" text not null default 'en-PH', "effective_at" timestamptz not null, "status" text check ("status" in ('draft', 'scheduled', 'active', 'superseded', 'withdrawn')) not null default 'draft', "replacement_bundle_id" text null, "published_at" timestamptz null, "published_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_agreement_bundle_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_agreement_bundle_deleted_at" ON "research_agreement_bundle" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_agreement_bundle_public_version_unique" ON "research_agreement_bundle" ("public_version") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_agreement_bundle_status_locale_effective_at" ON "research_agreement_bundle" ("status", "locale", "effective_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_agreement_acceptance" cascade;`);

    this.addSql(`drop table if exists "research_agreement_bundle" cascade;`);
  }

}
