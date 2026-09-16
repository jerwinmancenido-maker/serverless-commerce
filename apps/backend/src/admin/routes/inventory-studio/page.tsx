/**
 * @file    apps/backend/src/admin/routes/inventory-studio/page.tsx
 * @module  InventoryStudioPage
 * @purpose Modern Split-Canvas Studio route for raw materials and inventory creation with BOM readiness preview.
 * @contracts
 *   Route:   /app/inventory-studio
 *   API:     POST /admin/inventory-items
 */

import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Clock,
  Buildings,
  Tag,
  Component,
  ShieldCheck,
} from "@medusajs/icons"
import { toast } from "@medusajs/ui"

import { InventoryStudioState, StockLocationOption, StorageCondition } from "./types"
import { InventoryBomPreview } from "./components/inventory-bom-preview"
import { sdk } from "../../lib/sdk"

const DRAFT_STORAGE_KEY = "hacien_inventory_studio_draft_v1"

const DEFAULT_STATE: InventoryStudioState = {
  title: "",
  sku: "",
  description: "",
  requiresShipping: true,
  width: 10,
  length: 10,
  height: 15,
  weight: 25,
  midCode: "",
  hsCode: "2937.19.00",
  countryOfOrigin: "PH",
  material: "Lyophilized Peptide Powder",
  storageCondition: "controlled_room",
  purityPercentage: 99.0,
  casNumber: "",
  locationId: "",
  stockedQuantity: 50,
}

const PRESETS = [
  {
    label: "Peptide Active Powder (BPC-157)",
    state: {
      title: "BPC-157 Pure Lyophilized Acetate",
      sku: "RAW-BPC157-01",
      description: "Ultra-pure synthetic pentadecapeptide active raw powder for sterile compounding.",
      requiresShipping: true,
      weight: 25,
      hsCode: "2937.19.00",
      material: "Lyophilized Powder",
      storageCondition: "controlled_room" as StorageCondition,
      purityPercentage: 99.4,
      casNumber: "137525-51-0",
      stockedQuantity: 50,
    },
  },
  {
    label: "Thymosin Beta-4 / TB-500 Powder",
    state: {
      title: "TB-500 (Thymosin Beta-4) Raw Acetate",
      sku: "RAW-TB500-01",
      description: "Sterile grade synthetic regenerative peptide for B2B formulation.",
      requiresShipping: true,
      weight: 20,
      hsCode: "2937.19.00",
      material: "Lyophilized Powder",
      storageCondition: "controlled_room" as StorageCondition,
      purityPercentage: 99.2,
      casNumber: "77591-33-4",
      stockedQuantity: 40,
    },
  },
  {
    label: "Sterile Diluent (BAC Water)",
    state: {
      title: "Bacteriostatic Water 0.9% Benzyl Alcohol",
      sku: "DIL-BAC-30ML",
      description: "Multi-dose sterile reconstitution vehicle for peptide research vials.",
      requiresShipping: true,
      weight: 120,
      hsCode: "3004.90.00",
      material: "USP Grade Sterile Solution",
      storageCondition: "controlled_room" as StorageCondition,
      purityPercentage: 99.9,
      casNumber: "100-51-6",
      stockedQuantity: 200,
    },
  },
  {
    label: "Borosilicate 3ml Sterile Vials",
    state: {
      title: "Type 1 Borosilicate Vials (3ml)",
      sku: "PKG-VIAL-3ML",
      description: "Depyrogenated sterile glass vials for lyophilized compound containment.",
      requiresShipping: true,
      weight: 15,
      hsCode: "7010.90.00",
      material: "Type 1 Neutral Glass",
      storageCondition: "controlled_room" as StorageCondition,
      purityPercentage: 100.0,
      casNumber: "65997-17-3",
      stockedQuantity: 500,
    },
  },
]

