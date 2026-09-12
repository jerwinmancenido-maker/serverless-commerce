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
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16 print:bg-white print:p-0 print:pb-0">
      {/* ── Top Non-Printing Action Navigation Bar ── */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 shadow-md print:hidden">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Back link & Title */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href={`/${countryCode}/research-stacks`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
            >
              <span>←</span>
              <span>Back to Stacking Studio</span>
            </Link>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-xs font-bold text-white block truncate max-w-xs">
                {stackTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {selectedProfiles.map((p) => p.shortName).join(" + ")} · GLP Multi-Vial SOP
              </span>
            </div>
          </div>

          {/* Center: Synergy Indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                isContraindicated
                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Download pure vector PDF file directly"
            >
              <span>📥</span>
              <span>{isDownloading ? "Generating..." : "Download Stack PDF (.pdf)"}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs border border-white/20 shadow-sm transition-all cursor-pointer"
              title="Open System Print Dialog"
            >
              <span>🖨️</span>
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Document Paper Container ── */}
      <main className="max-w-4xl mx-auto mt-6 bg-white shadow-xl rounded-2xl p-6 sm:p-10 border border-slate-200/80 print:shadow-none print:border-none print:m-0 print:p-0 print:rounded-none">
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
