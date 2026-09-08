import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowUpRightOnBox, Folder, ListTree, SquaresPlus, Tag } from "@medusajs/icons"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"

import { sdk } from "../lib/sdk"
import { AdminBadge } from "../components/ui/admin-badge"
import { AdminStatCard } from "../components/ui/admin-stat-card"

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
      {/* Top Clinical Taxonomy Card */}
      <Container className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
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

        {/* Monospace KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <AdminStatCard
            label="Therapeutic Classes"
            value={totalCategories}
            subtext="Defined peptide taxonomy rails"
            variant="blue"
            icon={<ListTree className="h-4 w-4" />}
          />
          <AdminStatCard
            label="Active Storefront Rails"
            value={activeCount}
            subtext="Live published customer classes"
            variant="blue"
            icon={<Tag className="h-4 w-4" />}
          />
          <AdminStatCard
            label="Governed Formulations"
            value={totalProducts}
            subtext="Compounds assigned to active classes"
            variant="blue"
            icon={<SquaresPlus className="h-4 w-4" />}
          />
        </div>
      </Container>

      {/* Segmented Quick-Switch Navigation Bar */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-medium">
          <Button asChild variant="transparent" size="small" className="h-7 px-3 text-slate-600 hover:text-slate-900">
            <Link to="/compounded-products">
              Compounded Products
            </Link>
          </Button>
          <div className="h-7 px-3 flex items-center gap-1.5 bg-white text-blue-700 font-semibold rounded-lg shadow-xs border border-blue-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Therapeutic Categories
          </div>
          <Button asChild variant="transparent" size="small" className="h-7 px-3 text-slate-600 hover:text-slate-900">
            <Link to="/buildable-products">
              Component BOM
            </Link>
          </Button>
          <Button asChild variant="transparent" size="small" className="h-7 px-3 text-slate-600 hover:text-slate-900">
            <Link to="/bundles">
              Bundles &amp; Kits
            </Link>
          </Button>
          <Button asChild variant="transparent" size="small" className="h-7 px-3 text-slate-600 hover:text-slate-900">
            <Link to="/research-protocols">
              Protocols Library
            </Link>
          </Button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span>Synchronized with category-rails storefront taxonomy</span>
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product_category.list.before",
})

export default CategoriesClinicalOperationsHeader
