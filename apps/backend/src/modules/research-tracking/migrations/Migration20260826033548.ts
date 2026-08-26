import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260826033548 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_supply_activation_request" drop constraint if exists "research_supply_activation_request_profile_id_idempotency_key_unique";`);
    this.addSql(`alter table if exists "research_supply_activation" drop constraint if exists "research_supply_activation_profile_id_idempotency_key_unique";`);
    this.addSql(`alter table if exists "research_supply_activation" drop constraint if exists "research_supply_activation_supply_id_unique";`);
    this.addSql(`alter table if exists "research_supply_activation" drop constraint if exists "research_supply_activation_source_order_line_item_id_unique";`);
    this.addSql(`create table if not exists "research_supply_activation" ("id" text not null, "source_order_id" text not null, "source_order_line_item_id" text not null, "source_product_variant_id" text not null, "eligible_commerce_quantity" integer not null, "material_profile_key" text not null, "material_profile_revision" integer not null, "material_quantity_base_units" integer not null, "material_base_unit" text check ("material_base_unit" in ('microgram', 'microliter', 'piece')) not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "activated_at" timestamptz not null, "label_snapshot" text not null, "profile_id" text not null, "tracked_material_id" text not null, "supply_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_supply_activation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_activation_profile_id" ON "research_supply_activation" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_activation_tracked_material_id" ON "research_supply_activation" ("tracked_material_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_activation_supply_id" ON "research_supply_activation" ("supply_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_activation_deleted_at" ON "research_supply_activation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_supply_activation_source_order_line_item_id_unique" ON "research_supply_activation" ("source_order_line_item_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_supply_activation_supply_id_unique" ON "research_supply_activation" ("supply_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_supply_activation_profile_id_idempotency_key_unique" ON "research_supply_activation" ("profile_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_activation_profile_id_activated_at" ON "research_supply_activation" ("profile_id", "activated_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_supply_activation_request" ("id" text not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "accepted_at" timestamptz not null, "profile_id" text not null, "activation_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_supply_activation_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_activation_request_profile_id" ON "research_supply_activation_request" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_activation_request_activation_id" ON "research_supply_activation_request" ("activation_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_activation_request_deleted_at" ON "research_supply_activation_request" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_supply_activation_request_profile_id_idempotency_key_unique" ON "research_supply_activation_request" ("profile_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_supply_activation_request_activation_id_accepted_at" ON "research_supply_activation_request" ("activation_id", "accepted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_supply_activation" add constraint "research_supply_activation_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_supply_activation" add constraint "research_supply_activation_tracked_material_id_foreign" foreign key ("tracked_material_id") references "tracked_material" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_supply_activation" add constraint "research_supply_activation_supply_id_foreign" foreign key ("supply_id") references "research_supply" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_supply_activation_request" add constraint "research_supply_activation_request_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_supply_activation_request" add constraint "research_supply_activation_request_activation_id_foreign" foreign key ("activation_id") references "research_supply_activation" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "research_supply_activation_request" drop constraint if exists "research_supply_activation_request_activation_id_foreign";`);

    this.addSql(`drop table if exists "research_supply_activation" cascade;`);

    this.addSql(`drop table if exists "research_supply_activation_request" cascade;`);
  }

}
