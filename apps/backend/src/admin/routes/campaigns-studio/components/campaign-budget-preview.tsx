/**
 * @file    apps/backend/src/admin/routes/campaigns-studio/components/campaign-budget-preview.tsx
 * @module  CampaignBudgetPreview
 * @purpose Live Budget Exposure, ROI Simulator, and Storefront Banner preview for Campaigns Studio.
 * @contracts
 *   Component: CampaignBudgetPreview
 *   Types:     CampaignStudioState
 */

import React from "react"
import {
  Sparkles,
  Buildings,
  Tag,
  CurrencyDollar,
  Calendar,
  ShieldCheck,
  ChartBar,
} from "@medusajs/icons"
import { CampaignStudioState } from "../types"

interface CampaignBudgetPreviewProps {
  state: CampaignStudioState
}

export const CampaignBudgetPreview: React.FC<CampaignBudgetPreviewProps> = ({ state }) => {
  const isSpend = state.budgetType === "spend"
  const aov = state.estimatedAvgOrderValue || 8500 // Average compound order value ₱8,500

  // Financial model calculations
  let projectedOrders = 0
  let projectedGmv = 0
  let maxDiscountLiability = 0

  if (isSpend) {
    maxDiscountLiability = state.budgetLimit || 100000
    // Assume average 20% promotional discount: GMV = discountLiability / 0.20
    projectedGmv = maxDiscountLiability / 0.20
    projectedOrders = Math.round(projectedGmv / aov)
  } else {
    projectedOrders = state.budgetLimit || 500
    projectedGmv = projectedOrders * aov
    maxDiscountLiability = projectedGmv * 0.20
  }

  // Margin calculation assuming standard 68% compound gross margin minus 20% discount = 48% net margin (Above 35% floor)
  const netMargin = 48

  return (
    <div className="flex flex-col gap-5 sticky top-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Live Campaign Exposure & ROI
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Financial Guardrails
        </span>
      </div>

      {/* Storefront Floating Announcement Bar Preview */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-xl p-3.5 shadow-md flex items-center justify-between border border-blue-500/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 flex-shrink-0">
            Live Promo
          </span>
          <p className="text-xs font-bold text-white truncate">
            {state.promotionalHeadline || `${state.name || "Commercial Launch"}: Exclusive Clinic Tier Savings`}
          </p>
        </div>
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/30 border border-white/20 text-blue-200 flex-shrink-0 ml-3">
          {state.campaignIdentifier || "CAMP-2026"}
        </span>
      </div>

      {/* Campaign Strategy Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            {isSpend ? "Capped Spend Budget" : "Capped Redemption Volume"}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {state.startsAt} &rarr; {state.hasEndDate ? state.endsAt : "Ongoing"}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight mb-1">
          {state.name || "Untitled Strategic Campaign"}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-6">
          {state.description || "No strategic objective specified for this commercial promotional run."}
        </p>

        {/* 3 Metric Pillars */}
        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-6">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Budget Cap
            </span>
            <span className="text-base font-extrabold text-white mt-0.5 block font-mono">
              {isSpend ? `₱${(state.budgetLimit || 0).toLocaleString()}` : `${(state.budgetLimit || 0).toLocaleString()} uses`}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Projected GMV
            </span>
            <span className="text-base font-extrabold text-emerald-400 mt-0.5 block font-mono">
              ₱{Math.round(projectedGmv).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Est. Orders
            </span>
            <span className="text-base font-extrabold text-blue-300 mt-0.5 block font-mono">
              ~{projectedOrders.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Budget Burn & Exposure Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Budget Burn Risk Allocation</span>
            <span className="text-emerald-400 font-bold font-mono">0.0% Burned (New Campaign)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full w-[2%]" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>₱0.00 Authorized</span>
            <span>Limit: ₱{maxDiscountLiability.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Margin Floor Protection Card */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Commercial Margin Floor</h4>
              <p className="text-[11px] text-slate-500">Autonomous 35% minimum threshold lock</p>
            </div>
          </div>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
            {netMargin}% Net Margin
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span>Baseline Compound Gross Margin:</span>
            <span className="font-semibold text-slate-900">68.0%</span>
          </div>
          <div className="flex justify-between items-center text-rose-600">
            <span>Effective Promotional Markdown:</span>
            <span className="font-semibold">-20.0%</span>
          </div>
          <div className="border-t border-slate-200 pt-1 flex justify-between items-center font-bold text-slate-900">
            <span>Net Operating Margin:</span>
            <span className="text-emerald-700 font-mono">{netMargin}.0% (Safe &gt; 35%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
