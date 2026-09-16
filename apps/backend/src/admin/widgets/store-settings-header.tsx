/**
 * @file    apps/backend/src/admin/widgets/store-settings-header.tsx
 * @module  StoreSettingsHeader (Admin Extension)
 * @purpose Modern Sovereign Operations & Analytical Calibration command banner for Medusa Store Settings.
 * @contracts
 *   Widget: store.details.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  ArrowPath,
  ArrowRightMini,
  BuildingStorefront,
  CheckCircleSolid,
  Clock,
  GlobeEurope,
  Key,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "@medusajs/icons"
import { Badge, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"
import { SettingsQuickNavigationGrid } from "../components/settings/settings-quick-navigation-grid"

type StoreSettingsHeaderProps = {
  data?: {
    id?: string
    name?: string
    default_currency_code?: string
    default_region_id?: string
    default_sales_channel_id?: string
    default_location_id?: string
  }
}

const StoreSettingsHeader = ({ data }: StoreSettingsHeaderProps) => {
  const { data: storeListData } = useQuery({
    queryKey: ["admin_store_details_header"],
    queryFn: () => sdk.admin.store.list(),
    enabled: !data?.name,
  })

  const store = data || storeListData?.stores?.[0]
  const storeName = store?.name || "Research Compounds"
  const defaultCurrency = (data?.default_currency_code || (store && "default_currency_code" in store ? (store as Record<string, any>).default_currency_code : null) || "php").toUpperCase()

  return (
    <div className="flex flex-col gap-y-5 mb-6 -order-1" style={{ order: -1 }}>
      {/* ── SOVEREIGN HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-32 size-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-300 uppercase">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Operational Core
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Clock className="size-3" />
                Asia/Manila (PHT, UTC+8)
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                Base Currency: {defaultCurrency} (₱)
              </span>
            </div>

            <Heading level="h1" className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-1">
              {storeName} · Sovereign Settings & Calibration
            </Heading>

            <Text className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Global commerce engine configuration, multi-channel catalog routing, and strict analytical reference standard compliance. All transactions are calibrated under direct net scientific pricing and J&T Express automated logistics.
            </Text>
          </div>

          {/* Direct Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:self-start md:self-center">
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
              to="/bot-lab"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <Sparkles className="size-3.5 text-indigo-200" />
              <span>Bot Mission Control</span>
            </Link>
          </div>
        </div>

        {/* System Invariants Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>In-Vitro RUO Calibration Standard</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>₱0.00 General Ledger Parity</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Manual QR Ph Instant Settlement</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>J&T Express Real-Time Dispatch</span>
          </div>
        </div>
      </div>

      {/* ── SETTINGS QUICK-NAVIGATION MATRIX ── */}
      <SettingsQuickNavigationGrid activeModule="store" />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "store.details.before",
})

export default StoreSettingsHeader
