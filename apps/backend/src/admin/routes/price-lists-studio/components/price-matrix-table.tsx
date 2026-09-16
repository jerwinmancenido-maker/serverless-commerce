/**
 * @file    apps/backend/src/admin/routes/price-lists-studio/components/price-matrix-table.tsx
 * @module  PriceMatrixTableComponent
 * @purpose Interactive price override matrix with real-time margin calculations and 35% floor protection.
 * @contracts
 *   Parent:  PriceListsStudioPage
 */

import React, { useState } from "react"
import { Trash, Sparkles, ExclamationCircle, CheckCircle } from "@medusajs/icons"
import { PriceOverrideItem } from "../types"

interface PriceMatrixTableProps {
  prices: PriceOverrideItem[]
  onUpdatePrice: (variantId: string, customPrice: number) => void
  onUpdateDiscount?: (variantId: string, percentage: number) => void
  onSwitchVariant?: (oldVariantId: string, newVariantId: string) => void
  availableProducts?: any[]
  onRemoveItem: (variantId: string) => void
  onBulkDiscount: (percentage: number) => void
  onResetAll: () => void
  onOpenProductPicker: () => void
}

export const PriceMatrixTable: React.FC<PriceMatrixTableProps> = ({
  prices,
  onUpdatePrice,
  onUpdateDiscount,
  onSwitchVariant,
  availableProducts = [],
  onRemoveItem,
  onBulkDiscount,
  onResetAll,
  onOpenProductPicker,
}) => {
  const [searchFilter, setSearchFilter] = useState("")

  const filteredPrices = prices.filter((item) => {
    const q = searchFilter.toLowerCase()
    return (
      item.productTitle.toLowerCase().includes(q) ||
      item.variantTitle.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q)
    )
  })

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Product & Variant Price Matrix</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
              {prices.length} Variants Selected
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure custom rates in Philippine Pesos (₱). Gross margins update dynamically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Bulk Discount Presets */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-400 font-medium px-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Bulk:</span>
            </span>
            <button
              type="button"
              onClick={() => onBulkDiscount(10)}
              className="px-2 py-1 rounded font-semibold text-slate-700 hover:bg-white hover:shadow-xs transition-all"
            >
              -10%
            </button>
            <button
              type="button"
              onClick={() => onBulkDiscount(20)}
              className="px-2 py-1 rounded font-semibold text-slate-700 hover:bg-white hover:shadow-xs transition-all"
            >
              -20%
            </button>
            <button
              type="button"
              onClick={() => onBulkDiscount(25)}
              className="px-2 py-1 rounded font-semibold text-blue-700 bg-blue-50 hover:bg-white hover:shadow-xs transition-all"
            >
              -25% (VIP)
            </button>
            <button
              type="button"
              onClick={onResetAll}
              className="px-2 py-1 rounded font-medium text-slate-500 hover:text-slate-800 transition-all"
            >
              Reset
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenProductPicker}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>+ Add Products</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {prices.length > 3 && (
        <div className="p-3 border-b border-slate-100 bg-white">
          <input
            type="text"
            placeholder="Search selected products by name or SKU..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Table Content */}
      {prices.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Products Added Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Select products and variants to override prices for this sale or B2B tier.
          </p>
          <button
            type="button"
            onClick={onOpenProductPicker}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            + Choose Products from Catalog
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Compound / SKU</th>
                <th className="py-3 px-4">
                  <span>Standard Retail</span>
                  <span className="ml-1.5 text-[9px] font-semibold text-slate-400 lowercase">(catalog)</span>
                </th>
                <th className="py-3 px-4">
                  <span>New Override Price (₱)</span>
                  <span className="ml-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    Editable
                  </span>
                </th>
                <th className="py-3 px-4">
                  <span>Discount</span>
                  <span className="ml-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    Editable %
                  </span>
                </th>
                <th className="py-3 px-4">Gross Margin</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrices.map((item) => {
                const discountAmount = item.defaultPrice - item.customPrice
                const discountPct = item.defaultPrice > 0 ? (discountAmount / item.defaultPrice) * 100 : 0
                const grossProfit = item.customPrice - item.estimatedCost
                const grossMarginPct = item.customPrice > 0 ? (grossProfit / item.customPrice) * 100 : 0
                const isMarginProtected = grossMarginPct >= 35

                const parentProduct = availableProducts.find((p) => p.id === item.productId)
                const otherVariants = parentProduct?.variants || []

                return (
                  <tr key={item.variantId} className="hover:bg-slate-50/50 transition-colors">
                    {/* Compound Name & Variant Switcher */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.productTitle}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                        {otherVariants.length > 1 && onSwitchVariant ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-[10px]">Variant:</span>
                            <select
                              value={item.variantId}
                              onChange={(e) => onSwitchVariant(item.variantId, e.target.value)}
                              className="text-[11px] font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
                              title="Switch variant for this compound"
                            >
                              {otherVariants.map((v: any) => (
                                <option key={v.id} value={v.id}>
                                  {v.title} {v.sku ? `(${v.sku})` : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="font-medium text-slate-600">{item.variantTitle}</span>
                        )}
                        {item.sku && <span className="text-slate-400">• SKU: {item.sku}</span>}
                      </div>
                    </td>

                    {/* Standard Retail */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">
                      ₱{item.defaultPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>

                    {/* New Custom Price Input (Editable) */}
                    <td className="py-3 px-4">
                      <div className="relative w-36 group">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none group-focus-within:text-blue-600">
                          ₱
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={item.customPrice || ""}
                          placeholder="0.00"
                          onChange={(e) => onUpdatePrice(item.variantId, parseFloat(e.target.value) || 0)}
                          className={`w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                            isMarginProtected
                              ? "border-slate-300 bg-white hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900 shadow-2xs"
                              : "border-red-300 bg-red-50/40 text-red-900 hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 shadow-2xs"
                          }`}
                          title="Direct override price in Philippine Pesos"
                        />
                      </div>
                    </td>

                    {/* Discount % Input (Editable) */}
                    <td className="py-3 px-4">
                      <div className="relative w-28 group">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none group-focus-within:text-amber-600">
                          -
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          step="0.5"
                          placeholder="0"
                          value={discountPct > 0 ? Number(discountPct.toFixed(1)) : ""}
                          onChange={(e) => {
                            const val = Math.min(99, Math.max(0, parseFloat(e.target.value) || 0))
                            if (onUpdateDiscount) {
                              onUpdateDiscount(item.variantId, val)
                            } else {
                              const factor = (100 - val) / 100
                              onUpdatePrice(item.variantId, Math.round(item.defaultPrice * factor))
                            }
                          }}
                          className="w-full pl-5 pr-5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-slate-900 shadow-2xs transition-all"
                          title="Direct discount percentage (auto-calculates custom price)"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                          %
                        </span>
                      </div>
                    </td>

                    {/* Gross Margin % */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {isMarginProtected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{grossMarginPct.toFixed(1)}%</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <ExclamationCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>{grossMarginPct.toFixed(1)}% (Floor Alert)</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.variantId)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                        title="Remove Variant from Price List"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
