/**
 * @file    apps/backend/src/admin/routes/research-protocols/page.tsx
 * @module  ResearchProtocolsAdminRoute (Research Tracking Module)
 * @purpose Modern Storefront SADS 2.0 Product Protocols Studio with 7/5 operational split grid and full monograph inspection.
 * @contracts
 *   Route:   /app/research-protocols
 *   API:     GET /admin/research-protocols
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArchiveBox,
  ArrowUpRightOnBox,
  Beaker,
  BookOpen,
  CheckCircleSolid,
  ChevronLeft,
  ChevronRight,
  DocumentText,
  MagnifyingGlass,
  PencilSquare,
  Plus,
  Sparkles,
  XMark,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Input,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { PageHeader } from "../../components/page-header"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { AdminSuiteCard } from "../../components/ui/admin-suite-card"
import { AdminListRowCard } from "../../components/ui/admin-list-row-card"
import { SovereignPageSkeleton } from "../../components/ui/sovereign-page-skeleton"
import { SovereignEmptyState } from "../../components/ui/sovereign-empty-state"
import { AdminReconstitutionCalculator } from "../../components/clinical/admin-reconstitution-calculator"
import { CustomerMonographPreviewModal } from "../../components/protocols/customer-monograph-preview-modal"
import { sdk } from "../../lib/sdk"
import type {
  ResearchProtocolListResponse,
  ResearchProtocolSeries,
} from "../compounded-products/research-protocol-types"
import { evaluatePublicationReadiness } from "./readiness-evaluator"

const PAGE_SIZE = 15

type FilterCategory = "all" | "singles" | "blends" | "supplies" | "published" | "draft"

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
  const published = protocol.revisions.find((r) => r.status === "published")
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
  const published = protocol.revisions.find((r) => r.status === "published")
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

export const ResearchProtocolsPage = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [showCalculatorWorkbench, setShowCalculatorWorkbench] = useState(false)
  const [previewProtocol, setPreviewProtocol] = useState<ResearchProtocolSeries | null>(null)

  // 1. Fetch protocols from API
  const protocolsQuery = useQuery({
    queryKey: ["admin-research-protocols-list"],
    queryFn: async () => {
      return sdk.client.fetch<ResearchProtocolListResponse>("/admin/research-protocols", {
        query: { limit: 250 },
      })
    },
  })

  const allProtocols = useMemo(() => {
    return protocolsQuery.data?.protocols || []
  }, [protocolsQuery.data])

  // 2. Compute KPI Metrics
  const kpis = useMemo(() => {
    let total = allProtocols.length
    let singlePeptides = 0
    let blends = 0
    let supplies = 0
    let published = 0
    let draft = 0

    for (const protocol of allProtocols) {
      if (isSupplyProtocol(protocol)) {
        supplies++
      } else {
        const catType = protocol.revisions[0]?.content?.protocol_category_type
        if (catType === "blend") {
          blends++
        } else {
          singlePeptides++
        }
      }

      const status = statusDetails(protocol)
      if (status.label === "Published") {
        published++
      } else {
        draft++
      }
    }

    return { total, singlePeptides, blends, supplies, published, draft }
  }, [allProtocols])

  // 3. Filter Protocols
  const filteredProtocols = useMemo(() => {
    let list = allProtocols

    // Tab Filter
    if (activeFilter === "singles") {
      list = list.filter((p) => {
        if (isSupplyProtocol(p)) return false
        return p.revisions[0]?.content?.protocol_category_type !== "blend"
      })
    } else if (activeFilter === "blends") {
      list = list.filter((p) => {
        if (isSupplyProtocol(p)) return false
        return p.revisions[0]?.content?.protocol_category_type === "blend"
      })
    } else if (activeFilter === "supplies") {
      list = list.filter((p) => isSupplyProtocol(p))
    } else if (activeFilter === "published") {
      list = list.filter((p) => statusDetails(p).label === "Published")
    } else if (activeFilter === "draft") {
      list = list.filter((p) => statusDetails(p).label === "Draft")
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((p) => {
        const title = p.revisions[0]?.title?.toLowerCase() || ""
        const key = p.protocol_key?.toLowerCase() || ""
        const cat = p.revisions[0]?.content?.category?.toLowerCase() || ""
        const compound = p.revisions[0]?.content?.compound_name?.toLowerCase() || ""
        return title.includes(q) || key.includes(q) || cat.includes(q) || compound.includes(q)
      })
    }

    return list
  }, [allProtocols, activeFilter, searchQuery])

  // 4. Paginated Slice
  const totalPages = Math.max(1, Math.ceil(filteredProtocols.length / PAGE_SIZE))
  const pagedProtocols = useMemo(() => {
    const start = pageIndex * PAGE_SIZE
    return filteredProtocols.slice(start, start + PAGE_SIZE)
  }, [filteredProtocols, pageIndex])

  const handleFilterChange = (filter: FilterCategory) => {
    setActiveFilter(filter)
    setPageIndex(0)
  }

  if (protocolsQuery.isLoading) {
    return <SovereignPageSkeleton cards={4} rows={8} />
  }

  if (protocolsQuery.isError) {
    return (
      <div className="flex flex-col gap-y-4 pb-12 pt-4 px-6 w-full">
        <PageHeader
          eyebrowText="Product Protocols · Research Operations"
          title="Product Protocols"
          subtitle="Manage independent, versioned product analytical protocols, stoichiometry, and dosage routines across single peptides, multi-peptide blends, and laboratory supplies."
        />
        <div className="p-8 border border-red-200 bg-red-50/50 rounded-xl text-center flex flex-col items-center gap-3">
          <p className="text-sm font-semibold text-red-800">
            Failed to load research protocols: {String((protocolsQuery.error as Error)?.message || "Network Error")}
          </p>
          <Button size="small" variant="secondary" onClick={() => protocolsQuery.refetch()}>
            Retry Query
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4 pb-12 pt-4 px-1 sm:px-6 w-full">
      {/* 1. Header with Eyebrow, Badges, and Action Suite */}
      <PageHeader
        eyebrowText="Product Protocols · Research Operations"
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
              <Beaker className="size-3.5 mr-1" />
              {showCalculatorWorkbench ? "Hide Syringe Workbench" : "Syringe Workbench"}
            </Button>
            <Button asChild size="small" className="h-8 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1.5">
              <Link to="/research-protocols/new">
                <Plus className="size-3.5" /> Add protocol
              </Link>
            </Button>
          </div>
        }
      />

      {/* 2. Top Telemetry Notice */}
      <AdminTelemetryNotice
        icon={<Sparkles className="size-4" />}
        title="Sterile Compounding Protocols & Dilution Monographs"
        description="Published monographs synchronize to customer account portals and research hubs. Each protocol mandates sterile reconstitution stoichiometry, storage temperatures, and CAS molecular purity."
        statusText="CLINICAL PROTOCOLS ARMED"
        variant="indigo"
      />

      {/* 3. 4-Tile Compact Executive Metric Strip (~82px height) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          icon={<DocumentText className="size-4" />}
          label="Total Protocols"
          value={kpis.total}
          status="healthy"
          variant="blue"
          subtext="Authoritative product protocols"
        />
        <AdminMetricCard
          icon={<Sparkles className="size-4" />}
          label="Single Peptides"
          value={kpis.singlePeptides}
          status="healthy"
          variant="emerald"
          subtext="Single compound monographs"
        />
        <AdminMetricCard
          icon={<Beaker className="size-4" />}
          label="Multi-Peptide Blends"
          value={kpis.blends}
          status="healthy"
          variant="purple"
          subtext="Multi-compound formulations"
        />
        <AdminMetricCard
          icon={<ArchiveBox className="size-4" />}
          label="Laboratory Supplies"
          value={kpis.supplies}
          status="healthy"
          variant="amber"
          subtext="Cryo labware & reconstitution"
        />
      </div>

      {/* Syringe Stoichiometry Workbench (Collapsible Tool) */}
      {showCalculatorWorkbench && (
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Beaker className="size-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">Clinical Stoichiometry &amp; Dilution Calculator</span>
            </div>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setShowCalculatorWorkbench(false)}
              className="h-7 text-xs font-semibold"
            >
              Close Tool
            </Button>
          </div>
          <AdminReconstitutionCalculator
            compoundName="Clinical Stoichiometry Workbench"
            initialMass={10}
            initialDiluentMl={2.0}
            initialTargetDose={250}
          />
        </div>
      )}

      {/* 4. Single-Row Tab Bar Strip with Inline Search */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Protocols", count: kpis.total },
            { id: "singles", label: "Single Peptides", count: kpis.singlePeptides },
            { id: "blends", label: "Multi-Peptide Blends", count: kpis.blends },
            { id: "supplies", label: "Laboratory Supplies", count: kpis.supplies },
            { id: "published", label: "Published", count: kpis.published },
            { id: "draft", label: "Draft", count: kpis.draft },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFilterChange(tab.id as FilterCategory)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10.5px] font-mono ${
                  activeFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search protocol or compound..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPageIndex(0)
            }}
            className="h-8 pl-8 pr-7 text-xs bg-slate-50 border-slate-200/80 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <XMark className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Full-Width Protocol Micro-Card Stream */}
      <div className="w-full flex flex-col gap-3">
        {filteredProtocols.length === 0 ? (
          <SovereignEmptyState
            icon={<BookOpen className="size-6 text-slate-400" />}
            heading="No research protocols yet"
            description={
              searchQuery
                ? `No protocols matching "${searchQuery}". Clear query or switch filter.`
                : "No protocols match the selected criteria."
            }
            action={
              searchQuery ? (
                <Button size="small" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              ) : (
                <Button asChild size="small">
                  <Link to="/research-protocols/new">Add protocol</Link>
                </Button>
              )
            }
          />
        ) : (
          <>
            {pagedProtocols.map((protocol) => {
              const isSupply = isSupplyProtocol(protocol)
              const catType = protocol.revisions[0]?.content?.protocol_category_type
              const status = statusDetails(protocol)
              const readiness = readinessDetails(protocol)
              const latestRevision = protocol.revisions[0]?.revision || 1
              const linkedCount = protocol.product_links?.length || 0
              const protocolTitle = protocol.revisions[0]?.title || protocol.protocol_key

              let classification = "Single Peptide"
              let icon = <DocumentText className="size-4 text-blue-600" />
              if (isSupply) {
                classification = "Laboratory Supply"
                icon = <ArchiveBox className="size-4 text-emerald-600" />
              } else if (catType === "blend") {
                classification = "Multi-Peptide Blend"
                icon = <Beaker className="size-4 text-purple-600" />
              }

              return (
                <AdminListRowCard
                  key={protocol.id}
                  onClick={() => navigate(`/research-protocols/${protocol.id}`)}
                  className="group"
                  icon={icon}
                  title={protocolTitle}
                  subtitle={
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700">
                        {classification}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-mono text-blue-700">
                        Latest revision r{latestRevision}
                      </span>
                      {linkedCount > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-mono text-emerald-700">
                          {linkedCount} Compatible products
                        </span>
                      )}
                      <span className="text-[10.5px] text-slate-400">
                        {protocol.protocol_key}
                      </span>
                    </div>
                  }
                  badge={
                    <Badge
                      size="small"
                      color={status.color === "green" ? "green" : "orange"}
                      className="text-[10px]"
                    >
                      {status.label}
                    </Badge>
                  }
                  value={
                    <span className={readiness.color === "green" ? "text-emerald-700 font-semibold text-xs" : "text-amber-700 font-semibold text-xs"}>
                      {readiness.label}
                    </span>
                  }
                  secondaryValue={
                    <span className="text-[10.5px] text-slate-400">
                      Updated {new Date(protocol.revisions[0]?.updated_at || protocol.updated_at).toLocaleDateString("en-PH")}
                    </span>
                  }
                  statusPill={
                    <div className="size-7 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all">
                      <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  }
                  actions={
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setPreviewProtocol(protocol)
                        }}
                        className="h-7 text-xs font-semibold px-2.5 text-slate-700 hover:text-slate-950 bg-white"
                      >
                        Customer Preview
                      </Button>
                      <Button asChild size="small" variant="secondary" className="h-7 text-xs font-semibold px-2 text-slate-600 hover:text-slate-900">
                        <Link to={`/research-protocols/${protocol.id}/preview`}>
                          Monograph <ArrowUpRightOnBox className="size-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  }
                />
              )
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs mt-1">
                <span className="text-xs text-slate-500 font-mono">
                  Showing {pageIndex * PAGE_SIZE + 1}–{Math.min((pageIndex + 1) * PAGE_SIZE, filteredProtocols.length)} of {filteredProtocols.length} protocols
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={pageIndex === 0}
                    onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                    className="h-7 text-xs"
                  >
                    <ChevronLeft className="size-3.5 mr-0.5" /> Previous
                  </Button>
                  <span className="text-xs font-semibold px-2 text-slate-700">
                    {pageIndex + 1} / {totalPages}
                  </span>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={pageIndex >= totalPages - 1}
                    onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                    className="h-7 text-xs"
                  >
                    Next <ChevronRight className="size-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 6. Horizontal Operational Action Suites Dock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Suite 1: Clinical Stoichiometry Workbench */}
        <AdminSuiteCard
          icon={<Beaker className="size-4 text-blue-600" />}
          eyebrow="Clinical Formulation"
          title="Stoichiometry &amp; Diluent Tool"
          description="Interactive syringe reconstitution calculator. Computes exact graduation marks (IU or 0.01 mL clicks) based on vial mass and diluent volume."
          actionLabel={showCalculatorWorkbench ? "Hide Workbench" : "Launch Workbench"}
          onActionClick={() => setShowCalculatorWorkbench((prev) => !prev)}
          statusBadge="Active Engine"
          statusVariant="emerald"
          variant="blue"
        >
          <div className="p-3 rounded-lg bg-blue-50/40 border border-blue-100 flex flex-col gap-1.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Standard Lyophilized Vials:</span>
              <span className="font-mono text-blue-700">2.0 mL BAC Water</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Micro-Volumetric Increments:</span>
              <span className="font-mono text-blue-700">0.01 mL Click Resolution</span>
            </div>
          </div>
        </AdminSuiteCard>

        {/* Suite 2: Quality & Monograph Governance */}
        <AdminSuiteCard
          icon={<Sparkles className="size-4 text-purple-600" />}
          eyebrow="Analytical Compliance"
          title="Monograph Quality Standards"
          description="Every published analytical protocol enforces sterile reconstitution procedures, vehicle compatibility, and strict RUO research disclaimers."
          statusBadge="USP &amp; CAS Aligned"
          statusVariant="emerald"
          variant="purple"
        >
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0" />
              <span>HPLC Purity Verification &gt;= 99.0% mandatory</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0" />
              <span>Protected desiccated ambient storage</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0" />
              <span>Synchronized with customer monograph portal</span>
            </div>
          </div>
        </AdminSuiteCard>

        {/* Suite 3: Publication Telemetry */}
        <AdminSuiteCard
          icon={<DocumentText className="size-4 text-emerald-600" />}
          eyebrow="Publication Readiness"
          title="Protocol Release Telemetry"
          description="Drafts require dosage protocols, solvent guidelines, and peptide CAS registry keys before publication to live customer accounts."
          statusBadge={`${kpis.published} Live / ${kpis.draft} Draft`}
          statusVariant={kpis.draft > 0 ? "amber" : "emerald"}
          variant="emerald"
        >
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
            <span className="text-slate-600">Storefront Publication Rate:</span>
            <span className="font-bold font-mono text-slate-900">
              {kpis.total > 0 ? Math.round((kpis.published / kpis.total) * 100) : 100}%
            </span>
          </div>
        </AdminSuiteCard>
      </div>

      {/* 6. Customer Monograph Live Preview Modal */}
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
