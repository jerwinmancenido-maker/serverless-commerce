import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260825071832 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "recipe_audit_snapshot" drop constraint if exists "recipe_audit_snapshot_variant_id_version_unique";`);
    this.addSql(`alter table if exists "component_profile" drop constraint if exists "component_profile_inventory_item_id_unique";`);
    this.addSql(`create table if not exists "component_profile" ("id" text not null, "inventory_item_id" text not null, "base_unit" text check ("base_unit" in ('microgram', 'microliter', 'piece')) not null, "display_unit" text not null, "base_units_per_display_unit" integer not null, "display_precision" integer not null default 0, "reorder_threshold_base_units" integer not null default 0, "category" text not null, "lot_tracking_required" boolean not null default false, "expiry_tracking_required" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "component_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_component_profile_inventory_item_id_unique" ON "component_profile" ("inventory_item_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_component_profile_deleted_at" ON "component_profile" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "recipe_audit_snapshot" ("id" text not null, "variant_id" text not null, "version" integer not null, "recipe_hash" text not null, "components" jsonb not null, "actor_id" text null, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "recipe_audit_snapshot_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_recipe_audit_snapshot_deleted_at" ON "recipe_audit_snapshot" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_recipe_audit_snapshot_variant_id_version_unique" ON "recipe_audit_snapshot" ("variant_id", "version") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_recipe_audit_snapshot_variant_id_recipe_hash" ON "recipe_audit_snapshot" ("variant_id", "recipe_hash") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "component_profile" cascade;`);

    this.addSql(`drop table if exists "recipe_audit_snapshot" cascade;`);
  }

}
