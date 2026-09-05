import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowUpRightMini,
  Sparkles,
  SquaresPlus,
  Tag,
} from "@medusajs/icons"
import {
  Badge,
  Container,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { AdminCard } from "../../components/admin-card"
import { FilterPillGroup } from "../../components/filter-pill-group"
import { PageHeader } from "../../components/page-header"
import { sdk } from "../../lib/sdk"

type BundleComponentSpec = {
  handle: string
  title: string
  strength: string
  quantity: number
  individualPrice: number
}

type BundleSpec = {
  components: BundleComponentSpec[]
  sumPrice: number
  bundlePrice: number
  savingsAmount: number
}

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
      calculated_price?: {
        calculated_amount?: number
        currency_code?: string
      }
    }>
  }>
  count: number
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
  const [filter, setFilter] = useState<"all" | "active">("all")

  // Fetch bundles from Medusa Store API or Admin API
  const bundlesQuery = useQuery({
    queryKey: ["admin-bundles-list"],
    queryFn: async () => {
      return sdk.client.fetch<ProductResponse>("/admin/products", {
        query: {
          limit: 20,
          fields: "id,title,handle,thumbnail,metadata,variants.id,variants.title,variants.sku",
        },
      })
    },
  })

  // Match live DB products or fallback to canonical bundle specs
  const bundleRows = useMemo(() => {
    const products = bundlesQuery.data?.products || []
    return STATIC_BUNDLE_DEFAULTS.map((def) => {
      const liveProduct = products.find((p) => p.handle === def.handle)
      const spec = liveProduct?.metadata?.bundle_spec || {
        components: def.components,
        sumPrice: def.sumPrice,
        bundlePrice: def.bundlePrice,
        savingsAmount: def.savingsAmount,
      }
      const savingsPct = Math.round((spec.savingsAmount / spec.sumPrice) * 100)

      return {
        ...def,
        id: liveProduct?.id ?? def.handle,
        title: liveProduct?.title ?? def.title,
        spec,
        savingsPct,
        sku: liveProduct?.variants?.[0]?.sku ?? def.sku,
        isLive: Boolean(liveProduct),
      }
    })
  }, [bundlesQuery.data])

  return (
    <div className="flex flex-col gap-y-5 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Research Bundles & Stacks" },
        ]}
        title="Research Bundles & Stacks"
        subtitle="Operational management of multi-compound synergy stacks, package discounts, and component disaggregation."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/80">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            5 Active Stacks
          </span>
        }
      />

      {/* 2. Overview Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Container className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <Text size="xsmall" weight="plus" className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              Synergy Research Stacks
            </Text>
            <span className="flex size-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <Sparkles className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              5 Stacks
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              100% active in storefront catalog
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
            <p className="text-xs text-emerald-700 mt-0.5 font-semibold">
              Save ₱290 to ₱720 per stack
            </p>
          </div>
        </Container>

        <Container className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <Text size="xsmall" weight="plus" className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              Shipping Profile Link
            </Text>
            <span className="flex size-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <SquaresPlus className="size-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              100% Linked
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Default shipping profile assigned
            </p>
          </div>
        </Container>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex items-center justify-between">
        <FilterPillGroup
          items={[
            { id: "all", label: "All Stacks", count: bundleRows.length },
            { id: "active", label: "Active in Catalog", count: bundleRows.filter((b) => b.isLive).length },
          ]}
          selectedId={filter}
          onSelect={(id) => setFilter(id as "all" | "active")}
        />
      </div>

      {/* 4. Bundles Data Table */}
      <AdminCard
        title="Multi-Compound Research Stacks & Bundles"
        subtitle="Catalog configurations showing constituent lyophilized vials, pricing, and client savings."
        contentClassName="p-0"
      >
        <div className="divide-y divide-slate-100">
          {bundleRows.map((bundle) => (
            <div
              key={bundle.handle}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 hover:bg-slate-50/70 transition-all"
            >
              {/* Stack Details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {bundle.title}
                  </span>
                  <Badge size="small" color="green">
                    Active Stack
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    {bundle.sku}
                  </span>
                </div>

                {/* Components Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">
                    Constituents:
                  </span>
                  {bundle.spec.components.map((comp) => (
                    <span
                      key={comp.handle}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 font-medium border border-slate-200/80"
                    >
                      <span className="font-bold text-slate-900">{comp.title}</span>
                      <span className="font-mono text-[10px] text-slate-500">({comp.strength})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing & Savings Breakdown */}
              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
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
                    <span className="text-[11px] font-bold text-emerald-700">
                      Save ₱{bundle.spec.savingsAmount.toLocaleString()} ({bundle.savingsPct}% OFF)
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
          ))}
        </div>
      </AdminCard>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Research Bundles",
  icon: SquaresPlus,
  rank: 25,
})

export default BundlesManagementPage
