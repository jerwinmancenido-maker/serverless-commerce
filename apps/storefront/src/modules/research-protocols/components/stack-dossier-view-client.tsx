"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/stack-dossier-view-client.tsx
 * @module  StackDossierViewClient
 * @purpose Interactive client container for the standalone multi-compound stack dossier route.
 *          Provides vector PDF generation, clean preview, and automatic browser print execution.
 */

import React, { useEffect, useState } from "react"
import Link from "next/link"
import type {
  StackCompoundProfile,
  StackCompatibilityEvaluation,
} from "@lib/data/stack-interactions"
import type { ResearchBundleVial } from "@modules/research-protocols/types"
import StackPrintDossier from "./stack-print-dossier"
import { downloadStackPdf } from "@lib/pdf/stack-pdf-compiler"

interface StackDossierViewClientProps {
  stackEvaluation: StackCompatibilityEvaluation | null
  selectedProfiles: StackCompoundProfile[]
  bundleVials: ResearchBundleVial[]
  countryCode: string
  autoprint?: boolean
}

export default function StackDossierViewClient({
  stackEvaluation,
  selectedProfiles,
  bundleVials,
  countryCode,
  autoprint = false,
}: StackDossierViewClientProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const isContraindicated = stackEvaluation?.status === "contraindicated"
  const stackTitle = stackEvaluation?.title || "Multi-Peptide Research Stack"
  const synergyScore = stackEvaluation?.overallScore ?? 0

  useEffect(() => {
    if (autoprint && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        window.print()
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [autoprint])

  const handleDownloadPdf = () => {
    setIsDownloading(true)
    try {
      downloadStackPdf({ stackEvaluation, selectedProfiles, bundleVials })
    } finally {
      setTimeout(() => setIsDownloading(false), 1000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pb-20 print:bg-white print:p-0 print:pb-0">
      {/* ── Top Modern Luminous Action Bar ── */}
      <header className="sticky top-[88px] sm:top-[92px] z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 text-slate-900 px-4 py-2.5 shadow-2xs print:hidden transition-all">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Back link & Title */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href={`/${countryCode}/research-stacks`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/70 transition-all active:scale-95"
            >
              <span>←</span>
              <span>Back to Stacking Studio</span>
            </Link>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-slate-900 block truncate max-w-xs">
                {stackTitle}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                {selectedProfiles.map((p) => p.shortName).join(" + ")} · GLP Multi-Vial SOP
              </span>
            </div>
          </div>

          {/* Center: Synergy Indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                isContraindicated
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {isContraindicated
                ? "⛔ Contraindicated Regimen"
                : `⚡ Synergy Index: ${synergyScore}/100`}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Download pure vector PDF file directly"
            >
              <span>📥</span>
              <span>{isDownloading ? "Generating..." : "Download Stack PDF (.pdf)"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-slate-900 font-semibold text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer"
              title="Open System Print Dialog"
            >
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Document Paper Container ── */}
      <main className="max-w-4xl mx-auto mt-6 bg-white shadow-lg rounded-2xl p-6 sm:p-10 border border-slate-200/70 print:shadow-none print:border-none print:m-0 print:p-0 print:rounded-none">
        <StackPrintDossier
          stackEvaluation={stackEvaluation}
          selectedProfiles={selectedProfiles}
          bundleVials={bundleVials}
          visibleOnScreen={true}
        />
      </main>
    </div>
  )
}
