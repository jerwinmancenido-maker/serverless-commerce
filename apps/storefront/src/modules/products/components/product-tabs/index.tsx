"use client"

/**
 * @file    apps/storefront/src/modules/products/components/product-tabs/index.tsx
 * @module  ProductTabsComponent (Storefront)
 * @purpose Tabbed interface for product specifications, clinical monographs, protocol monographs, and shipping details.
 * @contracts
 *   Fetches: getCompoundProtocol()
 */

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductInfo from "@modules/products/templates/product-info"
import { Beaker, DocumentText, CheckCircleSolid, ArrowRightMini } from "@medusajs/icons"

import Accordion from "./accordion"
import InteractiveSyringeStoichiometry from "@modules/research-protocols/components/interactive-syringe-stoichiometry"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import { StoreResearchProtocol } from "@lib/data/research-protocols"
import { getCompoundProtocol, CompoundAnalyticalProtocol } from "@lib/data/compound-protocols"
import type { ResearchArticle } from "@lib/data/research-articles"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
  linkedProtocol?: StoreResearchProtocol | null
  linkedArticle?: ResearchArticle | null
  countryCode?: string
}

function renderFormattedParagraphs(text?: string | null) {
  if (!text) return null
  const paragraphs = text
    .split(/(?:\r?\n|\\n)\s*(?:\r?\n|\\n)/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) return null

  return (
    <div className="space-y-3">
      {paragraphs.map((para, pIdx) => {
        const parts = para.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g)
        return (
          <p key={pIdx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {parts.map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={i} className="font-bold text-slate-900">
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
            })}
          </p>
        )
      })}
    </div>
  )
}

