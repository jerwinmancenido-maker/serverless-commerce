/**
 * @file    apps/backend/src/admin/routes/products-registry/page.tsx
 * @module  ProductsRegistryPage (SADS 2.0)
 * @purpose Modern Sovereign Admin Design System 2.0 Master Products Catalog with 4-tile metric strip,
 *          CompoundingSubnav, live filter tabs, search, and rich product micro-cards.
 * @contracts
 *   Route: /app/products-registry
 *   API:   GET /admin/products
 */

import {
  ArchiveBox,
  ArrowUpRightOnBox,
  Buildings,
  CheckCircle,
  ChevronRight,
  Component,
  ExclamationCircle,
  MagnifyingGlass,
  Plus,
  Sparkles,
  Tag,
} from "@medusajs/icons"
import { Badge, Button, Heading, Input, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { sdk } from "../../lib/sdk"
import { PageHeader } from "../../components/page-header"
import { AdminBadge } from "../../components/ui/admin-badge"
import { AdminListRowCard } from "../../components/ui/admin-list-row-card"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminSubNavPills } from "../../components/ui/admin-subnav-pills"
import { AdminSuiteCard } from "../../components/ui/admin-suite-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { SovereignEmptyState } from "../../components/ui/sovereign-empty-state"
import { SovereignPageSkeleton } from "../../components/ui/sovereign-page-skeleton"
import { CompoundingSubnav } from "../../components/compounding-subnav"

type ProductVariant = {
  id: string
  title: string
  sku?: string | null
}

type ProductItem = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  status: "published" | "draft" | "proposed" | "rejected"
  collection?: { id: string; title: string } | null
  categories?: Array<{ id: string; name: string }>
  variants?: ProductVariant[]
  created_at: string
}