export const InventoryStudioPage: React.FC = () => {
  const navigate = useNavigate()
  const [formState, setFormState] = useState<InventoryStudioState>(DEFAULT_STATE)
  const [locations, setLocations] = useState<StockLocationOption[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)

  // 1. Fetch available stock locations
  useEffect(() => {
    sdk.admin.stockLocation
      .list({ limit: 20 })
      .then((res: any) => {
        if (res.stock_locations && res.stock_locations.length > 0) {
          const locs = res.stock_locations.map((l: any) => ({
            id: l.id,
            name: l.name,
          }))
          setLocations(locs)
          setFormState((prev) => (prev.locationId ? prev : { ...prev, locationId: locs[0].id }))
        }
      })
      .catch(() => {
        setLocations([])
      })
  }, [])

  // 2. Draft Storage (Clean session by default)
  useEffect(() => {
    // Keep form state clean and blank by default; presets are available on demand
  }, [])

  useEffect(() => {
    if (formState) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formState))
          setLastSaved(new Date())
        } catch (e) {
          console.error("Draft autosave error:", e)
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [formState])

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    setFormState((prev) => ({
      ...prev,
      ...preset.state,
    }))
    toast.success(`Loaded preset: ${preset.label}`)
  }

  // 3. Submit to Medusa
  const handleSubmit = async (publish: boolean) => {
    if (!formState.title.trim()) {
      toast.error("Please provide a title for the inventory item.")
      return
    }

    if (!formState.sku.trim()) {
      toast.error("Please provide an internal SKU.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        title: formState.title,
        sku: formState.sku,
        description: formState.description,
        requires_shipping: formState.requiresShipping,
        hs_code: formState.hsCode,
        mid_code: formState.midCode,
        material: formState.material,
        weight: formState.weight,
        length: formState.length,
        height: formState.height,
        width: formState.width,
        origin_country: formState.countryOfOrigin,
      }

      // Create item in Medusa
      const res: any = await sdk.admin.inventoryItem.create(payload)
      const newItemId = res?.inventory_item?.id

      // If location and quantity specified, assign location level
      if (newItemId && formState.locationId && formState.stockedQuantity > 0) {
        try {
          await sdk.admin.inventoryItem.batchInventoryItemLocationLevels(newItemId, {
            create: [
              {
                location_id: formState.locationId,
                stocked_quantity: formState.stockedQuantity,
              },
            ],
          })
        } catch (levelErr) {
          console.warn("Could not batch set location levels:", levelErr)
        }
      }

      toast.success(publish ? "Inventory item published successfully!" : "Inventory draft saved!")
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      navigate("/inventory-registry")
    } catch (err: any) {
      console.error("Failed to save inventory item:", err)
      toast.error(err?.message || "Failed to submit inventory item.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24">
      {/* ── STICKY TOP STUDIO BAR ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-3 sm:px-6 py-3">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/inventory-registry")}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              title="Back to Inventory Registry"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Warehouse Inventory Operations
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Inventory Studio
                </span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{formState.title || "New Raw Material Inventory Item"}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 hidden sm:flex">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {lastSaved ? `Autosaved ${lastSaved.toLocaleTimeString()}` : "Ready to save"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/inventory-registry")}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>{isSubmitting ? "Saving..." : "Publish Inventory Item"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Restored Draft Alert Banner */}
      {draftRestored && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 text-xs text-blue-900 flex items-center justify-between">
          <div className="w-full flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Restored unpublished draft from your local session.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(DRAFT_STORAGE_KEY)
                setFormState(DEFAULT_STATE)
                setDraftRestored(false)
                toast.info("Draft cleared.")
              }}
              className="text-blue-700 hover:text-blue-900 underline font-semibold text-[11px]"
            >
              Clear Draft
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN MAXIMIZED WORKSPACE ── */}
      <main className="w-full px-1 sm:px-6 py-4 sm:py-6 flex flex-col gap-6">
        {/* ── PRIMARY CANVAS: Configuration Form ── */}
        <section className="w-full space-y-6">
          {/* Presets Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Compound Inventory Presets</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer text-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card 1: Identity & Specifications */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Raw Material Identification
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. BPC-157 Pure Lyophilized Acetate"
                  value={formState.title}
                  onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal SKU</label>
                <input
                  type="text"
                  placeholder="e.g. RAW-BPC157-01"
                  value={formState.sku}
                  onChange={(e) => setFormState((prev) => ({ ...prev, sku: e.target.value }))}
                  className="w-full text-sm font-mono font-bold px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Certificate of Analysis notes, synthesis lot, supplier origin..."
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">Requires Physical Fulfillment</span>
                <p className="text-[11px] text-slate-500">Enable if item is managed in physical warehouse.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.requiresShipping}
                  onChange={(e) => setFormState((prev) => ({ ...prev, requiresShipping: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Card 2: Environmental Storage & Quality Specifications */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Chemical & Environmental Storage Standard
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Condition</label>
                <select
                  value={formState.storageCondition}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      storageCondition: e.target.value as StorageCondition,
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="controlled_room">20°C - 25°C Controlled Ambient (Desiccated)</option>
                  <option value="refrigerated_2_8">2°C - 8°C Refrigerator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purity Standard (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="90"
                  max="100"
                  value={formState.purityPercentage}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, purityPercentage: parseFloat(e.target.value) || 99.0 }))
                  }
                  className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CAS Registry Number</label>
                <input
                  type="text"
                  placeholder="e.g. 137525-51-0"
                  value={formState.casNumber}
                  onChange={(e) => setFormState((prev) => ({ ...prev, casNumber: e.target.value }))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Logistics, Dimensions & Customs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Customs & Physical Attributes
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (g)</label>
                <input
                  type="number"
                  value={formState.weight || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Width (cm)</label>
                <input
                  type="number"
                  value={formState.width || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Length (cm)</label>
                <input
                  type="number"
                  value={formState.length || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formState.height || ""}
                  onChange={(e) => setFormState((prev) => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HS Code (Customs)</label>
                <input
                  type="text"
                  placeholder="2937.19.00"
                  value={formState.hsCode}
                  onChange={(e) => setFormState((prev) => ({ ...prev, hsCode: e.target.value }))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Origin Country</label>
                <input
                  type="text"
                  placeholder="PH or US"
                  value={formState.countryOfOrigin}
                  onChange={(e) => setFormState((prev) => ({ ...prev, countryOfOrigin: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Material Composition</label>
                <input
                  type="text"
                  placeholder="e.g. Lyophilized Powder"
                  value={formState.material}
                  onChange={(e) => setFormState((prev) => ({ ...prev, material: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Location Allocation & Initial Batch */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              4. Storage Location & Stock Level
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Location</label>
                <select
                  value={formState.locationId}
                  onChange={(e) => setFormState((prev) => ({ ...prev, locationId: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock Level (g / units)</label>
                <input
                  type="number"
                  min="0"
                  value={formState.stockedQuantity}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, stockedQuantity: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── HORIZONTAL DOCK: Live BOM Readiness & Storage Simulation ── */}
        <section className="w-full mt-6" aria-label="BOM Readiness & Storage Simulation">
          <InventoryBomPreview state={formState} locations={locations} />
        </section>
      </main>
    </div>
  )
}

export default InventoryStudioPage
