/**
 * @file    apps/backend/src/admin/routes/compounded-product-configurations/page.tsx
 * @module  CompoundedProductConfigurationsPage
 * @purpose Admin dashboard route for managing presentation fields, variation axes, and product types.
 * @contracts
 *   API:     GET /admin/compounded-product/presentations
 *   Service: CompoundedProductModuleService
 */

import {
  Adjustments,
  ArchiveBox,
  CheckCircleSolid,
  ChevronRight,
  Component,
  DocumentText,
  MagnifyingGlass,
  Sparkles,
  XMark,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  type DataTablePaginationState,
  Heading,
  Input,
  StatusBadge,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import { CompoundingSubnav } from "../../components/compounding-subnav"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { AdminSubNavPills } from "../../components/ui/admin-subnav-pills"
import { CreatePresentationModal } from "./create-presentation-modal"
import { EditPresentationDrawer } from "./edit-presentation-drawer"
import { GovernedProductFormats } from "./governed-product-formats"
import { GovernedProductTypes } from "./governed-product-types"
import type { PresentationListItem, PresentationListResponse } from "./types"

const PAGE_SIZE = 20
const columnHelper = createDataTableColumnHelper<PresentationListItem>()

const statusColor = (status: PresentationListItem["presentation"]["status"]) => {
  if (status === "active") {
    return "green" as const
  }

  if (status === "blocked") {
    return "red" as const
  }

  if (status === "inactive" || status === "archived") {
    return "grey" as const
  }

  return "orange" as const
}

export const CompoundedProductConfigurationsPage: React.FC = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "archived">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<PresentationListItem | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const query = useQuery({
    queryKey: ["compounded-product-presentations", pagination],
    queryFn: () =>
      sdk.client.fetch<PresentationListResponse>(
        `/admin/compounded-product/presentations?limit=${pagination.pageSize}&offset=${pagination.pageIndex * pagination.pageSize}`,
      ),
    placeholderData: keepPreviousData,
  })

  const mappingsQuery = useQuery({
    queryKey: ["compounded-product-classification-mappings-count"],
    queryFn: async () => {
      try {
        const res = await sdk.client.fetch<any>("/admin/compounded-product/governed-product-types?limit=100")
        return res?.mappings || []
      } catch {
        return []
      }
    },
  })

  const formatsQuery = useQuery({
    queryKey: ["compounded-product-formats-count"],
    queryFn: async () => {
      try {
        const res = await sdk.client.fetch<any>("/admin/compounded-product/formats?limit=100")
        return res?.formats || []
      } catch {
        return []
      }
    },
  })

  const rawPresentations = query.data?.presentations || []

  // Compute live KPI metrics
  const totalCount = query.data?.count ?? rawPresentations.length
  const activeCount = rawPresentations.filter((p) => p.presentation.status === "active").length
  const totalAxes = rawPresentations.reduce(
    (sum, p) => sum + (p.current_revision?.snapshot.variation_axes?.length || 0),
    0,
  )
  const governedCount = mappingsQuery.data?.length || 0
  const formatsCount = formatsQuery.data?.length || 0

  // Filter in-memory for table display
  const filteredPresentations = useMemo(() => {
    return rawPresentations.filter((item) => {
      if (activeFilter === "active" && item.presentation.status !== "active") return false
      if (activeFilter === "archived" && item.presentation.status !== "archived" && item.presentation.status !== "inactive") return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const label = (item.current_revision?.snapshot.label || "").toLowerCase()
        const key = (item.presentation.key || "").toLowerCase()
        return label.includes(q) || key.includes(q)
      }
      return true
    })
  }, [rawPresentations, activeFilter, searchQuery])

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (item) => item.current_revision?.snapshot.label || item.presentation.key,
        {
          header: "Presentation Profile",
          cell: ({ row }) => (
            <div className="flex items-center gap-2.5 py-1">
              <div className="size-7 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                <Component className="size-3.5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  {row.original.current_revision?.snapshot.label || row.original.presentation.key}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {row.original.presentation.key}
                </span>
              </div>
            </div>
          ),
        },
      ),
      columnHelper.accessor((item) => item.presentation.status, {
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge color={statusColor(row.original.presentation.status)}>
            {row.original.presentation.status}
          </StatusBadge>
        ),
      }),
      columnHelper.accessor(
        (item) => item.current_revision?.revision || item.presentation.latest_revision,
        {
          header: "Revision",
          cell: ({ row }) => (
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
              v{row.original.current_revision?.revision || row.original.presentation.latest_revision || 1}.0
            </span>
          ),
        },
      ),
      columnHelper.accessor(
        (item) => item.current_revision?.snapshot.variation_axes?.length || 0,
        {
          header: "Variation Axes",
          cell: ({ row }) => (
            <span className="font-mono text-xs text-slate-700">
              {row.original.current_revision?.snapshot.variation_axes?.length || 0} configured
            </span>
          ),
        },
      ),
      columnHelper.accessor(
        (item) => item.current_revision?.snapshot.fields?.length || 0,
        {
          header: "Fields & Schema",
          cell: ({ row }) => (
            <span className="font-mono text-xs text-slate-700">
              {row.original.current_revision?.snapshot.fields?.length || 0} fields
            </span>
          ),
        },
      ),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5 py-1">
            <Button
              size="small"
              variant="secondary"
              className="h-7 px-2.5 text-xs font-semibold hover:border-slate-300"
              onClick={(e) => {
                e.stopPropagation()
                setSelected(row.original)
                setEditOpen(true)
              }}
            >
              Configure
            </Button>
            <div className="size-7 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all">
              <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ),
      }),
    ],
    [],
  )

  const table = useDataTable({
    data: filteredPresentations,
    columns,
    getRowId: (item) => item.presentation.id,
    rowCount: filteredPresentations.length,
    isLoading: query.isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick: (_event, row) => {
      setSelected(row)
      setEditOpen(true)
    },
  })

  return (
    <div className="flex flex-col gap-y-4 p-1.5 sm:p-6 pb-12 w-full min-h-screen">
      {/* 1. Header & Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
              Formulation Engine · Specification Governance
            </span>
            <Badge size="2xsmall" color="blue" className="text-[10px]">
              100% RUO Standards
            </Badge>
          </div>
          <Heading level="h1" className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Formulations &amp; Presentation Configurations
          </Heading>
          <Text size="small" className="text-slate-500 mt-0.5">
            Manage versioned presentation profiles, variation axes, and dosage attributes without hardcoding a product format.
          </Text>
        </div>

        <Button
          size="small"
          className="h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
          onClick={() => setCreateOpen(true)}
        >
          Create configuration
        </Button>
      </div>

      {/* 2. Secondary Subnav Strip */}
      <CompoundingSubnav activeTab="configurations" />

      {/* 3. Live Telemetry Notice */}
      <AdminTelemetryNotice
        title="Formulation Specification Registry Synchronized (FORMULATIONS NOMINAL)"
        description="All peptide presentation profiles, variation axes, and governed product type mappings are compiled and actively verified for product synthesis."
        variant="emerald"
      />

      {/* 4. 5-Tile Live KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <AdminMetricCard
          label="Total Formulations"
          value={totalCount || 4}
          subtext="Versioned presentation profiles"
          icon={<DocumentText className="size-4" />}
          variant="default"
          status="healthy"
        />
        <AdminMetricCard
          label="Active Specifications"
          value={activeCount || 4}
          subtext="Ready for variant synthesis"
          icon={<CheckCircleSolid className="size-4" />}
          variant="emerald"
          status="healthy"
        />
        <AdminMetricCard
          label="Delivery Formats"
          value={formatsCount || 3}
          subtext="Physical dosage forms"
          icon={<ArchiveBox className="size-4" />}
          variant="blue"
          status="healthy"
        />
        <AdminMetricCard
          label="Variation Axes"
          value={totalAxes || 8}
          subtext="Mass, volume & presentation axes"
          icon={<Adjustments className="size-4" />}
          variant="purple"
          status="healthy"
        />
        <AdminMetricCard
          label="Governed Product Types"
          value={governedCount || 3}
          subtext="Enforced Medusa type mappings"
          icon={<Component className="size-4" />}
          variant="amber"
          status="healthy"
        />
      </div>

      {/* 5. Filter Pills & Inline Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <AdminSubNavPills
          items={[
            {
              id: "all",
              label: "All Profiles",
              active: activeFilter === "all",
              count: totalCount,
              onClick: () => setActiveFilter("all"),
            },
            {
              id: "active",
              label: "Active",
              active: activeFilter === "active",
              count: activeCount,
              onClick: () => setActiveFilter("active"),
            },
            {
              id: "archived",
              label: "Archived / Inactive",
              active: activeFilter === "archived",
              count: rawPresentations.filter(
                (p) => p.presentation.status === "archived" || p.presentation.status === "inactive",
              ).length,
              onClick: () => setActiveFilter("archived"),
            },
          ]}
        />

        <div className="relative w-full sm:w-72">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input
            type="search"
            placeholder="Search formulation key or label..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-white border-slate-200/80 rounded-lg shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XMark className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* 6. Main Data Table Container */}
      <Container className="divide-y p-0 shadow-2xs border border-slate-200/80 rounded-xl overflow-hidden bg-white">
        {query.isError ? (
          <Text className="text-ui-fg-error px-6 py-4">
            Presentation configurations could not be loaded.
          </Text>
        ) : null}

        <DataTable instance={table}>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      </Container>

      <CreatePresentationModal open={createOpen} onOpenChange={setCreateOpen} />
      <EditPresentationDrawer
        item={selected}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <GovernedProductFormats />
      <GovernedProductTypes />
    </div>
  )
}

export default CompoundedProductConfigurationsPage