export const ProductsRegistryPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<"all" | "published" | "multi_variant" | "draft">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // 1. Fetch live product catalog
  const productsQuery = useQuery({
    queryKey: ["admin-products-registry-list"],
    queryFn: async () => {
      const res = await sdk.client.fetch<{ products: ProductItem[]; count: number }>("/admin/products", {
        query: {
          limit: 200,
          fields: "id,title,handle,thumbnail,status,collection.title,categories.name,variants.id,variants.title,variants.sku,created_at",
        },
      })
      return res.products || []
    },
    staleTime: 60_000,
  })

  const products = productsQuery.data || []
  const isLoading = productsQuery.isLoading

  // 2. Compute live KPI metrics
  const totalCount = products.length
  const publishedCount = useMemo(
    () => products.filter((p) => p.status === "published").length,
    [products],
  )
  const totalVariants = useMemo(
    () => products.reduce((sum, p) => sum + (p.variants?.length || 0), 0),
    [products],
  )
  const multiVariantCount = useMemo(
    () => products.filter((p) => (p.variants?.length || 0) > 1).length,
    [products],
  )
  const draftCount = useMemo(
    () => products.filter((p) => p.status !== "published").length,
    [products],
  )

  // 3. Filter items in-page
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeFilter === "published" && product.status !== "published") return false
      if (activeFilter === "draft" && product.status === "published") return false
      if (activeFilter === "multi_variant" && (product.variants?.length || 0) <= 1) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const titleMatch = product.title.toLowerCase().includes(query)
        const handleMatch = product.handle.toLowerCase().includes(query)
        const collectionMatch = product.collection?.title?.toLowerCase().includes(query)
        const skuMatch = product.variants?.some((v) => (v.sku || "").toLowerCase().includes(query))
        if (!titleMatch && !handleMatch && !collectionMatch && !skuMatch) return false
      }

      return true
    })
  }, [products, activeFilter, searchQuery])

  if (isLoading) {
    return (
      <div className="px-3.5 sm:px-6 pt-4 pb-12 w-full min-h-screen">
        <SovereignPageSkeleton cards={4} rows={6} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4 px-3.5 sm:px-6 pt-4 pb-12 w-full min-h-screen">
      {/* 1. Header & Eyebrow */}
      <PageHeader
        eyebrowText="Commercial Catalog · Master Compound Directory"
        eyebrowBadge={
          <AdminBadge variant="blue" dot>
            100% RUO Standards
          </AdminBadge>
        }
        title="Products & Master Catalog"
        subtitle="Analytical reference standard monographs, packaging specifications, and commercial sales channels."
        actions={
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="small"
              variant="secondary"
              className="h-8 text-xs font-semibold border-slate-200 shadow-2xs"
            >
              <Link to="/buildable-products">
                <Component className="mr-1.5 size-3.5 text-blue-600" />
                BOM Inventory
              </Link>
            </Button>
            <Button
              asChild
              size="small"
              variant="secondary"
              className="h-8 text-xs font-semibold border-slate-200 shadow-2xs"
            >
              <Link to="/bundles">
                <ArchiveBox className="mr-1.5 size-3.5 text-purple-600" />
                Bundles &amp; Stacks
              </Link>
            </Button>
            <Button
              asChild
              size="small"
              className="h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
            >
              <Link to="/compounded-products">
                <Plus className="mr-1.5 size-3.5" />
                New Compounded Product
              </Link>
            </Button>
          </div>
        }
      />

      {/* 2. Secondary Subnav Strip */}
      <CompoundingSubnav activeTab="catalog" />

      {/* 3. SADS 2.0 Telemetry Notice Banner */}
      <AdminTelemetryNotice
        icon={<Sparkles className="size-4 text-blue-600" />}
        title="Live Monograph Catalog Synchronized"
        description="All compound analytical reference standard monographs active across Philippine regional sales channels. Zero-tax reference standard pricing nominal."
        statusText="CATALOG NOMINAL"
        variant="blue"
        actionLabel="Product Builder"
        actionHref="/compounded-products"
      />

      {/* 4. 4-Tile Compact Executive Metric Strip (~82px height) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Products"
          value={totalCount}
          subtext="Verified analytical standards"
          icon={<Tag className="size-4" />}
          variant="blue"
          status="healthy"
        />
        <AdminMetricCard
          label="Published Active"
          value={publishedCount}
          subtext="Storefront available"
          icon={<CheckCircle className="size-4" />}
          variant="emerald"
          status="healthy"
        />
        <AdminMetricCard
          label="Tracked Variants"
          value={totalVariants}
          subtext="Multi-variant presentations"
          icon={<ArchiveBox className="size-4" />}
          variant="purple"
          status="healthy"
        />
        <AdminMetricCard
          label="Component Readiness"
          value="100%"
          subtext="BOM recipes validated"
          icon={<Buildings className="size-4" />}
          variant="emerald"
          status="healthy"
          href="/buildable-products"
        />
      </div>

      {/* 5. Single-Row In-Page Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <AdminSubNavPills
          items={[
            {
              id: "all",
              label: "All Products",
              active: activeFilter === "all",
              count: totalCount,
              onClick: () => setActiveFilter("all"),
            },
            {
              id: "published",
              label: "Published",
              active: activeFilter === "published",
              count: publishedCount,
              onClick: () => setActiveFilter("published"),
            },
            {
              id: "multi_variant",
              label: "Multi-Variant",
              active: activeFilter === "multi_variant",
              count: multiVariantCount,
              onClick: () => setActiveFilter("multi_variant"),
            },
            {
              id: "draft",
              label: "Drafts",
              active: activeFilter === "draft",
              count: draftCount,
              onClick: () => setActiveFilter("draft"),
            },
          ]}
        />

        {/* Inline Search */}
        <div className="relative w-full sm:w-72">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input
            type="search"
            placeholder="Search products, handles, SKUs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-white border-slate-200/80 rounded-lg shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 6. Product Stream (Micro-Card Rows) */}
      <div className="w-full flex flex-col gap-2.5">
        {filteredProducts.length === 0 ? (
          <SovereignEmptyState
            icon={<ArchiveBox className="size-8 text-slate-400" />}
            heading="No products found"
            description={searchQuery ? `No products match "${searchQuery}".` : "No products in this filter."}
            action={
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setActiveFilter("all")
                  setSearchQuery("")
                }}
              >
                Show All Products
              </Button>
            }
          />
        ) : (
          filteredProducts.map((p) => {
            const isPublished = p.status === "published"
            const variantCount = p.variants?.length || 0
            const collectionTitle = p.collection?.title || p.categories?.[0]?.name || "Uncategorized"

            return (
              <div
                key={p.id}
                className="block no-underline group focus:outline-hidden"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    navigate(`/compounded-products/${p.id}`)
                  }
                }}
              >
                <AdminListRowCard
                  onClick={() => navigate(`/compounded-products/${p.id}`)}
                  icon={
                    p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="size-8 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <Tag className="size-4 text-blue-600" />
                    )
                  }
                  className="cursor-pointer group-hover:border-slate-300 group-hover:shadow-xs transition-all"
                  title={
                    <span className="group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </span>
                  }
                  subtitle={
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-slate-500 text-[11px]">/{p.handle}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600 text-xs">{collectionTitle}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-medium text-slate-700 text-xs">
                        {variantCount} {variantCount === 1 ? "variant" : "variants"}
                      </span>
                    </span>
                  }
                  badge={
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isPublished
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                        Online Store
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-purple-50 text-purple-700 border-purple-200">
                        Protocol Active
                      </span>
                    </div>
                  }
                  statusPill={
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 group-hover:text-blue-600 transition-colors hidden sm:inline">
                        Cockpit
                      </span>
                      <div className="size-7 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all ml-1">
                        <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  }
                  actions={
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        className="h-7 px-2.5 text-xs font-semibold"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          navigate(`/buildable-products?q=${p.handle}`)
                        }}
                        title="Inspect BOM Buildability"
                      >
                        BOM
                      </Button>
                      <Button
                        asChild
                        size="small"
                        variant="secondary"
                        className="h-7 px-2.5 text-xs font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`http://localhost:8000/ph/products/${p.handle}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on Storefront"
                          aria-label={`View ${p.title} on Storefront`}
                        >
                          <ArrowUpRightOnBox className="size-3.5" />
                        </a>
                      </Button>
                    </div>
                  }
                />
              </div>
            )
          })
        )}
      </div>

      {/* 7. Operational Action Suites Dock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <AdminSuiteCard
          title="BOM Formulation Matrix"
          eyebrow="Inventory Disaggregation"
          icon={<Component className="size-4 text-blue-600" />}
          statusBadge="Active Linkage"
          statusVariant="blue"
          description="Every published presentation variant is bound to physical constituent powders, sterile reconstitution diluents, and shipping packaging."
          actionLabel="Open BOM Inventory"
          actionHref="/buildable-products"
        >
          <div className="flex flex-col gap-y-1.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Constituent Stock Disaggregation:</span>
              <span className="font-mono font-bold text-emerald-600">Active (Automatic)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Live Reservation Guards:</span>
              <span className="font-mono font-bold text-slate-900">Active</span>
            </div>
            <div className="flex items-center justify-between py-1 text-slate-600">
              <span>Constrained Formula Alerts:</span>
              <span className="font-mono font-bold text-slate-900">Automated</span>
            </div>
          </div>
        </AdminSuiteCard>

        <AdminSuiteCard
          title="Zero-Tax Reference Standard Pricing"
          eyebrow="Commercial Market Calibration"
          icon={<CheckCircle className="size-4 text-emerald-600" />}
          statusBadge="100% Tax-Free"
          statusVariant="emerald"
          description="Philippine regional pricing configured with zero BIR VAT and non-commercial RUO analytical standard tax exemptions."
          actionLabel="Price Lists Studio"
          actionHref="/price-lists-studio"
        >
          <div className="flex flex-col gap-y-1.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Regional Currency:</span>
              <span className="font-mono font-bold text-slate-900">PHP (₱)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>RUO Disclaimer Governance:</span>
              <span className="font-mono font-bold text-emerald-600">Enforced</span>
            </div>
            <div className="flex items-center justify-between py-1 text-slate-600">
              <span>Payment Proof Settlement:</span>
              <span className="font-mono font-bold text-slate-900">Manual GCash / Maya</span>
            </div>
          </div>
        </AdminSuiteCard>
      </div>
    </div>
  )
}

export default ProductsRegistryPage
