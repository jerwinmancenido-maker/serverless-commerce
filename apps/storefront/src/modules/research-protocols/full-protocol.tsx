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
  const quickReference = content.quick_reference || []
  const protocolLevels = content.protocol_levels || []
  const referenceQuantities = content.reference_quantities || []
  const sections = content.sections || []
  const faqs = content.faqs || []

  const cleanTitle = useMemo(
    () => cleanCompoundTitle(content.compound_name || protocol.title),
    [content.compound_name, protocol.title]
  )

  const [origin, setOrigin] = useState("https://pepstacklabs.com")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setOrigin(window.location.origin)
    }
  }, [])

  const matchedProduct = matchedProducts?.[0]
  const fallbackHandle = "products" in protocol && Array.isArray(protocol.products) ? protocol.products[0]?.handle : undefined
  const fallbackThumbnail = "products" in protocol && Array.isArray(protocol.products) ? protocol.products[0]?.thumbnail : undefined
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

  return (
    <div>
      {/* ── Print-Only Laboratory Letterhead ── */}
      {/* Official Print Dossier Letterhead Header (Page 1) */}
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
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {cleanTitle}
            </h1>
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
          <span className="text-[7px] text-slate-500 font-mono">
            pepstacklabs.com
          </span>
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
          <span className="text-xs text-slate-400 font-mono">
            Protocol: {protocol.handle}
          </span>
        </div>
      ) : null}

      {/* Screen Hero Card (Hidden in Print to prevent duplicate header) */}
      <header className="rounded-xl border border-ui-border-base bg-white p-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-interactive">
            {badgeText || "Current Protected Protocol"}
          </p>
          {isBlend ? (
            <span className="rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-0.5 text-xs font-bold inline-flex items-center gap-1">
              <span>🧬</span> Multi-Peptide Blend
            </span>
          ) : (
            <span className="rounded-full bg-teal-50 text-teal-800 border border-teal-200 px-3 py-0.5 text-xs font-bold inline-flex items-center gap-1">
              <span>🧪</span> Single Peptide
            </span>
          )}
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
            {content.full_description.split(/(?:\r?\n|\\n)\s*(?:\r?\n|\\n)/).map((para, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {renderFormattedText(para)}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {/* Investigated Research Endpoints */}
      {content.investigated_benefits && content.investigated_benefits.length > 0 ? (
        <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5">
            <h2 className="text-xl print:text-xs font-semibold print:font-bold text-slate-900 uppercase tracking-wide">
              Investigated Research Endpoints &amp; Observed Mechanisms
            </h2>
            <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
              Documented Biological Properties
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

      {/* Adverse Observations & Precautions */}
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

      {/* Molecular Details */}
      {content.molecular_details &&
      (content.molecular_details.cas_number ||
        content.molecular_details.pubchem_cid ||
        content.molecular_details.sequence_or_formula ||
        content.molecular_details.molecular_weight_g_per_mol) ? (
        <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5">
            <h2 className="text-xl print:text-xs font-semibold print:font-bold text-slate-900 uppercase tracking-wide">
              Physicochemical Specifications
            </h2>
            <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
              Molecular Identity
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
                {content.molecular_details.pubchem_cid
                  ? `CID ${content.molecular_details.pubchem_cid}`
                  : "Referenced Standard"}
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
          {content.molecular_details.sequence_or_formula ? (
            <div className="mt-4 print:mt-2 p-3.5 print:p-1.5 rounded-lg bg-slate-900 print:bg-slate-50 text-slate-100 print:text-slate-900 font-mono text-xs print:text-[10px] overflow-x-auto print:border print:border-slate-200">
              <span className="text-[10px] print:text-[8px] text-emerald-400 print:text-slate-700 font-bold uppercase block mb-1 print:mb-0">
                Primary Sequence / Structure Formula
              </span>
              <span className="select-all">
                {content.molecular_details.sequence_or_formula}
              </span>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Quick Reference Cards */}
      {quickReference.length ? (
        <section className="mt-6 print:mt-2.5 grid gap-3 print:gap-2 small:grid-cols-2 large:grid-cols-3 print:grid-cols-3 print-break-inside-avoid">
          {quickReference.map((item) => (
            <article key={item.key} className="rounded-xl border border-ui-border-base bg-white p-5 print:p-2.5 print:border-slate-300">
              <p className="text-xs print:text-[9px] font-semibold uppercase tracking-wide text-ui-fg-subtle print:text-slate-600">
                {item.label}
              </p>
              <p className="mt-2 print:mt-0.5 text-lg print:text-xs font-semibold text-slate-900">{item.value}</p>
              {item.description ? (
                <p className="mt-2 print:mt-0.5 text-sm print:text-[9.5px] text-ui-fg-subtle print:text-slate-600">{item.description}</p>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {/* Interactive Reconstitution Calculator (Screen Only) */}
      {content.calculator && content.calculator.enabled ? (
        <div className="mt-8 print:hidden">
          <ProtocolCalculator configuration={content.calculator} />
        </div>
      ) : null}

      {/* Volumetric Calibration Reference Table, Stoichiometric Flow Diagram & Multi-Vial / Tiering Matrices */}
      {content.reconstitution_details ? (
        <section className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-ui-border-base pb-3 mb-4 print:pb-1.5 print:mb-2">
            <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wider text-slate-900">
              Stoichiometric Reconstitution &amp; Syringe Calibration Matrix
            </h2>
            <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
              Analytical Reference Standard
            </span>
          </div>

          {/* Stoichiometric Laboratory Protocol Flow */}
          <div className="mb-6 print:mb-3">
            <div className="text-xs print:text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2 print:mb-1">
              Stoichiometric Laboratory Protocol Flow
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 print:grid-cols-4 gap-2 print:gap-1.5 text-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-teal-100 text-teal-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                  🧪
                </div>
                <span className="font-semibold text-slate-800 text-xs print:text-[9px]">1. Lyophilized Cake</span>
                <span className="text-[11px] print:text-[8px] font-mono text-slate-600 mt-0.5">
                  {content.reconstitution_details.default_vial_net_mg || 10} mg Net Mass
                </span>
                <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">Vacuum-sealed vial</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-blue-100 text-blue-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                  💧
                </div>
                <span className="font-semibold text-slate-800 text-xs print:text-[9px]">2. Aseptic Diluent</span>
                <span className="text-[11px] print:text-[8px] font-mono text-slate-600 mt-0.5">
                  {content.reconstitution_details.default_diluent_ml || 2.0} mL BAC Water
                </span>
                <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">Slowly down vial wall</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-indigo-100 text-indigo-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                  🔬
                </div>
                <span className="font-semibold text-slate-800 text-xs print:text-[9px]">3. Reconstituted Solution</span>
                <span className="text-[11px] print:text-[8px] font-mono font-bold text-slate-900 mt-0.5">
                  {content.reconstitution_details.resulting_concentration_mg_per_ml || 5.0} mg/mL
                </span>
                <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">Gentle circular swirl</span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center justify-center p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 print:bg-white print:border-slate-300">
                <div className="flex items-center justify-center w-8 h-8 print:w-6 print:h-6 rounded-full bg-amber-100 text-amber-800 text-sm print:text-xs mb-1.5 print:mb-0.5 font-bold">
                  💉
                </div>
                <span className="font-semibold text-slate-800 text-xs print:text-[9px]">4. Calibrated Draw</span>
                <span className="text-[11px] print:text-[8px] font-mono text-slate-600 mt-0.5">
                  U-100 (100 units = 1.0 mL)
                </span>
                <span className="text-[10px] print:text-[7.5px] text-slate-500 mt-0.5">
                  1 unit = {formatPeptideDosage(((content.reconstitution_details?.resulting_concentration_mg_per_ml || 5.0) * 10), "mcg").formatted}
                </span>
              </div>
            </div>
          </div>

          {/* Reference Table */}
          <table className="w-full text-left text-xs print:text-[10px] border border-slate-200">
            <tbody>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700 w-1/3">Standard Compound Mass</td>
                <td className="py-2 px-3 print:py-1 print:px-2 font-mono text-slate-900">{content.reconstitution_details.default_vial_net_mg || 10} mg net peptide per vial</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">Recommended Diluent</td>
                <td className="py-2 px-3 print:py-1 print:px-2 text-slate-900">{content.reconstitution_details.solvent || "Bacteriostatic Water USP (0.9% Benzyl Alcohol)"}</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">Diluent Volume Added</td>
                <td className="py-2 px-3 print:py-1 print:px-2 font-mono text-slate-900">{content.reconstitution_details.default_diluent_ml || 2.0} mL</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">Resulting Concentration</td>
                <td className="py-2 px-3 print:py-1 print:px-2 font-mono font-bold text-slate-900">{content.reconstitution_details.resulting_concentration_mg_per_ml || 5.0} mg/mL</td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">Syringe Volumetric Scale</td>
                <td className="py-2 px-3 print:py-1 print:px-2 text-slate-900 font-mono">U-100 Insulin Syringe (100 units = 1.0 mL | 1 unit = 0.01 mL = {formatPeptideDosage(((content.reconstitution_details?.resulting_concentration_mg_per_ml || 5.0) * 10), "mcg").formatted})</td>
              </tr>
              {content.reconstitution_details.handling_rule ? (
                <tr>
                  <td className="py-2 px-3 print:py-1 print:px-2 font-semibold text-slate-700">Handling Rule</td>
                  <td className="py-2 px-3 print:py-1 print:px-2 text-slate-800">{content.reconstitution_details.handling_rule}</td>
                </tr>
              ) : null}
            </tbody>
          </table>

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
                      <td className="py-1.5 px-2 print:py-1 font-sans text-slate-600">Weeks 1–8: Initiation &amp; Early Titration</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-1.5 px-2 print:py-1 font-bold text-slate-900">15 mg Vial</td>
                      <td className="py-1.5 px-2 print:py-1">3.0 mL</td>
                      <td className="py-1.5 px-2 print:py-1 font-bold text-teal-700">5.0 mg/mL</td>
                      <td className="py-1.5 px-2 print:py-1 font-semibold">50 units (0.50 mL)</td>
                      <td className="py-1.5 px-2 print:py-1 font-semibold">100 units (1.00 mL)</td>
                      <td className="py-1.5 px-2 print:py-1">150 units (1.50 mL)</td>
                      <td className="py-1.5 px-2 print:py-1 text-slate-400">—</td>
                      <td className="py-1.5 px-2 print:py-1 font-sans text-slate-600">Extended low-dose or intermediate titration</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 print:py-1 font-bold text-slate-900">20 mg Vial</td>
                      <td className="py-1.5 px-2 print:py-1">2.0 mL</td>
                      <td className="py-1.5 px-2 print:py-1 font-bold text-indigo-700">10.0 mg/mL</td>
                      <td className="py-1.5 px-2 print:py-1">25 units (0.25 mL)</td>
                      <td className="py-1.5 px-2 print:py-1">50 units (0.50 mL)</td>
                      <td className="py-1.5 px-2 print:py-1 font-semibold">75 units (0.75 mL)</td>
                      <td className="py-1.5 px-2 print:py-1 font-semibold">100 units (1.00 mL)</td>
                      <td className="py-1.5 px-2 print:py-1 font-sans text-slate-600">Weeks 9+: High-Dose Escalation</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-1.5 px-2 print:py-1 font-bold text-slate-900">30 mg Vial</td>
                      <td className="py-1.5 px-2 print:py-1">3.0 mL</td>
                      <td className="py-1.5 px-2 print:py-1 font-bold text-indigo-700">10.0 mg/mL</td>
                      <td className="py-1.5 px-2 print:py-1">25 units (0.25 mL)</td>
                      <td className="py-1.5 px-2 print:py-1">50 units (0.50 mL)</td>
                      <td className="py-1.5 px-2 print:py-1 font-semibold">75 units (0.75 mL)</td>
                      <td className="py-1.5 px-2 print:py-1 font-semibold">100 units (1.00 mL)</td>
                      <td className="py-1.5 px-2 print:py-1 font-sans text-slate-600">Weeks 13+: High-Dose Maintenance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2.5 print:mt-1.5 rounded-md bg-slate-50 p-2.5 print:p-1.5 border border-slate-200 text-xs print:text-[8px] text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">Laboratory Dilution Logic: </span>
                For doses between 2.5 mg and 5.0 mg, standard 5.0 mg/mL concentration keeps injection volume between 0.50 mL and 1.00 mL. When escalating to 7.5 mg or 10.0 mg, researchers utilize 20 mg or 30 mg vials at 10.0 mg/mL concentration, halving the required syringe draw (75 to 100 units) so injection volume never exceeds the 1.0 mL U-100 syringe limit.
              </div>
            </div>
          ) : (
            <div className="mt-6 print:mt-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                <h3 className="text-xs print:text-[9px] font-bold uppercase tracking-wider text-slate-900">
                  Objective-Based Research Dosing Tiers
                </h3>
                <span className="text-[10px] print:text-[8px] font-mono text-slate-500">
                  Calibrated for U-100 Syringe (Standard 5.0 mg/mL Solution)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 print:gap-1.5">
                {/* Tier 1: Microdose / Baseline */}
                <div className="p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 print:bg-white print:border-slate-300">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs print:text-[9px] font-bold text-teal-800 uppercase tracking-wide">
                      🔬 Tier 1: Microdose / Baseline
                    </span>
                  </div>
                  <div className="text-lg print:text-xs font-bold font-mono text-slate-900">
                    100 mcg <span className="text-xs print:text-[8px] font-normal text-slate-500">(0.10 mg)</span>
                  </div>
                  <div className="mt-1 text-xs print:text-[8.5px] font-mono font-semibold text-teal-700">
                    2.0 units on U-100 (0.02 mL)
                  </div>
                  <p className="mt-1.5 print:mt-0.5 text-xs print:text-[8px] text-slate-600 leading-snug">
                    Receptor sensitivity check, micro-pulsing protocols, and anti-inflammatory baseline maintenance.
                  </p>
                </div>

                {/* Tier 2: Standard Research Dose */}
                <div className="p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 print:bg-white print:border-slate-300">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs print:text-[9px] font-bold text-blue-800 uppercase tracking-wide">
                      ⚖️ Tier 2: Standard Research
                    </span>
                  </div>
                  <div className="text-lg print:text-xs font-bold font-mono text-slate-900">
                    250 – 300 mcg <span className="text-xs print:text-[8px] font-normal text-slate-500">(0.25–0.30 mg)</span>
                  </div>
                  <div className="mt-1 text-xs print:text-[8.5px] font-mono font-semibold text-blue-700">
                    5.0 – 6.0 units on U-100 (0.05–0.06 mL)
                  </div>
                  <p className="mt-1.5 print:mt-0.5 text-xs print:text-[8px] text-slate-600 leading-snug">
                    Primary peer-reviewed benchmark dose for accelerated tissue repair, secretagogue pulsing, or cellular signaling assays.
                  </p>
                </div>

                {/* Tier 3: Intensive / Acute Trauma */}
                <div className="p-3 print:p-1.5 rounded-lg border border-slate-200 bg-slate-50/70 print:bg-white print:border-slate-300">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs print:text-[9px] font-bold text-amber-800 uppercase tracking-wide">
                      ⚡ Tier 3: Intensive / Acute
                    </span>
                  </div>
                  <div className="text-lg print:text-xs font-bold font-mono text-slate-900">
                    500 – 750 mcg <span className="text-xs print:text-[8px] font-normal text-slate-500">(0.50–0.75 mg)</span>
                  </div>
                  <div className="mt-1 text-xs print:text-[8.5px] font-mono font-semibold text-amber-700">
                    10.0 – 15.0 units on U-100 (0.10–0.15 mL)
                  </div>
                  <p className="mt-1.5 print:mt-0.5 text-xs print:text-[8px] text-slate-600 leading-snug">
                    Acute tissue trauma models, extensive connective injury, or high-potency challenge assays requiring maximum receptor saturation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      ) : null}

      {protocolLevels.map((level) => (
        <section key={level.key} className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid">
          <div className="flex items-center justify-between border-b border-ui-border-base pb-3 print:pb-1.5">
            <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wide">{level.title}</h2>
            <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs print:text-[9px] font-semibold uppercase">
              Assay Schedule
            </span>
          </div>
          {level.summary ? (
            <p className="mt-2 print:mt-1 text-sm print:text-[10px] text-ui-fg-subtle print:text-slate-600">{level.summary}</p>
          ) : null}
          <div className="mt-4 print:mt-2 overflow-x-auto">
            <table className="w-full min-w-[560px] print:min-w-0 text-left text-sm print:text-[10px] border border-slate-200">
              <thead>
                <tr className="border-b border-ui-border-base text-ui-fg-subtle print:border-slate-300 print:bg-slate-50">
                  <th className="px-3 py-2 print:py-1 print:px-2">Period</th>
                  <th className="px-3 py-2 print:py-1 print:px-2">Amount</th>
                  <th className="px-3 py-2 print:py-1 print:px-2">Frequency</th>
                  <th className="px-3 py-2 print:py-1 print:px-2">Notes</th>
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
                    <td className="px-3 py-3 print:py-1 print:px-2 text-ui-fg-subtle print:text-slate-700">{row.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {referenceQuantities.length ? (
        <section className="mt-8 rounded-xl border border-ui-border-base bg-white p-6 print:border-slate-300 print-break-inside-avoid">
          <h2 className="text-xl font-semibold">Reference quantities</h2>
          <div className="mt-4 grid gap-3 small:grid-cols-2">
            {referenceQuantities.map((item, index) => (
              <div key={`${item.label}-${index}`} className="rounded-lg bg-ui-bg-subtle p-4 print:border print:border-slate-200">
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

      {[
        { title: "Research purpose", body: content.research_purpose, hide: !!content.full_description },
        { title: "Intended application", body: content.intended_application, hide: !!content.full_description },
        { title: "Preparation and handling", body: content.preparation_and_handling, hide: false },
        { title: "Research procedure", body: content.research_procedure, hide: false },
        { title: "Storage and disposal", body: content.storage_and_disposal, hide: false },
      ]
        .filter((item) => item.body && !item.hide)
        .map((item) => (
          <section
            key={item.title}
            className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-white p-6 print:p-3 print:border-slate-300 print-break-inside-avoid"
          >
            <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wide">{item.title}</h2>
            <div className="mt-3 print:mt-1 whitespace-pre-wrap text-sm print:text-[10px] leading-6 print:leading-snug text-ui-fg-subtle print:text-slate-700">
              {renderFormattedText(item.body)}
            </div>
          </section>
        ))}

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
              }`}
            >
              <h2 className="text-xl print:text-xs font-semibold print:font-bold uppercase tracking-wide">{section.title}</h2>
              <div className="mt-3 print:mt-1 whitespace-pre-wrap text-sm print:text-[10px] leading-6 print:leading-snug text-ui-fg-subtle print:text-slate-700">
                {renderFormattedText(section.body)}
              </div>
            </section>
          )
        })}

      {faqs.length ? (
        <section className="mt-8 rounded-xl border border-ui-border-base bg-white p-6 print:hidden">
          <h2 className="text-xl font-semibold">Frequently asked questions</h2>
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
                High-purity lyophilized laboratory reference formulation with certified Certificate of Analysis (COA).
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
            {/* Print-only QR code for instant mobile purchasing */}
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

      <div className="mt-8 print:mt-2.5 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5 print:p-2.5 text-sm print:text-[9.5px] leading-relaxed print:leading-snug text-ui-fg-subtle print:text-slate-700 print:border-slate-300 print-break-inside-avoid">
        {content.disclaimer}
      </div>

      {/* ── Print-Only Regulatory Footer ── */}
      <div className="hidden print:block border-t-2 border-slate-900 pt-2 mt-3 text-[9px] text-slate-600 text-center font-mono">
        STRICT IN-VITRO LABORATORY RESEARCH REFERENCE STANDARD ONLY.
        NOT FOR HUMAN, VETERINARY, COSMETIC, OR CLINICAL USE.
        OFFICIAL DOCUMENT · PEPSTACK LABS REPOSITORY · REVISION {protocol.revision}
      </div>
    </div>
  )
}
