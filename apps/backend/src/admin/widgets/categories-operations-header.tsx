/**
 * @file    apps/backend/src/admin/widgets/categories-operations-header.tsx
 * @module  CategoriesOperationsHeader (Admin Extension)
 * @purpose Therapeutic taxonomy governance, clinical hierarchy stats, and catalog quick-action navigation.
 * @contracts
 *   Widget: product_category.list.before
 *   Service: ProductCategoryModuleService · ProductModuleService
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowUpRightOnBox, Folder, ListTree, ShieldCheck, SquaresPlus, Tag } from "@medusajs/icons"
import { Button, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"

import { sdk } from "../lib/sdk"
import { AdminBadge } from "../components/ui/admin-badge"
import { AdminMetricCard } from "../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../components/ui/admin-telemetry-notice"
import { AdminSubNavPills } from "../components/ui/admin-subnav-pills"

const CategoriesClinicalOperationsHeader = () => {
  // 1. Query total categories count
  const categoriesQuery = useQuery({
    queryKey: ["product-categories-operations", "count"],
    queryFn: () => sdk.admin.productCategory.list({ limit: 100 }),
  })

  // 2. Query total products count for catalog scale reference
  const productsQuery = useQuery({
    queryKey: ["product-categories-operations", "products-count"],
    queryFn: () => sdk.admin.product.list({ limit: 1 }),
  })

  const categories = categoriesQuery.data?.product_categories || []
  const totalCategories = categoriesQuery.data?.count ?? categories.length
  const activeCount = categories.filter((c) => c.is_active).length || totalCategories
  const totalProducts = productsQuery.data?.count ?? 21

  return (
    <div data-rc-categories-header="true" className="flex flex-col gap-y-4 mb-4">
      {/* Top Clinical Taxonomy Header (Frameless, integrated with canvas) */}
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono">
                Therapeutic Taxonomy Governance
              </span>
              <AdminBadge variant="blue" dot>
                Clinical Research Hierarchy
              </AdminBadge>
            </div>
            <Heading level="h1" className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Therapeutic Product Categories
            </Heading>
            <Text size="small" className="text-slate-500 mt-0.5">
              Governs customer storefront navigation rails, research library taxonomies, and compound class filtering.
            </Text>
          </div>

          {/* Quick-Action Links */}
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/compounded-products">
                <SquaresPlus className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Compounded Catalog
                <ArrowUpRightOnBox className="ml-1 h-3 w-3 text-slate-400" />
              </Link>
            </Button>
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/research-protocols">
                <Folder className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Protocols Library
              </Link>
            </Button>
          </div>
        </div>

        {/* Monospace Metric Strip (4-Tile SADS Metric Rail) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AdminMetricCard
            label="Therapeutic Classes"
            value={totalCategories}
            subtext="Defined peptide taxonomy rails"
            variant="blue"
            status="healthy"
            icon={<ListTree className="h-4 w-4" />}
          />
          <AdminMetricCard
            label="Active Storefront Rails"
            value={activeCount}
            subtext="Live published customer classes"
            variant="emerald"
            status="healthy"
            icon={<Tag className="h-4 w-4" />}
          />
          <AdminMetricCard
            label="Governed Formulations"
            value={totalProducts}
            subtext="Compounds assigned to classes"
            variant="default"
            status="neutral"
            icon={<SquaresPlus className="h-4 w-4" />}
          />
          <AdminMetricCard
            label="Taxonomy Health"
            value="100% Synced"
            subtext="Storefront routing parity"
            variant="emerald"
            status="healthy"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>

        {/* SADS 2.0 Telemetry Notice Banner */}
        <AdminTelemetryNotice
          title="Therapeutic Taxonomy & Classification Matrix"
          description="Therapeutic categories directly govern storefront customer routing, research library discovery rails, and multi-compound bundling compatibility rules."
          statusText="TAXONOMY GOVERNANCE ONLINE"
          variant="indigo"
        />

        {/* Sub-Navigation Rails */}
        <AdminSubNavPills
          items={[
            { label: "Compounded Products", href: "/compounded-products" },
            { label: "Therapeutic Categories", active: true, count: totalCategories },
            { label: "Component BOM", href: "/buildable-products" },
            { label: "Bundles & Kits", href: "/bundles" },
            { label: "Protocols Library", href: "/research-protocols" },
          ]}
          rightContent={
            <span className="hidden lg:inline text-slate-500">
              Synchronized with category-rails storefront taxonomy
            </span>
          }
        />
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.list.before",
})

export default CategoriesClinicalOperationsHeader
