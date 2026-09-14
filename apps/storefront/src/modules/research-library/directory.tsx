"use client"

/**
 * @file    apps/storefront/src/modules/research-library/directory.tsx
 * @module  ResearchLibraryDirectory (Research Library Storefront)
 * @purpose Renders the comprehensive research library directory, protocol search, calculators, and comparisons.
 * @contracts
 *   Service: ResearchProtocolModuleService · ResearchContentModuleService
 */

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useMemo, useState } from "react"
import type { StoreResearchProtocol } from "@lib/data/research-protocols"
import type { ResearchArticle } from "@lib/data/research-articles"
import type { PeptideComparison } from "@lib/data/peptide-comparisons"
import StandaloneReconstitutionCalculator from "@modules/research-protocols/standalone-calculator"
import StackCompatibilityChecker from "@modules/research-protocols/components/stack-compatibility-checker"
import PeptideComparisonsDirectory from "./comparisons"
import CoaDirectoryPanel from "./coa-directory-panel"
import { MasterPeptideDosageChart } from "@modules/research-protocols/components/master-peptide-dosage-chart"
import { DocumentText, Beaker, ArrowRightMini } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

type Props = {
  protocols: StoreResearchProtocol[]
  articles: ResearchArticle[]
  comparisons: PeptideComparison[]
  products?: HttpTypes.StoreProduct[]
  countryCode?: string
  initialTab?: TabType
  initialCompoundsQuery?: string
}

type TabType = "articles" | "comparisons" | "protocols" | "stacks" | "chart" | "calculator" | "coa"

const normalize = (value: string | null | undefined) =>
  (value || "").trim().toLocaleLowerCase()

// Helper to identify supplies
const isSupplyProtocol = (p: StoreResearchProtocol) =>
  p.content?.category === "Laboratory Supplies" ||
  Boolean(
    (p.content as Record<string, unknown> | null | undefined)?.isSupply
  ) ||
  Boolean(p.content?.product_format?.toLowerCase().includes("consumable")) ||
  Boolean(p.content?.product_format?.toLowerCase().includes("hardware")) ||
  Boolean(p.content?.product_format?.toLowerCase().includes("labware"))

// Helper to identify bundles
const isBundleProtocol = (p: StoreResearchProtocol) =>
  !isSupplyProtocol(p) &&
  (p.content?.protocol_category_type === "bundle" ||
    Boolean(p.content?.bundle_vials && p.content.bundle_vials.length > 0))

// Helper to identify blends
const isBlendProtocol = (p: StoreResearchProtocol) =>
  !isSupplyProtocol(p) &&
  !isBundleProtocol(p) &&
  p.content?.protocol_category_type === "blend"

// Helper to identify single/topical
const isSingleProtocol = (p: StoreResearchProtocol) =>
  !isSupplyProtocol(p) && !isBundleProtocol(p) && !isBlendProtocol(p)

