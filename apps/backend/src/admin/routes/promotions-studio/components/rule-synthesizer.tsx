/**
 * @file    apps/backend/src/admin/routes/promotions-studio/components/rule-synthesizer.tsx
 * @module  RuleSynthesizer
 * @purpose Generates real-time plain-English explanations of promotion rule configurations.
 * @contracts
 *   Studio:  RuleSynthesizerProps
 */

import React, { useMemo } from "react"
import { InformationCircle } from "@medusajs/icons"
import { PromotionStudioState } from "../types"

interface RuleSynthesizerProps {
  state: PromotionStudioState
}

export const RuleSynthesizer: React.FC<RuleSynthesizerProps> = ({ state }) => {
  const summarySentence = useMemo(() => {
    const symbol = state.currencyCode === "USD" ? "$" : "₱"
    const discountStr =
      state.type === "percentage"
        ? `${state.value || 0}% discount`
        : `${symbol}${(state.value || 0).toLocaleString()} discount`

    const targetStr =
      state.targetCategories && state.targetCategories.length > 0
        ? `on ${state.targetCategories.join(", ")} products`
        : "across all catalog products"

    const minSpendStr =
      state.minOrderValue > 0
        ? ` when cart subtotal is at least ${symbol}${state.minOrderValue.toLocaleString()}`
        : ""

    const limitStr = state.maxRedemptions
      ? ` Limited to ${state.maxRedemptions} total uses`
      : " Unlimited total redemptions"

    const perCustomerStr = state.maxPerCustomer
      ? ` (${state.maxPerCustomer} per customer).`
      : "."

    const dateStr =
      state.hasEndDate && state.endDate
        ? ` Valid until ${new Date(state.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}.`
        : " No expiration date."

    return `Grants a ${discountStr} ${targetStr}${minSpendStr}.${limitStr}${perCustomerStr}${dateStr}`
  }, [state])

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700">
      <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
        <InformationCircle className="w-4 h-4 text-blue-600" />
        <span>Plain-English Rule Summary:</span>
      </div>
      <p className="leading-relaxed text-slate-600 italic">
        "{summarySentence}"
      </p>
    </div>
  )
}
