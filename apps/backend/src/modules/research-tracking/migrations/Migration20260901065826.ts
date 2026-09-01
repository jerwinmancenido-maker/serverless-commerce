import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260901065826 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "research_notification" drop constraint if exists "research_notification_type_check";`);

    this.addSql(`alter table if exists "research_notification" add constraint "research_notification_type_check" check("type" in ('routine_reminder', 'daily_summary', 'weekly_summary', 'replenishment', 'progress', 'journal_prompt', 'reward', 'community_reply', 'community_moderation', 'support_reply'));`);

    this.addSql(`alter table if exists "research_reminder_preference" add column if not exists "community_reply_notifications" boolean not null default true, add column if not exists "community_moderation_notifications" boolean not null default true, add column if not exists "support_reply_notifications" boolean not null default true;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "research_notification" drop constraint if exists "research_notification_type_check";`);

    this.addSql(`alter table if exists "research_notification" add constraint "research_notification_type_check" check("type" in ('routine_reminder', 'daily_summary', 'weekly_summary', 'replenishment', 'progress', 'journal_prompt', 'reward'));`);

    this.addSql(`alter table if exists "research_reminder_preference" drop column if exists "community_reply_notifications", drop column if exists "community_moderation_notifications", drop column if exists "support_reply_notifications";`);
  }

}
