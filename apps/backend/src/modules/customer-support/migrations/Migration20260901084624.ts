import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260901084624 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "support_message" drop constraint if exists "support_message_sender_type_check";`);

    this.addSql(`alter table if exists "support_message" add constraint "support_message_sender_type_check" check("sender_type" in ('customer', 'staff', 'system'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "support_message" drop constraint if exists "support_message_sender_type_check";`);

    this.addSql(`alter table if exists "support_message" add constraint "support_message_sender_type_check" check("sender_type" in ('customer', 'staff'));`);
  }

}
