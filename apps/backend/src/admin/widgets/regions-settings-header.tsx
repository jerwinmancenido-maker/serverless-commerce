/**
 * @file    apps/backend/src/admin/widgets/regions-settings-header.tsx
 * @module  RegionsSettingsHeader (Admin Extension)
 * @purpose Modern Sovereign Operations & Currency command banner for Regions Settings.
 * @contracts
 *   Widget: region.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  BuildingStorefront,
  CheckCircleSolid,
  Clock,
  GlobeEurope,
  ShieldCheck,
} from "@medusajs/icons"
import { Badge, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"
import { SettingsQuickNavigationGrid } from "../components/settings/settings-quick-navigation-grid"

const RegionsSettingsHeader = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_regions_header"],
    queryFn: () => sdk.admin.region.list({ limit: 100 }),
  })

  const regions = data?.regions || []
  const regionCount = data?.count ?? regions.length
  const primaryRegion = regions[0]
  const primaryCurrency = primaryRegion?.currency_code?.toUpperCase() || "PHP"
  const countriesCount = primaryRegion?.countries?.length || 1

  return (
    <div className="flex flex-col gap-y-5 mb-6 -order-1 w-full max-w-full overflow-hidden" style={{ order: -1 }}>
      {/* ── SOVEREIGN HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-32 size-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-blue-300 uppercase">
                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                Live Currency Core
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Clock className="size-3" />
                Asia/Manila (PHT, UTC+8)
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                Anchor Currency: {primaryCurrency} ₱
              </span>
            </div>

            <Heading level="h1" className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-1">
              Regions & Sovereign Currency Calibration
            </Heading>

            <Text className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Regional shipping boundaries, domestic currency settlement (PHP ₱), direct net analytical reference pricing, and Manual QR Ph payment gateway configurations.
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
              to="/price-lists-studio"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 border border-blue-500/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <ShieldCheck className="size-3.5 text-blue-200" />
              <span>Price Lists Studio</span>
            </Link>
          </div>
        </div>

        {/* System Invariants Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-blue-400 shrink-0" />
            <span>Direct Scientific Net Pricing</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-blue-400 shrink-0" />
            <span>₱0.00 General Ledger Parity</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-blue-400 shrink-0" />
            <span>Manual QR Ph / InstaPay / Maya</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-blue-400 shrink-0" />
            <span>Zero FX Friction Sovereign Settling</span>
          </div>
        </div>
      </div>

      {/* ── REGIONAL TELEMETRY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Anchor Market</span>
              <Badge size="2xsmall" color={isLoading ? "grey" : "blue"} className="text-[10px]">
                {isLoading ? "Querying..." : `${regionCount} Active Market${regionCount === 1 ? "" : "s"}`}
              </Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">
              {isLoading ? "Loading..." : `${primaryRegion?.name || "Philippines"} (${primaryCurrency})`}
            </Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Nationwide shipping zone covering NCR, Luzon, Visayas, and Mindanao with localized postal directory validation.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Covered Territories</span>
            <span className="text-blue-600 font-semibold">{countriesCount} {countriesCount === 1 ? "Country" : "Countries"}</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Pricing Architecture</span>
              <Badge size="2xsmall" color="green" className="text-[10px]">RUO Standard</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Direct Net Pricing ({primaryCurrency} ₱)</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Pure research reference standard pricing without hidden markups, surcharges, or foreign currency conversion fees.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Tax Protocol</span>
            <span className="text-emerald-600 font-semibold">Zero-Tax RUO</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Payment Gateways</span>
              <Badge size="2xsmall" color="purple" className="text-[10px]">Verified</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Manual QR Ph & InstaPay</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Proof-gated checkout requiring payment receipt submission and staff verification before order capture.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Settlement SLA</span>
            <span className="text-purple-600 font-semibold">Staff Reconciled</span>
          </div>
        </div>
      </div>

      {/* ── SETTINGS QUICK-NAVIGATION MATRIX ── */}
      <SettingsQuickNavigationGrid activeModule="regions" />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: ["region.list.before", "region.details.before"],
})

export default RegionsSettingsHeader
