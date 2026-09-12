"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/dossier-view-client.tsx
 * @module  DossierViewClient
 * @purpose Interactive client container for the standalone GLP protocol dossier document route.
 *          Provides preset switching, pure-TS vector PDF download, and autoprint execution.
 */

import React, { useEffect, useState } from "react"
import Link from "next/link"
import type { CustomerResearchProtocol, StoreResearchProtocol } from "@lib/data/research-protocols"
import ClinicalProtocolPrintDossier, {
  type PrintPreset,
} from "./clinical-protocol-print-dossier"
import { downloadProtocolPdf } from "@lib/pdf/protocol-pdf-compiler"
import { cleanCompoundTitle } from "@lib/protocol-sharing"

interface DossierViewClientProps {
  protocol: CustomerResearchProtocol | StoreResearchProtocol
  countryCode: string
  initialPreset?: PrintPreset
  autoprint?: boolean
}

export default function DossierViewClient({
  protocol,
  countryCode,
  initialPreset = "full",
  autoprint = false,
}: DossierViewClientProps) {
  const [preset, setPreset] = useState<PrintPreset>(initialPreset)
  const [isDownloading, setIsDownloading] = useState(false)

  const cleanTitle = cleanCompoundTitle(
    protocol.content.compound_name || protocol.title
  )

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
      downloadProtocolPdf(protocol, preset)
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
              href={`/${countryCode}/research-protocols/${protocol.handle}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
            >
              <span>←</span>
              <span>Back to Protocol</span>
            </Link>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-xs font-bold text-white block">
                {cleanTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                PSL-SOP-{protocol.handle.toUpperCase()} · ISO 9001 GLP Dossier
              </span>
            </div>
          </div>

          {/* Center: Preset Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setPreset("full")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                preset === "full"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Full Monograph
            </button>
            <button
              type="button"
              onClick={() => setPreset("bench_sop")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                preset === "bench_sop"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Benchtop SOP
            </button>
            <button
              type="button"
              onClick={() => setPreset("schedule_bom")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                preset === "schedule_bom"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Titration BOM
            </button>
          </div>

          {/* Right: Actions (Download & Print) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Download pure vector PDF file directly"
            >
              <span>📥</span>
              <span>{isDownloading ? "Generating..." : "Download PDF (.pdf)"}</span>
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
        <ClinicalProtocolPrintDossier
          protocol={protocol}
          preset={preset}
          countryCode={countryCode}
        />
      </main>
    </div>
  )
}
