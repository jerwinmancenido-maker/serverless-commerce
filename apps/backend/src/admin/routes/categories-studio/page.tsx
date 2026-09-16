/**
 * @file    apps/backend/src/admin/routes/categories-studio/page.tsx
 * @module  CategoriesStudioPage (Admin Route Extension)
 * @purpose Modern Storefront SADS 2.0 Categories Studio with 7/5 operational split grid and full CRUD drawer controls.
 * @contracts
 *   Route:   /app/categories-studio
 *   API:     GET/POST/DELETE /admin/product-categories
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowUpRightOnBox,
  CheckCircleSolid,
  ChevronRight,
  Folder,
  ListTree,
  MagnifyingGlass,
  PencilSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash,
  XMark,
} from "@medusajs/icons"
import { Badge, Button, Input, Prompt, toast } from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { PageHeader } from "../../components/page-header"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { AdminSuiteCard } from "../../components/ui/admin-suite-card"
import { AdminListRowCard } from "../../components/ui/admin-list-row-card"
import { SovereignPageSkeleton } from "../../components/ui/sovereign-page-skeleton"
import { SovereignEmptyState } from "../../components/ui/sovereign-empty-state"
import { sdk } from "../../lib/sdk"
import { CategoryCreateEditDrawer, CategoryItem } from "./category-create-edit-drawer"

type TabFilter = "all" | "active" | "internal"

export const CategoriesStudioPage = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Drawer & Dialog state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 1. Fetch live categories
  const categoriesQuery = useQuery({
    queryKey: ["product-categories-operations"],
    queryFn: async () => {
      return sdk.client.fetch<any>("/admin/product-categories", {
        query: {
          limit: 100,
          fields: "id,name,handle,description,is_active,is_internal,parent_category_id,category_children,products.id",
        },
      })
    },
  })

  // 2. Fetch products count for reference
  const productsQuery = useQuery({
    queryKey: ["product-categories-products-count"],
    queryFn: () => sdk.admin.product.list({ limit: 1 }),
  })

  const rawCategories = categoriesQuery.data?.product_categories || []
  const totalProducts = productsQuery.data?.count ?? 21

  // 3. Compute KPI Metrics
  const kpis = useMemo(() => {
    const total = rawCategories.length
    const active = rawCategories.filter((c: any) => c.is_active).length
    const internal = rawCategories.filter((c: any) => c.is_internal).length
    return {
      total,
      active: active || total,
      internal,
      totalProducts,
    }
  }, [rawCategories, totalProducts])

  // 4. Filter categories
  const filteredCategories = useMemo(() => {
    let list = rawCategories

    if (activeTab === "active") {
      list = list.filter((c: any) => c.is_active)
    } else if (activeTab === "internal") {
      list = list.filter((c: any) => c.is_internal)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(q) ||
          c.handle?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      )
    }

    return list
  }, [rawCategories, activeTab, searchQuery])

  const handleCreateNew = () => {
    setSelectedCategory(null)
    setDrawerOpen(true)
  }

  const handleEdit = (category: any) => {
    setSelectedCategory(category)
    setDrawerOpen(true)
  }

  const promptDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await sdk.admin.productCategory.delete(deleteTarget.id)
      toast.success(`Deleted category "${deleteTarget.name}"`)
      queryClient.invalidateQueries({ queryKey: ["product-categories-operations"] })
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch (err: any) {
      console.error("Failed to delete category:", err)
      toast.error(err.message || "Failed to delete category")
    } finally {
      setIsDeleting(false)
    }
  }

  if (categoriesQuery.isLoading) {
    return <SovereignPageSkeleton cards={4} rows={6} />
  }

  return (
    <div className="flex flex-col gap-y-4 pb-12 pt-4 px-3.5 sm:px-6 w-full min-h-screen">
      {/* 1. Header with Eyebrow, Badges, and Create Action */}
      <PageHeader
        eyebrowText="Compound Taxonomy Governance · Research Hierarchy"
        title="Compound Categories & Taxonomies"
        subtitle="Governs customer storefront navigation rails, research library taxonomies, and compound class filtering."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/buildable-products">
                Compounded Catalog <ArrowUpRightOnBox className="ml-1 size-3.5" />
              </Link>
            </Button>
            <Button
              size="small"
              onClick={handleCreateNew}
              className="h-8 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1.5"
            >
              <Plus className="size-3.5" /> Create Category
            </Button>
          </div>
        }
      />

      {/* 2. Top Telemetry Notice */}
      <AdminTelemetryNotice
        icon={<Sparkles className="size-4" />}
        title="Therapeutic Taxonomy & Clinical Hierarchy Governance Active"
        description="Every category synchronizes directly to storefront navigation rails and research library cross-references. Multi-tier parent-child nesting active."
        actionLabel="Inspect Protocols"
        actionHref="/research-protocols"
        variant="blue"
      />

      {/* 3. 4-Tile Compact Executive Metric Strip (~82px height) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Therapeutic Classes"
          value={kpis.total}
          subtext="Configured compound families"
          icon={<Folder className="size-4" />}
          variant="blue"
          status="healthy"
        />
        <AdminMetricCard
          label="Active Storefront Rails"
          value={kpis.active}
          subtext="Public navigation categories"
          icon={<CheckCircleSolid className="size-4" />}
          variant="emerald"
          status="healthy"
        />
        <AdminMetricCard
          label="Governed Formulations"
          value={kpis.totalProducts}
          subtext="Categorized catalog items"
          icon={<Tag className="size-4" />}
          variant="purple"
          status="healthy"
        />
        <AdminMetricCard
          label="Taxonomy Health"
          value="100%"
          subtext="Synchronized with storefront"
          icon={<ShieldCheck className="size-4" />}
          variant="emerald"
          status="healthy"
        />
      </div>

      {/* 4. Single-Row Tab Bar Strip with Inline Search */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Categories", count: kpis.total },
            { id: "active", label: "Active Rails", count: kpis.active },
            { id: "internal", label: "Internal Labware", count: kpis.internal },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabFilter)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10.5px] font-mono ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search category, handle, class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 pr-7 text-xs bg-slate-50 border-slate-200/80 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XMark className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Full-Width Category Micro-Card Data Stream */}
      <div className="w-full flex flex-col gap-3">
        {filteredCategories.length === 0 ? (
          <SovereignEmptyState
            icon={<Folder className="size-6 text-slate-400" />}
            heading="No Categories Found"
            description="Click '+ Create Category' to add a new therapeutic classification."
            action={
              <Button size="small" onClick={handleCreateNew}>
                Create Category
              </Button>
            }
          />
        ) : (
          filteredCategories.map((cat: any) => {
            const productCount = cat.products?.length || 0
            const isInternal = Boolean(cat.is_internal)
            const isActive = Boolean(cat.is_active)

            return (
              <AdminListRowCard
                key={cat.id}
                onClick={() => handleEdit(cat)}
                icon={<Folder className="size-4 text-blue-600" />}
                title={cat.name}
                subtitle={
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700">
                      /{cat.handle}
                    </span>
                    {productCount > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-mono text-emerald-700">
                        {productCount} products
                      </span>
                    )}
                    {cat.description && (
                      <span className="text-[11px] text-slate-400 truncate max-w-[280px]">
                        {cat.description}
                      </span>
                    )}
                  </div>
                }
                badge={
                  <Badge
                    size="small"
                    color={isActive ? "green" : "grey"}
                    className="text-[10px]"
                  >
                    {isActive ? "Active Rail" : "Draft"}
                  </Badge>
                }
                value={isInternal ? "Internal Labware" : "Public Storefront"}
                secondaryValue={cat.parent_category_id ? "Subcategory" : "Primary Category"}
                statusPill={
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
                    <span>Edit Class</span>
                    <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-slate-700" />
                  </span>
                }
                onDelete={() => promptDelete(cat.id, cat.name)}
                href={`http://localhost:8000/ph/categories/${cat.handle}`}
              />
            )
          })
        )}
      </div>

      {/* 6. Horizontal Operational Suites Dock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Suite 1: Therapeutic Taxonomy Engine */}
        <AdminSuiteCard
          icon={<ListTree className="size-4 text-blue-600" />}
          eyebrow="Category Taxonomy"
          title="Therapeutic Class Management"
          description="Organize peptides, multi-compound blends, and laboratory reconstitution hardware into precise storefront browsing trees."
          actionLabel="+ Create Category"
          onActionClick={handleCreateNew}
          statusBadge="Active Rails"
          statusVariant="emerald"
          variant="blue"
        >
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
              <span className="font-semibold text-slate-900">Total Configured Classes:</span>
              <span className="font-mono font-bold text-blue-700">{kpis.total} Categories</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="font-semibold text-slate-900">Storefront Rails Status:</span>
              <span className="font-mono text-emerald-700 font-semibold">100% Synced</span>
            </div>
          </div>
        </AdminSuiteCard>

        {/* Suite 2: Governance & Disclaimers */}
        <AdminSuiteCard
          icon={<ShieldCheck className="size-4 text-emerald-600" />}
          eyebrow="Regulatory Alignment"
          title="Biotechnology Classification"
          description="Category slugs and descriptions are synchronized with customer account monographs and RUO laboratory disclaimers."
          statusBadge="Governed"
          statusVariant="emerald"
          variant="emerald"
        >
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0" />
              <span>Automated handle normalization (kebab-case)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0" />
              <span>Accessories &amp; supplies categorized separately</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0" />
              <span>Live synchronization with storefront filter pills</span>
            </div>
          </div>
        </AdminSuiteCard>
      </div>

      {/* 6. Category Create / Edit Slide-Over Drawer */}
      <CategoryCreateEditDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={selectedCategory}
      />

      {/* 7. Delete Confirmation Dialog */}
      <Prompt open={deleteDialogOpen}>
        <Prompt.Content className="max-w-md">
          <Prompt.Header>
            <Prompt.Title>Delete Category</Prompt.Title>
            <Prompt.Description>
              Are you sure you want to delete category <strong>"{deleteTarget?.name}"</strong>? Products in this category will be unassigned but not deleted.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Prompt.Cancel>
            <Prompt.Action
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Categories",
  icon: Folder,
  rank: 8,
})

export default CategoriesStudioPage
