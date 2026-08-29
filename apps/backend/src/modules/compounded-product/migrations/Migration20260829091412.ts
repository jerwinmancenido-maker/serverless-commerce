import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260829091412 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "compounded_product_governance_audit_event" drop constraint if exists "compounded_product_governance_audit_event_event_type_check";`);

    this.addSql(`alter table if exists "compounded_product_governance_audit_event" add constraint "compounded_product_governance_audit_event_event_type_check" check("event_type" in ('configuration_created', 'configuration_revised', 'configuration_status_transitioned', 'governed_registration_created', 'classification_mapping_created', 'classification_mapping_status_transitioned', 'configuration_revision_retained', 'configuration_revision_migrated', 'large_matrix_confirmed', 'product_draft_created', 'readiness_evaluated', 'recipe_changed', 'publication_succeeded', 'publication_rejected', 'publication_withdrawn'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "compounded_product_governance_audit_event" drop constraint if exists "compounded_product_governance_audit_event_event_type_check";`);

    this.addSql(`alter table if exists "compounded_product_governance_audit_event" add constraint "compounded_product_governance_audit_event_event_type_check" check("event_type" in ('configuration_created', 'configuration_revised', 'configuration_status_transitioned', 'governed_registration_created', 'classification_mapping_created', 'classification_mapping_status_transitioned', 'large_matrix_confirmed', 'product_draft_created', 'readiness_evaluated', 'recipe_changed', 'publication_succeeded', 'publication_rejected', 'publication_withdrawn'));`);
  }

}
