import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArchiveBox,
  ArrowUpRightMini,
  ExclamationCircle,
  MagnifyingGlass,
  Sparkles,
  SquaresPlus,
  Tag,
  XMark,
} from "@medusajs/icons"
import {
  Badge,
  Container,
  Input,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { AdminCard } from "../../components/admin-card"
import { FilterPillGroup } from "../../components/filter-pill-group"
import { PageHeader } from "../../components/page-header"
import { sdk } from "../../lib/sdk"
import {
  type BundleComponentSpec,
  type BundleSpec,
  type ConstituentInventoryData,
  getBundleSavingsBreakdown,
  resolveBundleBuildableStatus,
} from "./bundle-bom-resolver"

type ProductResponse = {
  products: Array<{
    id: string
    title: string
    handle: string
    thumbnail: string | null
    metadata: {
      is_bundle?: boolean
      bundle_spec?: BundleSpec | null
      canonical_code?: string
    } | null
    variants: Array<{
      id: string
      title: string
      sku: string | null
      manage_inventory?: boolean
      allow_backorder?: boolean
      calculated_price?: {
        calculated_amount?: number
        currency_code?: string
      }
    }>
  }>
  count: number
}

type InventoryItemsResponse = {
  inventory_items: Array<{
    id: string
    sku: string | null
    title: string | null
    stocked_quantity?: number
    reserved_quantity?: number
    location_levels?: Array<{
      stocked_quantity: number
      reserved_quantity: number
    }>
  }>
}

const STATIC_BUNDLE_DEFAULTS: Array<{
  handle: string
  title: string
  sku: string
  components: BundleComponentSpec[]
  sumPrice: number
  bundlePrice: number
  savingsAmount: number
}> = [
  {
    handle: "ghk-cu-glutathione-bundle",
    title: "GHK-Cu + Glutathione Bundle",
    sku: "BNDL-GG-STACK",
    components: [
      { handle: "ghk-cu", title: "GHK-Cu", strength: "100MG", quantity: 1, individualPrice: 1170 },
      { handle: "glutathione-1500mg", title: "Glutathione", strength: "1500MG", quantity: 1, individualPrice: 1620 },
    ],
    sumPrice: 2790,
    bundlePrice: 2500,
    savingsAmount: 290,
  },
  {
    handle: "epithalon-glutathione-bundle",
    title: "Epithalon + Glutathione Bundle",
    sku: "BNDL-EG-STACK",
    components: [
      { handle: "epithalon", title: "Epithalon", strength: "10MG", quantity: 1, individualPrice: 1440 },
      { handle: "glutathione-1500mg", title: "Glutathione", strength: "1500MG", quantity: 1, individualPrice: 1620 },
    ],
    sumPrice: 3060,
    bundlePrice: 2700,
    savingsAmount: 360,
  },
  {
    handle: "epithalon-glutathione-nad-bundle",
    title: "Epithalon + Glutathione + NAD+ Bundle",
    sku: "BNDL-EGN-STACK",
    components: [
      { handle: "epithalon", title: "Epithalon", strength: "10MG", quantity: 1, individualPrice: 1440 },
      { handle: "glutathione-1500mg", title: "Glutathione", strength: "1500MG", quantity: 1, individualPrice: 1620 },
      { handle: "nad-plus-500mg", title: "NAD+", strength: "500MG", quantity: 1, individualPrice: 1620 },
    ],
    sumPrice: 4680,
    bundlePrice: 3960,
    savingsAmount: 720,
  },
  {
    handle: "glutathione-nad-ghk-cu-bundle",
    title: "Glutathione + NAD+ + GHK-Cu Bundle",
    sku: "BNDL-GNG-STACK",
    components: [
      { handle: "glutathione-1500mg", title: "Glutathione", strength: "1500MG", quantity: 1, individualPrice: 1620 },
      { handle: "nad-plus-500mg", title: "NAD+", strength: "500MG", quantity: 1, individualPrice: 1620 },
      { handle: "ghk-cu", title: "GHK-Cu", strength: "100MG", quantity: 1, individualPrice: 1170 },
    ],
    sumPrice: 4410,
    bundlePrice: 3950,
    savingsAmount: 460,
  },
  {
    handle: "nad-ghk-cu-bundle",
    title: "NAD+ + GHK-Cu Bundle",
    sku: "BNDL-NG-STACK",
    components: [
      { handle: "nad-plus-500mg", title: "NAD+", strength: "500MG", quantity: 1, individualPrice: 1620 },
      { handle: "ghk-cu", title: "GHK-Cu", strength: "100MG", quantity: 1, individualPrice: 1170 },
    ],
    sumPrice: 2790,
    bundlePrice: 2500,
    savingsAmount: 290,
  },
]

const BundlesManagementPage = () => {
  const [filter, setFilter] = useState<"all" | "active" | "buildable" | "constrained">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch all products with limit: 100 so all 5 catalog bundles and constituent products are found
  const productsQuery = useQuery({
    queryKey: ["admin-bundles-products-list"],
    queryFn: async () => {
      return sdk.client.fetch<ProductResponse>("/admin/products", {
        query: {
          limit: 100,
          fields: "id,title,handle,thumbnail,metadata,variants.id,variants.title,variants.sku,variants.manage_inventory,variants.allow_backorder",
        },
      })
    },
  })

  // Fetch inventory items to determine real-time stock levels
  const inventoryItemsQuery = useQuery({
    queryKey: ["admin-bundles-inventory-items"],
    queryFn: async () => {
      try {
        return await sdk.client.fetch<InventoryItemsResponse>("/admin/inventory-items", {
          query: { limit: 100 },
        })
      } catch {
        return { inventory_items: [] }
      }
    },
  })

  // Build a lookup map of constituent inventory levels
  const constituentStockMap = useMemo(() => {
    const stockMap: Record<string, ConstituentInventoryData> = {}
    const products = productsQuery.data?.products || []
    const inventoryItems = inventoryItemsQuery.data?.inventory_items || []

    const inventoryBySku = new Map<string, { stocked: number; reserved: number }>()
    for (const item of inventoryItems) {
      if (item.sku) {
        const stocked = item.stocked_quantity ?? 0
        const reserved = item.reserved_quantity ?? 0
        inventoryBySku.set(item.sku, { stocked, reserved })
      }
    }

    for (const p of products) {
      const primaryVariant = p.variants?.[0]
      const sku = primaryVariant?.sku || ""
      const isManaged = primaryVariant?.manage_inventory ?? false
      const inv = sku ? inventoryBySku.get(sku) : null

      stockMap[p.handle] = {
        stocked: inv?.stocked ?? 0,
        reserved: inv?.reserved ?? 0,
        manageInventory: isManaged,
      }
      stockMap[p.title.toLowerCase()] = stockMap[p.handle]
    }

    return stockMap
  }, [productsQuery.data, inventoryItemsQuery.data])

  // Match live DB products or fallback to canonical bundle specs and resolve buildable BOM status
  const bundleRows = useMemo(() => {
    const products = productsQuery.data?.products || []

    return STATIC_BUNDLE_DEFAULTS.map((def) => {
      const liveProduct = products.find((p) => p.handle === def.handle)
      const spec = liveProduct?.metadata?.bundle_spec || {
        components: def.components,
        sumPrice: def.sumPrice,
        bundlePrice: def.bundlePrice,
        savingsAmount: def.savingsAmount,
      }

      const { savingsAmount, savingsPercent } = getBundleSavingsBreakdown(
        spec.sumPrice,
        spec.bundlePrice,
      )

      const sku = liveProduct?.variants?.[0]?.sku ?? def.sku
      const bomStatus = resolveBundleBuildableStatus(
        sku,
        def.handle,
        spec.components,
        constituentStockMap,
      )

      return {
        ...def,
        id: liveProduct?.id ?? def.handle,
        title: liveProduct?.title ?? def.title,
        spec,
        savingsAmount,
        savingsPercent,
        sku,
        isLive: Boolean(liveProduct),
        bomStatus,
      }
    })
  }, [productsQuery.data, constituentStockMap])

  // Filter and search
  const filteredBundles = useMemo(() => {
    let list = bundleRows

    if (filter === "active") {
      list = list.filter((b) => b.isLive)
    } else if (filter === "buildable") {
      list = list.filter((b) => b.bomStatus.isAvailable)
    } else if (filter === "constrained") {
      list = list.filter((b) => !b.bomStatus.isAvailable || (b.bomStatus.limitingComponent && b.bomStatus.buildableQuantity <= 5))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((b) => {
        const titleMatch = b.title.toLowerCase().includes(q)
        const skuMatch = b.sku.toLowerCase().includes(q)
        const compMatch = b.spec.components.some((c) =>
          c.title.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q),
        )
        return titleMatch || skuMatch || compMatch
      })
    }

    return list
  }, [bundleRows, filter, searchQuery])

  // KPIs
  const kpis = useMemo(() => {
    const total = bundleRows.length
    const active = bundleRows.filter((b) => b.isLive).length
    const buildable = bundleRows.filter((b) => b.bomStatus.isAvailable).length
    const constrained = bundleRows.filter(
      (b) => !b.bomStatus.isAvailable || (b.bomStatus.limitingComponent && b.bomStatus.buildableQuantity <= 5),
    ).length

    return { total, active, buildable, constrained }
  }, [bundleRows])

  return (
    <div className="flex flex-col gap-y-5 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Research Bundles & Stacks" },
        ]}
        title="Research Bundles & Stacks"
        subtitle="Operational management of multi-compound synergy stacks, package discounts, and Bill of Materials (BOM) inventory disaggregation."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-200/80">
            <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
            {kpis.active} Active Stacks
          </span>
        }
      />

      {/* 2. Overview Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Container className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <Text size="xsmall" weight="plus" className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              Synergy Research Stacks
            </Text>
            <span className="flex size-7 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80">
              <Sparkles className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {kpis.total} Stacks
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {kpis.active} active in storefront catalog
            </p>
          </div>
        </Container>

        <Container className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <Text size="xsmall" weight="plus" className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              Buildable Ready
            </Text>
            <span className="flex size-7 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80">
              <ArchiveBox className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {kpis.buildable} Ready
            </div>
            <p className="text-xs text-blue-700 mt-0.5 font-medium">
              Sufficient constituent inventory
            </p>
          </div>
        </Container>

        <Container className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <Text size="xsmall" weight="plus" className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              Constrained Stacks
            </Text>
            <span className="flex size-7 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80">
              <ExclamationCircle className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {kpis.constrained} Stacks
            </div>
            <p className="text-xs text-amber-700 mt-0.5 font-medium">
              Vial stock bottleneck alert
            </p>
          </div>
        </Container>

        <Container className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <Text size="xsmall" weight="plus" className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              Package Savings Rate
            </Text>
            <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              <Tag className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              10% – 15% OFF
            </div>
            <p className="text-xs text-blue-700 mt-0.5 font-semibold">
              Ready for one-click fulfillment
            </p>
          </div>
        </Container>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPillGroup
          items={[
            { id: "all", label: "All Stacks", count: bundleRows.length },
            { id: "active", label: "Active in Catalog", count: kpis.active },
            { id: "buildable", label: "Buildable Ready", count: kpis.buildable },
            { id: "constrained", label: "Constrained", count: kpis.constrained },
          ]}
          selectedId={filter}
          onSelect={(id) => setFilter(id as typeof filter)}
        />

        <div className="relative flex items-center">
          <MagnifyingGlass className="absolute left-2.5 size-3.5 text-ui-fg-muted pointer-events-none" />
          <Input
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stack or constituent..."
            className="h-8 pl-8 pr-7 text-xs w-64"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-ui-fg-muted hover:text-ui-fg-base"
              title="Clear search"
            >
              <XMark className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* 4. Bundles Data Table */}
      <AdminCard
        title="Multi-Compound Research Stacks & Bundles"
        subtitle="Catalog configurations showing constituent lyophilized vials, live component stock, and BOM buildability."
        contentClassName="p-0"
      >
        <div className="divide-y divide-slate-100">
          {filteredBundles.map((bundle) => {
            const { bomStatus } = bundle
            const limiting = bomStatus.limitingComponent

            return (
              <div
                key={bundle.handle}
                className="flex flex-col gap-4 p-5 hover:bg-slate-50/70 transition-all"
              >
                {/* Top Line: Stack Title, Status Badges, SKU, and Buildable Indicator */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {bundle.title}
                    </span>
                    {bundle.isLive ? (
                      <Badge size="small" color="green">
                        Active Stack
                      </Badge>
                    ) : (
                      <Badge size="small" color="grey">
                        Catalog Inactive
                      </Badge>
                    )}
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      {bundle.sku}
                    </span>

                    {/* BOM Buildable Badge */}
                    {bomStatus.hasUntrackedComponents ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                        Dispatch Ready (Backorder)
                      </span>
                    ) : bomStatus.buildableQuantity === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                        Out of Stock (0 buildable)
                      </span>
                    ) : bomStatus.buildableQuantity <= 5 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                        Low Stock ({bomStatus.buildableQuantity} buildable)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                        In Stock ({bomStatus.buildableQuantity} buildable)
                      </span>
                    )}
                  </div>

                  {/* Pricing & Savings Breakdown */}
                  <div className="flex items-center gap-6">
                    <div className="text-left lg:text-right">
                      <div className="flex items-center lg:justify-end gap-2">
                        <span className="text-xs text-slate-400 line-through font-mono">
                          ₱{bundle.spec.sumPrice.toLocaleString()}
                        </span>
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          ₱{bundle.spec.bundlePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center lg:justify-end gap-1.5 mt-0.5">
                        <span className="text-[11px] font-bold text-blue-700">
                          Save ₱{bundle.savingsAmount.toLocaleString()} ({bundle.savingsPercent}% OFF)
                        </span>
                      </div>
                    </div>

                    {/* 1-Click Storefront Preview Link */}
                    <a
                      href={`http://localhost:8000/ph/products/${bundle.handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 text-xs font-bold shadow-xs transition-colors shrink-0"
                    >
                      <span>Preview Storefront</span>
                      <ArrowUpRightMini className="size-3.5" />
                    </a>
                  </div>
                </div>

                {/* Bottleneck Alert Banner if Constrained */}
                {limiting && limiting.status !== "untracked" && bomStatus.buildableQuantity <= 5 ? (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50/80 px-3 py-2 text-xs text-amber-800 border border-amber-200/80">
                    <ExclamationCircle className="size-4 shrink-0 text-amber-600" />
                    <span>
                      <strong>Inventory Bottleneck:</strong> Limiting component is{" "}
                      <span className="font-semibold">{limiting.title}</span> (
                      {limiting.availableStock} vial{limiting.availableStock === 1 ? "" : "s"} available, cap: {limiting.capacity} stack{limiting.capacity === 1 ? "" : "s"}).
                    </span>
                  </div>
                ) : null}

                {/* Constituents BOM Grid */}
                <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100/80">
                  <div className="text-[11px] font-semibold text-slate-500">
                    BOM Constituents &amp; Stock Availability:
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {bomStatus.constituents.map((comp) => {
                      const isLimiting = comp.isBottleneck && bomStatus.buildableQuantity <= 5

                      return (
                        <div
                          key={comp.handle}
                          className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                            isLimiting
                              ? "bg-amber-50/50 border-amber-300 text-amber-900"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900">{comp.title}</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              ({comp.strength} &times; {comp.requiredQuantity})
                            </span>
                          </div>

                          <span className="text-slate-300">&bull;</span>

                          {comp.status === "untracked" ? (
                            <span className="font-mono text-[10px] text-slate-500">
                              Stock Untracked
                            </span>
                          ) : comp.status === "out_of_stock" ? (
                            <span className="font-mono text-[10px] font-bold text-red-600">
                              0 in stock
                            </span>
                          ) : (
                            <span
                              className={`font-mono text-[10px] font-semibold ${
                                comp.status === "low_stock" ? "text-amber-700" : "text-blue-700"
                              }`}
                            >
                              {comp.availableStock} available
                            </span>
                          )}

                          {isLimiting ? (
                            <span className="rounded bg-amber-200/80 px-1 py-0.2 text-[9px] font-bold text-amber-900 uppercase">
                              Bottleneck
                            </span>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </AdminCard>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Bundles",
  icon: SquaresPlus,
  rank: 4,
})

export default BundlesManagementPage
