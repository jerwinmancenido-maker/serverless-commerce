import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260829071108 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "compounded_product_creation_request" drop constraint if exists "compounded_product_creation_request_operation_idempotency_key_unique";`);
    this.addSql(`create table if not exists "compounded_product_creation_request" ("id" text not null, "operation" text check ("operation" in ('create_product')) not null, "idempotency_key" text not null, "request_fingerprint_sha256" text not null, "status" text check ("status" in ('in_progress', 'succeeded', 'failed')) not null default 'in_progress', "actor_id" text not null, "native_product_id" text null, "response_payload" jsonb null, "error_code" text null, "completed_at" timestamptz null, "failed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "compounded_product_creation_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_creation_request_deleted_at" ON "compounded_product_creation_request" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_compounded_product_creation_request_operation_idempotency_key_unique" ON "compounded_product_creation_request" ("operation", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_creation_request_status" ON "compounded_product_creation_request" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_compounded_product_creation_request_request_fingerprint_sha256" ON "compounded_product_creation_request" ("request_fingerprint_sha256") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "compounded_product_creation_request" cascade;`);
  }

}
