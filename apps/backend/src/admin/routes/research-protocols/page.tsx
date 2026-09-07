import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BookOpen, MagnifyingGlass, Plus, XMark } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  type DataTablePaginationState,
  Input,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { EmptyState } from "../../components/empty-state"
import { FilterPillGroup } from "../../components/filter-pill-group"
import { KpiCard } from "../../components/kpi-card"
import { PageHeader } from "../../components/page-header"
import { sdk } from "../../lib/sdk"
import type {
  ResearchProtocolListResponse,
  ResearchProtocolSeries,
} from "../compounded-products/research-protocol-types"
import { evaluatePublicationReadiness } from "./readiness-evaluator"

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
  const published = protocol.revisions.find(
    (revision) => revision.status === "published",
  )
  if (published) {
    return { label: "Published & Ready", color: "green" as const }
  }

  const latest = protocol.revisions[0]
  if (!latest) {
    return { label: "Unchecked", color: "grey" as const }
  }

  if (latest.status === "withdrawn") {
    return { label: "Withdrawn", color: "grey" as const }
  }

  const evaluation = evaluatePublicationReadiness(latest.content)
  if (evaluation.isReady) {
    return { label: "Ready to Publish", color: "green" as const }
  }

  const missingCount = evaluation.totalCount - evaluation.passedCount
  return {
    label: `Draft (${missingCount} missing)`,
    color: "orange" as const,
  }
}

