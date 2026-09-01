import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831143853 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "reward_rule" drop constraint if exists "reward_rule_program_id_name_unique";`);
    this.addSql(`alter table if exists "reward_redemption" drop constraint if exists "reward_redemption_customer_id_idempotency_key_unique";`);
    this.addSql(`alter table if exists "reward_ledger_entry" drop constraint if exists "reward_ledger_entry_reward_account_id_idempotency_key_unique";`);
    this.addSql(`alter table if exists "reward_account" drop constraint if exists "reward_account_customer_id_program_id_unique";`);
    this.addSql(`create table if not exists "reward_account" ("id" text not null, "customer_id" text not null, "program_id" text not null, "status" text check ("status" in ('active', 'suspended', 'closed')) not null default 'active', "lifetime_earned" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "reward_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_account_deleted_at" ON "reward_account" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_reward_account_customer_id_program_id_unique" ON "reward_account" ("customer_id", "program_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_account_customer_id_status" ON "reward_account" ("customer_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "reward_ledger_entry" ("id" text not null, "reward_account_id" text not null, "entry_type" text check ("entry_type" in ('earn', 'redeem', 'reverse', 'expire', 'adjustment')) not null, "points" integer not null, "status" text check ("status" in ('pending', 'available', 'reversed', 'cancelled')) not null, "rule_id" text null, "source_type" text not null, "source_id" text not null, "order_id" text null, "idempotency_key" text not null, "available_at" timestamptz null, "expires_at" timestamptz null, "reversal_entry_id" text null, "admin_reason" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "reward_ledger_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_ledger_entry_deleted_at" ON "reward_ledger_entry" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_reward_ledger_entry_reward_account_id_idempotency_key_unique" ON "reward_ledger_entry" ("reward_account_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_ledger_entry_reward_account_id_status_created_at" ON "reward_ledger_entry" ("reward_account_id", "status", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_ledger_entry_order_id" ON "reward_ledger_entry" ("order_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "reward_program" ("id" text not null, "name" text not null, "status" text check ("status" in ('draft', 'active', 'paused')) not null default 'draft', "currency_code" text not null default 'php', "purchase_amount_per_point" numeric not null default 100, "peso_value_per_point" numeric not null default 1, "minimum_redemption_points" integer not null default 100, "maximum_redemption_points" integer null, "points_expire_after_days" integer null, "pending_period_days" integer not null default 0, "raw_purchase_amount_per_point" jsonb not null default '{"value":"100","precision":20}', "raw_peso_value_per_point" jsonb not null default '{"value":"1","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "reward_program_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_program_deleted_at" ON "reward_program" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_program_status" ON "reward_program" ("status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "reward_redemption" ("id" text not null, "customer_id" text not null, "reward_account_id" text not null, "points" integer not null, "peso_value" numeric not null, "reward_type" text check ("reward_type" in ('order_discount')) not null, "promotion_id" text null, "order_id" text null, "status" text check ("status" in ('pending', 'applied', 'cancelled', 'reversed')) not null, "idempotency_key" text not null, "redeemed_at" timestamptz not null, "raw_peso_value" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "reward_redemption_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_redemption_deleted_at" ON "reward_redemption" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_reward_redemption_customer_id_idempotency_key_unique" ON "reward_redemption" ("customer_id", "idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_redemption_reward_account_id_status_redeemed_at" ON "reward_redemption" ("reward_account_id", "status", "redeemed_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "reward_rule" ("id" text not null, "name" text not null, "event_type" text not null, "award_type" text check ("award_type" in ('fixed', 'purchase_rate')) not null, "point_value" integer null, "purchase_amount_per_point" numeric null, "eligible_product_ids" jsonb null, "eligible_category_ids" jsonb null, "daily_cap" integer null, "weekly_cap" integer null, "lifetime_cap" integer null, "starts_at" timestamptz null, "ends_at" timestamptz null, "status" text check ("status" in ('active', 'inactive')) not null default 'active', "program_id" text not null, "raw_purchase_amount_per_point" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "reward_rule_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_rule_deleted_at" ON "reward_rule" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_reward_rule_program_id_event_type_status" ON "reward_rule" ("program_id", "event_type", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_reward_rule_program_id_name_unique" ON "reward_rule" ("program_id", "name") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "reward_account" cascade;`);

    this.addSql(`drop table if exists "reward_ledger_entry" cascade;`);

    this.addSql(`drop table if exists "reward_program" cascade;`);

    this.addSql(`drop table if exists "reward_redemption" cascade;`);

    this.addSql(`drop table if exists "reward_rule" cascade;`);
  }

}
