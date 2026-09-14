"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import type { CustomerResearchProtocol, StoreResearchProtocol } from "@lib/data/research-protocols"
import {
  cleanCompoundTitle,
  buildProtocolShareData,
  buildProtocolMailtoUrl,
  generateProtocolQrCode,
} from "@lib/protocol-sharing"
import type { PrintPreset } from "./components/clinical-protocol-print-dossier"
import { downloadProtocolPdf } from "@lib/pdf/protocol-pdf-compiler"

type ProtocolActionToolbarProps = {
  protocol: CustomerResearchProtocol | StoreResearchProtocol
  matchedProduct?: HttpTypes.StoreProduct | null
  countryCode?: string
  activePrintPreset?: PrintPreset
  onSelectPrintPreset?: (preset: PrintPreset) => void
}

export default function ProtocolActionToolbar({
  protocol,
  matchedProduct,
  countryCode = "ph",
  activePrintPreset = "full",
  onSelectPrintPreset,
}: ProtocolActionToolbarProps) {
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PrintPreset>(activePrintPreset)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)

  const content = protocol.content
  const cleanTitle = useMemo(
    () => cleanCompoundTitle(content.compound_name || protocol.title),
    [content.compound_name, protocol.title]
  )

  // Compute canonical protocol URL and purchase URL
  const [origin, setOrigin] = useState("https://pepstacklabs.com")
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setOrigin(window.location.origin)
    }
  }, [])

  const protocolUrl = `${origin}/${countryCode}/research-protocols/${protocol.handle}`
  const fallbackHandle = "products" in protocol && Array.isArray(protocol.products) ? protocol.products[0]?.handle : undefined
  const productHandle = matchedProduct?.handle || fallbackHandle
  const purchaseUrl = productHandle
    ? `${origin}/${countryCode}/products/${productHandle}`
    : protocolUrl

  // Primary QR target is the product purchase link if available, fallback to protocol URL
  const qrTargetUrl = purchaseUrl

  // Generate QR code data URL on mount or when URL changes
  useEffect(() => {
    let active = true
    setIsGeneratingQr(true)
    generateProtocolQrCode(qrTargetUrl, { width: 240, margin: 1 })
      .then((dataUrl) => {
        if (active) {
          setQrCodeDataUrl(dataUrl)
          setIsGeneratingQr(false)
        }
      })
      .catch(() => {
        if (active) setIsGeneratingQr(false)
      })
    return () => {
      active = false
    }
  }, [qrTargetUrl])

  // Extract quick reference values for email (case-insensitive and delimiter-agnostic)
  const getQuickRefValue = (targetKey: string) => {
    const normalized = targetKey.replace(/[_-]/g, "").toLowerCase()
    return (
      content.quick_reference?.find(
        (q) => q.key?.replace(/[_-]/g, "").toLowerCase() === normalized
      )?.value || null
    )
  }

  const solvent =
    content.reconstitution_details?.solvent ||
    getQuickRefValue("target_solvent")
  const diluentRatio = getQuickRefValue("diluent_ratio")
  const storage =
    content.storage_details?.reconstituted ||
    getQuickRefValue("liquid_stability")

  const mailtoUrl = useMemo(() => {
    return buildProtocolMailtoUrl({
      compoundName: cleanTitle,
      category: content.category,
      productFormat: content.product_format,
      purityStandard: content.purity_standard,
      solvent,
      diluentRatio,
      storage,
      summary: content.short_introduction || protocol.summary,
      protocolUrl,
      purchaseUrl: productHandle ? purchaseUrl : null,
    })
  }, [
    cleanTitle,
    content.category,
    content.product_format,
    content.purity_standard,
    solvent,
    diluentRatio,
    storage,
    content.short_introduction,
    protocol.summary,
    protocolUrl,
    productHandle,
    purchaseUrl,
  ])

  // 1-Click Copy Handler
  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(protocolUrl)
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea")
        textarea.value = protocolUrl
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: open modal
      setShowModal(true)
    }
  }

  // Native Web Share API with Modal fallback
  const handleShare = async () => {
    const shareData = buildProtocolShareData({
      title: protocol.title,
      compoundName: cleanTitle,
      summary: content.short_introduction || protocol.summary,
      url: protocolUrl,
    })

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(shareData)
        return
      } catch (err: unknown) {
        // If aborted/cancelled by user, do nothing. Otherwise fallback to modal
        if (err instanceof Error && err.name === "AbortError") {
          return
        }
      }
    }

    // Fallback: show share dialog with QR code and copy button
    setShowModal(true)
  }

  // Print Handlers
  const handleOpenPrintModal = () => {
    setShowPrintModal(true)
  }

  const handleExecutePrint = (presetToPrint?: PrintPreset) => {
    const target = presetToPrint || selectedPreset
    setSelectedPreset(target)
    onSelectPrintPreset?.(target)
    setShowPrintModal(false)
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.print()
      }
    }, 150)
  }

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2 print:hidden" role="toolbar" aria-label="Protocol Actions">
        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          title="Share protocol via link or QR code"
          aria-label="Share protocol"
        >
          <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share</span>
        </button>

        {/* Quick Copy Link (Mobile / Desktop) */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
            copied
              ? "border-emerald-600 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          }`}
          title="Copy direct protocol link"
          aria-label="Copy protocol link"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* Email Button */}
        <a
          href={mailtoUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          title="Compose email with protocol summary and purchase link"
          aria-label="Email protocol"
        >
          <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>Email</span>
        </a>

        {/* Print / Export PDF Button */}
        <button
          type="button"
          onClick={handleOpenPrintModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          title="Print or export protocol as PDF"
          aria-label="Print protocol"
        >
          <svg className="w-3.5 h-3.5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print / PDF</span>
        </button>
      </div>

      {/* Share & QR Code Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm print:hidden animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                QR
              </span>
              <h3 id="share-modal-title" className="text-base font-bold text-slate-900">
                Share {cleanTitle} Protocol
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Share verified reconstitution standards or scan to order reference material on mobile.
            </p>

            {/* QR Code Card */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 p-5 mb-5 text-center">
              {qrCodeDataUrl ? (
                <div className="relative rounded-lg bg-white p-2 border border-slate-200 shadow-2xs">
                  <Image
                    unoptimized
                    src={qrCodeDataUrl}
                    alt={`QR code for ${cleanTitle}`}
                    width={176}
                    height={176}
                    className="w-44 h-44 object-contain"
                  />
                </div>
              ) : isGeneratingQr ? (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                  Generating QR Code...
                </div>
              ) : null}
              <p className="text-xs font-bold text-slate-900 mt-3">
                {matchedProduct ? "Scan to Order in Catalog" : "Scan to Open Protocol on Mobile"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                {matchedProduct
                  ? "Point camera to purchase laboratory reference vials directly."
                  : "Point camera to open the full verified laboratory standard."}
              </p>
            </div>

            {/* Direct Link Input with 1-Click Copy */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Protocol Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={protocolUrl}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-2xs"
                  }`}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Modal Footer Secondary Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <a
                href={mailtoUrl}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email Summary</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setTimeout(handleOpenPrintModal, 200)
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytical PDF Export Preset Modal */}
      {showPrintModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm print:hidden animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="print-modal-title"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close export dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-800 text-xs font-bold">
                PDF
              </span>
              <h3 id="print-modal-title" className="text-base font-bold text-slate-900">
                Export Analytical Protocol Dossier
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select your publication preset for <strong>{cleanTitle}</strong>. Formatted strictly for analytical laboratory research standards.
            </p>

            {/* 3 Preset Option Cards */}
            <div className="space-y-2.5 mb-5">
              {/* Preset A: Full Monograph */}
              <div
                onClick={() => setSelectedPreset("full")}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedPreset === "full"
                    ? "border-sky-600 bg-sky-50/60 ring-1 ring-sky-600"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📄</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Complete Analytical Monograph
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Comprehensive dossier with molecular identity, volumetric math, vector syringe/atomizer graphics, titration ladder, storage degradation kinetics, and QA sign-off block.
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    2–4 Pages
                  </span>
                </div>
              </div>

              {/* Preset B: Laminated Benchtop SOP */}
              <div
                onClick={() => setSelectedPreset("bench_sop")}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedPreset === "bench_sop"
                    ? "border-sky-600 bg-sky-50/60 ring-1 ring-sky-600"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🧪</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Laminated Benchtop SOP Card
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        High-contrast laminar hood reference card. Includes exact reconstitution dilution volumes, vector instrument fill mark, and 4-step clean-bench SOP.
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    Strictly 1 Page
                  </span>
                </div>
              </div>

              {/* Preset C: Titration & Supply BOM */}
              <div
                onClick={() => setSelectedPreset("schedule_bom")}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedPreset === "schedule_bom"
                    ? "border-sky-600 bg-sky-50/60 ring-1 ring-sky-600"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📊</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Titration &amp; Reagents BOM Schedule
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Multi-week clinical assay escalation timetable, synchronized 7-day administration grid, and reagent inventory procurement BOM ledger.
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    Strictly 1 Page
                  </span>
                </div>
              </div>
            </div>

            {/* Print Optimization Tip Banner */}
            <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-3 mb-5 text-[11px] text-sky-950 flex items-start gap-2">
              <span className="text-base shrink-0 mt-0.5">💡</span>
              <div>
                <span className="font-bold block text-sky-900">Recommended Browser Print Settings:</span>
                <span className="text-sky-800">
                  Destination: <strong>Save as PDF</strong> · Margins: <strong>Default or None</strong> · Enable <strong>Background graphics</strong> to render calibrated vector fill levels.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer order-last sm:order-first"
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    downloadProtocolPdf(protocol, selectedPreset)
                    setShowPrintModal(false)
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex-1 sm:flex-none"
                  title="Download publication-grade vector PDF binary"
                >
                  <span>📥</span>
                  <span>Download PDF (.pdf)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open(
                        `/${countryCode}/research-protocols/${protocol.handle}/dossier?preset=${selectedPreset}&autoprint=true`,
                        "_blank"
                      )
                    }
                    setShowPrintModal(false)
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex-1 sm:flex-none"
                  title="Open standalone protocol document in new window"
                >
                  <span>↗</span>
                  <span>Print View (New Window)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecutePrint()}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex-1 sm:flex-none"
                  title="Print in current tab"
                >
                  <svg className="w-3.5 h-3.5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Quick Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
