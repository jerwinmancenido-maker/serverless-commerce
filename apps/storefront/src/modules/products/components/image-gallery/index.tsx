"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productTitle?: string
}

const SLIDE_INTERVAL_MS = 4000

const ImageGallery = ({
  images,
  productTitle = "Analytical Compound",
}: ImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startTimer = useCallback(() => {
    if (images.length <= 1) return
    clearTimer()
    timerRef.current = setInterval(() => {
      setSelectedImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      )
    }, SLIDE_INTERVAL_MS)
  }, [images.length])

  // Start auto-slide on mount; pause when hovered
  useEffect(() => {
    if (!isHovered) {
      startTimer()
    } else {
      clearTimer()
    }
    return clearTimer
  }, [isHovered, startTimer])

  // Manual navigation: jump to index and reset timer
  const goTo = (idx: number) => {
    setSelectedImageIndex(idx)
    startTimer()
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full py-2">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white/95 via-zinc-50/50 to-white/95 backdrop-blur-md p-6 sm:p-10 text-center shadow-xs w-full max-w-[440px] aspect-square relative overflow-hidden">
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
    <div className="flex flex-col w-full max-w-[440px] mx-auto gap-y-3.5">
      {/* Primary Studio Display Card */}
      <div
        className="group relative aspect-square w-full rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/30 to-white backdrop-blur-md p-6 sm:p-8 flex items-center justify-center shadow-xs overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle Ambient Radial Glow on Pedestal */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(241,245,249,0.7)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

        {/* Counter Badge */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 z-10 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200/90 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 shadow-2xs">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Main Product Image */}
        {!!activeImage?.url && (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={activeImage.url}
              priority
              className="object-contain drop-shadow-sm transition-all duration-500"
              alt={`${productTitle} image ${selectedImageIndex + 1}`}
              fill
              sizes="(max-width: 576px) 320px, (max-width: 768px) 400px, 440px"
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
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
                className={`relative size-16 rounded-xl border p-1 bg-white flex items-center justify-center overflow-hidden transition-all shrink-0 cursor-pointer ${
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
                    className="object-contain p-1"
                    sizes="64px"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
