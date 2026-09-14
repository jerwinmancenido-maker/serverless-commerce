/**
 * @file    apps/backend/src/admin/components/inventory/inventory-create-drawer.tsx
 * @module  InventoryCreateDrawer (Inventory Module)
 * @purpose Modern Slide-Over Sheet Drawer for raw materials and warehouse compound inventory creation.
 * @contracts
 *   Drawer:  InventoryCreateDrawer
 *   API:     POST /admin/inventory-items · POST /admin/stock-locations
 */

import React, { useState, useEffect } from "react"
import {
  Drawer,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  Switch,
  Badge,
  toast,
} from "@medusajs/ui"
import {
  Component,
  Sparkles,
  ShieldCheck,
  BuildingStorefront,
  ArrowPath,
  XMark,
} from "@medusajs/icons"
import { useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

export type StorageCondition = "cryo_minus_20" | "refrigerated_2_8" | "controlled_room"

export interface InventoryDrawerFormState {
  title: string
  sku: string
  description: string
  requiresShipping: boolean
  width: number
  length: number
  height: number
  weight: number
  midCode: string
  hsCode: string
  countryOfOrigin: string
  material: string
  storageCondition: StorageCondition
  purityPercentage: number
  casNumber: string
  locationId: string
  stockedQuantity: number
}

const BLANK_STATE: InventoryDrawerFormState = {
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
  storageCondition: "cryo_minus_20",
  purityPercentage: 99.0,
  casNumber: "",
  locationId: "",
  stockedQuantity: 50,
}

const PRESETS = [
  {
    label: "BPC-157 Lyophilized Powder",
    state: {
      title: "BPC-157 Pure Lyophilized Acetate",
      sku: "RAW-BPC157-01",
      description: "Ultra-pure synthetic pentadecapeptide active raw powder for laboratory formulation.",
      requiresShipping: true,
      weight: 25,
      hsCode: "2937.19.00",
      material: "Lyophilized Powder",
      storageCondition: "cryo_minus_20" as StorageCondition,
      purityPercentage: 99.4,
      casNumber: "137525-51-0",
      stockedQuantity: 50,
    },
  },
  {
    label: "TB-500 Raw Acetate",
    state: {
      title: "TB-500 (Thymosin Beta-4) Raw Acetate",
      sku: "RAW-TB500-01",
      description: "Sterile grade synthetic regenerative peptide for B2B formulation.",
      requiresShipping: true,
      weight: 20,
      hsCode: "2937.19.00",
      material: "Lyophilized Powder",
      storageCondition: "cryo_minus_20" as StorageCondition,
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
    label: "Borosilicate 3ml Vials",
    state: {
      title: "Borosilicate USP Type-I 3ml Glass Vials",
      sku: "PKG-VIAL-3ML-CLR",
      description: "Sterilized amber/clear hydrolytic glass containers with butyl stoppers.",
      requiresShipping: true,
      weight: 15,
      hsCode: "7010.90.00",
      material: "Type I Borosilicate Glass",
      storageCondition: "controlled_room" as StorageCondition,
      purityPercentage: 100.0,
      casNumber: "65997-17-3",
      stockedQuantity: 500,
    },
  },
]

interface InventoryCreateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const InventoryCreateDrawer: React.FC<InventoryCreateDrawerProps> = ({
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient()
  const [formState, setFormState] = useState<InventoryDrawerFormState>(BLANK_STATE)
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch stock locations
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
        const fallback = [
          { id: "sloc_storage_vault", name: "Central Storage Vault (Makati HQ)" },
          { id: "sloc_storage", name: "Cold-Chain Depository (BGC)" },
        ]
        setLocations(fallback)
        setFormState((prev) => (prev.locationId ? prev : { ...prev, locationId: fallback[0].id }))
      })
  }, [])

  // Calculate yield potential
  const estimatedVials = React.useMemo(() => {
    if (!formState.weight || formState.weight <= 0) return 0
    return Math.floor((formState.weight * 1000) / 5 * 0.96)
  }, [formState.weight])

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setFormState((prev) => ({
      ...prev,
      ...preset.state,
    }))
    toast.info(`Applied preset: ${preset.label}`)
  }

  const resetToBlank = () => {
    setFormState({
      ...BLANK_STATE,
      locationId: locations[0]?.id || "",
    })
    toast.info("Form reset to clean blank state")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.title.trim()) {
      toast.error("Item title is required.")
      return
    }
    if (!formState.sku.trim()) {
      toast.error("Internal SKU is required.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        title: formState.title.trim(),
        sku: formState.sku.trim(),
        description: formState.description.trim(),
        requires_shipping: formState.requiresShipping,
        hs_code: formState.hsCode || undefined,
        mid_code: formState.midCode || undefined,
        material: formState.material || undefined,
        weight: Number(formState.weight) || undefined,
        length: Number(formState.length) || undefined,
        height: Number(formState.height) || undefined,
        width: Number(formState.width) || undefined,
        origin_country: formState.countryOfOrigin || undefined,
        metadata: {
          storage_condition: formState.storageCondition,
          purity_percentage: formState.purityPercentage,
          cas_number: formState.casNumber,
        },
      }

      // 1. Create item in Medusa
      const res: any = await sdk.admin.inventoryItem.create(payload)
      const newItemId = res?.inventory_item?.id

      // 2. If location and quantity specified, assign location level
      if (newItemId && formState.locationId && formState.stockedQuantity > 0) {
        try {
          await sdk.admin.inventoryItem.batchInventoryItemLocationLevels(newItemId, {
            create: [
              {
                location_id: formState.locationId,
                stocked_quantity: Number(formState.stockedQuantity),
              },
            ],
          })
        } catch (levelErr) {
          console.warn("Could not set initial stock location levels:", levelErr)
        }
      }

      toast.success("Inventory item created successfully!")
      // Invalidate inventory item lists in cache
      queryClient.invalidateQueries({ queryKey: ["inventory_items"] })

      // Reset and close
      resetToBlank()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Failed to create inventory item:", err)
      toast.error(err?.message || "Failed to create inventory item.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="max-w-2xl bg-white flex flex-col h-full border-l border-slate-200 shadow-2xl">
        {/* Drawer Header */}
        <Drawer.Header className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <Component className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Drawer.Title className="text-base font-bold text-slate-900">
                    New Raw Material Item
                  </Drawer.Title>
                  <Badge color="green" size="small" className="font-semibold text-[10px]">
                    Catalog Ready
                  </Badge>
                </div>
                <Drawer.Description className="text-xs text-slate-500 mt-0.5">
                  Register active powders, diluents, and laboratory supplies.
                </Drawer.Description>
              </div>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Presets:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-600 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={resetToBlank}
              className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition-colors cursor-pointer flex-shrink-0"
              title="Reset form to blank"
            >
              Clear
            </button>
          </div>
        </Drawer.Header>

        {/* Drawer Form Body */}
        <Drawer.Body className="px-6 py-5 overflow-y-auto flex-1 space-y-6">
          <form id="inventory-create-drawer-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Live Quality & Yield Banner Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-sm border border-slate-700">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Quality Standard & BOM Synthesis</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {formState.storageCondition === "cryo_minus_20"
                    ? "-20°C Deep Cryo"
                    : formState.storageCondition === "refrigerated_2_8"
                    ? "2°C–8°C Cold Chain"
                    : "Room Temp"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/60 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Purity & CAS:</span>
                  <span className="font-semibold text-white">
                    {formState.purityPercentage}% HPLC • {formState.casNumber || "N/A"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Estimated Synthesis:</span>
                  <span className="font-bold text-emerald-400">
                    {estimatedVials > 0 ? `~${estimatedVials.toLocaleString()} vials` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Identification */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Raw Material Identification
              </h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="item-title" className="text-xs font-semibold text-slate-700">
                    Item Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="item-title"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g. BPC-157 Pure Lyophilized Acetate"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="item-sku" className="text-xs font-semibold text-slate-700">
                      Internal SKU <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="item-sku"
                      value={formState.sku}
                      onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                      placeholder="e.g. RAW-BPC157-01"
                      className="mt-1 font-mono text-xs"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="item-material" className="text-xs font-semibold text-slate-700">
                      Material Form
                    </Label>
                    <Input
                      id="item-material"
                      value={formState.material}
                      onChange={(e) => setFormState({ ...formState, material: e.target.value })}
                      placeholder="e.g. Lyophilized Powder"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="item-desc" className="text-xs font-semibold text-slate-700">
                    Description & Compounding Notes
                  </Label>
                  <Textarea
                    id="item-desc"
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Physical appearance, solubility notes, and reconstitution instructions..."
                    rows={2}
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Requires Physical Fulfillment</span>
                    <span className="text-[11px] text-slate-400">Track in central storage vault and dispatch via courier</span>
                  </div>
                  <Switch
                    checked={formState.requiresShipping}
                    onCheckedChange={(val) => setFormState({ ...formState, requiresShipping: val })}
                  />
                </div>
              </div>
            </div>

            {/* 2. Storage & Chemical Standards */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Storage & Quality Standard
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Storage Temp</Label>
                  <Select
                    value={formState.storageCondition}
                    onValueChange={(val) =>
                      setFormState({ ...formState, storageCondition: val as StorageCondition })
                    }
                  >
                    <Select.Trigger className="mt-1 text-xs">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="cryo_minus_20">-20°C Deep Cryo</Select.Item>
                      <Select.Item value="refrigerated_2_8">2°C–8°C Cold Chain</Select.Item>
                      <Select.Item value="controlled_room">15°C–25°C Room Temp</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item-purity" className="text-xs font-semibold text-slate-700">
                    Purity Standard (%)
                  </Label>
                  <Input
                    id="item-purity"
                    type="number"
                    step="0.1"
                    min="50"
                    max="100"
                    value={formState.purityPercentage}
                    onChange={(e) =>
                      setFormState({ ...formState, purityPercentage: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="item-cas" className="text-xs font-semibold text-slate-700">
                    CAS Registry #
                  </Label>
                  <Input
                    id="item-cas"
                    value={formState.casNumber}
                    onChange={(e) => setFormState({ ...formState, casNumber: e.target.value })}
                    placeholder="e.g. 137525-51-0"
                    className="mt-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Physical Dimensions & Customs */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Physical & Customs Attributes
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label htmlFor="item-weight" className="text-[11px] font-semibold text-slate-700">
                    Weight (g)
                  </Label>
                  <Input
                    id="item-weight"
                    type="number"
                    min="0"
                    value={formState.weight}
                    onChange={(e) =>
                      setFormState({ ...formState, weight: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="item-length" className="text-[11px] font-semibold text-slate-700">
                    Length (cm)
                  </Label>
                  <Input
                    id="item-length"
                    type="number"
                    min="0"
                    value={formState.length}
                    onChange={(e) =>
                      setFormState({ ...formState, length: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="item-width" className="text-[11px] font-semibold text-slate-700">
                    Width (cm)
                  </Label>
                  <Input
                    id="item-width"
                    type="number"
                    min="0"
                    value={formState.width}
                    onChange={(e) =>
                      setFormState({ ...formState, width: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="item-height" className="text-[11px] font-semibold text-slate-700">
                    Height (cm)
                  </Label>
                  <Input
                    id="item-height"
                    type="number"
                    min="0"
                    value={formState.height}
                    onChange={(e) =>
                      setFormState({ ...formState, height: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label htmlFor="item-hscode" className="text-xs font-semibold text-slate-700">
                    Customs HS Code
                  </Label>
                  <Input
                    id="item-hscode"
                    value={formState.hsCode}
                    onChange={(e) => setFormState({ ...formState, hsCode: e.target.value })}
                    className="mt-1 text-xs font-mono"
                    placeholder="2937.19.00"
                  />
                </div>
                <div>
                  <Label htmlFor="item-origin" className="text-xs font-semibold text-slate-700">
                    Country of Origin
                  </Label>
                  <Input
                    id="item-origin"
                    value={formState.countryOfOrigin}
                    onChange={(e) => setFormState({ ...formState, countryOfOrigin: e.target.value })}
                    className="mt-1 text-xs"
                    placeholder="PH"
                  />
                </div>
              </div>
            </div>

            {/* 4. Stock Location Allocation */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                4. Initial Stock Allocation
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Stock Location</Label>
                  <Select
                    value={formState.locationId}
                    onValueChange={(val) => setFormState({ ...formState, locationId: val })}
                  >
                    <Select.Trigger className="mt-1 text-xs">
                      <Select.Value placeholder="Select facility..." />
                    </Select.Trigger>
                    <Select.Content>
                      {locations.map((loc) => (
                        <Select.Item key={loc.id} value={loc.id}>
                          {loc.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item-qty" className="text-xs font-semibold text-slate-700">
                    Initial Quantity
                  </Label>
                  <Input
                    id="item-qty"
                    type="number"
                    min="0"
                    value={formState.stockedQuantity}
                    onChange={(e) =>
                      setFormState({ ...formState, stockedQuantity: parseInt(e.target.value, 10) || 0 })
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </form>
        </Drawer.Body>

        {/* Drawer Footer Actions */}
        <Drawer.Footer className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            size="small"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="small"
            form="inventory-create-drawer-form"
            type="submit"
            isLoading={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
          >
            Create Inventory Item
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
