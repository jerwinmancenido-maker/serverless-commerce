import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831111303 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol_profile_access" drop constraint if exists "research_protocol_profile_access_order_protocol_access_id_unique";`);
    this.addSql(`create table if not exists "research_protocol_profile_access" ("id" text not null, "customer_id" text not null, "order_protocol_access_id" text not null, "protocol_series_id" text not null, "protocol_revision_id" text not null, "order_id" text not null, "line_item_id" text not null, "product_id" text not null, "product_variant_id" text null, "protocol_handle_snapshot" text not null, "protocol_title_snapshot" text not null, "revision_number_snapshot" integer not null, "granted_at" timestamptz not null, "first_viewed_at" timestamptz null, "last_viewed_at" timestamptz null, "status" text check ("status" in ('active', 'revoked')) not null default 'active', "routine_started_at" timestamptz null, "profile_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_profile_access_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_profile_access_profile_id" ON "research_protocol_profile_access" ("profile_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_profile_access_deleted_at" ON "research_protocol_profile_access" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_profile_access_order_protocol_access_id_unique" ON "research_protocol_profile_access" ("order_protocol_access_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_profile_access_profile_id_status_granted_at" ON "research_protocol_profile_access" ("profile_id", "status", "granted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_profile_access_profile_id_protocol_series_id_protocol_revision_id" ON "research_protocol_profile_access" ("profile_id", "protocol_series_id", "protocol_revision_id") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_protocol_profile_access" add constraint "research_protocol_profile_access_profile_id_foreign" foreign key ("profile_id") references "research_profile" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_protocol_profile_access" cascade;`);
  }

}
