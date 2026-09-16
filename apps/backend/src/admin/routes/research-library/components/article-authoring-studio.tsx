/**
 * @file    apps/backend/src/admin/routes/research-library/components/article-authoring-studio.tsx
 * @module  ArticleAuthoringStudio
 * @purpose Dedicated full-page authoring studio for peer-reviewed research articles with auto-draft local saving and unsaved-changes protection.
 * @contracts
 *   API:     POST /admin/research-articles · POST /admin/research-articles/:id
 */

import React, { useState, useEffect, useRef, useMemo } from "react"
import {
  ArrowLeft,
  ArrowUpRightOnBox,
  CheckCircle,
  ChevronDownMini,
  ChevronUpMini,
  Clock,
  DocumentText,
  Sparkles,
  Trash,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Heading,
  Input,
  Label,
  Prompt,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { sdk } from "../../../lib/sdk"
import { SovereignMarkdownCanvas } from "../../../components/editor/sovereign-markdown-canvas"

export type ArticleFormState = {
  id?: string
  title: string
  subtitle: string
  slug: string
  category: string
  compound_tag: string
  reading_time: string
  reviewed_by: string
  status: "draft" | "published"
  abstract: string
  citations: string
  content_markdown: string
}

interface ArticleAuthoringStudioProps {
  article?: any | null
  onBack: () => void
  onSuccess: () => void
}

const BLANK_STATE: ArticleFormState = {
  title: "",
  subtitle: "",
  slug: "",
  category: "Cellular Longevity & Senescence",
  compound_tag: "BPC-157",
  reading_time: "8 min read",
  reviewed_by: "Analytical Chemistry & Quality Assurance Review",
  status: "draft",
  abstract: "",
  citations: "",
  content_markdown: "",
}

const CATEGORY_OPTIONS = [
  "Cellular Longevity & Senescence",
  "Tissue Regeneration & Healing",
  "Metabolic Health & Energy",
  "Neuroprotection & Cognitive",
  "Musculoskeletal & Joint",
  "Immunomodulation & Vitality",
]

const COMPOUND_TAGS = [
  "BPC-157",
  "TB-500",
  "GHK-Cu",
  "Epithalon",
  "NAD+",
  "MOTS-c",
  "Semaglutide",
  "Tirzepatide",
  "Ipamorelin",
  "CJC-1295",
]

export const sectionsToMarkdown = (sections: any[]): string => {
  if (!Array.isArray(sections) || sections.length === 0) return ""
  return sections
    .map((sec) => {
      const title = sec?.title ? `## ${sec.title}` : ""
      const paras = Array.isArray(sec?.paragraphs)
        ? sec.paragraphs.join("\n\n")
        : sec?.paragraphs || ""
      return [title, paras].filter(Boolean).join("\n\n")
    })
    .join("\n\n")
}

export const markdownToSections = (markdown: string): { title: string; paragraphs: string[] }[] => {
  if (!markdown || !markdown.trim()) return []
  const blocks = markdown.split(/(?=^#{1,3}\s+)/m)
  const sections: { title: string; paragraphs: string[] }[] = []

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue

    const lines = trimmed.split("\n")
    const firstLine = lines[0].trim()
    const headingMatch = firstLine.match(/^#{1,3}\s+(.+)$/)

    let title = "Overview"
    let body = trimmed

    if (headingMatch) {
      title = headingMatch[1].trim()
      body = lines.slice(1).join("\n").trim()
    }

    const paragraphs = body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)

    sections.push({
      title,
      paragraphs: paragraphs.length > 0 ? paragraphs : [body || ""],
    })
  }

  return sections
}

export const formatCitation = (c: any): string => {
  if (!c) return ""
  if (typeof c === "string") return c
  if (typeof c === "object") {
    const parts = [
      c.authors,
      c.title ? `"${c.title}"` : "",
      c.journal,
      c.year ? `(${c.year})` : "",
      c.doi ? `doi:${c.doi}` : (c.pmid ? `PMID:${c.pmid}` : ""),
      c.url,
    ].filter(Boolean)
    return parts.join(" ")
  }
  return String(c)
}

export const serializeCitationsOnSave = (
  linesText: string,
  originalCitations?: any[]
) => {
  if (!linesText || !linesText.trim()) return []
  const lines = linesText
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean)

  return lines.map((line, idx) => {
    const orig = Array.isArray(originalCitations) ? originalCitations[idx] : null
    if (orig && typeof orig === "object" && formatCitation(orig) === line) {
      return orig
    }
    return {
      number: idx + 1,
      authors: "",
      title: line,
      journal: "",
      year: new Date().getFullYear(),
      url: line.startsWith("http") ? line : "",
    }
  })
}

export const ArticleAuthoringStudio: React.FC<ArticleAuthoringStudioProps> = ({
  article,
  onBack,
  onSuccess,
}) => {
  const isEdit = Boolean(article && article.id)
  const storageKey = `pepstack_article_draft_${article?.id || "new"}`

  const [form, setForm] = useState<ArticleFormState>(() => {
    if (article) {
      return {
        id: article.id,
        title: article.title || "",
        subtitle: article.subtitle || "",
        slug: article.slug || "",
        category: article.category || "Cellular Longevity & Senescence",
        compound_tag: article.compound_tag || "BPC-157",
        reading_time: article.reading_time || "8 min read",
        reviewed_by: article.reviewed_by || "Medical Advisory Board",
        status: article.status || "draft",
        abstract: article.abstract || "",
        citations: Array.isArray(article.citations)
          ? article.citations.map(formatCitation).filter(Boolean).join("\n")
          : article.citations || "",
        content_markdown:
          article.metadata?.content_markdown || sectionsToMarkdown(article.sections) || "",
      }
    }
    // Check localStorage for unsaved drafts
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.content_markdown || !article?.sections?.length) {
          return { ...BLANK_STATE, ...parsed }
        }
      }
    } catch {
      // ignore
    }
    return BLANK_STATE
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [exitPromptOpen, setExitPromptOpen] = useState(false)
  const [isMetadataOpen, setIsMetadataOpen] = useState(false)

  // Auto-calculate reading time from word count
  const wordCount = useMemo(() => {
    const text = `${form.title} ${form.subtitle} ${form.abstract} ${form.content_markdown}`
    const words = text.trim().split(/\s+/).filter(Boolean)
    return words.length
  }, [form.title, form.subtitle, form.abstract, form.content_markdown])

  useEffect(() => {
    const calculatedMinutes = Math.max(1, Math.ceil(wordCount / 200))
    if (!form.id && form.reading_time !== `${calculatedMinutes} min read`) {
      setForm((prev) => ({ ...prev, reading_time: `${calculatedMinutes} min read` }))
    }
  }, [wordCount, form.id])

  // Save draft to localStorage periodically or on change
  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(form))
        const now = new Date()
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        )
      } catch (err) {
        console.warn("Failed to persist draft to localStorage", err)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [form, isDirty, storageKey])

  // Browser beforeunload warning if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  const updateField = (field: keyof ArticleFormState, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "title" && !prev.id && !prev.slug) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      }
      return next
    })
    setIsDirty(true)
  }

  const handleTitleChange = (val: string) => {
    updateField("title", val)
    if (!form.id) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      setForm((prev) => ({ ...prev, title: val, slug: generatedSlug }))
    }
  }

  const handleClearDraft = () => {
    localStorage.removeItem(storageKey)
    if (article) {
      setForm({
        id: article.id,
        title: article.title || "",
        subtitle: article.subtitle || "",
        slug: article.slug || "",
        category: article.category || "Cellular Longevity & Senescence",
        compound_tag: article.compound_tag || "BPC-157",
        reading_time: article.reading_time || "8 min read",
        reviewed_by: article.reviewed_by || "Medical Advisory Board",
        status: article.status || "draft",
        abstract: article.abstract || "",
        citations: Array.isArray(article.citations)
          ? article.citations.map(formatCitation).filter(Boolean).join("\n")
          : article.citations || "",
        content_markdown:
          article.metadata?.content_markdown || sectionsToMarkdown(article.sections) || "",
      })
    } else {
      setForm(BLANK_STATE)
    }
    setIsDirty(false)
    setLastSavedTime(null)
    toast.success("Draft reset to original state")
  }

  const handleBackClick = () => {
    if (isDirty) {
      setExitPromptOpen(true)
    } else {
      onBack()
    }
  }

  const handleSave = async (statusOverride?: "draft" | "published") => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Article title and URL slug are required")
      return
    }

    const currentStatus = statusOverride || form.status
    setIsSubmitting(true)

    try {
      const parsedSections = markdownToSections(form.content_markdown)
      const payload: Record<string, any> = {
        title: form.title,
        subtitle: form.subtitle,
        slug: form.slug,
        category: form.category,
        compound_tag: form.compound_tag,
        reading_time: form.reading_time,
        reviewed_by: form.reviewed_by,
        status: currentStatus,
        abstract: form.abstract,
        sections: parsedSections,
        citations: serializeCitationsOnSave(form.citations, article?.citations),
        metadata: {
          ...(article?.metadata || {}),
          content_markdown: form.content_markdown,
          last_edited_in_studio: new Date().toISOString(),
          word_count: wordCount,
        },
      }

      if (article?.referenced_compound) {
        payload.referenced_compound = article.referenced_compound
      }
      if (article?.referenced_compound_id) {
        payload.referenced_compound_id = article.referenced_compound_id
      }
      if (article?.telemetry) {
        payload.telemetry = article.telemetry
      }
      if (article?.key_takeaways) {
        payload.key_takeaways = article.key_takeaways
      }

      if (isEdit && form.id) {
        await sdk.client.fetch(`/admin/research-articles/${form.id}`, {
          method: "POST",
          body: payload,
        })
        toast.success("Research article saved successfully")
      } else {
        await sdk.client.fetch("/admin/research-articles", {
          method: "POST",
          body: payload,
        })
        toast.success(currentStatus === "published" ? "Research article published!" : "Draft article saved!")
      }

      // Clear local storage draft after successful server save
      localStorage.removeItem(storageKey)
      setIsDirty(false)
      onSuccess()
      onBack()
    } catch (err: any) {
      console.error("Failed to save research article:", err)
      toast.error(err.message || "Failed to save research article")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pb-16">
      {/* Studio Top Control Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-6 py-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="small"
              onClick={handleBackClick}
              className="h-8 px-2.5 text-xs text-slate-700 hover:text-slate-900 border-slate-200"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              Library
            </Button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs shadow-2xs">
                <DocumentText className="size-4" />
              </span>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  {isEdit ? "Edit Scientific Article" : "Scientific Authoring Studio"}
                </h1>
                <p className="text-[11px] text-slate-500 font-mono">
                  {form.slug ? `/research-library/${form.slug}` : "Drafting new monograph"}
                </p>
              </div>
            </div>
          </div>

          {/* Center / Status info */}
          <div className="flex items-center gap-3">
            {lastSavedTime ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 font-mono">
                <CheckCircle className="size-3.5 text-emerald-600" />
                <span>Draft saved locally ({lastSavedTime})</span>
              </div>
            ) : isDirty ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-mono">
                <Clock className="size-3.5 text-amber-600 animate-spin" />
                <span>Saving local draft...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
                <span>In sync</span>
              </div>
            )}

            <Badge
              size="small"
              color={form.status === "published" ? "green" : "orange"}
              className="text-[11px] uppercase tracking-wider font-semibold"
            >
              {form.status}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setIsMetadataOpen(!isMetadataOpen)}
              className="h-8 text-xs border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-1.5"
            >
              <span>Parameters &amp; Settings</span>
              {isMetadataOpen ? <ChevronUpMini className="size-3.5 text-slate-500" /> : <ChevronDownMini className="size-3.5 text-slate-500" />}
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => handleSave("draft")}
              isLoading={isSubmitting && form.status === "draft"}
              disabled={isSubmitting}
              className="h-8 text-xs border-slate-200 bg-white hover:bg-slate-50"
            >
              Save Draft
            </Button>
            <Button
              size="small"
              onClick={() => handleSave("published")}
              isLoading={isSubmitting && form.status === "published"}
              disabled={isSubmitting}
              className="h-8 text-xs bg-slate-900 text-white hover:bg-slate-800"
            >
              {isEdit ? "Update & Publish" : "Publish Article"}
            </Button>
          </div>
        </div>
      </header>

      {/* Collapsible Article Metadata & Publishing Parameters Ribbon */}
      {isMetadataOpen && (
        <div className="border-b border-slate-200/90 bg-white/95 px-6 py-4 shadow-xs">
          <div className="w-full">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Publishing Parameters &amp; Article Metadata
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="small"
                  onClick={handleClearDraft}
                  className="h-7 text-[11px] px-2"
                >
                  <Trash className="size-3 mr-1" />
                  Reset Local Draft
                </Button>
                <button
                  type="button"
                  onClick={() => setIsMetadataOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium px-1.5 cursor-pointer"
                >
                  Hide Ribbon ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Article State */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Article State</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => updateField("status", val as "draft" | "published")}
                >
                  <Select.Trigger className="h-8 text-xs bg-white">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="draft">Draft (Private / Unlisted)</Select.Item>
                    <Select.Item value="published">Published (Storefront Live)</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              {/* URL Slug */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold text-slate-700">URL Slug</Label>
                  {form.slug && (
                    <a
                      href={`http://localhost:8000/ph/research-library/${form.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>Live</span>
                      <ArrowUpRightOnBox className="size-2.5" />
                    </a>
                  )}
                </div>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="slug-path"
                  className="h-8 text-xs font-mono"
                  required
                />
              </div>

              {/* Scientific Category */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => updateField("category", val)}
                >
                  <Select.Trigger className="h-8 text-xs bg-white">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <Select.Item key={cat} value={cat}>
                        {cat}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              {/* Primary Compound */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Compound Tag</Label>
                <Select
                  value={form.compound_tag}
                  onValueChange={(val) => updateField("compound_tag", val)}
                >
                  <Select.Trigger className="h-8 text-xs bg-white">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {COMPOUND_TAGS.map((tag) => (
                      <Select.Item key={tag} value={tag}>
                        {tag}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              {/* Reviewer / Board */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Peer Reviewer</Label>
                <Input
                  value={form.reviewed_by}
                  onChange={(e) => updateField("reviewed_by", e.target.value)}
                  placeholder="Medical Advisory Board"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Workspace - Maximized Full Screen Canvas */}
      <main className="w-full px-6 pt-6 flex flex-col gap-6 flex-1">
        {/* Document Canvas */}
        <div className="flex flex-col gap-5 w-full">
          {/* Title & Subtitle Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
            <div>
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Monograph Title
              </Label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Molecular Mechanisms of BPC-157 in Angiogenesis & Collagen Synthesis"
                className="w-full text-xl sm:text-2xl font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:ring-0 px-0 py-1 bg-transparent font-serif"
              />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Executive Subtitle / Lead Statement
              </Label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
                placeholder="Brief scientific thesis explaining the cellular pathways, receptor affinities, and scope..."
                className="w-full text-sm text-slate-600 placeholder:text-slate-300 border-none outline-none focus:ring-0 px-0 py-1 bg-transparent"
              />
            </div>
          </div>

          {/* Scientific Abstract */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Scientific Abstract</h3>
                <p className="text-xs text-slate-500">
                  Comprehensive executive summary of receptor binding, pharmacology, and in vitro data.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {form.abstract.length} characters
              </span>
            </div>
            <Textarea
              rows={4}
              value={form.abstract}
              onChange={(e) => updateField("abstract", e.target.value)}
              placeholder="Provide the structured abstract covering: (1) Background, (2) Molecular Mechanisms, (3) Receptor Targets, (4) In Vitro & Preclinical Observations..."
              className="text-xs leading-relaxed font-sans"
            />
          </div>

          {/* Monograph Content & Body with Universal Formatting Toolbar & Dual-Pane Canvas */}
          <SovereignMarkdownCanvas
            id="article-content-markdown"
            label="Monograph Content & Scientific Findings"
            sublabel="Full peer-reviewed text with headings, clinical tables, callout notices, and receptor mechanisms."
            value={form.content_markdown}
            onChange={(val) => updateField("content_markdown", val)}
            initialViewMode="split"
            minHeight="540px"
          />

          {/* Citations & Literature References */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Peer-Reviewed Citations</h3>
                <p className="text-xs text-slate-500">
                  PubMed PMIDs, DOI records, and peer-reviewed journals (one entry per line).
                </p>
              </div>
              <Badge size="small" color="purple">
                {form.citations ? form.citations.split("\n").filter(Boolean).length : 0} Sources
              </Badge>
            </div>
            <Textarea
              rows={4}
              value={form.citations}
              onChange={(e) => updateField("citations", e.target.value)}
              placeholder="PubMed: PMID 31548721 · Journal of Orthopaedic Research&#10;FASEB J. 2024 · Molecular Cell Biology&#10;Nature Reviews Molecular Cell Bio 2023; 24:145-162"
              className="text-xs font-mono"
            />
          </div>
        </div>
      </main>

      {/* Exit Confirmation Dialog */}
      <Prompt open={exitPromptOpen} onOpenChange={setExitPromptOpen}>
        <Prompt.Content className="max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl">
          <Prompt.Header>
            <Prompt.Title className="text-base font-bold text-slate-900">
              Unsaved Changes in Studio
            </Prompt.Title>
            <Prompt.Description className="text-xs text-slate-500 mt-1 leading-relaxed">
              You have modified this research article. Your draft is preserved in your local browser
              storage, but has not yet been committed to the server database. Are you sure you want to
              leave?
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer className="mt-5 flex items-center justify-end gap-2">
            <Prompt.Cancel onClick={() => setExitPromptOpen(false)}>
              Keep Writing
            </Prompt.Cancel>
            <Prompt.Action
              onClick={() => {
                setExitPromptOpen(false)
                onBack()
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Exit to Library
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </div>
  )
}

export default ArticleAuthoringStudio
