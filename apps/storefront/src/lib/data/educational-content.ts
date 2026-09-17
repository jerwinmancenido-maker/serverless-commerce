import educationalDataRaw from "./peptide-educational-content.json" with { type: "json" }

export type GlossaryItem = {
  term: string
  category: string
  definition: string
  relatedCompounds: string[]
}

export type FaqQuestion = {
  q: string
  a: string
}

export type FaqCategory = {
  category: string
  questions: FaqQuestion[]
}

export type StorageTier = {
  tempRange: string
  label: string
  state: string
  stabilityWindow: string
  notes: string
}

export type BeginnerSopStep = {
  step: number
  title: string
  instruction: string
}

export type SyringeSpec = {
  capacity: string
  units: number
  tickInterval: string
  needle: string
  recommendedDoseRange: string
  bestFor: string
}

export type EducationalContentData = {
  version: string
  updatedAt: string
  glossary: GlossaryItem[]
  faq: FaqCategory[]
  storageGuidelines: {
    tiers: StorageTier[]
    fragilityRankings: {
      high: string[]
      moderate: string[]
      low: string[]
    }
  }
  beginnerSopSteps: BeginnerSopStep[]
  syringeSpecs: SyringeSpec[]
}

export const EDUCATIONAL_CONTENT: EducationalContentData = educationalDataRaw as EducationalContentData

export function getGlossaryTerms(): GlossaryItem[] {
  return EDUCATIONAL_CONTENT.glossary
}

export function getFaqCategories(): FaqCategory[] {
  return EDUCATIONAL_CONTENT.faq
}

export function getStorageGuidelines() {
  return EDUCATIONAL_CONTENT.storageGuidelines
}

export function getBeginnerSopSteps(): BeginnerSopStep[] {
  return EDUCATIONAL_CONTENT.beginnerSopSteps
}

export function getSyringeSpecs(): SyringeSpec[] {
  return EDUCATIONAL_CONTENT.syringeSpecs
}

/**
 * Asynchronously fetches educational content from Medusa backend if live,
 * falling back gracefully to static bundled content during offline or build times.
 */
export async function fetchEducationalContent(): Promise<EducationalContentData> {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (!publishableKey) {
    return EDUCATIONAL_CONTENT
  }

  try {
    const res = await fetch(`${backendUrl}/store/educational-content`, {
      headers: {
        "x-publishable-api-key": publishableKey,
      },
      next: { revalidate: 3600, tags: ["educational-content"] },
    })

    if (res.ok) {
      const json = await res.json()
      if (json.glossary && json.glossary.length > 0) {
        return {
          ...EDUCATIONAL_CONTENT,
          ...json,
        }
      }
    }
  } catch {
    // Graceful fallback to static bundled content
  }

  return EDUCATIONAL_CONTENT
}
