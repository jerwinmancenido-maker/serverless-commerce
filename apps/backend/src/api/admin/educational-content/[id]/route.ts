/**
 * @file    apps/backend/src/api/admin/educational-content/[id]/route.ts
 * @module  AdminEducationalContentItemRoute
 * @purpose Admin endpoint for updating and deleting individual educational glossary items or FAQs.
 * @contracts
 *   API:     GET /admin/educational-content/:id · POST /admin/educational-content/:id · DELETE /admin/educational-content/:id
 */

import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

function getStoragePath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), "apps/backend/data/peptide-educational-content.json"),
    path.resolve(process.cwd(), "data/peptide-educational-content.json"),
    path.resolve(__dirname, "../../../../../data/peptide-educational-content.json"),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  return possiblePaths[0]
}

function loadData() {
  const filePath = getStoragePath()
  let data: any = {
    version: "1.0.0",
    updatedAt: new Date().toISOString(),
    glossary: [],
    faqs: [],
    storageGuidelines: null,
  }

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8")
      data = JSON.parse(raw)
    } catch (err) {
      console.error(`[AdminEducationalContent] Failed to parse ${filePath}:`, err)
    }
  }

  return { data, filePath }
}

function saveData(data: any, filePath: string) {
  data.updatedAt = new Date().toISOString()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data } = loadData()
  const id = req.params.id

  const glossaryItem = (data.glossary || []).find(
    (g: any) => g.id === id || g.term?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id
  )
  if (glossaryItem) {
    return res.json({ item: glossaryItem, type: "glossary" })
  }

  const faqItem = (data.faqs || []).find((f: any) => f.id === id)
  if (faqItem) {
    return res.json({ item: faqItem, type: "faq" })
  }

  return res.status(404).json({ message: "Content item not found" })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data, filePath } = loadData()
  const id = req.params.id
  const body = req.body as any

  if (!body) {
    return res.status(400).json({ message: "Request body required" })
  }

  let found = false
  // Check glossary
  data.glossary = (data.glossary || []).map((g: any) => {
    if (g.id === id || g.term?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id) {
      found = true
      return {
        ...g,
        term: body.term ?? g.term,
        category: body.category ?? g.category,
        definition: body.definition ?? g.definition,
        relatedCompounds: Array.isArray(body.relatedCompounds) ? body.relatedCompounds : g.relatedCompounds,
      }
    }
    return g
  })

  if (!found) {
    // Check FAQs
    data.faqs = (data.faqs || []).map((f: any) => {
      if (f.id === id) {
        found = true
        return {
          ...f,
          question: body.question ?? f.question,
          answer: body.answer ?? f.answer,
          category: body.category ?? f.category,
          tags: Array.isArray(body.tags) ? body.tags : f.tags,
        }
      }
      return f
    })
  }

  if (!found) {
    return res.status(404).json({ message: "Content item not found to update" })
  }

  saveData(data, filePath)
  return res.json({ message: "Content item updated successfully" })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data, filePath } = loadData()
  const id = req.params.id

  const initialGlossaryCount = (data.glossary || []).length
  const initialFaqsCount = (data.faqs || []).length

  data.glossary = (data.glossary || []).filter(
    (g: any) => g.id !== id && g.term?.toLowerCase().replace(/[^a-z0-9]+/g, "-") !== id
  )
  data.faqs = (data.faqs || []).filter((f: any) => f.id !== id)

  if (
    data.glossary.length === initialGlossaryCount &&
    data.faqs.length === initialFaqsCount
  ) {
    return res.status(404).json({ message: "Content item not found to delete" })
  }

  saveData(data, filePath)
  return res.json({ message: "Content item deleted successfully", id })
}
