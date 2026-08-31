import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831052732 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol_variant_target" drop constraint if exists "research_protocol_variant_target_product_link_id_product_variant_id_unique";`);
    this.addSql(`alter table if exists "research_protocol_product_link" drop constraint if exists "research_protocol_product_link_series_id_product_id_unique";`);
    this.addSql(`create table if not exists "research_protocol_product_link" ("id" text not null, "product_id" text not null, "applicability_scope" text check ("applicability_scope" in ('entire_product', 'selected_variants')) not null default 'entire_product', "is_primary" boolean not null default false, "archived_at" timestamptz null, "created_by_actor_id" text null, "updated_by_actor_id" text null, "series_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_product_link_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_product_link_series_id" ON "research_protocol_product_link" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_product_link_deleted_at" ON "research_protocol_product_link" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_product_link_series_id_product_id_unique" ON "research_protocol_product_link" ("series_id", "product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_product_link_product_id_archived_at" ON "research_protocol_product_link" ("product_id", "archived_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_product_link_product_id_is_primary" ON "research_protocol_product_link" ("product_id", "is_primary") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_product_link_one_active_primary" ON "research_protocol_product_link" ("product_id") WHERE deleted_at IS NULL AND archived_at IS NULL AND is_primary = true;`);

    this.addSql(`alter table if exists "research_protocol_product_link" add constraint "research_protocol_product_link_series_id_foreign" foreign key ("series_id") references "research_protocol_series" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_protocol_audit_event" drop constraint if exists "research_protocol_audit_event_event_type_check";`);

    this.addSql(`alter table if exists "research_protocol_variant_target" drop constraint if exists "research_protocol_variant_target_series_id_foreign";`);

    this.addSql(`do $$
    begin
      if exists (
        select 1
        from "research_protocol_series" series
        left join "product" product on product."id" = series."product_id"
        where product."id" is null
      ) then
        raise exception 'Cannot migrate research protocols because a linked product is missing';
      end if;
    end $$;`);

    this.addSql(`insert into "research_protocol_product_link" (
      "id", "product_id", "applicability_scope", "is_primary", "archived_at",
      "created_by_actor_id", "updated_by_actor_id", "series_id",
      "created_at", "updated_at", "deleted_at"
    )
    select
      'rppl_legacy_' || md5(series."id" || ':' || series."product_id"),
      series."product_id", series."applicability_scope", series."is_primary",
      series."archived_at", series."created_by_actor_id", series."updated_by_actor_id",
      series."id", series."created_at", series."updated_at", series."deleted_at"
    from "research_protocol_series" series
    on conflict do nothing;`);

    this.addSql(`alter table if exists "research_protocol_variant_target" add column if not exists "product_link_id" text null;`);
    this.addSql(`update "research_protocol_variant_target" target
      set "product_link_id" = link."id"
      from "research_protocol_product_link" link
      where link."series_id" = target."series_id"
        and target."product_link_id" is null;`);
    this.addSql(`do $$
    begin
      if exists (
        select 1 from "research_protocol_variant_target"
        where "product_link_id" is null
      ) then
        raise exception 'Research protocol variant targets could not be attached to product links';
      end if;

      if exists (
        select 1
        from "research_protocol_variant_target" target
        join "research_protocol_product_link" link on link."id" = target."product_link_id"
        left join "product_variant" variant on variant."id" = target."product_variant_id"
        where variant."product_id" is distinct from link."product_id"
      ) then
        raise exception 'A research protocol variant does not belong to its linked product';
      end if;
    end $$;`);
    this.addSql(`alter table if exists "research_protocol_variant_target" alter column "product_link_id" set not null;`);

    this.addSql(`drop index if exists "IDX_research_protocol_series_product_id_archived_at";`);
    this.addSql(`drop index if exists "IDX_research_protocol_series_product_id_is_primary";`);
    this.addSql(`alter table if exists "research_protocol_series" drop column if exists "product_id", drop column if exists "applicability_scope", drop column if exists "is_primary";`);

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_series_archived_at" ON "research_protocol_series" ("archived_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_protocol_audit_event" add column if not exists "product_link_id" text null;`);
    this.addSql(`alter table if exists "research_protocol_audit_event" add constraint "research_protocol_audit_event_event_type_check" check("event_type" in ('series_created', 'draft_updated', 'revision_created', 'revision_published', 'revision_withdrawn', 'applicability_changed', 'product_linked', 'product_link_updated', 'product_unlinked', 'primary_protocol_changed', 'publication_readiness_evaluated', 'series_archived'));`);

    this.addSql(`drop index if exists "IDX_research_protocol_product_variant_id_status";`);
    this.addSql(`alter table if exists "research_protocol" drop column if exists "product_variant_id";`);

    this.addSql(`drop index if exists "IDX_research_protocol_variant_target_series_id";`);
    this.addSql(`drop index if exists "IDX_research_protocol_variant_target_series_id_product_variant_id_unique";`);

    this.addSql(`alter table if exists "research_protocol_variant_target" drop column if exists "series_id";`);
    this.addSql(`alter table if exists "research_protocol_variant_target" add constraint "research_protocol_variant_target_product_link_id_foreign" foreign key ("product_link_id") references "research_protocol_product_link" ("id") on update cascade;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_variant_target_product_link_id" ON "research_protocol_variant_target" ("product_link_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_variant_target_product_link_id_product_variant_id_unique" ON "research_protocol_variant_target" ("product_link_id", "product_variant_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol_variant_target" drop constraint if exists "research_protocol_variant_target_product_link_id_foreign";`);

    this.addSql(`do $$
    begin
      if exists (
        select "series_id" from "research_protocol_product_link"
        where "deleted_at" is null and "archived_at" is null
        group by "series_id" having count(*) <> 1
      ) or exists (
        select series."id"
        from "research_protocol_series" series
        left join "research_protocol_product_link" link
          on link."series_id" = series."id"
          and link."deleted_at" is null and link."archived_at" is null
        where link."id" is null
      ) then
        raise exception 'Cannot roll back standalone or multi-product research protocols to the legacy single-product model';
      end if;
    end $$;`);

    this.addSql(`alter table if exists "research_protocol_audit_event" drop constraint if exists "research_protocol_audit_event_event_type_check";`);

    this.addSql(`drop index if exists "IDX_research_protocol_series_archived_at";`);

    this.addSql(`alter table if exists "research_protocol_series" add column if not exists "product_id" text null, add column if not exists "applicability_scope" text check ("applicability_scope" in ('entire_product', 'selected_variants')) not null default 'entire_product', add column if not exists "is_primary" boolean not null default false;`);
    this.addSql(`update "research_protocol_series" series
      set "product_id" = link."product_id",
          "applicability_scope" = link."applicability_scope",
          "is_primary" = link."is_primary"
      from "research_protocol_product_link" link
      where link."series_id" = series."id"
        and link."deleted_at" is null and link."archived_at" is null;`);
    this.addSql(`alter table if exists "research_protocol_series" alter column "product_id" set not null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_series_product_id_archived_at" ON "research_protocol_series" ("product_id", "archived_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_series_product_id_is_primary" ON "research_protocol_series" ("product_id", "is_primary") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_protocol_audit_event" drop column if exists "product_link_id";`);

    this.addSql(`alter table if exists "research_protocol_audit_event" add constraint "research_protocol_audit_event_event_type_check" check("event_type" in ('series_created', 'draft_updated', 'revision_created', 'revision_published', 'revision_withdrawn', 'applicability_changed'));`);

    this.addSql(`alter table if exists "research_protocol" add column if not exists "product_variant_id" text null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_product_variant_id_status" ON "research_protocol" ("product_variant_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "research_protocol_variant_target" add column if not exists "series_id" text null;`);
    this.addSql(`update "research_protocol_variant_target" target
      set "series_id" = link."series_id"
      from "research_protocol_product_link" link
      where link."id" = target."product_link_id";`);
    this.addSql(`alter table if exists "research_protocol_variant_target" alter column "series_id" set not null;`);

    this.addSql(`drop index if exists "IDX_research_protocol_variant_target_product_link_id";`);
    this.addSql(`drop index if exists "IDX_research_protocol_variant_target_product_link_id_product_variant_id_unique";`);

    this.addSql(`alter table if exists "research_protocol_variant_target" drop column if exists "product_link_id";`);
    this.addSql(`alter table if exists "research_protocol_variant_target" add constraint "research_protocol_variant_target_series_id_foreign" foreign key ("series_id") references "research_protocol_series" ("id") on update cascade;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_variant_target_series_id" ON "research_protocol_variant_target" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_variant_target_series_id_product_variant_id_unique" ON "research_protocol_variant_target" ("series_id", "product_variant_id") WHERE deleted_at IS NULL;`);

    this.addSql(`drop table if exists "research_protocol_product_link" cascade;`);
  }

}
