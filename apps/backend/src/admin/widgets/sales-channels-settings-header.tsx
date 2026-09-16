/**
 * @file    apps/backend/src/admin/widgets/sales-channels-settings-header.tsx
 * @module  SalesChannelsSettingsHeader (Admin Extension)
 * @purpose Modern Sovereign Operations & Multi-Portal command banner for Sales Channels Settings.
 * @contracts
 *   Widget: sales_channel.list.before · sales_channel.details.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  ArrowRightMini,
  BuildingStorefront,
  CheckCircleSolid,
  Clock,
  GlobeEurope,
  Sparkles,
} from "@medusajs/icons"
import { Badge, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"
import { SettingsQuickNavigationGrid } from "../components/settings/settings-quick-navigation-grid"

const SalesChannelsSettingsHeader = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_sales_channels_header"],
    queryFn: () => sdk.admin.salesChannel.list({ limit: 100 }),
  })

  const channels = data?.sales_channels || []
  const channelCount = data?.count ?? channels.length
  const primaryChannel = channels[0]
  const primaryChannelName = primaryChannel?.name || "Default Sales Channel"

  return (
    <div className="flex flex-col gap-y-5 mb-6 -order-1 w-full max-w-full overflow-hidden" style={{ order: -1 }}>
      {/* ── SOVEREIGN HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-32 size-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-purple-300 uppercase">
                <span className="size-1.5 rounded-full bg-purple-400 animate-pulse" />
                Live Channel Core
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Clock className="size-3" />
                Asia/Manila (PHT, UTC+8)
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                Multi-Portal Routing
              </span>
            </div>

            <Heading level="h1" className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-1">
              Sales Channels & Multi-Portal Distribution
            </Heading>

            <Text className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Omnichannel compound catalog syndication, public storefront portal isolation, institutional wholesale routing, and automated inventory allocation rules.
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

            <a
              href="http://localhost:8000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors"
            >
              <GlobeEurope className="size-3.5" />
              <span>Storefront Portal</span>
              <ArrowRightMini className="size-3 text-slate-400" />
            </a>

            <Link
              to="/products-registry"
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-600 border border-purple-500/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <BuildingStorefront className="size-3.5 text-purple-200" />
              <span>Products Registry</span>
            </Link>
          </div>
        </div>

        {/* System Invariants Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-purple-400 shrink-0" />
            <span>Storefront Portal Isolation (:8000)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-purple-400 shrink-0" />
            <span>Synchronized Real-Time Inventory</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-purple-400 shrink-0" />
            <span>Institutional RFQ & Wholesale</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-purple-400 shrink-0" />
            <span>Strict RUO Non-FDA Disclaimer Lock</span>
          </div>
        </div>
      </div>

      {/* ── CHANNEL TELEMETRY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Digital Storefront</span>
              <Badge size="2xsmall" color={isLoading ? "grey" : "green"} className="text-[10px]">
                {isLoading ? "Querying..." : `${channelCount} Active Channel${channelCount === 1 ? "" : "s"}`}
              </Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">
              {isLoading ? "Loading..." : primaryChannelName}
            </Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Customer-facing Next.js App Router storefront with instant search, peptide reconstitutors, and guides.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Runtime Port</span>
            <span className="text-emerald-600 font-semibold">:8000 · Live</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Institutional Channel</span>
              <Badge size="2xsmall" color="purple" className="text-[10px]">Active</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Wholesale & RFQ Direct</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Wholesale client orders, research agreement contracts, and custom multi-vial analytical batch orders.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>BOM Allocation</span>
            <span className="text-purple-600 font-semibold">Volume Tiering</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Catalog Routing</span>
              <Badge size="2xsmall" color="blue" className="text-[10px]">Synced</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Product Availability Matrix</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Automatic stock threshold enforcement preventing out-of-stock compounds from appearing in storefront cart.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Inventory Guard</span>
            <span className="text-blue-600 font-semibold">Strict Hard-Cap</span>
          </div>
        </div>
      </div>

      {/* ── SETTINGS QUICK-NAVIGATION MATRIX ── */}
      <SettingsQuickNavigationGrid activeModule="sales-channels" />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: ["sales_channel.list.before", "sales_channel.details.before"],
})

export default SalesChannelsSettingsHeader
