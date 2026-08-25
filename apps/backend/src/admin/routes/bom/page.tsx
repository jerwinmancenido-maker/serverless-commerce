import { defineRouteConfig } from "@medusajs/admin-sdk"
import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Container,
  createDataTableColumnHelper,
  DataTable,
  type DataTablePaginationState,
  Heading,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import { ComponentProfileDrawer } from "./component-profile-drawer"
import { RecipeHistoryDrawer } from "./recipe-history-drawer"
import type { ComponentProfile, ComponentProfilesResponse } from "./types"

const PAGE_SIZE = 20
const inventoryColumnHelper =
  createDataTableColumnHelper<HttpTypes.AdminInventoryItem>()
const variantColumnHelper =
  createDataTableColumnHelper<HttpTypes.AdminProductVariant>()

function profileMap(profiles: ComponentProfile[]) {
  return new Map(profiles.map((profile) => [profile.inventory_item_id, profile]))
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
                {profile.category}
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
    ],
    [],
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
            Select an inventory item to configure units, category, thresholds,
            and tracking requirements.
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
        <div className="px-6 py-4">
          <Heading>Recipe history</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Select a product variant to inspect its immutable BOM snapshots.
          </Text>
        </div>
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
