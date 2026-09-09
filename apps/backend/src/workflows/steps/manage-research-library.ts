/**
 * @file    apps/backend/src/workflows/steps/manage-research-library.ts
 * @module  ManageResearchLibrarySteps
 * @purpose Workflow steps for creating, updating, and deleting scientific articles and peptide comparisons.
 * @contracts
 *   Step: createPeptideComparisonStep · updatePeptideComparisonStep · deletePeptideComparisonStep
 *   Step: createResearchArticleStep · updateResearchArticleStep · deleteResearchArticleStep
 *   Service: ResearchContentModuleService
 */

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import type ResearchContentModuleService from "../../modules/research-content/service"

export type ComparisonStatus = "draft" | "published"

export type CreatePeptideComparisonStepInput = {
  slug: string
  title: string
  subtitle?: string
  category?: string
  compound_a: Record<string, any>
  compound_b: Record<string, any>
  summary?: string
  synergy_verdict?: string
  vectors?: any[]
  citations?: any[]
  status?: ComparisonStatus
  published_at?: string | null
  metadata?: Record<string, any> | null
}

export type UpdatePeptideComparisonStepInput = {
  id: string
  slug?: string
  title?: string
  subtitle?: string
  category?: string
  compound_a?: Record<string, any>
  compound_b?: Record<string, any>
  summary?: string
  synergy_verdict?: string
  vectors?: any[]
  citations?: any[]
  status?: ComparisonStatus
  published_at?: string | null
  metadata?: Record<string, any> | null
}

export type DeleteEntityStepInput = {
  id: string
}

export type ArticleStatus = "draft" | "published"

export type CreateResearchArticleStepInput = {
  slug: string
  title: string
  subtitle?: string
  abstract?: string
  category?: string
  compound_tag?: string
  reading_time?: string
  reviewed_by?: string
  status?: ArticleStatus
  published_at?: string | null
  sections?: any[]
  citations?: any[]
  referenced_compound?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export type UpdateResearchArticleStepInput = {
  id: string
  slug?: string
  title?: string
  subtitle?: string
  abstract?: string
  category?: string
  compound_tag?: string
  reading_time?: string
  reviewed_by?: string
  status?: ArticleStatus
  published_at?: string | null
  sections?: any[]
  citations?: any[]
  referenced_compound?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export const createPeptideComparisonStep = createStep(
  "create-peptide-comparison",
  async (input: CreatePeptideComparisonStepInput, { container }) => {
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const comparison = await service.createPeptideComparisons(input as any)
    return new StepResponse(comparison, comparison.id)
  },
  async (id, { container }) => {
    if (!id) return
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    await service.deletePeptideComparisons([id])
  },
)

export const updatePeptideComparisonStep = createStep(
  "update-peptide-comparison",
  async (input: UpdatePeptideComparisonStepInput, { container }) => {
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const prior = await service.retrievePeptideComparison(input.id)
    const comparison = await service.updatePeptideComparisons(input as any)
    return new StepResponse(comparison, prior)
  },
  async (prior, { container }) => {
    if (!prior) return
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    await service.updatePeptideComparisons(prior as any)
  },
)

export const deletePeptideComparisonStep = createStep(
  "delete-peptide-comparison",
  async (input: DeleteEntityStepInput, { container }) => {
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    await service.deletePeptideComparisons([input.id])
    return new StepResponse({
      id: input.id,
      object: "peptide_comparison",
      deleted: true,
    })
  },
)

export const createResearchArticleStep = createStep(
  "create-research-article",
  async (input: CreateResearchArticleStepInput, { container }) => {
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const article = await service.createResearchArticles(input as any)
    return new StepResponse(article, article.id)
  },
  async (id, { container }) => {
    if (!id) return
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    await service.deleteResearchArticles([id])
  },
)

export const updateResearchArticleStep = createStep(
  "update-research-article",
  async (input: UpdateResearchArticleStepInput, { container }) => {
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    const prior = await service.retrieveResearchArticle(input.id)
    const article = await service.updateResearchArticles(input as any)
    return new StepResponse(article, prior)
  },
  async (prior, { container }) => {
    if (!prior) return
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    await service.updateResearchArticles(prior as any)
  },
)

export const deleteResearchArticleStep = createStep(
  "delete-research-article",
  async (input: DeleteEntityStepInput, { container }) => {
    const service = container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
    await service.deleteResearchArticles([input.id])
    return new StepResponse({
      id: input.id,
      object: "research_article",
      deleted: true,
    })
  },
)
