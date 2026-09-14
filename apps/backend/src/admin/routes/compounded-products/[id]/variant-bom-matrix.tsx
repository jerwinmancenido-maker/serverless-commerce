/**
 * @file    apps/backend/src/admin/routes/compounded-products/[id]/variant-bom-matrix.tsx
 * @module  VariantBomMatrix (Admin Compounded Products)
 * @purpose Modern matrix and batch editor for compounded product variants, recipes, and stock.
 * @contracts
 *   Route: /compounded-products/:id
 *   API: /admin/compounded-product/products/:id/variants/:variant_id/recipe
 */

import {
  ArchiveBox,
  Beaker,
  Check,
  ChevronDownMini,
  ChevronUpMini,
  CircleStack,
  PencilSquare,
  Photo,
  Plus,
  Sparkles,
  Trash,
  XMark,
} from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Button,
  Checkbox,
  Heading,
  Input,
  Label,
  Select,
  Text,
  clx,
  toast,
} from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query"
import React, { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { AdminCard } from "../../../components/admin-card"
import { TruncatedChip } from "../../../components/truncated-chip"
import { sdk } from "../../../lib/sdk"
import type {
  ComponentProfile,
  ConfiguredRecipeAvailabilityResponse,
  ProductReadinessResponse,
} from "../types"
import {
  KIT_TEMPLATES,
  detectKitTypeFromTitle,
  estimateComponentUnitCost,
  resolveKitRecipeRows,
  sortCompoundedProductVariants,
} from "./kit-template-matcher"
import {
  BomRecipeBreakdownCard,
  detectComponentRole,
  type BomComponentItemInfo,
} from "../../../components/editor/bom-recipe-breakdown-card"
import { VariantPhotoDrawer } from "./variant-photo-drawer"
import { QuickStockAdjustDrawer } from "./quick-stock-adjust-drawer"

type RecipeRow = {
  inventoryItemId: string
  requiredDisplayAmount: string
}

type VariantBomMatrixProps = {
  product: HttpTypes.AdminProduct
  readiness: ProductReadinessResponse
  availabilityByVariantId: Map<
    string,
    ConfiguredRecipeAvailabilityResponse["variants"][number]
  >
  availabilityQuery: UseQueryResult<ConfiguredRecipeAvailabilityResponse, unknown>
  stockLocations: HttpTypes.AdminStockLocation[]
  selectedStockLocationId: string
  setSelectedStockLocationId: (id: string) => void
  stockLocationsQuery: UseQueryResult<unknown, unknown>
  editingPriceVariantId: string | null
  setEditingPriceVariantId: (id: string | null) => void
  editingPriceAmount: string
  setEditingPriceAmount: (amount: string) => void
  isSavingPrice: boolean
  handleSavePrice: (variantId: string) => Promise<void>
  recipes: Record<string, RecipeRow[]>
  setRecipes: React.Dispatch<
    React.SetStateAction<Record<string, RecipeRow[]>>
  >
  expandedRecipeIds: Set<string>
  toggleRecipe: (variantId: string) => void
  seedRecipeRows: (variantId: string) => RecipeRow[]
  updateRecipe: (
    variantId: string,
    index: number,
    patch: Partial<RecipeRow>,
  ) => void
  recipeMutation: UseMutationResult<
    unknown,
    unknown,
    { variantId: string; rows: RecipeRow[] },
    unknown
  >
  profileByInventoryId: Map<string, any>
  inventoryById: Map<string, HttpTypes.AdminInventoryItem>
  profiles: any[]
  formatVariantPrices: (prices?: any) => string
}

export const VariantBomMatrix = ({
  product,
  readiness,
  availabilityByVariantId,
  availabilityQuery,
  stockLocations,
  selectedStockLocationId,
  setSelectedStockLocationId,
  stockLocationsQuery: _stockLocationsQuery,
  editingPriceVariantId,
  setEditingPriceVariantId,
  editingPriceAmount,
  setEditingPriceAmount,
  isSavingPrice,
  handleSavePrice,
  recipes,
  setRecipes,
  expandedRecipeIds,
  toggleRecipe,
  seedRecipeRows,
  updateRecipe,
  recipeMutation,
  profileByInventoryId,
  inventoryById,
  profiles,
  formatVariantPrices,
}: VariantBomMatrixProps) => {
  const queryClient = useQueryClient()
  const location = useLocation()
  const targetVariantId = new URLSearchParams(location.search).get("variant")
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(targetVariantId)

  useEffect(() => {
    if (targetVariantId) {
      setActiveHighlightId(targetVariantId)
      const el = document.getElementById(`variant-${targetVariantId}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      const timer = setTimeout(() => {
        setActiveHighlightId(null)
      }, 3500)
      return () => clearTimeout(timer)
    } else {
      setActiveHighlightId(null)
    }
  }, [targetVariantId])

  const sortedVariants = useMemo(
    () => sortCompoundedProductVariants(product.variants || []),
    [product.variants],
  )

  const [isAddingVariant, setIsAddingVariant] = useState(false)
  const [newVariantTitle, setNewVariantTitle] = useState("")
  const [newVariantSku, setNewVariantSku] = useState("")
  const [newVariantPrice, setNewVariantPrice] = useState("")
  const [newVariantManageInventory, setNewVariantManageInventory] = useState(true)
  const [isCreatingVariant, setIsCreatingVariant] = useState(false)

  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  const [editingVariantTitle, setEditingVariantTitle] = useState("")
  const [editingVariantSku, setEditingVariantSku] = useState("")
  const [isUpdatingVariant, setIsUpdatingVariant] = useState(false)

  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(null)
  const [isDeletingVariant, setIsDeletingVariant] = useState(false)
  const [isAutoMatchingAll, setIsAutoMatchingAll] = useState(false)

  const [photoDrawerVariant, setPhotoDrawerVariant] = useState<HttpTypes.AdminProductVariant | null>(null)
  const [stockAdjustVariant, setStockAdjustVariant] = useState<HttpTypes.AdminProductVariant | null>(null)
  const [isStockAdjustAllOpen, setIsStockAdjustAllOpen] = useState(false)

  const handleAutoMatchAll = async () => {
    if (!product.variants?.length) {
      toast.error("No product variants found")
      return
    }

    if (!profiles.length) {
      toast.error("No inventory component profiles available")
      return
    }

    setIsAutoMatchingAll(true)
    let updatedCount = 0

    try {
      for (const variant of product.variants) {
        if (!variant.manage_inventory) continue

        const kitType = detectKitTypeFromTitle(variant.title || "")
        const matchedRows = resolveKitRecipeRows({
          kitType,
          variantTitle: variant.title || "",
          profiles,
          inventoryById,
        })

        if (!matchedRows.length) continue

        await sdk.client.fetch(
          `/admin/compounded-product/products/${product.id}/variants/${variant.id}/recipe`,
          {
            method: "POST",
            body: {
              components: matchedRows.map((r) => ({
                inventory_item_id: r.inventoryItemId,
                required_display_amount: r.requiredDisplayAmount,
              })),
              note: `Auto-matched via ${KIT_TEMPLATES[kitType].name}`,
            },
          },
        )
        updatedCount++
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-readiness", product.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-native-product", product.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-configured-availability"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bom-location-availability"],
        }),
      ])

      await queryClient.refetchQueries({
        queryKey: ["bom-location-availability"],
      })

      toast.success(
        `Auto-matched and saved BOM recipes for ${updatedCount} variants!`,
      )
    } catch (_err) {
      toast.error("Failed to auto-match some variant recipes")
    } finally {
      setIsAutoMatchingAll(false)
    }
  }

  const handleCreateVariant = async () => {
    if (!newVariantTitle.trim()) {
      toast.error("Variant title is required")
      return
    }
    setIsCreatingVariant(true)
    try {
      const numericPrice = parseFloat(newVariantPrice)
      const prices =
        !isNaN(numericPrice) && numericPrice >= 0
          ? [{ amount: numericPrice, currency_code: "php" }]
          : []

      const optionsPayload = product.options?.length
        ? Object.fromEntries(
            product.options.map((opt) => [opt.title, newVariantTitle.trim()]),
          )
        : undefined

      await sdk.admin.product.createVariant(product.id, {
        title: newVariantTitle.trim(),
        sku: newVariantSku.trim() || undefined,
        prices,
        manage_inventory: newVariantManageInventory,
        options: optionsPayload,
      })

      toast.success("Variant created successfully")
      setIsAddingVariant(false)
      setNewVariantTitle("")
      setNewVariantSku("")
      setNewVariantPrice("")
      setNewVariantManageInventory(true)

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-native-product", product.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-readiness", product.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bom-location-availability"],
        }),
      ])
      await queryClient.refetchQueries({
        queryKey: ["bom-location-availability"],
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create variant")
    } finally {
      setIsCreatingVariant(false)
    }
  }

  const handleUpdateVariant = async (variantId: string) => {
    if (!editingVariantTitle.trim()) {
      toast.error("Variant title cannot be empty")
      return
    }
    setIsUpdatingVariant(true)
    try {
      await sdk.admin.product.updateVariant(product.id, variantId, {
        title: editingVariantTitle.trim(),
        sku: editingVariantSku.trim() || undefined,
      })
      toast.success("Variant updated successfully")
      setEditingVariantId(null)
      await queryClient.invalidateQueries({
        queryKey: ["compounded-product-native-product", product.id],
      })
      await queryClient.refetchQueries({
        queryKey: ["compounded-product-native-product", product.id],
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update variant")
    } finally {
      setIsUpdatingVariant(false)
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    setIsDeletingVariant(true)
    try {
      await sdk.admin.product.deleteVariant(product.id, variantId)
      toast.success("Variant deleted successfully")
      setDeletingVariantId(null)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-native-product", product.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["compounded-product-readiness", product.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bom-location-availability"],
        }),
      ])
      await queryClient.refetchQueries({
        queryKey: ["bom-location-availability"],
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete variant")
    } finally {
      setIsDeletingVariant(false)
    }
  }

  return (
    <AdminCard
      headerClassName="px-4 py-3 bg-ui-bg-subtle/40 flex flex-wrap items-center justify-between gap-3"
      title="Variants & Component Inventory"
      subtitle="Calculated stock reflects available assembly components at the selected warehouse."
      headerAction={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Text size="xsmall" className="text-ui-fg-subtle shrink-0">
              Warehouse:
            </Text>
            <div className="w-48">
              <Select
                value={selectedStockLocationId || undefined}
                onValueChange={setSelectedStockLocationId}
              >
                <Select.Trigger className="h-7 text-xs">
                  <Select.Value placeholder="Select facility" />
                </Select.Trigger>
                <Select.Content>
                  {stockLocations.map((location) => (
                    <Select.Item key={location.id} value={location.id} className="text-xs">
                      {location.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>
          <Button
            size="small"
            variant="secondary"
            isLoading={isAutoMatchingAll}
            disabled={isAutoMatchingAll || !profiles.length}
            onClick={handleAutoMatchAll}
            className="h-7 text-xs font-medium inline-flex items-center gap-1.5 text-ui-fg-interactive border-ui-border-base shadow-2xs"
            title="Auto-match and configure BOM recipes for all variants based on their names (Vial, Pharma BAC, SubQ Set)"
          >
            <Sparkles className="size-3.5 text-purple-600" />
            <span>Auto-Match Kits</span>
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setIsStockAdjustAllOpen(true)}
            className="h-7 text-xs font-medium inline-flex items-center gap-1.5 border-ui-border-base shadow-2xs"
            title="Adjust physical component stock levels at this warehouse"
          >
            <ArchiveBox className="size-3.5 text-ui-fg-subtle" />
            <span>Adjust Stock</span>
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setIsAddingVariant(true)
              setNewVariantTitle("")
              setNewVariantSku(
                product.handle
                  ? `${product.handle.toUpperCase().replace(/[^A-Z0-9]/g, "-")}-${(product.variants?.length || 0) + 1}`
                  : "",
              )
            }}
            className="h-7 text-xs font-medium inline-flex items-center gap-1"
          >
            <Plus className="size-3.5" />
            Add Variant
          </Button>
        </div>
      }
      contentClassName="p-0"
    >
      {isAddingVariant && (
        <div className="bg-ui-bg-subtle/60 border-b border-ui-border-base p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              + Add New Product Variant
            </Text>
            <Button
              size="small"
              variant="transparent"
              onClick={() => setIsAddingVariant(false)}
              className="size-6 p-0 text-ui-fg-muted hover:text-ui-fg-base"
            >
              <XMark className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] text-ui-fg-subtle">Variant Title *</Label>
              <Input
                size="small"
                placeholder="e.g. 100 mg Lyophilized Vial"
                value={newVariantTitle}
                onChange={(e) => setNewVariantTitle(e.target.value)}
                className="h-8 text-xs"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] text-ui-fg-subtle">SKU</Label>
              <Input
                size="small"
                placeholder="e.g. GHK-100MG"
                value={newVariantSku}
                onChange={(e) => setNewVariantSku(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] text-ui-fg-subtle">Price (PHP ₱)</Label>
              <Input
                size="small"
                type="number"
                step="0.01"
                placeholder="1000.00"
                value={newVariantPrice}
                onChange={(e) => setNewVariantPrice(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={newVariantManageInventory}
                  onCheckedChange={(checked) =>
                    setNewVariantManageInventory(Boolean(checked))
                  }
                />
                <Text size="xsmall" className="text-ui-fg-base">
                  Manage Inventory
                </Text>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setIsAddingVariant(false)}
              disabled={isCreatingVariant}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="primary"
              onClick={handleCreateVariant}
              isLoading={isCreatingVariant}
              className="h-7 text-xs"
            >
              Create Variant
            </Button>
          </div>
        </div>
      )}

      {/* Standard Medusa Table Header */}
      <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_120px_minmax(0,1.4fr)_110px] gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 md:grid">
        <div>Variant & SKU</div>
        <div>Price (Click to edit)</div>
        <div>Assembly Stock</div>
        <div>Limiting Item</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Variant Rows */}
      <div className="divide-y divide-ui-border-base">
        {sortedVariants.map((variant) => {
          const availability = availabilityByVariantId.get(variant.id)
          const readinessVariant = readiness.variants.find((v) => v.id === variant.id)
          const componentCount = readinessVariant?.recipe_components.length ?? 0
          const rows = recipes[variant.id]
          const isEditingRecipe = Boolean(rows)
          const isExpanded = expandedRecipeIds.has(variant.id) || isEditingRecipe
          const isEditingThisVariant = editingVariantId === variant.id

          const isTargeted = activeHighlightId === variant.id

          // Build component list for BomRecipeBreakdownCard & margin economics
          const rawComponents = (readinessVariant?.recipe_components || []).map((component) => {
            const item = inventoryById.get(component.inventory_item_id)
            const profile = profileByInventoryId.get(component.inventory_item_id)
            const ratio = profile?.base_units_per_display_unit || 1
            const requiredAmount = component.required_quantity / ratio
            const stockedQty = (item as any)?.location_levels?.[0]?.stocked_quantity ?? (item as any)?.stocked_quantity ?? 0
            const reservedQty = (item as any)?.location_levels?.[0]?.reserved_quantity ?? (item as any)?.reserved_quantity ?? 0
            const availableQty = Math.max(0, stockedQty - reservedQty)
            const capacity = requiredAmount > 0 ? Math.floor(availableQty / requiredAmount) : 0
            const role = detectComponentRole(item?.title || "", profile?.classification)
            const unitCost = estimateComponentUnitCost(item?.title || "", profile?.classification)

            return {
              inventoryItemId: component.inventory_item_id,
              title: item?.title || component.inventory_item_id,
              sku: item?.sku || null,
              role,
              requiredAmount,
              displayUnit: profile?.display_unit || profile?.base_unit || "units",
              stockedQty,
              reservedQty,
              availableQty,
              capacity,
              unitCost,
            }
          })

          const minCapacity = rawComponents.length
            ? Math.min(...rawComponents.map((c) => c.capacity))
            : 0

          const breakdownComponents: BomComponentItemInfo[] = rawComponents.map((c) => ({
            ...c,
            isLimiting: rawComponents.length > 1 && c.capacity === minCapacity,
          }))

          const variantPriceAmount = variant.prices?.[0]?.amount
          const totalCogs = breakdownComponents.length
            ? breakdownComponents.reduce((sum, c) => sum + (c.unitCost || 0) * c.requiredAmount, 0)
            : estimateComponentUnitCost(variant.title || "")

          const marginPercent =
            typeof variantPriceAmount === "number" && variantPriceAmount > 0
              ? Math.round(((variantPriceAmount - totalCogs) / variantPriceAmount) * 100)
              : null

          return (
            <div
              key={variant.id}
              id={`variant-${variant.id}`}
              className={clx(
                "flex flex-col transition-all duration-700",
                isTargeted && "rounded-lg ring-2 ring-ui-border-interactive bg-ui-bg-subtle",
              )}
            >
              {/* Main Compact Row */}
              <div className="grid grid-cols-1 gap-2 px-4 py-2.5 hover:bg-ui-bg-subtle/40 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_120px_minmax(0,1.4fr)_110px] md:items-center">
                {/* Variant Title & Truncated SKU Chip OR Inline Edit Form */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setPhotoDrawerVariant(variant)}
                    className="relative group size-9 shrink-0 rounded-lg border border-ui-border-base bg-ui-bg-subtle overflow-hidden flex items-center justify-center hover:border-ui-border-strong hover:shadow-2xs transition-all cursor-pointer"
                    title={variant.thumbnail ? "Change variation photo" : "Add variation photo"}
                  >
                    {variant.thumbnail ? (
                      <img
                        src={variant.thumbnail}
                        alt={variant.title || "Variant photo"}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Photo className="size-4 text-ui-fg-muted group-hover:text-ui-fg-base transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                      ✎
                    </div>
                  </button>

                  <div className="flex flex-col gap-y-0.5 min-w-0">
                    {isEditingThisVariant ? (
                      <div className="flex flex-col gap-1 pr-2">
                        <Input
                          size="small"
                          className="h-7 text-xs font-medium"
                          value={editingVariantTitle}
                          onChange={(e) => setEditingVariantTitle(e.target.value)}
                          placeholder="Variant title"
                          autoFocus
                        />
                        <Input
                          size="small"
                          className="h-6 text-[11px] font-mono"
                          value={editingVariantSku}
                          onChange={(e) => setEditingVariantSku(e.target.value)}
                          placeholder="SKU"
                        />
                      </div>
                    ) : (
                      <>
                        <Text size="small" weight="plus" className="text-ui-fg-base truncate">
                          {variant.title || "Untitled variant"}
                        </Text>
                        <div className="flex items-center gap-1">
                          <TruncatedChip value={variant.sku} label="SKU" maxLength={20} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Inline Price Editing */}
                <div className="flex flex-col gap-1 items-start">
                  <div className="flex items-center">
                    {editingPriceVariantId === variant.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-ui-fg-subtle">₱</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-6 w-20 text-xs font-semibold px-1"
                          value={editingPriceAmount}
                          onChange={(e) => setEditingPriceAmount(e.target.value)}
                          autoFocus
                        />
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={isSavingPrice}
                          onClick={() => handleSavePrice(variant.id)}
                          className="size-6 p-0 text-emerald-600 font-bold"
                        >
                          ✓
                        </Button>
                        <Button
                          size="small"
                          variant="transparent"
                          disabled={isSavingPrice}
                          onClick={() => setEditingPriceVariantId(null)}
                          className="size-6 p-0 text-ui-fg-muted"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const currentPrice = variant.prices?.[0]?.amount ?? 0
                          setEditingPriceAmount(String(currentPrice))
                          setEditingPriceVariantId(variant.id)
                        }}
                        className="group inline-flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-ui-bg-subtle text-left transition-colors"
                        title="Click to edit price"
                      >
                        <Text size="small" weight="plus" className="text-ui-fg-base font-mono">
                          {formatVariantPrices(variant.prices)}
                        </Text>
                        <span className="text-[11px] text-ui-fg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                          ✎
                        </span>
                      </button>
                    )}
                  </div>
                  {marginPercent !== null && (
                    <Badge
                      color={marginPercent >= 35 ? "green" : "orange"}
                      size="2xsmall"
                      className="text-[10px] font-semibold px-1 py-0 shrink-0 tracking-tight"
                      title={marginPercent >= 35 ? "Complies with >=35% Gross Margin Floor" : "Margin warning: below 35% floor"}
                    >
                      {marginPercent}% GM
                    </Badge>
                  )}
                </div>

                {/* Assembly Stock Status Badge */}
                <div className="flex items-center">
                  {!selectedStockLocationId ? (
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      —
                    </Text>
                  ) : availabilityQuery.isError ? (
                    <Badge color="red" size="small">Error</Badge>
                  ) : availabilityQuery.isFetching && !availability ? (
                    <Text size="xsmall" className="text-ui-fg-subtle animate-pulse">
                      Calculating…
                    </Text>
                  ) : availability?.status === "calculated" && availability.calculated_stock !== null ? (
                    <button
                      type="button"
                      onClick={() => setStockAdjustVariant(variant)}
                      className="group cursor-pointer hover:opacity-85 transition-all text-left"
                      title="Click to adjust component stock at warehouse"
                    >
                      <Badge
                        color={availability.calculated_stock > 15 ? "green" : availability.calculated_stock > 0 ? "orange" : "red"}
                        size="small"
                        className="font-medium inline-flex items-center gap-1"
                      >
                        <span>● {availability.calculated_stock} {availability.calculated_stock > 15 ? "In stock" : availability.calculated_stock > 0 ? "Low stock" : "Out"}</span>
                        <span className="text-[10px] opacity-60 group-hover:opacity-100 transition-opacity">✎</span>
                      </Badge>
                    </button>
                  ) : (
                    <Badge color="grey" size="small">No recipe</Badge>
                  )}
                </div>

                {/* Limiting Item */}
                <div className="flex items-center truncate text-xs text-ui-fg-subtle">
                  {selectedStockLocationId && !availabilityQuery.isError ? (
                    availability?.limiting_components?.[0]?.inventory_item_title ? (
                      <button
                        type="button"
                        onClick={() => setStockAdjustVariant(variant)}
                        className="inline-flex items-center gap-1 hover:text-ui-fg-base hover:underline text-left cursor-pointer truncate max-w-full"
                        title="Click to adjust stock for this limiting component"
                      >
                        <span className="truncate">{availability.limiting_components[0].inventory_item_title}</span>
                        <span className="text-[10px] text-ui-fg-muted">✎</span>
                      </button>
                    ) : (
                      <span className="text-ui-fg-muted">None</span>
                    )
                  ) : (
                    "—"
                  )}
                </div>

                {/* Row Actions */}
                <div className="flex items-center justify-end gap-1">
                  {isEditingThisVariant ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={isUpdatingVariant}
                        onClick={() => handleUpdateVariant(variant.id)}
                        className="size-6 p-0 text-emerald-600 font-bold"
                        title="Save variant details"
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        disabled={isUpdatingVariant}
                        onClick={() => setEditingVariantId(null)}
                        className="size-6 p-0 text-ui-fg-muted"
                        title="Cancel"
                      >
                        <XMark className="size-3.5" />
                      </Button>
                    </div>
                  ) : deletingVariantId === variant.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-ui-fg-muted">Del?</span>
                      <Button
                        size="small"
                        variant="danger"
                        disabled={isDeletingVariant}
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="h-6 px-1.5 text-[10px]"
                      >
                        Yes
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        disabled={isDeletingVariant}
                        onClick={() => setDeletingVariantId(null)}
                        className="size-6 p-0 text-ui-fg-muted"
                      >
                        <XMark className="size-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => toggleRecipe(variant.id)}
                        className="h-6 px-1 text-xs text-ui-fg-subtle hover:text-ui-fg-base gap-0.5"
                        title={isExpanded ? "Collapse Recipe" : "Expand Recipe"}
                      >
                        <span className="text-[11px]">{componentCount}</span>
                        {isExpanded ? <ChevronUpMini className="size-3" /> : <ChevronDownMini className="size-3" />}
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => {
                          setEditingVariantId(variant.id)
                          setEditingVariantTitle(variant.title || "")
                          setEditingVariantSku(variant.sku || "")
                        }}
                        className="size-6 p-0 text-ui-fg-subtle hover:text-ui-fg-base"
                        title="Edit variant title & SKU"
                      >
                        <PencilSquare className="size-3.5" />
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => setDeletingVariantId(variant.id)}
                        className="size-6 p-0 text-ui-fg-muted hover:text-rose-600"
                        title="Delete variant"
                      >
                        <Trash className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Collapsible BOM Recipe Breakdown */}
              {isExpanded && (
                <div className="bg-ui-bg-subtle/30 border-t border-ui-border-base px-6 py-3 flex flex-col gap-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ui-fg-base uppercase tracking-wider text-[11px]">
                        Bill of Materials Composition
                      </span>
                      <Badge color={readinessVariant?.recipe_ready ? "green" : "orange"} size="small">
                        {readinessVariant?.recipe_ready ? "Recipe Ready" : "Configuration Needed"}
                      </Badge>
                    </div>

                    {!isEditingRecipe && (
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={!readinessVariant?.manage_inventory || !profiles.length}
                        onClick={() => {
                          setRecipes((current) => ({
                            ...current,
                            [variant.id]: seedRecipeRows(variant.id),
                          }))
                        }}
                        className="h-6 text-xs px-2"
                      >
                        {componentCount > 0 ? "Edit BOM Recipe" : "+ Add Recipe"}
                      </Button>
                    )}
                  </div>

                  {!isEditingRecipe ? (
                    /* Read-only Sovereign BOM Recipe Breakdown Card */
                    <BomRecipeBreakdownCard
                      variantTitle={variant.title || "Variant"}
                      variantPrice={variant.prices?.[0]?.amount ?? undefined}
                      currencyCode={variant.prices?.[0]?.currency_code?.toUpperCase() ?? "PHP"}
                      components={breakdownComponents}
                      onQuickRestock={() => {
                        setStockAdjustVariant(variant)
                      }}
                    />
                  ) : (
                    /* Interactive Recipe Editing Mode */
                    <div className="flex flex-col gap-y-3 p-3 bg-ui-bg-base rounded-lg border border-ui-border-base">
                      {/* Quick Kit Template Chips */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-ui-bg-subtle border border-dashed border-ui-border-base">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Text
                            size="xsmall"
                            weight="plus"
                            className="text-ui-fg-subtle uppercase tracking-wider text-[10px]"
                          >
                            Kit Templates:
                          </Text>
                          <Button
                            type="button"
                            size="small"
                            variant="secondary"
                            onClick={() => {
                              const newRows = resolveKitRecipeRows({
                                kitType: "subq",
                                variantTitle: variant.title || "",
                                profiles,
                                inventoryById,
                              })
                              setRecipes((current) => ({
                                ...current,
                                [variant.id]: newRows,
                              }))
                            }}
                            className="h-6 text-[11px] px-2 py-0.5 bg-white shadow-2xs inline-flex items-center gap-1"
                          >
                            <Sparkles className="size-3 text-purple-600" />
                            <span>SubQ Kit</span>
                          </Button>
                          <Button
                            type="button"
                            size="small"
                            variant="secondary"
                            onClick={() => {
                              const newRows = resolveKitRecipeRows({
                                kitType: "bac",
                                variantTitle: variant.title || "",
                                profiles,
                                inventoryById,
                              })
                              setRecipes((current) => ({
                                ...current,
                                [variant.id]: newRows,
                              }))
                            }}
                            className="h-6 text-[11px] px-2 py-0.5 bg-white shadow-2xs inline-flex items-center gap-1"
                          >
                            <Beaker className="size-3 text-blue-600" />
                            <span>BAC Water Only</span>
                          </Button>
                          <Button
                            type="button"
                            size="small"
                            variant="secondary"
                            onClick={() => {
                              const newRows = resolveKitRecipeRows({
                                kitType: "vial",
                                variantTitle: variant.title || "",
                                profiles,
                                inventoryById,
                              })
                              setRecipes((current) => ({
                                ...current,
                                [variant.id]: newRows,
                              }))
                            }}
                            className="h-6 text-[11px] px-2 py-0.5 bg-white shadow-2xs inline-flex items-center gap-1"
                          >
                            <CircleStack className="size-3 text-slate-600" />
                            <span>Vial Only</span>
                          </Button>
                        </div>

                        {/* Smart Recommendation based on variant name */}
                        {(() => {
                          const recommendedType = detectKitTypeFromTitle(
                            variant.title || "",
                          )
                          const template = KIT_TEMPLATES[recommendedType]
                          return (
                            <Button
                              type="button"
                              size="small"
                              variant="transparent"
                              onClick={() => {
                                const newRows = resolveKitRecipeRows({
                                  kitType: recommendedType,
                                  variantTitle: variant.title || "",
                                  profiles,
                                  inventoryById,
                                })
                                setRecipes((current) => ({
                                  ...current,
                                  [variant.id]: newRows,
                                }))
                              }}
                              className="h-6 text-[11px] text-ui-fg-interactive hover:underline p-0 font-medium"
                            >
                              Recommended: {template.label} [Apply]
                            </Button>
                          )
                        })()}
                      </div>

                      {rows.map((row, index) => {
                        const selectedProfile = profileByInventoryId.get(row.inventoryItemId)

                        return (
                          <div
                            key={`${variant.id}-${index}`}
                            className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_140px_auto] gap-2 items-end"
                          >
                            <div className="flex flex-col gap-y-1">
                              <Label className="text-[11px] text-ui-fg-subtle">Component Item</Label>
                              <Select
                                value={row.inventoryItemId || undefined}
                                onValueChange={(inventoryItemId) =>
                                  updateRecipe(variant.id, index, {
                                    inventoryItemId,
                                    requiredDisplayAmount: "",
                                  })
                                }
                              >
                                <Select.Trigger className="h-7 text-xs">
                                  <Select.Value placeholder="Select component" />
                                </Select.Trigger>
                                <Select.Content>
                                  {profiles.map((profile) => (
                                    <Select.Item
                                      key={profile.inventory_item_id}
                                      value={profile.inventory_item_id}
                                      className="text-xs"
                                    >
                                      {inventoryById.get(profile.inventory_item_id)?.title ||
                                        profile.inventory_item_id}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select>
                            </div>

                            <div className="flex flex-col gap-y-1">
                              <Label className="text-[11px] text-ui-fg-subtle">
                                Qty {selectedProfile ? `(${selectedProfile.display_unit})` : ""}
                              </Label>
                              <Input
                                inputMode="decimal"
                                className="h-7 text-xs"
                                value={row.requiredDisplayAmount}
                                onChange={(e) =>
                                  updateRecipe(variant.id, index, {
                                    requiredDisplayAmount: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <Button
                              size="small"
                              variant="transparent"
                              className="h-7 text-xs text-ui-fg-muted hover:text-ui-fg-error"
                              onClick={() =>
                                setRecipes((current) => ({
                                  ...current,
                                  [variant.id]: (current[variant.id] || []).filter(
                                    (_item, rowIndex) => rowIndex !== index,
                                  ),
                                }))
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        )
                      })}

                      <div className="flex items-center justify-between border-t border-ui-border-base pt-2 mt-1">
                        <Button
                          size="small"
                          variant="secondary"
                          className="h-7 text-xs"
                          onClick={() =>
                            setRecipes((current) => ({
                              ...current,
                              [variant.id]: [
                                ...(current[variant.id] || []),
                                { inventoryItemId: "", requiredDisplayAmount: "" },
                              ],
                            }))
                          }
                        >
                          + Add Component
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            size="small"
                            variant="transparent"
                            className="h-7 text-xs"
                            onClick={() =>
                              setRecipes((current) => {
                                const next = { ...current }
                                delete next[variant.id]
                                return next
                              })
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            className="h-7 text-xs font-medium"
                            isLoading={recipeMutation.isPending}
                            onClick={() => recipeMutation.mutate({ variantId: variant.id, rows })}
                          >
                            Save BOM Recipe
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {availabilityQuery.isError && (
        <div className="px-4 py-2 text-xs text-ui-fg-error bg-rose-50/50">
          Calculated stock could not be loaded for this facility.
        </div>
      )}

      <VariantPhotoDrawer
        open={Boolean(photoDrawerVariant)}
        onOpenChange={(open) => {
          if (!open) setPhotoDrawerVariant(null)
        }}
        variant={photoDrawerVariant}
        product={product}
      />

      <QuickStockAdjustDrawer
        open={Boolean(stockAdjustVariant) || isStockAdjustAllOpen}
        onOpenChange={(open) => {
          if (!open) {
            setStockAdjustVariant(null)
            setIsStockAdjustAllOpen(false)
          }
        }}
        product={product}
        targetVariant={stockAdjustVariant}
        selectedStockLocationId={selectedStockLocationId}
        stockLocations={stockLocations}
        inventoryById={inventoryById}
        profileByInventoryId={profileByInventoryId}
        recipes={recipes}
        readiness={readiness}
      />
    </AdminCard>
  )
}

export default VariantBomMatrix
