/**
 * @file    apps/backend/src/admin/components/editor/bom-recipe-breakdown-card.tsx
 * @module  BomRecipeBreakdownCard
 * @purpose Visual Bill of Materials (BOM) kit inspector with stock capacity gauges, bottleneck alerts, and live multi-unit order deduction simulator.
 * @contracts
 *   Component: BomRecipeBreakdownCard
 *   Design:    Sovereign Admin Design System 2.0
 */

import React, { useState } from "react"
import { Badge, Button } from "@medusajs/ui"
import {
  ExclamationCircle,
  InformationCircle,
  Sparkles,
} from "@medusajs/icons"

import {
  type ComponentRole,
  detectComponentRole,
} from "../../routes/compounded-products/[id]/kit-template-matcher"

export { type ComponentRole, detectComponentRole }

export interface BomComponentItemInfo {
  inventoryItemId: string
  title: string
  sku?: string | null
  role: ComponentRole
  requiredAmount: number
  displayUnit: string
  stockedQty: number
  reservedQty: number
  availableQty: number
  capacity: number
  isLimiting: boolean
  unitCost?: number
}

export interface BomRecipeBreakdownCardProps {
  variantTitle: string
  variantPrice?: number
  currencyCode?: string
  components: BomComponentItemInfo[]
  onQuickRestock?: (inventoryItemId: string) => void
}

const ROLE_METADATA: Record<
  ComponentRole,
  { label: string; color: "purple" | "blue" | "green" | "grey" | "orange" }
> = {
  finished_product: { label: "Active Compound Vial", color: "purple" },
  diluent: { label: "Diluent / BAC Water", color: "blue" },
  syringe: { label: "LDS Syringe Supply", color: "orange" },
  sanitization: { label: "Alcohol Prep Swabs", color: "green" },
  packaging: { label: "Protective Mailer", color: "grey" },
  other: { label: "General Component", color: "grey" },
}



