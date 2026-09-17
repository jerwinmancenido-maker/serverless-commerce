"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/master-peptide-dosage-chart.tsx
 * @module  MasterPeptideDosageChart (Research Protocols Module)
 * @purpose Comprehensive 154-compound analytical dosage matrix with multi-route filters,
 *          clinical evidence tiers, CSV export, and calibration drawer.
 * @contracts
 *   Component: MasterPeptideDosageChart
 *   Catalog:   ALL_COMPOUND_PROTOCOLS (@lib/data/compound-protocols)
 */

import React, { useMemo, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ArrowDownTray,
  Beaker,
  DocumentText,
  MagnifyingGlass,
  Sparkles,
  InformationCircle,
} from "@medusajs/icons"
import {
  ALL_COMPOUND_PROTOCOLS,
  CompoundAnalyticalProtocol,
} from "@lib/data/compound-protocols"
import { DosageCalibrationDrawer } from "./dosage-calibration-drawer"

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All Categories", value: "all" },
  { label: "Tissue Repair & Healing", value: "Tissue Repair & Healing" },
  { label: "Metabolic & Incretins", value: "Metabolic Signaling & Incretins" },
  { label: "Growth Hormone Axis", value: "Growth Hormone Axis" },
  { label: "Mitochondrial & Cellular Longevity", value: "Mitochondrial & Cellular Longevity" },
  { label: "Cognitive & Neuroprotective", value: "Cognitive & Neuroprotective" },
  { label: "Antimicrobial & Immune", value: "Antimicrobial & Immune" },
  { label: "Skin, Hair & Cellular Matrix", value: "Skin, Hair & Cellular Matrix" },
  { label: "Photoprotection & Sexual Health", value: "Photoprotection & Sexual Health" },
  { label: "Multi-Peptide Blends", value: "Multi-Peptide Blends" },
  { label: "Laboratory Supplies", value: "Laboratory Supplies" },
]

const ROUTES: { label: string; value: string }[] = [
  { label: "All Routes", value: "all" },
  { label: "Parenteral Analytical Standard", value: "subq" },
  { label: "Intranasal Spray", value: "nasal" },
  { label: "Oral (Arg Salt / Sol)", value: "oral" },
  { label: "Topical / Matrix", value: "topical" },
]

const EVIDENCE_LEVELS: { label: string; value: string }[] = [
  { label: "All Evidence", value: "all" },
  { label: "Phase 3 Human Clinical", value: "phase3" },
  { label: "Phase 1/2 Clinical", value: "phase2" },
  { label: "In Vitro / Preclinical", value: "preclinical" },
]

type MasterPeptideDosageChartProps = {
  countryCode?: string
  initialCategory?: string
  initialQuery?: string
}

