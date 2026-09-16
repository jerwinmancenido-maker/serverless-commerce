/**
 * @file    apps/backend/src/admin/routes/buildable-products/page.tsx
 * @module  BuildableProductsAdminRoute (BOM Module)
 * @purpose Admin dashboard route for component inventory and BOM buildability matrix in SADS 2.0 7/5 split grid.
 * @contracts
 *   API:     GET /admin/bom/buildable-products · GET /admin/stock-locations
 *   Service: BomModuleService
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
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
  Tag,
} from "@medusajs/icons"
import { Badge, Button, Heading, Input, Select, Text } from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import React, { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { sdk } from "../../lib/sdk"
import { AdminBadge } from "../../components/ui/admin-badge"
import { AdminListRowCard } from "../../components/ui/admin-list-row-card"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminSubNavPills } from "../../components/ui/admin-subnav-pills"
import { AdminSuiteCard } from "../../components/ui/admin-suite-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { SovereignEmptyState } from "../../components/ui/sovereign-empty-state"
import { SovereignPageSkeleton } from "../../components/ui/sovereign-page-skeleton"
import { CompoundingSubnav } from "../../components/compounding-subnav"
import type {
  BuildableProductRow,
  BuildableProductsResponse,
} from "../bom/types"

export const BuildableProductsPage: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [selectedLocationId, setSelectedLocationId] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "ready" | "constrained" | "incomplete">("all")

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
    queryKey: ["buildable-products", "report", selectedLocationId, search],
    queryFn: () =>
      sdk.client.fetch<BuildableProductsResponse>(
        "/admin/bom/buildable-products",
        {
          query: {
            location_id: selectedLocationId,
            limit: 100,
            q: search || undefined,
          },
        },
      ),
    enabled: Boolean(selectedLocationId),
    placeholderData: keepPreviousData,
  })

  const rawProducts = reportQuery.data?.buildable_products || []

  // Compute live KPI metrics
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

  // Filter products in-page based on active pill
  const filteredProducts = useMemo(() => {
    return rawProducts.filter((p) => {
      if (activeFilter === "ready" && !(p.recipe_status === "configured" && (p.calculated_stock ?? 0) > 0)) {
        return false
      }
      if (activeFilter === "constrained" && !(p.recipe_status === "configured" && (p.calculated_stock ?? 0) === 0)) {
        return false
      }
      if (activeFilter === "incomplete" && p.recipe_status !== "missing_recipe") {
        return false
      }

      if (search.trim()) {
        const query = search.toLowerCase()
        const title = (p.product_title || "").toLowerCase()
        const variant = (p.variant_title || "").toLowerCase()
        const sku = (p.sku || "").toLowerCase()
        return title.includes(query) || variant.includes(query) || sku.includes(query)
      }

      return true
    })
  }, [rawProducts, activeFilter, search])

  const selectedLocation = locations.find((l) => l.id === selectedLocationId)

  if (locationsQuery.isLoading && !locations.length) {
    return (
      <div className="p-1.5 sm:p-6 w-full min-h-screen">
        <SovereignPageSkeleton cards={4} rows={8} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4 p-1.5 sm:p-6 pb-12 w-full min-h-screen">
      {/* 1. Header & Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono">
              Bill of Materials · Inventory Availability
            </span>
            {selectedLocation && (
              <AdminBadge variant="blue" dot>
                📍 {selectedLocation.name}
              </AdminBadge>
            )}
          </div>
          <Heading level="h1" className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Buildable Products &amp; Formulation Stock
          </Heading>
          <Text size="small" className="text-slate-500 mt-0.5">
            Theoretical buildability calculated from raw constituent warehouse stock minus active reservations.
          </Text>
        </div>

        {/* Location Selector & Create Button */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          <div className="w-48">
            <Select
              value={selectedLocationId || undefined}
              onValueChange={(val) => setSelectedLocationId(val)}
              disabled={locationsQuery.isLoading || !locations.length}
            >
              <Select.Trigger className="h-8 text-xs bg-white border-slate-200">
                <Select.Value placeholder="Select location" />
              </Select.Trigger>
              <Select.Content>
                {locations.map((loc) => (
                  <Select.Item key={loc.id} value={loc.id} className="text-xs">
                    {loc.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <Button asChild size="small" className="h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs">
            <Link to="/compounded-products">
              <Plus className="mr-1.5 size-3.5" />
              New Compounded Product
            </Link>
          </Button>
        </div>
      </div>

      <CompoundingSubnav activeTab="bom" />

      {/* 2. SADS 2.0 Telemetry Notice Banner */}
      <AdminTelemetryNotice
        icon={<Component className="size-4 text-blue-600" />}
        title="Live BOM Inventory Disaggregation Active"
        description="Physical compound inventory is continuously evaluated against physical ingredient stock. Formulations with depleted vials are marked constrained."
        statusText="BOM ENGINE NOMINAL"
        variant="blue"
        actionLabel="Inspect Bundles"
        actionHref="/bundles"
      />

      {/* 3. 4-Tile Compact Executive Metric Strip (~82px height) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Tracked SKUs"
          value={kpis.total}
          subtext="Configured & catalog variants"
          icon={<Tag className="size-4" />}
          variant="blue"
          status="healthy"
        />
        <AdminMetricCard
          label="Ready to Build"
          value={kpis.ready}
          subtext="Calculated stock > 0"
          icon={<Buildings className="size-4" />}
          variant="emerald"
          status="healthy"
        />
        <AdminMetricCard
          label="Bottlenecked (0 Stock)"
          value={kpis.constrained}
          subtext={kpis.constrained > 0 ? "Blocked by limiting vials" : "All recipes buildable"}
          icon={<ExclamationCircle className="size-4" />}
          variant={kpis.constrained > 0 ? "amber" : "default"}
          status={kpis.constrained > 0 ? "warning" : "healthy"}
        />
        <AdminMetricCard
          label="Incomplete Recipes"
          value={kpis.incomplete}
          subtext={kpis.incomplete > 0 ? "Missing BOM configuration" : "100% recipes mapped"}
          icon={<Component className="size-4" />}
          variant={kpis.incomplete > 0 ? "rose" : "default"}
          status={kpis.incomplete > 0 ? "critical" : "healthy"}
        />
      </div>

      {/* 4. Single-Row In-Page Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <AdminSubNavPills
          items={[
            {
              id: "all",
              label: "All SKUs",
              active: activeFilter === "all",
              count: kpis.total,
              onClick: () => setActiveFilter("all"),
            },
            {
              id: "ready",
              label: "Ready to Build",
              active: activeFilter === "ready",
              count: kpis.ready,
              onClick: () => setActiveFilter("ready"),
            },
            {
              id: "constrained",
              label: "Bottlenecked (0 Stock)",
              active: activeFilter === "constrained",
              count: kpis.constrained,
              onClick: () => setActiveFilter("constrained"),
            },
            {
              id: "incomplete",
              label: "Incomplete Recipes",
              active: activeFilter === "incomplete",
              count: kpis.incomplete,
              onClick: () => setActiveFilter("incomplete"),
            },
          ]}
        />

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input
            type="search"
            placeholder="Search variants or SKUs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-white border-slate-200/80 rounded-lg shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 5. Full-Width Micro-Card Product Stream */}
      <div className="w-full flex flex-col gap-2.5">
        {filteredProducts.length === 0 ? (
          <SovereignEmptyState
            icon={<ArchiveBox className="size-8 text-slate-400" />}
            heading="No buildable products found"
            description={search ? `No products match "${search}".` : "No products in this filter."}
            action={
              <Button size="small" variant="secondary" onClick={() => { setActiveFilter("all"); setSearch(""); }}>
                Show All SKUs
              </Button>
            }
          />
        ) : (
          filteredProducts.map((p) => {
            const isConfigured = p.recipe_status === "configured"
            const buildableStock = p.calculated_stock ?? 0
            const isReady = isConfigured && buildableStock > 0
            const bottleneck = p.limiting_items?.[0]?.inventory_item_title

            return (
              <AdminListRowCard
                key={p.variant_id}
                className="cursor-pointer group-hover:border-slate-300 group-hover:shadow-xs transition-all group"
                onClick={() => navigate(`/compounded-products/${p.product_id}?tab=bom`)}
                icon={<Component className={`size-4 ${isReady ? "text-emerald-600" : isConfigured ? "text-amber-600" : "text-slate-400"}`} />}
                title={
                  <span className="group-hover:text-blue-600 transition-colors">
                    {p.product_title || "Untitled Product"}
                  </span>
                }
                subtitle={
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-slate-800">{p.variant_title}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-500 text-[11px]">{p.sku || "NO-SKU"}</span>
                  </span>
                }
                badge={
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isReady
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isConfigured
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {isReady ? `${buildableStock} Units Ready` : isConfigured ? "Constrained (0 Stock)" : "Missing Recipe"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-purple-50 text-purple-700 border-purple-200">
                      Protocol Active
                    </span>
                    {bottleneck && !isReady && isConfigured && (
                      <span className="text-[10px] font-mono text-amber-600">
                        Bottleneck: {bottleneck}
                      </span>
                    )}
                  </div>
                }
                statusPill={
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 group-hover:text-blue-600 transition-colors hidden sm:inline">
                      BOM Cockpit
                    </span>
                    <div className="size-7 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all ml-1">
                      <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                }
                actions={
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      asChild
                      size="small"
                      variant="secondary"
                      className="h-7 px-2.5 text-xs font-semibold text-purple-600 hover:text-purple-700"
                    >
                      <Link to={`/research-protocols?q=${encodeURIComponent(p.product_title || "")}`}>
                        Protocol ↗
                      </Link>
                    </Button>
                  </div>
                }
              />
            )
          })
        )}
      </div>

      {/* 6. Horizontal Operational Action Suites Dock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Suite Card 1: Physical BOM Lot Allocation */}
        <AdminSuiteCard
          title="Physical BOM Allocation"
          eyebrow="Formulation Governance"
          icon={<Component className="size-4 text-blue-600" />}
          statusBadge="BOM Active"
          statusVariant="blue"
          description="Theoretical finished presentations are mapped to single or multi-vial BOM recipes. Available units dynamically adjust based on physical raw ingredient inventory."
          actionLabel="View Raw Material Registry"
          actionHref="/inventory-registry"
        >
          <div className="flex flex-col gap-2 pt-1 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Configured Formulations:</span>
              <span className="font-mono font-bold text-emerald-700">
                {kpis.ready + kpis.constrained} SKUs
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Active Stock Location:</span>
              <span className="font-mono font-bold text-slate-900">
                {selectedLocation?.name || "Central Vault"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 text-slate-600">
              <span>BOM Disaggregation Status:</span>
              <span className="font-mono font-bold text-blue-700">Real-Time Sync Active</span>
            </div>
          </div>
        </AdminSuiteCard>

        {/* Suite Card 2: Batch Replenishment Telemetry */}
        <AdminSuiteCard
          title="Raw Material Batch Replenishment"
          eyebrow="Procurement Sentry"
          icon={<Buildings className="size-4 text-emerald-600" />}
          statusBadge={kpis.constrained > 0 ? "Restock Required" : "Stock Healthy"}
          statusVariant={kpis.constrained > 0 ? "amber" : "emerald"}
          description="Calculates component requirements and alerts laboratory inventory technicians when peptide powder or bacteriostatic water reserves drop below minimum safety thresholds."
          actionLabel="Procure Raw Materials"
          actionHref="/inventory-studio"
        >
          <div className="flex flex-col gap-2 pt-1 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Constrained Products:</span>
              <span className="font-mono font-bold text-amber-700">{kpis.constrained} Items</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Lyophilized Active Powder SLA:</span>
              <span className="font-mono font-bold text-slate-900">≥ 99.0% CAS Purity</span>
            </div>
            <div className="flex items-center justify-between py-1 text-slate-600">
              <span>Next Compounding Run:</span>
              <span className="font-mono font-bold text-emerald-700">Automated On Demand</span>
            </div>
          </div>
        </AdminSuiteCard>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Component Inventory",
  icon: Component,
  rank: 7,
})

export default BuildableProductsPage
