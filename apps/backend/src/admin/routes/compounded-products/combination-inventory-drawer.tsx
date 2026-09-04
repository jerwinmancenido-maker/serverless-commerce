import { Trash } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  IconButton,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import {
  combinationComponentsAreComplete,
  componentsForCombination,
  inferRecipeAxisRoles,
  withInferredRecipeAxisRoles,
} from "./combination-recipe-adapter"
import {
  CustomKitTemplateModal,
  type CustomKitTemplate,
} from "./custom-kit-template-modal"
import type { DirectVariationAxis } from "./direct-variation-snapshot"
import type { DirectRecipeConfiguration } from "./direct-recipe-rules"
import type {
  ComponentProfile,
  ComponentProfilesResponse,
  ConfiguredRecipeAvailabilityComponent,
  ConfiguredRecipeAvailabilityResponse,
  MatrixRow,
  PresentationSnapshot,
  RecipeRuleComponent,
} from "./types"

type Classification = ComponentProfile["classification"]
type ComponentGroup = "finishedProduct" | "includedSupplies" | "packaging"
type ComponentTarget = {
  group: ComponentGroup
  componentIndex: number | null
}

const classificationByGroup: Record<ComponentGroup, Classification> = {
  finishedProduct: "finished_product",
  includedSupplies: "included_supply",
  packaging: "packaging",
}

const classificationLabel: Record<Classification, string> = {
  finished_product: "Finished product",
  included_supply: "Included item",
  packaging: "Packaging",
}

const cloneConfiguration = (
  configuration: DirectRecipeConfiguration,
): DirectRecipeConfiguration => ({
  ...configuration,
  finishedProductByValueId: Object.fromEntries(
    Object.entries(configuration.finishedProductByValueId).map(
      ([key, items]) => [key, items.map((item) => ({ ...item }))],
    ),
  ),
  includedSupplyByValueId: Object.fromEntries(
    Object.entries(configuration.includedSupplyByValueId).map(
      ([key, items]) => [key, items.map((item) => ({ ...item }))],
    ),
  ),
  commonPackaging: configuration.commonPackaging.map((item) => ({ ...item })),
})

const itemAvailability = (
  components: ConfiguredRecipeAvailabilityComponent[] | undefined,
  inventoryItemId: string,
) =>
  components?.find(
    (component) => component.inventory_item_id === inventoryItemId,
  )

