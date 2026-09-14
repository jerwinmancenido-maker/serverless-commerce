"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle?: string
  variants?: HttpTypes.StoreProductVariant[]
  initialImageIndex?: number
  selectedVariantId?: string
}

const SLIDE_INTERVAL_MS = 12000 // Extended comfortable reading duration (12s)
const VARIANT_HOLD_MS = 15000 // Extended hold duration when user selects a variation (15s)

const ImageGallery = ({
  images,
  productTitle = "Analytical Compound",
  variants = [],
  initialImageIndex = 0,
  selectedVariantId,
}: ImageGalleryProps) => {
  const searchParams = useSearchParams()
  const activeVariantId = searchParams.get("v_id") || selectedVariantId

  const [selectedImageIndex, setSelectedImageIndex] = useState(() => {
    if (
      typeof initialImageIndex === "number" &&
      initialImageIndex >= 0 &&
      initialImageIndex < (images?.length || 0)
    ) {
      return initialImageIndex
    }
    return 0
  })
  const [isHovered, setIsHovered] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(() => {
    return (initialImageIndex !== undefined && initialImageIndex > 0) || !!activeVariantId
  })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  const startTimer = useCallback((intervalMs: number = SLIDE_INTERVAL_MS) => {
    if (images.length <= 1) return
    clearTimer()
    timerRef.current = setInterval(() => {
      setSelectedImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      )
    }, intervalMs)
  }, [images.length, clearTimer])

  // Helper to match inclusion or variant label to dedicated catalog slides & studio variation photos
  const findMatchingImageIndex = useCallback(
    (label: string): number => {
      if (!images || images.length === 0 || !label) return -1
      const str = label.toLowerCase().trim()

      // 1. Complete SubQ Set / Kit Inclusions (Check first to prevent partial 'vial' string collisions)
      const isCompleteSet =
        str.includes("subq") ||
        str.includes("complete set") ||
        str.includes("prep set") ||
        str.includes("kit inclusions") ||
        (str.includes("kit") && !str.includes("bac"))

      if (isCompleteSet) {
        // Priority A: dedicated variation photo
        let idx = images.findIndex((img) =>
          img.url?.toLowerCase().includes("variant_complete_set")
        )
        if (idx !== -1) return idx
        // Priority B: Slide 5 kit workstation
        idx = images.findIndex(
          (img) =>
            img.url?.toLowerCase().includes("slide5") ||
            img.url?.toLowerCase().includes("kit")
        )
        if (idx !== -1) return idx
      }

      // 2. BAC Water / Reconstitution Set
      const isBacWater =
        str.includes("bac") ||
        str.includes("water") ||
        str.includes("diluent") ||
        str.includes("reconstitution")

      if (isBacWater) {
        // Priority A: dedicated variation photo
        let idx = images.findIndex((img) =>
          img.url?.toLowerCase().includes("variant_vial_bac")
        )
        if (idx !== -1) return idx
        // Priority B: Slide 3 reconstitution protocol
        idx = images.findIndex(
          (img) =>
            img.url?.toLowerCase().includes("slide3") ||
            img.url?.toLowerCase().includes("reconstitution")
        )
        if (idx !== -1) return idx
      }

      // 3. Solo Vial Only / Pure Standard
      const isVialOnly =
        str.includes("vial only") ||
        str.includes("pure vial") ||
        str === "vial" ||
        (str.includes("vial") &&
          !str.includes("bac") &&
          !str.includes("set") &&
          !str.includes("kit"))

      if (isVialOnly) {
        // Priority A: dedicated variation photo (variant_vial.webp)
        let idx = images.findIndex(
          (img) =>
            img.url?.toLowerCase().includes("variant_vial.") ||
            img.url?.toLowerCase().includes("variant_vial_") ||
            img.url?.toLowerCase().includes("thumb600_variant_vial.")
        )
        if (idx !== -1) return idx
        // Priority B: Slide 1 hero infocard
        idx = images.findIndex(
          (img) =>
            img.url?.toLowerCase().includes("slide1") ||
            img.url?.toLowerCase().includes("hero")
        )
        if (idx !== -1) return idx
      }

      return -1
    },
    [images]
  )

  // Listen for instant variant selection events dispatched from ProductActions & OptionSelect
  useEffect(() => {
    const handleVariantSelected = (e: Event) => {
      const customEvent = e as CustomEvent<{
        variantId?: string
        variantTitle?: string
        inclusion?: string
        value?: string
        optionId?: string
        options?: Record<string, string>
      }>
      const detail = customEvent.detail
      if (!detail) return

      // Halt auto-rotation immediately when the user interacts
      setHasUserInteracted(true)
      clearTimer()

      // Determine label to match against slides
      const testLabel =
        detail.inclusion ||
        detail.value ||
        detail.variantTitle ||
        (detail.options ? Object.values(detail.options).join(" ") : "")

      const matchIdx = findMatchingImageIndex(testLabel)
      let resolvedIdx = matchIdx
      if (resolvedIdx === -1 && detail.variantId) {
        resolvedIdx = images.findIndex(
          (img) =>
            (img.metadata as Record<string, unknown> | undefined)
              ?.variant_id === detail.variantId
        )
      }

      if (resolvedIdx !== -1) {
        setSelectedImageIndex(resolvedIdx)
      }

      // Extend duration: hold firmly on the selected variant photo for 15 seconds before resuming rotation
      holdTimerRef.current = setTimeout(() => {
        setHasUserInteracted(false)
        startTimer(SLIDE_INTERVAL_MS)
      }, VARIANT_HOLD_MS)
    }

    window.addEventListener("pepstack:variant_selected", handleVariantSelected)
    return () => {
      window.removeEventListener(
        "pepstack:variant_selected",
        handleVariantSelected
      )
    }
  }, [clearTimer, findMatchingImageIndex, images, startTimer])

  // Synchronize gallery with active variant selected in URL query params on initial mount or URL change
  useEffect(() => {
    if (!activeVariantId || !images || images.length === 0) return

    let targetIdx = -1

    // 1. Direct metadata match by variant_id
    const directIdx = images.findIndex(
      (img) =>
        (img.metadata as Record<string, unknown> | undefined)?.variant_id ===
        activeVariantId
    )
    if (directIdx !== -1) {
      targetIdx = directIdx
    } else {
      // 2. Match by variant thumbnail or custom image metadata
      const activeVariant = variants?.find((v) => v.id === activeVariantId)
      if (activeVariant) {
        const targetUrls: string[] = []
        if (activeVariant.thumbnail) targetUrls.push(activeVariant.thumbnail)
        const rawUrls = activeVariant.metadata?.image_urls as string[] | undefined
        if (rawUrls) targetUrls.push(...rawUrls)
        const compounded = (
          activeVariant.metadata?.compounded_product as
            | { image_urls?: string[] }
            | undefined
        )?.image_urls
        if (compounded) targetUrls.push(...compounded)

        for (const targetUrl of targetUrls) {
          if (!targetUrl) continue
          const urlIdx = images.findIndex((img) => {
            if (!img.url) return false
            if (img.url === targetUrl) return true
            const imgFile = img.url.split("?")[0].split("/").pop()?.toLowerCase()
            const targetFile = targetUrl.split("?")[0].split("/").pop()?.toLowerCase()
            return imgFile && targetFile && imgFile === targetFile
          })
          if (urlIdx !== -1) {
            targetIdx = urlIdx
            break
          }
        }

        // 3. Match by semantic variant naming (title + options)
        if (targetIdx === -1) {
          const optionVals = (activeVariant.options || []).map((o) => o.value || "")
          const combined = [activeVariant.title || "", ...optionVals].join(" ").toLowerCase()
          const matchIdx = findMatchingImageIndex(combined)
          if (matchIdx !== -1) {
            targetIdx = matchIdx
          }
        }
      }
    }

    if (targetIdx !== -1) {
      setSelectedImageIndex(targetIdx)
      clearTimer()
      setHasUserInteracted(true)
      holdTimerRef.current = setTimeout(() => {
        setHasUserInteracted(false)
        startTimer(SLIDE_INTERVAL_MS)
      }, VARIANT_HOLD_MS)
    }
  }, [activeVariantId, findMatchingImageIndex, images, variants, clearTimer, startTimer])

  // Start auto-slide on mount; pause when hovered, zoomed, or user has interacted
  useEffect(() => {
    if (!isHovered && !isZoomOpen && !hasUserInteracted) {
      startTimer()
    } else {
      clearTimer()
    }
    return clearTimer
  }, [isHovered, isZoomOpen, hasUserInteracted, startTimer, clearTimer])

  // Manual navigation: jump to index and hold for 15s before resuming
  const goTo = (idx: number) => {
    setSelectedImageIndex(idx)
    clearTimer()
    setHasUserInteracted(true)
    holdTimerRef.current = setTimeout(() => {
      setHasUserInteracted(false)
      startTimer(SLIDE_INTERVAL_MS)
    }, VARIANT_HOLD_MS)
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-2">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white/95 via-zinc-50/50 to-white/95 backdrop-blur-md p-6 sm:p-10 text-center shadow-xs w-full max-w-[560px] medium:max-w-[620px] aspect-square relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-zinc-200/90 text-zinc-700 shadow-2xs mb-5">
            <svg
              className="w-8 h-8 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.375A4.5 4.5 0 008.25 21h7.5A4.5 4.5 0 0019 14.375l-4.091-3.966a2.25 2.25 0 01-.659-1.591V3.104"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 3.104h7.5M9.75 14.25h4.5"
              />
            </svg>
          </div>

          <span className="relative rounded-full bg-zinc-100 border border-zinc-200 px-3 py-1 text-[11px] font-semibold text-zinc-700 uppercase tracking-wider mb-2.5">
            Research Compound
          </span>

          <h3 className="relative text-base font-bold text-zinc-900 tracking-tight">
            {productTitle}
          </h3>

          <p className="relative text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
            Lyophilized research compound in sealed borosilicate glass vial with
            tamper-evident seal.
          </p>

          <div className="relative mt-6 flex items-center gap-3 text-[11px] font-medium text-zinc-400 border-t border-zinc-200/60 pt-4">
            <span>Borosilicate Glass</span>
            <span>·</span>
            <span>Tamper-Evident Seal</span>
            <span>·</span>
            <span>Batch Verified</span>
          </div>
        </div>
      </div>
    )
  }

  const activeImage = images[selectedImageIndex] || images[0]

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    goTo(selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    goTo(
      selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
    )
  }

  return (
    <>
      <div className="flex flex-col w-full max-w-[580px] medium:max-w-[640px] large:max-w-[680px] mx-auto gap-y-4">
        {/* Primary Studio Display Card */}
        <div
          className="group relative aspect-square w-full rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/40 to-white backdrop-blur-md p-2 sm:p-3 md:p-4 flex items-center justify-center shadow-xs overflow-hidden cursor-zoom-in"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsZoomOpen(true)}
        >
          {/* Subtle Ambient Radial Glow on Pedestal */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(241,245,249,0.7)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

          {/* Enlarge / Zoom Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsZoomOpen(true)
            }}
            aria-label="Enlarge photo"
            className="absolute top-3.5 left-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-zinc-200/90 text-zinc-600 shadow-2xs hover:bg-white hover:text-zinc-900 transition-all opacity-0 group-hover:opacity-100"
            title="Expand full-resolution view"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>

          {/* Counter Badge */}
          {images.length > 1 && (
            <div className="absolute top-3.5 right-3.5 z-10 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200/90 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 shadow-2xs">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Main Product Image - Enlarged Frame */}
          {!!activeImage?.url && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={activeImage.url}
                priority
                className="object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-[1.03]"
                alt={`${productTitle} image ${selectedImageIndex + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 640px, 680px"
              />
            </div>
          )}

          {/* Left / Right Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-700 shadow-xs hover:bg-white hover:text-zinc-900 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="translate-x-[-1px]"
                >
                  <path
                    d="M10 12L6 8L10 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-700 shadow-xs hover:bg-white hover:text-zinc-900 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="translate-x-[1px]"
                >
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Progress Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goTo(idx)
                  }}
                  aria-label={`Go to photo ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    idx === selectedImageIndex
                      ? "w-5 h-1.5 bg-zinc-900"
                      : "w-1.5 h-1.5 bg-zinc-400/50 hover:bg-zinc-500"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation Bar */}
        {images.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar pt-0.5">
            {images.map((image, idx) => {
              const isSelected = idx === selectedImageIndex
              return (
                <button
                  key={image.id || idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`relative size-16 sm:size-18 md:size-20 rounded-xl border p-1 bg-white flex items-center justify-center overflow-hidden transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "border-zinc-900 ring-2 ring-zinc-900/10 shadow-2xs scale-[1.02]"
                      : "border-zinc-200 hover:border-zinc-300 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Select photo ${idx + 1}`}
                >
                  {!!image.url && (
                    <Image
                      src={image.url}
                      alt={`${productTitle} thumbnail ${idx + 1}`}
                      fill
                      className="object-contain p-0.5"
                      sizes="80px"
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Full-Resolution Modal Lightbox */}
      {isZoomOpen && !!activeImage?.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-fadeIn"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Lightbox Controls */}
          <div className="absolute top-4 right-4 z-60 flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">
              {selectedImageIndex + 1} of {images.length}
            </span>
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Close zoomed view"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer border border-white/20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Modal Left / Right Buttons */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-60 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-60 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Enlarged Image Container */}
          <div
            className="relative w-full max-w-4xl h-[75vh] sm:h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage.url}
              alt={`${productTitle} enlarged view`}
              fill
              className="object-contain drop-shadow-2xl"
              sizes="100vw"
            />
          </div>

          {/* Caption at bottom */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-60 text-center pointer-events-none">
            <p className="text-sm font-semibold text-white/90 drop-shadow-md">
              {productTitle}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Press Esc or click anywhere outside to close
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default ImageGallery
