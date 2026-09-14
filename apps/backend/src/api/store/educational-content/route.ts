/**
 * @file apps/backend/src/api/store/educational-content/route.ts
 * @module StorefrontAPI · EducationalContent
 * @purpose Public storefront endpoint serving verified clinical glossary definitions,
 *          laboratory storage tiers, FAQ monographs, and reconstitution safety standards.
 * @contracts GET /store/educational-content?category=&query=&type=
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

export interface GlossaryTerm {
  term: string
  category: string
  definition: string
  relatedCompounds?: string[]
}

export interface FaqItem {
  question: string
  category: string
  answer: string
  tags?: string[]
}

interface EducationalContentData {
  version: string
  updatedAt: string
  glossary: GlossaryTerm[]
  faqs: FaqItem[]
  storage_guidelines?: Record<string, any>
  syringe_accuracy_standards?: Record<string, any>
}

let cachedData: EducationalContentData | null = null

function loadEducationalData(): EducationalContentData {
  if (cachedData) return cachedData

  const possiblePaths = [
    path.resolve(process.cwd(), "data/peptide-educational-content.json"),
    path.resolve(process.cwd(), "apps/backend/data/peptide-educational-content.json"),
    path.resolve(__dirname, "../../../../data/peptide-educational-content.json"),
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, "utf-8")
        cachedData = JSON.parse(raw) as EducationalContentData
        return cachedData
      } catch (err) {
        console.error(`[EducationalContent] Failed to parse ${p}:`, err)
      }
    }
  }

  return {
    version: "1.0.0",
    updatedAt: new Date().toISOString(),
    glossary: [],
    faqs: [],
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const data = loadEducationalData()

  const category = (req.query.category as string | undefined)?.toLowerCase().trim()
  const q = (req.query.query as string | undefined)?.toLowerCase().trim()
  const type = (req.query.type as string | undefined)?.toLowerCase().trim()

  let glossary = data.glossary || []
  let faqs = data.faqs || (data as any).faq || []

  if (category && category !== "all") {
    glossary = glossary.filter(
      (item) => item.category.toLowerCase() === category
    )
    faqs = faqs.filter(
      (item: any) => item.category?.toLowerCase() === category
    )
  }

  if (q) {
    glossary = glossary.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.relatedCompounds?.some((c) => c.toLowerCase().includes(q))
    )
    faqs = faqs.filter(
      (item: any) =>
        item.category?.toLowerCase().includes(q) ||
        item.questions?.some(
          (qu: any) =>
            qu.q?.toLowerCase().includes(q) || qu.a?.toLowerCase().includes(q)
        ) ||
        item.question?.toLowerCase().includes(q) ||
        item.answer?.toLowerCase().includes(q)
    )
  }

  const rawStorage = (data as any).storageGuidelines || data.storage_guidelines
  const tiersList = rawStorage?.tiers || []
  const storageGuidelines = rawStorage
    ? {
        ...rawStorage,
        tiers: Object.assign([...tiersList], {
          refrigerated: tiersList.find(
            (t: any) =>
              t.label?.toLowerCase().includes("refrigerator") ||
              t.tempRange?.includes("2°C")
          ),
          ambient: tiersList.find(
            (t: any) =>
              t.label?.toLowerCase().includes("ambient") ||
              t.tempRange?.includes("20°C")
          ),
          frozen: tiersList.find(
            (t: any) =>
              t.label?.toLowerCase().includes("freezer") ||
              t.tempRange?.includes("-20°C")
          ),
        }),
      }
    : undefined

  return res.json({
    version: data.version,
    updatedAt: data.updatedAt,
    glossary: type === "faq" ? [] : glossary,
    faqs: type === "glossary" ? [] : faqs,
    storageGuidelines,
    storage_guidelines: storageGuidelines,
    syringe_accuracy_standards: data.syringe_accuracy_standards,
    count: {
      glossary: glossary.length,
      faqs: faqs.length,
    },
  })
}
