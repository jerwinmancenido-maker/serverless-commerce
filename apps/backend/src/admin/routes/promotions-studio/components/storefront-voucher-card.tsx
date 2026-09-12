/**
 * @file    apps/backend/src/admin/routes/promotions-studio/components/storefront-voucher-card.tsx
 * @module  StorefrontVoucherCard
 * @purpose Renders the customer-facing voucher card in real-time as the admin configures rules.
 * @contracts
 *   Studio:  StorefrontVoucherCardProps
 */

import React, { useState } from "react"
import { Tag, CheckCircle } from "@medusajs/icons"
import { PromotionStudioState } from "../types"

interface StorefrontVoucherCardProps {
  state: PromotionStudioState
}

export const StorefrontVoucherCard: React.FC<StorefrontVoucherCardProps> = ({ state }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!state.code) return
    navigator.clipboard.writeText(state.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDiscountLabel = () => {
    if (state.type === "percentage") {
      return `${state.value || 0}% OFF`
    }
    const symbol = state.currencyCode === "USD" ? "$" : "₱"
    return `${symbol}${(state.value || 0).toLocaleString()} OFF`
  }

  const currencySymbol = state.currencyCode === "USD" ? "$" : "₱"

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-5 shadow-lg border border-slate-700/50 relative overflow-hidden transition-all duration-200">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header pill */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold tracking-wide">
          <Tag className="w-3.5 h-3.5" />
          <span>RESEARCH PROTOCOL VOUCHER</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {state.hasEndDate && state.endDate ? `EXP: ${state.endDate.slice(0, 10)}` : "NO EXPIRY"}
        </span>
      </div>

      {/* Main Discount Headline */}
      <div className="mb-2">
        <h3 className="text-2xl font-bold tracking-tight text-white flex items-baseline gap-2">
          <span>{formatDiscountLabel()}</span>
          <span className="text-xs font-normal text-slate-300 tracking-normal">
            {state.allocation === "each" ? "per eligible item" : "on order subtotal"}
          </span>
        </h3>
        <p className="text-xs text-slate-300 line-clamp-2 mt-1">
          {state.title || "Custom Research Compound Protocol Promotion"}
        </p>
      </div>

      {/* Promo Code Copy Box */}
      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2 bg-slate-950/40 rounded-xl px-3 py-2 border border-dashed border-slate-700">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
            Storefront Voucher Code
          </span>
          <span className="font-mono text-base font-bold text-amber-300 tracking-wider">
            {state.code || "ENTER-CODE"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Qualification Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {state.minOrderValue > 0
            ? `Min. Order: ${currencySymbol}${state.minOrderValue.toLocaleString()}`
            : "No minimum spend required"}
        </span>
        <span>
          {state.maxRedemptions ? `Max ${state.maxRedemptions} uses` : "Unlimited uses"}
        </span>
      </div>
    </div>
  )
}
