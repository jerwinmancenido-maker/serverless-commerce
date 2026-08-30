import { Trash } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Button,
  Drawer,
  IconButton,
  Input,
  Label,
  Select,
  Text,
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

      return (
        <div
          key={`${component.inventory_item_id}-${index}`}
          className="rounded-lg border border-ui-border-base p-3"
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
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_8rem] items-end gap-2">
            <Text size="xsmall" className="text-ui-fg-subtle">
              {profile
                ? classificationLabel[profile.classification]
                : "Inventory item"}
            </Text>
            <div>
              <Text size="xsmall" className="mb-1 text-ui-fg-subtle">
                Quantity
              </Text>
              <Input
                aria-label={`Required amount for ${item?.title || component.inventory_item_id}`}
                inputMode="decimal"
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

  useEffect(() => {
    if (open) {
      setDraft(cloneConfiguration(inferredConfiguration))
      setTarget(null)
      setSearch("")
      setPageIndex(0)
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

  const selectInventoryItem = (inventoryItemId: string) => {
    if (!target || !contents) return

    const current =
      target.group === "finishedProduct"
        ? contents.finishedProduct
        : target.group === "includedSupplies"
          ? contents.includedSupplies
          : contents.packaging
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

    updateGroup(target.group, next)
    setTarget(null)
    setSearch("")
    setPageIndex(0)
  }

  const complete = contents ? combinationComponentsAreComplete(contents) : false
  const missingProductVial = !contents?.finishedProduct.length
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
            Choose what this combination consumes. Warehouse stock is not
            changed until an order is processed.
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
                    Search classified Medusa Inventory items. Availability is
                    calculated after you apply complete contents.
                  </Text>
                </div>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setTarget(null)}
                >
                  Back
                </Button>
              </div>
              <Input
                aria-label="Search inventory items"
                placeholder="Search inventory items"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPageIndex(0)
                }}
              />
              <div className="mt-3 flex flex-col divide-y divide-ui-border-base rounded-lg border border-ui-border-base bg-ui-bg-base">
                {(inventoryQuery.data?.inventory_items || []).map((item) => {
                  const profile = profileByInventoryId.get(item.id)

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="flex items-center justify-between gap-3 p-3 text-left hover:bg-ui-bg-base-hover"
                      onClick={() => selectInventoryItem(item.id)}
                    >
                      <span className="min-w-0">
                        <Text size="small" weight="plus" className="truncate">
                          {item.title || "Untitled inventory item"}
                        </Text>
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          {item.sku || "No SKU"} ·{" "}
                          {profile?.display_unit || "unit"}
                        </Text>
                      </span>
                      <Badge>
                        {classificationLabel[targetClassification!]}
                      </Badge>
                    </button>
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
            </div>
          ) : (
            <>
              {inferredRoles.needsManualReview ? (
                <details className="rounded-lg border border-ui-border-base p-3">
                  <summary className="cursor-pointer text-ui-fg-base">
                    Advanced inventory mapping
                  </summary>
                  <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
                    Choose which product option identifies the vial and which
                    identifies optional included items.
                  </Text>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-y-1">
                      <Label>Finished product grouped by</Label>
                      <Select
                        value={draft.finishedProductAxisId || "none"}
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            finishedProductAxisId:
                              value === "none" ? "" : value,
                          }))
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Choose product option" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="none">Not configured</Select.Item>
                          {axes.map((axis) => (
                            <Select.Item key={axis.id} value={axis.id}>
                              {axis.name.trim() || "Unnamed option"}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <Label>Included items grouped by</Label>
                      <Select
                        value={draft.includedSupplyAxisId || "none"}
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            includedSupplyAxisId: value === "none" ? "" : value,
                          }))
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Choose product option" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="none">Not configured</Select.Item>
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
                    with {contents.scopes.finishedProduct.axisLabel}: {" "}
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
                    with {contents.scopes.includedSupply.axisLabel}: {" "}
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
    </Drawer>
  )
}
