import { Trash } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Button,
  createDataTableColumnHelper,
  DataTable,
  FocusModal,
  IconButton,
  Input,
  Label,
  Select,
  Text,
  type DataTablePaginationState,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import type {
  ComponentProfile,
  ComponentProfilesResponse,
  RecipeRuleComponent,
} from "./types"
import type { DirectVariationAxis } from "./direct-variation-snapshot"
import type { DirectRecipeConfiguration } from "./direct-recipe-rules"

type Classification = ComponentProfile["classification"]

type ComponentTarget =
  | {
      scope: "finished_product"
      valueId: string
      componentIndex: number | null
    }
  | {
      scope: "included_supply"
      valueId: string
      componentIndex: number | null
    }
  | {
      scope: "common_packaging"
      componentIndex: number | null
    }

const classificationByTarget: Record<ComponentTarget["scope"], Classification> = {
  finished_product: "finished_product",
  included_supply: "included_supply",
  common_packaging: "packaging",
}

const classificationLabel: Record<Classification, string> = {
  finished_product: "Finished product",
  included_supply: "Included supply",
  packaging: "Packaging",
}

const inventoryColumnHelper =
  createDataTableColumnHelper<HttpTypes.AdminInventoryItem>()

const componentList = (input: {
  configuration: DirectRecipeConfiguration
  target: ComponentTarget
}) => {
  if (input.target.scope === "finished_product") {
    return input.configuration.finishedProductByValueId[input.target.valueId] || []
  }

  if (input.target.scope === "included_supply") {
    return input.configuration.includedSupplyByValueId[input.target.valueId] || []
  }

  return input.configuration.commonPackaging
}

const updateComponentList = (input: {
  configuration: DirectRecipeConfiguration
  target: ComponentTarget
  components: RecipeRuleComponent[]
}): DirectRecipeConfiguration => {
  if (input.target.scope === "finished_product") {
    return {
      ...input.configuration,
      finishedProductByValueId: {
        ...input.configuration.finishedProductByValueId,
        [input.target.valueId]: input.components.slice(0, 1),
      },
    }
  }

  if (input.target.scope === "included_supply") {
    return {
      ...input.configuration,
      includedSupplyByValueId: {
        ...input.configuration.includedSupplyByValueId,
        [input.target.valueId]: input.components,
      },
    }
  }

  return {
    ...input.configuration,
    commonPackaging: input.components,
  }
}

