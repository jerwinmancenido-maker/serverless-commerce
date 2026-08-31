import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831074247 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "research_protocol_comment" ("id" text not null, "customer_id" text not null, "author_name_snapshot" text not null, "kind" text check ("kind" in ('idea', 'recommendation', 'question', 'general')) not null default 'idea', "body" text not null, "status" text check ("status" in ('pending', 'approved', 'rejected', 'hidden')) not null default 'pending', "submitted_at" timestamptz not null, "moderated_at" timestamptz null, "moderated_by_actor_id" text null, "moderation_reason" text null, "series_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_comment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_comment_series_id" ON "research_protocol_comment" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_comment_deleted_at" ON "research_protocol_comment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_comment_series_id_status_submitted_at" ON "research_protocol_comment" ("series_id", "status", "submitted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_comment_customer_id_submitted_at" ON "research_protocol_comment" ("customer_id", "submitted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_protocol_comment" add constraint "research_protocol_comment_series_id_foreign" foreign key ("series_id") references "research_protocol_series" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_protocol_comment" cascade;`);
  }

}
