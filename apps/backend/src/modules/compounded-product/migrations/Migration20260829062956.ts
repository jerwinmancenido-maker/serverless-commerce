import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260829062956 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "compounded_product_presentation_revision" drop constraint if exists "compounded_product_presentation_revision_presentation_id_revision_unique";`);
    this.addSql(`alter table if exists "compounded_product_presentation" drop constraint if exists "compounded_product_presentation_key_unique";`);
    this.addSql(`create table if not exists "compounded_product_presentation" ("id" text not null, "key" text not null, "status" text check ("status" in ('draft', 'active', 'inactive', 'blocked', 'archived')) not null default 'draft', "current_revision_id" text null, "latest_revision" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "compounded_product_presentation_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_compounded_product_presentation_key_unique" ON "compounded_product_presentation" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_presentation_deleted_at" ON "compounded_product_presentation" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "compounded_product_presentation_revision" ("id" text not null, "revision" integer not null, "schema_version" text not null, "status" text check ("status" in ('draft', 'active', 'superseded', 'blocked', 'archived')) not null default 'draft', "snapshot" jsonb not null, "fingerprint" text not null, "reason" text null, "created_by_actor_id" text null, "activated_at" timestamptz null, "superseded_at" timestamptz null, "blocked_at" timestamptz null, "archived_at" timestamptz null, "presentation_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "compounded_product_presentation_revision_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_presentation_revision_presentation_id" ON "compounded_product_presentation_revision" ("presentation_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_presentation_revision_deleted_at" ON "compounded_product_presentation_revision" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_compounded_product_presentation_revision_presentation_id_revision_unique" ON "compounded_product_presentation_revision" ("presentation_id", "revision") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_presentation_revision_presentation_id_status" ON "compounded_product_presentation_revision" ("presentation_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_presentation_revision_fingerprint" ON "compounded_product_presentation_revision" ("fingerprint") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "compounded_product_presentation_revision" add constraint "compounded_product_presentation_revision_present_6d7d2_foreign" foreign key ("presentation_id") references "compounded_product_presentation" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "compounded_product_presentation_revision" drop constraint if exists "compounded_product_presentation_revision_present_6d7d2_foreign";`);

    this.addSql(`drop table if exists "compounded_product_presentation" cascade;`);

    this.addSql(`drop table if exists "compounded_product_presentation_revision" cascade;`);
  }

}
