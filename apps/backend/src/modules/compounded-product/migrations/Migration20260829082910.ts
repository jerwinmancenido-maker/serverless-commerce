import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260829082910 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "compounded_product_governance_audit_event" ("id" text not null, "event_type" text check ("event_type" in ('configuration_created', 'configuration_revised', 'configuration_status_transitioned', 'large_matrix_confirmed', 'product_draft_created', 'readiness_evaluated', 'recipe_changed', 'publication_succeeded', 'publication_rejected', 'publication_withdrawn')) not null, "outcome" text check ("outcome" in ('succeeded', 'rejected')) not null, "actor_id" text not null, "product_id" text null, "variant_id" text null, "presentation_id" text null, "presentation_revision_id" text null, "registration_id" text null, "correlation_id" text null, "decision" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "compounded_product_governance_audit_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_governance_audit_event_deleted_at" ON "compounded_product_governance_audit_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_governance_audit_event_product_id_created_at" ON "compounded_product_governance_audit_event" ("product_id", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_governance_audit_event_presentation_id_created_at" ON "compounded_product_governance_audit_event" ("presentation_id", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_governance_audit_event_event_type_created_at" ON "compounded_product_governance_audit_event" ("event_type", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_governance_audit_event_correlation_id" ON "compounded_product_governance_audit_event" ("correlation_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "compounded_product_governance_audit_event" cascade;`);
  }

}