export const BomRecipeBreakdownCard: React.FC<BomRecipeBreakdownCardProps> = ({
  variantTitle,
  variantPrice,
  currencyCode = "PHP",
  components = [],
  onQuickRestock,
}) => {
  const [simulatedOrderQty, setSimulatedOrderQty] = useState<number>(1)

  // Overall variant capacity is the minimum of component capacities
  const limitingComponent = components.find((c) => c.isLimiting)
  const totalSellableCapacity =
    components.length > 0
      ? Math.min(...components.map((c) => (c.capacity >= 0 ? c.capacity : 0)))
      : 0

  // Total BOM COGS
  const totalBomCost = components.reduce(
    (sum, c) => sum + (c.unitCost || 0) * (c.requiredAmount || 1),
    0
  )

  // Gross Margin calculations
  const grossProfit =
    variantPrice !== undefined ? variantPrice - totalBomCost : null
  const grossMarginPercent =
    variantPrice && variantPrice > 0
      ? (grossProfit! / variantPrice) * 100
      : null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-4 text-xs">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/70 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-sm">
              Bill of Materials Architecture
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-800 font-mono">
              {components.length} {components.length === 1 ? "part" : "parts"}
            </span>
            {totalSellableCapacity > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                {totalSellableCapacity} Kits Buildable
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 font-mono">
                Out of Stock (0 Kits)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Physical stock components consumed when fulfilling {variantTitle}.
          </p>
        </div>

        {/* Financial Unit Economics Indicator */}
        {variantPrice !== undefined && variantPrice > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-medium">
                Est. COGS:{" "}
                <span className="text-slate-700 font-mono font-bold">
                  {formatCurrency(totalBomCost)}
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-900">
                Price: {formatCurrency(variantPrice)}
              </div>
            </div>
            {grossMarginPercent !== null && (
              <div className="border-l border-slate-200 pl-2">
                <span
                  className={`px-2 py-1 rounded text-[11px] font-bold font-mono ${
                    grossMarginPercent >= 65
                      ? "bg-emerald-100 text-emerald-800"
                      : grossMarginPercent >= 35
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                  title={
                    grossMarginPercent < 35
                      ? "Warning: Gross margin is below the 35% commercial floor"
                      : "Complies with sovereign commercial margin floor"
                  }
                >
                  {grossMarginPercent.toFixed(1)}% Margin
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Limiting Bottleneck Alert if capacity is constrained */}
      {limitingComponent && (
        <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900">
          <div className="flex items-start gap-2">
            <ExclamationCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[11px]">Limiting Bottleneck:</span>{" "}
              <span className="font-semibold">{limitingComponent.title}</span>{" "}
              restricts sellable kit capacity to{" "}
              <span className="font-bold underline">
                {limitingComponent.capacity} units
              </span>{" "}
              ({limitingComponent.availableQty} available in stock).
            </div>
          </div>
          {onQuickRestock && (
            <Button
              type="button"
              size="small"
              variant="secondary"
              className="h-6 text-[10px] px-2 bg-white text-slate-800 border border-amber-300 hover:bg-amber-50 shrink-0"
              onClick={() => onQuickRestock(limitingComponent.inventoryItemId)}
            >
              Restock Item
            </Button>
          )}
        </div>
      )}

      {/* Component Inventory Grid */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
          <Sparkles className="size-3 text-purple-600" />
          Component Stock &amp; Recipe Ratios
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {components.map((comp) => {
            const roleMeta = ROLE_METADATA[comp.role] || ROLE_METADATA.other
            return (
              <div
                key={comp.inventoryItemId}
                className={`p-3 rounded-lg border bg-white shadow-2xs flex flex-col justify-between transition-colors ${
                  comp.isLimiting
                    ? "border-amber-400 ring-1 ring-amber-300"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900 text-xs line-clamp-1">
                      {comp.title}
                    </span>
                    <Badge color={roleMeta.color} size="small" className="shrink-0 text-[9px]">
                      {roleMeta.label}
                    </Badge>
                  </div>

                  {comp.sku && (
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      SKU: {comp.sku}
                    </div>
                  )}

                  {/* Stock Metrics Row */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Per Kit
                      </span>
                      <span className="font-bold text-slate-800 font-mono">
                        {comp.requiredAmount} {comp.displayUnit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Available
                      </span>
                      <span className="font-bold text-slate-800 font-mono">
                        {comp.availableQty}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Max Yield
                      </span>
                      <span
                        className={`font-bold font-mono ${
                          comp.isLimiting ? "text-amber-600" : "text-slate-900"
                        }`}
                      >
                        {comp.capacity} kits
                      </span>
                    </div>
                  </div>
                </div>

                {comp.isLimiting && (
                  <div className="mt-2 pt-1.5 border-t border-amber-100 text-[10px] font-bold text-amber-700 flex items-center justify-between">
                    <span>Critical Bottleneck</span>
                    <span>Yield Limit: {comp.capacity}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Live Order Deduction Simulator */}
      <div className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <InformationCircle className="size-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              Order Fulfillment Deduction Simulator
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Order Quantity:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 5, 10].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setSimulatedOrderQty(qty)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded font-medium transition-colors ${
                    simulatedOrderQty === qty
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {qty}x
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px]">
                <th className="py-1">Item Title</th>
                <th className="py-1 text-right">Deducted ({simulatedOrderQty}x)</th>
                <th className="py-1 text-right">Remaining Stock</th>
                <th className="py-1 text-right">Remaining Kits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-mono">
              {components.map((comp) => {
                const totalDeducted = comp.requiredAmount * simulatedOrderQty
                const remainingStock = comp.availableQty - totalDeducted
                const remainingKits = Math.max(
                  0,
                  Math.floor(remainingStock / (comp.requiredAmount || 1))
                )
                const isInsufficient = remainingStock < 0

                return (
                  <tr key={comp.inventoryItemId} className="hover:bg-slate-50/50">
                    <td className="py-1.5 font-sans font-medium text-slate-800">
                      {comp.title}
                    </td>
                    <td className="py-1.5 text-right text-rose-600 font-bold">
                      -{totalDeducted} {comp.displayUnit}
                    </td>
                    <td
                      className={`py-1.5 text-right font-bold ${
                        isInsufficient ? "text-rose-600" : "text-slate-700"
                      }`}
                    >
                      {remainingStock >= 0 ? remainingStock : `${remainingStock} (Deficit)`}
                    </td>
                    <td className="py-1.5 text-right text-slate-600">
                      {isInsufficient ? (
                        <span className="text-rose-600 font-bold">0 (Depleted)</span>
                      ) : (
                        <span>{remainingKits} kits</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BomRecipeBreakdownCard
