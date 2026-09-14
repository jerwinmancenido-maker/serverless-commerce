/**
 * @file    apps/backend/src/admin/routes/research-library/drawers/educational-create-edit-drawer.tsx
 * @module  EducationalCreateEditDrawer
 * @purpose Slide-over drawer for creating and editing clinical glossary definitions and patient/research FAQs.
 * @contracts
 *   Drawer:  EducationalCreateEditDrawer
 *   API:     POST /admin/educational-content · POST /admin/educational-content/:id
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
import { BookOpen } from "@medusajs/icons"
import { sdk } from "../../../lib/sdk"
import { SovereignMarkdownCanvas } from "../../../components/editor/sovereign-markdown-canvas"
import { TagChipInput } from "../../../components/ui/tag-chip-input"

export type EducationalFormState = {
  id?: string
  type: "glossary" | "faq"
  termOrQuestion: string
  category: string
  definitionOrAnswer: string
  relatedCompoundsOrTags: string
}

interface EducationalCreateEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: any | null
  defaultType?: "glossary" | "faq"
  onSuccess: () => void
}

const BLANK_STATE: EducationalFormState = {
  type: "glossary",
  termOrQuestion: "",
  category: "Pharmacodynamics",
  definitionOrAnswer: "",
  relatedCompoundsOrTags: "",
}

export const EducationalCreateEditDrawer: React.FC<EducationalCreateEditDrawerProps> = ({
  open,
  onOpenChange,
  item,
  defaultType = "glossary",
  onSuccess,
}) => {
  const [form, setForm] = useState<EducationalFormState>({
    ...BLANK_STATE,
    type: defaultType,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = Boolean(item && (item.id || item.term || item.question))

  useEffect(() => {
    if (item) {
      const isFaq = Boolean(item.question || item.answer)
      setForm({
        id: item.id || (item.term ? item.term.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined),
        type: isFaq ? "faq" : "glossary",
        termOrQuestion: item.term || item.question || "",
        category: item.category || "General",
        definitionOrAnswer: item.definition || item.answer || "",
        relatedCompoundsOrTags: Array.isArray(item.relatedCompounds)
          ? item.relatedCompounds.join(", ")
          : Array.isArray(item.tags)
          ? item.tags.join(", ")
          : "",
      })
    } else {
      setForm({ ...BLANK_STATE, type: defaultType })
    }
  }, [item, defaultType, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.termOrQuestion.trim() || !form.definitionOrAnswer.trim()) {
      toast.error("Title/Question and Definition/Answer are required")
      return
    }

    setIsSubmitting(true)
    try {
      const isGlossary = form.type === "glossary"
      const payload = isGlossary
        ? {
            type: "glossary",
            id: form.id,
            term: form.termOrQuestion,
            category: form.category,
            definition: form.definitionOrAnswer,
            relatedCompounds: form.relatedCompoundsOrTags
              ? form.relatedCompoundsOrTags.split(",").map((s) => s.trim()).filter(Boolean)
              : [],
          }
        : {
            type: "faq",
            id: form.id,
            question: form.termOrQuestion,
            category: form.category,
            answer: form.definitionOrAnswer,
            tags: form.relatedCompoundsOrTags
              ? form.relatedCompoundsOrTags.split(",").map((s) => s.trim()).filter(Boolean)
              : [],
          }

      if (isEdit && form.id) {
        await sdk.client.fetch(`/admin/educational-content/${form.id}`, {
          method: "POST",
          body: payload,
        })
        toast.success("Educational entry updated successfully")
      } else {
        await sdk.client.fetch("/admin/educational-content", {
          method: "POST",
          body: payload,
        })
        toast.success("New educational entry published")
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to save educational content:", err)
      toast.error(err.message || "Failed to save educational content")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="right-0 top-0 bottom-0 h-full w-full sm:max-w-2xl lg:max-w-3xl bg-white border-l border-slate-200 p-0 flex flex-col justify-between shadow-2xl">
        <Drawer.Header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs shadow-2xs">
              <BookOpen className="size-4" />
            </span>
            <div>
              <Drawer.Title className="text-sm font-bold text-slate-900 tracking-tight">
                {isEdit
                  ? form.type === "glossary" ? "Edit Glossary Term" : "Edit Clinical FAQ"
                  : form.type === "glossary" ? "Add Glossary Term" : "Add Clinical FAQ"}
              </Drawer.Title>
              <Drawer.Description className="text-xs text-slate-500 mt-0.5">
                Educational reference monograph and customer hub definitions.
              </Drawer.Description>
            </div>
          </div>
        </Drawer.Header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Drawer.Body className="p-6 overflow-y-auto space-y-4 flex-1">
            {!isEdit && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Content Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) => setForm({ ...form, type: val as "glossary" | "faq" })}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="glossary">Clinical Glossary Term</Select.Item>
                    <Select.Item value="faq">Frequently Asked Question (FAQ)</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {form.type === "glossary" ? "Glossary Term" : "Clinical Question"}
              </Label>
              <Input
                placeholder={
                  form.type === "glossary"
                    ? "e.g. Bioavailability or Actomyosin Cross-Bridge"
                    : "e.g. How should reconstituted vials be stored?"
                }
                value={form.termOrQuestion}
                onChange={(e) => setForm({ ...form, termOrQuestion: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Scientific Category</Label>
              <Input
                placeholder="e.g. Pharmacokinetics, Reconstitution, Storage & Stability"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <SovereignMarkdownCanvas
                id="educational-definition"
                label={form.type === "glossary" ? "Definition / Monograph" : "Authoritative Answer"}
                value={form.definitionOrAnswer}
                onChange={(val) => setForm({ ...form, definitionOrAnswer: val })}
                initialViewMode="write"
                minHeight="180px"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {form.type === "glossary" ? "Related Compounds" : "Search Tags"}
              </Label>
              <TagChipInput
                id="educational-tags"
                variant="blue"
                placeholder="Type compound name (e.g. BPC-157) and press Enter..."
                tags={
                  form.relatedCompoundsOrTags
                    ? form.relatedCompoundsOrTags.split(",").map((s) => s.trim()).filter(Boolean)
                    : []
                }
                onChange={(newTags) => setForm({ ...form, relatedCompoundsOrTags: newTags.join(", ") })}
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
              {isEdit ? "Save Changes" : "Save Content"}
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}

export default EducationalCreateEditDrawer
