import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260829085934 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "compounded_product_type_mapping" drop constraint if exists "compounded_product_type_mapping_product_type_id_presentation_id_unique";`);
    this.addSql(`create table if not exists "compounded_product_type_mapping" ("id" text not null, "product_type_id" text not null, "status" text check ("status" in ('active', 'inactive', 'archived')) not null default 'active', "reason" text not null, "created_by_actor_id" text not null, "updated_by_actor_id" text not null, "activated_at" timestamptz null, "deactivated_at" timestamptz null, "archived_at" timestamptz null, "presentation_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "compounded_product_type_mapping_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_type_mapping_presentation_id" ON "compounded_product_type_mapping" ("presentation_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_type_mapping_deleted_at" ON "compounded_product_type_mapping" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_compounded_product_type_mapping_product_type_id_presentation_id_unique" ON "compounded_product_type_mapping" ("product_type_id", "presentation_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_type_mapping_product_type_id_status" ON "compounded_product_type_mapping" ("product_type_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_type_mapping_presentation_id_status" ON "compounded_product_type_mapping" ("presentation_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "compounded_product_type_mapping" add constraint "compounded_product_type_mapping_presentation_id_foreign" foreign key ("presentation_id") references "compounded_product_presentation" ("id") on update cascade;`);

    this.addSql(`alter table if exists "compounded_product_governance_audit_event" drop constraint if exists "compounded_product_governance_audit_event_event_type_check";`);

    this.addSql(`alter table if exists "compounded_product_governance_audit_event" add constraint "compounded_product_governance_audit_event_event_type_check" check("event_type" in ('configuration_created', 'configuration_revised', 'configuration_status_transitioned', 'governed_registration_created', 'classification_mapping_created', 'classification_mapping_status_transitioned', 'large_matrix_confirmed', 'product_draft_created', 'readiness_evaluated', 'recipe_changed', 'publication_succeeded', 'publication_rejected', 'publication_withdrawn'));`);

    this.addSql(`alter table if exists "compounded_product_registration" add column if not exists "governed_product_type_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "compounded_product_type_mapping" cascade;`);

    this.addSql(`alter table if exists "compounded_product_governance_audit_event" drop constraint if exists "compounded_product_governance_audit_event_event_type_check";`);

    this.addSql(`alter table if exists "compounded_product_governance_audit_event" add constraint "compounded_product_governance_audit_event_event_type_check" check("event_type" in ('configuration_created', 'configuration_revised', 'configuration_status_transitioned', 'governed_registration_created', 'large_matrix_confirmed', 'product_draft_created', 'readiness_evaluated', 'recipe_changed', 'publication_succeeded', 'publication_rejected', 'publication_withdrawn'));`);

    this.addSql(`alter table if exists "compounded_product_registration" drop column if exists "governed_product_type_id";`);
  }

}
