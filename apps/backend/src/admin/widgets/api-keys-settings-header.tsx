/**
 * @file    apps/backend/src/admin/widgets/api-keys-settings-header.tsx
 * @module  ApiKeysSettingsHeader (Admin Extension)
 * @purpose Modern Sovereign Operations & API Credentials command banner for API Keys Settings.
 * @contracts
 *   Widget: api_key.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  BuildingStorefront,
  CheckCircleSolid,
  Clock,
  Key,
  ShieldCheck,
} from "@medusajs/icons"
import { Badge, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"
import { SettingsQuickNavigationGrid } from "../components/settings/settings-quick-navigation-grid"

const ApiKeysSettingsHeader = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_api_keys_header"],
    queryFn: () => sdk.admin.apiKey.list({ limit: 100 }),
  })

  const apiKeys = data?.api_keys || []
  const publishableKeys = apiKeys.filter((k) => k.type === "publishable")
  const secretKeys = apiKeys.filter((k) => k.type === "secret")

  return (
    <div className="flex flex-col gap-y-5 mb-6 -order-1 w-full max-w-full overflow-hidden" style={{ order: -1 }}>
      {/* ── SOVEREIGN HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-32 size-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-300 uppercase">
                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                Live Security Core
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Clock className="size-3" />
                Asia/Manila (PHT, UTC+8)
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                {isLoading ? "Querying..." : `${apiKeys.length} Active Key${apiKeys.length === 1 ? "" : "s"}`}
              </span>
            </div>

            <Heading level="h1" className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-1">
              API Keys & Cryptographic Authentication Tokens
            </Heading>

            <Text className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Storefront publishable tokens, privileged serverless secret credentials, API rate-limiting thresholds, and token lifecycle management.
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
              to="/bot-lab"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <Key className="size-3.5 text-amber-200" />
              <span>Bot Mission Control</span>
            </Link>
          </div>
        </div>

        {/* System Invariants Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-amber-400 shrink-0" />
            <span>Storefront Publishable Isolation</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-amber-400 shrink-0" />
            <span>Zero Secrets in Source Code</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-amber-400 shrink-0" />
            <span>Cryptographic HMAC Signatures</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-amber-400 shrink-0" />
            <span>Instant Revocation & Rotation</span>
          </div>
        </div>
      </div>

      {/* ── API TOKEN TELEMETRY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Client Access</span>
              <Badge size="2xsmall" color={isLoading ? "grey" : "blue"} className="text-[10px]">
                {isLoading ? "Querying..." : `${publishableKeys.length} Publishable`}
              </Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">
              {isLoading ? "Loading..." : `${publishableKeys.length} Storefront Key${publishableKeys.length === 1 ? "" : "s"}`}
            </Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Bound to specific sales channels for public catalog browsing, peptide searches, and cart checkout operations.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Scope</span>
            <span className="text-blue-600 font-semibold">Storefront Limited</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Privileged Access</span>
              <Badge size="2xsmall" color={isLoading ? "grey" : "purple"} className="text-[10px]">
                {isLoading ? "Querying..." : `${secretKeys.length} Secret`}
              </Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">
              {isLoading ? "Loading..." : `${secretKeys.length} Admin Token${secretKeys.length === 1 ? "" : "s"}`}
            </Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Used by serverless tasks, ERP integrations, and automated background jobs to access privileged Medusa APIs.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Storage</span>
            <span className="text-purple-600 font-semibold">Environment Encrypted</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Security Guard</span>
              <Badge size="2xsmall" color="green" className="text-[10px]">Active</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Rate Limiting & Defense</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Defends endpoints against automated bot scraping, unauthorized credential stuffing, and brute force requests.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Protection</span>
            <span className="text-emerald-600 font-semibold">Defense-in-Depth</span>
          </div>
        </div>
      </div>

      {/* ── SETTINGS QUICK-NAVIGATION MATRIX ── */}
      <SettingsQuickNavigationGrid activeModule="api-keys" />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: ["api_key.list.before", "api_key.details.before"],
})

export default ApiKeysSettingsHeader
