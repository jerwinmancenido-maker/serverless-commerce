/**
 * @file    apps/backend/src/admin/components/catalog/slide-deck-manager-drawer.tsx
 * @module  SlideDeckManagerDrawer
 * @purpose Slide-over drawer for customizing Ultra-HD slide decks, image URLs, labels, and order for compounded products.
 * @contracts
 *   Drawer:  SlideDeckManagerDrawer
 *   API:     POST /admin/products/:id
 */

import React, { useState, useEffect } from "react"
import {
  Drawer,
  Button,
  Input,
  Label,
  Textarea,
  toast,
} from "@medusajs/ui"
import { Photo, Plus, Trash, ArrowPath } from "@medusajs/icons"
import { sdk } from "../../lib/sdk"

export type SlideDefinition = {
  index: number
  name?: string
  url?: string
  label: string
  desc: string
}

interface SlideDeckManagerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId?: string
  handle: string
  title?: string
  currentSlides: SlideDefinition[]
  onSuccess: () => void
}

export const SlideDeckManagerDrawer: React.FC<SlideDeckManagerDrawerProps> = ({
  open,
  onOpenChange,
  productId,
  handle,
  title = "Compound",
  currentSlides,
  onSuccess,
}) => {
  const [slides, setSlides] = useState<SlideDefinition[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setSlides(
        currentSlides && currentSlides.length > 0
          ? JSON.parse(JSON.stringify(currentSlides))
          : [
              { index: 1, name: "slide1_hero.webp", label: "Hero Presentation", desc: "Pure white backdrop render" },
              { index: 2, name: "slide2_molecular.webp", label: "Molecular Specs", desc: "Chemical structure & CAS" },
              { index: 3, name: "slide3_reconstitution.webp", label: "Reconstitution Math", desc: "Dilution & syringe calibration" },
              { index: 4, name: "slide4_benefits.webp", label: "Research Observations", desc: "Analytical biological metrics" },
              { index: 5, name: "slide5_kit.webp", label: "Packaging Manifest", desc: "Vials, solvents & labware" },
              { index: 6, name: "slide6_superapp.webp", label: "Customer Hub", desc: "Dose logging & protocol QR" },
            ]
      )
    }
  }, [currentSlides, open])

  const addSlide = () => {
    const nextIdx = slides.length + 1
    setSlides((prev) => [
      ...prev,
      {
        index: nextIdx,
        name: `slide${nextIdx}_custom.webp`,
        label: `Slide ${nextIdx}: Custom Monograph`,
        desc: "Custom clinical asset render",
      },
    ])
  }

  const removeSlide = (idx: number) => {
    setSlides((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, index: i + 1 }))
    )
  }

  const updateSlide = (idx: number, field: keyof SlideDefinition, val: any) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) {
      toast.error("Product ID missing for slide deck persistence")
      return
    }

    setIsSubmitting(true)
    try {
      await sdk.admin.product.update(productId, {
        metadata: {
          slide_deck: slides,
        },
      })
      toast.success("Slide deck updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to update slide deck:", err)
      toast.error(err.message || "Failed to update slide deck")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="right-0 top-0 bottom-0 h-full w-full sm:max-w-xl bg-white border-l border-slate-200 p-0 flex flex-col justify-between shadow-2xl">
        <Drawer.Header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs shadow-2xs">
              <Photo className="size-4" />
            </span>
            <div>
              <Drawer.Title className="text-sm font-bold text-slate-900 tracking-tight">
                Customize Visual Slide Deck
              </Drawer.Title>
              <Drawer.Description className="text-xs text-slate-500 mt-0.5">
                {title} ({handle}) &bull; Manage slides, asset paths, and clinical annotations.
              </Drawer.Description>
            </div>
          </div>
        </Drawer.Header>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <Drawer.Body className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Slide Configuration ({slides.length})
              </div>
              <Button
                type="button"
                size="small"
                variant="secondary"
                onClick={addSlide}
                className="h-7 text-xs inline-flex items-center gap-1"
              >
                <Plus className="size-3" /> Add Slide
              </Button>
            </div>

            <div className="space-y-3">
              {slides.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                      Slide #{s.index}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSlide(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="Remove Slide"
                    >
                      <Trash className="size-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-mono">Label / Title</Label>
                      <Input
                        value={s.label}
                        onChange={(e) => updateSlide(idx, "label", e.target.value)}
                        className="h-7 text-xs bg-white"
                        placeholder="e.g. Hero Presentation"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-mono">Filename or URL</Label>
                      <Input
                        value={s.name || s.url || ""}
                        onChange={(e) => updateSlide(idx, "name", e.target.value)}
                        className="h-7 text-xs bg-white font-mono"
                        placeholder="slide1_hero.webp or https://..."
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 font-mono">Monograph Note / Caption</Label>
                    <Input
                      value={s.desc}
                      onChange={(e) => updateSlide(idx, "desc", e.target.value)}
                      className="h-7 text-xs bg-white"
                      placeholder="e.g. Chemical structure & CAS registration"
                    />
                  </div>
                </div>
              ))}
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
              Save Slide Deck
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}

export default SlideDeckManagerDrawer