export default function ResearchLibraryDirectory({
  protocols,
  articles,
  comparisons,
  products,
  countryCode = "ph",
  initialTab,
  initialCompoundsQuery,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || "articles")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [stackObjective, setStackObjective] = useState<string>("all")
  const [protocolSegment, setProtocolSegment] = useState<
    "all" | "single_peptide" | "blend" | "bundle" | "supply"
  >("all")

  const activeCompoundIds = useMemo(() => {
    if (!initialCompoundsQuery) return []
    return initialCompoundsQuery
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  }, [initialCompoundsQuery])

  // Hash deep-linking listener
  useEffect(() => {
    const handleHash = (shouldScroll = false) => {
      const hash = window.location.hash.toLowerCase().replace("#", "")
      if (
        hash === "chart" ||
        hash === "calculator" ||
        hash === "comparisons" ||
        hash === "protocols" ||
        hash === "stacks" ||
        hash === "articles" ||
        hash === "coa"
      ) {
        setActiveTab(hash as TabType)
        if (shouldScroll) {
          setTimeout(() => {
            const el = document.getElementById("research-library-tabs")
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          }, 50)
        }
      }
    }
    if (window.location.hash) {
      handleHash(true)
    }
    const onHashChange = () => handleHash(true)
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  // Sanitize protocols: collapse any duplicate handles
  const sanitizedProtocols = useMemo(() => {
    const seen = new Set<string>()
    return protocols.filter((p) => {
      const norm = p.handle.replace(/-laboratory-handling$/, "").replace(/-protocol$/, "")
      if (seen.has(norm)) return false
      seen.add(norm)
      return true
    })
  }, [protocols])

  // Count supplies, bundles, blends, and single peptides accurately
  const supplyCount = useMemo(() => {
    return sanitizedProtocols.filter((p) => isSupplyProtocol(p)).length
  }, [sanitizedProtocols])

  const bundleCount = useMemo(() => {
    return sanitizedProtocols.filter((p) => isBundleProtocol(p)).length
  }, [sanitizedProtocols])

  const blendCount = useMemo(() => {
    return sanitizedProtocols.filter((p) => isBlendProtocol(p)).length
  }, [sanitizedProtocols])

  const singleCount = useMemo(() => {
    return sanitizedProtocols.filter((p) => isSingleProtocol(p)).length
  }, [sanitizedProtocols])

  // Collect unique categories across both protocols and articles
  const categories = useMemo(() => {
    const set = new Set<string>()
    sanitizedProtocols.forEach((p) => {
      if (p.content?.category) set.add(p.content.category)
    })
    articles.forEach((a) => {
      if (a.category) set.add(a.category)
    })
    return Array.from(set).sort()
  }, [sanitizedProtocols, articles])

  // Filtered articles
  const visibleArticles = useMemo(() => {
    const q = normalize(query)
    return articles.filter((article) => {
      const matchesQuery =
        !q ||
        [
          article.title,
          article.subtitle,
          article.abstract,
          article.compound_tag,
          article.category,
        ].some((val) => normalize(val).includes(q))
      const matchesCategory =
        category === "all" || article.category === category
      return matchesQuery && matchesCategory
    })
  }, [articles, category, query])

  // Filtered protocols
  const visibleProtocols = useMemo(() => {
    const q = normalize(query)
    return sanitizedProtocols.filter((protocol) => {
      const isSupply = isSupplyProtocol(protocol)
      const isBundle = isBundleProtocol(protocol)
      const isBlend = isBlendProtocol(protocol)
      const isSingle = isSingleProtocol(protocol)

      const matchesSegment =
        protocolSegment === "all" ||
        (protocolSegment === "supply" && isSupply) ||
        (protocolSegment === "bundle" && isBundle) ||
        (protocolSegment === "blend" && isBlend) ||
        (protocolSegment === "single_peptide" && isSingle)

      const matchesQuery =
        !q ||
        [
          protocol.title,
          protocol.summary,
          protocol.content?.compound_name,
          protocol.content?.short_introduction,
          protocol.content?.category,
          protocol.content?.purity_standard,
        ].some((val) => normalize(val).includes(q))

      const matchesCategory =
        category === "all" || protocol.content?.category === category

      const matchesCompoundFilter =
        activeCompoundIds.length === 0 ||
        activeCompoundIds.some((id) => {
          const normHandle = protocol.handle.toLowerCase()
          const normTitle = (protocol.content?.compound_name || protocol.title).toLowerCase()
          return normHandle.includes(id) || normTitle.includes(id) || id.includes(normHandle)
        })

      return matchesSegment && matchesQuery && matchesCategory && matchesCompoundFilter
    })
  }, [category, sanitizedProtocols, query, protocolSegment, activeCompoundIds])

  const bundleProtocols = useMemo(() => {
    return sanitizedProtocols.filter((p) => isBundleProtocol(p))
  }, [sanitizedProtocols])

  const visibleStacks = useMemo(() => {
    const q = normalize(query)
    return bundleProtocols.filter((protocol) => {
      const content = protocol.content
      const textToSearch = [
        protocol.title,
        content?.compound_name,
        content?.short_introduction,
        content?.category,
        ...(content?.investigated_benefits || []),
        ...(content?.bundle_vials?.map((v) => `${v.compoundName} ${v.vialNetMass}`) || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesQuery = !q || textToSearch.includes(q)

      let matchesObjective = true
      if (stackObjective !== "all") {
        const obj = stackObjective.toLowerCase()
        if (obj === "tissue") {
          matchesObjective =
            textToSearch.includes("bpc") ||
            textToSearch.includes("tb-500") ||
            textToSearch.includes("repair") ||
            textToSearch.includes("tissue") ||
            textToSearch.includes("musculoskeletal")
        } else if (obj === "gh") {
          matchesObjective =
            textToSearch.includes("cjc") ||
            textToSearch.includes("ipam") ||
            textToSearch.includes("growth hormone") ||
            textToSearch.includes("somatotropic") ||
            textToSearch.includes("pulse")
        } else if (obj === "metabolic") {
          matchesObjective =
            textToSearch.includes("tirzepatide") ||
            textToSearch.includes("aod") ||
            textToSearch.includes("lipolysis") ||
            textToSearch.includes("metabolic") ||
            textToSearch.includes("adipose")
        } else if (obj === "cognitive") {
          matchesObjective =
            textToSearch.includes("semax") ||
            textToSearch.includes("selank") ||
            textToSearch.includes("bdnf") ||
            textToSearch.includes("neuro") ||
            textToSearch.includes("cognitive")
        } else if (obj === "photoprotection") {
          matchesObjective =
            textToSearch.includes("melanotan") ||
            textToSearch.includes("pt-141") ||
            textToSearch.includes("libido") ||
            textToSearch.includes("photoprotection") ||
            textToSearch.includes("melanocortin")
        } else if (obj === "longevity") {
          matchesObjective =
            textToSearch.includes("epithalon") ||
            textToSearch.includes("nad") ||
            textToSearch.includes("glutathione") ||
            textToSearch.includes("ghk-cu") ||
            textToSearch.includes("longevity") ||
            textToSearch.includes("cellular")
        }
      }

      return matchesQuery && matchesObjective
    })
  }, [bundleProtocols, query, stackObjective])

  return (
    <div className="bg-white min-h-screen">
      {/* ── Clinical Header Banner with Integrated Flush Sub-Nav ── */}
      <div className="border-b border-slate-200 bg-slate-50/80 text-slate-900 pt-8 small:pt-12 print:hidden">
        <div className="content-container">
          <div className="max-w-3xl mb-8 small:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Open Research Library · Free Scientific Reference
            </div>
            <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Research Library &amp; Scientific Protocols
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Peer-reviewed compound monographs, head-to-head peptide comparisons, product protocols, and precision diluent stoichiometry.
            </p>
          </div>

          {/* ── 4-Pillar Flush Header Sub-Navigation ── */}
          <div id="research-library-tabs" className="flex items-center gap-1 sm:gap-6 overflow-x-auto no-scrollbar -mb-px scroll-mt-24">
            {/* Tab 1: Scientific Articles */}
            <button
              type="button"
              onClick={() => setActiveTab("articles")}
              className={`group pb-3.5 pt-1 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
                activeTab === "articles"
                  ? "border-emerald-600 text-slate-950 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <DocumentText
                className={`h-4 w-4 transition-colors ${
                  activeTab === "articles"
                    ? "text-emerald-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span>Scientific Articles</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  activeTab === "articles"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/70"
                }`}
              >
                {articles.length}
              </span>
            </button>

            {/* Tab 2: Head-to-Head Comparisons */}
            <button
              type="button"
              onClick={() => setActiveTab("comparisons")}
              className={`group pb-3.5 pt-1 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
                activeTab === "comparisons"
                  ? "border-indigo-600 text-slate-950 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <svg
                className={`h-4 w-4 transition-colors ${
                  activeTab === "comparisons"
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
              </svg>
              <span>Peptide Comparisons</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  activeTab === "comparisons"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/70"
                }`}
              >
                {comparisons.length}
              </span>
            </button>

            {/* Tab 3: Product Protocols */}
            <button
              type="button"
              onClick={() => setActiveTab("protocols")}
              className={`group pb-3.5 pt-1 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
                activeTab === "protocols"
                  ? "border-blue-600 text-slate-950 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Beaker
                className={`h-4 w-4 transition-colors ${
                  activeTab === "protocols"
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span>Protocols</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  activeTab === "protocols"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/70"
                }`}
              >
                {sanitizedProtocols.length}
              </span>
            </button>

            {/* Tab: Research Stacks */}
            <button
              type="button"
              onClick={() => setActiveTab("stacks")}
              className={`group pb-3.5 pt-1 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
                activeTab === "stacks"
                  ? "border-purple-600 text-slate-950 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <span className="text-sm">⚡</span>
              <span>Research Stacks</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  activeTab === "stacks"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/70"
                }`}
              >
                {bundleCount}
              </span>
            </button>

            {/* Tab: Master Dosage Chart */}
            <button
              type="button"
              onClick={() => setActiveTab("chart")}
              className={`group pb-3.5 pt-1 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
                activeTab === "chart"
                  ? "border-emerald-600 text-slate-950 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <span className="text-sm">📊</span>
              <span>Dosage Chart</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  activeTab === "chart"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/70"
                }`}
              >
                88
              </span>
            </button>

            {/* Tab 4: Reconstitution Calculator */}
            <button
              type="button"
              onClick={() => setActiveTab("calculator")}
              className={`group pb-3.5 pt-1 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
                activeTab === "calculator"
                  ? "border-slate-800 text-slate-950 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <span className="font-mono text-xs font-bold text-slate-700">📐</span>
              <span>Reconstitution Calculator</span>
              <span
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md transition-colors ${
                  activeTab === "calculator"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/70"
                }`}
              >
                Tool
              </span>
            </button>

            {/* Tab 5: Certificates of Analysis (CoA) */}
            <button
              type="button"
              onClick={() => setActiveTab("coa")}
              className={`group pb-3.5 pt-1 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
                activeTab === "coa"
                  ? "border-emerald-600 text-slate-950 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <svg
                className={`h-4 w-4 transition-colors ${
                  activeTab === "coa"
                    ? "text-emerald-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Certificates of Analysis (CoA)</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  activeTab === "coa"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/70"
                }`}
              >
                Lab Reports
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Commercial Bridge Banner (Flush below Header Sub-Nav) ── */}
      <div className="border-b border-emerald-100 bg-emerald-50/70 py-3.5">
        <div className="content-container flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs font-bold text-[11px]">
              COA
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">
                100% Free Open Research Library &amp; Comparison Engine
              </p>
              <p className="text-[11px] text-slate-600">
                All articles, comparisons, and tools are freely accessible. Ordering compounds unlocks batch analytical monographs in the{" "}
                <span className="font-semibold text-emerald-800">Customer Research Hub</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <LocalizedClientLink
              href="/store"
              className="flex-1 md:flex-none px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs text-center"
            >
              Explore Compounds &rarr;
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/research-hub"
              className="flex-1 md:flex-none px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors shadow-2xs text-center"
            >
              Client Hub Sign In
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* ── Main Content Body ── */}
      <div className="content-container py-8 small:py-10">


      {/* ── TAB 1: SCIENTIFIC ARTICLES ── */}
      {activeTab === "articles" && (
        <div id="articles" className="space-y-6 animate-fadeIn">
          {/* Search & Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Search Articles &amp; Literature
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search compounds (BPC-157, GHK-Cu, Angiogenesis, Stoichiometry)..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Research Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid Output */}
          {visibleArticles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center text-xs text-slate-500">
              No scientific articles match your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleArticles.map((article) => (
                <LocalizedClientLink
                  key={article.slug}
                  href={`/research-library/${article.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full uppercase">
                        {article.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {article.reading_time}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {article.abstract}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-400">
                      {article.citations.length} Verified Citations
                    </span>
                    <span className="font-bold text-emerald-600 group-hover:text-emerald-700 inline-flex items-center gap-1">
                      Read Monograph <ArrowRightMini className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </LocalizedClientLink>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: PEPTIDE COMPARISONS ── */}
      {activeTab === "comparisons" && (
        <div id="comparisons" className="animate-fadeIn">
          <PeptideComparisonsDirectory comparisons={comparisons} protocols={protocols} />
        </div>
      )}

      {/* ── TAB 3: PRODUCT PROTOCOLS ── */}
      {activeTab === "protocols" && (
        <div id="protocols" className="space-y-6 animate-fadeIn">
          {/* Multi-Compound Filter Bridge Card */}
          {activeCompoundIds.length > 0 && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 sm:p-5 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-xs">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Multi-Compound Synergy Filter</span>
                    <span className="rounded-full bg-emerald-200 text-emerald-900 px-2 py-0.5 text-[10px] font-bold">
                      {activeCompoundIds.length} Compounds
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Viewing protocols for: <span className="font-semibold text-slate-900">{activeCompoundIds.join(" + ").toUpperCase()}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("stacks")
                    window.location.hash = "stacks"
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-all cursor-pointer"
                >
                  <span>Open in Stacking Studio & Calibrate Kit</span>
                  <span>➔</span>
                </button>
                <LocalizedClientLink
                  href="/research-library#protocols"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
                >
                  Clear
                </LocalizedClientLink>
              </div>
            </div>
          )}

          {/* Segmented Classification Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setProtocolSegment("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                protocolSegment === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span>All Protocols</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${protocolSegment === "all" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"}`}>
                {sanitizedProtocols.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProtocolSegment("single_peptide")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                protocolSegment === "single_peptide"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50/50 hover:border-blue-200"
              }`}
            >
              <span>🧪 Single Peptides</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${protocolSegment === "single_peptide" ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                {singleCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProtocolSegment("blend")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                protocolSegment === "blend"
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50/50 hover:border-purple-200"
              }`}
            >
              <span>🧬 Multi-Peptide Blends</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${protocolSegment === "blend" ? "bg-purple-700 text-white" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                {blendCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProtocolSegment("bundle")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                protocolSegment === "bundle"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-200"
              }`}
            >
              <span>📦 Compound Bundles</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${protocolSegment === "bundle" ? "bg-indigo-700 text-white" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}>
                {bundleCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProtocolSegment("supply")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                protocolSegment === "supply"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50/50 hover:border-amber-200"
              }`}
            >
              <span>🔬 Laboratory Supplies</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${protocolSegment === "supply" ? "bg-amber-700 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                {supplyCount}
              </span>
            </button>
          </div>

          {/* Protocols Search & Category Filter */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Search Protocols
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search compound protocols (BPC-157, GHK-Cu, Reconstitution, Blend)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Protocols Grid */}
          {visibleProtocols.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center text-xs text-slate-500">
              No protocols match your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleProtocols.map((protocol) => {
                const isSupply = isSupplyProtocol(protocol)
                const isBundle = isBundleProtocol(protocol)
                const isBlend = isBlendProtocol(protocol)
                const isTopical =
                  !isSupply &&
                  (protocol.content?.protocol_category_type === "topical" ||
                    (protocol.handle || "").includes("serum"))
                const rawTitle = protocol.content?.compound_name || protocol.title || "Protocol"
                const cleanTitle = rawTitle
                  .replace(/\s*(?:Laboratory\s+(?:Reconstitution\s+&\s+)?Handling\s+Standard|Product\s+Protocol|Protocol)\s*$/i, "")
                  .replace(/\s*\([^)]*\)\s*$/g, "")
                  .trim() || rawTitle

                return (
                  <LocalizedClientLink
                    key={protocol.handle}
                    href={`/research-protocols/${protocol.handle}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {isSupply ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <span>🔬</span> Laboratory Supply
                          </span>
                        ) : isBundle ? (
                          <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <span>📦</span> Multi-Vial Bundle
                          </span>
                        ) : isTopical ? (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <span>✨</span> Topical Serum
                          </span>
                        ) : isBlend ? (
                          <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <span>🧬</span> Multi-Peptide Blend
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                            <span>🧪</span> Single Peptide
                          </span>
                        )}

                        {protocol.content?.purity_standard ? (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                            {protocol.content.purity_standard}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            Rev {protocol.revision}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {cleanTitle}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {protocol.summary || protocol.content?.short_introduction || "Standardized product protocol parameters."}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-slate-400">
                        {protocol.content?.quick_reference?.length || 4} Parameters
                      </span>
                      <span className="font-bold text-emerald-600 group-hover:text-emerald-700 inline-flex items-center gap-1">
                        View Product Protocol <ArrowRightMini className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </LocalizedClientLink>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PEPTIDE STACKS & MULTI-VIAL REGIMENS ── */}
      {activeTab === "stacks" && (
        <div className="space-y-8 animate-fadeIn" id="stacks">
          {/* Stacks Header Banner */}
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden print:hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 px-3.5 py-1 text-xs font-bold text-purple-200 uppercase tracking-wider backdrop-blur-sm">
                <span>⚡ Multi-Compound Synergy Engine</span>
                <span>·</span>
                <span>15% Kit Savings</span>
              </div>
              <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Peptide Stacks &amp; Multi-Vial Regimens
              </h2>
              <p className="mt-3 text-sm sm:text-base text-purple-100/80 leading-relaxed">
                Precision multi-peptide research cycles engineered with separate physical lyophilized vials. Features interactive diluent stoichiometry, live U-100 syringe graduation visualizers, synchronized 7-day administration timetables, and 1-click complete kit fulfillment.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-purple-200">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span>💧</span> Interactive Stoichiometry Station
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span>💉</span> Dynamic Meniscus Syringe Studio
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span>📅</span> 7-Day AM/PM Schedule Sync
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span>📦</span> 1-Click Medusa Kit Builder
                </div>
              </div>
            </div>
          </div>

          {/* ── Interactive Stacking & Compatibility Matrix Studio ── */}
          <StackCompatibilityChecker
            matchedProducts={products}
            countryCode={countryCode}
          />

          {/* Objective Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {[
              { id: "all", label: "All Research Stacks", icon: "⚡" },
              { id: "tissue", label: "Tissue Healing & Regeneration", icon: "🩹" },
              { id: "gh", label: "Somatotropic GH Pulse", icon: "⚡" },
              { id: "metabolic", label: "Metabolic & Adipose Lipolysis", icon: "🔥" },
              { id: "cognitive", label: "Cognitive Neurogenesis & BDNF", icon: "🧠" },
              { id: "photoprotection", label: "Photoprotection & Libido", icon: "☀️" },
              { id: "longevity", label: "Cellular Longevity & Mitochondria", icon: "🧬" },
            ].map((obj) => (
              <button
                key={obj.id}
                type="button"
                onClick={() => setStackObjective(obj.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                  stackObjective === obj.id
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50/50 hover:border-purple-200"
                }`}
              >
                <span>{obj.icon}</span>
                <span>{obj.label}</span>
              </button>
            ))}
          </div>

          {/* Stacks Cards Grid */}
          {visibleStacks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center text-xs text-slate-500 print:hidden">
              No research stacks match your selected criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
              {visibleStacks.map((stack) => {
                const content = stack.content
                const rawTitle = content?.compound_name || stack.title || "Research Stack"
                const cleanTitle =
                  rawTitle
                    .replace(
                      /\s*(?:Laboratory\s+(?:Reconstitution\s+&\s+)?Handling\s+Standard|Product\s+Protocol|Protocol)\s*$/i,
                      ""
                    )
                    .replace(/\s*\([^)]*\)\s*$/g, "")
                    .trim() || rawTitle
                const bundleVials = content?.bundle_vials || []

                return (
                  <div
                    key={stack.handle}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-purple-300 hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Top Header Tags */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                        <span className="rounded-full bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {content?.category || "Synergistic Stack"}
                        </span>
                        <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                          15% Bundle Savings
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                        {cleanTitle}
                      </h3>
                      {content?.short_introduction ? (
                        <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {content.short_introduction}
                        </p>
                      ) : null}

                      {/* Constituent Physical Vials */}
                      <div className="mt-4">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                          <span>📦</span> Constituent Vials ({bundleVials.length} Separate Physical Vials):
                        </div>
                        <div className="space-y-1.5">
                          {bundleVials.map((v, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs"
                            >
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                {v.compoundName}
                              </div>
                              <div className="font-mono text-[11px] font-bold text-slate-600">
                                {v.vialNetMass} · {v.diluentMl} mL BAC
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Synergy Endpoints */}
                      {content?.investigated_benefits && content.investigated_benefits.length > 0 ? (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Investigated Synergy:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {content.investigated_benefits.slice(0, 3).map((b, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center text-[10.5px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                              >
                                ✓ {b.replace(/^[•\s-]+/, "")}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Action CTA */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <LocalizedClientLink
                        href={`/research-protocols/${stack.handle}`}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white py-2.5 px-4 text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <span>Open Interactive Studio &amp; Syringe Calibrator</span>
                        <ArrowRightMini className="h-4 w-4" />
                      </LocalizedClientLink>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Architectural Comparison: Why PepStack Labs Outclasses PeptideDosages.com */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
              <span>🔬</span> Engineering Standard
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Why PepStack Labs Outclasses PeptideDosages.com
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-3xl">
              Unlike static blog directories that rely on inflexible text tables and detached affiliate links, PepStack Labs provides a live, stoichiometric research laboratory studio.
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10.5px]">
                  <tr>
                    <th className="py-3 px-4">Feature Dimension</th>
                    <th className="py-3 px-4 text-slate-500">PeptideDosages.com (Legacy WordPress)</th>
                    <th className="py-3 px-4 text-purple-900 bg-purple-50/70">PepStack Labs (Our Sovereign Platform)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">Stoichiometric Reconstitution</td>
                    <td className="py-2.5 px-4 text-slate-500">Fixed hardcoded 2.0 mL bullet points</td>
                    <td className="py-2.5 px-4 font-bold text-purple-800 bg-purple-50/40">Interactive per-vial diluent sliders with live concentration &amp; IU sync</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">Syringe Visualizer</td>
                    <td className="py-2.5 px-4 text-slate-500">Plain text estimates with no visuals</td>
                    <td className="py-2.5 px-4 font-bold text-purple-800 bg-purple-50/40">Dynamic SVG U-100 barrel with live fluid meniscus and graduation ticks</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">Administration Cadence</td>
                    <td className="py-2.5 px-4 text-slate-500">Static 2-row HTML table</td>
                    <td className="py-2.5 px-4 font-bold text-purple-800 bg-purple-50/40">Synchronized 7-day Monday–Sunday timeline with loading vs maintenance switch</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">Commerce &amp; Supply Chain</td>
                    <td className="py-2.5 px-4 text-slate-500">Detached external affiliate redirects</td>
                    <td className="py-2.5 px-4 font-bold text-purple-800 bg-purple-50/40">1-Click Medusa BOM kit builder (8/12/16 wks + BAC water + syringes + 15% discount)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: MASTER DOSAGE CHART ── */}
      {activeTab === "chart" && (
        <div className="space-y-8 animate-fadeIn" id="chart">
          {/* Dosage Chart Header Banner */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden print:hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-200 uppercase tracking-wider backdrop-blur-sm">
                <span>📊 88 Verified Research Compounds</span>
                <span>·</span>
                <span>Laboratory Dosage &amp; Reconstitution Matrix</span>
              </div>
              <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Master Peptide Dosage &amp; Reconstitution Chart
              </h2>
              <p className="mt-3 text-sm sm:text-base text-emerald-100/80 leading-relaxed">
                Comprehensive pharmacodynamic dosage references, diluent reconstitution volumes, concentration ratios, and live U-100 syringe units for 88 verified analytical research peptides. Includes dynamic phase calibration and 1-click protocol kit fulfillment.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-200">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span>💧</span> Stoichiometric Diluent Ratios (0.9% Benzyl Alcohol USP)
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span>💉</span> Dynamic U-100 Plunger Calibration
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span>⏱️</span> Phase 1 Titration vs Target Maintenance
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  <span>📦</span> 1-Click Multi-Week Protocol Kit Builder
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 sm:p-6 shadow-2xl">
            <MasterPeptideDosageChart countryCode={countryCode} />
          </div>
        </div>
      )}

      {/* ── TAB 4: RECONSTITUTION CALCULATOR ── */}
      {activeTab === "calculator" && (
        <div className="animate-fadeIn" id="calculator">
          <StandaloneReconstitutionCalculator />
        </div>
      )}

      {/* ── TAB 5: CERTIFICATES OF ANALYSIS (CoA) ── */}
      {activeTab === "coa" && (
        <div className="animate-fadeIn" id="coa">
          <CoaDirectoryPanel />
        </div>
      )}
      </div>
    </div>
  )
}

