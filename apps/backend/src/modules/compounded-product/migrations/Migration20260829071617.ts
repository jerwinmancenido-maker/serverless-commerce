import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260829071617 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "compounded_product_registration" drop constraint if exists "compounded_product_registration_product_id_unique";`);
    this.addSql(`create table if not exists "compounded_product_registration" ("id" text not null, "product_id" text not null, "catalog_kind" text not null, "contract_schema_version" text not null, "configuration_snapshot" jsonb not null, "configuration_fingerprint" text not null, "readiness_policy_revision" text not null, "readiness_policy_snapshot" jsonb not null, "state" text check ("state" in ('draft', 'ready', 'blocked', 'published', 'withdrawn')) not null default 'draft', "created_by_actor_id" text not null, "updated_by_actor_id" text not null, "published_at" timestamptz null, "withdrawn_at" timestamptz null, "presentation_revision_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "compounded_product_registration_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_compounded_product_registration_product_id_unique" ON "compounded_product_registration" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_registration_presentation_revision_id" ON "compounded_product_registration" ("presentation_revision_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_registration_deleted_at" ON "compounded_product_registration" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_registration_state" ON "compounded_product_registration" ("state") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_registration_configuration_fingerprint" ON "compounded_product_registration" ("configuration_fingerprint") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "compounded_product_registration" add constraint "compounded_product_registration_presentation_rev_62ff4_foreign" foreign key ("presentation_revision_id") references "compounded_product_presentation_revision" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "compounded_product_registration" cascade;`);
  }

}
