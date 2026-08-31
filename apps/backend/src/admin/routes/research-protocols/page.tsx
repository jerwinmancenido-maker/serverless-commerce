import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BookOpen, Plus } from "@medusajs/icons"
import {
  Badge,
  Button,
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
import { Link } from "react-router-dom"

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

const ResearchProtocolsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [status, setStatus] = useState<ResearchProtocolStatus | "all">("all")
  const [linkStatus, setLinkStatus] = useState<"all" | "linked" | "unlinked">("all")
  const protocolsQuery = useQuery({
    queryKey: ["research-protocols", "all", pagination, status, linkStatus],
    queryFn: () =>
      sdk.client.fetch<ResearchProtocolListResponse>(
        "/admin/research-protocols",
        {
          query: {
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
            status: status === "all" ? undefined : status,
            link_status: linkStatus === "all" ? undefined : linkStatus,
          },
        },
      ),
    placeholderData: keepPreviousData,
  })
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "protocol",
        header: "Protocol",
        cell: ({ row }) => {
          const protocol = row.original
          const current = protocol.revisions[0]

          return (
            <div className="flex min-w-0 flex-col gap-y-0.5 py-1">
              <Link
                to={`/research-protocols/${protocol.id}`}
                className="text-ui-fg-interactive outline-none hover:underline focus-visible:shadow-borders-interactive-with-focus"
              >
                <Text size="small" weight="plus">
                  {current?.title || protocol.protocol_key}
                </Text>
              </Link>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {protocol.protocol_key}
              </Text>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: "products",
        header: "Compatible products",
        cell: ({ row }) => <Text size="small">{row.original.product_links.length}</Text>,
      }),
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const details = statusDetails(row.original)
          return <Badge color={details.color}>{details.label}</Badge>
        },
      }),
      columnHelper.display({
        id: "revision",
        header: "Latest revision",
        cell: ({ row }) => (
          <Text size="small">
            {row.original.revisions[0]
              ? `r${row.original.revisions[0].revision}`
              : "—"}
          </Text>
        ),
      }),
      columnHelper.display({
        id: "readiness",
        header: "Publication readiness",
        cell: ({ row }) => {
          const latest = row.original.revisions[0]
          const content = latest?.content
          const ready = Boolean(latest?.title && content?.intended_application && content?.research_purpose && content?.explicit_exclusions && content?.preparation_and_handling && content?.research_procedure && content?.storage_and_disposal && content?.references.length)
          return <Badge color={ready ? "green" : "orange"}>{ready ? "Ready" : "Needs content"}</Badge>
        },
      }),
      columnHelper.accessor("updated_at", {
        header: "Updated",
        cell: ({ getValue }) => (
          <Text size="small">
            {new Date(getValue()).toLocaleDateString()}
          </Text>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button asChild size="small" variant="secondary">
            <Link to={`/research-protocols/${row.original.id}/preview`}>
              Preview
            </Link>
          </Button>
        ),
      }),
    ],
    [],
  )
  const table = useDataTable({
    data: protocolsQuery.data?.protocols || [],
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
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between gap-x-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Heading>Research protocols</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Manage independent, versioned laboratory research guides. Link
            compatible products when needed.
          </Text>
        </div>
        <Button asChild size="small">
          <Link to="/research-protocols/new"><Plus />Add protocol</Link>
        </Button>
      </div>
      {protocolsQuery.isError ? (
        <Text size="small" className="text-ui-fg-error px-6 py-4">
          Research protocols could not be loaded.
        </Text>
      ) : !protocolsQuery.isLoading &&
        status === "all" &&
        protocolsQuery.data?.count === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-y-4 px-6 py-12 text-center">
          <div className="bg-ui-bg-component flex size-12 items-center justify-center rounded-full border border-ui-border-base">
            <BookOpen className="text-ui-fg-muted" />
          </div>
          <div className="flex max-w-lg flex-col gap-y-1">
            <Text size="small" weight="plus">
              No research protocols yet
            </Text>
            <Text size="small" className="text-ui-fg-subtle">
              Create a structured laboratory research guide now. You can link
              compatible products later. Drafts remain private until published.
            </Text>
          </div>
          <Button asChild size="small"><Link to="/research-protocols/new">Add protocol</Link></Button>
        </div>
      ) : (
        <DataTable instance={table}>
          <DataTable.Toolbar>
            <div className="flex items-center gap-2">
              <Text size="small" className="text-ui-fg-subtle">
                Status
              </Text>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as ResearchProtocolStatus | "all")
                  setPagination((current) => ({ ...current, pageIndex: 0 }))
                }}
              >
                <Select.Trigger className="w-40">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All statuses</Select.Item>
                  <Select.Item value="draft">Draft</Select.Item>
                  <Select.Item value="published">Published</Select.Item>
                  <Select.Item value="withdrawn">Withdrawn</Select.Item>
                </Select.Content>
              </Select>
              <Select
                value={linkStatus}
                onValueChange={(value) => {
                  setLinkStatus(value as typeof linkStatus)
                  setPagination((current) => ({ ...current, pageIndex: 0 }))
                }}
              >
                <Select.Trigger className="w-44"><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All product links</Select.Item>
                  <Select.Item value="linked">Linked protocols</Select.Item>
                  <Select.Item value="unlinked">Unlinked protocols</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </DataTable.Toolbar>
          <DataTable.Table />
          <DataTable.Pagination />
        </DataTable>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Research Protocols",
  icon: BookOpen,
})

export default ResearchProtocolsPage
