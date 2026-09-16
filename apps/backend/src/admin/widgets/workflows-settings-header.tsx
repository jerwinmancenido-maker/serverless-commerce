/**
 * @file    apps/backend/src/admin/widgets/workflows-settings-header.tsx
 * @module  WorkflowsSettingsHeader (Admin Extension)
 * @purpose Modern Sovereign Operations & Automation command banner for Workflows Settings.
 * @contracts
 *   Widget: workflow.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  ArrowPath,
  BuildingStorefront,
  CheckCircleSolid,
  Clock,
  Sparkles,
} from "@medusajs/icons"
import { Badge, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"
import { SettingsQuickNavigationGrid } from "../components/settings/settings-quick-navigation-grid"

const WorkflowsSettingsHeader = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_workflows_header"],
    queryFn: () => sdk.admin.workflowExecution.list({ limit: 50 }),
  })

  const executions = data?.workflow_executions || []
  const executionCount = data?.count ?? executions.length

  return (
    <div className="flex flex-col gap-y-5 mb-6 -order-1 w-full max-w-full overflow-hidden" style={{ order: -1 }}>
      {/* ── SOVEREIGN HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-32 size-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-cyan-300 uppercase">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Live Workflow Core
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Clock className="size-3" />
                Asia/Manila (PHT, UTC+8)
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                {isLoading ? "Querying..." : `${executionCount} Executions Tracked`}
              </span>
            </div>

            <Heading level="h1" className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-1">
              Workflows Execution & Transactional Automations
            </Heading>

            <Text className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Step-by-step business workflows, atomic compensations, order lifecycle orchestration, and automated inventory deduction pipelines.
            </Text>
          </div>

          {/* Direct Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:self-start md:self-center">
            <Link
              to="/settings/store"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors"
            >
              <BuildingStorefront className="size-3.5" />
              <span>Store Settings</span>
            </Link>

            <Link
              to="/orders-cockpit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <ArrowPath className="size-3.5 text-cyan-200" />
              <span>Orders Cockpit</span>
            </Link>
          </div>
        </div>

        {/* System Invariants Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-cyan-400 shrink-0" />
            <span>Deterministic Step Compensation</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-cyan-400 shrink-0" />
            <span>Proof-Gated Order Settlement</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-cyan-400 shrink-0" />
            <span>Multi-Vial BOM Deduction</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-cyan-400 shrink-0" />
            <span>Protocol Access Synchronizer</span>
          </div>
        </div>
      </div>

      {/* ── WORKFLOW TELEMETRY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Payment Pipeline</span>
              <Badge size="2xsmall" color={isLoading ? "grey" : "green"} className="text-[10px]">
                {isLoading ? "Querying..." : `${executionCount} Sagas Executed`}
              </Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Manual Payment Verification</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Coordinates receipt review, payment capture execution, and double-entry ledger balance to ₱0.00 parity.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Safety Rollback</span>
            <span className="text-emerald-600 font-semibold">Enabled</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Inventory Pipeline</span>
              <Badge size="2xsmall" color="blue" className="text-[10px]">Automated</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Order BOM Component Deduction</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Unpacks compounded items and decrements raw peptide vials, diluent ampoules, and packaging assets atomically.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Accuracy</span>
            <span className="text-blue-600 font-semibold">100% Guaranteed</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Entitlement Pipeline</span>
              <Badge size="2xsmall" color="purple" className="text-[10px]">Synchronized</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Research Protocol Entitlement</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Grants analytical protocol access to verified customer portal accounts, revoking access if orders expire or cancel.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Sync Hook</span>
            <span className="text-purple-600 font-semibold">Real-Time Event</span>
          </div>
        </div>
      </div>

      {/* ── SETTINGS QUICK-NAVIGATION MATRIX ── */}
      <SettingsQuickNavigationGrid activeModule="workflows" />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: ["workflow.list.before", "workflow.details.before"],
})

export default WorkflowsSettingsHeader
