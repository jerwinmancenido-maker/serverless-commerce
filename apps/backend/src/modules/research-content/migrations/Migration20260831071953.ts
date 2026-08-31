import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831071953 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol_order_access" drop constraint if exists "research_protocol_order_access_order_id_line_item_id_revision_id_unique";`);
    this.addSql(`alter table if exists "research_protocol_order_access" drop constraint if exists "research_protocol_order_access_access_token_unique";`);
    this.addSql(`create table if not exists "research_protocol_order_access" ("id" text not null, "access_token" text not null, "order_id" text not null, "line_item_id" text not null, "product_id" text not null, "product_variant_id" text null, "protocol_handle_snapshot" text not null, "protocol_title_snapshot" text not null, "revision_number_snapshot" integer not null, "issued_at" timestamptz not null, "revoked_at" timestamptz null, "revision_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_order_access_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_order_access_revision_id" ON "research_protocol_order_access" ("revision_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_order_access_deleted_at" ON "research_protocol_order_access" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_order_access_access_token_unique" ON "research_protocol_order_access" ("access_token") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_order_access_order_id_line_item_id_revision_id_unique" ON "research_protocol_order_access" ("order_id", "line_item_id", "revision_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_order_access_order_id_revoked_at" ON "research_protocol_order_access" ("order_id", "revoked_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_protocol_order_access" add constraint "research_protocol_order_access_revision_id_foreign" foreign key ("revision_id") references "research_protocol" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_protocol_order_access" cascade;`);
  }

}
