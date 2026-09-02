"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import { useMemo, useState } from "react"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Reconstitution Calculator",
      component: <ReconstitutionTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const contentOption = product.options?.find(
    (o) =>
      o.title?.toLowerCase().includes("content") ||
      o.title?.toLowerCase().includes("net")
  )
  const inclusionOption = product.options?.find((o) =>
    o.title?.toLowerCase().includes("inclusion")
  )

  return (
    <div className="text-small-regular py-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <span className="font-semibold text-zinc-900 text-xs">Research Grade</span>
          <p className="text-zinc-600 text-xs mt-0.5">≥98% High Purity (HPLC & MS Verified)</p>
        </div>
        <div>
          <span className="font-semibold text-zinc-900 text-xs">Intended Use</span>
          <p className="text-zinc-600 text-xs mt-0.5">Laboratory & Research Use Only</p>
        </div>
        <div>
          <span className="font-semibold text-zinc-900 text-xs">Recommended Storage</span>
          <p className="text-zinc-600 text-xs mt-0.5">Store lyophilized at -20°C; protect from light</p>
        </div>
        <div>
          <span className="font-semibold text-zinc-900 text-xs">Reconstitution</span>
          <p className="text-zinc-600 text-xs mt-0.5">Reconstitute with Sterile BAC Water</p>
        </div>
        {contentOption && (
          <div>
            <span className="font-semibold text-zinc-900 text-xs">Net Content Options</span>
            <p className="text-zinc-600 text-xs mt-0.5">
              {contentOption.values?.map((v) => v.value).join(", ")}
            </p>
          </div>
        )}
        {inclusionOption && (
          <div>
            <span className="font-semibold text-zinc-900 text-xs">Inclusion Packages</span>
            <p className="text-zinc-600 text-xs mt-0.5">
              {inclusionOption.values?.map((v) => v.value).join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3.3 – Interactive Reconstitution Calculator
// Reads net content from the product options (e.g. "10 mg") and lets the
// researcher interactively compute concentration → syringe units per dose.
// ---------------------------------------------------------------------------
const DILUENT_VOLUMES_ML = [1, 2, 3, 4, 5, 6, 8, 10]
const DOSE_PRESETS_MCG = [100, 200, 250, 300, 500, 750, 1000]

const ReconstitutionTab = ({ product }: ProductTabsProps) => {
  // Extract possible net content values from the product options
  const contentOption = product.options?.find(
    (o) =>
      o.title?.toLowerCase().includes("content") ||
      o.title?.toLowerCase().includes("net")
  )

  // Parse the first numeric mg value found in the option values
  const contentValues = useMemo(() => {
    if (!contentOption?.values) return []
    return contentOption.values
      .map((v) => {
        const match = v.value.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|iu)/i)
        if (!match) return null
        const amount = parseFloat(match[1])
        const unit = match[2].toLowerCase()
        // Normalise to mcg for consistent arithmetic
        const mcg = unit === "mg" ? amount * 1000 : unit === "iu" ? amount : amount
        return { label: v.value, mcg }
      })
      .filter(Boolean) as { label: string; mcg: number }[]
  }, [contentOption])

  const defaultContent = contentValues[0] ?? { label: "10 mg", mcg: 10_000 }

  const [selectedContent, setSelectedContent] = useState(defaultContent)
  const [diluentMl, setDiluentMl] = useState(2)
  const [doseMcg, setDoseMcg] = useState(250)

  const concentration = selectedContent.mcg / diluentMl // mcg per mL
  const volumePerDose = doseMcg / concentration // mL per dose
  const unitsPerDose = volumePerDose * 100 // insulin "units" (1 unit = 0.01 mL)
  const dosesPerVial = selectedContent.mcg / doseMcg

  return (
    <div className="py-6 space-y-5">
      <p className="text-xs text-zinc-500 leading-relaxed">
        Calculate your reconstitution ratio, per-dose volume, and number of
        doses per vial. All values are for{" "}
        <span className="font-medium text-zinc-700">research reference only</span>.
      </p>

      {/* Net Content selector */}
      {contentValues.length > 1 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-zinc-700">Vial Net Content</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {contentValues.map((cv) => (
              <button
                key={cv.label}
                type="button"
                onClick={() => setSelectedContent(cv)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedContent.label === cv.label
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {cv.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Diluent volume slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-700">BAC Water Added</span>
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
          className="w-full h-1.5 rounded-full bg-zinc-200 accent-zinc-900 cursor-pointer"
          aria-label="Diluent volume"
        />
        <div className="flex justify-between text-[10px] text-zinc-400">
          {DILUENT_VOLUMES_ML.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
        <p className="text-[11px] text-zinc-400">
          Concentration:{" "}
          <span className="font-semibold text-zinc-700">
            {concentration >= 1000
              ? `${(concentration / 1000).toFixed(2)} mg/mL`
              : `${concentration.toFixed(1)} mcg/mL`}
          </span>
        </p>
      </div>

      {/* Desired dose presets */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-700">Desired Dose</span>
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
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
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

      {/* Results card */}
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4 space-y-3">
        <div className="text-xs font-semibold text-emerald-800 mb-1">
          📐 Calculated Results
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div
              className="text-lg font-bold text-zinc-900 tabular-nums"
              data-testid="recon-volume-per-dose"
            >
              {volumePerDose < 0.01
                ? "<0.01"
                : volumePerDose.toFixed(2)}{" "}
              <span className="text-xs font-normal text-zinc-500">mL</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Volume / Dose</div>
          </div>
          <div className="text-center">
            <div
              className="text-lg font-bold text-zinc-900 tabular-nums"
              data-testid="recon-units-per-dose"
            >
              {unitsPerDose < 0.1
                ? "<0.1"
                : unitsPerDose.toFixed(1)}{" "}
              <span className="text-xs font-normal text-zinc-500">IU</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Syringe Units
              <span className="block text-[9px]">(100 IU = 1 mL)</span>
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-lg font-bold text-zinc-900 tabular-nums"
              data-testid="recon-doses-per-vial"
            >
              {dosesPerVial < 1
                ? "<1"
                : dosesPerVial % 1 === 0
                ? dosesPerVial.toFixed(0)
                : dosesPerVial.toFixed(1)}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Doses / Vial</div>
          </div>
        </div>
        <p className="text-[10px] text-zinc-400 leading-relaxed border-t border-emerald-200/60 pt-2">
          Based on {selectedContent.label} vial reconstituted in {diluentMl} mL
          BAC Water at {doseMcg >= 1000 ? `${doseMcg / 1000} mg` : `${doseMcg} mcg`}/dose.
          For research reference only.
        </p>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-6">
      <div className="grid grid-cols-1 gap-y-6">
        <div className="flex items-start gap-x-3">
          <FastDelivery />
          <div>
            <span className="font-semibold text-zinc-900 text-xs">Expedited Delivery (Philippines)</span>
            <p className="max-w-sm text-zinc-600 text-xs mt-0.5 leading-relaxed">
              Dispatched with temperature-stable protective packaging via J&T Express. Standard transit is 2–4 business days across NCR and Provincial locations.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Refresh />
          <div>
            <span className="font-semibold text-zinc-900 text-xs">Transit Protection & Replacement</span>
            <p className="max-w-sm text-zinc-600 text-xs mt-0.5 leading-relaxed">
              Every shipment is sealed in tamper-evident packaging with shock-absorbing foam. In the rare event of transit damage, replacement is handled immediately through Live Support.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-3">
          <Back />
          <div>
            <span className="font-semibold text-zinc-900 text-xs">Batch Integrity Policy</span>
            <p className="max-w-sm text-zinc-600 text-xs mt-0.5 leading-relaxed">
              To maintain strict sterility, laboratory compounds cannot be restocked once opened. Unopened items with unbroken security seals are eligible for return evaluation within 7 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
