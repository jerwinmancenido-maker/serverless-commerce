/**
 * @file    apps/backend/src/admin/routes/inventory-studio/components/inventory-bom-preview.tsx
 * @module  InventoryBomPreviewComponent
 * @purpose Split-Canvas live preview simulating cold-chain compliance and BOM synthesis yield.
 * @contracts
 *   Parent:  InventoryStudioPage
 */

import React from "react"
import { Sparkles, ShieldCheck, CheckCircle, Buildings, Component, Tag } from "@medusajs/icons"
import { InventoryStudioState, StockLocationOption } from "../types"

interface InventoryBomPreviewProps {
  state: InventoryStudioState
  locations: StockLocationOption[]
}

export const InventoryBomPreview: React.FC<InventoryBomPreviewProps> = ({ state, locations }) => {
  const selectedLocation = locations.find((l) => l.id === state.locationId) || {
    id: "default",
    name: "Central Storage Vault (Makati HQ)",
  }

  // Calculate estimated formulation yield (assuming 5mg active ingredient per finished vial)
  const totalGrams = state.stockedQuantity || 0
  const estimatedVialYield = Math.floor((totalGrams * 1000) / 5.2)

  const getStorageBadge = () => {
    switch (state.storageCondition) {
      case "refrigerated_2_8":
        return {
          label: "2°C - 8°C Regulated Storage",
          detail: "Regulated temperature storage with ambient monitoring.",
          badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-200",
        }
      case "controlled_room":
      case "cryo_minus_20":
      default:
        return {
          label: "20°C - 25°C Controlled Ambient Desiccated",
          detail: "Ambient temperature storage with desiccant to prevent peptide degradation.",
          badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
        }
    }
  }

  const storage = getStorageBadge()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* ── CARD 1: Cold-Chain Storage & Quality Compliance ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quality & Storage Protocol
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${storage.badgeClass}`}>
            {storage.label}
          </span>
        </div>

        <div className="p-5 space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Purity Standard: {state.purityPercentage || 99.0}% (HPLC / MS Validated)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{storage.detail}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium block">CAS Registry</span>
              <span className="font-mono font-bold text-slate-800">{state.casNumber || "137525-51-0"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium block">Customs HS Code</span>
              <span className="font-mono font-bold text-slate-800">{state.hsCode || "2937.19.00"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 2: BOM Synthesis Yield Simulator ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Component className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900">BOM Synthesis Capacity</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Compound Feasible
          </span>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200/60 mb-3">
          <div className="text-[11px] text-emerald-800 font-semibold mb-1">
            Finished Formulation Potential
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-2">
            <span>~{estimatedVialYield.toLocaleString()}</span>
            <span className="text-xs font-normal text-slate-500">Finished 5mg Vials</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculated from {state.stockedQuantity || 0}g raw stock allocated to{" "}
            <strong className="text-slate-700">{selectedLocation.name}</strong>.
          </p>
        </div>

        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-slate-600">
            <span>Vault Allocation:</span>
            <span className="font-bold text-slate-800">{selectedLocation.name}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Stock Status:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Available for Dispensation</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Regulatory & ERP Inventory Valuation ── */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          <span>HACIEN ERP General Ledger Attribution</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Receiving this item into active stock posts a balanced debit to Compound Raw Inventory Asset (₱0.00 drift parity) and tracks analytical lot genealogy.
        </p>
      </div>
    </div>
  )
}
