import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  type DataTablePaginationState,
  Heading,
  StatusBadge,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import { CreatePresentationModal } from "./create-presentation-modal"
import { EditPresentationDrawer } from "./edit-presentation-drawer"
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

const CompoundedProductConfigurationsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
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
  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (item) => item.current_revision?.snapshot.label || item.presentation.key,
        { header: "Presentation" },
      ),
      columnHelper.accessor((item) => item.presentation.key, {
        header: "Stable key",
      }),
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
        { header: "Revision" },
      ),
      columnHelper.accessor(
        (item) => item.current_revision?.snapshot.variation_axes.length || 0,
        { header: "Variation axes" },
      ),
      columnHelper.accessor(
        (item) => item.current_revision?.snapshot.fields.length || 0,
        { header: "Fields" },
      ),
    ],
    [],
  )
  const table = useDataTable({
    data: query.data?.presentations || [],
    columns,
    getRowId: (item) => item.presentation.id,
    rowCount: query.data?.count || 0,
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
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Heading>Compounded product configurations</Heading>
            <Text
              size="small"
              leading="compact"
              className="text-ui-fg-subtle"
            >
              Manage versioned presentation fields, units, and variation axes
              without hardcoding a product format.
            </Text>
          </div>
          <Button size="small" onClick={() => setCreateOpen(true)}>
            Create configuration
          </Button>
        </div>

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
    </>
  )
}

export const config = defineRouteConfig({
  label: "Compounded Products",
})

export default CompoundedProductConfigurationsPage
