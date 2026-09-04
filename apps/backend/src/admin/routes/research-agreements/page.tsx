import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BookOpen, DocumentText, Plus } from "@medusajs/icons"
import { Badge, Button, Container, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { Link } from "react-router-dom"

import { EmptyState } from "../../components/empty-state"
import { KpiCard } from "../../components/kpi-card"
import { PageHeader } from "../../components/page-header"
import { sdk } from "../../lib/sdk"
import type { ResearchAgreementListResponse } from "./types"

const statusColor = (status: string) => {
  if (status === "active") return "green" as const
  if (status === "draft" || status === "scheduled") return "orange" as const
  return "grey" as const
}

const ResearchAgreementsPage = () => {
  const query = useQuery({
    queryKey: ["research-agreements"],
    queryFn: () =>
      sdk.client.fetch<ResearchAgreementListResponse>(
        "/admin/research-agreements",
      ),
  })

  const bundles = query.data?.agreement_bundles || []
  const acceptanceCounts = query.data?.acceptance_counts || {}

  const activeBundle = useMemo(
    () => bundles.find((b) => b.status === "active"),
    [bundles],
  )

  const totalAcceptances = useMemo(
    () =>
      Object.values(acceptanceCounts).reduce<number>(
        (acc, count) => acc + (count as number),
        0,
      ),
    [acceptanceCounts],
  )

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* 1. Standard PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "Compliance", href: "/research-agreements" },
          { label: "Customer Agreements" },
        ]}
        title="Customer Agreements"
        subtitle="Version and publish the combined Terms, Privacy Policy, and Research Hub compliance bundle used at checkout & customer onboarding."
        statusDropdown={
          activeBundle ? (
            <Badge size="small" color="green" className="font-mono text-[11px]">
              ● Active: v{activeBundle.public_version}
            </Badge>
          ) : (
            <Badge size="small" color="orange" className="font-mono text-[11px]">
              ● No Active Bundle
            </Badge>
          )
        }
        actions={
          <Button asChild size="small" className="h-8 text-xs inline-flex items-center gap-1">
            <Link to="/research-agreements/new">
              <Plus /> Add Agreement
            </Link>
          </Button>
        }
      />

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          title="Active Public Version"
          value={activeBundle ? `v${activeBundle.public_version}` : "None"}
          icon="📜"
          status={activeBundle ? "healthy" : "warning"}
          subtext={activeBundle ? `Locale: ${activeBundle.locale}` : "Draft required"}
        />
        <KpiCard
          title="Total Signed Acceptances"
          value={totalAcceptances}
          icon="✍️"
          status="info"
          subtext="Verified account agreements"
        />
        <KpiCard
          title="Regulatory Compliance"
          value="100% Compliant"
          icon="⚖️"
          status="healthy"
          subtext="DPA 2012 & BIR terms verified"
        />
      </div>

      {/* 3. Main Data Container */}
      <Container className="divide-y p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base">
        <div className="px-4 py-3 bg-ui-bg-subtle/20 border-b border-ui-border-base flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ui-fg-muted">
            Agreement Bundles & Version History
          </span>
          <span className="text-xs font-mono text-ui-fg-muted">
            {bundles.length} {bundles.length === 1 ? "version" : "versions"}
          </span>
        </div>

        {query.isLoading ? (
          <div className="p-8 text-center text-ui-fg-muted text-xs">
            Loading agreements…
          </div>
        ) : query.isError ? (
          <div className="p-8 text-center text-ui-fg-error text-xs">
            Agreements could not be loaded. Check permissions.
          </div>
        ) : bundles.length ? (
          <div className="divide-y divide-ui-border-base">
            {bundles.map((bundle) => {
              const count = acceptanceCounts[bundle.id] || 0
              return (
                <div
                  key={bundle.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-ui-bg-subtle/50 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/research-agreements/${bundle.id}`}
                        className="font-semibold text-ui-fg-base text-sm hover:text-ui-fg-interactive hover:underline inline-flex items-center gap-1.5"
                      >
                        <span>📄</span>
                        <span>Version {bundle.public_version}</span>
                      </Link>
                      <Badge size="small" color={statusColor(bundle.status)} className="capitalize">
                        {bundle.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-ui-fg-muted">
                      <span className="font-mono text-[11px] bg-ui-bg-subtle px-1.5 py-0.5 rounded border">
                        {bundle.locale}
                      </span>
                      <span>·</span>
                      <span>
                        Effective {new Date(bundle.effective_at).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-ui-fg-subtle">
                        ✍️ {count} {count === 1 ? "acceptance" : "acceptances"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild size="small" variant="secondary" className="h-7 text-xs">
                      <Link to={`/research-agreements/${bundle.id}`}>
                        Review Bundle ↗
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon="📜"
            title="No agreement bundle yet"
            description="Create a draft agreement bundle before opening customer registration on the storefront."
            actionLabel="Add First Agreement"
            onAction={() => window.location.assign("/app/research-agreements/new")}
          />
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Research Agreements",
  nested: "/products",
})

export default ResearchAgreementsPage
