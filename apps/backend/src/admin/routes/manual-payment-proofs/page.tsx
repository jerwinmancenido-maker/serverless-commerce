import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Container,
  createDataTableColumnHelper,
  DataTable,
  type DataTablePaginationState,
  Heading,
  Select,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

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

const ManualPaymentProofsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [status, setStatus] = useState<ManualPaymentProofStatus | "all">(
    "pending",
  )
  const [selectedProof, setSelectedProof] = useState<ManualPaymentProof | null>(
    null,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
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
  const columns = useMemo(
    () => [
      columnHelper.accessor("order_id", {
        header: "Order",
      }),
      columnHelper.accessor("file_name", {
        header: "Proof file",
      }),
      columnHelper.accessor("revision", {
        header: "Revision",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          <Badge color={statusColor(getValue())}>{getValue()}</Badge>
        ),
      }),
      columnHelper.accessor("submitted_at", {
        header: "Submitted",
        cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
      }),
    ],
    [],
  )
  const table = useDataTable({
    data: proofQuery.data?.manual_payment_proofs ?? [],
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
    <div className="flex flex-col gap-4">
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading>Manual QR payment proofs</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Review customer uploads. Proof approval does not yet authorize or
            capture payment.
          </Text>
        </div>
        {proofQuery.isError ? (
          <Text
            size="small"
            leading="compact"
            className="text-ui-fg-error px-6 py-4"
          >
            Payment proofs could not be loaded. Check your review permission.
          </Text>
        ) : null}
        <DataTable instance={table}>
          <DataTable.Toolbar>
            <div className="w-48">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as ManualPaymentProofStatus | "all")
                  setPagination((current) => ({ ...current, pageIndex: 0 }))
                }}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All statuses</Select.Item>
                  <Select.Item value="pending">Pending</Select.Item>
                  <Select.Item value="approved">Approved</Select.Item>
                  <Select.Item value="rejected">Rejected</Select.Item>
                  <Select.Item value="expired">Expired</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
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
})

export default ManualPaymentProofsPage
