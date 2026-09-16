/**
 * @file    apps/backend/src/admin/routes/price-lists-studio/components/price-list-preview.tsx
 * @module  PriceListPreviewComponent
 * @purpose Split-Canvas live preview simulating the B2B buyer view and real-time margin health gauge.
 * @contracts
 *   Parent:  PriceListsStudioPage
 */

import React from "react"
import { Sparkles, ShieldCheck, CheckCircle, ExclamationCircle, Buildings, Tag } from "@medusajs/icons"
import { PriceListStudioState, CustomerGroupOption } from "../types"

interface PriceListPreviewProps {
  state: PriceListStudioState
  availableCustomerGroups: CustomerGroupOption[]
}

export const PriceListPreview: React.FC<PriceListPreviewProps> = ({ state, availableCustomerGroups }) => {
  const selectedGroups = availableCustomerGroups.filter((g) => state.customerGroupIds.includes(g.id))

  // Calculate portfolio margin health
  const totalItems = state.prices.length
  let totalRevenue = 0
  let totalCost = 0
  let itemsBelowFloor = 0

  state.prices.forEach((p) => {
    totalRevenue += p.customPrice
    totalCost += p.estimatedCost
    const margin = p.customPrice > 0 ? ((p.customPrice - p.estimatedCost) / p.customPrice) * 100 : 0
    if (margin < 35) itemsBelowFloor++
  })

  const averageMarginPct = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
  const isHealthyMargin = averageMarginPct >= 35 && itemsBelowFloor === 0

  // Featured item for storefront preview card (first item or fallback placeholder)
  const previewItem = state.prices[0] || {
    productTitle: "BPC-157 5mg Vial",
    variantTitle: "High Purity Lyophilized (99.4%)",
    sku: "BPC-157-5MG",
    defaultPrice: 4200,
    customPrice: state.type === "sale" ? 3570 : 3150,
    estimatedCost: 1680,
  }

  const discountAmount = previewItem.defaultPrice - previewItem.customPrice
  const discountPct =
    previewItem.defaultPrice > 0 ? ((discountAmount / previewItem.defaultPrice) * 100).toFixed(0) : "0"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
      {/* ── CARD 1: Storefront Live Simulation ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Storefront Live Preview
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            {state.type === "sale" ? "Public Sale Mode" : "B2B Wholesale Tier"}
          </span>
        </div>

        <div className="p-5">
          <div className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-1.5">
            <Buildings className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Target Audience:{" "}
              {selectedGroups.length > 0 ? (
                <strong className="text-slate-700">{selectedGroups.map((g) => g.name).join(", ")}</strong>
              ) : (
                <strong className="text-slate-700">All Storefront Buyers</strong>
              )}
            </span>
          </div>

          {/* Mock Product Card */}
          <div className="border border-slate-200 rounded-xl p-4 bg-gradient-to-b from-slate-50/50 to-white shadow-xs">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {state.title || "Custom Price List"}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5">{previewItem.productTitle}</h4>
                <p className="text-xs text-slate-500">{previewItem.variantTitle}</p>
              </div>

              {discountAmount > 0 && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                  Save {discountPct}%
                </span>
              )}
            </div>

            {/* Price Row */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline gap-3">
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                ₱{previewItem.customPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </div>
              {discountAmount > 0 && (
                <div className="text-sm font-medium text-slate-400 line-through font-mono">
                  ₱{previewItem.defaultPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Direct Clinical Net Price</span>
              {discountAmount > 0 && (
                <span className="font-semibold text-emerald-600">
                  You save ₱{discountAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Margin Floor & Sovereign Guard ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 min-w-0 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900">Commercial Margin Health</span>
          </div>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isHealthyMargin ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isHealthyMargin ? "Protected (≥35%)" : "Floor Warning (<35%)"}
          </span>
        </div>

        {/* Meter Gauge */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Portfolio Average Margin</span>
            <span className={averageMarginPct >= 35 ? "text-emerald-600 font-mono" : "text-red-600 font-mono"}>
              {averageMarginPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                averageMarginPct >= 50
                  ? "bg-emerald-500"
                  : averageMarginPct >= 35
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, averageMarginPct))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span className="font-semibold text-slate-600">35% Minimum Floor</span>
            <span>100%</span>
          </div>
        </div>

        {/* Audit Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 rounded-lg bg-slate-50">
            <div className="text-[10px] text-slate-400 font-medium">Configured Items</div>
            <div className="text-sm font-bold text-slate-800 font-mono">{totalItems}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-50">
            <div className="text-[10px] text-slate-400 font-medium">Floor Alerts</div>
            <div className={`text-sm font-bold font-mono ${itemsBelowFloor > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {itemsBelowFloor}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Clinical Formulation Governance ── */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-xs text-slate-600 space-y-3 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>Clinical Formulation & Wholesale Governance</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Price lists establish authoritative institutional pricing tiers across clinic and research partners. All overrides are applied directly to unit checkout costs with zero tax.
          </p>
        </div>
        <div className="pt-3 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Sovereign RUO Reference Standard</span>
          <span className="font-semibold text-slate-600">PHP Direct Ledger</span>
        </div>
      </div>
    </div>
  )
}
