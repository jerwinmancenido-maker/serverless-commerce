/**
 * @file apps/backend/src/modules/research-content/models/research-article.ts
 * @module ResearchContentModule · ResearchArticle
 * @purpose Defines the DML entity schema for peer-reviewed scientific articles and research monographs.
 * @contracts Input: Article payload | Output: ResearchArticle Entity
 */

import { model } from "@medusajs/framework/utils"

const ResearchArticle = model
  .define("research_article", {
    id: model.id().primaryKey(),
    slug: model.text(),
    title: model.text(),
    subtitle: model.text(),
    abstract: model.text(),
    category: model.text(),
    compound_tag: model.text(),
    reading_time: model.text(),
    reviewed_by: model.text(),
    status: model.enum(["draft", "published"]).default("draft"),
    published_at: model.dateTime().nullable(),
    sections: model.json(),
    citations: model.json(),
    referenced_compound: model.json().nullable(),
    metadata: model.json().nullable(),
  })
  .indexes([
    { on: ["slug"], unique: true },
    { on: ["status"] },
    { on: ["category"] },
    { on: ["compound_tag"] },
  ])

export default ResearchArticle
