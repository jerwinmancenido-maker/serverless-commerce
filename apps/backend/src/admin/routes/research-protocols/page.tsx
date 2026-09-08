import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BookOpen, MagnifyingGlass, Plus, XMark } from "@medusajs/icons"
import {
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
import { KpiCard } from "../../components/kpi-card"
import { PageHeader } from "../../components/page-header"
import { AdminBadge } from "../../components/ui/admin-badge"
import { AdminSegmentedTabs } from "../../components/ui/admin-segmented-tabs"
import { AdminReconstitutionCalculator } from "../../components/clinical/admin-reconstitution-calculator"
import { CustomerMonographPreviewModal } from "../../components/protocols/customer-monograph-preview-modal"
import { sdk } from "../../lib/sdk"
import type {
  ResearchProtocolListResponse,
  ResearchProtocolSeries,
} from "../compounded-products/research-protocol-types"
import { evaluatePublicationReadiness } from "./readiness-evaluator"

const PAGE_SIZE = 20
const columnHelper = createDataTableColumnHelper<ResearchProtocolSeries>()

const isSupplyProtocol = (p: ResearchProtocolSeries) => {
  const content = p.revisions[0]?.content
  const cat = content?.category
  const isSupplyFlag = Boolean((content as Record<string, unknown> | undefined)?.isSupply)
  const format = content?.product_format?.toLowerCase() || ""
  return (
    cat === "Laboratory Supplies" ||
    isSupplyFlag ||
    format.includes("consumable") ||
    format.includes("hardware") ||
    format.includes("labware")
  )
}

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
  const variant = color === "green" ? "blue" : color === "orange" ? "amber" : color === "grey" ? "slate" : color
  return (
    <AdminBadge variant={variant} className={className}>
      {children}
    </AdminBadge>
  )
}

const ResearchProtocolsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [previewProtocol, setPreviewProtocol] = useState<ResearchProtocolSeries | null>(null)
  const [showCalculatorWorkbench, setShowCalculatorWorkbench] = useState<boolean>(false)

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
    const supplies = allProtocols.filter((p) => isSupplyProtocol(p)).length
    const blends = allProtocols.filter(
      (p) => !isSupplyProtocol(p) && p.revisions[0]?.content?.protocol_category_type === "blend",
    ).length
    const singlePeptides = allProtocols.filter(
      (p) => !isSupplyProtocol(p) && p.revisions[0]?.content?.protocol_category_type !== "blend",
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

    return { total, singlePeptides, blends, supplies, published, draft, totalLinked }
  }, [allProtocols, protocolsQuery.data?.count])

  // Filter and search over all protocols
  const filteredProtocols = useMemo(() => {
    let result = allProtocols

    if (activeFilter === "singles") {
      result = result.filter(
        (p) => !isSupplyProtocol(p) && p.revisions[0]?.content?.protocol_category_type !== "blend",
      )
    } else if (activeFilter === "blends") {
      result = result.filter(
        (p) => !isSupplyProtocol(p) && p.revisions[0]?.content?.protocol_category_type === "blend",
      )
    } else if (activeFilter === "supplies") {
      result = result.filter((p) => isSupplyProtocol(p))
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
          const isSupply = isSupplyProtocol(row.original)
          if (isSupply) {
            return (
              <AdminBadge variant="slate" dot className="font-mono text-[10px]">
                Laboratory Supply
              </AdminBadge>
            )
          }
          const latest = row.original.revisions[0]
          const isBlend = latest?.content?.protocol_category_type === "blend"
          return isBlend ? (
            <AdminBadge variant="purple" dot className="font-mono text-[10px]">
              Multi-Peptide Blend
            </AdminBadge>
          ) : (
            <AdminBadge variant="blue" dot className="font-mono text-[10px]">
              Single Peptide
            </AdminBadge>
          )
        },
      }),
      columnHelper.display({
        id: "compatible_products",
        header: "Compatible products",
        cell: ({ row }) => {
          const count = row.original.product_links?.length || 0
          return count > 0 ? (
            <AdminBadge variant="blue" dot className="font-mono text-[10px]">
              {count} {count === 1 ? "product" : "products"}
            </AdminBadge>
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
          const variant = status.color === "green" ? "blue" : status.color === "orange" ? "amber" : "slate"
          return (
            <AdminBadge variant={variant} dot>
              {status.label}
            </AdminBadge>
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
          const variant = readiness.color === "green" ? "blue" : readiness.color === "orange" ? "amber" : "slate"
          return (
            <AdminBadge variant={variant} className="capitalize text-[10px]">
              {readiness.label}
            </AdminBadge>
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
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setPreviewProtocol(row.original)}
              className="h-7 text-xs font-semibold px-2.5 text-slate-700 hover:text-slate-950 bg-white"
            >
              Customer Preview
            </Button>
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
        subtitle="Manage independent, versioned product analytical protocols, stoichiometry, and dosage routines across single peptides, multi-peptide blends, and laboratory supplies."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant={showCalculatorWorkbench ? "primary" : "secondary"}
              onClick={() => setShowCalculatorWorkbench((prev) => !prev)}
              className="h-8 text-xs font-semibold"
            >
              {showCalculatorWorkbench ? "Hide Syringe Workbench" : "Syringe Workbench"}
            </Button>
            <Button asChild size="small" className="h-8 text-xs inline-flex items-center gap-1">
              <Link to="/research-protocols/new">
                <Plus /> Add protocol
              </Link>
            </Button>
          </div>
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
          title="Laboratory Supplies"
          value={kpis.supplies}
          status="info"
          subtext="Cryo labware & reconstitution"
        />
      </div>

      {/* 3. Clinical Calculator Workbench (Optional Drawer) */}
      {showCalculatorWorkbench && (
        <AdminReconstitutionCalculator
          compoundName="Clinical Stoichiometry Workbench"
          initialMass={10}
          initialDiluentMl={2.0}
          initialTargetDose={250}
        />
      )}

      {/* 4. Main Data Container with Storefront-Harmonized Tabs */}
      <Container className="divide-y p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base overflow-hidden rounded-2xl">
        {/* Harmonized Segmented Tabs */}
        <AdminSegmentedTabs
          tabs={[
            { id: "all", label: "All Protocols", count: kpis.total },
            { id: "singles", label: "Single Peptides", count: kpis.singlePeptides },
            { id: "blends", label: "Multi-Peptide Blends", count: kpis.blends },
            { id: "supplies", label: "Laboratory Supplies", count: kpis.supplies },
            { id: "published", label: "Published", count: kpis.published },
            { id: "draft", label: "Draft", count: kpis.draft },
            { id: "linked", label: "Linked Products", count: kpis.totalLinked },
          ]}
          activeTab={activeFilter}
          onChange={(id) => setActiveFilter(id)}
        />

        {/* Live Search Input Toolbar */}
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50/50 border-b border-slate-100">
          <span className="text-xs text-slate-500">
            Showing {filteredProtocols.length} {filteredProtocols.length === 1 ? "protocol" : "protocols"}
          </span>

          <div className="relative flex items-center">
            <MagnifyingGlass className="absolute left-2.5 size-3.5 text-ui-fg-muted pointer-events-none" />
            <Input
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search protocol or compound..."
              className="h-8 pl-8 pr-7 text-xs w-64 bg-white"
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

      {/* 5. Customer Monograph Live Preview Modal */}
      <CustomerMonographPreviewModal
        open={Boolean(previewProtocol)}
        onClose={() => setPreviewProtocol(null)}
        protocol={previewProtocol}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Research Protocols",
  icon: BookOpen,
  rank: 9,
})

export default ResearchProtocolsPage