const ProductTabs = ({
  product,
  linkedProtocol,
  linkedArticle,
  countryCode,
}: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview")

  const compoundProto = useMemo(() => {
    const protocolHandle =
      (product.metadata?.protocol_handle as string) ||
      (product.metadata?.protocol_id as string)
    if (protocolHandle) {
      const proto = getCompoundProtocol(protocolHandle)
      if (proto && proto.id !== "generic-peptide") return proto
    }
    return getCompoundProtocol(product.handle || product.title)
  }, [product.metadata, product.handle, product.title])

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase().replace("#", "")
      if (
        hash === "protocol" ||
        hash === "monograph" ||
        hash === "customer_hub" ||
        hash === "calculator" ||
        hash === "compliance" ||
        hash === "shipping" ||
        hash === "overview"
      ) {
        setActiveTab(hash)
      }
    }
    handleHash()
    window.addEventListener("hashchange", handleHash)
    return () => window.removeEventListener("hashchange", handleHash)
  }, [])

  const isSupply =
    compoundProto?.isSupply ||
    compoundProto?.category === "Laboratory Supplies"

  const tabs: Array<{ id: string; label: string; badge?: string }> = [
    { id: "overview", label: "Description & Specs" },
    ...(linkedArticle
      ? [
          {
            id: "monograph",
            label: "Clinical Monograph",
            badge: "6-Chapter Dossier",
          },
        ]
      : []),
    {
      id: "protocol",
      label: isSupply ? "Labware Specs & SOP" : "Product Protocol & Handling",
      badge: "RUO Standard",
    },
    {
      id: "calculator",
      label: isSupply ? "Aseptic & Storage Guide" : "Reconstitution Calculator",
      badge: isSupply ? "Lab Standard" : undefined,
    },
    {
      id: "customer_hub",
      label: "Customer Research Hub",
      badge: "Client Suite",
    },
    { id: "compliance", label: "Compliance & Safety" },
    { id: "shipping", label: "Shipping & Transit" },
  ]

  return (
    <div className="w-full">
      {/* Section Eyebrow & Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block mb-2">
            Technical Specification &amp; Protocol Dossier
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Analytical Standards &amp; Laboratory Handling
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified laboratory protocols, reconstitution parameters, and handling guidelines.
          </p>
        </div>
      </div>

      {/* Horizontal Segmented Controller Tab Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar mb-8 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge ? (
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            <ProductInfo product={product} mode="description" />
            {compoundProto?.longDescription && (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono">
                      P
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">Pharmacological Profile &amp; Mechanism of Action</h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    Research Monograph
                  </span>
                </div>
                {renderFormattedParagraphs(compoundProto.longDescription)}
              </div>
            )}
            <div className="pt-6 border-t border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">Compound &amp; Molecular Specifications</h3>
              <ProductSpecsGrid product={product} compoundProto={compoundProto} />
            </div>
          </div>
        )}

        {activeTab === "monograph" && linkedArticle && (
          <div className="animate-fadeIn">
            <ClinicalMonographTabPanel
              article={linkedArticle}
              countryCode={countryCode}
            />
          </div>
        )}

        {activeTab === "protocol" && (
          <div className="animate-fadeIn">
            <ResearchProtocolPanel
              protocol={linkedProtocol}
              product={product}
              compoundProto={compoundProto}
              onNavigateToCalculator={() => setActiveTab("calculator")}
            />
          </div>
        )}

        {activeTab === "customer_hub" && (
          <div className="animate-fadeIn">
            <CustomerResearchHubPanel product={product} />
          </div>
        )}

        {activeTab === "calculator" && (
          <div className="animate-fadeIn">
            <ReconstitutionTab product={product} />
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="animate-fadeIn">
            <ComplianceSafetyAccordion product={product} />
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="animate-fadeIn">
            <ShippingInfoTab />
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 0. Peer-Reviewed Clinical Research Monograph Panel
// ---------------------------------------------------------------------------
const ClinicalMonographTabPanel = ({
  article,
  countryCode: _countryCode = "ph",
}: {
  article: ResearchArticle
  countryCode?: string
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Monograph Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border border-slate-700 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Peer-Reviewed Clinical Monograph
            </span>
            <span className="text-[10px] font-medium text-slate-300 bg-white/10 px-2.5 py-1 rounded-md">
              ⏱ {article.reading_time || "12 min read"}
            </span>
            <span className="text-[10px] font-medium text-slate-300 bg-white/10 px-2.5 py-1 rounded-md">
              ISSN 2835-4912
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
            {article.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {article.subtitle}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span>
              Reviewed by:{" "}
              <strong className="text-slate-200">
                {article.reviewed_by || "Scientific Review Board"}
              </strong>
            </span>
            <span>•</span>
            <span>
              Category:{" "}
              <strong className="text-emerald-300">{article.category}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Abstract & TOC on Left, Telemetry & Citations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Abstract & Chapters (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shaded Preclinical Abstract Box */}
          <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white text-[10px] font-bold font-mono">
                §
              </span>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-950">
                Preclinical Abstract &amp; Mechanistic Scope
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
              {article.abstract}
            </p>
          </div>

          {/* Section Chapters (6 Chapters) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Investigational Chapters ({article.sections?.length || 0} Sections)
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                Full-Text Available
              </span>
            </div>
            <div className="space-y-3">
              {article.sections?.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all"
                >
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                    <span className="text-emerald-700 font-mono text-xs font-bold">
                      {idx + 1}.
                    </span>
                    <span>{sec.title.replace(/^\d+\.\s*/, "")}</span>
                  </h5>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {sec.paragraphs?.[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Direct CTA to Full Article Reader */}
          <div className="pt-2">
            <LocalizedClientLink
              href={`/research-library/${article.slug}`}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>📖 Read Full 6-Chapter Research Monograph</span>
              <ArrowRightMini className="w-4 h-4" />
            </LocalizedClientLink>
          </div>
        </div>

        {/* Right Column: Telemetry & Citations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              Dossier Telemetry
            </h4>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <dt className="text-slate-500">Compound</dt>
                <dd className="font-bold text-slate-800">
                  {article.compound_tag}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <dt className="text-slate-500">Discipline</dt>
                <dd className="font-medium text-slate-800">
                  {article.category}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <dt className="text-slate-500">Editorial Status</dt>
                <dd className="font-bold text-emerald-700">Published RUO</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-slate-500">Peer Citations</dt>
                <dd className="font-mono font-bold text-indigo-600">
                  {article.citations?.length || 0} Studies
                </dd>
              </div>
            </dl>
          </div>

          {/* PubMed Citations Card */}
          {article.citations && article.citations.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-200/60">
                NCBI PubMed Citations ({article.citations.length})
              </h4>
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-[11px]">
                {article.citations.map((c, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-white border border-slate-200/60 space-y-1"
                  >
                    <p className="font-medium text-slate-800 leading-snug line-clamp-2">
                      {c.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        {c.journal} {c.year ? `(${c.year})` : ""}
                      </span>
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-indigo-600 hover:text-indigo-800 font-bold underline"
                        >
                          {c.pmid ? `PMID:${c.pmid}` : "Link ↗"}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 1. Compound Specifications Grid
// ---------------------------------------------------------------------------
const ProductSpecsGrid = ({
  product,
  compoundProto,
}: {
  product: HttpTypes.StoreProduct
  compoundProto?: CompoundAnalyticalProtocol
}) => {
  const contentOption = product.options?.find(
    (o) =>
      o.title?.toLowerCase().includes("content") ||
      o.title?.toLowerCase().includes("net")
  )
  const inclusionOption = product.options?.find((o) =>
    o.title?.toLowerCase().includes("inclusion")
  )

  const mol = compoundProto?.molecularDetails

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
        <span className="font-semibold text-zinc-900 text-xs">Target Category</span>
        <p className="text-zinc-600 text-xs mt-1">
          {compoundProto?.category || product.categories?.map((c) => c.name).join(", ") || "Research Compound"}
        </p>
      </div>
      <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
        <span className="font-semibold text-zinc-900 text-xs">Intended Application</span>
        <p className="text-zinc-600 text-xs mt-1">Laboratory &amp; In-Vitro Research Only (RUO)</p>
      </div>
      <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
        <span className="font-semibold text-zinc-900 text-xs">Physical State</span>
        <p className="text-zinc-600 text-xs mt-1">
          {compoundProto?.supplyGuide?.physicalState || "Lyophilized Solid Powder"}
        </p>
      </div>

      {mol?.casNumber && (
        <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
          <span className="font-semibold text-zinc-900 text-xs">CAS Registry Number</span>
          <p className="text-zinc-700 font-mono text-xs mt-1">{mol.casNumber}</p>
        </div>
      )}

      {mol?.pubchemCid && (
        <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
          <span className="font-semibold text-zinc-900 text-xs">PubChem CID</span>
          <p className="text-xs mt-1">
            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${mol.pubchemCid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline font-mono inline-flex items-center gap-1 font-semibold"
            >
              <span>{mol.pubchemCid}</span>
              <span className="text-[10px]">&#8599;</span>
            </a>
          </p>
        </div>
      )}

      {mol?.molecularWeightGPerMol && (
        <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
          <span className="font-semibold text-zinc-900 text-xs">Molecular Weight</span>
          <p className="text-zinc-700 font-mono text-xs mt-1">{mol.molecularWeightGPerMol} g/mol</p>
        </div>
      )}

      {mol?.sequenceOrFormula && (
        <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 sm:col-span-2">
          <span className="font-semibold text-zinc-900 text-xs">Peptide Sequence / Formula</span>
          <p className="text-zinc-700 font-mono text-[11px] mt-1 break-all bg-white p-1.5 rounded border border-zinc-200/60">
            {mol.sequenceOrFormula}
          </p>
        </div>
      )}

      {compoundProto?.purityStandard && (
        <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
          <span className="font-semibold text-zinc-900 text-xs">Purity Specification</span>
          <p className="text-emerald-800 font-semibold text-xs mt-1">
            {compoundProto.purityStandard}
          </p>
        </div>
      )}

      {contentOption && (
        <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
          <span className="font-semibold text-zinc-900 text-xs">Net Content Options</span>
          <p className="text-zinc-600 text-xs mt-1">
            {contentOption.values?.map((v) => v.value).join(", ")}
          </p>
        </div>
      )}
      {inclusionOption && (
        <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
          <span className="font-semibold text-zinc-900 text-xs">Inclusion Packages</span>
          <p className="text-zinc-600 text-xs mt-1">
            {inclusionOption.values?.map((v) => v.value).join(", ")}
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. Verified Research Protocol & Laboratory Handling Panel
// ---------------------------------------------------------------------------
const ResearchProtocolPanel = ({
  protocol,
  product,
  compoundProto: passedProto,
  onNavigateToCalculator,
}: {
  protocol?: StoreResearchProtocol | null
  product: HttpTypes.StoreProduct
  compoundProto?: CompoundAnalyticalProtocol
  onNavigateToCalculator?: () => void
}) => {
  const compoundProto = useMemo(() => {
    if (passedProto) return passedProto
    const protocolHandle =
      (product.metadata?.protocol_handle as string) ||
      (product.metadata?.protocol_id as string)
    if (protocolHandle) {
      const proto = getCompoundProtocol(protocolHandle)
      if (proto && proto.id !== "generic-peptide") return proto
    }
    return getCompoundProtocol(product.handle || product.title)
  }, [passedProto, product.metadata, product.handle, product.title])

  const title = protocol?.title || `${compoundProto.compoundName} Laboratory Protocol & In-Vitro Handling Standard`
  const summary =
    protocol?.summary ||
    compoundProto.subtitle ||
    `Verified analytical protocol, reconstitution dilution ratios, and laboratory handling guidance for ${product.title}.`

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Beaker className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                Verified Laboratory Standard &middot; {compoundProto.purityStandard}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {compoundProto.category}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">
              {summary}
            </p>
          </div>
        </div>

        <LocalizedClientLink
          href={`/research-protocols/${protocol?.handle || compoundProto.id}`}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs shrink-0"
        >
          Study Protocol Page &rarr;
        </LocalizedClientLink>
      </div>

      {/* Top Parameter Metrics (4 Critical Analytical Standards) */}
      {compoundProto.isSupply && compoundProto.supplyGuide ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
              Physical Classification
            </span>
            <span className="font-bold text-slate-900 mt-1 block text-sm tracking-tight truncate">
              {compoundProto.supplyGuide.physicalState}
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed truncate">
              {compoundProto.subtitle}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
              Material Standard
            </span>
            <span className="font-bold text-slate-900 mt-1 block text-sm tracking-tight truncate">
              {compoundProto.supplyGuide.material}
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
              Laboratory Grade Specification
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs shadow-2xs">
            <span className="font-bold text-emerald-800 block text-[10px] uppercase tracking-wider">
              Sterility Standard
            </span>
            <span className="font-bold text-emerald-950 mt-1 block text-sm tracking-tight truncate">
              {compoundProto.supplyGuide.sterilityStandard}
            </span>
            <p className="text-emerald-700 text-[11px] mt-0.5 leading-relaxed truncate">
              {compoundProto.purityStandard || "Laboratory RUO Standard"}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
              Storage Specification
            </span>
            <span className="font-bold text-slate-900 mt-1 block text-sm tracking-tight truncate">
              {compoundProto.storage.reconstituted || compoundProto.storage.lyophilized}
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed truncate">
              {compoundProto.storage.lyophilized}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
              Target Solvent
            </span>
            <span className="font-bold text-slate-900 mt-1 block text-sm tracking-tight">
              BAC Water USP
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
              0.9% Benzyl Alcohol preserved
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
              Standard Diluent Ratio
            </span>
            <span className="font-bold text-slate-900 mt-1 block text-sm font-mono tracking-tight">
              {compoundProto.reconstitution.defaultDiluentMl.toFixed(1)} mL BAC Water
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
              Yields {compoundProto.reconstitution.resultingConcentrationMgPerMl.toFixed(1)} mg/mL concentration
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs shadow-2xs">
            <span className="font-bold text-emerald-800 block text-[10px] uppercase tracking-wider">
              Target Assay Concentration
            </span>
            <span className="font-bold text-emerald-950 mt-1 block text-sm font-mono tracking-tight">
              {compoundProto.dosing.standardDoseDisplay}
            </span>
            <p className="text-emerald-700 text-[11px] mt-0.5 leading-relaxed">
              {compoundProto.dosing.cadence}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
              Volumetric Mark
            </span>
            <span className="font-bold text-slate-900 mt-1 block text-sm font-mono tracking-tight">
              {compoundProto.syringeGuide.standardIUDisplay}
            </span>
            <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
              Standard U-100 (100 units = 1.0 mL = 1,000 µL)
            </p>
          </div>
        </div>
      )}

      {/* Pharmacological Profile & Mechanism of Action */}
      {compoundProto.longDescription && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-2.5">
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono">
                P
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Pharmacological Profile &amp; Mechanism of Action
              </h4>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              Research Monograph
            </span>
          </div>
          {renderFormattedParagraphs(compoundProto.longDescription)}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3-STAGE CLINICAL ROADMAP */}
      {/* ========================================================================= */}

      {/* STAGE 1: Reconstitution & Solvent Standards */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono shadow-2xs">
              1
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Stage 1: Reconstitution &amp; Solvent Standards
              </h4>
              <p className="text-[11px] text-slate-500">
                Physicochemical dissolution parameters and temperature stability windows.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200/80 px-2.5 py-0.5 rounded-full uppercase">
            Aseptic Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <span className="font-bold text-slate-900 block text-xs">
              Dissolution Technique &amp; Reconstitution Steps
            </span>
            <p className="text-slate-600 leading-relaxed">
              {compoundProto.reconstitution.dissolutionMethod}
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 font-mono">
              Formula: {compoundProto.reconstitution.defaultVialNetMg}mg lyophilized cake &divide; {compoundProto.reconstitution.defaultDiluentMl.toFixed(1)}mL diluent ={" "}
              <strong className="text-slate-900">{compoundProto.reconstitution.resultingConcentrationMgPerMl.toFixed(1)} mg/mL</strong> ({compoundProto.reconstitution.resultingConcentrationMgPerMl * 1000} mcg/mL)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
            <span className="font-bold text-slate-900 block text-xs">
              Storage &amp; Thermal Stability
            </span>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase shrink-0 mt-0.5">
                  Lyophilized
                </span>
                <span className="text-slate-700 leading-relaxed text-[11px]">
                  {compoundProto.storage.lyophilized}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 uppercase shrink-0 mt-0.5">
                  Reconstituted
                </span>
                <span className="text-slate-700 leading-relaxed text-[11px]">
                  {compoundProto.storage.reconstituted}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 leading-relaxed">
              &bull; Protect from UV radiation and direct artificial light. Avoid repeated freeze-thaw cycles once in aqueous solution.
            </p>
          </div>
        </div>
      </div>

      {/* STAGE 2: In-Vitro Concentration & Assay Schedule */}
      {(() => {
        const primaryRoute =
          compoundProto.primaryDeliveryRoute ||
          compoundProto.dosing?.deliveryRoute ||
          (compoundProto.oralGuide ? "oral" : compoundProto.nasalGuide ? "nasal" : "subq")

        const routeConfig = {
          subq: {
            label: "Subcutaneous (SubQ) Protocol",
            icon: "💉",
            badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
          },
          oral: {
            label: "Oral Liquid / Suspension Protocol",
            icon: "🧪",
            badge: "bg-amber-50 text-amber-800 border-amber-200/80",
          },
          nasal: {
            label: "Intranasal Metered Spray Protocol",
            icon: "👃",
            badge: "bg-sky-50 text-sky-800 border-sky-200/80",
          },
          topical: {
            label: "Topical Cosmeceutical Protocol",
            icon: "🧴",
            badge: "bg-purple-50 text-purple-800 border-purple-200/80",
          },
        }[primaryRoute] || {
          label: "Subcutaneous (SubQ) Protocol",
          icon: "💉",
          badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
        }

        const displayRouteLabel = compoundProto.dosing?.routeLabel || routeConfig.label

        return (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono shadow-2xs">
                  2
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">
                      Stage 2: Dosing Architecture &amp; Titration Timelines
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${routeConfig.badge}`}>
                      {routeConfig.icon} {displayRouteLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Peer-reviewed analytical concentration ranges, in-vitro half-life, and experimental assay schedule.
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">In-Vitro Half-Life</span>
                <span className="text-xs font-bold text-slate-900 font-mono">{compoundProto.dosing.halfLife}</span>
              </div>
            </div>

            {/* Multi-Route Notice */}
            {compoundProto.deliveryRoutes && compoundProto.deliveryRoutes.length > 1 && (
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-900">
                <div>
                  <strong>Multi-Route Literature Profile:</strong> Documented in scientific research for both{" "}
                  <strong>{compoundProto.deliveryRoutes.map((r) => r.toUpperCase()).join(" & ")}</strong> administration.
                  Below schedule calibrated for primary <strong>{displayRouteLabel}</strong>.
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded whitespace-nowrap">
                  Dual-Route Compound
                </span>
              </div>
            )}

            {/* Titration Steps Ladder */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
              <table className="table-fixed w-full min-w-[780px] text-left text-xs border-collapse">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[11%]" />
                  <col className="w-[21%]" />
                  <col className="w-[18%]" />
                  <col className="w-[28%]" />
                </colgroup>
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3.5 sm:px-4">Assay Stage</th>
                    <th className="py-3 px-3.5 sm:px-4">Timeframe</th>
                    <th className="py-3 px-3.5 sm:px-4">Target Mass / Concentration</th>
                    <th className="py-3 px-3.5 sm:px-4">Administration Cadence</th>
                    <th className="py-3 px-3.5 sm:px-4">Assay Focus &amp; Clinical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compoundProto.dosing.titrationSteps.map((step, idx) => {
                    const doseMatch = step.doseDisplay.match(/^(.*?)\s*\((or\s+[^)]+)\)$/i)
                    const mainDose = doseMatch ? doseMatch[1].trim() : step.doseDisplay
                    const altDose = doseMatch ? doseMatch[2].trim() : null

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          step.doseMcg > 0 && idx === 0 ? "bg-emerald-50/20" : ""
                        }`}
                      >
                        <td className="py-3.5 px-3.5 sm:px-4 align-top">
                          <div className="font-bold text-slate-900 text-xs leading-snug">
                            {step.stage}
                          </div>
                          {idx === 0 && step.doseMcg > 0 && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200/80">
                              Starting Baseline
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 sm:px-4 align-top">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80 font-mono text-slate-700 text-[11px] font-semibold whitespace-nowrap shadow-2xs">
                            {step.timeframe}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 sm:px-4 align-top">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold text-xs whitespace-nowrap shadow-2xs border ${
                                step.doseMcg > 0
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                  : "bg-slate-100 border-slate-200 text-slate-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                  step.doseMcg > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                }`}
                              />
                              <span>{mainDose}</span>
                            </span>
                            {altDose && (
                              <span className="text-[10px] font-mono font-medium text-slate-500 pl-0.5 whitespace-nowrap">
                                ({altDose})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 sm:px-4 align-top">
                          <div className="text-xs font-semibold text-slate-800 leading-snug">
                            {step.cadence}
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 sm:px-4 align-top">
                          <div className="font-medium text-slate-900 text-xs leading-relaxed">
                            {step.focus}
                          </div>
                          {step.notes && (
                          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-slate-50 border border-slate-200/80 p-2 text-[11px] font-mono text-slate-600 leading-relaxed">
                            <span className="text-emerald-600 font-bold shrink-0 text-xs mt-0.5">💉</span>
                            <span>{step.notes}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
              <div>
                Typical Assay Cycle: <span className="font-semibold text-slate-800">{compoundProto.dosing.typicalProtocolDuration}</span>
              </div>
              <div>
                Receptor Washout Window: <span className="font-semibold text-slate-800">{compoundProto.dosing.washoutPeriod}</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* STAGE 3: Volumetric Microliter (µL) Dispensing Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono shadow-2xs">
              3
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Stage 3: Volumetric Microliter (µL) Dispensing Matrix
              </h4>
              <p className="text-[11px] text-slate-500">
                Volumetric conversion from target research mass (mcg) to dispensing volume in microliters (µL) and 0.01 mL graduations.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
            100 IU = 1.0 mL (1 IU = 10 µL)
          </span>
        </div>

        {/* Calibrated Hardware Instrument Specification Card */}
        {compoundProto.syringeGuide && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-100 text-sky-800 text-[10px]">
                  ⚙️
                </span>
                <span>Calibrated Administration Instrument &amp; Needle Hardware Specification</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                Laboratory Standard (RUO)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Administration Needle</div>
                <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                  {compoundProto.syringeGuide.needleGauge || "31G Ultra-Fine (0.25 mm)"} &times; {compoundProto.syringeGuide.needleLength || '5/16" (8 mm)'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Short subq needle prevents IM penetration</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hub Retention &amp; Dead Space</div>
                <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                  {compoundProto.syringeGuide.hubType || "Fixed Ultra-Low Dead Space (<0.005 mL)"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Near-zero dead volume peptide entrapment</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommended Barrel Standard</div>
                <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                  {compoundProto.syringeGuide.recommendedBarrel || "0.3 mL (30-unit) or 0.5 mL (50-unit)"}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Wide graduations for precision micro-draws</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Diluent Transfer Needle</div>
                <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                  {compoundProto.syringeGuide.transferNeedle || '21G–23G × 1.5" Sterile Needle'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Preserves fine 31G tip for administration</div>
              </div>
            </div>
          </div>
        )}

        {/* Oral Guide Hardware Card if compound supports oral */}
        {compoundProto.oralGuide && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                <span>🧪</span>
                <span>Oral Research Suspension Dispenser Specification</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-md">
                Needle-Free Oral Pipette
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Dispenser Standard</div>
                <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                  {compoundProto.oralGuide.deviceLabel || "1.0 mL Calibrated Oral Dropper (0.1 mL marks)"}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Default Vehicle Volume</div>
                <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                  {compoundProto.oralGuide.defaultSuspensionMl || 10} mL liquid vehicle
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-amber-200">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Administration Mode</div>
                <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                  Oral research solution (needle-free)
                </div>
              </div>
            </div>
            {compoundProto.oralGuide.notes && (
              <p className="text-[11px] text-amber-800 pt-1">
                <strong>Oral Vehicle Notes:</strong> {compoundProto.oralGuide.notes}
              </p>
            )}
          </div>
        )}

        {/* Interactive Syringe Calibration & Reconstitution Stoichiometry */}
        {compoundProto.syringeGuide && (
          <InteractiveSyringeStoichiometry
            compoundId={compoundProto.id}
            compoundName={compoundProto.compoundName}
            vialMg={compoundProto.reconstitution.defaultVialNetMg}
            diluentMl={compoundProto.reconstitution.defaultDiluentMl}
            concMgMl={compoundProto.reconstitution.resultingConcentrationMgPerMl}
            standardDoseMcg={compoundProto.dosing.standardDoseMcg}
            standardDoseDisplay={compoundProto.dosing.standardDoseDisplay}
            graduations={compoundProto.syringeGuide.graduations}
            titrationSteps={compoundProto.dosing.titrationSteps}
            vialStrengthOptions={compoundProto.vialStrengthOptions}
            reconstitutionOptions={compoundProto.reconstitutionOptions}
            needleGauge={compoundProto.syringeGuide.needleGauge}
            needleLength={compoundProto.syringeGuide.needleLength}
            hubType={compoundProto.syringeGuide.hubType}
            recommendedBarrel={compoundProto.syringeGuide.recommendedBarrel}
            transferNeedle={compoundProto.syringeGuide.transferNeedle}
          />
        )}

        {/* Syringe Tick Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {compoundProto.syringeGuide.graduations.map((grad, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                grad.doseMcg === compoundProto.dosing.standardDoseMcg
                  ? "border-emerald-500 bg-emerald-50/90 ring-1 ring-emerald-400/40 shadow-xs"
                  : "border-slate-200 bg-white shadow-2xs hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Target Assay Mass
                </span>
                {grad.doseMcg === compoundProto.dosing.standardDoseMcg && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                    Standard
                  </span>
                )}
              </div>
              <div className="text-base font-bold text-slate-900 mt-1 font-mono">
                {grad.doseDisplay}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Dispense Vol:</span>
                <span className="font-bold text-emerald-800 font-mono">
                  {(grad.volumeMl * 1000).toFixed(0)} µL
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono text-right mt-0.5">
                ({grad.syringeIU.toFixed(1)} IU / {grad.volumeMl.toFixed(2)} mL)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Bridge & Reciprocal Links */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">
              Need custom dilution ratios or non-standard syringe measurements?
            </h4>
            <p className="text-xs text-slate-600">
              Launch the full interactive stoichiometry engine with {compoundProto.compoundName}&apos;s parameters pre-loaded.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {onNavigateToCalculator && (
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                Load Into Calculator &rarr;
              </button>
            )}
            <LocalizedClientLink
              href="/research-library#calculator"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
            >
              Full Library Tool &rarr;
            </LocalizedClientLink>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <DocumentText className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Comparing mechanisms or multi-pathway research synergies?
            </span>
          </div>
          <LocalizedClientLink
            href="/research-library#comparisons"
            className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline shrink-0"
          >
            Head-to-Head Peptide Comparisons &rarr;
          </LocalizedClientLink>
        </div>
      </div>

      {/* Regulatory & Safety Disclaimer */}
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
        <span className="font-bold text-slate-900 uppercase tracking-wider shrink-0 text-[10px] bg-slate-200/80 px-2 py-0.5 rounded-md">
          Laboratory Notice
        </span>
        <span>{compoundProto.disclaimer}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2b. Customer Research Hub Panel (Exclusive Client Suite)
// ---------------------------------------------------------------------------
const CustomerResearchHubPanel = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const scrollToBuyBox = () => {
    const buyBox =
      document.querySelector('[data-testid="product-actions"]') ||
      document.getElementById("product-actions")
    if (buyBox) {
      buyBox.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      window.scrollTo({ top: 300, behavior: "smooth" })
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <svg
              className="h-5 w-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                Verified Client Suite &middot; Order Unlocked
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Linked to {product.title}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Customer Research Hub
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Every verified procurement unlocks dedicated laboratory toolsets, analytical documentation monographs, and proactive refill telemetry directly in your client dashboard.
            </p>
          </div>
        </div>
        <LocalizedClientLink
          href="/account/research-hub"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs shrink-0"
        >
          Open Client Portal &rarr;
        </LocalizedClientLink>
      </div>

      {/* 3 Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Analytical Monograph Documentation */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100/80 text-emerald-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 uppercase">
              Reference Standard
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Analytical Monograph &amp; Documentation
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Access analytical release documentation and reference monographs tied to your order lot number. Review molecular specifications and handling guidelines before protocol initiation.
            </p>
          </div>
        </div>

        {/* Card 2: Interactive Routine Scheduler */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100/80 text-blue-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 uppercase">
              Calendar Sync
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              1-Click Protocol Scheduler
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Generate calendar-mapped schedules based on your calculated reconstitution concentration and planned trial cadence. Export to Google Calendar, Apple iCal, or Outlook.
            </p>
          </div>
        </div>

        {/* Card 3: Vial Depletion & Refill Projection */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-amber-100/80 text-amber-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 uppercase">
              Automated Telemetry
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Depletion &amp; Refill Projections
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Track reconstituted vial stability windows (28-day cold storage limits) and forecast depletion dates. Prevent protocol interruptions with priority 1-click re-order reminders.
            </p>
          </div>
        </div>
      </div>

      {/* Commercial Gateway Callout */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-950">
            <CheckCircleSolid className="h-4 w-4 text-emerald-600 inline shrink-0" />
            <span>Ready to activate your Research Hub workspace?</span>
          </div>
          <p className="text-xs text-emerald-800/90 leading-relaxed">
            Order {product.title} to automatically unlock this compound&apos;s lot records and analytical dossier in your client account.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={scrollToBuyBox}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs text-center cursor-pointer"
          >
            Order Compound to Unlock &uarr;
          </button>
          <LocalizedClientLink
            href="/account/research-hub"
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold transition-colors shadow-2xs text-center"
          >
            Client Portal Sign In &rarr;
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. Aseptic Supplies & Hardware Standard Operating Procedure (SOP) Guide
// ---------------------------------------------------------------------------
const AsepticSuppliesGuide = ({
  compoundProto,
}: {
  compoundProto: CompoundAnalyticalProtocol
}) => {
  const guide = compoundProto.supplyGuide
  const specs = guide?.specs ? Object.entries(guide.specs) : []
  const steps = guide?.protocolSteps ?? []
  const features = guide?.features ?? []
  const inclusions = guide?.inclusions ?? []

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <Beaker className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                Laboratory Equipment &amp; Consumables SOP
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                GLP Laboratory Consumables Standard
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {compoundProto.compoundName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">
              {compoundProto.subtitle}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shrink-0">
          <CheckCircleSolid className="h-4 w-4 text-emerald-600" />
          <span>Aseptic Protocol Verified</span>
        </span>
      </div>

      {/* 2. Key Technical Specifications Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Technical Labware Specifications
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Standard: {guide?.sterilityStandard || compoundProto.purityStandard}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
              Physical State &amp; Class
            </span>
            <span className="font-bold text-slate-900 mt-1 block text-sm tracking-tight">
              {guide?.physicalState || "Laboratory Consumable"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
              Primary Material
            </span>
            <span className="font-bold text-slate-900 mt-1 block text-sm tracking-tight">
              {guide?.material || "High-Density Polymer"}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
            <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
              Sterility &amp; Barrier
            </span>
            <span className="font-bold text-slate-900 mt-1 block text-sm tracking-tight">
              {guide?.sterilityStandard || "Aseptic Standard"}
            </span>
          </div>
          {specs.map(([key, val]) => (
            <div key={key} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs shadow-2xs">
              <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                {key}
              </span>
              <span className="font-bold text-slate-900 mt-1 block text-sm tracking-tight">
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Standard Operating Procedure (SOP) */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Standard Operating Procedure (SOP) &amp; Handling Protocol
          </h4>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
            4-Step Aseptic Standard
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex gap-3.5 items-start shadow-2xs"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold font-mono shadow-xs">
                {step.stepNumber}
              </span>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  {step.title}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.instruction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Engineering & Integrity Highlights */}
      {features.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Engineering &amp; Integrity Standards
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/70 bg-white shadow-2xs space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    {feat.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-4">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Package Inclusions & Manifest */}
      {inclusions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Package Contents &amp; Labware Manifest
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {inclusions.map(([item, desc], idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/60 text-xs"
              >
                <span className="font-bold text-slate-900 block">{item}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Storage & Regulatory Notice */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex gap-3 items-start">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
          !
        </div>
        <div className="space-y-1">
          <span className="font-bold block">Laboratory Research Handling Standard</span>
          <p className="text-[11px] text-amber-900/90 leading-relaxed">
            {compoundProto.disclaimer}
          </p>
          <div className="pt-1 text-[11px] text-amber-800/80 flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>Dry / Ambient Storage:</strong> {compoundProto.storage.lyophilized}</span>
            <span><strong>Operating / Liquid Condition:</strong> {compoundProto.storage.reconstituted}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. Interactive Reconstitution Calculator (Compound-Aware Defaults)
// ---------------------------------------------------------------------------
const PeptideReconstitutionCalculator = ({
  product,
  compoundProto,
}: {
  product: HttpTypes.StoreProduct
  compoundProto: CompoundAnalyticalProtocol
}) => {

  const isIUCompound =
    compoundProto.calculator?.targetAmountUnit === "IU" ||
    compoundProto.id === "hgh-somatropin" ||
    compoundProto.id === "hmg-75iu"

  const contentOption = product.options?.find(
    (o) =>
      o.title?.toLowerCase().includes("content") ||
      o.title?.toLowerCase().includes("net")
  )

  const contentValues = useMemo(() => {
    if (!contentOption?.values) return []
    return contentOption.values
      .map((v) => {
        const match = v.value.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu)/i)
        if (!match) return null
        const amount = parseFloat(match[1])
        const unit = match[2].toLowerCase()
        let mcg = amount
        if (unit === "mg") {
          mcg = amount * 1000
        } else if (unit === "iu") {
          if (compoundProto.id === "hgh-somatropin") {
            // 1 mg = 3.0 IU of Somatropin -> mcg = (amount / 3) * 1000
            mcg = (amount / 3) * 1000
          } else if (compoundProto.id === "hmg-75iu") {
            // Standardized 75 IU menotropins vial
            mcg = 1000
          }
        }
        return { label: v.value, mcg, rawAmount: amount, unit }
      })
      .filter(Boolean) as { label: string; mcg: number; rawAmount: number; unit: string }[]
  }, [contentOption, compoundProto.id])

  const defaultContent = useMemo(() => {
    return (
      contentValues[0] ?? {
        label: isIUCompound && compoundProto.calculator?.defaultCompoundMass
          ? `${compoundProto.calculator.defaultCompoundMass} IU`
          : `${compoundProto.reconstitution.defaultVialNetMg} mg`,
        mcg: isIUCompound && compoundProto.id === "hgh-somatropin"
          ? (24 / 3) * 1000
          : compoundProto.reconstitution.defaultVialNetMg * 1000,
        rawAmount: isIUCompound ? (compoundProto.id === "hgh-somatropin" ? 24 : 75) : compoundProto.reconstitution.defaultVialNetMg,
        unit: isIUCompound ? "iu" : "mg",
      }
    )
  }, [contentValues, isIUCompound, compoundProto])


  const dosePresets = useMemo(() => {
    if (compoundProto.id === "hgh-somatropin") {
      // Dose presets in mcg equivalent: 1 IU (333), 1.5 IU (500), 2 IU (667), 2.5 IU (833), 3 IU (1000), 4 IU (1333)
      return [333, 500, 667, 833, 1000, 1333]
    }
    if (compoundProto.id === "hmg-75iu") {
      // 25 IU (333), 37.5 IU (500), 50 IU (667), 75 IU (1000)
      return [333, 500, 667, 1000]
    }
    if (compoundProto.id === "tirzepatide") {
      return [1250, 2500, 5000, 7500, 10000, 15000]
    }
    if (compoundProto.id === "ghk-cu") {
      return [500, 1000, 1500, 2000, 2500, 3000]
    }

    const gathered = new Set<number>()

    if (compoundProto.syringeGuide?.graduations) {
      for (const grad of compoundProto.syringeGuide.graduations) {
        if (grad.doseMcg && grad.doseMcg > 0) {
          gathered.add(grad.doseMcg)
        }
      }
    }

    if (compoundProto.dosing?.titrationSteps) {
      for (const step of compoundProto.dosing.titrationSteps) {
        if (step.doseMcg && step.doseMcg > 0) {
          gathered.add(step.doseMcg)
        }
      }
    }

    if (compoundProto.dosing?.standardDoseMcg && compoundProto.dosing.standardDoseMcg > 0) {
      gathered.add(compoundProto.dosing.standardDoseMcg)
    }

    if (gathered.size >= 2) {
      return Array.from(gathered).sort((a, b) => a - b)
    }

    const vialMg = compoundProto.reconstitution?.defaultVialNetMg || 10
    if (vialMg >= 500) {
      return [50000, 100000, 200000, 300000, 500000]
    }
    if (vialMg >= 20) {
      return [1000, 2000, 3000, 5000, 7500, 10000]
    }
    return [100, 200, 250, 300, 500, 750, 1000]
  }, [compoundProto])

  const [selectedContent, setSelectedContent] = useState(defaultContent)
  const [diluentMl, setDiluentMl] = useState(compoundProto.reconstitution.defaultDiluentMl)
  const [doseMcg, setDoseMcg] = useState(compoundProto.dosing.standardDoseMcg)

  // Route-of-Administration: default to first route, or "subq" if absent
  const deliveryRoutes = compoundProto.deliveryRoutes ?? ["subq"]
  const [activeRoute, setActiveRoute] = useState<string>(deliveryRoutes[0])

  // Nasal atomizer diluent state — separate from SubQ diluent
  const nasalDiluentOptions = compoundProto.nasalGuide?.recommendedDiluentMlOptions ?? [5.0]
  const [nasalDiluentMl, setNasalDiluentMl] = useState(
    compoundProto.nasalGuide?.defaultDiluentMl ?? 5.0
  )

  useEffect(() => {
    setSelectedContent(defaultContent)
    setDiluentMl(compoundProto.reconstitution.defaultDiluentMl)
    setDoseMcg(compoundProto.dosing.standardDoseMcg)
    setActiveRoute((compoundProto.deliveryRoutes ?? ["subq"])[0])
    setNasalDiluentMl(compoundProto.nasalGuide?.defaultDiluentMl ?? 5.0)
  }, [compoundProto.id, defaultContent, compoundProto.reconstitution.defaultDiluentMl, compoundProto.dosing.standardDoseMcg, compoundProto.deliveryRoutes, compoundProto.nasalGuide?.defaultDiluentMl])

  const concentration = selectedContent.mcg / diluentMl

  const formatDosePresetLabel = (preset: number) => {
    if (compoundProto.id === "hgh-somatropin") {
      const iu = (preset * 3) / 1000
      return `${Number(iu.toFixed(1))} IU`
    }
    if (compoundProto.id === "hmg-75iu") {
      const iu = (preset / 1000) * 75
      return `${Number(iu.toFixed(1))} IU`
    }
    if (preset >= 1000) {
      const mg = preset / 1000
      return `${Number(mg.toFixed(mg % 1 === 0 ? 0 : 2))} mg`
    }
    return `${preset} mcg`
  }

  // Nasal atomizer math (derived from protocol data)
  const nasalPumpVolumeMl = compoundProto.nasalGuide?.pumpVolumeMl ?? 0.10
  const nasalVialMcg = selectedContent.mcg
  const nasalConcentrationMcgPerMl = nasalVialMcg / nasalDiluentMl
  const nasalMcgPerSpray = nasalPumpVolumeMl * nasalConcentrationMcgPerMl
  const nasalSpraysPerBottle = Math.floor(nasalDiluentMl / nasalPumpVolumeMl)
  const nasalSpraysForDose = doseMcg / nasalMcgPerSpray

  // Oral dropper math (derived from protocol data)
  const oralConcentrationMcgPerMl = selectedContent.mcg / (compoundProto.oralGuide?.defaultSuspensionMl ?? compoundProto.reconstitution.defaultDiluentMl)
  const oralVolumePerDoseMl = doseMcg / oralConcentrationMcgPerMl

  const ROUTE_LABELS: Record<string, string> = {
    subq: "SubQ Syringe",
    nasal: "Nasal Atomizer",
    oral: "Oral Dropper",
    topical: "Topical",
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold font-mono">
              calc
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Reconstitution Calculator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculate reconstitution dilution, per-dose volume, and syringe graduations for {product.title}.
          </p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 font-medium">
          Recommended Standard Dose: <strong className="font-bold">{compoundProto.dosing.standardDoseDisplay}</strong>
        </div>
      </div>

      {/* Route-of-Administration Selector — only shown when >1 route exists */}
      {deliveryRoutes.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-700">Administration Route</span>
          <div className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200/80 rounded-2xl w-fit">
            {deliveryRoutes.map((route) => (
              <button
                key={route}
                type="button"
                onClick={() => setActiveRoute(route)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeRoute === route
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                {ROUTE_LABELS[route] ?? route}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SubQ Syringe Calculator — shown when activeRoute is "subq" */}
      {activeRoute === "subq" && (
        <div className="pt-2">
          <InteractiveSyringeStoichiometry
            compoundId={compoundProto.id}
            compoundName={compoundProto.compoundName}
            subtitle={compoundProto.subtitle}
            vialMg={selectedContent.rawAmount}
            diluentMl={diluentMl}
            concMgMl={concentration / 1000}
            standardDoseMcg={doseMcg}
            standardDoseDisplay={formatDosePresetLabel(doseMcg)}
            graduations={compoundProto.syringeGuide?.graduations}
            titrationSteps={compoundProto.dosing?.titrationSteps}
            vialStrengthOptions={compoundProto.vialStrengthOptions}
            reconstitutionOptions={compoundProto.reconstitutionOptions}
            needleGauge={compoundProto.syringeGuide?.needleGauge}
            needleLength={compoundProto.syringeGuide?.needleLength}
            hubType={compoundProto.syringeGuide?.hubType}
            recommendedBarrel={compoundProto.syringeGuide?.recommendedBarrel}
            transferNeedle={compoundProto.syringeGuide?.transferNeedle}
            syringeType={compoundProto.syringeGuide?.syringeType}
            standardIUDisplay={compoundProto.syringeGuide?.standardIUDisplay}
          />
        </div>
      )}

      {/* Nasal Atomizer Calculator */}
      {activeRoute === "nasal" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Nasal Controls */}
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">1. Diluent Volume (Reconstitution in Nasal Bottle)</span>
              <div className="flex flex-wrap gap-2">
                {nasalDiluentOptions.map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setNasalDiluentMl(vol)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      nasalDiluentMl === vol
                        ? "border-blue-600 bg-blue-50/90 text-blue-950 font-bold shadow-2xs ring-1 ring-blue-500/30"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {vol} mL
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Concentration:{" "}
                <span className="font-bold text-slate-800">
                  {nasalConcentrationMcgPerMl >= 1000
                    ? `${(nasalConcentrationMcgPerMl / 1000).toFixed(2)} mg/mL`
                    : `${nasalConcentrationMcgPerMl.toFixed(1)} mcg/mL`}
                </span>
                {" "}— {nasalMcgPerSpray.toFixed(1)} mcg per 0.10 mL spray
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">2. Target Dose</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">
                  {formatDosePresetLabel(doseMcg)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dosePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDoseMcg(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      doseMcg === preset
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {formatDosePresetLabel(preset)}
                  </button>
                ))}
              </div>
            </div>

            {compoundProto.nasalGuide?.notes && (
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/80 p-3 leading-relaxed">
                {compoundProto.nasalGuide.notes}
              </p>
            )}
          </div>

          {/* Right: Nasal Results */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Nasal Atomizer Spray Outputs
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <div className="text-xl font-bold text-blue-900 tabular-nums">
                  {nasalMcgPerSpray < 1
                    ? nasalMcgPerSpray.toFixed(2)
                    : Math.round(nasalMcgPerSpray)}
                  <span className="text-xs font-normal text-slate-500 ml-0.5">mcg</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Per Spray</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <div className="text-xl font-bold text-blue-800 tabular-nums">
                  {nasalSpraysForDose < 0.1
                    ? "<0.1"
                    : nasalSpraysForDose % 1 === 0
                    ? nasalSpraysForDose.toFixed(0)
                    : nasalSpraysForDose.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Sprays / Dose</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <div className="text-xl font-bold text-slate-900 tabular-nums">
                  {nasalSpraysPerBottle}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Sprays / Bottle</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed border-t border-blue-200/80 pt-3">
              {compoundProto.reconstitution.defaultVialNetMg} mg dissolved in {nasalDiluentMl} mL —{" "}
              metered pump ({nasalPumpVolumeMl * 1000} μL/actuation) yields{" "}
              {Math.round(nasalMcgPerSpray)} mcg/spray.{" "}
              {nasalSpraysPerBottle} total sprays from one bottle.{" "}
              {compoundProto.nasalGuide?.deviceLabel ?? "Amber nasal spray bottle"}.
            </p>
          </div>
        </div>
      )}

      {/* Oral Dropper Calculator */}
      {activeRoute === "oral" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">Target Dose</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Current selection:</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">
                  {formatDosePresetLabel(doseMcg)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dosePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDoseMcg(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      doseMcg === preset
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {formatDosePresetLabel(preset)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-700">Solution Details</div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Vial Mass</span>
                <span className="font-bold text-slate-800">{selectedContent.label}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Suspension Volume</span>
                <span className="font-bold text-slate-800">
                  {compoundProto.oralGuide?.defaultSuspensionMl ?? compoundProto.reconstitution.defaultDiluentMl} mL
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Concentration</span>
                <span className="font-bold text-slate-800">
                  {(oralConcentrationMcgPerMl / 1000).toFixed(1)} mg/mL
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Device</span>
                <span className="font-bold text-slate-800">
                  {compoundProto.oralGuide?.deviceLabel ?? "Calibrated oral dropper"}
                </span>
              </div>
            </div>

            {compoundProto.oralGuide?.notes && (
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/80 p-3 leading-relaxed">
                {compoundProto.oralGuide.notes}
              </p>
            )}
          </div>

          {/* Right: Oral Results */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Oral Dropper Dose Outputs
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs">
                <div className="text-2xl font-bold text-amber-900 tabular-nums">
                  {oralVolumePerDoseMl < 0.01
                    ? "<0.01"
                    : oralVolumePerDoseMl.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500 ml-1">mL</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Volume per Dose</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs">
                <div className="text-2xl font-bold text-amber-800 tabular-nums">
                  {(selectedContent.mcg / doseMcg) < 1
                    ? "<1"
                    : (selectedContent.mcg / doseMcg) % 1 === 0
                    ? (selectedContent.mcg / doseMcg).toFixed(0)
                    : (selectedContent.mcg / doseMcg).toFixed(1)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Doses per Vial</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed border-t border-amber-200/80 pt-3">
              Administer {oralVolumePerDoseMl.toFixed(2)} mL per {formatDosePresetLabel(doseMcg)} dose
              using a calibrated dropper. Oral solution at
              {" "}{(oralConcentrationMcgPerMl / 1000).toFixed(1)} mg/mL.
              For laboratory evaluation only.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const ReconstitutionTab = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const compoundProto = useMemo(() => {
    const protocolHandle =
      (product.metadata?.protocol_handle as string) ||
      (product.metadata?.protocol_id as string)
    if (protocolHandle) {
      const proto = getCompoundProtocol(protocolHandle)
      if (proto && proto.id !== "generic-peptide") return proto
    }
    return getCompoundProtocol(product.handle || product.title)
  }, [product.metadata, product.handle, product.title])

  if (compoundProto.isSupply || compoundProto.category === "Laboratory Supplies") {
    return <AsepticSuppliesGuide compoundProto={compoundProto} />
  }

  return (
    <PeptideReconstitutionCalculator
      product={product}
      compoundProto={compoundProto}
    />
  )
}

// ---------------------------------------------------------------------------
// 5. Compliance & Safety Accordion
// ---------------------------------------------------------------------------
const ComplianceSafetyAccordion = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const compliance = (product.metadata?.compliance as Record<string, string>) || {}

  const storageText =
    compliance.storage_and_handling ||
    "Store lyophilized compound at -20°C in a dry environment protected from light. Once reconstituted with Bacteriostatic Water, keep refrigerated at 2°C–8°C and use within 28 days for maximum stability. Avoid repeated freeze-thaw cycles."

  const intendedUseText =
    compliance.intended_use ||
    "Synthesized strictly for in-vitro laboratory research, analytical calibration, and scientific evaluation. Not for human, clinical, veterinary, therapeutic, or household administration."

  const termsOfSaleText =
    compliance.terms_of_sale ||
    "Purchaser must be an authorized investigator or institutional buyer aged 18+. Purchase constitutes agreement to handle all materials strictly according to standard biosafety and chemical safety protocols."

  const disclaimerText =
    compliance.disclaimer ||
    "This investigational chemical has not been evaluated or approved by the Philippine Food and Drug Administration (FDA) for the treatment, cure, or diagnosis of any disease or condition."

  const packagingOptionsText =
    compliance.packaging_options ||
    "Dispatched in sterile crimped vials with tamper-evident security caps. Available as standalone vials, with USP Bacteriostatic Water, or as Complete SubQ assembly kits with sterile administration supplies."

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircleSolid className="h-5 w-5 text-emerald-600" />
        <h3 className="text-base font-bold text-slate-900">Compliance &amp; Safety</h3>
      </div>
      <Accordion type="multiple">
        <Accordion.Item title="Storage & Handling" value="storage">
          <div className="py-3 text-xs leading-relaxed text-slate-600">
            {storageText}
          </div>
        </Accordion.Item>
        <Accordion.Item title="Intended Laboratory Use" value="intended-use">
          <div className="py-3 text-xs leading-relaxed text-slate-600">
            {intendedUseText}
          </div>
        </Accordion.Item>
        <Accordion.Item title="Terms of Research Sale" value="terms">
          <div className="py-3 text-xs leading-relaxed text-slate-600">
            {termsOfSaleText}
          </div>
        </Accordion.Item>
        <Accordion.Item title="Regulatory Disclaimer" value="disclaimer">
          <div className="py-3 text-xs leading-relaxed text-slate-600">
            {disclaimerText}
          </div>
        </Accordion.Item>
        <Accordion.Item title="Packaging & Logistics" value="packaging">
          <div className="py-3 text-xs leading-relaxed text-slate-600">
            {packagingOptionsText}
          </div>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5. Shipping & Transit Policy
// ---------------------------------------------------------------------------
const ShippingInfoTab = () => {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-start gap-x-3">
          <FastDelivery />
          <div>
            <span className="font-semibold text-zinc-900 text-xs">Expedited Delivery (Philippines)</span>
            <p className="text-zinc-600 text-xs mt-1 leading-relaxed">
              Dispatched with temperature-stable protective packaging via insured courier service. Standard transit is 2–4 business days across NCR and Provincial locations.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Refresh />
          <div>
            <span className="font-semibold text-zinc-900 text-xs">Transit Protection &amp; Replacement</span>
            <p className="text-zinc-600 text-xs mt-1 leading-relaxed">
              Every shipment is sealed in tamper-evident packaging with shock-absorbing foam. In the rare event of transit damage, replacement is handled immediately through Live Support.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Back />
          <div>
            <span className="font-semibold text-zinc-900 text-xs">Batch Integrity Policy</span>
            <p className="text-zinc-600 text-xs mt-1 leading-relaxed">
              To maintain strict sterility, laboratory compounds cannot be restocked once opened. Unopened items with unbroken security seals are eligible for return evaluation within 7 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
