import { defineRouteConfig } from "@medusajs/admin-sdk"
import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Container,
  createDataTableColumnHelper,
  DataTable,
  type DataTablePaginationState,
  Heading,
  Select,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import { ComponentProfileDrawer } from "./component-profile-drawer"
import { RecipeHistoryDrawer } from "./recipe-history-drawer"
import type {
  BomAvailabilityResponse,
  ComponentProfile,
  ComponentProfilesResponse,
} from "./types"

const PAGE_SIZE = 20
const inventoryColumnHelper =
  createDataTableColumnHelper<HttpTypes.AdminInventoryItem>()
const variantColumnHelper =
  createDataTableColumnHelper<HttpTypes.AdminProductVariant>()

function profileMap(profiles: ComponentProfile[]) {
  return new Map(profiles.map((profile) => [profile.inventory_item_id, profile]))
}

const classificationLabels: Record<
  ComponentProfile["classification"],
  string
> = {
  finished_product: "Finished product",
  included_supply: "Included supply",
  packaging: "Packaging",
}

const inventoryUnitLabels: Record<ComponentProfile["base_unit"], string> = {
  microgram: "mcg",
  microliter: "µL",
  piece: "pieces",
}

const BomPage = () => {
  const [inventoryPagination, setInventoryPagination] =
    useState<DataTablePaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE })
  const [inventorySearch, setInventorySearch] = useState("")
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<HttpTypes.AdminInventoryItem | null>(null)
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)

  const [variantPagination, setVariantPagination] =
    useState<DataTablePaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE })
  const [variantSearch, setVariantSearch] = useState("")
  const [selectedVariant, setSelectedVariant] =
    useState<HttpTypes.AdminProductVariant | null>(null)
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState("")

  const profilesQuery = useQuery({
    queryKey: ["bom-component-profiles"],
    queryFn: () =>
      sdk.client.fetch<ComponentProfilesResponse>(
        "/admin/bom/component-profiles",
      ),
  })
  const profilesByInventoryItem = useMemo(
    () => profileMap(profilesQuery.data?.component_profiles || []),
    [profilesQuery.data?.component_profiles],
  )

  const inventoryQuery = useQuery({
    queryKey: [
      "bom-inventory-items",
      inventoryPagination,
      inventorySearch,
    ],
    queryFn: () =>
      sdk.admin.inventoryItem.list({
        limit: inventoryPagination.pageSize,
        offset: inventoryPagination.pageIndex * inventoryPagination.pageSize,
        q: inventorySearch || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const inventoryColumns = useMemo(
    () => [
      inventoryColumnHelper.accessor("title", {
        header: "Inventory item",
        cell: ({ getValue }) => getValue() || "Untitled item",
      }),
      inventoryColumnHelper.accessor("sku", {
        header: "SKU",
        cell: ({ getValue }) => getValue() || "—",
      }),
      inventoryColumnHelper.display({
        id: "profile",
        header: "Component profile",
        cell: ({ row }) => {
          const profile = profilesByInventoryItem.get(row.original.id)

          return profile ? (
            <div className="flex items-center gap-2">
              <Badge color="green">Configured</Badge>
              <Text className="text-ui-fg-subtle" size="small">
                {classificationLabels[profile.classification]}
              </Text>
            </div>
          ) : (
            <Badge color="grey">Not configured</Badge>
          )
        },
      }),
      inventoryColumnHelper.display({
        id: "unit",
        header: "Display unit",
        cell: ({ row }) =>
          profilesByInventoryItem.get(row.original.id)?.display_unit || "—",
      }),
      inventoryColumnHelper.display({
        id: "receiving",
        header: "Receiving unit",
        cell: ({ row }) => {
          const profile = profilesByInventoryItem.get(row.original.id)

          return profile
            ? `1 ${profile.supplier_unit} = ${profile.inventory_units_per_supplier_unit} ${inventoryUnitLabels[profile.base_unit]}`
            : "—"
        },
      }),
    ],
    [profilesByInventoryItem],
  )

  const inventoryTable = useDataTable({
    data: inventoryQuery.data?.inventory_items || [],
    columns: inventoryColumns,
    getRowId: (row) => row.id,
    rowCount: inventoryQuery.data?.count || 0,
    isLoading: inventoryQuery.isLoading,
    pagination: {
      state: inventoryPagination,
      onPaginationChange: setInventoryPagination,
    },
    search: {
      state: inventorySearch,
      onSearchChange: setInventorySearch,
    },
    onRowClick: (_event, row) => {
      setSelectedInventoryItem(row)
      setProfileDrawerOpen(true)
    },
  })

  const variantsQuery = useQuery({
    queryKey: ["bom-product-variants", variantPagination, variantSearch],
    queryFn: () =>
      sdk.admin.productVariant.list({
        limit: variantPagination.pageSize,
        offset: variantPagination.pageIndex * variantPagination.pageSize,
        q: variantSearch || undefined,
        fields: "id,title,sku,*product",
      }),
    placeholderData: keepPreviousData,
  })
  const stockLocationsQuery = useQuery({
    queryKey: ["bom-stock-locations"],
    queryFn: () => sdk.admin.stockLocation.list({ limit: 100 }),
  })
  const stockLocations = useMemo(
    () => stockLocationsQuery.data?.stock_locations || [],
    [stockLocationsQuery.data?.stock_locations],
  )

  useEffect(() => {
    if (!stockLocationsQuery.data) {
      return
    }

    const selectionStillExists = stockLocations.some(
      (location) => location.id === selectedLocationId,
    )

    if (!selectionStillExists) {
      setSelectedLocationId(stockLocations[0]?.id || "")
    }
  }, [selectedLocationId, stockLocations, stockLocationsQuery.data])

  const visibleVariantIds = useMemo(
    () => (variantsQuery.data?.variants || []).map((variant) => variant.id),
    [variantsQuery.data?.variants],
  )
  const visibleVariantIdKey = visibleVariantIds.join(",")
  const availabilityQuery = useQuery({
    queryKey: [
      "bom-location-availability",
      selectedLocationId,
      visibleVariantIdKey,
    ],
    queryFn: () =>
      sdk.client.fetch<BomAvailabilityResponse>("/admin/bom/availability", {
        query: {
          location_id: selectedLocationId,
          variant_ids: visibleVariantIdKey,
        },
      }),
    enabled: Boolean(selectedLocationId && visibleVariantIds.length),
  })
  const availabilityByVariantId = useMemo(
    () =>
      new Map(
        (availabilityQuery.data?.variants || []).map((availability) => [
          availability.variant_id,
          availability,
        ]),
      ),
    [availabilityQuery.data?.variants],
  )

  const variantColumns = useMemo(
    () => [
      variantColumnHelper.accessor("title", {
        header: "Variant",
        cell: ({ getValue }) => getValue() || "Untitled variant",
      }),
      variantColumnHelper.accessor("sku", {
        header: "SKU",
        cell: ({ getValue }) => getValue() || "—",
      }),
      variantColumnHelper.display({
        id: "product",
        header: "Product",
        cell: ({ row }) => row.original.product?.title || "—",
      }),
      variantColumnHelper.display({
        id: "calculated_stock",
        header: "Calculated stock",
        cell: ({ row }) => {
          if (!selectedLocationId) {
            return "—"
          }

          if (availabilityQuery.isLoading) {
            return (
              <Text className="text-ui-fg-subtle" size="small">
                Calculating…
              </Text>
            )
          }

          const availability = availabilityByVariantId.get(row.original.id)

          if (!availability || availability.status === "missing_recipe") {
            return <Badge color="grey">No recipe</Badge>
          }

          return (
            <Text size="small" weight="plus">
              {availability.calculated_stock}
            </Text>
          )
        },
      }),
      variantColumnHelper.display({
        id: "limiting_component",
        header: "Limiting component",
        cell: ({ row }) => {
          if (availabilityQuery.isError) {
            return (
              <Text className="text-ui-fg-error" size="small">
                Unavailable
              </Text>
            )
          }

          const availability = availabilityByVariantId.get(row.original.id)

          if (!availability || availability.status === "missing_recipe") {
            return "—"
          }

          return (
            <Text className="text-ui-fg-subtle" size="small">
              {availability.limiting_components
                .map((component) => component.inventory_item_title)
                .join(", ") || "—"}
            </Text>
          )
        },
      }),
    ],
    [
      availabilityByVariantId,
      availabilityQuery.isError,
      availabilityQuery.isLoading,
      selectedLocationId,
    ],
  )

  const variantTable = useDataTable({
    data: variantsQuery.data?.variants || [],
    columns: variantColumns,
    getRowId: (row) => row.id,
    rowCount: variantsQuery.data?.count || 0,
    isLoading: variantsQuery.isLoading,
    pagination: {
      state: variantPagination,
      onPaginationChange: setVariantPagination,
    },
    search: {
      state: variantSearch,
      onSearchChange: setVariantSearch,
    },
    onRowClick: (_event, row) => {
      setSelectedVariant(row)
      setHistoryDrawerOpen(true)
    },
  })

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading>BOM component profiles</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Configure classification, supplier conversion, units, thresholds,
            and tracking requirements. Stock remains in Medusa Inventory at the
            shared stock location.
          </Text>
        </div>
        {profilesQuery.isError ? (
          <Text className="text-ui-fg-error px-6 py-4">
            Component profiles could not be loaded.
          </Text>
        ) : null}
        <DataTable instance={inventoryTable}>
          <DataTable.Toolbar>
            <DataTable.Search placeholder="Search inventory items" />
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </Container>

      <Container className="divide-y p-0">
        <div className="flex items-end justify-between gap-4 px-6 py-4">
          <div>
            <Heading>Recipe availability</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Calculated stock is the lowest whole-recipe capacity after
              subtracting reservations at the selected location. Select a row
              to inspect its immutable recipe history.
            </Text>
          </div>
          <div className="w-full max-w-64">
            <Text size="small" leading="compact" weight="plus">
              Stock location
            </Text>
            <Select
              value={selectedLocationId || undefined}
              onValueChange={setSelectedLocationId}
              disabled={stockLocationsQuery.isLoading || !stockLocations.length}
            >
              <Select.Trigger>
                <Select.Value
                  placeholder={
                    stockLocationsQuery.isLoading
                      ? "Loading locations…"
                      : "No stock location"
                  }
                />
              </Select.Trigger>
              <Select.Content>
                {stockLocations.map((location) => (
                  <Select.Item key={location.id} value={location.id}>
                    {location.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
        {availabilityQuery.isError ? (
          <Text className="text-ui-fg-error px-6 py-4" size="small">
            Calculated stock could not be loaded for this location.
          </Text>
        ) : null}
        <DataTable instance={variantTable}>
          <DataTable.Toolbar>
            <DataTable.Search placeholder="Search product variants" />
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </Container>

      <ComponentProfileDrawer
        inventoryItem={selectedInventoryItem}
        profile={
          selectedInventoryItem
            ? profilesByInventoryItem.get(selectedInventoryItem.id)
            : undefined
        }
        open={profileDrawerOpen}
        onOpenChange={setProfileDrawerOpen}
      />
      <RecipeHistoryDrawer
        variant={selectedVariant}
        open={historyDrawerOpen}
        onOpenChange={setHistoryDrawerOpen}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "BOM Inventory",
})

export default BomPage
