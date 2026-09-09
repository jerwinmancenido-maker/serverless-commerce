"use client"

import { ProtocolCalculator } from "./calculator"
import ProtocolActionToolbar from "./protocol-action-toolbar"
import type { CustomerResearchProtocol, StoreResearchProtocol } from "@lib/data/research-protocols"
import { cleanCompoundTitle, generateProtocolQrCode } from "@lib/protocol-sharing"
import { formatPeptideDosage } from "@lib/research-quantity"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

function renderFormattedText(text?: string | null) {
  if (!text) return null
  const parts = text.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

function renderCitationItem(title: string, url?: string | null, notes?: string | null) {
  const pmidMatch = (title || "").match(/PMID:\s*(\d+)/i) || (url || "").match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i)
  const targetUrl = url || (pmidMatch ? `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/` : null)
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs leading-relaxed">
      <div className="flex items-start justify-between gap-2 font-semibold text-slate-900">
        <div className="flex items-start gap-1.5">
          <span className="text-slate-400 mt-0.5">🔗</span>
          {targetUrl ? (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <span>{title}</span>
              <span className="text-[10px] text-emerald-600 font-normal">↗ PubMed</span>
            </a>
          ) : (
            <span>{title}</span>
          )}
        </div>
        {pmidMatch ? (
          <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800 border border-emerald-200">
            PMID: {pmidMatch[1]}
          </span>
        ) : null}
      </div>
      {notes ? <div className="mt-1 text-slate-600 text-[11px] pl-5">{notes}</div> : null}
    </div>
  )
}

type ProtocolTab =
  | "all"
  | "monograph"
  | "molecular"
  | "reconstitution"
  | "titration"
  | "benefits"
  | "safety"
  | "storage_citations"

const PROTOCOL_TABS: { key: ProtocolTab; label: string; icon: string }[] = [
  { key: "all", label: "Full Protocol", icon: "📋" },
  { key: "monograph", label: "Monograph & Mechanism", icon: "📖" },
  { key: "molecular", label: "Molecular Specs", icon: "🔬" },
  { key: "reconstitution", label: "Reconstitution SOP", icon: "💧" },
  { key: "titration", label: "Titration Schedule", icon: "📊" },
  { key: "benefits", label: "Investigated Endpoints", icon: "✓" },
  { key: "safety", label: "Safety & Handling", icon: "⚠" },
  { key: "storage_citations", label: "Storage & Citations", icon: "📚" },
]

