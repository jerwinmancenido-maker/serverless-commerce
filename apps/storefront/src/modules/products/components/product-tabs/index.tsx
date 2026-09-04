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

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
  linkedProtocol?: StoreResearchProtocol | null
}

const ProductTabs = ({ product, linkedProtocol }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase()
      if (hash === "#protocol") {
        setActiveTab("protocol")
      } else if (hash === "#calculator") {
        setActiveTab("calculator")
      } else if (hash === "#compliance") {
        setActiveTab("compliance")
      }
    }
    handleHash()
    window.addEventListener("hashchange", handleHash)
    return () => window.removeEventListener("hashchange", handleHash)
  }, [])

  const tabs = [
    { id: "overview", label: "📝 Description & Specs" },
    ...(linkedProtocol ? [{ id: "protocol", label: "🔬 Research Protocol" }] : []),
    { id: "calculator", label: "🧮 Reconstitution Tool" },
    { id: "compliance", label: "🛡️ Compliance & Safety" },
    { id: "shipping", label: "🚚 Shipping & Transit" },
  ]

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Horizontal Nav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900"
            }`}
          >
            {tab.label}
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
            <ResearchProtocolPanel protocol={linkedProtocol} product={product} />
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
        <p className="text-zinc-600 text-xs mt-1">Laboratory & In-Vitro Research Only</p>
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
// 2. Verified Research Protocol Panel
// ---------------------------------------------------------------------------
const ResearchProtocolPanel = ({
  protocol,
  product,
}: {
  protocol?: StoreResearchProtocol | null
  product: HttpTypes.StoreProduct
}) => {
  if (!protocol) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 text-lg">
          🔬
        </div>
        <h4 className="text-xs font-semibold text-zinc-800">
          No Published Research Protocol
        </h4>
        <p className="text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
          No versioned laboratory protocol is currently linked to {product.title}. Configure via Medusa Admin or consult the reconstitution tool.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/30 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-xl shadow-xs">
            🔬
          </div>
          <div>
            <span className="rounded-full bg-indigo-100/90 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-900 uppercase tracking-wide">
              Verified Published Protocol · Rev {protocol.revision}
            </span>
            <h3 className="text-lg font-bold text-zinc-900 mt-1">
              {protocol.title}
            </h3>
          </div>
        </div>
        <LocalizedClientLink
          href={`/research-protocols/${protocol.handle}`}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-2xs"
        >
          Study Protocol Page ↗
        </LocalizedClientLink>
      </div>

      {protocol.summary && (
        <p className="text-sm text-zinc-600 leading-relaxed">
          {protocol.summary}
        </p>
      )}

      {/* Quick Reference Matrix from Database */}
      {protocol.content?.quick_reference && protocol.content.quick_reference.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {protocol.content.quick_reference.map((item, idx) => (
            <div
              key={item.key || idx}
              className="p-3 rounded-xl bg-white/90 border border-indigo-100 text-xs shadow-2xs"
            >
              <span className="font-semibold text-zinc-900 block text-[10px] uppercase tracking-wider text-indigo-700">
                {item.label}
              </span>
              <span className="font-bold text-zinc-900 mt-1 block text-sm">
                {item.value}
              </span>
              {item.description && (
                <p className="text-zinc-500 text-[11px] mt-0.5">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Protocol Content Sections from Database */}
      {protocol.content?.sections && protocol.content.sections.length > 0 && (
        <div className="space-y-4 pt-2">
          {protocol.content.sections
            .filter((s) => s.visible !== false)
            .sort((a, b) => a.position - b.position)
            .map((section, idx) => (
              <div key={section.key || idx} className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  {section.title}
                </h4>
                <div className="text-xs text-zinc-600 whitespace-pre-line leading-relaxed bg-zinc-50/60 p-4 rounded-xl border border-zinc-200/80">
                  {section.body}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Legal & Laboratory Disclaimer */}
      {protocol.content?.disclaimer && (
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
          <strong>Laboratory Notice:</strong> {protocol.content.disclaimer}
        </div>
      )}

      <div className="pt-2 sm:hidden">
        <LocalizedClientLink
          href={`/research-protocols/${protocol.handle}`}
          className="inline-flex w-full justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
        >
          Study Full Protocol & Discussion ↗
        </LocalizedClientLink>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. Interactive Reconstitution Calculator
// ---------------------------------------------------------------------------
const DILUENT_VOLUMES_ML = [1, 2, 3, 4, 5, 6, 8, 10]
const DOSE_PRESETS_MCG = [100, 200, 250, 300, 500, 750, 1000]

const ReconstitutionTab = ({ product }: { product: HttpTypes.StoreProduct }) => {
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

  const defaultContent = contentValues[0] ?? { label: "10 mg", mcg: 10_000 }

  const [selectedContent, setSelectedContent] = useState(defaultContent)
  const [diluentMl, setDiluentMl] = useState(2)
  const [doseMcg, setDoseMcg] = useState(250)

  const concentration = selectedContent.mcg / diluentMl
  const volumePerDose = doseMcg / concentration
  const unitsPerDose = volumePerDose * 100
  const dosesPerVial = selectedContent.mcg / doseMcg

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🧮</span>
          <h3 className="text-base font-bold text-zinc-900">
            Interactive Reconstitution Calculator
          </h3>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Calculate your reconstitution ratio, per-dose volume, and number of
          doses per vial. For <span className="font-medium text-zinc-700">research reference only</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Input Controls */}
        <div className="space-y-5">
          {contentValues.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-700">1. Select Vial Net Content</span>
              <div className="flex flex-wrap gap-2">
                {contentValues.map((cv) => (
                  <button
                    key={cv.label}
                    type="button"
                    onClick={() => setSelectedContent(cv)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedContent.label === cv.label
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-2xs"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
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
                {doseMcg >= 1000 ? `${doseMcg / 1000} mg` : `${doseMcg} mcg`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DOSE_PRESETS_MCG.map((preset) => (
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
                  {preset >= 1000 ? `${preset / 1000} mg` : `${preset} mcg`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            📐 Calculated Syringe & Dose Outputs
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
            Bacteriostatic Water at {doseMcg >= 1000 ? `${doseMcg / 1000} mg` : `${doseMcg} mcg`}/dose.
            For laboratory evaluation only.
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. Compliance & Safety Accordion (Exact 5 items requested)
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
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🛡️</span>
        <h3 className="text-base font-bold text-zinc-900">Compliance & Safety</h3>
      </div>
      <Accordion type="multiple">
        <Accordion.Item title="📦 Storage & Handling" value="storage">
          <div className="py-3 text-xs leading-relaxed text-zinc-600">
            {storageText}
          </div>
        </Accordion.Item>
        <Accordion.Item title="🔬 Intended Use" value="intended-use">
          <div className="py-3 text-xs leading-relaxed text-zinc-600">
            {intendedUseText}
          </div>
        </Accordion.Item>
        <Accordion.Item title="📄 Terms of Sale" value="terms">
          <div className="py-3 text-xs leading-relaxed text-zinc-600">
            {termsOfSaleText}
          </div>
        </Accordion.Item>
        <Accordion.Item title="⚠️ Disclaimer" value="disclaimer">
          <div className="py-3 text-xs leading-relaxed text-zinc-600">
            {disclaimerText}
          </div>
        </Accordion.Item>
        <Accordion.Item title="📦 Packaging Options" value="packaging">
          <div className="py-3 text-xs leading-relaxed text-zinc-600">
            {packagingOptionsText}
          </div>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5. Shipping & Transit Policy (Generic, compliant, no hardcoded courier)
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
            <span className="font-semibold text-zinc-900 text-xs">Transit Protection & Replacement</span>
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
