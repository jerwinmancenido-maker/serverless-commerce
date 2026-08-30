import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260830084433 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "compounded_product_family" drop constraint if exists "compounded_product_family_key_unique";`,
    );
    this.addSql(
      `create table if not exists "compounded_product_family" ("id" text not null, "key" text not null, "name" text not null, "description" text null, "status" text check ("status" in ('active', 'archived')) not null default 'active', "created_by_actor_id" text not null, "updated_by_actor_id" text not null, "archived_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "compounded_product_family_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_compounded_product_family_key_unique" ON "compounded_product_family" ("key") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_compounded_product_family_deleted_at" ON "compounded_product_family" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_compounded_product_family_status" ON "compounded_product_family" ("status") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_compounded_product_family_name" ON "compounded_product_family" ("name") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `alter table if exists "compounded_product_governance_audit_event" drop constraint if exists "compounded_product_governance_audit_event_event_type_check";`,
    );

    this.addSql(
      `alter table if exists "compounded_product_governance_audit_event" add constraint "compounded_product_governance_audit_event_event_type_check" check("event_type" in ('configuration_created', 'configuration_revised', 'configuration_status_transitioned', 'compound_family_created', 'compound_family_updated', 'compound_family_archived', 'compound_family_assigned', 'compound_family_unassigned', 'governed_registration_created', 'governed_registration_reclassified', 'governed_registration_removed', 'classification_mapping_created', 'classification_mapping_status_transitioned', 'configuration_revision_retained', 'configuration_revision_migrated', 'large_matrix_confirmed', 'product_draft_created', 'readiness_evaluated', 'recipe_changed', 'publication_succeeded', 'publication_rejected', 'publication_withdrawn'));`,
    );

    this.addSql(
      `alter table if exists "compounded_product_registration" add column if not exists "compound_family_id" text null;`,
    );
    this.addSql(
      `alter table if exists "compounded_product_registration" add constraint "compounded_product_registration_compound_family_id_foreign" foreign key ("compound_family_id") references "compounded_product_family" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_compounded_product_registration_compound_family_id" ON "compounded_product_registration" ("compound_family_id") WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "compounded_product_registration" drop constraint if exists "compounded_product_registration_compound_family_id_foreign";`,
    );

    this.addSql(`drop table if exists "compounded_product_family" cascade;`);

    this.addSql(
      `alter table if exists "compounded_product_governance_audit_event" drop constraint if exists "compounded_product_governance_audit_event_event_type_check";`,
    );

    this.addSql(
      `alter table if exists "compounded_product_governance_audit_event" add constraint "compounded_product_governance_audit_event_event_type_check" check("event_type" in ('configuration_created', 'configuration_revised', 'configuration_status_transitioned', 'governed_registration_created', 'governed_registration_reclassified', 'governed_registration_removed', 'classification_mapping_created', 'classification_mapping_status_transitioned', 'configuration_revision_retained', 'configuration_revision_migrated', 'large_matrix_confirmed', 'product_draft_created', 'readiness_evaluated', 'recipe_changed', 'publication_succeeded', 'publication_rejected', 'publication_withdrawn'));`,
    );

    this.addSql(
      `drop index if exists "IDX_compounded_product_registration_compound_family_id";`,
    );
    this.addSql(
      `alter table if exists "compounded_product_registration" drop column if exists "compound_family_id";`,
    );
  }
}
