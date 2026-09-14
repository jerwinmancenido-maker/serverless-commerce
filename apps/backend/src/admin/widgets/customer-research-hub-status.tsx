/**
 * @file    apps/backend/src/admin/widgets/customer-research-hub-status.tsx
 * @module  CustomerResearchHubStatusWidget (SADS 2.0 Standard)
 * @purpose Customer detail widget displaying active agreements, routines, and rewards balance.
 * @contracts
 *   Widget: customer.details.before
 *   Service: ResearchTrackingModuleService · RewardsModuleService
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import type { HttpTypes } from "@medusajs/types"
import { ShieldCheck, Sparkles, BookOpen, Clock } from "@medusajs/icons"
import { Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import React from "react"

import { sdk } from "../lib/sdk"
import { AdminBadge } from "../components/ui/admin-badge"

type Response = {
  research_hub: {
    active: boolean
    agreement_version: string | null
    protocol_entitlements: number
    active_routines: number
    reminders_enabled: boolean
    rewards_balance: number
    last_general_activity_at: string | null
  }
}

const CustomerResearchHubStatus = ({ data: customer }: DetailWidgetProps<HttpTypes.AdminCustomer>) => {
  const query = useQuery({
    queryKey: ["customer-research-hub", customer.id],
    queryFn: () => sdk.client.fetch<Response>(`/admin/customers/${customer.id}/research-hub-status`),
  })
  const data = query.data?.research_hub

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs mb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono">
              Research Hub · Clinical Status
            </span>
            {data && (
              <AdminBadge variant={data.active ? "emerald" : "slate"} dot>
                {data.active ? "Active Covenants" : "Inactive"}
              </AdminBadge>
            )}
          </div>
          <Heading level="h2" className="text-base font-bold text-slate-900 mt-1">
            Researcher Protocol &amp; Compliance Entitlements
          </Heading>
          <Text size="xsmall" className="text-slate-500 mt-0.5">
            Operational status and telemetry only. Journal entries, dosage calibrations, and private clinical observations are encrypted per DPA 2012.
          </Text>
        </div>
      </div>

      {query.isLoading ? (
        <Text size="small" className="mt-4 text-slate-400">Loading researcher telemetry…</Text>
      ) : query.isError ? (
        <Text size="small" className="mt-4 text-rose-600">Research Hub status could not be loaded.</Text>
      ) : data ? (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <StatusTile label="Agreement Version" value={data.agreement_version || "Not accepted"} icon={<ShieldCheck className="size-3.5 text-blue-600" />} />
          <StatusTile label="Protocol Entitlements" value={String(data.protocol_entitlements)} icon={<BookOpen className="size-3.5 text-purple-600" />} />
          <StatusTile label="Active Routines" value={String(data.active_routines)} icon={<Clock className="size-3.5 text-emerald-600" />} />
          <StatusTile label="Reminders Telemetry" value={data.reminders_enabled ? "Active" : "Disabled"} icon={<Sparkles className="size-3.5 text-amber-600" />} />
          <StatusTile label="Rewards Balance" value={`${data.rewards_balance} pts`} icon={<Sparkles className="size-3.5 text-indigo-600" />} />
          <StatusTile
            label="Last Activity"
            value={data.last_general_activity_at ? new Date(data.last_general_activity_at).toLocaleDateString() : "—"}
            icon={<Clock className="size-3.5 text-slate-400" />}
          />
        </div>
      ) : null}
    </div>
  )
}

const StatusTile = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="rounded-lg border border-slate-200/60 bg-slate-50/50 p-2.5 flex flex-col justify-between">
    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
      <span>{label}</span>
      {icon}
    </div>
    <span className="text-xs font-bold font-mono text-slate-900 mt-1 tracking-tight truncate">{value}</span>
  </div>
)

export const config = defineWidgetConfig({ zone: "customer.details.before" })

export default CustomerResearchHubStatus
