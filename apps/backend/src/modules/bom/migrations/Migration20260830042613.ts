import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260830042613 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "component_profile" add column if not exists "classification" text check ("classification" in ('finished_product', 'included_supply', 'packaging')) not null default 'included_supply', add column if not exists "supplier_unit" text check ("supplier_unit" in ('box', 'pack', 'roll', 'piece')) not null default 'piece', add column if not exists "inventory_units_per_supplier_unit" integer not null default 1;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "component_profile" drop column if exists "classification", drop column if exists "supplier_unit", drop column if exists "inventory_units_per_supplier_unit";`);
  }

}
