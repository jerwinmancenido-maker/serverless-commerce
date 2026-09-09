/**
 * @file apps/backend/src/modules/research-content/models/peptide-comparison.ts
 * @module ResearchContentModule · PeptideComparison
 * @purpose Defines the DML entity schema for head-to-head peptide comparison matrices and vector evaluations.
 * @contracts Input: Comparison payload | Output: PeptideComparison Entity
 */

import { model } from "@medusajs/framework/utils"

const PeptideComparison = model
  .define("peptide_comparison", {
    id: model.id().primaryKey(),
    slug: model.text(),
    title: model.text(),
    subtitle: model.text(),
    category: model.text(),
    compound_a: model.json(),
    compound_b: model.json(),
    summary: model.text(),
    synergy_verdict: model.text(),
    vectors: model.json(),
    citations: model.json(),
    status: model.enum(["draft", "published"]).default("draft"),
    published_at: model.dateTime().nullable(),
    metadata: model.json().nullable(),
  })
  .indexes([
    { on: ["slug"], unique: true },
    { on: ["status"] },
    { on: ["category"] },
  ])

export default PeptideComparison
