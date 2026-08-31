import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831041552 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol" drop constraint if exists "research_protocol_series_id_revision_unique";`);
    this.addSql(`alter table if exists "research_protocol_variant_target" drop constraint if exists "research_protocol_variant_target_series_id_product_variant_id_unique";`);
    this.addSql(`alter table if exists "research_protocol_series" drop constraint if exists "research_protocol_series_protocol_key_unique";`);
    this.addSql(`create table if not exists "research_protocol_series" ("id" text not null, "protocol_key" text not null, "product_id" text not null, "purpose" text null, "applicability_scope" text check ("applicability_scope" in ('entire_product', 'selected_variants')) not null default 'entire_product', "is_primary" boolean not null default false, "archived_at" timestamptz null, "created_by_actor_id" text null, "updated_by_actor_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_series_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_series_deleted_at" ON "research_protocol_series" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_series_protocol_key_unique" ON "research_protocol_series" ("protocol_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_series_product_id_archived_at" ON "research_protocol_series" ("product_id", "archived_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_series_product_id_is_primary" ON "research_protocol_series" ("product_id", "is_primary") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_audit_event" ("id" text not null, "revision_id" text null, "event_type" text check ("event_type" in ('series_created', 'draft_updated', 'revision_created', 'revision_published', 'revision_withdrawn', 'applicability_changed')) not null, "actor_id" text not null, "reason" text null, "details" jsonb null, "series_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_audit_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_audit_event_series_id" ON "research_protocol_audit_event" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_audit_event_deleted_at" ON "research_protocol_audit_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_audit_event_series_id_created_at" ON "research_protocol_audit_event" ("series_id", "created_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "research_protocol_variant_target" ("id" text not null, "product_variant_id" text not null, "series_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "research_protocol_variant_target_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_variant_target_series_id" ON "research_protocol_variant_target" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_variant_target_deleted_at" ON "research_protocol_variant_target" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_variant_target_series_id_product_variant_id_unique" ON "research_protocol_variant_target" ("series_id", "product_variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_variant_target_product_variant_id" ON "research_protocol_variant_target" ("product_variant_id") WHERE deleted_at IS NULL;`);

    this.addSql(`do $$
    begin
      if exists (
        select 1
        from "research_protocol" rp
        left join "product_variant" pv on pv."id" = rp."product_variant_id"
        where pv."product_id" is null
      ) then
        raise exception 'Cannot migrate research protocols because a legacy product variant is missing';
      end if;

      if exists (
        select rp."protocol_key"
        from "research_protocol" rp
        join "product_variant" pv on pv."id" = rp."product_variant_id"
        group by rp."protocol_key"
        having count(distinct pv."product_id") > 1
      ) then
        raise exception 'Cannot migrate a research protocol key that spans multiple products';
      end if;
    end $$;`);

    this.addSql(`with legacy_series as (
      select
        rp."protocol_key",
        min(pv."product_id") as "product_id",
        min(rp."created_at") as "created_at",
        max(rp."updated_at") as "updated_at",
        case
          when bool_and(rp."deleted_at" is not null) then max(rp."deleted_at")
          else null
        end as "deleted_at"
      from "research_protocol" rp
      join "product_variant" pv on pv."id" = rp."product_variant_id"
      group by rp."protocol_key"
    ), ranked_series as (
      select
        *,
        row_number() over (
          partition by "product_id"
          order by "protocol_key"
        ) = 1 as "is_primary"
      from legacy_series
    )
    insert into "research_protocol_series" (
      "id",
      "protocol_key",
      "product_id",
      "purpose",
      "applicability_scope",
      "is_primary",
      "archived_at",
      "created_by_actor_id",
      "updated_by_actor_id",
      "created_at",
      "updated_at",
      "deleted_at"
    )
    select
      'rps_legacy_' || md5("protocol_key"),
      "protocol_key",
      "product_id",
      null,
      'selected_variants',
      "is_primary",
      null,
      null,
      null,
      "created_at",
      "updated_at",
      "deleted_at"
    from ranked_series
    on conflict do nothing;`);

    this.addSql(`insert into "research_protocol_variant_target" (
      "id",
      "product_variant_id",
      "series_id",
      "created_at",
      "updated_at",
      "deleted_at"
    )
    select distinct
      'rpvt_legacy_' || md5(series."id" || ':' || rp."product_variant_id"),
      rp."product_variant_id",
      series."id",
      min(rp."created_at") over (
        partition by series."id", rp."product_variant_id"
      ),
      max(rp."updated_at") over (
        partition by series."id", rp."product_variant_id"
      ),
      null::timestamptz
    from "research_protocol" rp
    join "research_protocol_series" series
      on series."protocol_key" = rp."protocol_key"
    on conflict do nothing;`);

    this.addSql(`insert into "research_protocol_audit_event" (
      "id",
      "revision_id",
      "event_type",
      "actor_id",
      "reason",
      "details",
      "series_id",
      "created_at",
      "updated_at",
      "deleted_at"
    )
    select
      'rpae_legacy_' || md5(series."id"),
      null,
      'series_created',
      'system:migration:20260831041552',
      'Legacy variant-linked protocol series backfilled',
      jsonb_build_object('source', 'legacy_research_protocol'),
      series."id",
      series."created_at",
      series."updated_at",
      null::timestamptz
    from "research_protocol_series" series
    where series."id" like 'rps_legacy_%'
    on conflict do nothing;`);

    this.addSql(`alter table if exists "research_protocol_audit_event" add constraint "research_protocol_audit_event_series_id_foreign" foreign key ("series_id") references "research_protocol_series" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_protocol_variant_target" add constraint "research_protocol_variant_target_series_id_foreign" foreign key ("series_id") references "research_protocol_series" ("id") on update cascade;`);

    this.addSql(`alter table if exists "research_protocol" add column if not exists "schema_version" integer not null default 1, add column if not exists "published_by_actor_id" text null, add column if not exists "decision_reason" text null, add column if not exists "series_id" text null;`);
    this.addSql(`alter table if exists "research_protocol" alter column "product_variant_id" type text using ("product_variant_id"::text);`);
    this.addSql(`alter table if exists "research_protocol" alter column "product_variant_id" drop not null;`);
    this.addSql(`update "research_protocol" rp
      set "series_id" = series."id"
      from "research_protocol_series" series
      where series."protocol_key" = rp."protocol_key"
        and rp."series_id" is null;`);
    this.addSql(`do $$
    begin
      if exists (
        select 1
        from "research_protocol"
        where "series_id" is null
      ) then
        raise exception 'Research protocol series backfill did not resolve every revision';
      end if;
    end $$;`);
    this.addSql(`alter table if exists "research_protocol" alter column "series_id" set not null;`);
    this.addSql(`alter table if exists "research_protocol" add constraint "research_protocol_series_id_foreign" foreign key ("series_id") references "research_protocol_series" ("id") on update cascade;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_series_id" ON "research_protocol" ("series_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_protocol_series_id_revision_unique" ON "research_protocol" ("series_id", "revision") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_protocol_series_id_status" ON "research_protocol" ("series_id", "status") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "research_protocol_audit_event" drop constraint if exists "research_protocol_audit_event_series_id_foreign";`);

    this.addSql(`alter table if exists "research_protocol" drop constraint if exists "research_protocol_series_id_foreign";`);

    this.addSql(`alter table if exists "research_protocol_variant_target" drop constraint if exists "research_protocol_variant_target_series_id_foreign";`);

    this.addSql(`drop table if exists "research_protocol_series" cascade;`);

    this.addSql(`drop table if exists "research_protocol_audit_event" cascade;`);

    this.addSql(`drop table if exists "research_protocol_variant_target" cascade;`);

    this.addSql(`drop index if exists "IDX_research_protocol_series_id";`);
    this.addSql(`drop index if exists "IDX_research_protocol_series_id_revision_unique";`);
    this.addSql(`drop index if exists "IDX_research_protocol_series_id_status";`);
    this.addSql(`alter table if exists "research_protocol" drop column if exists "schema_version", drop column if exists "published_by_actor_id", drop column if exists "decision_reason", drop column if exists "series_id";`);

    this.addSql(`alter table if exists "research_protocol" alter column "product_variant_id" type text using ("product_variant_id"::text);`);
    this.addSql(`alter table if exists "research_protocol" alter column "product_variant_id" set not null;`);
  }

}
