import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260831192951 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "referral_event" drop constraint if exists "referral_event_program_id_referred_customer_id_unique";`);
    this.addSql(`alter table if exists "referral_account" drop constraint if exists "referral_account_program_id_code_unique";`);
    this.addSql(`alter table if exists "referral_account" drop constraint if exists "referral_account_program_id_customer_id_unique";`);
    this.addSql(`create table if not exists "referral_account" ("id" text not null, "program_id" text not null, "customer_id" text not null, "code" text not null, "status" text check ("status" in ('active', 'suspended', 'closed')) not null default 'active', "qualified_referrals" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "referral_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_account_deleted_at" ON "referral_account" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_referral_account_program_id_customer_id_unique" ON "referral_account" ("program_id", "customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_referral_account_program_id_code_unique" ON "referral_account" ("program_id", "code") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "referral_event" ("id" text not null, "program_id" text not null, "referral_account_id" text not null, "referral_code_snapshot" text not null, "referrer_customer_id" text not null, "referred_customer_id" text not null, "status" text check ("status" in ('pending', 'qualified', 'reversed', 'rejected')) not null default 'pending', "qualifying_order_id" text null, "qualifying_payment_id" text null, "eligible_amount" numeric null, "referrer_points" integer not null default 0, "referred_customer_points" integer not null default 0, "waiting_period_days" integer not null default 0, "claimed_at" timestamptz not null, "qualified_at" timestamptz null, "available_at" timestamptz null, "reversed_at" timestamptz null, "rejection_reason" text null, "raw_eligible_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "referral_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_event_deleted_at" ON "referral_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_referral_event_program_id_referred_customer_id_unique" ON "referral_event" ("program_id", "referred_customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_event_referral_account_id_status" ON "referral_event" ("referral_account_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_event_qualifying_order_id" ON "referral_event" ("qualifying_order_id") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "reward_program" add column if not exists "referral_enabled" boolean not null default false, add column if not exists "referral_minimum_order_amount" numeric not null default 0, add column if not exists "referral_waiting_period_days" integer not null default 0, add column if not exists "referral_maximum_per_customer" integer null, add column if not exists "referral_refund_reversal_enabled" boolean not null default true, add column if not exists "referral_eligible_product_ids" jsonb null, add column if not exists "referral_starts_at" timestamptz null, add column if not exists "referral_ends_at" timestamptz null, add column if not exists "raw_referral_minimum_order_amount" jsonb not null default '{"value":"0","precision":20}';`);

    this.addSql(`alter table if exists "reward_rule" add column if not exists "show_as_badge" boolean not null default false, add column if not exists "badge_name" text null, add column if not exists "badge_icon" text null, add column if not exists "streak_target" integer null, add column if not exists "skip_policy" text check ("skip_policy" in ('ignore', 'break')) not null default 'ignore';`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "referral_account" cascade;`);

    this.addSql(`drop table if exists "referral_event" cascade;`);

    this.addSql(`alter table if exists "reward_program" drop column if exists "referral_enabled", drop column if exists "referral_minimum_order_amount", drop column if exists "referral_waiting_period_days", drop column if exists "referral_maximum_per_customer", drop column if exists "referral_refund_reversal_enabled", drop column if exists "referral_eligible_product_ids", drop column if exists "referral_starts_at", drop column if exists "referral_ends_at", drop column if exists "raw_referral_minimum_order_amount";`);

    this.addSql(`alter table if exists "reward_rule" drop column if exists "show_as_badge", drop column if exists "badge_name", drop column if exists "badge_icon", drop column if exists "streak_target", drop column if exists "skip_policy";`);
  }

}
