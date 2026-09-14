/**
 * @file    apps/backend/src/admin/components/catalog/admin-product-slide-deck-viewer.tsx
 * @module  AdminProductSlideDeckViewer
 * @purpose Ultra-HD 6-Slide Visual Deck Inspector with live SADS 2.0 slide manager drawer for compounded products.
 * @contracts
 *   Component: AdminProductSlideDeckViewer
 *   Drawer:    SlideDeckManagerDrawer
 */

import { useState, useEffect } from "react"
import { AdminBadge } from "../ui/admin-badge"
import { SlideDeckManagerDrawer, SlideDefinition } from "./slide-deck-manager-drawer"
import { PencilSquare, Photo, ArrowPath } from "@medusajs/icons"

export type AdminProductSlideDeckViewerProps = {
  productId?: string
  handle: string
  title?: string
  className?: string
  initialSlides?: SlideDefinition[]
  onSlidesUpdated?: () => void
}

const DEFAULT_SLIDE_DEFINITIONS: SlideDefinition[] = [
  { index: 1, name: "slide1_hero.webp", label: "Hero Presentation", desc: "Pure white backdrop render" },
  { index: 2, name: "slide2_molecular.webp", label: "Molecular Specs", desc: "Chemical structure & CAS" },
  { index: 3, name: "slide3_reconstitution.webp", label: "Reconstitution Math", desc: "Dilution & syringe calibration" },
  { index: 4, name: "slide4_benefits.webp", label: "Research Observations", desc: "Analytical biological metrics" },
  { index: 5, name: "slide5_kit.webp", label: "Packaging Manifest", desc: "Vials, solvents & labware" },
  { index: 6, name: "slide6_superapp.webp", label: "Customer Hub", desc: "Dose logging & protocol QR" },
]

export const AdminProductSlideDeckViewer = ({
  productId,
  handle,
  title = "Compound",
  className = "",
  initialSlides,
  onSlidesUpdated,
}: AdminProductSlideDeckViewerProps) => {
  const [activeSlide, setActiveSlide] = useState<number>(1)
  const [slides, setSlides] = useState<SlideDefinition[]>(initialSlides || DEFAULT_SLIDE_DEFINITIONS)
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({})
  const [isManagerOpen, setIsManagerOpen] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  // Update internal slides if initialSlides prop changes
  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides)
    }
  }, [initialSlides])

  const currentDef = slides.find((s) => s.index === activeSlide) || slides[0] || DEFAULT_SLIDE_DEFINITIONS[0]
  const currentSrc = currentDef.url || (currentDef.name ? `/static/catalog/${handle}/${currentDef.name}` : `/static/catalog/${handle}/slide${activeSlide}_hero.webp`)

  const handleNext = () => {
    const nextIdx = activeSlide >= slides.length ? 1 : activeSlide + 1
    setActiveSlide(nextIdx)
  }

  const handlePrev = () => {
    const prevIdx = activeSlide <= 1 ? slides.length : activeSlide - 1
    setActiveSlide(prevIdx)
  }

  const handleImageError = (index: number) => {
    setFailedSlides((prev) => ({ ...prev, [index]: true }))
  }

  const hasMissingSlides = Object.keys(failedSlides).length > 0

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              Visual Deck Inspector
            </h4>
            <AdminBadge variant={hasMissingSlides ? "amber" : "emerald"} dot>
              {hasMissingSlides ? "Asset Audit Warning" : `${slides.length}-Slide Deck Synchronized`}
            </AdminBadge>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">
            {title} <span className="font-mono font-normal text-xs text-slate-500">({handle})</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Inspect Full Size"
          >
            🔍 Zoom
          </button>
          <button
            type="button"
            onClick={() => setIsManagerOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <PencilSquare className="w-3.5 h-3.5 text-slate-600" />
            Customize Deck
          </button>
          <div className="px-2 py-1 rounded bg-slate-100 font-mono text-[11px] text-slate-600 font-semibold">
            Slide {activeSlide} / {slides.length}
          </div>
        </div>
      </div>

      {/* Main Slide Viewer Canvas: Compact & Proportional (max 280px height) */}
      <div className="relative mt-3 max-w-xl mx-auto w-full h-[240px] sm:h-[280px] rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {failedSlides[activeSlide] ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300">
            <Photo className="w-8 h-8 text-slate-500 mb-2" />
            <span className="text-xs font-bold text-slate-200">{currentDef.label}</span>
            <p className="text-[11px] font-mono text-amber-400 mt-1 max-w-sm truncate">
              Asset not reachable at {currentSrc}
            </p>
            <button
              type="button"
              onClick={() => setIsManagerOpen(true)}
              className="mt-3 px-3 py-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer"
            >
              Update Slide URL
            </button>
          </div>
        ) : (
          <img
            src={currentSrc}
            alt={`${title} - ${currentDef.label}`}
            className="w-full h-full object-contain select-none bg-slate-900 cursor-pointer"
            onClick={() => setIsZoomOpen(true)}
            title="Click to view full size"
            onError={() => handleImageError(activeSlide)}
          />
        )}

        {/* Carousel Prev/Next Overlay Buttons */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs text-xs"
          title="Previous Slide"
        >
          &larr;
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs text-xs"
          title="Next Slide"
        >
          &rarr;
        </button>

        {/* Slide Overlay Tag */}
        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-white text-xs font-medium max-w-[85%]">
          <span className="font-semibold text-emerald-400 font-mono text-[10px] mr-1.5">[{activeSlide}]</span>
          <span>{currentDef.label}</span>
          <span className="text-slate-400 font-normal ml-1.5 hidden sm:inline">• {currentDef.desc}</span>
        </div>
      </div>

      {/* Thumbnail Selector Strip: Compact & Balanced */}
      <div className="mt-3 max-w-xl mx-auto grid grid-cols-6 gap-2">
        {slides.map((def) => {
          const isActive = def.index === activeSlide
          const isFailed = failedSlides[def.index]
          const thumbSrc = def.url || (def.name ? `/static/catalog/${handle}/${def.name}` : `/static/catalog/${handle}/slide${def.index}_hero.webp`)

          return (
            <button
              key={def.index}
              type="button"
              onClick={() => setActiveSlide(def.index)}
              className={`relative aspect-square rounded-lg border overflow-hidden transition-all cursor-pointer ${
                isActive
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                  : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
              }`}
            >
              {isFailed ? (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold font-mono">
                  S{def.index}
                </div>
              ) : (
                <img
                  src={thumbSrc}
                  alt={`Thumb ${def.index}`}
                  className="h-full w-full object-cover bg-slate-900"
                  onError={() => handleImageError(def.index)}
                />
              )}
              <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-slate-900/80 text-[9px] font-bold text-white font-mono">
                {def.index}
              </span>
            </button>
          )
        })}
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 px-4 border-b border-slate-800 bg-slate-900/90">
              <span className="text-xs font-bold text-white font-mono">
                Slide {activeSlide}: {currentDef.label}
              </span>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="size-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="relative flex-1 flex items-center justify-center p-2 bg-slate-950">
              <img
                src={currentSrc}
                alt={`${title} - ${currentDef.label} (Zoomed)`}
                className="max-w-full max-h-[75vh] object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Slide Deck Manager Drawer */}
      <SlideDeckManagerDrawer
        open={isManagerOpen}
        onOpenChange={setIsManagerOpen}
        productId={productId}
        handle={handle}
        title={title}
        currentSlides={slides}
        onSuccess={() => {
          setFailedSlides({})
          if (onSlidesUpdated) onSlidesUpdated()
        }}
      />
    </div>
  )
}
