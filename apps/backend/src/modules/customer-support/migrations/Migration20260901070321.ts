import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260901070321 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "support_saved_response" drop constraint if exists "support_saved_response_title_unique";`);
    this.addSql(`create table if not exists "support_saved_response" ("id" text not null, "title" text not null, "body" text not null, "category" text check ("category" in ('order', 'payment', 'shipping', 'product', 'protocol_access', 'account', 'rewards', 'technical', 'other')) null, "active" boolean not null default true, "sort_order" integer not null default 0, "created_by_actor_id" text not null, "updated_by_actor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_saved_response_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_saved_response_deleted_at" ON "support_saved_response" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_saved_response_active_category_sort_order" ON "support_saved_response" ("active", "category", "sort_order") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_support_saved_response_title_unique" ON "support_saved_response" ("title") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "support_saved_response" cascade;`);
  }

}