export function MasterPeptideDosageChart({
  countryCode = "ph",
  initialCategory = "all",
  initialQuery = "",
}: MasterPeptideDosageChartProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedRoute, setSelectedRoute] = useState("all")
  const [selectedEvidence, setSelectedEvidence] = useState("all")
  const [sortField, setSortField] = useState<"name" | "dose" | "conc">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [phaseMode, setPhaseMode] = useState<"starting" | "target">("target")
  const [calibratingProtocol, setCalibratingProtocol] =
    useState<CompoundAnalyticalProtocol | null>(null)

  // Catalog telemetry counts
  const catalogStats = useMemo(() => {
    const nonSupplies = ALL_COMPOUND_PROTOCOLS.filter((p) => p.category !== "Laboratory Supplies" && !p.isSupply)
    const singleCount = nonSupplies.filter((p) => p.protocolCategoryType === "single_peptide" || !p.protocolCategoryType).length
    const blendCount = nonSupplies.filter((p) => p.protocolCategoryType === "blend" || p.isBlend).length
    const bundleCount = nonSupplies.filter((p) => p.protocolCategoryType === "bundle" || (p.bundleVials && p.bundleVials.length > 0)).length
    const supplyCount = ALL_COMPOUND_PROTOCOLS.filter((p) => p.category === "Laboratory Supplies" || p.isSupply).length

    return {
      total: ALL_COMPOUND_PROTOCOLS.length,
      activeProtocols: nonSupplies.length,
      singles: singleCount,
      blends: blendCount,
      bundles: bundleCount,
      supplies: supplyCount,
    }
  }, [])

  // Filter out laboratory supplies/hardware and apply category, route, evidence, and search filters
  const filteredProtocols = useMemo(() => {
    return ALL_COMPOUND_PROTOCOLS.filter((p) => {
      // Exclude pure supplies / hardware unless explicitly viewing Laboratory Supplies
      if (selectedCategory !== "Laboratory Supplies" && (p.category === "Laboratory Supplies" || p.isSupply)) {
        return false
      }
      if (selectedCategory === "Laboratory Supplies" && !(p.category === "Laboratory Supplies" || p.isSupply)) {
        return false
      }

      // Match category
      if (selectedCategory !== "all" && selectedCategory !== "Laboratory Supplies") {
        if (p.category !== selectedCategory) {
          return false
        }
      }

      // Match Delivery Route
      if (selectedRoute !== "all") {
        const routes = (p.deliveryRoutes || [p.primaryDeliveryRoute || "subq"]) as string[]
        if (!routes.includes(selectedRoute)) {
          return false
        }
      }

      // Match Evidence Level
      if (selectedEvidence !== "all") {
        const idLower = p.id.toLowerCase()
        const isPhase3 =
          idLower.includes("reta") ||
          idLower.includes("tirz") ||
          idLower.includes("sema") ||
          idLower.includes("cagri") ||
          p.evidenceTier?.toLowerCase().includes("phase 3")

        const isPhase2 =
          !isPhase3 &&
          (idLower.includes("bpc") ||
            idLower.includes("tb-500") ||
            idLower.includes("cjc") ||
            idLower.includes("ipam") ||
            idLower.includes("semax") ||
            idLower.includes("selank") ||
            p.evidenceTier?.toLowerCase().includes("phase 2") ||
            p.evidenceTier?.toLowerCase().includes("clinical"))

        if (selectedEvidence === "phase3" && !isPhase3) return false
        if (selectedEvidence === "phase2" && !isPhase2) return false
        if (selectedEvidence === "preclinical" && (isPhase3 || isPhase2)) return false
      }

      // Match search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchName = p.compoundName.toLowerCase().includes(query)
        const matchSubtitle = p.subtitle?.toLowerCase().includes(query)
        const matchDose = p.dosing?.standardDoseDisplay?.toLowerCase().includes(query)
        const matchHandles = p.handles?.some((h) => h.toLowerCase().includes(query))
        const matchReceptors = p.scientificDossier?.keyReceptors?.some((r) =>
          r.toLowerCase().includes(query)
        )

        return matchName || matchSubtitle || matchDose || matchHandles || matchReceptors
      }

      return true
    }).sort((a, b) => {
      if (sortField === "name") {
        return sortDirection === "asc"
          ? a.compoundName.localeCompare(b.compoundName)
          : b.compoundName.localeCompare(a.compoundName)
      }
      if (sortField === "dose") {
        const doseA = a.dosing?.standardDoseMcg || 0
        const doseB = b.dosing?.standardDoseMcg || 0
        return sortDirection === "asc" ? doseA - doseB : doseB - doseA
      }
      if (sortField === "conc") {
        const concA = a.reconstitution?.resultingConcentrationMgPerMl || 0
        const concB = b.reconstitution?.resultingConcentrationMgPerMl || 0
        return sortDirection === "asc" ? concA - concB : concB - concA
      }
      return 0
    })
  }, [searchQuery, selectedCategory, selectedRoute, selectedEvidence, sortField, sortDirection])

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = [
      "Compound Name",
      "Category",
      "Delivery Routes",
      "Vial Net Mass (mg)",
      "Standard Dose",
      "Dose (mcg)",
      "Cadence",
      "Diluent (mL BAC)",
      "Concentration (mg/mL)",
      "U-100 Syringe Draw",
      "Half-Life",
      "Typical Cycle",
      "Washout Period",
      "Solvent",
    ]

    const rows = filteredProtocols.map((p) => [
      `"${p.compoundName.replace(/"/g, '""')}"`,
      `"${p.category || ""}"`,
      `"${(p.deliveryRoutes || [p.primaryDeliveryRoute || "subq"]).join(", ")}"`,
      p.reconstitution?.defaultVialNetMg || "",
      `"${p.dosing?.standardDoseDisplay || ""}"`,
      p.dosing?.standardDoseMcg || "",
      `"${p.dosing?.cadence || ""}"`,
      p.reconstitution?.defaultDiluentMl || "",
      p.reconstitution?.resultingConcentrationMgPerMl || "",
      `"${p.syringeGuide?.standardIUDisplay || ""}"`,
      `"${p.dosing?.halfLife || ""}"`,
      `"${p.dosing?.typicalProtocolDuration || ""}"`,
      `"${p.dosing?.washoutPeriod || ""}"`,
      `"${p.reconstitution?.solvent || ""}"`,
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `pepstack-master-dosage-matrix-${new Date().toISOString().split("T")[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full space-y-6">
      {/* Telemetry Counter HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 print:hidden">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Monographs</span>
          <div className="text-lg font-mono font-extrabold text-slate-900 mt-0.5">{catalogStats.total}</div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Single Peptides</span>
          <div className="text-lg font-mono font-extrabold text-blue-950 mt-0.5">{catalogStats.singles}</div>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Synergistic Blends</span>
          <div className="text-lg font-mono font-extrabold text-purple-950 mt-0.5">{catalogStats.blends}</div>
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-center shadow-xs">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Multi-Vial Bundles</span>
          <div className="text-lg font-mono font-extrabold text-teal-950 mt-0.5">{catalogStats.bundles}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Active in Matrix</span>
          <div className="text-lg font-mono font-extrabold text-emerald-700 mt-0.5">{filteredProtocols.length}</div>
        </div>
      </div>

      {/* Header & Controls Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm print:border-none print:bg-white print:p-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Beaker className="h-4 w-4" />
              </span>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Master Pharmacodynamic Dosage &amp; Reconstitution Matrix
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              High-density reference standards for {filteredProtocols.length} verified analytical
              peptides &amp; synergistic formulations. Sourced directly from published monographs.
            </p>
          </div>

          {/* Action Tools: CSV Export & Print */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowDownTray className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100 hover:text-emerald-900"
            >
              <DocumentText className="h-3.5 w-3.5" />
              <span>Print Lab Chart</span>
            </button>
          </div>
        </div>

        {/* Regulatory Research Disclaimer Callout */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 print:border-amber-400 print:text-amber-900">
          <InformationCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="leading-relaxed text-[11px]">
            <span className="font-bold text-amber-950">
              IN VITRO LABORATORY RESEARCH ONLY:
            </span>{" "}
            This matrix compiles analytical stoichiometry, diluent reconstitution volumes, and
            titration benchmarks for laboratory reference and scientific inquiry. Not approved for
            human or veterinary administration.
          </div>
        </div>

        {/* Search & Multi-Faceted Filters */}
        <div className="mt-5 space-y-3.5 print:hidden">
          {/* Text Search Bar */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by compound (e.g. BPC-157, Tirzepatide, GHK-Cu), target receptor, or category..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* 1. Category Filter Pills */}
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Research Category:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? "bg-slate-900 text-white font-bold shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Route of Administration & Clinical Evidence Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            {/* Delivery Routes */}
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Delivery Route:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {ROUTES.map((route) => {
                  const active = selectedRoute === route.value
                  return (
                    <button
                      key={route.value}
                      type="button"
                      onClick={() => setSelectedRoute(route.value)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? "bg-blue-700 text-white font-bold shadow-sm"
                          : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {route.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Clinical Evidence Tier */}
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Clinical Evidence Tier:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {EVIDENCE_LEVELS.map((ev) => {
                  const active = selectedEvidence === ev.value
                  return (
                    <button
                      key={ev.value}
                      type="button"
                      onClick={() => setSelectedEvidence(ev.value)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? "bg-teal-800 text-white font-bold shadow-sm"
                          : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {ev.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Titration Phase Projection Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-bold text-slate-800">Phase Projection:</span>
              <span className="text-[11px] text-slate-500">
                {phaseMode === "starting"
                  ? "Projecting baseline titration & introductory tolerance calibration (Phase 1)"
                  : "Projecting standard target maintenance dose & concentration"}
              </span>
            </div>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPhaseMode("starting")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  phaseMode === "starting"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Starting Dose (Phase 1)
              </button>
              <button
                type="button"
                onClick={() => setPhaseMode("target")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  phaseMode === "target"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Target Maintenance (Standard)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm print:border-slate-300 print:bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 print:text-slate-800">
            <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-[11px] font-bold text-slate-600 print:border-slate-300 print:bg-slate-100 print:text-slate-700">
              <tr>
                <th
                  scope="col"
                  className="cursor-pointer py-3.5 pl-4 pr-3 hover:text-slate-900"
                  onClick={() => {
                    setSortField("name")
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }}
                >
                  Compound &amp; Route{" "}
                  {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-3 py-3.5 hover:text-slate-900"
                  onClick={() => {
                    setSortField("dose")
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }}
                >
                  Standard Dose {sortField === "dose" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th scope="col" className="px-3 py-3.5">
                  Cadence &amp; t½
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-3 py-3.5 hover:text-slate-900"
                  onClick={() => {
                    setSortField("conc")
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }}
                >
                  Reconstitution &amp; Conc.{" "}
                  {sortField === "conc" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th scope="col" className="px-3 py-3.5">
                  U-100 Syringe Draw
                </th>
                <th scope="col" className="px-3 py-3.5">
                  Cycle &amp; Washout
                </th>
                <th scope="col" className="py-3.5 pl-3 pr-4 text-right print:hidden">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredProtocols.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">No compounds matched your filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("all")
                        setSelectedRoute("all")
                        setSelectedEvidence("all")
                      }}
                      className="mt-2 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProtocols.map((protocol) => {
                  const handle =
                    protocol.handles?.[0] || protocol.id.toLowerCase().replace(/_/g, "-")

                  // Dynamic Dose and Units depending on phaseMode
                  const isStarting = phaseMode === "starting"
                  const startingStep = protocol.dosing?.titrationSteps?.[0]

                  const displayDose = isStarting
                    ? startingStep?.doseDisplay || protocol.dosing?.standardDoseDisplay
                    : protocol.dosing?.standardDoseDisplay

                  const displayMcg = isStarting
                    ? startingStep?.doseMcg || protocol.dosing?.standardDoseMcg
                    : protocol.dosing?.standardDoseMcg

                  const displayCadence = isStarting
                    ? startingStep?.cadence || protocol.dosing?.cadence
                    : protocol.dosing?.cadence

                  // Syringe Draw Units
                  const conc = protocol.reconstitution?.resultingConcentrationMgPerMl || 5.0
                  const displayIU = (() => {
                    if (isStarting && startingStep && conc > 0) {
                      const doseMg = startingStep.doseMcg / 1000
                      const iu = (doseMg / conc) * 100
                      return `${iu.toFixed(1)} units (${(iu / 100).toFixed(2)} mL)`
                    }
                    return (
                      protocol.syringeGuide?.standardIUDisplay ||
                      `${((((protocol.dosing?.standardDoseMcg || 250) / 1000) / conc) * 100).toFixed(1)} units`
                    )
                  })()

                  // Delivery route labels
                  const routes = protocol.deliveryRoutes || [protocol.primaryDeliveryRoute || "subq"]

                  return (
                    <tr
                      key={protocol.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      {/* Compound Name, Route Badges & Category */}
                      <td className="py-3.5 pl-4 pr-3">
                        <div className="flex flex-col">
                          <LocalizedClientLink
                            href={`/research-protocols/${handle}`}
                            className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                          >
                            {protocol.compoundName}
                          </LocalizedClientLink>

                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 border border-slate-200">
                              {protocol.category}
                            </span>
                            {routes.map((r) => (
                              <span
                                key={r}
                                className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                                  r === "nasal"
                                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                                    : r === "oral"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : r === "topical"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Standard Dose */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-700 print:text-emerald-800 font-mono">
                            {displayDose}
                          </span>
                          {isStarting && (
                            <span className="rounded bg-emerald-50 px-1 py-0.2 text-[8px] font-bold text-emerald-700 border border-emerald-200">
                              PHASE 1
                            </span>
                          )}
                        </div>
                        {displayMcg ? (
                          <span className="block text-[10px] text-slate-500 print:text-slate-600 font-mono">
                            ({displayMcg} mcg)
                          </span>
                        ) : null}
                      </td>

                      {/* Cadence */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800 print:text-slate-700">
                          {displayCadence}
                        </span>
                        {protocol.dosing?.halfLife && (
                          <span className="block text-[10px] text-slate-500">
                            t½: {protocol.dosing.halfLife}
                          </span>
                        )}
                      </td>

                      {/* Reconstitution & Concentration */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col font-mono">
                          <span className="font-medium text-slate-900 print:text-slate-800">
                            {protocol.reconstitution?.defaultDiluentMl || 2.0} mL Diluent
                          </span>
                          <span className="text-[10px] text-slate-500 print:text-slate-600">
                            → {protocol.reconstitution?.resultingConcentrationMgPerMl || 0} mg/mL
                          </span>
                        </div>
                      </td>

                      {/* U-100 Syringe Draw */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-900 print:border-slate-300 print:bg-slate-100 print:text-slate-900">
                          <span>{displayIU}</span>
                        </div>
                      </td>

                      {/* Cycle & Washout */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col text-[11px]">
                          <span className="text-slate-800 print:text-slate-700 font-medium">
                            {protocol.dosing?.typicalProtocolDuration || "4–8 Weeks"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Washout: {protocol.dosing?.washoutPeriod || "2–4 Weeks"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-4 text-right whitespace-nowrap print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCalibratingProtocol(protocol)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700 cursor-pointer"
                            title="Open in Syringe Calibration Drawer"
                          >
                            <Sparkles className="h-3 w-3 text-emerald-600" />
                            <span>Calibrate</span>
                          </button>
                          <LocalizedClientLink
                            href={`/research-stacks?compounds=${handle}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-bold text-purple-800 transition-colors hover:bg-purple-100 cursor-pointer"
                            title="Inspect in Stacking Studio"
                          >
                            <Beaker className="h-3 w-3 text-purple-700" />
                            <span>Synergy</span>
                          </LocalizedClientLink>
                          <LocalizedClientLink
                            href={`/research-protocols/${handle}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <DocumentText className="h-3 w-3" />
                            <span>Monograph</span>
                          </LocalizedClientLink>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Count Summary */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 print:border-slate-300 print:bg-slate-50 print:text-slate-700">
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredProtocols.length}</strong> of{" "}
            {catalogStats.activeProtocols} active research protocols
          </span>
          <span className="text-[11px] text-slate-500">
            GLP Aseptic Reconstitution Standards (0.9% Benzyl Alcohol USP)
          </span>
        </div>
      </div>

      {/* Slide-Over Syringe Calibration & Kit Drawer */}
      <DosageCalibrationDrawer
        isOpen={!!calibratingProtocol}
        onClose={() => setCalibratingProtocol(null)}
        protocol={calibratingProtocol}
        countryCode={countryCode}
      />
    </div>
  )
}
