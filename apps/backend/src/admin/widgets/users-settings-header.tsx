/**
 * @file    apps/backend/src/admin/widgets/users-settings-header.tsx
 * @module  UsersSettingsHeader (Admin Extension)
 * @purpose Modern Sovereign Operations & Team RBAC command banner for Users Settings.
 * @contracts
 *   Widget: user.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  BuildingStorefront,
  CheckCircleSolid,
  Clock,
  ShieldCheck,
  Users,
} from "@medusajs/icons"
import { Badge, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"
import { SettingsQuickNavigationGrid } from "../components/settings/settings-quick-navigation-grid"

const UsersSettingsHeader = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_users_header"],
    queryFn: () => sdk.admin.user.list({ limit: 100 }),
  })

  const users = data?.users || []
  const userCount = data?.count ?? users.length

  return (
    <div className="flex flex-col gap-y-5 mb-6 -order-1" style={{ order: -1 }}>
      {/* ── SOVEREIGN HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-slate-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-32 size-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 border border-slate-400/30 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-slate-300 uppercase">
                <span className="size-1.5 rounded-full bg-slate-400 animate-pulse" />
                Live RBAC Core
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Clock className="size-3" />
                Asia/Manila (PHT, UTC+8)
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                Sovereign Governance
              </span>
            </div>

            <Heading level="h1" className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-1">
              Team Governance, Staff Roles & Sovereign RBAC
            </Heading>

            <Text className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Staff analytical roles, manual payment approval permissions, cryptographic credential management, and audit log traceability across commercial operations.
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 border border-slate-600/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <ShieldCheck className="size-3.5 text-slate-300" />
              <span>Orders Cockpit</span>
            </Link>
          </div>
        </div>

        {/* System Invariants Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Cryptographic Session Invalidation</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Immutable Payment Approval Tracing</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Zero Personal Liability Invariant</span>
          </div>
        </div>
      </div>

      {/* ── RBAC TELEMETRY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Access Scope</span>
              <Badge size="2xsmall" color={isLoading ? "grey" : "blue"} className="text-[10px]">
                {isLoading ? "Querying..." : `${userCount} Active Operator${userCount === 1 ? "" : "s"}`}
              </Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">
              {isLoading ? "Loading..." : `${userCount} Staff Account${userCount === 1 ? "" : "s"}`}
            </Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Granular capabilities separating catalog edits, inventory adjustments, and sensitive manual payment proof captures.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Enforcement</span>
            <span className="text-blue-600 font-semibold">Strict RBAC</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Session Security</span>
              <Badge size="2xsmall" color="green" className="text-[10px]">Guarded</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">JWT Token Rotation</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Time-bound authenticated operator sessions with immediate revocation on staff status changes.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Idle Timeout</span>
            <span className="text-emerald-600 font-semibold">Automatic</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Analytical Audit</span>
              <Badge size="2xsmall" color="purple" className="text-[10px]">Logged</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Operation Audit Trail</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Every staff action (proof approval, price matrix override, batch release) logged with UTC+8 timestamp and user ID.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Audit State</span>
            <span className="text-purple-600 font-semibold">100% Retained</span>
          </div>
        </div>
      </div>

      {/* ── SETTINGS QUICK-NAVIGATION MATRIX ── */}
      <SettingsQuickNavigationGrid activeModule="users" />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: ["user.list.before", "user.details.before"],
})

export default UsersSettingsHeader
