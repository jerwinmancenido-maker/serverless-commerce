"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useMemo, useState } from "react"
import type { StoreResearchProtocol } from "@lib/data/research-protocols"
import type { ResearchArticle } from "@lib/data/research-articles"
import type { PeptideComparison } from "@lib/data/peptide-comparisons"
import StandaloneReconstitutionCalculator from "@modules/research-protocols/standalone-calculator"
import PeptideComparisonsDirectory from "./comparisons"
import CoaDirectoryPanel from "./coa-directory-panel"
import { DocumentText, Beaker, ArrowRightMini } from "@medusajs/icons"

type Props = {
  protocols: StoreResearchProtocol[]
  articles: ResearchArticle[]
  comparisons: PeptideComparison[]
  initialTab?: TabType
}

type TabType = "articles" | "comparisons" | "protocols" | "calculator" | "coa"

const normalize = (value: string | null | undefined) =>
  (value || "").trim().toLocaleLowerCase()

export default function ResearchLibraryDirectory({
  protocols,
  articles,
  comparisons,
  initialTab,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || "articles")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [protocolSegment, setProtocolSegment] = useState<"all" | "single_peptide" | "blend">("all")

  // Hash deep-linking listener
  useEffect(() => {
    const handleHash = (shouldScroll = false) => {
      const hash = window.location.hash.toLowerCase().replace("#", "")
      if (
        hash === "calculator" ||
        hash === "comparisons" ||
        hash === "protocols" ||
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
          }, 100)
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

  // Sanitize protocols: filter out any internal test protocols like community-board-acceptance
  const sanitizedProtocols = useMemo(() => {
    return protocols.filter((p) => p.handle !== "community-board-acceptance")
  }, [protocols])

  // Count singles and blends
  const singleCount = useMemo(() => {
    return sanitizedProtocols.filter(
      (p) => p.content?.protocol_category_type !== "blend",
    ).length
  }, [sanitizedProtocols])

  const blendCount = useMemo(() => {
    return sanitizedProtocols.filter(
      (p) => p.content?.protocol_category_type === "blend",
    ).length
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
      const matchesSegment =
        protocolSegment === "all" ||
        (protocolSegment === "blend"
          ? protocol.content?.protocol_category_type === "blend"
          : protocol.content?.protocol_category_type !== "blend")

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

      return matchesSegment && matchesQuery && matchesCategory
    })
  }, [category, sanitizedProtocols, query, protocolSegment])

  return (
    <div className="bg-white min-h-screen">
      {/* ── Clinical Header Banner with Integrated Flush Sub-Nav ── */}
      <div className="border-b border-slate-200 bg-slate-50/80 text-slate-900 pt-8 small:pt-12">
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
                All articles, comparisons, and tools are freely accessible. Ordering compounds unlocks batch HPLC COAs in the{" "}
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
        <div className="space-y-6 animate-fadeIn">
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
        <div className="animate-fadeIn">
          <PeptideComparisonsDirectory comparisons={comparisons} />
        </div>
      )}

      {/* ── TAB 3: PRODUCT PROTOCOLS ── */}
      {activeTab === "protocols" && (
        <div className="space-y-6 animate-fadeIn">
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
                const isBlend = protocol.content?.protocol_category_type === "blend"
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
                        {isBlend ? (
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

