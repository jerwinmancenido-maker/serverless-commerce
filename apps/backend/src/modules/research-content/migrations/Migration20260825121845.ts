import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260825121845 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol" drop constraint if exists "research_protocol_protocol_key_revision_unique";`);
    this.addSql(`alter table if exists "calculator_material_profile" drop constraint if exists "calculator_material_profile_profile_key_revision_unique";`);
    this.addSql(`create table if not exists "calculator_material_profile" ("id" text not null, "profile_key" text not null, "revision" integer not null, "product_variant_id" text not null, "material_quantity_base_units" integer not null, "material_base_unit" text check ("material_base_unit" in ('microgram', 'microliter', 'piece')) not null, "display_unit" text not null, "base_units_per_display_unit" integer not null, "display_precision" integer not null default 0, "status" text check ("status" in ('draft', 'published', 'withdrawn')) not null default 'draft', "evidence_scope" text check ("evidence_scope" in ('sku', 'formulation', 'batch')) not null, "effective_at" timestamptz null, "published_at" timestamptz null, "withdrawn_at" timestamptz null, "created_by_actor_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "calculator_material_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_calculator_material_profile_deleted_at" ON "calculator_material_profile" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_calculator_material_profile_profile_key_revision_unique" ON "calculator_material_profile" ("profile_key", "revision") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_calculator_material_profile_product_variant_id_status" ON "calculator_material_profile" ("product_variant_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol" ("id" text not null, "protocol_key" text not null, "revision" integer not null, "product_variant_id" text not null, "title" text not null, "summary" text null, "content" jsonb not null, "status" text check ("status" in ('draft', 'published', 'withdrawn')) not null default 'draft', "evidence_scope" text check ("evidence_scope" in ('sku', 'formulation', 'batch')) not null, "effective_at" timestamptz null, "published_at" timestamptz null, "withdrawn_at" timestamptz null, "created_by_actor_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_deleted_at" ON "research_protocol" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_protocol_key_revision_unique" ON "research_protocol" ("protocol_key", "revision") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_product_variant_id_status" ON "research_protocol" ("product_variant_id", "status") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "calculator_material_profile" cascade;`);

    this.addSql(`drop table if exists "research_protocol" cascade;`);
  }

}
