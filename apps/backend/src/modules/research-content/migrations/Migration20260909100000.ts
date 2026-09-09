/**
 * @file apps/backend/src/modules/research-content/migrations/Migration20260909100000.ts
 * @module ResearchContentMigrations · ResearchArticleAndPeptideComparison
 * @purpose Schema migration adding research_article and peptide_comparison tables with compound indexes.
 * @contracts PostgreSQL schema migration
 */

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260909100000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "research_article" (
      "id" text not null,
      "slug" text not null,
      "title" text not null,
      "subtitle" text not null,
      "abstract" text not null,
      "category" text not null,
      "compound_tag" text not null,
      "reading_time" text not null,
      "reviewed_by" text not null,
      "status" text check ("status" in ('draft', 'published')) not null default 'draft',
      "published_at" timestamptz null,
      "sections" jsonb not null,
      "citations" jsonb not null,
      "referenced_compound" jsonb null,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "research_article_pkey" primary key ("id")
    );`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_article_deleted_at" ON "research_article" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_research_article_slug_unique" ON "research_article" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_article_status" ON "research_article" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_article_category" ON "research_article" ("category") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_research_article_compound_tag" ON "research_article" ("compound_tag") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "peptide_comparison" (
      "id" text not null,
      "slug" text not null,
      "title" text not null,
      "subtitle" text not null,
      "category" text not null,
      "compound_a" jsonb not null,
      "compound_b" jsonb not null,
      "summary" text not null,
      "synergy_verdict" text not null,
      "vectors" jsonb not null,
      "citations" jsonb not null,
      "status" text check ("status" in ('draft', 'published')) not null default 'draft',
      "published_at" timestamptz null,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "peptide_comparison_pkey" primary key ("id")
    );`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_peptide_comparison_deleted_at" ON "peptide_comparison" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_peptide_comparison_slug_unique" ON "peptide_comparison" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_peptide_comparison_status" ON "peptide_comparison" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_peptide_comparison_category" ON "peptide_comparison" ("category") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "research_article" cascade;`);
    this.addSql(`drop table if exists "peptide_comparison" cascade;`);
  }
}
