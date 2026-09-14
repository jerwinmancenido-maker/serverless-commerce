/**
 * @file    apps/backend/src/admin/routes/research-library/drawers/comparison-create-edit-drawer.tsx
 * @module  ComparisonCreateEditDrawer
 * @purpose Slide-over drawer for creating and editing head-to-head peptide comparisons.
 * @contracts
 *   Drawer:  ComparisonCreateEditDrawer
 *   API:     POST /admin/peptide-comparisons · POST /admin/peptide-comparisons/:id
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
import { Sparkles, DocumentText, Plus, Trash } from "@medusajs/icons"
import { sdk } from "../../../lib/sdk"
import { SovereignMarkdownCanvas } from "../../../components/editor/sovereign-markdown-canvas"

export type ComparisonVector = {
  feature: string
  compoundA_val: string
  compoundB_val: string
  verdict?: string
}

export type ComparisonFormState = {
  id?: string
  title: string
  subtitle: string
  slug: string
  category: string
  compound_a_name: string
  compound_a_tag: string
  compound_b_name: string
  compound_b_tag: string
  summary: string
  synergy_verdict: string
  vectors: ComparisonVector[]
  status: "draft" | "published"
}

interface ComparisonCreateEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comparison?: any | null
  onSuccess: () => void
}

const DEFAULT_VECTORS: ComparisonVector[] = [
  {
    feature: "Primary Receptor Target",
    compoundA_val: "Growth hormone secretagogue & VEGF upregulator",
    compoundB_val: "G-actin binding sequesterer (actin beta-4)",
    verdict: "Complementary cellular pathways",
  },
  {
    feature: "Molecular Structure",
    compoundA_val: "15-amino acid stable gastric pentadecapeptide",
    compoundB_val: "43-amino acid synthetic thymosin fraction",
    verdict: "Distinct peptide architectures",
  },
  {
    feature: "Half-Life & Biodistribution",
    compoundA_val: "~4 hours (systemic and localized affinity)",
    compoundB_val: "~24–48 hours (extended systemic circulation)",
    verdict: "Dual short + sustained kinetic curve",
  },
  {
    feature: "Standard Research Route",
    compoundA_val: "Subcutaneous or Oral (stable in gastric juice)",
    compoundB_val: "Subcutaneous injection only",
    verdict: "Subcutaneous co-administration optimal",
  },
]

const VECTOR_PRESETS: Array<{ feature: string; a: string; b: string; verdict: string }> = [
  {
    feature: "Primary Receptor Target",
    a: "Receptor target A",
    b: "Receptor target B",
    verdict: "Target distinction",
  },
  {
    feature: "Biological Half-Life",
    a: "~4 hours",
    b: "~24–48 hours",
    verdict: "Kinetic synergy",
  },
  {
    feature: "Reconstitution Solvent",
    a: "Bacteriostatic Water USP",
    b: "Bacteriostatic Water USP",
    verdict: "Compatible diluents",
  },
  {
    feature: "Clinical Study Benchmark",
    a: "In vitro & preclinical models",
    b: "Angiogenic & tissue repair assays",
    verdict: "Dual-axis evidence",
  },
]

const BLANK_STATE: ComparisonFormState = {
  title: "",
  subtitle: "",
  slug: "",
  category: "Tissue Repair & Regeneration",
  compound_a_name: "BPC-157",
  compound_a_tag: "Angiogenic Pentadecapeptide",
  compound_b_name: "TB-500",
  compound_b_tag: "Actin-Sequestering Peptide",
  summary: "",
  synergy_verdict: "Synergistic Co-Administration Recommended",
  vectors: DEFAULT_VECTORS,
  status: "draft",
}

export const ComparisonCreateEditDrawer: React.FC<ComparisonCreateEditDrawerProps> = ({
  open,
  onOpenChange,
  comparison,
  onSuccess,
}) => {
  const [form, setForm] = useState<ComparisonFormState>(BLANK_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = Boolean(comparison && comparison.id)

  useEffect(() => {
    if (comparison) {
      setForm({
        id: comparison.id,
        title: comparison.title || "",
        subtitle: comparison.subtitle || "",
        slug: comparison.slug || "",
        category: comparison.category || "Tissue Repair & Regeneration",
        compound_a_name: comparison.compound_a?.name || "BPC-157",
        compound_a_tag: comparison.compound_a?.tag || "Pentadecapeptide",
        compound_b_name: comparison.compound_b?.name || "TB-500",
        compound_b_tag: comparison.compound_b?.tag || "Thymosin Beta-4",
        summary: comparison.summary || "",
        synergy_verdict: comparison.synergy_verdict || "Synergistic Co-Administration Recommended",
        vectors: Array.isArray(comparison.vectors) && comparison.vectors.length > 0
          ? comparison.vectors
          : DEFAULT_VECTORS,
        status: comparison.status || "draft",
      })
    } else {
      setForm(BLANK_STATE)
    }
  }, [comparison, open])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: prev.id ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }))
  }

  const addVector = () => {
    setForm((prev) => ({
      ...prev,
      vectors: [
        ...prev.vectors,
        {
          feature: "",
          compoundA_val: "",
          compoundB_val: "",
          verdict: "",
        },
      ],
    }))
  }

  const addPreset = (preset: { feature: string; a: string; b: string; verdict: string }) => {
    setForm((prev) => ({
      ...prev,
      vectors: [
        ...prev.vectors,
        {
          feature: preset.feature,
          compoundA_val: preset.a,
          compoundB_val: preset.b,
          verdict: preset.verdict,
        },
      ],
    }))
  }

  const updateVector = (index: number, patch: Partial<ComparisonVector>) => {
    setForm((prev) => {
      const next = [...prev.vectors]
      next[index] = { ...next[index], ...patch }
      return { ...prev, vectors: next }
    })
  }

  const removeVector = (index: number) => {
    setForm((prev) => ({
      ...prev,
      vectors: prev.vectors.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Comparison title and slug are required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        slug: form.slug,
        category: form.category,
        compound_a: {
          name: form.compound_a_name,
          tag: form.compound_a_tag,
        },
        compound_b: {
          name: form.compound_b_name,
          tag: form.compound_b_tag,
        },
        summary: form.summary,
        synergy_verdict: form.synergy_verdict,
        vectors: form.vectors,
        status: form.status,
      }

      if (isEdit && form.id) {
        await sdk.client.fetch(`/admin/peptide-comparisons/${form.id}`, {
          method: "POST",
          body: payload,
        })
        toast.success("Peptide comparison updated successfully")
      } else {
        await sdk.client.fetch("/admin/peptide-comparisons", {
          method: "POST",
          body: payload,
        })
        toast.success("New peptide comparison published")
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to save comparison:", err)
      toast.error(err.message || "Failed to save peptide comparison")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="right-0 top-0 bottom-0 h-full w-full sm:max-w-2xl lg:max-w-4xl bg-white border-l border-slate-200 p-0 flex flex-col justify-between shadow-2xl">
        <Drawer.Header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs shadow-2xs">
              <Sparkles className="size-4" />
            </span>
            <div>
              <Drawer.Title className="text-sm font-bold text-slate-900 tracking-tight">
                {isEdit ? "Edit Peptide Comparison" : "Create Head-to-Head Comparison"}
              </Drawer.Title>
              <Drawer.Description className="text-xs text-slate-500 mt-0.5">
                Multi-compound efficacy matrix, receptor differences &amp; synergy verdicts.
              </Drawer.Description>
            </div>
          </div>
        </Drawer.Header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Drawer.Body className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Comparison Title</Label>
              <Input
                placeholder="e.g. BPC-157 vs TB-500: Tissue Healing & Synergistic Mechanisms"
                value={form.title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">URL Slug</Label>
                <Input
                  placeholder="e.g. bpc-157-vs-tb-500"
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

            {/* Compound A Specs */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Compound A (Primary Reference)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Compound A Name (e.g. BPC-157)"
                  value={form.compound_a_name}
                  onChange={(e) => setForm({ ...form, compound_a_name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Tag / Subtitle (e.g. 15-AA Gastric Pentadecapeptide)"
                  value={form.compound_a_tag}
                  onChange={(e) => setForm({ ...form, compound_a_tag: e.target.value })}
                />
              </div>
            </div>

            {/* Compound B Specs */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Compound B (Comparative Match)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Compound B Name (e.g. TB-500)"
                  value={form.compound_b_name}
                  onChange={(e) => setForm({ ...form, compound_b_name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Tag / Subtitle (e.g. Thymosin Beta-4 Actin Fragment)"
                  value={form.compound_b_tag}
                  onChange={(e) => setForm({ ...form, compound_b_tag: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Therapeutic Category</Label>
              <Input
                placeholder="e.g. Tissue Repair & Regeneration"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <SovereignMarkdownCanvas
                id="comparison-summary"
                label="Comparative Summary & Mechanism Analysis"
                value={form.summary}
                onChange={(val) => setForm({ ...form, summary: val })}
                initialViewMode="write"
                minHeight="180px"
              />
            </div>

            {/* Head-to-Head Comparison Vector Matrix Studio */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 tracking-tight">
                      Comparison Vector Matrix
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700 rounded-full font-mono">
                      {form.vectors.length} {form.vectors.length === 1 ? "vector" : "vectors"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Structured feature-by-feature matrix displayed on storefront comparison pages.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={addVector}
                    className="text-xs font-medium h-7 px-2.5"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Add Vector
                  </Button>
                </div>
              </div>

              {/* 1-Click Feature Presets */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1">
                  <Sparkles className="size-3 text-purple-600" />
                  1-Click Feature Presets
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {VECTOR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addPreset(preset)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
                    >
                      <Plus className="size-3 text-slate-400" />
                      {preset.feature}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vector Rows */}
              {form.vectors.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg bg-white">
                  <p className="text-xs text-slate-500">No comparison vectors added yet.</p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={addVector}
                    className="mt-2 text-xs"
                  >
                    <Plus className="size-3.5 mr-1" /> Add First Vector
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.vectors.map((vec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="flex size-5 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600 font-mono">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="Feature or Metric (e.g. Primary Receptor Target)"
                            value={vec.feature}
                            onChange={(e) => updateVector(idx, { feature: e.target.value })}
                            className="text-xs font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-hidden px-1 py-0.5 flex-1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVector(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                          title="Remove vector"
                        >
                          <Trash className="size-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                            {form.compound_a_name || "Compound A"} Value
                          </label>
                          <textarea
                            rows={2}
                            placeholder={`Specification for ${form.compound_a_name || "Compound A"}...`}
                            value={vec.compoundA_val}
                            onChange={(e) => updateVector(idx, { compoundA_val: e.target.value })}
                            className="w-full text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-md p-2 focus:bg-white focus:border-purple-500 focus:outline-hidden resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                            {form.compound_b_name || "Compound B"} Value
                          </label>
                          <textarea
                            rows={2}
                            placeholder={`Specification for ${form.compound_b_name || "Compound B"}...`}
                            value={vec.compoundB_val}
                            onChange={(e) => updateVector(idx, { compoundB_val: e.target.value })}
                            className="w-full text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-md p-2 focus:bg-white focus:border-purple-500 focus:outline-hidden resize-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                          Comparative Verdict / Clinical Takeaway
                        </label>
                        <input
                          type="text"
                          placeholder="Key takeaway, clinical distinction, or synergy verdict..."
                          value={vec.verdict || ""}
                          onChange={(e) => updateVector(idx, { verdict: e.target.value })}
                          className="w-full text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:bg-white focus:border-purple-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Synergy Verdict</Label>
              <Input
                placeholder="e.g. Synergistic Co-Administration Recommended (Wolverine Stack)"
                value={form.synergy_verdict}
                onChange={(e) => setForm({ ...form, synergy_verdict: e.target.value })}
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
              {isEdit ? "Save Comparison Changes" : "Create Comparison"}
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}

export default ComparisonCreateEditDrawer
