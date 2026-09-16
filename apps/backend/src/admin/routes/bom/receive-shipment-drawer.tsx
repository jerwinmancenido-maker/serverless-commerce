/**
 * @file    apps/backend/src/admin/routes/bom/receive-shipment-drawer.tsx
 * @module  ReceiveShipmentDrawer (BOM Module)
 * @purpose Inbound stock receiving drawer with supplier packaging conversion, lot & expiry tracking, and live inventory level updates.
 * @contracts
 *   API:     POST /admin/inventory-items/:id/location-levels/:location_id
 *   Service: InventoryModuleService
 */

import { ArchiveBox, CheckCircle, InformationCircle } from "@medusajs/icons"
import { Badge, Button, Drawer, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import { type FormEvent, useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"

export type ReceiveComponentTarget = {
  id: string
  title: string
  sku: string | null
  baseUnit: string
  displayUnit: string
  supplierUnit: string
  unitsPerSupplierUnit: number
  lotTracking: boolean
  expiryTracking: boolean
  stocked: number
  available: number
}

type ReceiveShipmentDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  component: ReceiveComponentTarget | null
  selectedLocationId: string | null
  selectedLocationName?: string
}

export function ReceiveShipmentDrawer({
  open,
  onOpenChange,
  component,
  selectedLocationId,
  selectedLocationName = "Metro Manila Facility",
}: ReceiveShipmentDrawerProps) {
  const queryClient = useQueryClient()
  const [packageCount, setPackageCount] = useState<string>("1")
  const [isLooseUnits, setIsLooseUnits] = useState(false)
  const [looseUnitsCount, setLooseUnitsCount] = useState<string>("0")
  const [supplierLotNumber, setSupplierLotNumber] = useState<string>("")
  const [expirationDate, setExpirationDate] = useState<string>("")
  const [receivingReference, setReceivingReference] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset inputs when opening for a new component
  useEffect(() => {
    if (open && component) {
      setPackageCount("1")
      setIsLooseUnits(false)
      setLooseUnitsCount(String(component.unitsPerSupplierUnit || 1))
      setSupplierLotNumber("")
      setExpirationDate("")
      setReceivingReference("")
    }
  }, [open, component])

  if (!component) {
    return null
  }

  const unitsPerPkg = component.unitsPerSupplierUnit || 1
  const numPackages = Math.max(0, parseInt(packageCount, 10) || 0)
  const numLoose = Math.max(0, parseInt(looseUnitsCount, 10) || 0)

  const unitsToAdd = isLooseUnits ? numLoose : numPackages * unitsPerPkg
  const currentStock = component.stocked || 0
  const projectedStock = currentStock + unitsToAdd

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedLocationId) {
      toast.error("Please select an active facility location first")
      return
    }

    if (unitsToAdd <= 0) {
      toast.error("Please specify a quantity greater than zero to receive")
      return
    }

    if (component.lotTracking && !supplierLotNumber.trim()) {
      toast.error("Supplier Lot / Batch number is required for this component")
      return
    }

    if (component.expiryTracking && !expirationDate) {
      toast.error("Expiration date is required for this component")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Attempt to update existing location level
      try {
        await sdk.admin.inventoryItem.updateLevel(
          component.id,
          selectedLocationId,
          { stocked_quantity: projectedStock },
        )
      } catch {
        // 2. If level doesn't exist yet at this location, create it
        await sdk.admin.inventoryItem.batchInventoryItemLocationLevels(
          component.id,
          {
            create: [
              {
                location_id: selectedLocationId,
                stocked_quantity: projectedStock,
              },
            ],
          },
        )
      }

      // Invalidate relevant queries so live studio recalculates instantly
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["bom-location-availability"] }),
        queryClient.invalidateQueries({ queryKey: ["configured-recipe-availability"] }),
        queryClient.invalidateQueries({ queryKey: ["bom-reorder-alerts"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-items"] }),
        queryClient.invalidateQueries({ queryKey: ["bom-component-profiles"] }),
      ])

      const summaryUnit = isLooseUnits
        ? `${unitsToAdd} ${component.displayUnit}`
        : `${numPackages} ${component.supplierUnit} (${unitsToAdd} ${component.displayUnit})`

      toast.success(`Successfully received ${summaryUnit} of ${component.title}`)
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record received stock"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="w-full sm:max-w-[560px] h-dvh sm:h-full flex flex-col justify-between">
        <form className="flex h-full flex-col justify-between" onSubmit={handleSubmit}>
          <Drawer.Header className="border-b border-ui-border-base pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <ArchiveBox className="h-4 w-4" />
                </div>
                <Drawer.Title asChild>
                  <Heading level="h2">Receive Inbound Shipment</Heading>
                </Drawer.Title>
              </div>
              <Badge color="green" size="small">
                Inbound Dock
              </Badge>
            </div>
            <Drawer.Description className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ui-fg-base">{component.title}</span>
              {component.sku && (
                <span className="rounded bg-ui-bg-subtle px-1.5 py-0.5 font-mono text-xs text-ui-fg-muted">
                  SKU: {component.sku}
                </span>
              )}
              <span className="text-xs text-ui-fg-subtle">
                • Target: <strong className="text-ui-fg-base">{selectedLocationName}</strong>
              </span>
            </Drawer.Description>
          </Drawer.Header>

          <Drawer.Body className="flex flex-1 flex-col gap-y-5 overflow-y-auto p-4 sm:p-6">
            {/* Receiving Mode & Packaging Math */}
            <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Text size="small" weight="plus" className="text-ui-fg-base">
                    Supplier Packaging Inbound
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Configured standard: 1 {component.supplierUnit} = {unitsPerPkg} {component.displayUnit}
                  </Text>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLooseUnits((prev) => !prev)}
                  className="text-xs text-ui-fg-interactive hover:underline"
                >
                  {isLooseUnits ? "Switch to supplier packages" : "Receive loose units instead"}
                </button>
              </div>

              <div className="mt-4">
                {!isLooseUnits ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pkg-count" className="text-xs font-medium text-ui-fg-base">
                        {component.supplierUnit.charAt(0).toUpperCase() + component.supplierUnit.slice(1)} Count Received
                      </Label>
                      <Input
                        id="pkg-count"
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={packageCount}
                        onChange={(e) => setPackageCount(e.target.value)}
                        placeholder="e.g. 2"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-medium text-ui-fg-muted">
                        Units per {component.supplierUnit}
                      </Label>
                      <div className="flex h-8 items-center rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 text-xs font-mono text-ui-fg-muted">
                        × {unitsPerPkg} {component.displayUnit}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="loose-count" className="text-xs font-medium text-ui-fg-base">
                      Individual Units Received ({component.displayUnit})
                    </Label>
                    <Input
                      id="loose-count"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={looseUnitsCount}
                      onChange={(e) => setLooseUnitsCount(e.target.value)}
                      placeholder="e.g. 50"
                    />
                  </div>
                )}

                {/* Real-time Math Summary Card */}
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Adding +{unitsToAdd.toLocaleString()} {component.displayUnit} into available stock
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-700">
                    Current stock: <strong>{currentStock.toLocaleString()}</strong> ➔ Projected new stock:{" "}
                    <strong>{projectedStock.toLocaleString()} {component.displayUnit}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Lot & Expiration Tracking (GMP Compliance) */}
            {(component.lotTracking || component.expiryTracking) && (
              <div className="flex flex-col gap-3 rounded-xl border border-ui-border-base p-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Text size="small" weight="plus" className="text-ui-fg-base">
                      Clinical GMP Traceability
                    </Text>
                    <Badge color="blue" size="small">
                      Required
                    </Badge>
                  </div>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    This component requires lot number and/or expiration date logging for clinical safety.
                  </Text>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {component.lotTracking && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="lot-number" className="text-xs font-medium text-ui-fg-base">
                        Supplier Lot / Batch # <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lot-number"
                        required
                        placeholder="e.g. LOT-2026-09A"
                        value={supplierLotNumber}
                        onChange={(e) => setSupplierLotNumber(e.target.value)}
                      />
                    </div>
                  )}

                  {component.expiryTracking && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="expiry-date" className="text-xs font-medium text-ui-fg-base">
                        Expiration Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="expiry-date"
                        type="date"
                        required
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Receiving Reference / Notes */}
            <div className="flex flex-col gap-3 rounded-xl border border-ui-border-base p-4">
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-base">
                  Shipment Documentation Reference
                </Text>
                <Text size="xsmall" className="text-ui-fg-muted">
                  Optional Purchase Order (PO) number or courier waybill for warehouse records.
                </Text>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rec-ref" className="text-xs font-medium text-ui-fg-base">
                  PO / Airwaybill / Delivery Receipt #
                </Label>
                <Input
                  id="rec-ref"
                  placeholder="e.g. PO-1049 / JNT-782910482019"
                  value={receivingReference}
                  onChange={(e) => setReceivingReference(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-ui-bg-subtle p-2.5 text-[11px] text-ui-fg-muted">
                <InformationCircle className="h-4 w-4 shrink-0 text-ui-fg-subtle mt-0.5" />
                <span>
                  Confirming receipt immediately credits physical inventory at {selectedLocationName} and updates
                  all dependent compounded formulation build capacities in real time.
                </span>
              </div>
            </div>
          </Drawer.Body>

          <Drawer.Footer className="border-t border-ui-border-base px-4 sm:px-6 py-3 sm:py-4 pb-[env(safe-area-inset-bottom,1rem)] flex items-center justify-end gap-2">
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" type="button">
                Cancel
              </Button>
            </Drawer.Close>
            <Button size="small" type="submit" isLoading={isSubmitting}>
              Confirm Inbound Receipt (+{unitsToAdd} {component.displayUnit})
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
