"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductInfo from "@modules/products/templates/product-info"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import { StoreResearchProtocol } from "@lib/data/research-protocols"
import { Beaker, DocumentText, CheckCircleSolid } from "@medusajs/icons"
import { getCompoundProtocol, CompoundAnalyticalProtocol } from "@lib/data/compound-protocols"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
  linkedProtocol?: StoreResearchProtocol | null
}

const ProductTabs = ({ product, linkedProtocol }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase().replace("#", "")
      if (
        hash === "protocol" ||
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

  const tabs: Array<{ id: string; label: string; badge?: string }> = [
    { id: "overview", label: "Description & Specs" },
    { id: "protocol", label: "Protocol & Dosing", badge: "Analytical Standard" },
    { id: "calculator", label: "Reconstitution Calculator" },
    {
      id: "customer_hub",
      label: "Customer Research Hub",
      badge: "Client Suite",
    },
    { id: "compliance", label: "Compliance & Safety" },
    { id: "shipping", label: "Shipping & Transit" },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto">
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
            <div className="pt-6 border-t border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">Compound Specifications</h3>
              <ProductSpecsGrid product={product} />
            </div>
          </div>
        )}

        {activeTab === "protocol" && (
          <div className="animate-fadeIn">
            <ResearchProtocolPanel
              protocol={linkedProtocol}
              product={product}
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
// 1. Compound Specifications Grid
// ---------------------------------------------------------------------------
const ProductSpecsGrid = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const contentOption = product.options?.find(
    (o) =>
      o.title?.toLowerCase().includes("content") ||
      o.title?.toLowerCase().includes("net")
  )
  const inclusionOption = product.options?.find((o) =>
    o.title?.toLowerCase().includes("inclusion")
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
        <span className="font-semibold text-zinc-900 text-xs">Target Category</span>
        <p className="text-zinc-600 text-xs mt-1">
          {product.categories?.map((c) => c.name).join(", ") || "Research Compound"}
        </p>
      </div>
      <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
        <span className="font-semibold text-zinc-900 text-xs">Intended Use</span>
        <p className="text-zinc-600 text-xs mt-1">Laboratory &amp; In-Vitro Research Only</p>
      </div>
      <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50">
        <span className="font-semibold text-zinc-900 text-xs">Physical State</span>
        <p className="text-zinc-600 text-xs mt-1">Lyophilized Solid Powder</p>
      </div>
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
// 2. Verified Research Protocol & Laboratory Dosing Panel (3-Stage Clinical Roadmap)
// ---------------------------------------------------------------------------
const ResearchProtocolPanel = ({
  protocol,
  product,
  onNavigateToCalculator,
}: {
  protocol?: StoreResearchProtocol | null
  product: HttpTypes.StoreProduct
  onNavigateToCalculator?: () => void
}) => {
  const compoundProto = useMemo(() => {
    return getCompoundProtocol(product.handle || product.title)
  }, [product.handle, product.title])

  const title = protocol?.title || `${compoundProto.compoundName} Laboratory Protocol & In-Vitro Dosing Standard`
  const summary =
    protocol?.summary ||
    compoundProto.subtitle ||
    `Verified analytical protocol, reconstitution dilution ratios, and laboratory titration guidance for ${product.title}.`

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
            Analytical Dose Range
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
            Syringe Tick Mark
          </span>
          <span className="font-bold text-slate-900 mt-1 block text-sm font-mono tracking-tight">
            {compoundProto.syringeGuide.standardIUDisplay}
          </span>
          <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
            Standard U-100 (100 units = 1.0 mL)
          </p>
        </div>
      </div>

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

      {/* STAGE 2: Laboratory Research Dosing & Titration Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono shadow-2xs">
              2
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Stage 2: Laboratory Research Dosing &amp; Titration Matrix
              </h4>
              <p className="text-[11px] text-slate-500">
                Peer-reviewed analytical dosing ranges, in-vitro half-life, and experimental escalation schedule.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">In-Vitro Half-Life</span>
            <span className="text-xs font-bold text-slate-900 font-mono">{compoundProto.dosing.halfLife}</span>
          </div>
        </div>

        {/* Titration Steps Ladder */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 sm:px-4">Protocol Stage</th>
                <th className="py-2.5 px-3 sm:px-4">Timeframe</th>
                <th className="py-2.5 px-3 sm:px-4">Target Research Dose</th>
                <th className="py-2.5 px-3 sm:px-4">Cadence</th>
                <th className="py-2.5 px-3 sm:px-4">Assay Focus &amp; Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compoundProto.dosing.titrationSteps.map((step, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    step.doseMcg > 0 && idx === 0 ? "bg-emerald-50/30" : ""
                  }`}
                >
                  <td className="py-3 px-3 sm:px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {step.stage}
                  </td>
                  <td className="py-3 px-3 sm:px-4 font-mono text-slate-600 text-[11px]">
                    {step.timeframe}
                  </td>
                  <td className="py-3 px-3 sm:px-4 font-bold text-emerald-800 font-mono whitespace-nowrap">
                    {step.doseDisplay}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 text-[11px]">
                    {step.cadence}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-slate-600 text-[11px]">
                    <div className="font-medium text-slate-800">{step.focus}</div>
                    {step.notes && (
                      <div className="text-[10px] text-slate-500 mt-0.5">{step.notes}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
          <div>
            Typical Trial Cycle: <span className="font-semibold text-slate-800">{compoundProto.dosing.typicalProtocolDuration}</span>
          </div>
          <div>
            Washout Period: <span className="font-semibold text-slate-800">{compoundProto.dosing.washoutPeriod}</span>
          </div>
        </div>
      </div>

      {/* STAGE 3: Syringe Measurement Cheat-Sheet (U-100 Insulin Syringe) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono shadow-2xs">
              3
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Stage 3: Syringe Measurement Cheat-Sheet (U-100 Standard)
              </h4>
              <p className="text-[11px] text-slate-500">
                Direct translation from target dose to syringe units (IU) on a standard 100-unit syringe.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
            100 IU = 1.0 mL
          </span>
        </div>

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
                  Target Dose
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
                <span className="text-slate-500 text-[11px]">Syringe Mark:</span>
                <span className="font-bold text-emerald-800 font-mono">
                  {grad.syringeIU.toFixed(1)} IU
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono text-right mt-0.5">
                ({grad.volumeMl.toFixed(2)} mL volume)
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
              Every verified procurement unlocks dedicated laboratory toolsets, batch-certified HPLC analytics, and proactive refill telemetry directly in your client dashboard.
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
        {/* Card 1: Batch HPLC & MS Analytics */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100/80 text-emerald-800">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 uppercase">
              &ge;99.0% Certified
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Batch HPLC &amp; Mass Spectrometry
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Download third-party analytical release certificates tied to your order lot number. Verify chromatographic purity profiles and molecular weight identification before protocol initiation.
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
// 3. Interactive Reconstitution Calculator (Compound-Aware Defaults)
// ---------------------------------------------------------------------------
const DILUENT_VOLUMES_ML = [1, 2, 3, 4, 5, 6, 8, 10]

const ReconstitutionTab = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const compoundProto = useMemo(
    () => getCompoundProtocol(product.handle || product.title),
    [product.handle, product.title]
  )

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
        const mcg = unit === "mg" ? amount * 1000 : unit === "iu" ? amount : amount
        return { label: v.value, mcg }
      })
      .filter(Boolean) as { label: string; mcg: number }[]
  }, [contentOption])

  const defaultContent = contentValues[0] ?? {
    label: `${compoundProto.reconstitution.defaultVialNetMg} mg`,
    mcg: compoundProto.reconstitution.defaultVialNetMg * 1000,
  }

  const dosePresets = useMemo(() => {
    if (compoundProto.id === "tirzepatide") {
      return [1250, 2500, 5000, 7500, 10000, 15000]
    }
    if (compoundProto.id === "ghk-cu") {
      return [500, 1000, 1500, 2000, 2500, 3000]
    }
    return [100, 200, 250, 300, 500, 750, 1000]
  }, [compoundProto.id])

  const [selectedContent, setSelectedContent] = useState(defaultContent)
  const [diluentMl, setDiluentMl] = useState(compoundProto.reconstitution.defaultDiluentMl)
  const [doseMcg, setDoseMcg] = useState(compoundProto.dosing.standardDoseMcg)

  const concentration = selectedContent.mcg / diluentMl
  const volumePerDose = doseMcg / concentration
  const unitsPerDose = volumePerDose * 100
  const dosesPerVial = selectedContent.mcg / doseMcg

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
            Calculate reconstitution dilution, per-dose volume, and syringe IU graduations for {product.title}.
          </p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 font-medium">
          Recommended Standard Dose: <strong className="font-bold">{compoundProto.dosing.standardDoseDisplay}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Input Controls */}
        <div className="space-y-5">
          {contentValues.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">1. Select Vial Net Content</span>
              <div className="flex flex-wrap gap-2">
                {contentValues.map((cv) => (
                  <button
                    key={cv.label}
                    type="button"
                    onClick={() => setSelectedContent(cv)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedContent.label === cv.label
                        ? "border-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-500/30"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cv.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Diluent Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700">2. Bacteriostatic Water Added</span>
              <span className="text-xs font-bold text-zinc-900 tabular-nums">
                {diluentMl} mL
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={DILUENT_VOLUMES_ML.length - 1}
              step={1}
              value={DILUENT_VOLUMES_ML.indexOf(diluentMl) === -1 ? 1 : DILUENT_VOLUMES_ML.indexOf(diluentMl)}
              onChange={(e) => setDiluentMl(DILUENT_VOLUMES_ML[parseInt(e.target.value)])}
              className="w-full h-2 rounded-full bg-zinc-200 accent-zinc-900 cursor-pointer"
              aria-label="Diluent volume"
            />
            <div className="flex justify-between text-[11px] text-zinc-400">
              {DILUENT_VOLUMES_ML.map((v) => (
                <span key={v}>{v}mL</span>
              ))}
            </div>
            <p className="text-xs text-zinc-500">
              Resulting Concentration:{" "}
              <span className="font-bold text-zinc-800">
                {concentration >= 1000
                  ? `${(concentration / 1000).toFixed(2)} mg/mL`
                  : `${concentration.toFixed(1)} mcg/mL`}
              </span>
            </p>
          </div>

          {/* Dose Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700">3. Target Desired Dose</span>
              <span className="text-xs font-bold text-zinc-900 tabular-nums">
                {doseMcg >= 1000 ? `${(doseMcg / 1000).toFixed(doseMcg % 1000 === 0 ? 0 : 2)} mg` : `${doseMcg} mcg`}
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
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  {preset >= 1000 ? `${(preset / 1000).toFixed(preset % 1000 === 0 ? 0 : 2)} mg` : `${preset} mcg`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Calculated Syringe &amp; Dose Outputs
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="text-xl font-bold text-zinc-900 tabular-nums">
                {volumePerDose < 0.01 ? "<0.01" : volumePerDose.toFixed(2)}{" "}
                <span className="text-xs font-normal text-zinc-500">mL</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Volume / Dose</div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="text-xl font-bold text-emerald-800 tabular-nums">
                {unitsPerDose < 0.1 ? "<0.1" : unitsPerDose.toFixed(1)}{" "}
                <span className="text-xs font-normal text-zinc-500">IU</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Syringe Units
                <span className="block text-[9px] text-zinc-400">(100 IU = 1 mL)</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <div className="text-xl font-bold text-zinc-900 tabular-nums">
                {dosesPerVial < 1
                  ? "<1"
                  : dosesPerVial % 1 === 0
                  ? dosesPerVial.toFixed(0)
                  : dosesPerVial.toFixed(1)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Doses / Vial</div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed border-t border-emerald-200/80 pt-3">
            Calculated for {selectedContent.label} vial reconstituted in {diluentMl} mL
            Bacteriostatic Water at {doseMcg >= 1000 ? `${(doseMcg / 1000).toFixed(1)} mg` : `${doseMcg} mcg`}/dose.
            For laboratory evaluation only.
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. Compliance & Safety Accordion
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
        <Accordion.Item title="Packaging & Cold-Chain Logistics" value="packaging">
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
