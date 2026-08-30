import {
  Badge,
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  type DataTablePaginationState,
  Heading,
  Select,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { sdk } from "../../lib/sdk"
import type {
  BuildableProductRow,
  BuildableProductsResponse,
} from "../bom/types"

const PAGE_SIZE = 20
const columnHelper = createDataTableColumnHelper<BuildableProductRow>()

const BuildableProductsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [search, setSearch] = useState("")
  const [selectedLocationId, setSelectedLocationId] = useState("")
  const locationsQuery = useQuery({
    queryKey: ["buildable-products", "stock-locations"],
    queryFn: () => sdk.admin.stockLocation.list({ limit: 100 }),
  })
  const locations = useMemo(
    () => locationsQuery.data?.stock_locations || [],
    [locationsQuery.data?.stock_locations],
  )

  useEffect(() => {
    if (!locationsQuery.data) return

    if (!locations.some((location) => location.id === selectedLocationId)) {
      setSelectedLocationId(locations[0]?.id || "")
    }
  }, [locations, locationsQuery.data, selectedLocationId])

  const reportQuery = useQuery({
    queryKey: [
      "buildable-products",
      "report",
      selectedLocationId,
      pagination,
      search,
    ],
    queryFn: () =>
      sdk.client.fetch<BuildableProductsResponse>(
        "/admin/bom/buildable-products",
        {
          query: {
            location_id: selectedLocationId,
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
            q: search || undefined,
          },
        },
      ),
    enabled: Boolean(selectedLocationId),
  })

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "product_variant",
        header: "Product and variant",
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-0.5 py-1">
            {row.original.product_id ? (
              <Link
                className="w-fit font-medium hover:text-ui-fg-interactive"
                to={`/products/${row.original.product_id}`}
              >
                {row.original.product_title}
              </Link>
            ) : (
              <Text size="small" weight="plus">
                {row.original.product_title}
              </Text>
            )}
            {row.original.product_id ? (
              <Link
                className="text-ui-fg-interactive w-fit hover:underline"
                to={`/products/${row.original.product_id}/variants/${row.original.variant_id}`}
              >
                {row.original.variant_title}
              </Link>
            ) : (
              <Text size="small">{row.original.variant_title}</Text>
            )}
            <Text
              size="xsmall"
              leading="compact"
              className="text-ui-fg-subtle break-all"
            >
              {row.original.sku || "No SKU"}
            </Text>
          </div>
        ),
      }),
      columnHelper.accessor("recipe_status", {
        header: "Recipe",
        cell: ({ getValue }) =>
          getValue() === "configured" ? (
            <Badge color="green">Complete</Badge>
          ) : (
            <Badge color="orange">Incomplete</Badge>
          ),
      }),
      columnHelper.accessor("calculated_stock", {
        header: "Calculated stock",
        cell: ({ row, getValue }) =>
          row.original.recipe_status === "missing_recipe" ? (
            <Text size="small" className="text-ui-fg-subtle">
              Unavailable
            </Text>
          ) : (
            <Text size="small" weight="plus" className="tabular-nums">
              {getValue() ?? 0}
            </Text>
          ),
      }),
      columnHelper.display({
        id: "limiting_items",
        header: "Limiting item",
        cell: ({ row }) => {
          if (row.original.recipe_status === "missing_recipe") return "—"

          return row.original.limiting_items.length ? (
            <div className="flex flex-col gap-1">
              {row.original.limiting_items.map((item) => (
                <Link
                  className="text-ui-fg-interactive hover:underline"
                  key={item.inventory_item_id}
                  to={`/inventory/${item.inventory_item_id}`}
                >
                  {item.inventory_item_title}
                </Link>
              ))}
            </div>
          ) : (
            "—"
          )
        },
      }),
    ],
    [],
  )
  const table = useDataTable({
    data: reportQuery.data?.buildable_products || [],
    columns,
    getRowId: (row) => row.variant_id,
    rowCount: reportQuery.data?.count || 0,
    isLoading:
      locationsQuery.isLoading ||
      (Boolean(selectedLocationId) && reportQuery.isLoading),
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    search: {
      state: search,
      onSearchChange: (value) => {
        setSearch(value)
        setPagination((current) => ({ ...current, pageIndex: 0 }))
      },
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-4 px-6 py-4 small:flex-row small:items-end small:justify-between">
        <div>
          <Heading>Buildable products</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Read-only recipe availability from native stocked minus reserved
            quantities. Physical stock remains managed in Inventory.
          </Text>
        </div>
        <div className="w-full small:max-w-64">
          <Text size="small" leading="compact" weight="plus">
            Stock location
          </Text>
          <Select
            value={selectedLocationId || undefined}
            onValueChange={(value) => {
              setSelectedLocationId(value)
              setPagination((current) => ({ ...current, pageIndex: 0 }))
            }}
            disabled={locationsQuery.isLoading || !locations.length}
          >
            <Select.Trigger>
              <Select.Value
                placeholder={
                  locationsQuery.isLoading
                    ? "Loading locations…"
                    : "No stock location"
                }
              />
            </Select.Trigger>
            <Select.Content>
              {locations.map((location) => (
                <Select.Item key={location.id} value={location.id}>
                  {location.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>

      {locationsQuery.isError ? (
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <Text size="small" className="text-ui-fg-error">
            Stock locations could not be loaded.
          </Text>
          <Button
            size="small"
            variant="secondary"
            onClick={() => locationsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : !locationsQuery.isLoading && !locations.length ? (
        <Text size="small" className="text-ui-fg-subtle px-6 py-4">
          Add a native Medusa stock location before calculating buildable
          products.
        </Text>
      ) : reportQuery.isError ? (
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <Text size="small" className="text-ui-fg-error">
            Buildable-product availability could not be loaded for this
            location.
          </Text>
          <Button
            size="small"
            variant="secondary"
            onClick={() => reportQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!locationsQuery.isError &&
      Boolean(selectedLocationId) &&
      !reportQuery.isError ? (
        <DataTable instance={table}>
          <DataTable.Toolbar>
            <DataTable.Search placeholder="Search variants or SKUs" />
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      ) : null}
    </Container>
  )
}

export default BuildableProductsPage
