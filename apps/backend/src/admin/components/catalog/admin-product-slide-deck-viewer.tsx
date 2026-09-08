import { useState } from "react"
import { AdminBadge } from "../ui/admin-badge"

export type AdminProductSlideDeckViewerProps = {
  handle: string
  title?: string
  className?: string
}

const SLIDE_DEFINITIONS = [
  { index: 1, name: "slide1_hero.webp", label: "Hero Presentation", desc: "Pure white backdrop render" },
  { index: 2, name: "slide2_molecular.webp", label: "Molecular Specs", desc: "Chemical structure & CAS" },
  { index: 3, name: "slide3_reconstitution.webp", label: "Reconstitution Math", desc: "Dilution & syringe calibration" },
  { index: 4, name: "slide4_benefits.webp", label: "Research Observations", desc: "Analytical biological metrics" },
  { index: 5, name: "slide5_kit.webp", label: "Packaging Manifest", desc: "Vials, solvents & labware" },
  { index: 6, name: "slide6_superapp.webp", label: "Customer Hub", desc: "Dose logging & protocol QR" },
]

export const AdminProductSlideDeckViewer = ({
  handle,
  title = "Compound",
  className = "",
}: AdminProductSlideDeckViewerProps) => {
  const [activeSlide, setActiveSlide] = useState<number>(1)
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({})

  const currentDef = SLIDE_DEFINITIONS.find((s) => s.index === activeSlide) || SLIDE_DEFINITIONS[0]
  const currentSrc = `/static/catalog/${handle}/${currentDef.name}`

  const handleNext = () => {
    setActiveSlide((prev) => (prev >= 6 ? 1 : prev + 1))
  }

  const handlePrev = () => {
    setActiveSlide((prev) => (prev <= 1 ? 6 : prev - 1))
  }

  const handleImageError = (index: number) => {
    setFailedSlides((prev) => ({ ...prev, [index]: true }))
  }

  const hasMissingSlides = Object.keys(failedSlides).length > 0

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Ultra-HD 6-Slide Visual Deck Inspector
            </h4>
            <AdminBadge variant={hasMissingSlides ? "amber" : "emerald"} dot>
              {hasMissingSlides ? "Asset Audit Warning" : "6-Slide Synchronized"}
            </AdminBadge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {title} ({handle})
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-600">
          <span>Slide {activeSlide} of 6</span>
        </div>
      </div>

      {/* Main Slide Viewer Canvas */}
      <div className="relative mt-4 aspect-16/9 w-full rounded-xl bg-white border border-slate-200/70 overflow-hidden flex items-center justify-center">
        {failedSlides[activeSlide] ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <span className="text-xs font-bold text-slate-700">{currentDef.label}</span>
            <p className="text-xs text-amber-600 mt-1">Asset not found at {currentSrc}</p>
          </div>
        ) : (
          <img
            src={currentSrc}
            alt={`${title} - ${currentDef.label}`}
            className="w-full h-full object-contain select-none"
            onError={() => handleImageError(activeSlide)}
          />
        )}

        {/* Carousel Prev/Next Overlay Buttons */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-950 transition-all cursor-pointer"
          title="Previous Slide"
        >
          &larr;
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-white hover:text-slate-950 transition-all cursor-pointer"
          title="Next Slide"
        >
          &rarr;
        </button>

        {/* Slide Overlay Tag */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold">
          <span>{currentDef.label}</span>
          <span className="text-slate-300 font-normal ml-1.5">• {currentDef.desc}</span>
        </div>
      </div>

      {/* Thumbnail Selector Strip */}
      <div className="mt-3 grid grid-cols-6 gap-2">
        {SLIDE_DEFINITIONS.map((def) => {
          const isActive = def.index === activeSlide
          const isFailed = failedSlides[def.index]
          const thumbSrc = `/static/catalog/${handle}/${def.name}`

          return (
            <button
              key={def.index}
              type="button"
              onClick={() => setActiveSlide(def.index)}
              className={`relative aspect-square rounded-lg border overflow-hidden transition-all cursor-pointer ${
                isActive
                  ? "border-blue-600 ring-2 ring-blue-600/20 shadow-xs"
                  : "border-slate-200/80 hover:border-slate-400 opacity-70 hover:opacity-100"
              }`}
            >
              {isFailed ? (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                  S{def.index}
                </div>
              ) : (
                <img
                  src={thumbSrc}
                  alt={`Thumb ${def.index}`}
                  className="h-full w-full object-cover bg-white"
                  onError={() => handleImageError(def.index)}
                />
              )}
              <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-slate-900/70 text-[9px] font-bold text-white font-mono">
                {def.index}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
