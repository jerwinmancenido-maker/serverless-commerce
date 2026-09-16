/**
 * @file    apps/backend/src/admin/routes/research-library/page.tsx
 * @module  ResearchLibraryAdminRoute (Admin Extension)
 * @purpose Modern Storefront SADS 2.0 Research Library with full CRUD operational freedom across Articles, Comparisons, Glossary/FAQs, and Synergy Rules.
 * @contracts
 *   Route:   /app/research-library
 *   API:     GET/POST/DELETE /admin/research-articles · GET/POST/DELETE /admin/peptide-comparisons
 *            GET/POST/DELETE /admin/educational-content · GET/POST/DELETE /admin/peptide-stack-interactions
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowUpRightOnBox,
  BookOpen,
  ChevronRight,
  DocumentText,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  Sparkles,
  Bolt,
  Trash,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Heading,
  Input,
  Prompt,
  toast,
} from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"
import { PageHeader } from "../../components/page-header"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { AdminSuiteCard } from "../../components/ui/admin-suite-card"
import { AdminListRowCard } from "../../components/ui/admin-list-row-card"
import { SovereignPageSkeleton } from "../../components/ui/sovereign-page-skeleton"
import { SovereignEmptyState } from "../../components/ui/sovereign-empty-state"

import { ArticleAuthoringStudio } from "./components/article-authoring-studio"
import { ComparisonCreateEditDrawer } from "./drawers/comparison-create-edit-drawer"
import { EducationalCreateEditDrawer } from "./drawers/educational-create-edit-drawer"
import { StackInteractionCreateEditDrawer } from "./drawers/stack-interaction-create-edit-drawer"

type TabKey = "articles" | "comparisons" | "educational" | "stacks"

export const ResearchLibraryPage = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>("articles")
  const [searchQuery, setSearchQuery] = useState("")

  // Authoring Studio & Drawer States
  const [isAuthoringArticle, setIsAuthoringArticle] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null)

  const [comparisonDrawerOpen, setComparisonDrawerOpen] = useState(false)
  const [selectedComparison, setSelectedComparison] = useState<any | null>(null)

  const [educationalDrawerOpen, setEducationalDrawerOpen] = useState(false)
  const [selectedEducational, setSelectedEducational] = useState<any | null>(null)

  const [stackDrawerOpen, setStackDrawerOpen] = useState(false)
  const [selectedStack, setSelectedStack] = useState<any | null>(null)

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; endpoint: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 1. Fetch Research Articles
  const articlesQuery = useQuery({
    queryKey: ["admin-research-articles", searchQuery],
    queryFn: () =>
      sdk.client.fetch<any>("/admin/research-articles", {
        query: { limit: 100, search: searchQuery || undefined },
      }),
  })

  // 2. Fetch Peptide Comparisons
  const comparisonsQuery = useQuery({
    queryKey: ["admin-peptide-comparisons", searchQuery],
    queryFn: () =>
      sdk.client.fetch<any>("/admin/peptide-comparisons", {
        query: { limit: 100, search: searchQuery || undefined },
      }),
  })

  // 3. Fetch Educational Content (Glossary & FAQs)
  const educationalQuery = useQuery({
    queryKey: ["admin-educational-content", searchQuery],
    queryFn: () =>
      sdk.client.fetch<any>("/admin/educational-content", {
        query: { query: searchQuery || undefined },
      }),
  })

  // 4. Fetch Peptide Stack Interactions
  const stacksQuery = useQuery({
    queryKey: ["admin-peptide-stack-interactions", searchQuery],
    queryFn: () =>
      sdk.client.fetch<any>("/admin/peptide-stack-interactions", {
        query: { search: searchQuery || undefined },
      }),
  })

  const articles = articlesQuery.data?.articles || []
  const comparisons = comparisonsQuery.data?.comparisons || []
  const glossary = educationalQuery.data?.glossary || []
  const faqs = educationalQuery.data?.faqs || []
  const educationalCount = (educationalQuery.data?.count?.glossary || glossary.length) + (educationalQuery.data?.count?.faqs || faqs.length)
  const stackRules = stacksQuery.data?.pairwise_interactions || []

  const isLoading =
    articlesQuery.isLoading ||
    comparisonsQuery.isLoading ||
    educationalQuery.isLoading ||
    stacksQuery.isLoading

  // Dynamic Add Button Click
  const handleAddClick = () => {
    if (activeTab === "articles") {
      setSelectedArticle(null)
      setIsAuthoringArticle(true)
    } else if (activeTab === "comparisons") {
      setSelectedComparison(null)
      setComparisonDrawerOpen(true)
    } else if (activeTab === "educational") {
      setSelectedEducational(null)
      setEducationalDrawerOpen(true)
    } else if (activeTab === "stacks") {
      setSelectedStack(null)
      setStackDrawerOpen(true)
    }
  }

  // Delete Action Trigger
  const promptDelete = (id: string, title: string, endpoint: string) => {
    setDeleteTarget({ id, title, endpoint })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await sdk.client.fetch(`${deleteTarget.endpoint}/${deleteTarget.id}`, {
        method: "DELETE",
      })
      toast.success(`Deleted "${deleteTarget.title}"`)
      queryClient.invalidateQueries({ queryKey: ["admin-research-articles"] })
      queryClient.invalidateQueries({ queryKey: ["admin-peptide-comparisons"] })
      queryClient.invalidateQueries({ queryKey: ["admin-educational-content"] })
      queryClient.invalidateQueries({ queryKey: ["admin-peptide-stack-interactions"] })
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch (err: any) {
      console.error("Delete failed:", err)
      toast.error(err.message || "Failed to delete item")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isAuthoringArticle) {
    return (
      <ArticleAuthoringStudio
        article={selectedArticle}
        onBack={() => {
          setIsAuthoringArticle(false)
          setSelectedArticle(null)
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-research-articles"] })
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-y-4 pb-12 pt-4 px-1 sm:px-6 w-full min-h-screen">
      {/* 1. Header with Eyebrow, Badges, and Dynamic Create Action */}
      <PageHeader
        eyebrowText="Scientific Monograph &amp; Educational Knowledge Engine"
        title="Research Library"
        subtitle="Manage peer-reviewed articles, head-to-head comparisons, clinical definitions, and synergy rules. Zero hardcoded data."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <a href="http://localhost:8000/ph/research-library" target="_blank" rel="noreferrer">
                Live Customer Portal <ArrowUpRightOnBox className="ml-1 size-3.5" />
              </a>
            </Button>
            <Button
              size="small"
              onClick={handleAddClick}
              className="h-8 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 inline-flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>
                {activeTab === "articles" && "Add Article"}
                {activeTab === "comparisons" && "Add Comparison"}
                {activeTab === "educational" && "Add Term / FAQ"}
                {activeTab === "stacks" && "Add Synergy Rule"}
              </span>
            </Button>
          </div>
        }
      />

      {/* 2. Top Telemetry Notice */}
      <AdminTelemetryNotice
        icon={<Sparkles className="size-4" />}
        title="Continuous Clinical Knowledge Synchronization"
        description="All published monographs, comparisons, and pairwise rules update the public research storefront in real-time."
        actionLabel="Inspect Public Catalog"
        actionHref="http://localhost:8000/ph/research-library"
        variant="blue"
      />

      {/* 3. 4-Tile Compact Executive Metric Strip (~82px height) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Published Articles"
          value={articles.length}
          subtext="Peer-reviewed research monographs"
          icon={<DocumentText className="size-4" />}
          variant="blue"
          status="healthy"
          onClick={() => setActiveTab("articles")}
          className={activeTab === "articles" ? "ring-2 ring-blue-600/30 border-blue-400" : ""}
        />
        <AdminMetricCard
          label="Peptide Comparisons"
          value={comparisons.length}
          subtext="Head-to-head molecular matrices"
          icon={<Sparkles className="size-4" />}
          variant="purple"
          status="healthy"
          onClick={() => setActiveTab("comparisons")}
          className={activeTab === "comparisons" ? "ring-2 ring-purple-600/30 border-purple-400" : ""}
        />
        <AdminMetricCard
          label="Glossary &amp; FAQs"
          value={educationalCount}
          subtext="Definitions, protocols &amp; lab FAQs"
          icon={<BookOpen className="size-4" />}
          variant="emerald"
          status="healthy"
          onClick={() => setActiveTab("educational")}
          className={activeTab === "educational" ? "ring-2 ring-emerald-600/30 border-emerald-400" : ""}
        />
        <AdminMetricCard
          label="Stack Synergy Rules"
          value={stackRules.length}
          subtext="Pairwise affinity &amp; safety rules"
          icon={<Bolt className="size-4" />}
          variant="amber"
          status="healthy"
          onClick={() => setActiveTab("stacks")}
          className={activeTab === "stacks" ? "ring-2 ring-amber-600/30 border-amber-400" : ""}
        />
      </div>

      {/* 4. Single-Row Tab Bar Strip with Inline Search */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap items-center gap-1.5 pb-1 sm:pb-0">
          {[
            { id: "articles", label: "Articles", count: articles.length },
            { id: "comparisons", label: "Comparisons", count: comparisons.length },
            { id: "educational", label: "Glossary & FAQs", count: educationalCount },
            { id: "stacks", label: "Stack Interactions", count: stackRules.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabKey)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10.5px] font-mono ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-slate-50 border-slate-200/80 focus:bg-white"
          />
        </div>
      </div>

      {/* 5. Full-Width Micro-Card Data Stream */}
      <div className="w-full flex flex-col gap-3">
        {isLoading ? (
          <SovereignPageSkeleton cards={2} rows={5} />
        ) : activeTab === "articles" ? (
          articles.length === 0 ? (
            <SovereignEmptyState
              icon={<DocumentText className="size-6 text-slate-400" />}
              heading="No Scientific Articles Found"
              description="No research monographs match the query. Click '+ Add Article' to publish the first study."
              action={
                <Button size="small" onClick={handleAddClick}>
                  Add Article
                </Button>
              }
            />
          ) : (
            articles.map((art: any) => (
              <AdminListRowCard
                key={art.id}
                onClick={() => {
                  setSelectedArticle(art)
                  setIsAuthoringArticle(true)
                }}
                icon={<DocumentText className="size-4 text-blue-600" />}
                title={art.title}
                subtitle={`${art.category || "Research"} · ${art.reading_time || "5 min"} · Reviewed by ${art.reviewed_by || "Staff"}`}
                badge={
                  <Badge size="small" color={art.status === "published" ? "green" : "orange"} className="text-[10px]">
                    {art.status}
                  </Badge>
                }
                value={art.compound_tag}
                secondaryValue={art.slug}
                statusPill={
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
                    <span>Edit Monograph</span>
                    <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-slate-700" />
                  </span>
                }
                onDelete={() => promptDelete(art.id, art.title, "/admin/research-articles")}
                href={`http://localhost:8000/ph/research-library/${art.slug}`}
              />
            ))
          )
        ) : activeTab === "comparisons" ? (
          comparisons.length === 0 ? (
            <SovereignEmptyState
              icon={<Sparkles className="size-6 text-slate-400" />}
              heading="No Peptide Comparisons Found"
              description="Click '+ Add Comparison' to build head-to-head research matrices."
              action={
                <Button size="small" onClick={handleAddClick}>
                  Add Comparison
                </Button>
              }
            />
          ) : (
            comparisons.map((comp: any) => (
              <AdminListRowCard
                key={comp.id}
                onClick={() => {
                  setSelectedComparison(comp)
                  setComparisonDrawerOpen(true)
                }}
                icon={<Sparkles className="size-4 text-purple-600" />}
                title={comp.title}
                subtitle={`${comp.compound_a?.name || "A"} vs ${comp.compound_b?.name || "B"} · ${comp.category || "General"}`}
                badge={
                  <Badge size="small" color={comp.status === "published" ? "green" : "orange"} className="text-[10px]">
                    {comp.status}
                  </Badge>
                }
                value="Verdict"
                secondaryValue={comp.synergy_verdict || "Synergistic"}
                statusPill={
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
                    <span>Edit Matrix</span>
                    <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-slate-700" />
                  </span>
                }
                onDelete={() => promptDelete(comp.id, comp.title, "/admin/peptide-comparisons")}
                href={`http://localhost:8000/ph/comparisons/${comp.slug}`}
              />
            ))
          )
        ) : activeTab === "educational" ? (
          glossary.length === 0 && faqs.length === 0 ? (
            <SovereignEmptyState
              icon={<BookOpen className="size-6 text-slate-400" />}
              heading="No Educational Content Found"
              description="Click '+ Add Term / FAQ' to add glossary definitions or clinical questions."
              action={
                <Button size="small" onClick={handleAddClick}>
                  Add Term / FAQ
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {/* Glossary Items */}
              {glossary.map((item: any) => (
                <AdminListRowCard
                  key={item.id || item.term}
                  onClick={() => {
                    setSelectedEducational(item)
                    setEducationalDrawerOpen(true)
                  }}
                  icon={<BookOpen className="size-4 text-emerald-600" />}
                  title={item.term}
                  subtitle={item.definition}
                  badge={
                    <Badge size="small" color="blue" className="text-[10px]">
                      {item.category || "Glossary"}
                    </Badge>
                  }
                  value={item.relatedCompounds?.length ? `${item.relatedCompounds.length} compounds` : undefined}
                  statusPill={
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
                      <span>Edit Term</span>
                      <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-slate-700" />
                    </span>
                  }
                  onDelete={() =>
                    promptDelete(
                      item.id || item.term.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      item.term,
                      "/admin/educational-content"
                    )
                  }
                />
              ))}

              {/* FAQ Items */}
              {faqs.map((faq: any) => (
                <AdminListRowCard
                  key={faq.id || faq.question}
                  onClick={() => {
                    setSelectedEducational(faq)
                    setEducationalDrawerOpen(true)
                  }}
                  icon={<BookOpen className="size-4 text-amber-600" />}
                  title={faq.question}
                  subtitle={faq.answer}
                  badge={
                    <Badge size="small" color="orange" className="text-[10px]">
                      FAQ · {faq.category || "General"}
                    </Badge>
                  }
                  statusPill={
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
                      <span>Edit FAQ</span>
                      <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-slate-700" />
                    </span>
                  }
                  onDelete={() =>
                    promptDelete(faq.id || faq.question, faq.question, "/admin/educational-content")
                  }
                />
              ))}
            </div>
          )
        ) : (
          stackRules.length === 0 ? (
            <SovereignEmptyState
              icon={<Bolt className="size-6 text-slate-400" />}
              heading="No Stack Synergy Rules Found"
              description="Click '+ Add Synergy Rule' to define pairwise biochemical rules."
              action={
                <Button size="small" onClick={handleAddClick}>
                  Add Synergy Rule
                </Button>
              }
            />
          ) : (
            stackRules.map((rule: any) => (
              <AdminListRowCard
                key={rule.id || `${rule.compound_a}_${rule.compound_b}`}
                onClick={() => {
                  setSelectedStack(rule)
                  setStackDrawerOpen(true)
                }}
                icon={<Bolt className="size-4 text-amber-600" />}
                title={rule.title}
                subtitle={`${rule.compound_a?.toUpperCase()} + ${rule.compound_b?.toUpperCase()} · ${rule.mechanismSummary}`}
                badge={
                  <Badge
                    size="small"
                    color={
                      rule.status === "contraindicated"
                        ? "red"
                        : rule.status === "additive"
                        ? "blue"
                        : "green"
                    }
                    className="text-[10px]"
                  >
                    {rule.status || "Synergistic"}
                  </Badge>
                }
                value={`Score ${rule.score || rule.synergyScore || 90}/100`}
                secondaryValue={rule.timingProtocol}
                statusPill={
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors">
                    <span>Edit Rule</span>
                    <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-slate-700" />
                  </span>
                }
                onDelete={() =>
                  promptDelete(
                    rule.id || `${rule.compound_a}_${rule.compound_b}`,
                    rule.title,
                    "/admin/peptide-stack-interactions"
                  )
                }
              />
            ))
          )
        )}
      </div>

      {/* 6. Horizontal Operational Action Suites Dock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <AdminSuiteCard
          variant="blue"
          icon={<DocumentText className="size-4 text-blue-700" />}
          eyebrow="PubMed &amp; Ingestion Suite"
          statusBadge="Active Synced"
          statusVariant="blue"
          title="Monograph Knowledge Pipeline"
          description="Peer-reviewed literature ingestor matching PubMed IDs, CAS chemical numbers, and clinical receptor binding data to public compound handles."
          actionLabel="View Public Library"
          actionHref="http://localhost:8000/ph/research-library"
        >
          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-[11px] text-blue-900 font-mono space-y-1">
            <div>&bull; ISO/USP Sterile Reconstitution Standards</div>
            <div>&bull; Beyond-Use Date (BUD) Degradation Matrix</div>
            <div>&bull; FDA 21 CFR Research Use Only Disclaimers</div>
          </div>
        </AdminSuiteCard>

        <AdminSuiteCard
          variant="purple"
          icon={<Sparkles className="size-4 text-purple-700" />}
          eyebrow="Comparative Analytics"
          statusBadge="Efficacy Matrix"
          statusVariant="emerald"
          title="Head-to-Head Comparison Studio"
          description="Authoritative comparison engines contrasting bio-availability, receptor affinity kinetics, and tissue targeting between similar peptide compounds."
          actionLabel="Add New Comparison"
          onActionClick={() => {
            setSelectedComparison(null)
            setComparisonDrawerOpen(true)
          }}
        />

        <AdminSuiteCard
          variant="amber"
          icon={<Bolt className="size-4 text-amber-700" />}
          eyebrow="Biochemical Synergy Engine"
          statusBadge="Pharmacology"
          statusVariant="amber"
          title="Pairwise Interaction Safety Shield"
          description="Guards researcher checkout carts and protocol generators by warning against antagonistic receptor saturation or concurrent GLP-1 escalations."
          actionLabel="Add Synergy Rule"
          onActionClick={() => {
            setSelectedStack(null)
            setStackDrawerOpen(true)
          }}
        />
      </div>

      {/* Slide-Over Drawers (for shorter entities) */}
      <ComparisonCreateEditDrawer
        open={comparisonDrawerOpen}
        onOpenChange={setComparisonDrawerOpen}
        comparison={selectedComparison}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-peptide-comparisons"] })}
      />

      <EducationalCreateEditDrawer
        open={educationalDrawerOpen}
        onOpenChange={setEducationalDrawerOpen}
        item={selectedEducational}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-educational-content"] })}
      />

      <StackInteractionCreateEditDrawer
        open={stackDrawerOpen}
        onOpenChange={setStackDrawerOpen}
        interaction={selectedStack}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-peptide-stack-interactions"] })}
      />

      {/* Universal Delete Confirmation Modal */}
      {deleteDialogOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <Trash className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm Entity Deletion</h3>
                <p className="text-xs text-slate-500">This action will remove the record from Medusa.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{deleteTarget.title}"</span>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                size="small"
                className="bg-rose-600 text-white hover:bg-rose-700"
                isLoading={isDeleting}
                onClick={confirmDelete}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Research Library",
  icon: BookOpen,
  rank: 10,
})

export default ResearchLibraryPage
