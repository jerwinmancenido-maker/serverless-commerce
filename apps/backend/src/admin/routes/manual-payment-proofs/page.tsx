import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CurrencyDollar } from "@medusajs/icons"
import {
  Badge,
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
import { PageHeader } from "../../components/page-header"
import { sdk } from "../../lib/sdk"
import { ManualPaymentProofReviewDrawer } from "./review-drawer"
import type {
  ManualPaymentProof,
  ManualPaymentProofListResponse,
  ManualPaymentProofStatus,
} from "./types"

const PAGE_SIZE = 20
const columnHelper = createDataTableColumnHelper<ManualPaymentProof>()

function statusColor(status: ManualPaymentProofStatus) {
  if (status === "approved") return "green" as const
  if (status === "rejected") return "red" as const
  if (status === "expired") return "grey" as const
  return "orange" as const
}

const statusPills: Array<{ id: ManualPaymentProofStatus | "all"; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "all", label: "All Proofs" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "expired", label: "Expired" },
]

const ManualPaymentProofsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [status, setStatus] = useState<ManualPaymentProofStatus | "all">("pending")
  const [selectedProof, setSelectedProof] = useState<ManualPaymentProof | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Query counts for pending badge
  const pendingCountQuery = useQuery({
    queryKey: ["manual-payment-proofs", "pending-count"],
    queryFn: () =>
      sdk.client.fetch<ManualPaymentProofListResponse>(
        "/admin/manual-payment-proofs",
        { query: { limit: 1, offset: 0, status: "pending" } },
      ),
    refetchInterval: 10000,
  })
  const pendingCount = pendingCountQuery.data?.count ?? 0

  const proofQuery = useQuery({
    queryKey: ["manual-payment-proofs", "list", pagination, status],
    queryFn: () =>
      sdk.client.fetch<ManualPaymentProofListResponse>(
        "/admin/manual-payment-proofs",
        {
          query: {
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
            status: status === "all" ? undefined : status,
          },
        },
      ),
    placeholderData: keepPreviousData,
  })

  const proofs = proofQuery.data?.manual_payment_proofs ?? []

  const columns = useMemo(
    () => [
      columnHelper.accessor("order_id", {
        header: "Order",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-semibold text-ui-fg-interactive">
            #{getValue()?.slice(-8) || getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("file_name", {
        header: "Proof slip",
        cell: ({ row, getValue }) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-ui-fg-base truncate max-w-[200px]">
              📄 {getValue()}
            </span>
            <span className="text-[10px] text-ui-fg-muted font-mono">
              {Math.ceil(row.original.size_bytes / 1024)} KB
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("revision", {
        header: "Revision",
        cell: ({ getValue }) => (
          <Badge size="small" color="grey" className="font-mono text-[10px]">
            v{getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge size="small" color={statusColor(getValue())}>
            {getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("submitted_at", {
        header: "Submitted",
        cell: ({ getValue }) => (
          <span className="text-xs text-ui-fg-subtle">
            {new Date(getValue()).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        ),
      }),
    ],
    [],
  )

  const table = useDataTable({
    data: proofs,
    columns,
    getRowId: (proof) => proof.id,
    rowCount: proofQuery.data?.count ?? 0,
    isLoading: proofQuery.isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    onRowClick: (_event, proof) => {
      setSelectedProof(proof)
      setDrawerOpen(true)
    },
  })

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* 1. Standard PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "Orders", href: "/orders" },
          { label: "Payment Proofs" },
        ]}
        title="Manual QR Payment Proofs"
        subtitle="Review customer payment slips and settle manual transactions with one-click authorization and capture."
        statusDropdown={
          pendingCount > 0 ? (
            <Badge size="small" color="orange" className="font-mono text-[11px] animate-pulse">
              ● {pendingCount} pending review
            </Badge>
          ) : (
            <Badge size="small" color="green" className="font-mono text-[11px]">
              ● All settled
            </Badge>
          )
        }
      />

      {/* 2. Main Data Container */}
      <Container className="divide-y p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base">
        {/* Filter Pills Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ui-bg-subtle/20 border-b border-ui-border-base">
          <FilterPillGroup
            items={statusPills.map((p) => ({
              id: p.id,
              label: p.label,
              count: p.id === "pending" && pendingCount > 0 ? pendingCount : undefined,
              badgeColor: p.id === "pending" ? "orange" : undefined,
            }))}
            selectedId={status}
            onSelect={(id) => {
              setStatus(id as any)
              setPagination((current) => ({ ...current, pageIndex: 0 }))
            }}
          />
        </div>

        {proofQuery.isError ? (
          <div className="p-6 text-center">
            <Text size="small" className="text-ui-fg-error">
              Payment proofs could not be loaded. Please check your review permission.
            </Text>
          </div>
        ) : null}

        {/* Data Table or Clean Empty State */}
        {!proofQuery.isLoading && proofs.length === 0 ? (
          <EmptyState
            icon="🧾"
            title={`No ${status === "all" ? "" : status} payment proofs`}
            description={
              status === "pending"
                ? "Great news! All submitted customer payment slips have been reviewed and captured."
                : `There are currently no manual QR payment proofs with "${status}" status.`
            }
            actionLabel={status !== "all" ? "View All Proofs" : undefined}
            onAction={status !== "all" ? () => setStatus("all") : undefined}
          />
        ) : (
          <DataTable instance={table}>
            <DataTable.Table />
            <DataTable.Pagination />
          </DataTable>
        )}
      </Container>

      <ManualPaymentProofReviewDrawer
        proof={selectedProof}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Payment Proofs",
  nested: "/orders",
})

export default ManualPaymentProofsPage
