import { ArrowUpRightOnBox, CheckCircle, ExclamationCircle } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import { Badge, Button, Drawer, Input, Text, toast } from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sdk } from "../../../lib/sdk"
import type { ComponentProfile } from "../../bom/types"
import type { ProductReadinessResponse } from "../types"
import type { RecipeRow } from "./kit-template-matcher"

type QuickStockAdjustDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: HttpTypes.AdminProduct
  targetVariant: HttpTypes.AdminProductVariant | null
  selectedStockLocationId: string | null
  stockLocations: HttpTypes.AdminStockLocation[]
  inventoryById: Map<string, HttpTypes.AdminInventoryItem>
  profileByInventoryId: Map<string, any>
  recipes: Record<string, RecipeRow[]>
  readiness: ProductReadinessResponse
}

type ComponentStockRow = {
  inventoryItemId: string
  title: string
  sku: string | null
  classification: string
  currentStock: number
  isLimiting: boolean
}

export const QuickStockAdjustDrawer = ({
  open,
  onOpenChange,
  product,
  targetVariant,
  selectedStockLocationId,
  stockLocations,
  inventoryById,
  profileByInventoryId,
  recipes,
  readiness,
}: QuickStockAdjustDrawerProps) => {
  const queryClient = useQueryClient()
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({})
  const [isSaving, setIsSaving] = useState(false)

  const selectedLocation = stockLocations.find(
    (loc) => loc.id === selectedStockLocationId,
  )

  // Identify which inventory items are associated with this variant / product
  const relevantComponentRows = useMemo(() => {
    const itemIds = new Set<string>()

    if (targetVariant) {
      // 1. From local recipe draft
      const localRows = recipes[targetVariant.id] || []
      localRows.forEach((r) => itemIds.add(r.inventoryItemId || (r as any).inventory_item_id))

      // 2. From readiness variant recipe components
      const readinessVar = readiness.variants.find((v) => v.id === targetVariant.id)
      readinessVar?.recipe_components.forEach((c) => itemIds.add(c.inventory_item_id))
    } else {
      // All components across the product's variants
      Object.values(recipes).forEach((rows) => {
        rows.forEach((r) => itemIds.add(r.inventoryItemId || (r as any).inventory_item_id))
      })
      readiness.variants.forEach((v) => {
        v.recipe_components.forEach((c) => itemIds.add(c.inventory_item_id))
      })
    }

    const rows: ComponentStockRow[] = []

    for (const id of Array.from(itemIds)) {
      const invItem = inventoryById.get(id)
      const profile = profileByInventoryId.get(id)

      // Find stock level at this location
      const level = invItem?.location_levels?.find(
        (lvl) => lvl.location_id === selectedStockLocationId,
      )
      const currentStock = Number(level?.stocked_quantity ?? 0)

      rows.push({
        inventoryItemId: id,
        title: invItem?.title || "Component",
        sku: invItem?.sku || null,
        classification: profile?.classification || "included_supply",
        currentStock,
        isLimiting: false,
      })
    }

    return rows
  }, [
    targetVariant,
    recipes,
    readiness,
    inventoryById,
    profileByInventoryId,
    selectedStockLocationId,
  ])

  // Initialize stock edit state
  useEffect(() => {
    if (open) {
      const initial: Record<string, number> = {}
      for (const comp of relevantComponentRows) {
        initial[comp.inventoryItemId] = comp.currentStock
      }
      setStockEdits(initial)
    }
  }, [open, relevantComponentRows])

  const handleStockChange = (itemId: string, val: string) => {
    const num = parseInt(val, 10)
    setStockEdits((prev) => ({
      ...prev,
      [itemId]: isNaN(num) ? 0 : Math.max(0, num),
    }))
  }

  const handleQuickAdd = (itemId: string, addAmount: number) => {
    setStockEdits((prev) => {
      const current = prev[itemId] ?? 0
      return {
        ...prev,
        [itemId]: current + addAmount,
      }
    })
  }

  const handleSaveStock = async () => {
    if (!selectedStockLocationId) {
      toast.error("Please select a warehouse location first")
      return
    }

    setIsSaving(true)
    let updatedCount = 0

    try {
      for (const comp of relevantComponentRows) {
        const targetQty = stockEdits[comp.inventoryItemId]
        if (targetQty === undefined || targetQty === comp.currentStock) {
          continue
        }

        try {
          await sdk.admin.inventoryItem.updateLevel(
            comp.inventoryItemId,
            selectedStockLocationId,
            { stocked_quantity: targetQty },
          )
        } catch {
          // If level does not exist yet at this location, create it
          await sdk.admin.inventoryItem.batchInventoryItemLocationLevels(
            comp.inventoryItemId,
            {
              create: [
                {
                  location_id: selectedStockLocationId,
                  stocked_quantity: targetQty,
                },
              ],
            },
          )
        }
        updatedCount++
      }

      toast.success(
        updatedCount > 0
          ? `Stock updated for ${updatedCount} component${updatedCount === 1 ? "" : "s"} at ${selectedLocation?.name || "Warehouse"}`
          : "No changes to save",
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bom-location-availability"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["inventory-items"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-readiness", product.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-native-product", product.id],
        }),
      ])

      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ["bom-location-availability"],
        }),
        queryClient.refetchQueries({
          queryKey: ["inventory-items"],
        }),
      ])

      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update warehouse stock")
    } finally {
      setIsSaving(false)
    }
  }

  const hasAnyChanges = relevantComponentRows.some(
    (comp) =>
      stockEdits[comp.inventoryItemId] !== undefined &&
      stockEdits[comp.inventoryItemId] !== comp.currentStock,
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title className="flex items-center gap-2">
            <span>📦</span>
            <span>
              {targetVariant
                ? `Adjust Stock: ${targetVariant.title}`
                : "Adjust Component Stocks"}
            </span>
          </Drawer.Title>
          <Drawer.Description>
            Directly update physical warehouse inventory for kit components at{" "}
            <strong>{selectedLocation?.name || "Selected Warehouse"}</strong>. Changes immediately update assembly capacity.
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="flex flex-1 flex-col gap-y-4 overflow-y-auto p-6">
          {relevantComponentRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-ui-border-base bg-ui-bg-subtle/30">
              <span className="text-3xl mb-2">🧪</span>
              <Text size="small" weight="plus" className="text-ui-fg-base">
                No components found for this variant
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                Configure a recipe in the table first or click "⚡ Auto-Match Kits" to assign inventory components.
              </Text>
            </div>
          ) : (
            <div className="flex flex-col gap-y-3">
              {relevantComponentRows.map((comp) => {
                const editedValue = stockEdits[comp.inventoryItemId] ?? comp.currentStock
                const isChanged = editedValue !== comp.currentStock
                const diff = editedValue - comp.currentStock

                return (
                  <div
                    key={comp.inventoryItemId}
                    className={`flex flex-col gap-y-2.5 p-3.5 rounded-xl border transition-all ${
                      isChanged
                        ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                        : "border-ui-border-base bg-ui-bg-base"
                    }`}
                  >
                    {/* Component Header & Classification */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <Text size="small" weight="plus" className="text-ui-fg-base truncate">
                            {comp.title}
                          </Text>
                          <Badge
                            color={comp.classification === "finished_product" ? "blue" : "grey"}
                            size="small"
                          >
                            {comp.classification === "finished_product" ? "Finished Vial" : "Supply"}
                          </Badge>
                        </div>
                        {comp.sku && (
                          <Text size="xsmall" className="text-ui-fg-subtle font-mono mt-0.5">
                            SKU: {comp.sku}
                          </Text>
                        )}
                      </div>

                      <a
                        href={`http://localhost:9000/app/inventory?q=${encodeURIComponent(comp.title)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-ui-fg-subtle hover:text-ui-fg-base shrink-0"
                        title="Open in Medusa master inventory view"
                      >
                        <span>Inventory</span>
                        <ArrowUpRightOnBox className="size-3" />
                      </a>
                    </div>

                    {/* Stock Input & Quick Add Chips */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ui-border-base/60">
                      <div className="flex items-center gap-2">
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          Current: <strong className="text-ui-fg-base">{comp.currentStock}</strong>
                        </Text>
                        {isChanged && (
                          <Badge color={diff > 0 ? "green" : "red"} size="small">
                            {diff > 0 ? `+${diff}` : `${diff}`}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min={0}
                          value={editedValue}
                          onChange={(e) => handleStockChange(comp.inventoryItemId, e.target.value)}
                          className="w-20 h-7 text-xs font-semibold text-center font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(comp.inventoryItemId, 10)}
                          className="px-1.5 py-0.5 text-[11px] font-medium rounded border border-ui-border-base bg-ui-bg-subtle hover:bg-ui-bg-base transition-colors"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(comp.inventoryItemId, 50)}
                          className="px-1.5 py-0.5 text-[11px] font-medium rounded border border-ui-border-base bg-ui-bg-subtle hover:bg-ui-bg-base transition-colors"
                          title="Add 50 units"
                        >
                          +50
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(comp.inventoryItemId, 100)}
                          className="px-1.5 py-0.5 text-[11px] font-medium rounded border border-ui-border-base bg-ui-bg-subtle hover:bg-ui-bg-base transition-colors"
                          title="Add 100 units"
                        >
                          +100
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Drawer.Body>

        <Drawer.Footer className="flex items-center justify-end gap-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="primary"
            onClick={handleSaveStock}
            isLoading={isSaving}
            disabled={!hasAnyChanges}
          >
            Save Stock Changes
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
