/**
 * @file    apps/backend/src/admin/routes/promotions-studio/components/cart-simulator.tsx
 * @module  CartSimulator
 * @purpose Real-time cart math sandbox with >= 35% gross margin protection guardrail.
 * @contracts
 *   Studio:  CartSimulatorProps · CartSimulationResult
 */

import React, { useMemo, useState } from "react"
import { ShoppingCart, InformationCircle } from "@medusajs/icons"
import { PromotionStudioState, CartSimulatorItem, CartSimulationResult } from "../types"

const DEFAULT_SAMPLE_ITEMS: CartSimulatorItem[] = [
  {
    id: "item_1",
    name: "BPC-157 (5mg) Injectable Compound",
    category: "peptides",
    unitPrice: 3200,
    quantity: 2,
    baseCost: 1100, // production + compounding lab cost per unit
  },
  {
    id: "item_2",
    name: "Bacteriostatic Water (30ml Sterile)",
    category: "solutions",
    unitPrice: 850,
    quantity: 1,
    baseCost: 250,
  },
  {
    id: "item_3",
    name: "Precision Micro-Syringe Kit (10-pack)",
    category: "supplies",
    unitPrice: 550,
    quantity: 1,
    baseCost: 150,
  },
]

interface CartSimulatorProps {
  state: PromotionStudioState
}

export const CartSimulator: React.FC<CartSimulatorProps> = ({ state }) => {
  const [sampleSubtotalOverride, setSampleSubtotalOverride] = useState<number | null>(null)

  const simulation: CartSimulationResult = useMemo(() => {
    const rawSubtotal = DEFAULT_SAMPLE_ITEMS.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    )
    const rawCost = DEFAULT_SAMPLE_ITEMS.reduce(
      (sum, item) => sum + item.baseCost * item.quantity,
      0
    )

    const subtotal = sampleSubtotalOverride !== null ? sampleSubtotalOverride : rawSubtotal
    const costRatio = rawCost / rawSubtotal
    const totalCost = subtotal * costRatio

    // Qualification check: minimum order subtotal
    if (state.minOrderValue > 0 && subtotal < state.minOrderValue) {
      return {
        subtotal,
        discountAmount: 0,
        netTotal: subtotal,
        totalCost,
        grossMarginPct: subtotal > 0 ? ((subtotal - totalCost) / subtotal) * 100 : 0,
        isMarginSafe: true,
      }
    }

    let discountAmount = 0
    if (state.type === "percentage") {
      const pct = Math.min(Math.max(state.value || 0, 0), 100)
      discountAmount = Math.round((subtotal * pct) / 100)
    } else if (state.type === "fixed") {
      discountAmount = Math.min(state.value || 0, subtotal)
    }

    const netTotal = Math.max(subtotal - discountAmount, 0)
    const grossProfit = netTotal - totalCost
    const grossMarginPct = netTotal > 0 ? (grossProfit / netTotal) * 100 : 0
    const isMarginSafe = grossMarginPct >= 35.0

    return {
      subtotal,
      discountAmount,
      netTotal,
      totalCost,
      grossMarginPct: Math.round(grossMarginPct * 10) / 10,
      isMarginSafe,
    }
  }, [state, sampleSubtotalOverride])

  const currencySymbol = state.currencyCode === "USD" ? "$" : "₱"

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <ShoppingCart className="w-4 h-4 text-slate-500" />
          <span>Real-Time Cart Simulator</span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          Sample Order
        </span>
      </div>

      {/* Cart line items */}
      <div className="space-y-2 mb-4 text-xs text-slate-600">
        {DEFAULT_SAMPLE_ITEMS.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-1">
            <span className="truncate pr-2 font-medium text-slate-700">
              {item.quantity}x {item.name}
            </span>
            <span className="font-mono text-slate-900 flex-shrink-0">
              {currencySymbol}{(item.unitPrice * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Math breakdown */}
      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-500">
          <span>Order Subtotal:</span>
          <span className="font-mono text-slate-900 font-medium">
            {currencySymbol}{simulation.subtotal.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-emerald-600 font-medium">
          <span>Computed Discount:</span>
          <span className="font-mono">
            -{currencySymbol}{simulation.discountAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900 font-bold text-sm">
          <span>Customer Net Total:</span>
          <span className="font-mono text-base text-blue-600">
            {currencySymbol}{simulation.netTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Margin Floor Lock Indicator */}
      <div
        className={`mt-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${
          simulation.isMarginSafe
            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
            : "bg-rose-50/90 border-rose-300 text-rose-950"
        }`}
      >
        <InformationCircle
          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
            simulation.isMarginSafe ? "text-emerald-600" : "text-rose-600"
          }`}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between font-semibold">
            <span>
              {simulation.isMarginSafe ? "Margin Floor Safe" : "Margin Floor Warning"}
            </span>
            <span className="font-mono font-bold">
              {simulation.grossMarginPct}% Net Margin
            </span>
          </div>
          <p className="text-[11px] mt-0.5 opacity-90 leading-tight">
            {simulation.isMarginSafe
              ? "Discount satisfies the Sovereign 35% gross profit margin floor requirement."
              : "Warning: Net margin drops below 35% commercial floor. High risk of negative unit economics."}
          </p>
        </div>
      </div>
    </div>
  )
}
