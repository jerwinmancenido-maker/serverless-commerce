/**
 * @file    apps/backend/src/admin/routes/research-library/drawers/article-create-edit-drawer.tsx
 * @module  ArticleCreateEditDrawer
 * @purpose Slide-over drawer for creating and editing peer-reviewed research articles.
 * @contracts
 *   Drawer:  ArticleCreateEditDrawer
 *   API:     POST /admin/research-articles · POST /admin/research-articles/:id
 */

import React, { useState, useEffect } from "react"
import {
  Drawer,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  toast,
} from "@medusajs/ui"
import { DocumentText, Sparkles } from "@medusajs/icons"
import { sdk } from "../../../lib/sdk"
import { SovereignMarkdownCanvas } from "../../../components/editor/sovereign-markdown-canvas"
import { TagChipInput } from "../../../components/ui/tag-chip-input"

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
}

interface ArticleCreateEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article?: any | null
  onSuccess: () => void
}

const BLANK_STATE: ArticleFormState = {
  title: "",
  subtitle: "",
  slug: "",
  category: "Cellular Longevity & Senescence",
  compound_tag: "BPC-157",
  reading_time: "8 min read",
  reviewed_by: "Medical Advisory Board (Dr. M. Chen, MD, PhD)",
  status: "draft",
  abstract: "",
  citations: "",
}

export const ArticleCreateEditDrawer: React.FC<ArticleCreateEditDrawerProps> = ({
  open,
  onOpenChange,
  article,
  onSuccess,
}) => {
  const [form, setForm] = useState<ArticleFormState>(BLANK_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = Boolean(article && article.id)

  useEffect(() => {
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
          ? article.citations.join("\n")
          : article.citations || "",
      })
    } else {
      setForm(BLANK_STATE)
    }
  }, [article, open])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: prev.id ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Article title and slug are required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        slug: form.slug,
        category: form.category,
        compound_tag: form.compound_tag,
        reading_time: form.reading_time,
        reviewed_by: form.reviewed_by,
        status: form.status,
        abstract: form.abstract,
        citations: form.citations
          ? form.citations.split("\n").map((c) => c.trim()).filter(Boolean)
          : [],
      }

      if (isEdit && form.id) {
        await sdk.client.fetch(`/admin/research-articles/${form.id}`, {
          method: "POST",
          body: payload,
        })
        toast.success("Research article updated successfully")
      } else {
        await sdk.client.fetch("/admin/research-articles", {
          method: "POST",
          body: payload,
        })
        toast.success("New research article published")
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to save article:", err)
      toast.error(err.message || "Failed to save research article")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="right-0 top-0 bottom-0 h-full w-full sm:max-w-2xl lg:max-w-3xl bg-white border-l border-slate-200 p-0 flex flex-col justify-between shadow-2xl">
        <Drawer.Header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs shadow-2xs">
              <DocumentText className="size-4" />
            </span>
            <div>
              <Drawer.Title className="text-sm font-bold text-slate-900 tracking-tight">
                {isEdit ? "Edit Research Article" : "Author New Research Article"}
              </Drawer.Title>
              <Drawer.Description className="text-xs text-slate-500 mt-0.5">
                Peer-reviewed monograph with PubMed citations &amp; clinical reviews.
              </Drawer.Description>
            </div>
          </div>
        </Drawer.Header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Drawer.Body className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Article Title</Label>
              <Input
                placeholder="e.g. Molecular Mechanisms of BPC-157 in Angiogenesis"
                value={form.title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">URL Slug</Label>
                <Input
                  placeholder="e.g. bpc-157-angiogenesis-mechanisms"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Publication Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm({ ...form, status: val as "draft" | "published" })}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="draft">Draft (Private)</Select.Item>
                    <Select.Item value="published">Published (Live)</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Therapeutic Category</Label>
                <Input
                  placeholder="e.g. Cellular Longevity & Senescence"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Associated Compounds</Label>
                <TagChipInput
                  id="article-compound-tags"
                  variant="blue"
                  placeholder="Add compound (e.g. BPC-157)..."
                  tags={form.compound_tag ? form.compound_tag.split(",").map((t) => t.trim()).filter(Boolean) : []}
                  onChange={(newTags) => setForm({ ...form, compound_tag: newTags.join(", ") })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Subtitle / Monograph Lead</Label>
              <Input
                placeholder="Brief summary sentence explaining the scientific scope..."
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Scientific Abstract &amp; Clinical Monograph</Label>
              <SovereignMarkdownCanvas
                id="article-abstract-canvas"
                value={form.abstract}
                onChange={(val) => setForm({ ...form, abstract: val })}
                initialViewMode="write"
                minHeight="200px"
                placeholder="Comprehensive executive summary of the in vitro data, biochemical receptor affinity, and clinical implications..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Reading Time</Label>
                <Input
                  placeholder="e.g. 8 min read"
                  value={form.reading_time}
                  onChange={(e) => setForm({ ...form, reading_time: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Reviewed By</Label>
                <Input
                  placeholder="e.g. Medical Advisory Board"
                  value={form.reviewed_by}
                  onChange={(e) => setForm({ ...form, reviewed_by: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Citations (One per line)</Label>
              <Textarea
                rows={3}
                placeholder="PubMed: PMID 31548721 · Journal of Orthopaedic Research&#10;FASEB J. 2024 · Molecular Cell Biology"
                value={form.citations}
                onChange={(e) => setForm({ ...form, citations: e.target.value })}
              />
            </div>
          </Drawer.Body>

          <Drawer.Footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              isLoading={isSubmitting}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isEdit ? "Save Article Changes" : "Publish Article"}
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}

export default ArticleCreateEditDrawer
