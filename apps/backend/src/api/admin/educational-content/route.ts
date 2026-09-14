/**
 * @file    apps/backend/src/api/admin/educational-content/route.ts
 * @module  AdminEducationalContentRoute
 * @purpose Admin endpoint for inspecting and creating verified clinical glossary definitions, FAQs, and monograph safety standards.
 * @contracts
 *   API:     GET /admin/educational-content · POST /admin/educational-content
 */

import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import crypto from "crypto"

function getStoragePath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), "apps/backend/data/peptide-educational-content.json"),
    path.resolve(process.cwd(), "data/peptide-educational-content.json"),
    path.resolve(__dirname, "../../../../data/peptide-educational-content.json"),
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

  // Ensure every glossary item has a persistent id
  if (Array.isArray(data.glossary)) {
    data.glossary.forEach((item: any) => {
      if (!item.id) {
        item.id = item.term ? item.term.toLowerCase().replace(/[^a-z0-9]+/g, "-") : crypto.randomUUID()
      }
    })
  }

  return { data, filePath }
}

function saveData(data: any, filePath: string) {
  data.updatedAt = new Date().toISOString()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data } = loadData()

  const category = (req.query.category as string | undefined)?.toLowerCase().trim()
  const q = (req.query.query as string | undefined)?.toLowerCase().trim()
  const type = (req.query.type as string | undefined)?.toLowerCase().trim()

  let glossary = data.glossary || []
  let faqs = data.faqs || data.faq || []

  if (category && category !== "all") {
    glossary = glossary.filter(
      (item: any) => item.category?.toLowerCase() === category
    )
    faqs = faqs.filter(
      (item: any) => item.category?.toLowerCase() === category
    )
  }

  if (q) {
    glossary = glossary.filter(
      (item: any) =>
        item.term?.toLowerCase().includes(q) ||
        item.definition?.toLowerCase().includes(q) ||
        item.relatedCompounds?.some((c: string) => c.toLowerCase().includes(q))
    )
    faqs = faqs.filter(
      (item: any) =>
        item.category?.toLowerCase().includes(q) ||
        item.questions?.some((qu: any) => qu.q?.toLowerCase().includes(q) || qu.a?.toLowerCase().includes(q)) ||
        item.question?.toLowerCase().includes(q) ||
        item.answer?.toLowerCase().includes(q) ||
        item.tags?.some((t: string) => t.toLowerCase().includes(q))
    )
  }

  return res.json({
    version: data.version,
    updatedAt: data.updatedAt,
    glossary: type === "faq" ? [] : glossary,
    faqs: type === "glossary" ? [] : faqs,
    storageGuidelines: data.storage_guidelines || data.storageGuidelines,
    syringeSpecs: data.syringe_accuracy_standards || data.syringeSpecs,
    count: {
      glossary: glossary.length,
      faqs: faqs.length,
    },
  })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { data, filePath } = loadData()
  const body = req.body as any

  if (!body) {
    return res.status(400).json({ message: "Request body required" })
  }

  const itemType = body.type === "faq" ? "faq" : "glossary"

  if (itemType === "glossary") {
    if (!body.term || !body.definition) {
      return res.status(400).json({ message: "Term and definition are required" })
    }

    const newItem = {
      id: body.id || body.term.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      term: body.term,
      category: body.category || "General",
      definition: body.definition,
      relatedCompounds: Array.isArray(body.relatedCompounds) ? body.relatedCompounds : [],
    }

    data.glossary = [newItem, ...(data.glossary || [])]
    saveData(data, filePath)
    return res.status(201).json({ item: newItem, message: "Glossary term added" })
  } else {
    if (!body.question || !body.answer) {
      return res.status(400).json({ message: "Question and answer are required" })
    }

    const newFaq = {
      id: body.id || crypto.randomUUID(),
      category: body.category || "General",
      question: body.question,
      answer: body.answer,
      tags: Array.isArray(body.tags) ? body.tags : [],
    }

    data.faqs = [newFaq, ...(data.faqs || [])]
    saveData(data, filePath)
    return res.status(201).json({ item: newFaq, message: "FAQ added" })
  }
}
