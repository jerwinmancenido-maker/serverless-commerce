/**
 * @file apps/backend/src/admin/routes/research-library/page.tsx
 * @module AdminRoute · ResearchLibrary
 * @purpose Medusa Admin page for managing peer-reviewed scientific articles and head-to-head peptide comparison matrices.
 * @contracts Admin UI extension mounted at /app/research-library
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText, MagnifyingGlass, Sparkles } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  Heading,
  Input,
  Tabs,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"
import { PageHeader } from "../../components/page-header"

type ResearchArticleItem = {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  compound_tag: string
  reading_time: string
  reviewed_by: string
  status: "draft" | "published"
  published_at: string | null
  updated_at: string
}

type PeptideComparisonItem = {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  compound_a: { name: string; tag: string }
  compound_b: { name: string; tag: string }
  summary: string
  synergy_verdict: string
  status: "draft" | "published"
  published_at: string | null
  updated_at: string
}

const articleColumnHelper = createDataTableColumnHelper<ResearchArticleItem>()
const comparisonColumnHelper = createDataTableColumnHelper<PeptideComparisonItem>()

export function ResearchLibraryPage() {
  const [activeTab, setActiveTab] = useState<"articles" | "comparisons">("articles")
  const [articleSearch, setArticleSearch] = useState("")
  const [comparisonSearch, setComparisonSearch] = useState("")

  // 1. Fetch Articles
  const { data: articlesData, isLoading: isLoadingArticles } = useQuery({
    queryKey: ["admin-research-articles"],
    queryFn: async () => {
      const resp = await sdk.client.fetch<{ articles: ResearchArticleItem[]; count: number }>(
        "/admin/research-articles?limit=100"
      )
      return resp
    },
  })

  // 2. Fetch Comparisons
  const { data: comparisonsData, isLoading: isLoadingComparisons } = useQuery({
    queryKey: ["admin-peptide-comparisons"],
    queryFn: async () => {
      const resp = await sdk.client.fetch<{ comparisons: PeptideComparisonItem[]; count: number }>(
        "/admin/peptide-comparisons?limit=100"
      )
      return resp
    },
  })

  const articles = useMemo(() => {
    const list = articlesData?.articles || []
    if (!articleSearch.trim()) return list
    const q = articleSearch.toLowerCase()
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.compound_tag.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    )
  }, [articlesData, articleSearch])

  const comparisons = useMemo(() => {
    const list = comparisonsData?.comparisons || []
    if (!comparisonSearch.trim()) return list
    const q = comparisonSearch.toLowerCase()
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.compound_a.name.toLowerCase().includes(q) ||
        c.compound_b.name.toLowerCase().includes(q)
    )
  }, [comparisonsData, comparisonSearch])

  const articleColumns = useMemo(
    () => [
      articleColumnHelper.accessor("title", {
        header: "Article Title & Focus",
        cell: ({ row }) => (
          <div className="py-1 max-w-[400px]">
            <Text className="font-semibold text-ui-fg-base truncate">{row.original.title}</Text>
            <Text className="text-xs text-ui-fg-muted truncate">{row.original.subtitle}</Text>
          </div>
        ),
      }),
      articleColumnHelper.accessor("compound_tag", {
        header: "Target Compound",
        cell: ({ row }) => (
          <Badge color="blue" size="small">
            {row.original.compound_tag}
          </Badge>
        ),
      }),
      articleColumnHelper.accessor("category", {
        header: "Research Category",
        cell: ({ row }) => (
          <Badge color="purple" size="small">
            {row.original.category}
          </Badge>
        ),
      }),
      articleColumnHelper.accessor("reading_time", {
        header: "Read Time",
        cell: ({ row }) => <Text className="text-xs">{row.original.reading_time}</Text>,
      }),
      articleColumnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <Badge color={row.original.status === "published" ? "green" : "grey"} size="small">
            {row.original.status.toUpperCase()}
          </Badge>
        ),
      }),
    ],
    []
  )

  const comparisonColumns = useMemo(
    () => [
      comparisonColumnHelper.accessor("title", {
        header: "Comparison Title",
        cell: ({ row }) => (
          <div className="py-1 max-w-[360px]">
            <Text className="font-semibold text-ui-fg-base truncate">{row.original.title}</Text>
            <Text className="text-xs text-ui-fg-muted truncate">{row.original.subtitle}</Text>
          </div>
        ),
      }),
      comparisonColumnHelper.accessor("compound_a", {
        header: "Head-to-Head Pair",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Badge color="blue" size="small">{row.original.compound_a.name}</Badge>
            <Text className="text-xs font-bold text-ui-fg-muted">vs</Text>
            <Badge color="orange" size="small">{row.original.compound_b.name}</Badge>
          </div>
        ),
      }),
      comparisonColumnHelper.accessor("category", {
        header: "Category",
        cell: ({ row }) => (
          <Badge color="purple" size="small">
            {row.original.category}
          </Badge>
        ),
      }),
      comparisonColumnHelper.accessor("synergy_verdict", {
        header: "Synergy Assessment",
        cell: ({ row }) => (
          <Text className="text-xs text-ui-fg-subtle truncate max-w-[280px]">
            {row.original.synergy_verdict}
          </Text>
        ),
      }),
      comparisonColumnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <Badge color={row.original.status === "published" ? "green" : "grey"} size="small">
            {row.original.status.toUpperCase()}
          </Badge>
        ),
      }),
    ],
    []
  )

  const articleTable = useDataTable({
    columns: articleColumns,
    data: articles,
    getRowId: (row) => row.id,
    rowCount: articles.length,
    isLoading: isLoadingArticles,
  })

  const comparisonTable = useDataTable({
    columns: comparisonColumns,
    data: comparisons,
    getRowId: (row) => row.id,
    rowCount: comparisons.length,
    isLoading: isLoadingComparisons,
  })

  return (
    <div className="flex flex-col gap-y-4 p-6">
      <PageHeader
        title="Research Library & Scientific Publications"
        subtitle="Authoritative repository of peer-reviewed peptide monographs, in-vitro signaling articles, and head-to-head clinical comparison matrices."
      />

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <Tabs.List>
          <Tabs.Trigger value="articles" className="gap-x-2">
            <DocumentText />
            Scientific Articles ({articles.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="comparisons" className="gap-x-2">
            <Sparkles />
            Peptide Comparisons ({comparisons.length})
          </Tabs.Trigger>
        </Tabs.List>

        {/* 1. Scientific Articles Tab */}
        <Tabs.Content value="articles" className="mt-4">
          <Container className="p-0 overflow-hidden">
            <div className="p-4 border-b border-ui-border-base flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Input
                  size="small"
                  placeholder="Search articles by title, compound tag, or category..."
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                />
              </div>
              <Badge color="blue">{articles.length} Published Articles in Database</Badge>
            </div>

            <DataTable instance={articleTable}>
              <DataTable.Table />
              <DataTable.Pagination />
            </DataTable>
          </Container>
        </Tabs.Content>

        {/* 2. Peptide Comparisons Tab */}
        <Tabs.Content value="comparisons" className="mt-4">
          <Container className="p-0 overflow-hidden">
            <div className="p-4 border-b border-ui-border-base flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Input
                  size="small"
                  placeholder="Search comparisons by compound name or category..."
                  value={comparisonSearch}
                  onChange={(e) => setComparisonSearch(e.target.value)}
                />
              </div>
              <Badge color="orange">{comparisons.length} Head-to-Head Matrices in Database</Badge>
            </div>

            <DataTable instance={comparisonTable}>
              <DataTable.Table />
              <DataTable.Pagination />
            </DataTable>
          </Container>
        </Tabs.Content>
      </Tabs>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Research Library",
  icon: DocumentText,
  rank: 10,
})

export default ResearchLibraryPage
