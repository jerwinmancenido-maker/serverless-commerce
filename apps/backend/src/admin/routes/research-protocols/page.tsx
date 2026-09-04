import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BookOpen, Plus } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  type DataTablePaginationState,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { EmptyState } from "../../components/empty-state"
import { FilterPillGroup } from "../../components/filter-pill-group"
import { KpiCard } from "../../components/kpi-card"
import { PageHeader } from "../../components/page-header"
import { sdk } from "../../lib/sdk"
import type {
  ResearchProtocolListResponse,
  ResearchProtocolSeries,
  ResearchProtocolStatus,
} from "../compounded-products/research-protocol-types"

const PAGE_SIZE = 20
const columnHelper = createDataTableColumnHelper<ResearchProtocolSeries>()

const statusDetails = (protocol: ResearchProtocolSeries) => {
  const published = protocol.revisions.find(
    (revision) => revision.status === "published",
  )

  if (published) {
    return { label: "Published", color: "green" as const }
  }

  const latest = protocol.revisions[0]
  if (latest?.status === "withdrawn") {
    return { label: "Withdrawn", color: "grey" as const }
  }

  return { label: "Draft", color: "orange" as const }
}

const readinessDetails = (protocol: ResearchProtocolSeries) => {
  const latest = protocol.revisions[0]
  const readiness = latest?.readiness

  if (!readiness) {
    return { label: "Unchecked", color: "grey" as const }
  }

  if (readiness.is_ready) {
    return { label: "Ready", color: "green" as const }
  }

  return {
    label: readiness.reasons[0]?.replaceAll("_", " ") || "Needs review",
    color: "orange" as const,
  }
}

const ResearchProtocolsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [activeFilter, setActiveFilter] = useState("all")

  const protocolsQuery = useQuery({
    queryKey: ["research-protocols", "all", pagination],
    queryFn: () =>
      sdk.client.fetch<ResearchProtocolListResponse>(
        "/admin/research-protocols",
        {
          query: {
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
          },
        },
      ),
    placeholderData: keepPreviousData,
  })

  const rawProtocols = protocolsQuery.data?.protocols || []

  // Compute KPIs
  const kpis = useMemo(() => {
    const total = protocolsQuery.data?.count ?? rawProtocols.length
    const published = rawProtocols.filter(
      (p) => p.revisions.some((r) => r.status === "published"),
    ).length
    const draft = rawProtocols.filter(
      (p) => !p.revisions.some((r) => r.status === "published"),
    ).length
    const totalLinked = rawProtocols.reduce(
      (acc, p) => acc + (p.compatible_products?.length || 0),
      0,
    )

    return { total, published, draft, totalLinked }
  }, [rawProtocols, protocolsQuery.data?.count])

  // Filter based on active filter pill
  const filteredProtocols = useMemo(() => {
    if (activeFilter === "published") {
      return rawProtocols.filter((p) =>
        p.revisions.some((r) => r.status === "published"),
      )
    }
    if (activeFilter === "draft") {
      return rawProtocols.filter(
        (p) => !p.revisions.some((r) => r.status === "published"),
      )
    }
    if (activeFilter === "linked") {
      return rawProtocols.filter(
        (p) => (p.compatible_products?.length || 0) > 0,
      )
    }
    if (activeFilter === "unlinked") {
      return rawProtocols.filter(
        (p) => (p.compatible_products?.length || 0) === 0,
      )
    }
    return rawProtocols
  }, [rawProtocols, activeFilter])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "protocol",
        header: "Protocol Title & Handle",
        cell: ({ row }) => {
          const latest = row.original.revisions[0]
          return (
            <div className="flex min-w-0 flex-col gap-0.5 py-1">
              <Link
                className="w-fit font-semibold hover:text-ui-fg-interactive text-xs inline-flex items-center gap-1.5"
                to={`/research-protocols/${row.original.id}`}
              >
                <span>🔬</span>
                <span>{latest?.title || row.original.handle}</span>
              </Link>
              <span className="font-mono text-[10px] text-ui-fg-subtle">
                {row.original.handle}
              </span>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "compatible_products",
        header: "Compatible products",
        cell: ({ row }) => {
          const count = row.original.compatible_products?.length || 0
          return count > 0 ? (
            <Badge size="small" color="blue" className="font-mono text-[11px]">
              💊 {count} {count === 1 ? "product" : "products"}
            </Badge>
          ) : (
            <span className="text-ui-fg-muted text-xs italic">None</span>
          )
        },
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = statusDetails(row.original)
          return (
            <Badge size="small" color={status.color}>
              {status.label}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: "latest_revision",
        header: "Latest revision",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-ui-fg-subtle">
            r{row.original.revisions[0]?.revision_number || 1}
          </span>
        ),
      }),
      columnHelper.display({
        id: "readiness",
        header: "Readiness Check",
        cell: ({ row }) => {
          const readiness = readinessDetails(row.original)
          return (
            <Badge size="small" color={readiness.color} className="capitalize text-[10px]">
              {readiness.label}
            </Badge>
          )
        },
      }),
      columnHelper.display({
        id: "updated_at",
        header: "Updated",
        cell: ({ row }) => {
          const latest = row.original.revisions[0]
          return (
            <span className="text-xs text-ui-fg-subtle">
              {new Date(latest?.updated_at || row.original.updated_at).toLocaleDateString("en-PH")}
            </span>
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button asChild size="small" variant="secondary" className="h-7 text-xs">
              <Link to={`/research-protocols/${row.original.id}/preview`}>
                Preview
              </Link>
            </Button>
          </div>
        ),
      }),
    ],
    [],
  )

  const table = useDataTable({
    data: filteredProtocols,
    columns,
    getRowId: (protocol) => protocol.id,
    rowCount: protocolsQuery.data?.count || 0,
    isLoading: protocolsQuery.isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* 1. Standard PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: "Research Protocols" },
        ]}
        title="Research Protocols"
        subtitle="Manage independent, versioned clinical research guides, dosage routines, and linked peptide products."
        actions={
          <Button asChild size="small" className="h-8 text-xs inline-flex items-center gap-1">
            <Link to="/research-protocols/new">
              <Plus /> Add protocol
            </Link>
          </Button>
        }
      />

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Protocols"
          value={kpis.total}
          icon="🔬"
          status="neutral"
          subtext="Standardized dosing guides"
        />
        <KpiCard
          title="Published & Live"
          value={kpis.published}
          icon="✅"
          status="healthy"
          subtext="Available on storefront"
        />
        <KpiCard
          title="Draft / In Review"
          value={kpis.draft}
          icon="📝"
          status={kpis.draft > 0 ? "warning" : "healthy"}
          subtext="Unpublished revisions"
        />
        <KpiCard
          title="Product Links"
          value={kpis.totalLinked}
          icon="💊"
          status="info"
          subtext="Cross-catalog associations"
        />
      </div>

      {/* 3. Main Data Container */}
      <Container className="divide-y p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base">
        {/* Filter Pills Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ui-bg-subtle/20 border-b border-ui-border-base">
          <FilterPillGroup
            items={[
              { id: "all", label: "All Protocols", count: kpis.total },
              { id: "published", label: "Published", count: kpis.published, badgeColor: "green" },
              { id: "draft", label: "Draft", count: kpis.draft, badgeColor: "orange" },
              { id: "linked", label: "Linked Products", count: kpis.totalLinked },
              { id: "unlinked", label: "Unlinked" },
            ]}
            selectedId={activeFilter}
            onSelect={(id) => setActiveFilter(id)}
          />
        </div>

        {protocolsQuery.isError ? (
          <div className="p-6 text-center">
            <Text size="small" className="text-ui-fg-error">
              Research protocols could not be loaded.
            </Text>
          </div>
        ) : null}

        {!protocolsQuery.isLoading && filteredProtocols.length === 0 ? (
          <EmptyState
            icon="🔬"
            title={rawProtocols.length === 0 ? "No research protocols yet" : "No research protocols found"}
            description="No protocols match the selected filter. Create a new protocol or switch filters."
            actionLabel="Show All Protocols"
            onAction={() => setActiveFilter("all")}
          />
        ) : (
          <DataTable instance={table}>
            <DataTable.Table />
            <DataTable.Pagination />
          </DataTable>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Research Protocols",
  nested: "/products",
})

export default ResearchProtocolsPage
