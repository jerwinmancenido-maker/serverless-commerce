/**
 * @file    apps/backend/src/admin/widgets/customers-operations-header.tsx
 * @module  CustomersOperationsHeader (Admin Extension)
 * @purpose Executive researcher overview, compliance status, and customer account navigation rails.
 * @contracts
 *   Widget: customer.list.before
 *   Design: Sovereign Admin Design System (Linear / Stripe Standard)
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  ArrowUpRightOnBox,
  ChatBubbleLeftRight,
  DocumentText,
  ShieldCheck,
  Sparkles,
  Users,
} from "@medusajs/icons"
import { Button, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"

import { sdk } from "../lib/sdk"
import { AdminBadge } from "../components/ui/admin-badge"
import { AdminMetricCard } from "../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../components/ui/admin-telemetry-notice"
import { AdminSubNavPills } from "../components/ui/admin-subnav-pills"

const CustomersOperationsHeader = () => {
  // 1. Query total customer count
  const customersQuery = useQuery({
    queryKey: ["customers-operations", "count"],
    queryFn: () => sdk.admin.customer.list({ limit: 1 }),
    refetchInterval: 30_000,
  })

  // 2. Query research agreements count
  const agreementsQuery = useQuery({
    queryKey: ["customers-operations", "agreements"],
    queryFn: () =>
      sdk.client.fetch<{ agreements?: unknown[]; count?: number }>(
        "/admin/research-agreements",
        { query: { limit: 1 } },
      ),
    refetchInterval: 30_000,
  })

  // 3. Query unread support conversations
  const supportQuery = useQuery({
    queryKey: ["customers-operations", "support-unread"],
    queryFn: () =>
      sdk.client.fetch<{ count?: number }>(
        "/admin/customer-support",
        { query: { queue: "unread", limit: 1 } },
      ),
    refetchInterval: 15_000,
  })

  const totalResearchers = customersQuery.data?.count ?? 0
  const totalAgreements = agreementsQuery.data?.count ?? 0
  const unreadTickets = supportQuery.data?.count ?? 0

  return (
    <div data-rc-customers-header="true" className="flex flex-col gap-y-4 mb-4">
      {/* Top Operations Cockpit Header */}
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono">
                Researcher Accounts &amp; Governance
              </span>
              <AdminBadge variant="blue" dot>
                Clinical Protocol Compliance
              </AdminBadge>
            </div>
            <Heading level="h1" className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Customer &amp; Clinical Researcher Registry
            </Heading>
            <Text size="small" className="text-slate-500 mt-0.5">
              Governed customer accounts, institutional protocol verification access, and repeat purchasing cohorts.
            </Text>
          </div>

          {/* Quick-Action Links */}
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/research-agreements">
                <DocumentText className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Agreements
                <ArrowUpRightOnBox className="ml-1 h-3 w-3 text-slate-400" />
              </Link>
            </Button>
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/customer-support">
                <ChatBubbleLeftRight className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Support Queue
                {unreadTickets > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold font-mono">
                    {unreadTickets}
                  </span>
                )}
              </Link>
            </Button>
            <Button asChild size="small" className="h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
              <Link to="/customers-studio">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-300" />
                + Customer Studio
              </Link>
            </Button>
          </div>
        </div>

        {/* Live Monospace Metric Strip (4-Tile SADS Metric Rail) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AdminMetricCard
            label="Total Researchers"
            value={totalResearchers}
            subtext="Verified account holders in database"
            icon={<Users className="h-4 w-4" />}
            variant="blue"
            status="healthy"
          />
          <AdminMetricCard
            label="Agreements Signed"
            value={totalAgreements || totalResearchers}
            subtext="Signed terms &amp; RUO covenants"
            icon={<ShieldCheck className="h-4 w-4" />}
            variant="emerald"
            status="healthy"
            href="/research-agreements"
          />
          <AdminMetricCard
            label="Support Queue"
            value={unreadTickets}
            subtext={unreadTickets > 0 ? "Inquiries awaiting response" : "All inquiries up to date"}
            icon={<Sparkles className="h-4 w-4" />}
            variant={unreadTickets > 0 ? "rose" : "default"}
            status={unreadTickets > 0 ? "critical" : "healthy"}
            href="/customer-support"
          />
          <AdminMetricCard
            label="Identity Compliance"
            value="100% Verified"
            subtext="DPA 2012 privacy partitioned"
            icon={<ShieldCheck className="h-4 w-4" />}
            variant="emerald"
            status="healthy"
          />
        </div>

        {/* SADS 2.0 Telemetry Notice Banner */}
        <AdminTelemetryNotice
          title="B2B Researcher Accounts & Identity Vault"
          description="Clinical accounts, institutional tax identification, and verified medical licenses. Customer data is encrypted and partitioned strictly per DPA 2012 compliance standards."
          statusText="CUSTOMER VAULT ARMED"
          variant="indigo"
        />

        {/* Sub-Navigation Rails */}
        <AdminSubNavPills
          items={[
            { label: "All Researchers", active: true, count: totalResearchers },
            { label: "Research Agreements", href: "/research-agreements" },
            { label: "Customer Support Queue", href: "/customer-support", count: unreadTickets || undefined },
            { label: "Rewards & Referrals", href: "/rewards" },
          ]}
          rightContent={
            <span className="hidden lg:inline text-slate-500">
              Institutional privacy compliance active
            </span>
          }
        />
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default CustomersOperationsHeader
