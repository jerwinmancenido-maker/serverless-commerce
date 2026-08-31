import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831122846 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol_merchandising_link" drop constraint if exists "research_protocol_merchandising_link_series_id_product_id_relationship_type_unique";`);
    this.addSql(`create table if not exists "research_protocol_merchandising_link" ("id" text not null, "product_id" text not null, "product_variant_ids" jsonb not null, "relationship_type" text check ("relationship_type" in ('primary', 'required', 'optional', 'compatible', 'frequently_added', 'bundle', 'refill', 'replacement', 'alternative', 'upgrade', 'cross_sell', 'reorder')) not null, "placements" jsonb not null, "priority" integer not null default 100, "status" text check ("status" in ('active', 'paused')) not null default 'active', "heading" text null, "reason" text not null, "quick_add_enabled" boolean not null default true, "hide_after_purchase" boolean not null default false, "bundle_reference" text null, "promotion_reference" text null, "starts_at" timestamptz null, "ends_at" timestamptz null, "archived_at" timestamptz null, "created_by_actor_id" text null, "updated_by_actor_id" text null, "series_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_merchandising_link_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_merchandising_link_series_id" ON "research_protocol_merchandising_link" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_merchandising_link_deleted_at" ON "research_protocol_merchandising_link" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_merchandising_link_series_id_product_id_relationship_type_unique" ON "research_protocol_merchandising_link" ("series_id", "product_id", "relationship_type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_merchandising_link_series_id_status_archived_at" ON "research_protocol_merchandising_link" ("series_id", "status", "archived_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_merchandising_link_product_id_archived_at" ON "research_protocol_merchandising_link" ("product_id", "archived_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_merchandising_link_priority" ON "research_protocol_merchandising_link" ("priority") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_recommendation_event" ("id" text not null, "event_type" text check ("event_type" in ('impression', 'click', 'add_to_cart', 'dismiss', 'purchase')) not null, "placement" text not null, "product_id" text not null, "product_variant_id" text null, "customer_id" text null, "protocol_revision_id" text null, "occurred_at" timestamptz not null, "context" jsonb null, "series_id" text not null, "merchandising_link_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_recommendation_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_recommendation_event_series_id" ON "research_protocol_recommendation_event" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_recommendation_event_merchandising_link_id" ON "research_protocol_recommendation_event" ("merchandising_link_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_recommendation_event_deleted_at" ON "research_protocol_recommendation_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_recommendation_event_series_id_occurred_at" ON "research_protocol_recommendation_event" ("series_id", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_recommendation_event_merchandising_link_id_event_type_occurred_at" ON "research_protocol_recommendation_event" ("merchandising_link_id", "event_type", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_recommendation_event_customer_id_occurred_at" ON "research_protocol_recommendation_event" ("customer_id", "occurred_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_recommendation_event_product_id_event_type_occurred_at" ON "research_protocol_recommendation_event" ("product_id", "event_type", "occurred_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_protocol_merchandising_link" add constraint "research_protocol_merchandising_link_series_id_foreign" foreign key ("series_id") references "research_protocol_series" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_protocol_recommendation_event" add constraint "research_protocol_recommendation_event_series_id_foreign" foreign key ("series_id") references "research_protocol_series" ("id") on update cascade;`);
    this.addSql(`alter table if exists "research_protocol_recommendation_event" add constraint "research_protocol_recommendation_event_merchandi_a3fc8_foreign" foreign key ("merchandising_link_id") references "research_protocol_merchandising_link" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_protocol_audit_event" drop constraint if exists "research_protocol_audit_event_event_type_check";`);

    this.addSql(`alter table if exists "research_protocol_audit_event" add constraint "research_protocol_audit_event_event_type_check" check("event_type" in ('series_created', 'draft_updated', 'revision_created', 'revision_published', 'revision_withdrawn', 'applicability_changed', 'product_linked', 'product_link_updated', 'product_unlinked', 'primary_protocol_changed', 'publication_readiness_evaluated', 'series_archived', 'merchandising_link_created', 'merchandising_link_updated', 'merchandising_link_archived'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol_recommendation_event" drop constraint if exists "research_protocol_recommendation_event_merchandi_a3fc8_foreign";`);

    this.addSql(`drop table if exists "research_protocol_merchandising_link" cascade;`);

    this.addSql(`drop table if exists "research_protocol_recommendation_event" cascade;`);

    this.addSql(`alter table if exists "research_protocol_audit_event" drop constraint if exists "research_protocol_audit_event_event_type_check";`);

    this.addSql(`alter table if exists "research_protocol_audit_event" add constraint "research_protocol_audit_event_event_type_check" check("event_type" in ('series_created', 'draft_updated', 'revision_created', 'revision_published', 'revision_withdrawn', 'applicability_changed', 'product_linked', 'product_link_updated', 'product_unlinked', 'primary_protocol_changed', 'publication_readiness_evaluated', 'series_archived'));`);
  }

}