export default function FullProtocol({
  protocol,
  showCatalogProduct = false,
  matchedProducts = [],
  backLink,
  badgeText,
  countryCode = "ph",
}: {
  protocol: CustomerResearchProtocol | StoreResearchProtocol
  showCatalogProduct?: boolean
  matchedProducts?: HttpTypes.StoreProduct[]
  backLink?: { href: string; label: string }
  badgeText?: string
  countryCode?: string
}) {
  const content = protocol.content
  const isBlend = content.protocol_category_type === "blend"
  const isBundle =
    content.protocol_category_type === "bundle" ||
    Boolean(content.bundle_vials && content.bundle_vials.length > 0)
  const isTopical =
    content.protocol_category_type === "topical" ||
    (protocol.handle || "").includes("serum")
  const isSupply =
    content.category?.toLowerCase().includes("supply") ||
    content.category?.toLowerCase().includes("diluent") ||
    content.product_format?.toLowerCase().includes("consumable")

  const isIncretin = useMemo(() => {
    const h = (protocol.handle || "").toLowerCase()
    const n = (content.compound_name || protocol.title || "").toLowerCase()
    const c = (content.category || "").toLowerCase()
    return (
      h.includes("tirzepatide") ||
      h.includes("semaglutide") ||
      h.includes("retatrutide") ||
      h.includes("cagrilintide") ||
      n.includes("tirzepatide") ||
      n.includes("semaglutide") ||
      n.includes("retatrutide") ||
      n.includes("cagrilintide") ||
      (c.includes("incretin") && !h.includes("aod") && !h.includes("5-amino"))
    )
  }, [protocol.handle, content.compound_name, protocol.title, content.category])

  const isHmg = useMemo(() => {
    const h = (protocol.handle || "").toLowerCase()
    const n = (content.compound_name || protocol.title || "").toLowerCase()
    return h.includes("hmg") || n.includes("hmg")
  }, [protocol.handle, content.compound_name, protocol.title])

  const quickReference = content.quick_reference || []
  const protocolLevels = content.protocol_levels || []
  const referenceQuantities = content.reference_quantities || []
  const sections = content.sections || []
  const faqs = content.faqs || []
  const references = content.references || []

  const cleanTitle = useMemo(
    () => cleanCompoundTitle(content.compound_name || protocol.title),
    [content.compound_name, protocol.title]
  )

  const [origin, setOrigin] = useState("https://pepstacklabs.com")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ProtocolTab>("all")
  const [copiedSequence, setCopiedSequence] = useState(false)

  // Reconstitution Presets & Vial Strength State
  const initialVialMg = content.reconstitution_details?.default_vial_net_mg || (isHmg ? 75 : 10)
  const initialDiluentMl = content.reconstitution_details?.default_diluent_ml || (isHmg ? 1.0 : 2.0)
  const initialConc = content.reconstitution_details?.resulting_concentration_mg_per_ml || (isHmg ? 75 : 5.0)

  const reconOptions = useMemo(
    () => content.reconstitution_options || {},
    [content.reconstitution_options]
  )
  const reconKeys = Object.keys(reconOptions)
  const defaultPresetKey = reconKeys.length > 0 ? reconKeys[0] : null

  const vialStrengthOptions = useMemo(
    () => content.vial_strength_options || [],
    [content.vial_strength_options]
  )

  const [selectedReconPreset, setSelectedReconPreset] = useState<string | null>(defaultPresetKey)
  const [selectedVialMg, setSelectedVialMg] = useState<number | null>(
    vialStrengthOptions.length > 0
      ? (vialStrengthOptions[1]?.vialMg || vialStrengthOptions[0]?.vialMg)
      : initialVialMg
  )

  // Dynamic Stoichiometric Metrics
  const activeMetrics = useMemo(() => {
    let mass = selectedVialMg || initialVialMg
    let diluent = initialDiluentMl
    let conc = initialConc
    let tick = `1 unit = ${
      conc * 10 >= 1000
        ? (conc * 10 / 1000).toFixed(1) + " mg"
        : (conc * 10).toFixed(1) + " mcg"
    } (0.01 mL)`

    if (selectedVialMg && vialStrengthOptions.length > 0) {
      const vOpt = vialStrengthOptions.find((v) => v.vialMg === selectedVialMg)
      if (vOpt) {
        mass = vOpt.vialMg
        diluent = vOpt.diluentMl
        conc = vOpt.concMgMl
        const perUnit = conc * 10
        tick = `1 unit = ${
          perUnit >= 1000 ? (perUnit / 1000).toFixed(1) + " mg" : perUnit.toFixed(1) + " mcg"
        } (0.01 mL)`
      }
    } else if (selectedReconPreset && reconOptions[selectedReconPreset]) {
      const rOpt = reconOptions[selectedReconPreset]
      diluent = rOpt.diluentMl
      conc = rOpt.concMgMl
      tick = rOpt.tickConversion || `1 unit = ${(conc * 10).toFixed(1)} mcg (0.01 mL)`
    }

    return { mass, diluent, conc, tick }
  }, [
    selectedVialMg,
    selectedReconPreset,
    initialVialMg,
    initialDiluentMl,
    initialConc,
    vialStrengthOptions,
    reconOptions,
  ])

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setOrigin(window.location.origin)
    }
  }, [])

  const matchedProduct = matchedProducts?.[0]
  const fallbackHandle =
    "products" in protocol && Array.isArray(protocol.products)
      ? protocol.products[0]?.handle
      : undefined
  const fallbackThumbnail =
    "products" in protocol && Array.isArray(protocol.products)
      ? protocol.products[0]?.thumbnail
      : undefined
  const productHandle = matchedProduct?.handle || fallbackHandle
  const productThumbnail = matchedProduct?.thumbnail || fallbackThumbnail
  const protocolUrl = `${origin}/${countryCode}/research-protocols/${protocol.handle}`
  const orderUrl = productHandle
    ? `${origin}/${countryCode}/products/${productHandle}`
    : protocolUrl

  useEffect(() => {
    generateProtocolQrCode(orderUrl, { width: 220, margin: 1 })
      .then(setQrCodeDataUrl)
      .catch(() => setQrCodeDataUrl(null))
  }, [orderUrl])

  const handleCopySequence = (seq: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(seq).then(() => {
        setCopiedSequence(true)
        setTimeout(() => setCopiedSequence(false), 2000)
      })
    }
  }

  const isVisible = (tab: ProtocolTab) => activeTab === "all" || activeTab === tab
  const getTabClass = (tab: ProtocolTab) => (isVisible(tab) ? "block" : "hidden print:block")

  return (
    <div>
      {/* ── Print-Only Laboratory Letterhead ── */}
      <div className="hidden print:flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-3 print-header">
        <div className="flex items-start gap-3.5">
          {productThumbnail ? (
            <div className="w-16 h-16 rounded border border-slate-300 overflow-hidden shrink-0 bg-white p-0.5 flex items-center justify-center">
              <Image
                unoptimized
                src={productThumbnail}
                alt={cleanTitle}
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-slate-900 uppercase">
                PEPSTACK LABS
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest border-l border-slate-300 pl-2">
                ANALYTICAL REFERENCE DOSSIER
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{cleanTitle}</h1>
            <p className="text-xs text-slate-600 mt-0.5 font-mono">
              Revision {protocol.revision} · {content.product_format || "Lyophilized Solid Powder"}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Category: {content.category || "Research Compound"} · Canonical Ref: {protocol.handle}
            </p>
          </div>
        </div>

        {/* QR Code in Print Header */}
        <div className="flex flex-col items-center text-center pl-3 border-l border-slate-200 shrink-0">
          {qrCodeDataUrl ? (
            <Image
              unoptimized
              src={qrCodeDataUrl}
              alt={`Scan to purchase ${cleanTitle}`}
              width={84}
              height={84}
              className="w-[84px] h-[84px] border border-slate-300 p-0.5 rounded bg-white"
            />
          ) : (
            <div className="w-[84px] h-[84px] border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400">
              QR Code
            </div>
          )}
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-800 mt-0.5">
            Scan to Purchase
          </span>
          <span className="text-[7px] text-slate-500 font-mono">pepstacklabs.com</span>
        </div>
      </div>

      {backLink ? (
        <div className="mb-5 flex items-center justify-between print:hidden">
          <LocalizedClientLink
            href={backLink.href}
            className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
          >
            {backLink.label}
          </LocalizedClientLink>
          <span className="text-xs text-slate-400 font-mono">Protocol: {protocol.handle}</span>
        </div>
      ) : null}

      {/* Screen Hero Card (Hidden in Print to prevent duplicate header) */}
      <header className="rounded-xl border border-ui-border-base bg-white p-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-interactive">
            {badgeText || "Current Protected Protocol"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {content.evidence_tier ? (
              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-0.5 text-xs font-bold inline-flex items-center gap-1">
                <span>🛡️</span> {content.evidence_tier}
              </span>
            ) : null}
            {isSupply ? (
              <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-0.5 text-xs font-bold inline-flex items-center gap-1">
                <span>📦</span> Laboratory Consumable
              </span>
            ) : isBundle ? (
              <span className="rounded-full bg-purple-50 text-purple-800 border border-purple-200 px-3 py-0.5 text-xs font-bold inline-flex items-center gap-1">
                <span>📦</span> Multi-Compound Research Bundle
              </span>
            ) : isTopical ? (
              <span className="rounded-full bg-rose-50 text-rose-800 border border-rose-200 px-3 py-0.5 text-xs font-bold inline-flex items-center gap-1">
                <span>✨</span> Topical Cosmetic Formulation
              </span>
            ) : isBlend ? (
              <span className="rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-0.5 text-xs font-bold inline-flex items-center gap-1">
                <span>🧬</span> Multi-Peptide Blend
              </span>
            ) : (
              <span className="rounded-full bg-teal-50 text-teal-800 border border-teal-200 px-3 py-0.5 text-xs font-bold inline-flex items-center gap-1">
                <span>🧪</span> Single Peptide
              </span>
            )}
          </div>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          {content.compound_name || protocol.title}
        </h1>
        <p className="mt-2 text-sm text-ui-fg-subtle">
          Revision {protocol.revision}
          {content.product_format ? ` · ${content.product_format}` : ""}
        </p>
        {content.short_introduction ? (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-ui-fg-subtle">
            {content.short_introduction}
          </p>
        ) : null}

        {/* Action Toolbar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 print:hidden">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            In-Vitro Reference Standard · Verified Stoichiometry
          </div>
          <ProtocolActionToolbar
            protocol={protocol}
            matchedProduct={matchedProduct}
            countryCode={countryCode}
          />
        </div>
      </header>

      {/* ── 7-Tab Clinical Navigation Bar (Screen Only) ── */}
      {!isSupply ? (
        <nav className="mt-6 print:hidden border-b border-slate-200 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max pb-2.5">
            {PROTOCOL_TABS.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      ) : null}

      {/* ══════════════════════════════════════════════════ */}
      {/* SUPPLY / HARDWARE SPECIAL SPECIFICATION            */}
      {/* ══════════════════════════════════════════════════ */}
      {isSupply ? (
        <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5">
            <h2 className="text-xl print:text-xs font-semibold print:font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>📦</span> Laboratory Consumable Specification
            </h2>
            <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
              Analytical Supply
            </span>
          </div>
          <p className="mt-4 print:mt-1.5 text-sm print:text-[10px] leading-relaxed text-slate-700">
            {content.full_description ||
              content.short_introduction ||
              "Standard laboratory hardware, consumable, or diluent supplied to support aseptic research procedures."}
          </p>
          {content.reconstitution_details?.solvent ? (
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-800 space-y-1.5">
              <div>
                <strong>Solvent / Diluent Standard:</strong> {content.reconstitution_details.solvent}
              </div>
              <div>
                <strong>Transfer Guidance:</strong>{" "}
                {content.reconstitution_details.dissolution_method || "Aseptic transfer standard."}
              </div>
            </div>
          ) : null}
          {content.reconstitution_details?.handling_rule ? (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <span className="font-bold text-amber-600 mt-0.5">ℹ</span>
              <div>{content.reconstitution_details.handling_rule}</div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB 1: MONOGRAPH & MECHANISM                       */}
      {/* ══════════════════════════════════════════════════ */}
      <div className={getTabClass("monograph")}>
        {/* Pharmacological Profile & Monograph */}
        {content.full_description ? (
          <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold text-slate-900 uppercase tracking-wide">
                Pharmacological Profile &amp; Monograph
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                Research Monograph
              </span>
            </div>
            <div className="mt-4 print:mt-1.5 space-y-3 print:space-y-1.5 text-sm print:text-[10px] leading-relaxed print:leading-snug text-slate-700">
              {content.full_description
                .split(/(?:\r?\n|\\n)\s*(?:\r?\n|\\n)/)
                .map((para, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {renderFormattedText(para)}
                  </p>
                ))}
            </div>
          </section>
        ) : null}

        {/* Synergistic Blend Constituents (If Multi-Peptide Blend) */}
        {content.blend_constituents && content.blend_constituents.length > 0 ? (
          <section className="mt-6 print:mt-2.5 rounded-xl border border-purple-200 bg-purple-50/40 p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-purple-200 pb-3 print:pb-1.5 mb-4 print:mb-2">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold text-purple-950 uppercase tracking-wide flex items-center gap-2">
                <span>🧬</span> Synergistic Blend Constituents ({content.blend_constituents.length} Active Peptides)
              </h2>
              <span className="rounded-full bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                Stoichiometric Blend
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:gap-1.5">
              {content.blend_constituents.map((constituent, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-purple-200 bg-white p-3.5 print:p-2 shadow-2xs"
                >
                  <div className="font-bold text-purple-950 text-sm print:text-xs">
                    {constituent.name}
                  </div>
                  <div className="text-xs print:text-[10px] font-mono text-purple-700 font-semibold mt-1">
                    {constituent.ratioMg} mg per vial ({constituent.percentageOfTotal}% total mass)
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Multi-Vial Bundle Constituents (If Multi-Compound Stack) */}
        {content.bundle_vials && content.bundle_vials.length > 0 ? (
          <section className="mt-6 print:mt-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-3 print:pb-1.5 mb-4 print:mb-2">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-2">
                <span>📦</span> Multi-Vial Research Stack ({content.bundle_vials.length} Separate Physical Vials)
              </h2>
              <span className="rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                Individual Vial Reconstitution
              </span>
            </div>
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 font-medium leading-relaxed">
              ⚠️ <strong>Clinical Handling Rule:</strong> Each constituent vial must be reconstituted separately in its own designated sterile Bacteriostatic Water volume. Do NOT combine dry lyophilized cakes or mix reconstituted solutions into a single vial.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:gap-1.5">
              {content.bundle_vials.map((vial, idx) => (
                <div key={idx} className="rounded-lg border border-indigo-200 bg-white p-4 print:p-2 shadow-2xs">
                  <div className="font-bold text-indigo-950 text-sm print:text-xs">
                    {vial.compoundName}
                  </div>
                  <div className="mt-2.5 space-y-1.5 text-xs print:text-[10px] text-slate-600">
                    <div className="flex justify-between"><span className="font-semibold text-slate-700">Net Mass:</span> <span className="font-mono font-bold text-indigo-900">{vial.vialNetMass}</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-slate-700">Diluent:</span> <span className="font-mono text-slate-800">{vial.diluentMl} mL BAC Water</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-slate-700">Concentration:</span> <span className="font-mono font-bold text-emerald-800">{vial.concMgMl} mg/mL</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-slate-700">Standard Dose:</span> <span className="font-mono text-slate-800">{vial.targetDose}</span></div>
                    <div className="flex justify-between border-t border-slate-100 pt-1 mt-1"><span className="font-semibold text-slate-700">Syringe Mark:</span> <span className="font-mono font-bold text-slate-900">{vial.syringeUnits}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB 2: MOLECULAR SPECS & HPLC PURITY               */}
      {/* ══════════════════════════════════════════════════ */}
      <div className={getTabClass("molecular")}>
        {content.molecular_details &&
        (content.molecular_details.cas_number ||
          content.molecular_details.pubchem_cid ||
          content.molecular_details.sequence_or_formula ||
          content.molecular_details.molecular_weight_g_per_mol) ? (
          <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold text-slate-900 uppercase tracking-wide">
                Physicochemical Specifications &amp; Analytical Verification
              </h2>
              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                {content.purity_standard || "Purity ≥99.0% (HPLC)"}
              </span>
            </div>
            <div className="mt-4 print:mt-1.5 grid gap-3 print:gap-1.5 grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 print:grid-cols-3 text-xs print:text-[10px]">
              <div className="p-3.5 print:p-1.5 rounded-lg bg-ui-bg-subtle print:bg-slate-50 print:border print:border-slate-200">
                <span className="text-ui-fg-muted print:text-slate-500 uppercase font-bold text-[10px] print:text-[8px] block">
                  CAS Number
                </span>
                <span className="font-mono font-bold text-sm print:text-[11px] text-ui-fg-base mt-1 print:mt-0.5 block">
                  {content.molecular_details.cas_number || "Analytical Standard"}
                </span>
              </div>
              <div className="p-3.5 print:p-1.5 rounded-lg bg-ui-bg-subtle print:bg-slate-50 print:border print:border-slate-200">
                <span className="text-ui-fg-muted print:text-slate-500 uppercase font-bold text-[10px] print:text-[8px] block">
                  PubChem CID
                </span>
                <span className="font-mono font-bold text-sm print:text-[11px] text-ui-fg-base mt-1 print:mt-0.5 block">
                  {content.molecular_details.pubchem_cid ? (
                    <a
                      href={`https://pubchem.ncbi.nlm.nih.gov/#query=${content.molecular_details.pubchem_cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      CID {content.molecular_details.pubchem_cid} ↗
                    </a>
                  ) : (
                    "Referenced Standard"
                  )}
                </span>
              </div>
              <div className="p-3.5 print:p-1.5 rounded-lg bg-ui-bg-subtle print:bg-slate-50 print:border print:border-slate-200">
                <span className="text-ui-fg-muted print:text-slate-500 uppercase font-bold text-[10px] print:text-[8px] block">
                  Molecular Weight
                </span>
                <span className="font-mono font-bold text-sm print:text-[11px] text-ui-fg-base mt-1 print:mt-0.5 block">
                  {content.molecular_details.molecular_weight_g_per_mol
                    ? `${content.molecular_details.molecular_weight_g_per_mol} g/mol`
                    : "Analytical Standard"}
                </span>
              </div>
            </div>

            {/* Sequence with 1-Click Copy */}
            {content.molecular_details.sequence_or_formula ? (
              <div className="mt-4 print:mt-2 p-4 print:p-2 rounded-lg bg-slate-900 print:bg-slate-50 text-slate-100 print:text-slate-900 font-mono text-xs print:text-[10px] print:border print:border-slate-200">
                <div className="flex items-center justify-between mb-2 print:mb-0">
                  <span className="text-[11px] print:text-[8px] text-emerald-400 print:text-slate-700 font-bold uppercase tracking-wider">
                    Primary Sequence / Chemical Formula
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopySequence(content.molecular_details?.sequence_or_formula || "")
                    }
                    className="print:hidden px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-emerald-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedSequence ? "✓ Copied!" : "Copy Sequence"}
                  </button>
                </div>
                <div className="select-all font-mono break-all text-emerald-100 print:text-slate-900 text-xs">
                  {content.molecular_details.sequence_or_formula}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      {/* Quick Reference Cards (Shown on all, monograph, or reconstitution) */}
      {(activeTab === "all" || activeTab === "monograph" || activeTab === "reconstitution") &&
      quickReference.length ? (
        <section className="mt-6 print:mt-2.5 grid gap-3 print:gap-2 small:grid-cols-2 large:grid-cols-3 print:grid-cols-3 print-break-inside-avoid">
          {quickReference.map((item) => (
            <article
              key={item.key}
              className="rounded-xl border border-ui-border-base bg-white p-5 print:p-2.5 print:border-slate-300"
            >
              <p className="text-xs print:text-[9px] font-semibold uppercase tracking-wide text-ui-fg-subtle print:text-slate-600">
                {item.label}
              </p>
              <p className="mt-2 print:mt-0.5 text-lg print:text-xs font-semibold text-slate-900">
                {item.value}
              </p>
              {item.description ? (
                <p className="mt-2 print:mt-0.5 text-sm print:text-[9.5px] text-ui-fg-subtle print:text-slate-600">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB 3: RECONSTITUTION SOP & SYRINGE CALCULATOR     */}
      {/* ══════════════════════════════════════════════════ */}
      <div className={getTabClass("reconstitution")}>
        {/* Interactive Reconstitution Calculator (Screen Only) */}
        {content.calculator && content.calculator.enabled ? (
          <div className="mt-8 print:hidden">
            <ProtocolCalculator configuration={content.calculator} />
          </div>
        ) : null}

        {/* Stoichiometric Reconstitution & Syringe Calibration Matrix */}
        {content.reconstitution_details ? (
          <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3 mb-4 print:pb-1.5 print:mb-2">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wider text-slate-900">
                {isTopical
                  ? "Formulation, Dropper Pipette Calibration & Dispensing Standard"
                  : isBundle
                  ? "Multi-Vial Preparation Station & Reconstitution Matrix"
                  : "Preparation, Reconstitution & Syringe Calibration Matrix"}
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                {isTopical ? "Cosmetic Standard" : "Analytical Reference Standard"}
              </span>
            </div>

            {/* Multi-Vial Preparation Station (If Multi-Compound Bundle) */}
            {content.bundle_vials && content.bundle_vials.length > 0 ? (
              <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 print:p-3 print:border-slate-300">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-2.5 mb-3">
                  <h3 className="text-sm print:text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-2">
                    <span>📦</span> Multi-Vial Preparation Station ({content.bundle_vials.length} Individual Constituent Vials)
                  </h3>
                  <span className="rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase">
                    Step-by-Step Reconstitution
                  </span>
                </div>
                <div className="mb-3 rounded-lg bg-amber-50 border border-amber-300 p-2.5 text-xs text-amber-900 font-medium">
                  ⚠️ <strong>Aseptic Separation Rule:</strong> Each constituent vial must be reconstituted separately in its own designated sterile Bacteriostatic Water volume. Do NOT combine dry lyophilized cakes or mix reconstituted solutions into a single vial.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:gap-1.5">
                  {content.bundle_vials.map((vial, idx) => (
                    <div key={idx} className="rounded-lg border border-indigo-200 bg-white p-3.5 print:p-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                        <span className="text-[11px] font-bold uppercase text-indigo-700">Vial #{idx + 1}</span>
                        <span className="text-xs font-mono font-bold text-slate-900">{vial.vialNetMass}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs mb-2">{vial.compoundName}</div>
                      <div className="space-y-1 text-xs print:text-[10px] text-slate-600">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700">Diluent to Add:</span>
                          <span className="font-mono font-bold text-blue-700">{vial.diluentMl} mL BAC Water</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700">Concentration:</span>
                          <span className="font-mono font-bold text-emerald-700">{vial.concMgMl} mg/mL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700">Target Dose:</span>
                          <span className="font-mono text-slate-800">{vial.targetDose}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                          <span className="font-semibold text-slate-700">Syringe Mark:</span>
                          <span className="font-mono font-bold text-indigo-900">{vial.syringeUnits}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Multi-Vial Strength Presets Selector (Screen Only) */}
            {vialStrengthOptions.length > 0 ? (
              <div className="mb-5 print:hidden">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Select Vial Strength &amp; Volume Configuration:
                </div>
                <div className="flex flex-wrap gap-2">
                  {vialStrengthOptions.map((v, i) => {
                    const isSelected = selectedVialMg === v.vialMg
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedVialMg(v.vialMg)
                          setSelectedReconPreset(null)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                        }`}
                      >
                        {v.badge} ({v.vialMg}mg / {v.diluentMl}mL)
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {/* Dual Reconstitution Presets Selector (Screen Only) */}
            {reconKeys.length > 0 ? (
              <div className="mb-5 print:hidden">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Dual Reconstitution Standard ({activeMetrics.mass} mg Vial):
                </div>
                <div className="flex flex-wrap gap-2">
                  {reconKeys.map((k) => {
                    const isSelected = selectedReconPreset === k
                    const opt = reconOptions[k]
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => {
                          setSelectedReconPreset(k)
                          setSelectedVialMg(null)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-700 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {/* Stoichiometric Laboratory Protocol Flow Diagram (4 Cards) */}
            <div className="mb-6 print:mb-3">
              <div className="text-xs print:text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2 print:mb-1">
                {isTopical
                  ? "Topical Cosmetic Dispensing & Application Flow"
                  : "Stoichiometric Laboratory Protocol Flow"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 print:grid-cols-4 gap-2 print:gap-1.5 text-center">
                {isTopical ? (
                  <>
                    {/* Step 1 Topical */}
                    <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                      <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-rose-100 text-rose-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                        🧴
                      </div>
                      <span className="font-semibold text-slate-800 text-xs print:text-[9px]">
                        1. Liquid Formulation
                      </span>
                      <span className="text-[11px] print:text-[8px] font-mono text-slate-600 mt-0.5 font-bold">
                        50 mL Ready-to-Use
                      </span>
                      <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">
                        Pre-dissolved matrix
                      </span>
                    </div>

                    {/* Step 2 Topical */}
                    <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                      <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-blue-100 text-blue-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                        💧
                      </div>
                      <span className="font-semibold text-slate-800 text-xs print:text-[9px]">
                        2. Dropper Pipette
                      </span>
                      <span className="text-[11px] print:text-[8px] font-mono text-slate-600 mt-0.5 font-bold">
                        1.0 mL Calibrated
                      </span>
                      <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">
                        ~0.05 mL per drop
                      </span>
                    </div>

                    {/* Step 3 Topical */}
                    <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                      <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-indigo-100 text-indigo-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                        🔄
                      </div>
                      <span className="font-semibold text-slate-800 text-xs print:text-[9px]">
                        3. Homogenization
                      </span>
                      <span className="text-[11px] print:text-[8px] font-mono font-bold text-slate-900 mt-0.5">
                        10.0 mg/mL Active
                      </span>
                      <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">
                        Invert bottle 3–5x
                      </span>
                    </div>

                    {/* Step 4 Topical */}
                    <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                      <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-amber-100 text-amber-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                        ✨
                      </div>
                      <span className="font-semibold text-slate-800 text-xs print:text-[9px]">
                        4. Dermal Dispense
                      </span>
                      <span className="text-[11px] print:text-[8px] font-mono text-slate-600 mt-0.5">
                        Target facial field
                      </span>
                      <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5 font-mono font-bold">
                        10–20 drops (0.5–1 mL)
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Step 1 Injection */}
                    <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                      <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-teal-100 text-teal-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                        🧪
                      </div>
                      <span className="font-semibold text-slate-800 text-xs print:text-[9px]">
                        1. Lyophilized Cake
                      </span>
                      <span className="text-[11px] print:text-[8px] font-mono text-slate-600 mt-0.5 font-bold">
                        {activeMetrics.mass} {isHmg ? "IU" : "mg"} Active Mass
                      </span>
                      <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">
                        Vacuum-sealed vial
                      </span>
                    </div>

                    {/* Step 2 Injection */}
                    <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                      <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-blue-100 text-blue-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                        💧
                      </div>
                      <span className="font-semibold text-slate-800 text-xs print:text-[9px]">
                        2. Aseptic Diluent
                      </span>
                      <span className="text-[11px] print:text-[8px] font-mono text-slate-600 mt-0.5 font-bold">
                        {activeMetrics.diluent.toFixed(1)} mL Diluent
                      </span>
                      <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">
                        Slowly down vial wall
                      </span>
                    </div>

                    {/* Step 3 Injection */}
                    <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                      <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-indigo-100 text-indigo-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                        🔬
                      </div>
                      <span className="font-semibold text-slate-800 text-xs print:text-[9px]">
                        3. Reconstituted Solution
                      </span>
                      <span className="text-[11px] print:text-[8px] font-mono font-bold text-slate-900 mt-0.5">
                        {activeMetrics.conc.toFixed(activeMetrics.conc < 0.1 ? 3 : 1)}{" "}
                        {isHmg ? "IU/mL" : "mg/mL"}
                      </span>
                      <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">
                        Gentle circular swirl
                      </span>
                    </div>

                    {/* Step 4 Injection */}
                    <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                      <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-amber-100 text-amber-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                        💉
                      </div>
                      <span className="font-semibold text-slate-800 text-xs print:text-[9px]">
                        4. Calibrated Draw
                      </span>
                      <span className="text-[11px] print:text-[8px] font-mono text-slate-600 mt-0.5">
                        U-100 (100 units = 1.0 mL)
                      </span>
                      <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5 font-mono font-bold">
                        {activeMetrics.tick}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Reference Table */}
            <table className="w-full text-left text-xs print:text-[10px] border border-slate-200">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700 w-1/3">
                    {isTopical ? "Active Compound Strength" : "Standard Compound Mass"}
                  </td>
                  <td className="py-2 px-3 print:py-1 print:px-2 font-mono text-slate-900">
                    {activeMetrics.mass} {isHmg ? "IU" : "mg"} active {isTopical ? "per 50 mL bottle" : "per vial"}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">
                    {isTopical ? "Formulation Solvent Base" : "Recommended Diluent"}
                  </td>
                  <td className="py-2 px-3 print:py-1 print:px-2 text-slate-900">
                    {content.reconstitution_details.solvent ||
                      "Bacteriostatic Water USP (0.9% Benzyl Alcohol)"}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">
                    {isTopical ? "Bottle Net Volume" : "Diluent Volume Added"}
                  </td>
                  <td className="py-2 px-3 print:py-1 print:px-2 font-mono text-slate-900">
                    {activeMetrics.diluent.toFixed(1)} mL
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">
                    Resulting Concentration
                  </td>
                  <td className="py-2 px-3 print:py-1 print:px-2 font-mono font-bold text-slate-900">
                    {activeMetrics.conc.toFixed(activeMetrics.conc < 0.1 ? 3 : 1)}{" "}
                    {isHmg ? "IU/mL" : "mg/mL"}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">
                    {isTopical ? "Dispenser Calibration" : "Syringe Volumetric Scale"}
                  </td>
                  <td className="py-2 px-3 print:py-1 print:px-2 text-slate-900 font-mono">
                    {isTopical
                      ? "Calibrated Cosmetic Dropper Pipette (0.05 mL / drop | 20 drops = 1.0 mL)"
                      : `U-100 Syringe (100 units = 1.0 mL | ${activeMetrics.tick})`}
                  </td>
                </tr>
                {content.reconstitution_details.handling_rule ? (
                  <tr>
                    <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">
                      Handling Rule
                    </td>
                    <td className="py-2 px-3 print:py-1 print:px-2 text-slate-800">
                      {content.reconstitution_details.handling_rule}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            {/* Dynamic Calibration / Graduation Table */}
            {content.syringe_guide && content.syringe_guide.graduations?.length ? (
              <div className="mt-6 print:mt-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 print:pb-1 print:mb-1.5">
                  <h3 className="text-xs print:text-[9px] font-bold uppercase tracking-wider text-slate-900">
                    {content.syringe_guide.syringeType || (isTopical ? "Calibrated Cosmetic Dropper Pipette Table" : "U-100 Insulin Syringe Calibration Table")}
                  </h3>
                  {content.syringe_guide.standardIUDisplay ? (
                    <span className="text-xs print:text-[8px] font-mono font-bold text-teal-700">
                      Target: {content.syringe_guide.standardIUDisplay}
                    </span>
                  ) : null}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs print:text-[8.5px] border border-slate-200">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                        <th className="py-2 px-3 print:py-1">Research Dose</th>
                        <th className="py-2 px-3 print:py-1">Calibrated Volume</th>
                        <th className="py-2 px-3 print:py-1">{isTopical ? "Dropper Scale" : "U-100 Syringe Units"}</th>
                        <th className="py-2 px-3 print:py-1">Graduation Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                      {content.syringe_guide.graduations.map((g, idx) => {
                        let vol = g.volumeMl
                        let units = g.syringeIU
                        if (activeMetrics.conc > 0) {
                          const iuMatch = g.doseDisplay.match(/(\d+(?:\.\d+)?)\s*iu/i)
                          if (isHmg && iuMatch) {
                            const iuDose = parseFloat(iuMatch[1])
                            vol = Number((iuDose / activeMetrics.conc).toFixed(3))
                            units = Number(((iuDose / activeMetrics.conc) * 100).toFixed(1))
                          } else {
                            let doseVal = g.doseMcg
                            if (!doseVal) {
                              const match = g.doseDisplay.match(/(\d+(?:\.\d+)?)\s*(mcg|mg)/i)
                              if (match) {
                                const num = parseFloat(match[1])
                                const unit = match[2].toLowerCase()
                                doseVal = unit === "mg" ? num * 1000 : num
                              }
                            }
                            if (doseVal && !isHmg) {
                              vol = Number(((doseVal / 1000.0) / activeMetrics.conc).toFixed(3))
                              units = Number(
                                (((doseVal / 1000.0) / activeMetrics.conc) * 100).toFixed(1)
                              )
                            }
                          }
                        }
                        return (
                          <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/50" : ""}>
                            <td className="py-2 px-3 print:py-1 font-bold text-slate-900">
                              {g.doseDisplay}
                            </td>
                            <td className="py-2 px-3 print:py-1">{vol} mL</td>
                            <td className="py-2 px-3 print:py-1">
                              <span className="inline-block px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200">
                                {units} Units
                              </span>
                            </td>
                            <td className="py-2 px-3 print:py-1 font-sans text-slate-600">
                              {g.tickLabel || `Mark on U-100 syringe barrel (${vol} mL)`}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* If Incretin: Multi-Vial Net Content Matrix */}
            {isIncretin ? (
              <div className="mt-6 print:mt-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                  <h3 className="text-xs print:text-[9px] font-bold uppercase tracking-wider text-slate-900">
                    Multi-Vial Net Content &amp; Syringe Volumetric Matrix
                  </h3>
                  <span className="text-[10px] print:text-[8px] font-mono text-slate-500">
                    10mg · 15mg · 20mg · 30mg Formulations
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs print:text-[8.5px] border border-slate-200">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                        <th className="py-1.5 px-2 print:py-1">Vial Net Mass</th>
                        <th className="py-1.5 px-2 print:py-1">BAC Water</th>
                        <th className="py-1.5 px-2 print:py-1">Concentration</th>
                        <th className="py-1.5 px-2 print:py-1">2.5 mg Dose</th>
                        <th className="py-1.5 px-2 print:py-1">5.0 mg Dose</th>
                        <th className="py-1.5 px-2 print:py-1">7.5 mg Dose</th>
                        <th className="py-1.5 px-2 print:py-1">10.0 mg Dose</th>
                        <th className="py-1.5 px-2 print:py-1">Recommended Phase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                      <tr>
                        <td className="py-1.5 px-2 print:py-1 font-bold text-slate-900">10 mg Vial</td>
                        <td className="py-1.5 px-2 print:py-1">2.0 mL</td>
                        <td className="py-1.5 px-2 print:py-1 font-bold text-teal-700">5.0 mg/mL</td>
                        <td className="py-1.5 px-2 print:py-1 font-semibold">50 units (0.50 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 font-semibold">100 units (1.00 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 text-slate-400">— (Requires 20mg)</td>
                        <td className="py-1.5 px-2 print:py-1 text-slate-400">— (Requires 20mg)</td>
                        <td className="py-1.5 px-2 print:py-1 font-sans text-slate-600">
                          Weeks 1–8: Initiation &amp; Early Titration
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="py-1.5 px-2 print:py-1 font-bold text-slate-900">15 mg Vial</td>
                        <td className="py-1.5 px-2 print:py-1">3.0 mL</td>
                        <td className="py-1.5 px-2 print:py-1 font-bold text-teal-700">5.0 mg/mL</td>
                        <td className="py-1.5 px-2 print:py-1 font-semibold">50 units (0.50 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 font-semibold">100 units (1.00 mL)</td>
                        <td className="py-1.5 px-2 print:py-1">150 units (1.50 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 text-slate-400">—</td>
                        <td className="py-1.5 px-2 print:py-1 font-sans text-slate-600">
                          Extended low-dose or intermediate titration
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 print:py-1 font-bold text-slate-900">20 mg Vial</td>
                        <td className="py-1.5 px-2 print:py-1">2.0 mL</td>
                        <td className="py-1.5 px-2 print:py-1 font-bold text-indigo-700">10.0 mg/mL</td>
                        <td className="py-1.5 px-2 print:py-1">25 units (0.25 mL)</td>
                        <td className="py-1.5 px-2 print:py-1">50 units (0.50 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 font-semibold">75 units (0.75 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 font-semibold">100 units (1.00 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 font-sans text-slate-600">
                          Weeks 9+: High-Dose Escalation
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="py-1.5 px-2 print:py-1 font-bold text-slate-900">30 mg Vial</td>
                        <td className="py-1.5 px-2 print:py-1">3.0 mL</td>
                        <td className="py-1.5 px-2 print:py-1 font-bold text-indigo-700">10.0 mg/mL</td>
                        <td className="py-1.5 px-2 print:py-1">25 units (0.25 mL)</td>
                        <td className="py-1.5 px-2 print:py-1">50 units (0.50 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 font-semibold">75 units (0.75 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 font-semibold">100 units (1.00 mL)</td>
                        <td className="py-1.5 px-2 print:py-1 font-sans text-slate-600">
                          Weeks 13+: High-Dose Maintenance
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2.5 print:mt-1.5 rounded-md bg-slate-50 p-2.5 print:p-1.5 border border-slate-200 text-xs print:text-[8px] text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900">Laboratory Dilution Logic: </span>
                  For doses between 2.5 mg and 5.0 mg, standard 5.0 mg/mL concentration keeps injection
                  volume between 0.50 mL and 1.00 mL. When escalating to 7.5 mg or 10.0 mg,
                  researchers utilize 20 mg or 30 mg vials at 10.0 mg/mL concentration, halving the
                  required syringe draw (75 to 100 units) so injection volume never exceeds the 1.0 mL
                  U-100 syringe limit.
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB 4: TITRATION SCHEDULE & TIMELINES              */}
      {/* ══════════════════════════════════════════════════ */}
      <div className={getTabClass("titration")}>
        {protocolLevels.map((level) => (
          <section
            key={level.key}
            className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid"
          >
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wide">
                {level.title}
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                Assay Schedule
              </span>
            </div>
            {level.summary ? (
              <p className="mt-2 print:mt-1 text-sm print:text-[10px] text-ui-fg-subtle print:text-slate-600">
                {level.summary}
              </p>
            ) : null}
            <div className="mt-4 print:mt-2 overflow-x-auto">
              <table className="w-full min-w-[560px] print:min-w-0 text-left text-sm print:text-[10px] border border-slate-200">
                <thead>
                  <tr className="border-b border-ui-border-base text-ui-fg-subtle print:border-slate-300 print:bg-slate-50">
                    <th className="px-3 py-2 print:py-1 print:px-2">Period / Phase</th>
                    <th className="px-3 py-2 print:py-1 print:px-2">Target Amount</th>
                    <th className="px-3 py-2 print:py-1 print:px-2">Frequency</th>
                    <th className="px-3 py-2 print:py-1 print:px-2">Notes &amp; Calibration</th>
                  </tr>
                </thead>
                <tbody>
                  {level.rows.map((row, index) => (
                    <tr
                      key={row.row_key || `${level.key}-${index}`}
                      className="border-b border-ui-border-base last:border-0 print:border-slate-200 even:print:bg-slate-50/50"
                    >
                      <td className="px-3 py-3 print:py-1 print:px-2 font-medium">{row.period}</td>
                      <td className="px-3 py-3 print:py-1 print:px-2 font-mono font-bold text-slate-900">
                        {formatPeptideDosage(row.amount, row.unit).formatted}
                      </td>
                      <td className="px-3 py-3 print:py-1 print:px-2">{row.frequency}</td>
                      <td className="px-3 py-3 print:py-1 print:px-2 text-ui-fg-subtle print:text-slate-700">
                        {row.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {referenceQuantities.length ? (
          <section className="mt-8 rounded-xl border border-ui-border-base bg-white p-6 print:border-slate-300 print-break-inside-avoid">
            <h2 className="text-xl font-semibold">Reference Quantities</h2>
            <div className="mt-4 grid gap-3 small:grid-cols-2">
              {referenceQuantities.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-lg bg-ui-bg-subtle p-4 print:border print:border-slate-200"
                >
                  <p className="font-medium">
                    {item.label}: {item.value} {item.unit}
                  </p>
                  {item.concentration ? (
                    <p className="mt-1 text-sm text-ui-fg-subtle">
                      Concentration: {item.concentration}
                    </p>
                  ) : null}
                  {item.conversion_basis ? (
                    <p className="mt-1 text-sm text-ui-fg-subtle">
                      Conversion: {item.conversion_basis}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-ui-fg-subtle">{item.laboratory_purpose}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB 5: INVESTIGATED ENDPOINTS & MECHANISMS         */}
      {/* ══════════════════════════════════════════════════ */}
      <div className={getTabClass("benefits")}>
        {content.investigated_benefits && content.investigated_benefits.length > 0 ? (
          <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold text-slate-900 uppercase tracking-wide">
                Investigated Research Endpoints &amp; Observed Mechanisms
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                Biological Properties
              </span>
            </div>
            <div className="mt-4 print:mt-1.5 grid gap-3 print:gap-1.5 small:grid-cols-2 print:grid-cols-2">
              {content.investigated_benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 print:gap-1.5 rounded-lg border border-ui-border-base bg-white p-3.5 print:p-1.5 shadow-2xs print:border-slate-200 print:shadow-none"
                >
                  <span className="flex h-5 w-5 print:h-4 print:w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs print:text-[9px] font-bold mt-0.5">
                    ✓
                  </span>
                  <span className="text-sm print:text-[10px] text-slate-800 leading-relaxed print:leading-tight">
                    {renderFormattedText(benefit)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB 6: SAFETY & ADVERSE OBSERVATIONS               */}
      {/* ══════════════════════════════════════════════════ */}
      <div className={getTabClass("safety")}>
        {content.adverse_observations && content.adverse_observations.length > 0 ? (
          <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold text-slate-900 uppercase tracking-wide">
                Adverse Observations, Handling Precautions &amp; In-Vitro Sensitivities
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                Laboratory Safety Notes
              </span>
            </div>
            <div className="mt-4 print:mt-1.5 grid gap-3 print:gap-1.5 small:grid-cols-2 print:grid-cols-2">
              {content.adverse_observations.map((obs, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 print:gap-1.5 rounded-lg border border-ui-border-base bg-white p-3.5 print:p-1.5 shadow-2xs print:border-slate-200 print:shadow-none"
                >
                  <span className="flex h-5 w-5 print:h-4 print:w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs print:text-[9px] font-bold mt-0.5">
                    ⚠
                  </span>
                  <span className="text-sm print:text-[10px] text-slate-800 leading-relaxed print:leading-tight">
                    {renderFormattedText(obs)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {content.preparation_and_handling ? (
          <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wide">
              Preparation and Handling SOP
            </h2>
            <div className="mt-3 print:mt-1 whitespace-pre-wrap text-sm print:text-[10px] leading-6 print:leading-snug text-ui-fg-subtle print:text-slate-700">
              {renderFormattedText(content.preparation_and_handling)}
            </div>
          </section>
        ) : null}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* TAB 7: STORAGE, CITATIONS & FAQS                   */}
      {/* ══════════════════════════════════════════════════ */}
      <div className={getTabClass("storage_citations")}>
        {/* Storage Details */}
        {content.storage_details ? (
          <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5 mb-4">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wide text-slate-900">
                Physicochemical Stability &amp; Cold-Chain Storage
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                Environmental Guidelines
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:gap-2">
              <div className="p-3.5 print:p-2 rounded-lg border border-slate-200 bg-slate-50/60">
                <div className="text-xs print:text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Lyophilized Solid Powder
                </div>
                <div className="text-sm print:text-[10px] font-semibold text-slate-800">
                  {content.storage_details.lyophilized || "-20°C desiccated"}
                </div>
              </div>
              <div className="p-3.5 print:p-2 rounded-lg border border-slate-200 bg-slate-50/60">
                <div className="text-xs print:text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Reconstituted Solution
                </div>
                <div className="text-sm print:text-[10px] font-semibold text-slate-800">
                  {content.storage_details.reconstituted ||
                    "2°C–8°C refrigerated; use within 28 days"}
                </div>
              </div>
            </div>
            {content.storage_details.light_protection ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 font-medium">
                <span>☀️</span>
                Photosensitive Formulation: Protect reconstituted solution from direct ultraviolet
                exposure.
              </div>
            ) : null}
          </section>
        ) : null}

        {content.storage_and_disposal ? (
          <section className="mt-6 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wide">
              Storage and Biohazard Disposal
            </h2>
            <div className="mt-3 print:mt-1 whitespace-pre-wrap text-sm print:text-[10px] leading-6 print:leading-snug text-ui-fg-subtle print:text-slate-700">
              {renderFormattedText(content.storage_and_disposal)}
            </div>
          </section>
        ) : null}

        {/* Scholarly Research Citations with Clickable PubMed Links */}
        {references.length > 0 ? (
          <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5 mb-4">
              <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wide text-slate-900">
                Scholarly Research Citations ({references.length} References)
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                Peer-Reviewed Index
              </span>
            </div>
            <div className="space-y-3">
              {references.map((ref, idx) => (
                <div key={ref.reference_key || idx}>
                  {renderCitationItem(ref.title, ref.url, ref.customer_annotation || ref.authors)}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Frequently Asked Questions */}
        {faqs.length ? (
          <section className="mt-8 rounded-xl border border-ui-border-base bg-white p-6 print:hidden">
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-3">
              {faqs
                .sort((a, b) => a.position - b.position)
                .map((faq) => (
                  <details key={faq.key} className="rounded-lg border border-ui-border-base p-4">
                    <summary className="cursor-pointer font-medium">{faq.question}</summary>
                    <p className="mt-3 text-sm leading-6 text-ui-fg-subtle">{faq.answer}</p>
                  </details>
                ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Additional Sections (Visible on All or when matching tab) */}
      {sections
        .filter((section) => section.visible)
        .map((section) => {
          const lower = section.title.toLowerCase()
          const isDuplicateInPrint =
            lower.includes("pharmacological profile") ||
            lower.includes("mechanism of action") ||
            lower.includes("analytical specifications") ||
            lower.includes("purity standard") ||
            (lower.includes("storage") && !!content.storage_details) ||
            (lower.includes("reconstitution") && !!content.reconstitution_details)

          return (
            <section
              key={section.key}
              className={`mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid ${
                isDuplicateInPrint ? "print:hidden" : ""
              } ${activeTab === "all" ? "block" : "hidden print:block"}`}
            >
              <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wide">
                {section.title}
              </h2>
              <div className="mt-3 print:mt-1 whitespace-pre-wrap text-sm print:text-[10px] leading-6 print:leading-snug text-ui-fg-subtle print:text-slate-700">
                {renderFormattedText(section.body)}
              </div>
            </section>
          )
        })}

      {/* Catalog Product Card (Public View / Catalog Matched) with Print-Only QR Code */}
      {showCatalogProduct && matchedProducts && matchedProducts.length > 0 ? (
        <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-4 print:gap-2">
            <div className="flex-1 min-w-[240px]">
              <span className="inline-block rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
                Available in Catalog
              </span>
              <h3 className="mt-2 print:mt-0.5 text-xl print:text-sm font-bold text-slate-900">
                {matchedProducts[0].title}
              </h3>
              <p className="mt-1 print:mt-0.5 text-sm print:text-[10px] text-ui-fg-subtle print:text-slate-700">
                High-purity lyophilized laboratory reference formulation with certified Certificate of
                Analysis (COA).
              </p>
              <p className="mt-2 print:mt-1 text-xs print:text-[9px] font-mono text-slate-600 hidden print:block">
                Direct Catalog URL: {orderUrl}
              </p>
            </div>
            <div className="print:hidden">
              <LocalizedClientLink
                href={`/products/${matchedProducts[0].handle}`}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                View Product in Catalog →
              </LocalizedClientLink>
            </div>
            {/* Print-only QR code for instant mobile ordering */}
            {qrCodeDataUrl ? (
              <div className="hidden print:flex flex-col items-center text-center pl-3 border-l border-slate-200 shrink-0">
                <Image
                  unoptimized
                  src={qrCodeDataUrl}
                  alt={`Scan to purchase ${cleanTitle}`}
                  width={72}
                  height={72}
                  className="w-[72px] h-[72px] border border-slate-300 p-0.5 rounded bg-white"
                />
                <span className="text-[7px] font-bold uppercase tracking-wider text-slate-800 mt-0.5">
                  Scan to Order
                </span>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Regulatory Research Disclaimer */}
      <div className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5 print:p-2.5 text-sm print:text-[9.5px] leading-relaxed print:leading-snug text-ui-fg-subtle print:text-slate-700 print:border-slate-300 print-break-inside-avoid">
        {content.disclaimer}
      </div>

      {/* ── Print-Only Regulatory Footer ── */}
      <div className="hidden print:block border-t-2 border-slate-900 pt-2 mt-3 text-[9px] text-slate-600 text-center font-mono">
        STRICT IN-VITRO LABORATORY RESEARCH REFERENCE STANDARD ONLY. NOT FOR HUMAN, VETERINARY,
        COSMETIC, OR CLINICAL USE. OFFICIAL DOCUMENT · PEPSTACK LABS REPOSITORY · REVISION{" "}
        {protocol.revision}
      </div>
    </div>
  )
}