const RecipeComponentRows = ({
  components,
  inventoryById,
  onChoose,
  onAmountChange,
  onRemove,
  addLabel,
  maximum,
}: {
  components: RecipeRuleComponent[]
  inventoryById: Map<string, HttpTypes.AdminInventoryItem>
  onChoose: (componentIndex: number | null) => void
  onAmountChange: (componentIndex: number, amount: string) => void
  onRemove: (componentIndex: number) => void
  addLabel: string
  maximum?: number
}) => (
  <div className="flex flex-col gap-y-2">
    {components.map((component, componentIndex) => {
      const inventoryItem = inventoryById.get(component.inventory_item_id)

      return (
        <div
          key={`${component.inventory_item_id}-${componentIndex}`}
          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_auto]"
        >
          <Button
            size="small"
            variant="secondary"
            className="justify-start overflow-hidden"
            onClick={() => onChoose(componentIndex)}
          >
            <span className="truncate">
              {inventoryItem?.title || component.inventory_item_id}
            </span>
          </Button>
          <Input
            aria-label={`Required amount for ${inventoryItem?.title || component.inventory_item_id}`}
            value={component.required_display_amount}
            inputMode="decimal"
            placeholder="Amount"
            onChange={(event) =>
              onAmountChange(componentIndex, event.target.value)
            }
          />
          <IconButton
            size="small"
            variant="transparent"
            aria-label={`Remove ${inventoryItem?.title || "component"}`}
            onClick={() => onRemove(componentIndex)}
          >
            <Trash />
          </IconButton>
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

export const InventoryRecipeBuilder = ({
  axes,
  configuration,
  onChange,
}: {
  axes: DirectVariationAxis[]
  configuration: DirectRecipeConfiguration
  onChange: (configuration: DirectRecipeConfiguration) => void
}) => {
  const [target, setTarget] = useState<ComponentTarget | null>(null)
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [search, setSearch] = useState("")

  const profilesQuery = useQuery({
    queryKey: ["bom-component-profiles", "product-recipe-builder"],
    queryFn: () =>
      sdk.client.fetch<ComponentProfilesResponse>(
        "/admin/bom/component-profiles",
      ),
  })
  const profiles = profilesQuery.data?.component_profiles || []
  const selectedInventoryIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...Object.values(configuration.finishedProductByValueId).flat(),
          ...Object.values(configuration.includedSupplyByValueId).flat(),
          ...configuration.commonPackaging,
        ].map((component) => component.inventory_item_id)),
      ),
    [configuration],
  )
  const selectedInventoryQuery = useQuery({
    queryKey: ["inventory-items", "product-recipe-display", selectedInventoryIds],
    enabled: selectedInventoryIds.length > 0,
    queryFn: () =>
      sdk.admin.inventoryItem.list({
        id: selectedInventoryIds,
        limit: selectedInventoryIds.length,
      }),
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
    ? classificationByTarget[target.scope]
    : null
  const selectableProfileIds = useMemo(
    () =>
      profiles
        .filter((profile) => profile.classification === targetClassification)
        .map((profile) => profile.inventory_item_id),
    [profiles, targetClassification],
  )
  const inventoryQuery = useQuery({
    queryKey: [
      "inventory-items",
      "product-recipe-selector",
      targetClassification,
      pagination,
      search,
      selectableProfileIds,
    ],
    enabled: Boolean(target && selectableProfileIds.length),
    queryFn: () =>
      sdk.admin.inventoryItem.list({
        id: selectableProfileIds,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        q: search || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const selectInventoryItem = (inventoryItemId: string) => {
    if (!target) return

    const current = componentList({ configuration, target })
    const next = [...current]
    const component = {
      inventory_item_id: inventoryItemId,
      required_display_amount: "1",
    }

    if (target.componentIndex === null) {
      if (!current.some((item) => item.inventory_item_id === inventoryItemId)) {
        next.push(component)
      }
    } else {
      next[target.componentIndex] = component
    }

    onChange(updateComponentList({ configuration, target, components: next }))
    setTarget(null)
  }

  const inventoryColumns = useMemo(
    () => [
      inventoryColumnHelper.accessor("title", {
        header: "Inventory item",
        cell: ({ getValue }) => getValue() || "Untitled inventory item",
      }),
      inventoryColumnHelper.accessor("sku", {
        header: "SKU",
        cell: ({ getValue }) => getValue() || "—",
      }),
    ],
    [],
  )
  const inventoryTable = useDataTable({
    data: inventoryQuery.data?.inventory_items || [],
    columns: inventoryColumns,
    getRowId: (row) => row.id,
    rowCount: inventoryQuery.data?.count || 0,
    isLoading: inventoryQuery.isLoading || profilesQuery.isLoading,
    search: { state: search, onSearchChange: setSearch },
    pagination: { state: pagination, onPaginationChange: setPagination },
    onRowClick: (_event, row) => selectInventoryItem(row.id),
  })

  const renderValueRecipes = (input: {
    axisId: string
    scope: "finished_product" | "included_supply"
  }) => {
    const axis = axes.find((item) => item.id === input.axisId)

    if (!axis) return null

    return (
      <div className="flex flex-col divide-y divide-ui-border-base rounded-lg border border-ui-border-base">
        {axis.values
          .filter((value) => value.label.trim())
          .map((value) => {
            const components =
              input.scope === "finished_product"
                ? configuration.finishedProductByValueId[value.id] || []
                : configuration.includedSupplyByValueId[value.id] || []
            const targetForValue: ComponentTarget = {
              scope: input.scope,
              valueId: value.id,
              componentIndex: null,
            }

            return (
              <div key={value.id} className="grid gap-3 p-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                <div className="flex flex-col gap-y-1">
                  <Text size="small" leading="compact" weight="plus">
                    {value.label}
                  </Text>
                  <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                    {input.scope === "finished_product"
                      ? "One received finished item"
                      : components.length
                        ? "Supplies included with this option"
                        : "No extra supplies"}
                  </Text>
                </div>
                <RecipeComponentRows
                  components={components}
                  inventoryById={inventoryById}
                  maximum={input.scope === "finished_product" ? 1 : undefined}
                  addLabel={
                    input.scope === "finished_product"
                      ? "Choose finished item"
                      : "Add included supply"
                  }
                  onChoose={(componentIndex) =>
                    setTarget({ ...targetForValue, componentIndex })
                  }
                  onAmountChange={(componentIndex, amount) => {
                    const next = components.map((component, index) =>
                      index === componentIndex
                        ? { ...component, required_display_amount: amount }
                        : component,
                    )
                    onChange(
                      updateComponentList({
                        configuration,
                        target: targetForValue,
                        components: next,
                      }),
                    )
                  }}
                  onRemove={(componentIndex) =>
                    onChange(
                      updateComponentList({
                        configuration,
                        target: targetForValue,
                        components: components.filter(
                          (_component, index) => index !== componentIndex,
                        ),
                      }),
                    )
                  }
                />
              </div>
            )
          })}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-y-2">
          <Label>Finished-product variation</Label>
          <Select
            value={configuration.finishedProductAxisId || "none"}
            onValueChange={(value) =>
              onChange({
                ...configuration,
                finishedProductAxisId: value === "none" ? "" : value,
              })
            }
          >
            <Select.Trigger>
              <Select.Value placeholder="Choose the net-content variation" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="none">Not configured</Select.Item>
              {axes.map((axis) => (
                <Select.Item key={axis.id} value={axis.id}>
                  {axis.name.trim() || "Unnamed variation"}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
            Map each value to the shared finished item received into inventory.
          </Text>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Included-supplies variation</Label>
          <Select
            value={configuration.includedSupplyAxisId || "none"}
            onValueChange={(value) =>
              onChange({
                ...configuration,
                includedSupplyAxisId: value === "none" ? "" : value,
              })
            }
          >
            <Select.Trigger>
              <Select.Value placeholder="Choose the inclusion variation" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="none">Not configured</Select.Item>
              {axes.map((axis) => (
                <Select.Item key={axis.id} value={axis.id}>
                  {axis.name.trim() || "Unnamed variation"}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
            A blank option intentionally means that no extra supply is included.
          </Text>
        </div>
      </div>

      {configuration.finishedProductAxisId ? (
        <div className="mt-4 flex flex-col gap-y-2">
          <Text size="small" weight="plus">Finished products</Text>
          {renderValueRecipes({
            axisId: configuration.finishedProductAxisId,
            scope: "finished_product",
          })}
        </div>
      ) : null}

      {configuration.includedSupplyAxisId ? (
        <div className="mt-4 flex flex-col gap-y-2">
          <Text size="small" weight="plus">Included supplies</Text>
          {renderValueRecipes({
            axisId: configuration.includedSupplyAxisId,
            scope: "included_supply",
          })}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-y-2">
        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">Common packaging</Text>
          <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
            Packaging consumed by every sellable combination.
          </Text>
        </div>
        <RecipeComponentRows
          components={configuration.commonPackaging}
          inventoryById={inventoryById}
          addLabel="Add packaging"
          onChoose={(componentIndex) =>
            setTarget({ scope: "common_packaging", componentIndex })
          }
          onAmountChange={(componentIndex, amount) =>
            onChange({
              ...configuration,
              commonPackaging: configuration.commonPackaging.map(
                (component, index) =>
                  index === componentIndex
                    ? { ...component, required_display_amount: amount }
                    : component,
              ),
            })
          }
          onRemove={(componentIndex) =>
            onChange({
              ...configuration,
              commonPackaging: configuration.commonPackaging.filter(
                (_component, index) => index !== componentIndex,
              ),
            })
          }
        />
      </div>

      <FocusModal
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
      >
        <FocusModal.Content>
          <div className="flex h-full flex-col overflow-hidden">
            <FocusModal.Header>
              <div className="flex flex-col gap-y-1">
                <Text size="small" weight="plus">Choose inventory component</Text>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {targetClassification
                    ? classificationLabel[targetClassification]
                    : "Configured component"}
                </Text>
              </div>
            </FocusModal.Header>
            <FocusModal.Body className="flex-1 overflow-auto">
              <div className="mx-auto w-full max-w-4xl py-6">
                {selectableProfileIds.length ? (
                  <DataTable instance={inventoryTable}>
                    <DataTable.Toolbar>
                      <DataTable.Search placeholder="Search inventory items" />
                    </DataTable.Toolbar>
                    <DataTable.Table />
                    <DataTable.Pagination />
                  </DataTable>
                ) : profilesQuery.isLoading ? null : (
                  <div className="rounded-lg border border-ui-border-base p-6 text-center">
                    <Text size="small" className="text-ui-fg-subtle">
                      Configure a {targetClassification
                        ? classificationLabel[targetClassification].toLowerCase()
                        : "component"} profile in BOM Inventory first.
                    </Text>
                  </div>
                )}
              </div>
            </FocusModal.Body>
            <FocusModal.Footer>
              <FocusModal.Close asChild>
                <Button size="small" variant="secondary">Cancel</Button>
              </FocusModal.Close>
            </FocusModal.Footer>
          </div>
        </FocusModal.Content>
      </FocusModal>
    </>
  )
}
