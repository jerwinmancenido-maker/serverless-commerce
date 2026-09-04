import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowUpRightOnBox } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  type DataTablePaginationState,
  Select,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { EmptyState } from "../../components/empty-state"
import { FilterPillGroup } from "../../components/filter-pill-group"
import { KpiCard } from "../../components/kpi-card"
import { PageHeader } from "../../components/page-header"
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
  const [activeFilter, setActiveFilter] = useState("all")

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

  const rawProducts = reportQuery.data?.buildable_products || []

  // Compute KPI metrics across the loaded inventory
  const kpis = useMemo(() => {
    const total = rawProducts.length
    const ready = rawProducts.filter(
      (p) => p.recipe_status === "configured" && (p.calculated_stock ?? 0) > 0,
    ).length
    const constrained = rawProducts.filter(
      (p) => p.recipe_status === "configured" && (p.calculated_stock ?? 0) === 0,
    ).length
    const incomplete = rawProducts.filter(
      (p) => p.recipe_status === "missing_recipe",
    ).length

    return { total, ready, constrained, incomplete }
  }, [rawProducts])

  // Filter products based on active filter pill
  const filteredProducts = useMemo(() => {
    if (activeFilter === "ready") {
      return rawProducts.filter(
        (p) => p.recipe_status === "configured" && (p.calculated_stock ?? 0) > 0,
      )
    }
    if (activeFilter === "constrained") {
      return rawProducts.filter(
        (p) => p.recipe_status === "configured" && (p.calculated_stock ?? 0) === 0,
      )
    }
    if (activeFilter === "complete") {
      return rawProducts.filter((p) => p.recipe_status === "configured")
    }
    if (activeFilter === "incomplete") {
      return rawProducts.filter((p) => p.recipe_status === "missing_recipe")
    }
    return rawProducts
  }, [rawProducts, activeFilter])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "product_variant",
        header: "Product and variant",
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-0.5 py-1">
            {row.original.product_id ? (
              <Link
                className="w-fit font-medium hover:text-ui-fg-interactive text-xs"
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
                className="text-ui-fg-interactive w-fit hover:underline text-[11px]"
                to={`/products/${row.original.product_id}/variants/${row.original.variant_id}`}
              >
                {row.original.variant_title}
              </Link>
            ) : (
              <Text size="xsmall">{row.original.variant_title}</Text>
            )}
            <Text
              size="xsmall"
              leading="compact"
              className="text-ui-fg-subtle break-all font-mono text-[10px]"
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
            <Badge color="green" size="small">Complete</Badge>
          ) : (
            <Badge color="orange" size="small">Incomplete</Badge>
          ),
      }),
      columnHelper.accessor("calculated_stock", {
        header: "Calculated stock",
        cell: ({ row, getValue }) => {
          if (row.original.recipe_status === "missing_recipe") {
            return (
              <Badge color="grey" size="small">
                Unavailable
              </Badge>
            )
          }

          const stock = getValue() ?? 0
          const color = stock > 10 ? "green" : stock > 0 ? "orange" : "red"

          return (
            <div className="flex items-center gap-1.5">
              <Badge color={color} size="small" className="tabular-nums font-semibold px-2 py-0.5">
                {stock} {stock === 1 ? "unit" : "units"}
              </Badge>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "limiting_items",
        header: "Limiting components",
        cell: ({ row }) => {
          if (row.original.recipe_status === "missing_recipe") return <span className="text-ui-fg-muted">—</span>

          return row.original.limiting_items.length ? (
            <div className="flex flex-wrap gap-1">
              {row.original.limiting_items.map((item) => (
                <Link
                  key={item.inventory_item_id}
                  to={`/inventory/${item.inventory_item_id}`}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200/80 bg-red-50/70 px-2 py-0.5 text-[11px] text-red-900 hover:bg-red-100 transition-colors dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
                >
                  <span>⚠️</span>
                  <span className="truncate max-w-[150px]">{item.inventory_item_title}</span>
                </Link>
              ))}
            </div>
          ) : (
            <span className="text-emerald-700 dark:text-emerald-300 text-xs font-medium">✓ None (Fully stocked)</span>
          )
        },
      }),
    ],
    [],
  )

  const table = useDataTable({
    data: filteredProducts,
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

  const selectedLocation = locations.find((l) => l.id === selectedLocationId)

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* 1. Standardized PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Buildable Products" },
        ]}
        title="Buildable Products"
        subtitle="Read-only recipe availability from native physical stock minus reserved quantities across stock locations."
        statusDropdown={
          selectedLocation ? (
            <Badge size="small" color="blue" className="font-mono text-[11px]">
              📍 {selectedLocation.name}
            </Badge>
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-ui-fg-muted font-medium">Location:</span>
            <div className="w-56">
              <Select
                value={selectedLocationId || undefined}
                onValueChange={(value) => {
                  setSelectedLocationId(value)
                  setPagination((current) => ({ ...current, pageIndex: 0 }))
                }}
                disabled={locationsQuery.isLoading || !locations.length}
              >
                <Select.Trigger className="h-8 text-xs">
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
        }
      />

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total SKUs"
          value={kpis.total}
          icon="📦"
          status="neutral"
          subtext="Configured & catalog variants"
        />
        <KpiCard
          title="Ready to Build"
          value={kpis.ready}
          icon="✅"
          status="healthy"
          subtext="Calculated stock > 0"
        />
        <KpiCard
          title="Bottlenecked (0 Stock)"
          value={kpis.constrained}
          icon="⚠️"
          status={kpis.constrained > 0 ? "warning" : "healthy"}
          subtext="Blocked by limiting components"
        />
        <KpiCard
          title="Incomplete Recipes"
          value={kpis.incomplete}
          icon="🧪"
          status={kpis.incomplete > 0 ? "warning" : "healthy"}
          subtext="Missing BOM configurations"
        />
      </div>

      {/* 3. Main Data Container */}
      <Container className="divide-y p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base">
        {/* Filter Pills Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ui-bg-subtle/20 border-b border-ui-border-base">
          <FilterPillGroup
            items={[
              { id: "all", label: "All SKUs", count: kpis.total },
              { id: "ready", label: "Ready to Build", count: kpis.ready, badgeColor: "green" },
              { id: "constrained", label: "Bottlenecked (0 Stock)", count: kpis.constrained, badgeColor: "orange" },
              { id: "complete", label: "Complete Recipes" },
              { id: "incomplete", label: "Incomplete Recipes", count: kpis.incomplete },
            ]}
            selectedId={activeFilter}
            onSelect={(id) => setActiveFilter(id)}
          />
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
          <EmptyState
            icon="📍"
            title="No stock locations found"
            description="Add a native Medusa stock location in Settings to calculate buildable product stock."
          />
        ) : reportQuery.isError ? (
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <Text size="small" className="text-ui-fg-error">
              Buildable-product availability could not be loaded for this location.
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
          filteredProducts.length === 0 && !reportQuery.isLoading ? (
            <EmptyState
              icon="🔍"
              title="No buildable products match this filter"
              description="Try switching filters or clearing your search term to see available variants."
              actionLabel="Show All SKUs"
              onAction={() => setActiveFilter("all")}
            />
          ) : (
            <DataTable instance={table}>
              <DataTable.Toolbar>
                <DataTable.Search placeholder="Search variants or SKUs…" />
              </DataTable.Toolbar>
              <DataTable.Table />
              <DataTable.Pagination />
            </DataTable>
          )
        ) : null}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Buildable Products",
  nested: "/inventory",
})

export default BuildableProductsPage
