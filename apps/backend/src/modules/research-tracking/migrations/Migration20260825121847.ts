import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260825121847 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_supply" drop constraint if exists "research_supply_source_order_line_item_id_unique";`);
    this.addSql(`alter table if exists "tracked_material" drop constraint if exists "tracked_material_profile_id_product_variant_id_unique";`);
    this.addSql(`alter table if exists "research_profile" drop constraint if exists "research_profile_customer_id_unique";`);
    this.addSql(`create table if not exists "research_profile" ("id" text not null, "customer_id" text not null, "timezone" text not null, "locale" text not null default 'en-PH', "consent_version" text not null, "consented_at" timestamptz not null, "status" text check ("status" in ('active', 'deletion_requested', 'closed')) not null default 'active', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_profile_customer_id_unique" ON "research_profile" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_profile_deleted_at" ON "research_profile" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "tracked_material" ("id" text not null, "product_variant_id" text null, "label" text not null, "source" text check ("source" in ('purchased', 'manual')) not null, "status" text check ("status" in ('active', 'archived')) not null default 'active', "activated_at" timestamptz not null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tracked_material_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tracked_material_profile_id" ON "tracked_material" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tracked_material_deleted_at" ON "tracked_material" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tracked_material_profile_id_status" ON "tracked_material" ("profile_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tracked_material_profile_id_product_variant_id_unique" ON "tracked_material" ("profile_id", "product_variant_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_supply" ("id" text not null, "source_order_line_item_id" text null, "initial_quantity_base_units" integer not null, "remaining_quantity_base_units" integer not null, "base_unit" text check ("base_unit" in ('microgram', 'microliter', 'piece')) not null, "acquired_at" timestamptz not null, "lot_number" text null, "batch_number" text null, "expires_at" timestamptz null, "storage_note" text null, "status" text check ("status" in ('active', 'depleted', 'archived')) not null default 'active', "tracked_material_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_supply_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_tracked_material_id" ON "research_supply" ("tracked_material_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_deleted_at" ON "research_supply" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_tracked_material_id_status" ON "research_supply" ("tracked_material_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_supply_source_order_line_item_id_unique" ON "research_supply" ("source_order_line_item_id") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "tracked_material" add constraint "tracked_material_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_supply" add constraint "research_supply_tracked_material_id_foreign" foreign key ("tracked_material_id") references "tracked_material" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "tracked_material" drop constraint if exists "tracked_material_profile_id_foreign";`);

    this.addSql(`alter table if exists "research_supply" drop constraint if exists "research_supply_tracked_material_id_foreign";`);

    this.addSql(`drop table if exists "research_profile" cascade;`);

    this.addSql(`drop table if exists "tracked_material" cascade;`);

    this.addSql(`drop table if exists "research_supply" cascade;`);
  }

}
