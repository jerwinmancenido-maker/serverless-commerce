/**
 * @file    apps/storefront/src/lib/data/research-articles.ts
 * @module  ResearchArticlesData (Storefront Research Articles)
 * @purpose Data access layer for scientific research articles with Medusa backend API and static fallback.
 * @contracts
 *   API: GET /store/research-articles · GET /store/research-articles/:slug
 */

import { sdk } from "@lib/config"
import STATIC_ARTICLES_DATA from "./scientific-articles.json"

export type ResearchCitation = {
  number: number
  authors: string
  title: string
  journal: string
  year: number
  volume?: string
  pages?: string
  pmid?: string
  doi?: string
  url: string
}

export type ArticleSection = {
  title: string
  paragraphs: string[]
}

export type ReferencedCompound = {
  name: string
  handle: string
  purity: string
  specification: string
  default_dose_preset?: number
  default_mass_mg?: number
  protocol_handle?: string
}

export type ResearchArticle = {
  id?: string
  slug: string
  title: string
  subtitle: string
  abstract: string
  category: "Tissue Repair & Healing" | "Cellular Longevity" | "Metabolic Signaling" | "Laboratory Methodology" | string
  compound_tag: string
  reading_time: string
  reviewed_by: string
  published_at?: string
  updated_at?: string
  sections: ArticleSection[]
  citations: ResearchCitation[]
  referenced_compound?: ReferencedCompound
  key_takeaways?: string[]
  telemetry?: Record<string, string>
  metadata?: Record<string, unknown>
}

export const RESEARCH_ARTICLES: ResearchArticle[] = (STATIC_ARTICLES_DATA as unknown as ResearchArticle[])


export const normalizeArticle = (
  article: Partial<ResearchArticle> & Record<string, unknown>
): ResearchArticle => {
  if (!article) return article as unknown as ResearchArticle
  const rawSections = article.sections
  const metadata = article.metadata as { content_markdown?: string } | undefined
  const rawCitations = article.citations as Array<Record<string, unknown> | string> | undefined

  return {
    ...(article as ResearchArticle),
    sections:
      Array.isArray(rawSections) && rawSections.length > 0
        ? (rawSections as ArticleSection[])
        : typeof metadata?.content_markdown === "string"
        ? [{ title: "Monograph Content", paragraphs: [metadata.content_markdown] }]
        : [],
    citations: Array.isArray(rawCitations)
      ? rawCitations.map((c, i) => {
          if (typeof c === "string") {
            return {
              number: i + 1,
              authors: "",
              title: c,
              journal: "",
              year: new Date().getFullYear(),
              url: c.startsWith("http") ? c : "",
            }
          }
          const item = c || {}
          const pmid = typeof item.pmid === "string" ? item.pmid : undefined
          const doi = typeof item.doi === "string" ? item.doi : undefined
          const fallbackUrl = pmid
            ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
            : doi
            ? `https://doi.org/${doi}`
            : ""
          return {
            number: typeof item.number === "number" ? item.number : i + 1,
            authors: typeof item.authors === "string" ? item.authors : "",
            title: typeof item.title === "string" ? item.title : "",
            journal: typeof item.journal === "string" ? item.journal : "",
            year: typeof item.year === "number" ? item.year : new Date().getFullYear(),
            pmid,
            doi,
            url: typeof item.url === "string" && item.url ? item.url : fallbackUrl,
          }
        })
      : [],
  }
}

export const listResearchArticles = async (): Promise<ResearchArticle[]> => {
  try {
    const response = await sdk.client.fetch<{ articles: ResearchArticle[]; count: number }>(
      "/store/research-articles?limit=100",
      { method: "GET", cache: "no-store" }
    )
    if (response?.articles && response.articles.length > 0) {
      return response.articles.map(normalizeArticle)
    }
  } catch (err) {
    console.warn("[listResearchArticles] Medusa API call failed or offline, falling back to static cache:", err)
  }
  return RESEARCH_ARTICLES.map(normalizeArticle)
}

export const retrieveResearchArticle = async (
  slug: string
): Promise<ResearchArticle | null> => {
  try {
    const response = await sdk.client.fetch<{ article: ResearchArticle }>(
      `/store/research-articles/${encodeURIComponent(slug)}`,
      { method: "GET", cache: "no-store" }
    )
    if (response?.article) {
      return normalizeArticle(response.article)
    }
  } catch (err) {
    console.warn(`[retrieveResearchArticle] Medusa API call for '${slug}' failed, falling back to static cache:`, err)
  }
  const article = RESEARCH_ARTICLES.find((a) => a.slug === slug)
  return article ? normalizeArticle(article) : null
}

export const listArticlesForCompound = async (
  compoundTagOrHandle: string
): Promise<ResearchArticle[]> => {
  const articles = await listResearchArticles()
  if (!compoundTagOrHandle) return []
  const query = compoundTagOrHandle.toLowerCase().trim()
  const cleanQuery = query
    .replace(/-[0-9]+(\.[0-9]+)?(mg|mcg|iu|ml)$/i, "")
    .replace(/\s+[0-9]+(\.[0-9]+)?\s*(mg|mcg|iu|ml).*$/i, "")
    .replace(/-laboratory-handling$/i, "")
    .replace(/-protocol$/i, "")

  return articles.filter((a) => {
    const atag = (a.compound_tag || "").toLowerCase()
    const aslug = (a.slug || "").toLowerCase()
    const atitle = (a.title || "").toLowerCase()
    const ref = a.referenced_compound
    const refHandle = (ref?.handle || "").toLowerCase()
    const refProt = (ref?.protocol_handle || "").toLowerCase()
    const refName = (ref?.name || "").toLowerCase()

    if (refHandle === query || refHandle === cleanQuery) return true
    if (refProt === query || refProt === cleanQuery) return true
    if (refName && (refName.includes(query) || refName.includes(cleanQuery))) return true
    if (atag && (atag === query || atag === cleanQuery || query.includes(atag) || cleanQuery.includes(atag))) return true
    if (aslug.startsWith(cleanQuery) || aslug.includes(cleanQuery)) return true
    if (atitle.includes(cleanQuery)) return true
    return false
  })
}

