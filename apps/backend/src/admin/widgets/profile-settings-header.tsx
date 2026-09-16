/**
 * @file    apps/backend/src/admin/widgets/profile-settings-header.tsx
 * @module  ProfileSettingsHeader (Admin Extension)
 * @purpose Modern Sovereign Operations & Operator Profile command banner for Profile Settings.
 * @contracts
 *   Widget: profile.details.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  BuildingStorefront,
  CheckCircleSolid,
  Clock,
  ShieldCheck,
  User,
} from "@medusajs/icons"
import { Badge, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"
import { SettingsQuickNavigationGrid } from "../components/settings/settings-quick-navigation-grid"

const ProfileSettingsHeader = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_user_me_header"],
    queryFn: () => sdk.admin.user.me(),
  })

  const operatorEmail = data?.user?.email || "admin@test.com"
  const operatorName =
    [data?.user?.first_name, data?.user?.last_name].filter(Boolean).join(" ") ||
    "Sovereign Operator"

  return (
    <div className="flex flex-col gap-y-5 mb-6 -order-1" style={{ order: -1 }}>
      {/* ── SOVEREIGN HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-32 size-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-blue-300 uppercase">
                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                Live Operator Core
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Clock className="size-3" />
                Asia/Manila (PHT, UTC+8)
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                Founder Administrator
              </span>
            </div>

            <Heading level="h1" className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-1">
              Operator Profile & Session Calibration
            </Heading>

            <Text className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Authenticated staff operator profile, security credentials, system timezone alignment (Asia/Manila UTC+8), and personal admin preferences.
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
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <User className="size-3.5 text-indigo-200" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* System Invariants Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Encrypted Credential Hashing</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Sovereign Admin Authorization</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Asia/Manila (PHT, UTC+8) Clock Lock</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Zero Personal Liability Invariant</span>
          </div>
        </div>
      </div>

      {/* ── PROFILE TELEMETRY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Account Identity</span>
              <Badge size="2xsmall" color={isLoading ? "grey" : "blue"} className="text-[10px]">
                {isLoading ? "Querying..." : "Authenticated"}
              </Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">{isLoading ? "Loading..." : operatorName}</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Super-admin role authorized for manual payment proof approvals, pricing calibrations, and warehouse release.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span className="truncate max-w-[180px]">{operatorEmail}</span>
            <span className="text-blue-600 font-semibold">Founder Admin</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Timezone Anchor</span>
              <Badge size="2xsmall" color="green" className="text-[10px]">PHT</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Asia/Manila (UTC+8)</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              All transaction timestamps, proof submissions, and quiet-hour triggers calibrated to Philippine Standard Time.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Offset</span>
            <span className="text-emerald-600 font-semibold">+08:00</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Authentication</span>
              <Badge size="2xsmall" color="purple" className="text-[10px]">Active</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Session Security</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Protected session token with secure cookie storage, CSRF mitigation, and instant signout capability.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>State</span>
            <span className="text-purple-600 font-semibold">Live Session</span>
          </div>
        </div>
      </div>

      {/* ── SETTINGS QUICK-NAVIGATION MATRIX ── */}
      <SettingsQuickNavigationGrid />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "profile.details.before",
})

export default ProfileSettingsHeader