const ComponentRows = ({
  components,
  inventoryById,
  profileByInventoryId,
  availabilityComponents,
  maximum,
  addLabel,
  onChoose,
  onChange,
}: {
  components: RecipeRuleComponent[]
  inventoryById: Map<string, HttpTypes.AdminInventoryItem>
  profileByInventoryId: Map<string, ComponentProfile>
  availabilityComponents?: ConfiguredRecipeAvailabilityComponent[]
  maximum?: number
  addLabel: string
  onChoose: (componentIndex: number | null) => void
  onChange: (components: RecipeRuleComponent[]) => void
}) => (
  <div className="flex flex-col gap-y-2">
    {components.map((component, index) => {
      const item = inventoryById.get(component.inventory_item_id)
      const profile = profileByInventoryId.get(component.inventory_item_id)
      const availability = itemAvailability(
        availabilityComponents,
        component.inventory_item_id,
      )
      const currentAmount = parseFloat(component.required_display_amount || "1") || 1

      return (
        <div
          key={`${component.inventory_item_id}-${index}`}
          className="rounded-lg border border-ui-border-base p-3 bg-white shadow-2xs"
        >
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onChoose(index)}
            >
              <Text size="small" weight="plus" className="truncate">
                {item?.title || component.inventory_item_id}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {item?.sku || "No SKU"} · {profile?.display_unit || "unit"}
                {availability
                  ? ` · ${availability.available_quantity} available`
                  : ""}
              </Text>
            </button>
            <IconButton
              size="small"
              variant="transparent"
              aria-label={`Remove ${item?.title || "component"}`}
              onClick={() =>
                onChange(
                  components.filter(
                    (_component, currentIndex) => currentIndex !== index,
                  ),
                )
              }
            >
              <Trash />
            </IconButton>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-ui-border-base pt-2">
            <Text size="xsmall" className="text-ui-fg-subtle">
              {profile
                ? classificationLabel[profile.classification]
                : "Inventory item"}
            </Text>
            <div className="flex items-center gap-1.5">
              <Text size="xsmall" className="text-ui-fg-subtle mr-1">
                Qty:
              </Text>
              <button
                type="button"
                disabled={currentAmount <= 1}
                onClick={() => {
                  const val = Math.max(1, currentAmount - 1)
                  onChange(
                    components.map((c, i) =>
                      i === index
                        ? { ...c, required_display_amount: String(val) }
                        : c,
                    ),
                  )
                }}
                className="size-6 flex items-center justify-center rounded border border-ui-border-base bg-white text-xs hover:bg-ui-bg-subtle disabled:opacity-40"
              >
                −
              </button>
              <Input
                aria-label={`Required amount for ${item?.title || component.inventory_item_id}`}
                inputMode="decimal"
                className="h-6 w-12 text-center text-xs font-semibold px-1"
                value={component.required_display_amount}
                onChange={(event) =>
                  onChange(
                    components.map((current, currentIndex) =>
                      currentIndex === index
                        ? {
                            ...current,
                            required_display_amount: event.target.value,
                          }
                        : current,
                    ),
                  )
                }
              />
              <button
                type="button"
                onClick={() => {
                  const val = currentAmount + 1
                  onChange(
                    components.map((c, i) =>
                      i === index
                        ? { ...c, required_display_amount: String(val) }
                        : c,
                    ),
                  )
                }}
                className="size-6 flex items-center justify-center rounded border border-ui-border-base bg-white text-xs hover:bg-ui-bg-subtle"
              >
                +
              </button>
              <div className="flex items-center gap-1 ml-1">
                {[1, 5, 10, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      onChange(
                        components.map((c, i) =>
                          i === index
                            ? { ...c, required_display_amount: String(preset) }
                            : c,
                        ),
                      )
                    }
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      currentAmount === preset
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    })}
    {!maximum || components.length < maximum ? (
      <Button
        size="small"
        variant="secondary"
        className="self-start"
        onClick={() => onChoose(null)}
      >
        {addLabel}
      </Button>
    ) : null}
  </div>
)

export const CombinationInventoryDrawer = ({
  open,
  onOpenChange,
  row,
  rows,
  axes,
  snapshot,
  configuration,
  availability,
  stockLocationName,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: MatrixRow | null
  rows: MatrixRow[]
  axes: DirectVariationAxis[]
  snapshot: PresentationSnapshot | null
  configuration: DirectRecipeConfiguration
  availability?: ConfiguredRecipeAvailabilityResponse["variants"][number]
  stockLocationName: string
  onSave: (configuration: DirectRecipeConfiguration) => void
}) => {
  const inferredRoles = useMemo(() => inferRecipeAxisRoles(axes), [axes])
  const inferredConfiguration = useMemo(
    () => withInferredRecipeAxisRoles(configuration, axes),
    [axes, configuration],
  )
  const [draft, setDraft] = useState(() =>
    cloneConfiguration(inferredConfiguration),
  )
  const [target, setTarget] = useState<ComponentTarget | null>(null)
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 8

  // Multi-select batch selection state for the item picker
  const [selectedBatch, setSelectedBatch] = useState<Map<string, number>>(
    new Map(),
  )

  // Custom Kit Template Manager state
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState<CustomKitTemplate[]>(
    () => {
      try {
        const raw = localStorage.getItem("pepstack_kit_templates_v1")
        if (raw) return JSON.parse(raw)
      } catch {}
      return [
        {
          id: "subq_starter",
          name: "SubQ Injection Kit",
          items: [
            {
              inventory_item_id: "bac_water",
              title: "BAC Water 10 mL",
              sku: "BAC-10ML",
              quantity: 1,
            },
            {
              inventory_item_id: "syringe",
              title: "1 cc Syringe",
              sku: "SYR-1CC",
              quantity: 10,
            },
            {
              inventory_item_id: "alcohol_pad",
              title: "Alcohol Pad",
              sku: "ALC-PAD",
              quantity: 10,
            },
          ],
        },
        {
          id: "reconstitution_starter",
          name: "BAC Reconstitution Only",
          items: [
            {
              inventory_item_id: "bac_water",
              title: "BAC Water 10 mL",
              sku: "BAC-10ML",
              quantity: 1,
            },
          ],
        },
      ]
    },
  )

  const saveTemplate = (template: CustomKitTemplate) => {
    const next = [...savedTemplates, template]
    setSavedTemplates(next)
    try {
      localStorage.setItem("pepstack_kit_templates_v1", JSON.stringify(next))
    } catch {}
  }

  const deleteTemplate = (id: string) => {
    const next = savedTemplates.filter((t) => t.id !== id)
    setSavedTemplates(next)
    try {
      localStorage.setItem("pepstack_kit_templates_v1", JSON.stringify(next))
    } catch {}
    toast.info("Template removed")
  }

  useEffect(() => {
    if (open) {
      setDraft(cloneConfiguration(inferredConfiguration))
      setTarget(null)
      setSearch("")
      setPageIndex(0)
      setSelectedBatch(new Map())
    }
  }, [inferredConfiguration, open, row?.key])

  const contents = useMemo(
    () =>
      row && snapshot
        ? componentsForCombination({
            configuration: draft,
            axes,
            snapshot,
            row,
            rows,
          })
        : null,
    [axes, draft, row, rows, snapshot],
  )

  // Initialize selected batch when entering item picker
  useEffect(() => {
    if (target && contents) {
      const map = new Map<string, number>()
      if (target.componentIndex !== null) {
        const currentList =
          target.group === "finishedProduct"
            ? contents.finishedProduct
            : target.group === "includedSupplies"
              ? contents.includedSupplies
              : contents.packaging
        const existing = currentList[target.componentIndex]
        if (existing) {
          map.set(
            existing.inventory_item_id,
            parseFloat(existing.required_display_amount || "1") || 1,
          )
        }
      }
      setSelectedBatch(map)
    } else {
      setSelectedBatch(new Map())
    }
  }, [target, contents])

  const selectedInventoryIds = useMemo(
    () =>
      Array.from(
        new Set((contents?.all || []).map((item) => item.inventory_item_id)),
      ),
    [contents?.all],
  )

  const profilesQuery = useQuery({
    queryKey: ["bom-component-profiles", "combination-inventory-drawer"],
    queryFn: () =>
      sdk.client.fetch<ComponentProfilesResponse>(
        "/admin/bom/component-profiles",
      ),
  })

  const profileByInventoryId = useMemo(
    () =>
      new Map(
        (profilesQuery.data?.component_profiles || []).map((profile) => [
          profile.inventory_item_id,
          profile,
        ]),
      ),
    [profilesQuery.data?.component_profiles],
  )

  const selectedInventoryQuery = useQuery({
    queryKey: [
      "inventory-items",
      "combination-inventory-display",
      selectedInventoryIds,
    ],
    enabled: selectedInventoryIds.length > 0,
    queryFn: () =>
      sdk.admin.inventoryItem.list({
        id: selectedInventoryIds,
        limit: selectedInventoryIds.length,
      }),
  })

  // Full inventory query for template builder
  const allSuppliesInventoryQuery = useQuery({
    queryKey: ["inventory-items", "all-supplies-template-manager"],
    queryFn: () => sdk.admin.inventoryItem.list({ limit: 100 }),
  })

  const inventoryById = useMemo(
    () =>
      new Map(
        (selectedInventoryQuery.data?.inventory_items || []).map((item) => [
          item.id,
          item,
        ]),
      ),
    [selectedInventoryQuery.data?.inventory_items],
  )

  const targetClassification = target
    ? classificationByGroup[target.group]
    : null

  const selectableProfileIds = useMemo(
    () =>
      (profilesQuery.data?.component_profiles || [])
        .filter((profile) => profile.classification === targetClassification)
        .map((profile) => profile.inventory_item_id),
    [profilesQuery.data?.component_profiles, targetClassification],
  )

  const inventoryQuery = useQuery({
    queryKey: [
      "inventory-items",
      "combination-inventory-selector",
      targetClassification,
      pageIndex,
      search,
      selectableProfileIds,
    ],
    enabled: Boolean(target && selectableProfileIds.length),
    queryFn: () =>
      sdk.admin.inventoryItem.list({
        id: selectableProfileIds,
        limit: pageSize,
        offset: pageIndex * pageSize,
        q: search || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  // Extract Net Content / Dosage string from current combination row (e.g. "50 mg", "10 mg")
  const netContentMatch = useMemo(() => {
    if (!row?.title) return null
    const match = row.title.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu)?/i)
    return match ? match[0].trim() : null
  }, [row?.title])

  // Sort inventory items so items matching dosage appear at top when choosing finished vial
  const sortedInventoryItems = useMemo(() => {
    const items = [...(inventoryQuery.data?.inventory_items || [])]
    if (target?.group === "finishedProduct" && netContentMatch) {
      const needle = netContentMatch.toLowerCase()
      const numPart = netContentMatch.match(/\d+(?:\.\d+)?/)?.[0]
      items.sort((a, b) => {
        const aTitle = (a.title || "").toLowerCase()
        const bTitle = (b.title || "").toLowerCase()
        const aSku = (a.sku || "").toLowerCase()
        const bSku = (b.sku || "").toLowerCase()

        const aMatch =
          aTitle.includes(needle) ||
          aSku.includes(needle) ||
          Boolean(numPart && (aTitle.includes(numPart) || aSku.includes(numPart)))
        const bMatch =
          bTitle.includes(needle) ||
          bSku.includes(needle) ||
          Boolean(numPart && (bTitle.includes(numPart) || bSku.includes(numPart)))

        if (aMatch && !bMatch) return -1
        if (!aMatch && bMatch) return 1
        return 0
      })
    }
    return items
  }, [inventoryQuery.data?.inventory_items, target?.group, netContentMatch])

  const updateGroup = (
    group: ComponentGroup,
    components: RecipeRuleComponent[],
  ) => {
    if (!contents?.scopes) return

    if (group === "packaging") {
      setDraft((current) => ({ ...current, commonPackaging: components }))
      return
    }

    const scope =
      group === "finishedProduct"
        ? contents.scopes.finishedProduct
        : contents.scopes.includedSupply

    if (!scope) return

    setDraft((current) => ({
      ...current,
      ...(group === "finishedProduct"
        ? {
            finishedProductByValueId: {
              ...current.finishedProductByValueId,
              [scope.valueId]: components.slice(0, 1),
            },
          }
        : {
            includedSupplyByValueId: {
              ...current.includedSupplyByValueId,
              [scope.valueId]: components,
            },
          }),
    }))
  }

  // Multi-select batch handlers
  const handleToggleBatchItem = (
    itemId: string,
    checked: boolean,
    defaultQty = 1,
  ) => {
    const next = new Map(selectedBatch)
    if (checked) {
      next.set(itemId, next.get(itemId) || defaultQty)
    } else {
      next.delete(itemId)
    }
    setSelectedBatch(next)
  }

  const handleUpdateBatchQty = (itemId: string, qty: number) => {
    const next = new Map(selectedBatch)
    next.set(itemId, Math.max(1, qty))
    setSelectedBatch(next)
  }

  const applySelectedBatch = () => {
    if (!target || !contents) return

    const current =
      target.group === "finishedProduct"
        ? contents.finishedProduct
        : target.group === "includedSupplies"
          ? contents.includedSupplies
          : contents.packaging
    const next = [...current]

    selectedBatch.forEach((qty, inventoryItemId) => {
      const existingIndex = next.findIndex(
        (item) => item.inventory_item_id === inventoryItemId,
      )
      const component = {
        inventory_item_id: inventoryItemId,
        required_display_amount: String(qty),
      }

      if (target.componentIndex !== null) {
        next[target.componentIndex] = component
      } else if (existingIndex >= 0) {
        next[existingIndex] = component
      } else {
        if (target.group === "finishedProduct") {
          next[0] = component
        } else {
          next.push(component)
        }
      }
    })

    updateGroup(target.group, next)
    toast.success(
      `Added ${selectedBatch.size} item${selectedBatch.size === 1 ? "" : "s"} to ${classificationLabel[targetClassification!]}`,
    )
    setTarget(null)
    setSelectedBatch(new Map())
    setSearch("")
    setPageIndex(0)
  }

  // Quick Kit Template application
  const applyTemplate = (template: CustomKitTemplate) => {
    if (!contents) return
    const allInventory = allSuppliesInventoryQuery.data?.inventory_items || []
    const current = [...contents.includedSupplies]

    let mappedCount = 0
    template.items.forEach((tmplItem) => {
      const match = allInventory.find(
        (inv) =>
          inv.id === tmplItem.inventory_item_id ||
          (tmplItem.sku &&
            inv.sku?.toLowerCase().includes(tmplItem.sku.toLowerCase())) ||
          (tmplItem.title &&
            inv.title?.toLowerCase().includes(tmplItem.title.toLowerCase())),
      )
      if (match) {
        mappedCount++
        const existingIdx = current.findIndex(
          (i) => i.inventory_item_id === match.id,
        )
        const component = {
          inventory_item_id: match.id,
          required_display_amount: String(tmplItem.quantity),
        }
        if (existingIdx >= 0) {
          current[existingIdx] = component
        } else {
          current.push(component)
        }
      }
    })

    updateGroup("includedSupplies", current)
    if (mappedCount > 0) {
      toast.success(
        `Applied "${template.name}" (${mappedCount} supplies mapped)`,
      )
    } else {
      toast.info(
        `Applied "${template.name}". Please ensure supplies exist in Inventory.`,
      )
    }
  }

  const complete = contents ? combinationComponentsAreComplete(contents) : false
  const missingProductVial =
    Boolean(contents?.scopes.finishedProduct) &&
    (contents?.finishedProduct.length || 0) === 0
  const totalCandidateCount = inventoryQuery.data?.count || 0
  const hasPreviousPage = pageIndex > 0
  const hasNextPage = (pageIndex + 1) * pageSize < totalCandidateCount

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            Inventory contents — {row?.title || "Combination"}
          </Drawer.Title>
          <Drawer.Description>
            Configure the physical inventory items required to assemble and ship
            this combination.
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-5 overflow-auto p-4">
          {target ? (
            <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <Text size="small" weight="plus">
                    Choose {classificationLabel[targetClassification!]}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Select items and set consumption quantities. Availability is
                    calculated after applying complete contents.
                  </Text>
                </div>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setTarget(null)
                    setSelectedBatch(new Map())
                  }}
                >
                  Back
                </Button>
              </div>

              <Input
                aria-label="Search inventory items"
                placeholder="Search inventory items by title or SKU..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPageIndex(0)
                }}
              />

              <div className="mt-3 flex flex-col divide-y divide-ui-border-base rounded-lg border border-ui-border-base bg-ui-bg-base">
                {sortedInventoryItems.map((item) => {
                  const profile = profileByInventoryId.get(item.id)
                  const isChecked = selectedBatch.has(item.id)
                  const currentQty = selectedBatch.get(item.id) || 1

                  const isRecommended = Boolean(
                    target?.group === "finishedProduct" &&
                      netContentMatch &&
                      ((item.title || "")
                        .toLowerCase()
                        .includes(netContentMatch.toLowerCase()) ||
                        (item.sku || "")
                          .toLowerCase()
                          .includes(netContentMatch.toLowerCase()) ||
                        (netContentMatch.match(/\d+(?:\.\d+)?/)?.[0] &&
                          ((item.title || "").toLowerCase().includes(
                            netContentMatch.match(/\d+(?:\.\d+)?/)![0],
                          ) ||
                            (item.sku || "").toLowerCase().includes(
                              netContentMatch.match(/\d+(?:\.\d+)?/)![0],
                            )))),
                  )

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-3 p-3 transition-colors ${
                        isChecked
                          ? "bg-ui-bg-subtle"
                          : "hover:bg-ui-bg-base-hover"
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleToggleBatchItem(
                              item.id,
                              Boolean(checked),
                              currentQty,
                            )
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Text
                              size="small"
                              weight="plus"
                              className="truncate"
                            >
                              {item.title || "Untitled inventory item"}
                            </Text>
                            {isRecommended && (
                              <Badge color="green" size="small">
                                ⭐ Recommended ({netContentMatch})
                              </Badge>
                            )}
                          </div>
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            {item.sku || "No SKU"} ·{" "}
                            {profile?.display_unit || "unit"}
                          </Text>
                        </div>
                      </label>

                      {/* Inline quantity stepper with presets */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-ui-fg-subtle font-medium">
                            Qty:
                          </span>
                          <button
                            type="button"
                            disabled={currentQty <= 1}
                            onClick={() =>
                              handleUpdateBatchQty(item.id, currentQty - 1)
                            }
                            className="size-6 flex items-center justify-center rounded border border-ui-border-base bg-white text-xs hover:bg-ui-bg-subtle disabled:opacity-40"
                          >
                            −
                          </button>
                          <Input
                            type="number"
                            min="1"
                            className="h-6 w-12 text-center text-xs font-semibold px-1"
                            value={currentQty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10)
                              handleUpdateBatchQty(
                                item.id,
                                isNaN(val) || val < 1 ? 1 : val,
                              )
                              if (!isChecked) {
                                handleToggleBatchItem(
                                  item.id,
                                  true,
                                  isNaN(val) || val < 1 ? 1 : val,
                                )
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateBatchQty(item.id, currentQty + 1)
                              if (!isChecked) {
                                handleToggleBatchItem(
                                  item.id,
                                  true,
                                  currentQty + 1,
                                )
                              }
                            }}
                            className="size-6 flex items-center justify-center rounded border border-ui-border-base bg-white text-xs hover:bg-ui-bg-subtle"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 5, 10, 20].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                handleUpdateBatchQty(item.id, preset)
                                if (!isChecked) {
                                  handleToggleBatchItem(item.id, true, preset)
                                }
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                currentQty === preset && isChecked
                                  ? "bg-zinc-900 text-white border-zinc-900"
                                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {!inventoryQuery.isLoading &&
                !inventoryQuery.data?.inventory_items.length ? (
                  <Text size="small" className="p-4 text-ui-fg-subtle">
                    {selectableProfileIds.length
                      ? "No matching inventory items."
                      : "Configure a matching component profile in Inventory first."}
                  </Text>
                ) : null}
              </div>

              {totalCandidateCount > pageSize ? (
                <div className="mt-3 flex items-center justify-between">
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Page {pageIndex + 1}
                  </Text>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={!hasPreviousPage}
                      onClick={() => setPageIndex((current) => current - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={!hasNextPage}
                      onClick={() => setPageIndex((current) => current + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Sticky Batch Action Bar */}
              <div className="sticky bottom-0 mt-4 flex items-center justify-between rounded-lg border border-ui-border-base bg-ui-bg-base p-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Badge color={selectedBatch.size > 0 ? "green" : "grey"}>
                    {selectedBatch.size} item
                    {selectedBatch.size === 1 ? "" : "s"} selected
                  </Badge>
                  {selectedBatch.size > 0 && (
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      (
                      {Array.from(selectedBatch.values()).reduce(
                        (a, b) => a + b,
                        0,
                      )}{" "}
                      total units)
                    </Text>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      setSelectedBatch(new Map())
                      setTarget(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    disabled={selectedBatch.size === 0}
                    onClick={applySelectedBatch}
                  >
                    Add Selected Items →
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {axes.length > 2 ? (
                <details className="rounded-lg border border-ui-border-base p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Advanced inventory mapping
                  </summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="finished-product-axis">
                        Finished product option
                      </Label>
                      <Select
                        value={
                          draft.finishedProductAxisId ||
                          inferredRoles.finishedProductAxisId ||
                          ""
                        }
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            finishedProductAxisId: value || "",
                          }))
                        }
                      >
                        <Select.Trigger id="finished-product-axis">
                          <Select.Value placeholder="Select option" />
                        </Select.Trigger>
                        <Select.Content>
                          {axes.map((axis) => (
                            <Select.Item key={axis.id} value={axis.id}>
                              {axis.name.trim() || "Unnamed option"}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="included-supply-axis">
                        Included item option
                      </Label>
                      <Select
                        value={
                          draft.includedSupplyAxisId ||
                          inferredRoles.includedSupplyAxisId ||
                          ""
                        }
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            includedSupplyAxisId: value || "",
                          }))
                        }
                      >
                        <Select.Trigger id="included-supply-axis">
                          <Select.Value placeholder="Select option" />
                        </Select.Trigger>
                        <Select.Content>
                          {axes.map((axis) => (
                            <Select.Item key={axis.id} value={axis.id}>
                              {axis.name.trim() || "Unnamed option"}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                  </div>
                </details>
              ) : null}

              <div className="rounded-lg border border-ui-border-base p-3">
                <div className="mb-3 flex flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    Finished product
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Required physical vial, bottle, tube, or other finished
                    item. Automatically shared by combinations with the same net
                    content.
                  </Text>
                </div>
                {contents?.scopes.finishedProduct ? (
                  <Text
                    size="xsmall"
                    className="mb-3 rounded-md bg-ui-bg-subtle px-2 py-1 text-ui-fg-subtle"
                  >
                    Used by{" "}
                    {contents.scopes.finishedProduct.sharedCombinationCount}{" "}
                    combination
                    {contents.scopes.finishedProduct.sharedCombinationCount ===
                    1
                      ? ""
                      : "s"}{" "}
                    with {contents.scopes.finishedProduct.axisLabel}:{" "}
                    {contents.scopes.finishedProduct.valueLabel}.
                  </Text>
                ) : null}
                <ComponentRows
                  components={contents?.finishedProduct || []}
                  inventoryById={inventoryById}
                  profileByInventoryId={profileByInventoryId}
                  availabilityComponents={availability?.components}
                  maximum={1}
                  addLabel="Choose finished product"
                  onChoose={(componentIndex) =>
                    setTarget({ group: "finishedProduct", componentIndex })
                  }
                  onChange={(components) =>
                    updateGroup("finishedProduct", components)
                  }
                />
              </div>

              <div className="rounded-lg border border-ui-border-base p-3">
                <div className="mb-3 flex flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    Included items
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    Optional supplies automatically shared by combinations with
                    the same inclusion.
                  </Text>
                </div>

                {/* Quick Kit Templates Section */}
                <div className="mb-3 rounded-lg border border-dashed border-ui-border-base bg-ui-bg-subtle p-2.5">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">⚡</span>
                      <Text
                        size="xsmall"
                        weight="plus"
                        className="text-ui-fg-muted uppercase tracking-wider text-[10px]"
                      >
                        Quick Inclusion Templates
                      </Text>
                    </div>
                    <Button
                      size="small"
                      variant="transparent"
                      onClick={() => setTemplateModalOpen(true)}
                      className="text-xs text-ui-fg-interactive hover:underline p-0 h-auto font-medium"
                    >
                      + Create New Kit Template
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {savedTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="group relative inline-flex items-center"
                      >
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => applyTemplate(template)}
                          className="text-xs font-medium py-1 px-2.5 h-auto bg-white border border-ui-border-base hover:bg-ui-bg-subtle shadow-2xs"
                        >
                          ⚡ {template.name} ({template.items.length} items)
                        </Button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTemplate(template.id)
                          }}
                          className="ml-1 text-ui-fg-muted opacity-0 group-hover:opacity-100 hover:text-ui-fg-error transition-opacity text-xs"
                          title="Delete template"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {!savedTemplates.length && (
                      <Text size="xsmall" className="text-ui-fg-subtle italic">
                        No templates saved yet. Click "+ Create New Kit Template"
                        to save reusable supply bundles.
                      </Text>
                    )}
                  </div>
                </div>

                {contents?.scopes.includedSupply ? (
                  <Text
                    size="xsmall"
                    className="mb-3 rounded-md bg-ui-bg-subtle px-2 py-1 text-ui-fg-subtle"
                  >
                    Used by{" "}
                    {contents.scopes.includedSupply.sharedCombinationCount}{" "}
                    combination
                    {contents.scopes.includedSupply.sharedCombinationCount === 1
                      ? ""
                      : "s"}{" "}
                    with {contents.scopes.includedSupply.axisLabel}:{" "}
                    {contents.scopes.includedSupply.valueLabel}.
                  </Text>
                ) : null}
                <ComponentRows
                  components={contents?.includedSupplies || []}
                  inventoryById={inventoryById}
                  profileByInventoryId={profileByInventoryId}
                  availabilityComponents={availability?.components}
                  addLabel="Add included item"
                  onChoose={(componentIndex) =>
                    setTarget({ group: "includedSupplies", componentIndex })
                  }
                  onChange={(components) =>
                    updateGroup("includedSupplies", components)
                  }
                />
              </div>

              <div className="rounded-lg border border-ui-border-base p-3">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-y-1">
                    <Text size="small" weight="plus">
                      Packaging
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      Shared automatically across every sellable combination.
                    </Text>
                  </div>
                  <Badge color="blue">All combinations</Badge>
                </div>
                <ComponentRows
                  components={contents?.packaging || []}
                  inventoryById={inventoryById}
                  profileByInventoryId={profileByInventoryId}
                  availabilityComponents={availability?.components}
                  addLabel="Add packaging"
                  onChoose={(componentIndex) =>
                    setTarget({ group: "packaging", componentIndex })
                  }
                  onChange={(components) =>
                    updateGroup("packaging", components)
                  }
                />
              </div>

              <div className="rounded-lg border border-ui-border-base p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={complete ? "green" : "orange"}>
                    {complete ? "Complete" : "Needs inventory setup"}
                  </Badge>
                  <Text size="small" className="text-ui-fg-subtle">
                    {stockLocationName || "No stock location selected"}
                  </Text>
                </div>
                {!complete ? (
                  <Text size="small" className="mt-2 text-ui-fg-error">
                    {missingProductVial
                      ? "A finished product still needs to be selected."
                      : "Check that every quantity is greater than zero."}
                  </Text>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Text size="small">
                      Calculated stock: {availability?.calculated_stock ?? "—"}
                    </Text>
                    <Text size="small">
                      Limiting component:{" "}
                      {availability?.limiting_components.length
                        ? availability.limiting_components
                            .map((component) => component.inventory_item_title)
                            .join(", ")
                        : "—"}
                    </Text>
                  </div>
                )}
              </div>
            </>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              Cancel
            </Button>
          </Drawer.Close>
          <Button
            size="small"
            disabled={Boolean(target)}
            onClick={() => {
              onSave(draft)
              onOpenChange(false)
            }}
          >
            Apply contents
          </Button>
        </Drawer.Footer>
      </Drawer.Content>

      <CustomKitTemplateModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        inventoryItems={allSuppliesInventoryQuery.data?.inventory_items || []}
        onSaveTemplate={saveTemplate}
      />
    </Drawer>
  )
}

export default CombinationInventoryDrawer
