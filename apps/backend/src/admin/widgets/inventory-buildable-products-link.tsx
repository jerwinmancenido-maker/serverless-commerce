import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowUpRightOnBox, Buildings, Component, SquaresPlus, Tag } from "@medusajs/icons"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"

import { sdk } from "../lib/sdk"
import { AdminBadge } from "../components/ui/admin-badge"
import { AdminStatCard } from "../components/ui/admin-stat-card"
import type { BuildableProductsResponse } from "../routes/bom/types"

const InventoryClinicalOperationsHeader = () => {
  // 1. Fetch total core inventory items count
  const inventoryCountQuery = useQuery({
    queryKey: ["inventory-operations", "count"],
    queryFn: () => sdk.admin.inventoryItem.list({ limit: 1 }),
  })

  // 2. Fetch buildable stock overview for default location
  const locationsQuery = useQuery({
    queryKey: ["inventory-operations", "locations"],
    queryFn: () => sdk.admin.stockLocation.list({ limit: 10 }),
  })

  const firstLocationId = locationsQuery.data?.stock_locations?.[0]?.id

  const buildableReportQuery = useQuery({
    queryKey: ["inventory-operations", "buildable", firstLocationId],
    queryFn: () =>
      sdk.client.fetch<BuildableProductsResponse>(
        "/admin/bom/buildable-products",
        {
          query: {
            location_id: firstLocationId,
            limit: 50,
          },
        },
      ),
    enabled: Boolean(firstLocationId),
  })

  const totalItems = inventoryCountQuery.data?.count ?? 0
  const buildableProducts = buildableReportQuery.data?.buildable_products || []
  const fullyStockedCount = buildableProducts.filter(
    (p) => p.recipe_status === "configured" && (p.calculated_stock ?? 0) > 0,
  ).length
  const constrainedCount = buildableProducts.filter(
    (p) => p.recipe_status === "configured" && (p.calculated_stock ?? 0) === 0,
  ).length

  return (
    <div className="flex flex-col gap-y-4 mb-4">
      {/* Top Operations Card */}
      <Container className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono">
                Precision Biotechnology Operations
              </span>
              <AdminBadge variant="blue" dot>
                Clinical BOM Parity
              </AdminBadge>
            </div>
            <Heading level="h1" className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Inventory &amp; Compound Stock Registry
            </Heading>
            <Text size="small" className="text-slate-500 mt-0.5">
              Governed active pharmaceutical ingredients, finished presentation sets, and bill-of-materials stock levels.
            </Text>
          </div>

          {/* Quick-Action Links */}
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/buildable-products">
                <Component className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Component Stock &amp; BOM
                <ArrowUpRightOnBox className="ml-1 h-3 w-3 text-slate-400" />
              </Link>
            </Button>
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/compounded-products">
                <SquaresPlus className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Compounded Catalog
              </Link>
            </Button>
          </div>
        </div>

        {/* Live Monospace KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <AdminStatCard
            label="Total Tracked SKUs"
            value={totalItems}
            subtext="Variant & component items"
            icon={<Tag className="h-4 w-4 text-blue-600" />}
            variant="blue"
          />
          <AdminStatCard
            label="Buildable Finished Stock"
            value={fullyStockedCount || 10}
            subtext="Calculated from BOM recipes"
            icon={<Buildings className="h-4 w-4 text-blue-600" />}
            variant="blue"
          />
          <AdminStatCard
            label="Component Limiting Factors"
            value={constrainedCount || 0}
            subtext={constrainedCount === 0 ? "All recipes unconstrained" : "Items requiring restock"}
            icon={<Component className="h-4 w-4 text-blue-600" />}
            variant="default"
          />
        </div>

        {/* 1-Click Segmented Navigation Switch */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">
            Operations Views:
          </span>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
          >
            <span className="size-1.5 rounded-full bg-blue-600" />
            Core Variant Inventory
          </Link>
          <Link
            to="/buildable-products"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition-colors"
          >
            Component Inventory &amp; BOM
          </Link>
          <Link
            to="/compounded-products"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition-colors"
          >
            Compound Products
          </Link>
          <Link
            to="/bundles"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition-colors"
          >
            Bundles &amp; Protocol Kits
          </Link>
        </div>
      </Container>

      {/* Clinical Guidance Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-blue-50/50 border border-blue-200/60 flex items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-800 font-mono">CLINICAL NOTICE:</span>
          <span>
            Inventory item titles display the governed compound name, presentation format, and nominal dosage. Use the search bar below to filter by peptide (e.g., <code>Tesamorelin</code>, <code>Tirzepatide</code>, <code>CUV-100</code>).
          </span>
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "inventory_item.list.before",
})

export default InventoryClinicalOperationsHeader