const ProtocolStatusBadge = ({
  children,
  color,
  className = "",
}: {
  children: React.ReactNode
  color: "green" | "purple" | "blue" | "orange" | "grey"
  className?: string
}) => {
  const colorStyles = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    orange: "bg-amber-50 text-amber-700 border-amber-200",
    grey: "bg-zinc-100 text-zinc-600 border-zinc-200",
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${colorStyles[color]} ${className}`}
    >
      {children}
    </span>
  )
}

const ResearchProtocolsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const protocolsQuery = useQuery({
    queryKey: ["research-protocols", "catalog-all"],
    queryFn: () =>
      sdk.client.fetch<ResearchProtocolListResponse>(
        "/admin/research-protocols",
        {
          query: {
            limit: 100,
            offset: 0,
          },
        },
      ),
    placeholderData: keepPreviousData,
  })

  const allProtocols = protocolsQuery.data?.protocols || []

  // Compute accurate global KPIs across the entire catalog
  const kpis = useMemo(() => {
    const total = protocolsQuery.data?.count ?? allProtocols.length
    const singlePeptides = allProtocols.filter(
      (p) => p.revisions[0]?.content?.protocol_category_type !== "blend",
    ).length
    const blends = allProtocols.filter(
      (p) => p.revisions[0]?.content?.protocol_category_type === "blend",
    ).length
    const published = allProtocols.filter(
      (p) => p.revisions.some((r) => r.status === "published"),
    ).length
    const draft = allProtocols.filter(
      (p) => !p.revisions.some((r) => r.status === "published"),
    ).length
    const totalLinked = allProtocols.reduce(
      (acc, p) => acc + (p.product_links?.length || 0),
      0,
    )

    return { total, singlePeptides, blends, published, draft, totalLinked }
  }, [allProtocols, protocolsQuery.data?.count])

  // Filter and search over all protocols
  const filteredProtocols = useMemo(() => {
    let result = allProtocols

    if (activeFilter === "singles") {
      result = result.filter(
        (p) => p.revisions[0]?.content?.protocol_category_type !== "blend",
      )
    } else if (activeFilter === "blends") {
      result = result.filter(
        (p) => p.revisions[0]?.content?.protocol_category_type === "blend",
      )
    } else if (activeFilter === "published") {
      result = result.filter((p) =>
        p.revisions.some((r) => r.status === "published"),
      )
    } else if (activeFilter === "draft") {
      result = result.filter(
        (p) => !p.revisions.some((r) => r.status === "published"),
      )
    } else if (activeFilter === "linked") {
      result = result.filter(
        (p) => (p.product_links?.length || 0) > 0,
      )
    } else if (activeFilter === "unlinked") {
      result = result.filter(
        (p) => (p.product_links?.length || 0) === 0,
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) => {
        const latest = p.revisions[0]
        const keyMatch = p.protocol_key.toLowerCase().includes(q)
        const titleMatch = latest?.title?.toLowerCase().includes(q)
        const compoundMatch = latest?.content?.compound_name?.toLowerCase().includes(q)
        return keyMatch || titleMatch || compoundMatch
      })
    }

    return result
  }, [allProtocols, activeFilter, searchQuery])

  // Reset pagination to page 0 whenever filter or search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [activeFilter, searchQuery])

  // Paged slice for data table
  const pagedProtocols = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    return filteredProtocols.slice(start, start + pagination.pageSize)
  }, [filteredProtocols, pagination])

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
                <span>{latest?.title || row.original.protocol_key}</span>
              </Link>
              <span className="font-mono text-[10px] text-ui-fg-subtle">
                {row.original.protocol_key}
              </span>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "classification",
        header: "Classification",
        cell: ({ row }) => {
          const latest = row.original.revisions[0]
          const isBlend = latest?.content?.protocol_category_type === "blend"
          return isBlend ? (
            <ProtocolStatusBadge color="purple" className="font-mono text-[10px]">
              Multi-Peptide Blend
            </ProtocolStatusBadge>
          ) : (
            <ProtocolStatusBadge color="blue" className="font-mono text-[10px]">
              Single Peptide
            </ProtocolStatusBadge>
          )
        },
      }),
      columnHelper.display({
        id: "compatible_products",
        header: "Compatible products",
        cell: ({ row }) => {
          const count = row.original.product_links?.length || 0
          return count > 0 ? (
            <ProtocolStatusBadge color="blue" className="font-mono text-[11px]">
              {count} {count === 1 ? "product" : "products"}
            </ProtocolStatusBadge>
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
            <ProtocolStatusBadge color={status.color}>
              {status.label}
            </ProtocolStatusBadge>
          )
        },
      }),
      columnHelper.display({
        id: "latest_revision",
        header: "Latest revision",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-ui-fg-subtle">
            r{row.original.revisions[0]?.revision || 1}
          </span>
        ),
      }),
      columnHelper.display({
        id: "readiness",
        header: "Readiness Check",
        cell: ({ row }) => {
          const readiness = readinessDetails(row.original)
          return (
            <ProtocolStatusBadge color={readiness.color} className="capitalize text-[10px]">
              {readiness.label}
            </ProtocolStatusBadge>
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
    data: pagedProtocols,
    columns,
    getRowId: (protocol) => protocol.id,
    rowCount: filteredProtocols.length,
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
          { label: "Product Protocols" },
        ]}
        title="Product Protocols"
        subtitle="Manage independent, versioned product analytical protocols, stoichiometry, and dosage routines across single peptides and multi-peptide blends."
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
          status="neutral"
          subtext="Authoritative product protocols"
        />
        <KpiCard
          title="Single Peptides"
          value={kpis.singlePeptides}
          status="healthy"
          subtext="Single compound monographs"
        />
        <KpiCard
          title="Multi-Peptide Blends"
          value={kpis.blends}
          status="info"
          subtext="Multi-compound formulations"
        />
        <KpiCard
          title="Product Links"
          value={kpis.totalLinked}
          status="info"
          subtext="Cross-catalog associations"
        />
      </div>

      {/* 3. Main Data Container */}
      <Container className="divide-y p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base">
        {/* Filter Pills Toolbar & Live Search Input */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ui-bg-subtle/20 border-b border-ui-border-base">
          <FilterPillGroup
            items={[
              { id: "all", label: "All Protocols", count: kpis.total },
              { id: "singles", label: "Single Peptides", count: kpis.singlePeptides, badgeColor: "blue" },
              { id: "blends", label: "Multi-Peptide Blends", count: kpis.blends, badgeColor: "purple" },
              { id: "published", label: "Published", count: kpis.published, badgeColor: "green" },
              { id: "draft", label: "Draft", count: kpis.draft, badgeColor: "orange" },
              { id: "linked", label: "Linked Products", count: kpis.totalLinked },
            ]}
            selectedId={activeFilter}
            onSelect={(id) => setActiveFilter(id)}
          />

          <div className="relative flex items-center">
            <MagnifyingGlass className="absolute left-2.5 size-3.5 text-ui-fg-muted pointer-events-none" />
            <Input
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search protocol or compound..."
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

        {protocolsQuery.isError ? (
          <div className="p-6 text-center">
            <Text size="small" className="text-ui-fg-error">
              Research protocols could not be loaded.
            </Text>
          </div>
        ) : null}

        {!protocolsQuery.isLoading && filteredProtocols.length === 0 ? (
          <EmptyState
            title={allProtocols.length === 0 ? "No research protocols yet" : "No research protocols found"}
            description={
              searchQuery
                ? `No protocols matching "${searchQuery}". Clear your search or change filters.`
                : "No protocols match the selected filter. Create a new protocol or switch filters."
            }
            actionLabel={searchQuery ? "Clear Search" : "Show All Protocols"}
            onAction={() => {
              setSearchQuery("")
              setActiveFilter("all")
            }}
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
  icon: BookOpen,
  rank: 9,
})

export default ResearchProtocolsPage
