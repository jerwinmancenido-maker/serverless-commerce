/**
 * @file    apps/backend/src/admin/routes/promotions-studio/components/promotion-studio-form.tsx
 * @module  PromotionStudioForm
 * @purpose Renders the 62% left column continuous progressive form flow for promotion configuration.
 * @contracts
 *   Studio:  PromotionStudioFormProps
 */

import React from "react"
import { Sparkles, CheckCircle, Tag } from "@medusajs/icons"
import { PromotionStudioState, PromotionType, AllocationType } from "../types"
import { useCodeChecker } from "../hooks/use-code-checker"

interface PromotionStudioFormProps {
  state: PromotionStudioState
  onChange: (updates: Partial<PromotionStudioState>) => void
  isEditMode: boolean
}

export const PromotionStudioForm: React.FC<PromotionStudioFormProps> = ({
  state,
  onChange,
  isEditMode,
}) => {
  const { isChecking, isAvailable } = useCodeChecker(state.code, state.id)

  const generateRandomCode = () => {
    const prefixes = ["VIP", "RESEARCH", "PROTOCOL", "CLINICAL", "LAB", "SUMMER"]
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    onChange({ code: `${randomPrefix}-${randomNum}` })
  }

  const toggleCategory = (cat: string) => {
    const existing = state.targetCategories || []
    if (existing.includes(cat)) {
      onChange({ targetCategories: existing.filter((c) => c !== cat) })
    } else {
      onChange({ targetCategories: [...existing, cat] })
    }
  }

  return (
    <div className="space-y-6">
      {/* ── CARD 1: TYPE & IDENTITY ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Promotion Type & Core Identity</h2>
            <p className="text-xs text-slate-500">Configure how the discount calculates and how buyers identify it.</p>
          </div>
        </div>

        {/* Type Selection Choice Cards */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Discount Calculation Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "percentage" as PromotionType,
                title: "Percentage Discount",
                desc: "Deducts a % from eligible items or cart subtotal.",
                badge: "% Off",
              },
              {
                id: "fixed" as PromotionType,
                title: "Fixed Amount",
                desc: "Deducts a flat currency amount (e.g. ₱500).",
                badge: "₱ / $ Flat",
              },
              {
                id: "buy_get" as PromotionType,
                title: "Buy X Get Y (BOGO)",
                desc: "Offers complimentary supplies when purchasing vials.",
                badge: "Bundle Promo",
              },
            ].map((option) => {
              const isSelected = state.type === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChange({ type: option.id })}
                  className={`p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-gradient-to-b from-blue-50/60 to-white shadow-sm ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{option.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {option.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{option.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Promotion Code & Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Voucher Code <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={generateRandomCode}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Random</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={state.code}
                onChange={(e) => onChange({ code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER-VIP-20"
                className="w-full h-10 px-3 font-mono font-bold text-slate-900 uppercase border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
              />
              <div className="absolute right-2.5 top-2.5">
                {isChecking && (
                  <span className="text-[11px] text-slate-400 font-medium">Checking...</span>
                )}
                {!isChecking && isAvailable === true && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Available</span>
                  </span>
                )}
                {!isChecking && isAvailable === false && (
                  <span className="text-[11px] text-rose-600 font-semibold">
                    Already in use
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Title / Campaign Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={state.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. VIP Summer Protocol 20% Discount"
              className="w-full h-10 px-3 text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description / Research Staff Notes
          </label>
          <textarea
            rows={2}
            value={state.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Document protocol authorization, clinical tier eligibility, or purpose..."
            className="w-full p-3 text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white resize-none"
          />
        </div>
      </div>

      {/* ── CARD 2: VALUE & ALLOCATION RULES ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-xs">
            2
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Discount Value & Application Rules</h2>
            <p className="text-xs text-slate-500">Define the quantitative value, allocation scope, and product categories.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Discount Value */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {state.type === "percentage" ? "Percentage Value (%)" : "Flat Amount"} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={state.type === "percentage" ? 100 : undefined}
                value={state.value || ""}
                onChange={(e) => onChange({ value: parseFloat(e.target.value) || 0 })}
                placeholder={state.type === "percentage" ? "20" : "500"}
                className="w-full h-10 pl-3 pr-10 font-mono font-bold text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">
                {state.type === "percentage" ? "%" : state.currencyCode}
              </span>
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operational Currency
            </label>
            <select
              value={state.currencyCode}
              onChange={(e) => onChange({ currencyCode: e.target.value as "PHP" | "USD" })}
              className="w-full h-10 px-3 text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
            >
              <option value="PHP">₱ Philippine Peso (PHP)</option>
              <option value="USD">$ US Dollar (USD)</option>
            </select>
          </div>

          {/* Allocation Scope */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Allocation Scope
            </label>
            <select
              value={state.allocation}
              onChange={(e) => onChange({ allocation: e.target.value as AllocationType })}
              className="w-full h-10 px-3 text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
            >
              <option value="across">Across Order Subtotal</option>
              <option value="each">Per Eligible Item</option>
            </select>
          </div>
        </div>

        {/* Minimum Order Value & Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Cart Subtotal Threshold
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                value={state.minOrderValue || ""}
                onChange={(e) => onChange({ minOrderValue: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 3500"
                className="w-full h-10 pl-8 pr-3 text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
              />
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">
                {state.currencyCode === "USD" ? "$" : "₱"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Leave blank or 0 for no minimum spend.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Target Product Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "peptides", label: "Injectable Peptides" },
                { id: "solutions", label: "Sterile Reconstitution Water" },
                { id: "supplies", label: "Syringes & Accessories" },
              ].map((cat) => {
                const isSelected = state.targetCategories?.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 border-blue-400 text-blue-800 font-semibold"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 3: CAMPAIGN, SCHEDULE & REDEMPTION LIMITS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-bold text-xs">
            3
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Campaign Schedule & Redemption Limits</h2>
            <p className="text-xs text-slate-500">Control active operational windows and limit total coupon exposure.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date (Active From)
            </label>
            <input
              type="date"
              value={state.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full h-10 px-3 text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Expiration Date
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.hasEndDate}
                  onChange={(e) => onChange({ hasEndDate: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Set Expiration</span>
              </label>
            </div>
            <input
              type="date"
              disabled={!state.hasEndDate}
              value={state.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className={`w-full h-10 px-3 text-slate-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
                state.hasEndDate
                  ? "border-slate-300 bg-white"
                  : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {/* Redemption Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Redemptions Cap
            </label>
            <input
              type="number"
              min={1}
              value={state.maxRedemptions || ""}
              onChange={(e) => onChange({ maxRedemptions: parseInt(e.target.value, 10) || null })}
              placeholder="e.g. 150 (Leave blank for unlimited)"
              className="w-full h-10 px-3 text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Limit Per Customer Account
            </label>
            <input
              type="number"
              min={1}
              value={state.maxPerCustomer || ""}
              onChange={(e) => onChange({ maxPerCustomer: parseInt(e.target.value, 10) || null })}
              placeholder="e.g. 1 (Leave blank for unlimited)"
              className="w-full h-10 px-3 text-slate-900 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
