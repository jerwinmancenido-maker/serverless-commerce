/**
 * @file    apps/backend/src/admin/components/inventory/inventory-adjust-drawer.tsx
 * @module  InventoryAdjustDrawer (SADS 2.0)
 * @purpose Modern slide-over drawer to adjust on-hand inventory levels for physical raw materials and compounds.
 * @contracts
 *   API:     POST /admin/inventory-items/:id/location-levels/:location_id
 *   Service: InventoryModuleService
 */

import React, { useState, useEffect, useMemo, FormEvent } from "react"
import {
  ArchiveBox,
  CheckCircle,
  Component,
  ExclamationCircle,
  InformationCircle,
  Plus,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk"

export type AdjustInventoryItemTarget = {
  id: string
  title: string | null
  sku: string | null
  description?: string | null
  location_levels?: Array<{
    id: string
    stocked_quantity: number
    reserved_quantity: number
    available_quantity: number
    location_id: string
  }>
}

type InventoryAdjustDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: AdjustInventoryItemTarget | null
  locations?: Array<{ id: string; name: string }>
  onSuccess?: () => void
}

export const InventoryAdjustDrawer: React.FC<InventoryAdjustDrawerProps> = ({
  open,
  onOpenChange,
  item,
  locations = [],
  onSuccess,
}) => {
  const queryClient = useQueryClient()
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")
  const [mode, setMode] = useState<"set" | "add" | "deduct">("set")
  const [quantityInput, setQuantityInput] = useState<string>("0")
  const [reason, setReason] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Determine current active location and level
  const activeLocationId = selectedLocationId || locations[0]?.id || item?.location_levels?.[0]?.location_id || ""
  const selectedLocation = locations.find((l) => l.id === activeLocationId)

  const currentLevel = useMemo(() => {
    if (!item?.location_levels) return null
    return item.location_levels.find((lvl) => lvl.location_id === activeLocationId) || item.location_levels[0] || null
  }, [item?.location_levels, activeLocationId])

  const currentStocked = currentLevel?.stocked_quantity ?? 0
  const reservedStock = currentLevel?.reserved_quantity ?? 0
  const currentAvailable = currentLevel?.available_quantity ?? Math.max(0, currentStocked - reservedStock)

  // Reset inputs when opened for an item
  useEffect(() => {
    if (open && item) {
      const locId = item.location_levels?.[0]?.location_id || locations[0]?.id || ""
      setSelectedLocationId(locId)
      const existingStock = item.location_levels?.find((l) => l.location_id === locId)?.stocked_quantity ?? item.location_levels?.[0]?.stocked_quantity ?? 0
      setQuantityInput(String(existingStock))
      setMode("set")
      setReason("")
    }
  }, [open, item, locations])

  if (!item) return null

  const parsedQty = Math.max(0, parseInt(quantityInput, 10) || 0)

  let projectedStocked = currentStocked
  if (mode === "set") {
    projectedStocked = parsedQty
  } else if (mode === "add") {
    projectedStocked = currentStocked + parsedQty
  } else if (mode === "deduct") {
    projectedStocked = Math.max(0, currentStocked - parsedQty)
  }

  const projectedAvailable = Math.max(0, projectedStocked - reservedStock)
  const diff = projectedStocked - currentStocked

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!activeLocationId) {
      toast.error("Please select an active warehouse location")
      return
    }

    if (projectedStocked < reservedStock) {
      toast.error(
        `Cannot reduce stock below active reservations (${reservedStock} units currently reserved).`,
      )
      return
    }

    setIsSubmitting(true)
    try {
      try {
        await sdk.admin.inventoryItem.updateLevel(item.id, activeLocationId, {
          stocked_quantity: projectedStocked,
        })
      } catch {
        await sdk.admin.inventoryItem.batchInventoryItemLocationLevels(item.id, {
          create: [
            {
              location_id: activeLocationId,
              stocked_quantity: projectedStocked,
            },
          ],
        })
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory-items"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-items-operations"] }),
        queryClient.invalidateQueries({ queryKey: ["buildable-products"] }),
        queryClient.invalidateQueries({ queryKey: ["bom-location-availability"] }),
      ])

      toast.success(`Inventory updated: ${item.title || "Item"} set to ${projectedStocked} units`)
      if (onSuccess) onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update inventory level"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="w-full sm:max-w-[540px] h-dvh sm:h-full flex flex-col justify-between">
        <form className="flex h-full flex-col justify-between" onSubmit={handleSubmit}>
          {/* Header */}
          <Drawer.Header className="border-b border-slate-200/80 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <ArchiveBox className="size-4" />
                </div>
                <Drawer.Title asChild>
                  <Heading level="h2" className="text-base font-bold text-slate-900">
                    Adjust Inventory Level
                  </Heading>
                </Drawer.Title>
              </div>
              <Badge color="blue" size="small">
                Stock Audit
              </Badge>
            </div>
            <Drawer.Description className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{item.title || "Raw Material"}</span>
              {item.sku && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                  SKU: {item.sku}
                </span>
              )}
              {selectedLocation && (
                <span className="text-xs text-slate-500">
                  • Facility: <strong className="text-slate-800">{selectedLocation.name}</strong>
                </span>
              )}
            </Drawer.Description>
          </Drawer.Header>

          {/* Body */}
          <Drawer.Body className="flex flex-1 flex-col gap-y-4 sm:gap-y-5 overflow-y-auto p-4 sm:p-6">
            {/* 1. Location Selector if multiple */}
            {locations.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-700">Warehouse Location</Label>
                <Select
                  value={activeLocationId}
                  onValueChange={(val) => {
                    setSelectedLocationId(val)
                    const lvl = item.location_levels?.find((l) => l.location_id === val)
                    const stock = lvl?.stocked_quantity ?? 0
                    if (mode === "set") setQuantityInput(String(stock))
                  }}
                >
                  <Select.Trigger className="h-8 text-xs bg-white border-slate-200">
                    <Select.Value placeholder="Select location" />
                  </Select.Trigger>
                  <Select.Content>
                    {locations.map((loc) => (
                      <Select.Item key={loc.id} value={loc.id} className="text-xs">
                        {loc.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            )}

            {/* 2. Current Stock Snapshot */}
            <div className="grid grid-cols-3 gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 font-medium">On-Hand Stocked</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-0.5">{currentStocked}</span>
                <span className="text-[10px] text-slate-400">Physical units</span>
              </div>
              <div className="flex flex-col border-l border-slate-200 pl-3">
                <span className="text-[11px] text-slate-500 font-medium">Allocated Reserved</span>
                <span className="text-lg font-bold font-mono text-amber-700 mt-0.5">{reservedStock}</span>
                <span className="text-[10px] text-slate-400">Order commits</span>
              </div>
              <div className="flex flex-col border-l border-slate-200 pl-3">
                <span className="text-[11px] text-slate-500 font-medium">Available to Build</span>
                <span className="text-lg font-bold font-mono text-emerald-700 mt-0.5">{currentAvailable}</span>
                <span className="text-[10px] text-slate-400">Net unreserved</span>
              </div>
            </div>

            {/* 3. Adjustment Mode Selection */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-slate-800">Adjustment Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("set")
                    setQuantityInput(String(currentStocked))
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    mode === "set"
                      ? "border-blue-500 bg-blue-50/80 text-blue-700 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>Count Audit</span>
                  <span className="text-[10px] font-normal text-slate-500 mt-0.5">Set exact stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("add")
                    setQuantityInput("10")
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    mode === "add"
                      ? "border-emerald-500 bg-emerald-50/80 text-emerald-700 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>+ Inbound Add</span>
                  <span className="text-[10px] font-normal text-slate-500 mt-0.5">Add to stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("deduct")
                    setQuantityInput("5")
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    mode === "deduct"
                      ? "border-rose-500 bg-rose-50/80 text-rose-700 shadow-2xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>- Deduct Stock</span>
                  <span className="text-[10px] font-normal text-slate-500 mt-0.5">Damage / Loss</span>
                </button>
              </div>
            </div>

            {/* 4. Quantity Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="adjust-qty" className="text-xs font-medium text-slate-700">
                {mode === "set"
                  ? "New Exact Physical Stock Quantity"
                  : mode === "add"
                  ? "Units to Add (+)"
                  : "Units to Deduct (-)"}
              </Label>
              <Input
                id="adjust-qty"
                type="number"
                min="0"
                step="1"
                required
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                className="h-9 text-sm font-mono"
                placeholder="0"
              />
            </div>

            {/* 5. Projected Calculation Preview */}
            <div
              className={`rounded-xl border p-3.5 text-xs transition-colors ${
                diff > 0
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                  : diff < 0
                  ? "border-amber-200 bg-amber-50/70 text-amber-950"
                  : "border-slate-200 bg-slate-50/70 text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-emerald-600 shrink-0" />
                  Projected Stock After Adjustment
                </span>
                <span className="font-mono text-sm font-bold">
                  {projectedStocked} units
                  {diff !== 0 && (
                    <span
                      className={`ml-1.5 text-xs font-semibold ${
                        diff > 0 ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      ({diff > 0 ? `+${diff}` : diff})
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1.5 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Net available unreserved:</span>
                <strong className="font-mono text-slate-900">{projectedAvailable} units</strong>
              </div>
            </div>

            {/* 6. Reason / Audit Trail Note */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="adjust-reason" className="text-xs font-medium text-slate-700">
                Audit Note / Reason for Adjustment
              </Label>
              <Input
                id="adjust-reason"
                placeholder="e.g. Physical inventory count reconciliation / PO arrival"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-slate-100/70 p-2.5 text-[11px] text-slate-500">
              <InformationCircle className="size-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Saving this adjustment immediately reconciles the on-hand physical balance and recalculates dependent
                compounded formulation build capacity in real time.
              </span>
            </div>
          </Drawer.Body>

          {/* Footer */}
          <Drawer.Footer className="border-t border-slate-200/80 px-4 sm:px-6 py-3 sm:py-4 pb-[env(safe-area-inset-bottom,1rem)] flex items-center justify-end gap-2">
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" type="button">
                Cancel
              </Button>
            </Drawer.Close>
            <Button size="small" type="submit" isLoading={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white">
              Save Adjustment ({projectedStocked} units)
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
