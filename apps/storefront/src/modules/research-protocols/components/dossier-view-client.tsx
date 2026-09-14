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
  qrCodeDataUrl?: string | null
  canonicalUrl?: string | null
}

export default function DossierViewClient({
  protocol,
  countryCode,
  initialPreset = "full",
  autoprint = false,
  qrCodeDataUrl,
  canonicalUrl,
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
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pb-20 print:bg-white print:p-0 print:pb-0">
      {/* ── Top Modern Luminous Action Bar ── */}
      <header className="sticky top-[88px] sm:top-[92px] z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 text-slate-900 px-4 py-2.5 shadow-2xs print:hidden transition-all">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Back link & Title */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href={`/${countryCode}/research-protocols/${protocol.handle}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/70 transition-all active:scale-95"
            >
              <span>←</span>
              <span>Back to Protocol</span>
            </Link>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-xs font-bold text-slate-900 block">
                {cleanTitle}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                PSL-SOP-{protocol.handle.toUpperCase()} · GLP Analytical Dossier
              </span>
            </div>
          </div>

          {/* Center: Preset Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70 text-xs">
            <button
              type="button"
              onClick={() => setPreset("full")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                preset === "full"
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Full Monograph
            </button>
            <button
              type="button"
              onClick={() => setPreset("bench_sop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                preset === "bench_sop"
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Benchtop SOP
            </button>
            <button
              type="button"
              onClick={() => setPreset("schedule_bom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                preset === "schedule_bom"
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Download pure vector PDF file directly"
            >
              <span>📥</span>
              <span>{isDownloading ? "Generating..." : "Download PDF (.pdf)"}</span>
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
        <ClinicalProtocolPrintDossier
          protocol={protocol}
          preset={preset}
          countryCode={countryCode}
          qrCodeDataUrl={qrCodeDataUrl}
          canonicalUrl={canonicalUrl || undefined}
        />
      </main>
    </div>
  )
}
