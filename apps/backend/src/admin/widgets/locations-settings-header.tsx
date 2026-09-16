/**
 * @file    apps/backend/src/admin/widgets/locations-settings-header.tsx
 * @module  LocationsSettingsHeader (Admin Extension)
 * @purpose Modern Sovereign Operations & Logistics command banner for Stock Locations Settings.
 * @contracts
 *   Widget: location.list.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  BuildingStorefront,
  CheckCircleSolid,
  Clock,
  MapPin,
} from "@medusajs/icons"
import { Badge, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../lib/sdk"
import { SettingsQuickNavigationGrid } from "../components/settings/settings-quick-navigation-grid"

const LocationsSettingsHeader = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_stock_locations_header"],
    queryFn: () => sdk.admin.stockLocation.list({ limit: 100 }),
  })

  const locations = data?.stock_locations || []
  const locationCount = data?.count ?? locations.length
  const primaryLocation = locations[0]
  const primaryHubName = primaryLocation?.name || "Manila Central Hub"

  return (
    <div className="flex flex-col gap-y-5 mb-6 -order-1" style={{ order: -1 }}>
      {/* ── SOVEREIGN HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-32 size-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-300 uppercase">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Logistics Core
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Clock className="size-3" />
                Asia/Manila (PHT, UTC+8)
              </span>
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                Primary Hub: Manila Central
              </span>
            </div>

            <Heading level="h1" className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-1">
              Stock Locations & Analytical Logistics
            </Heading>

            <Text className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Reference inventory staging, controlled ambient storage (20°C–25°C desiccated), and express carrier dispatch routing via J&T Express and Lalamove.
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
              to="/inventory-studio"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <MapPin className="size-3.5 text-emerald-200" />
              <span>Inventory Studio</span>
            </Link>
          </div>
        </div>

        {/* System Invariants Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>J&T & Lalamove Carrier Pickup</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>20°C–25°C Ambient Desiccated Storage</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Proof-Gated Inventory Reservation</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <CheckCircleSolid className="size-3.5 text-emerald-400 shrink-0" />
            <span>Atomic Multi-Vial BOM Deduction</span>
          </div>
        </div>
      </div>

      {/* ── LOGISTICS TELEMETRY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Fulfillment Origin</span>
              <Badge size="2xsmall" color={isLoading ? "grey" : "green"} className="text-[10px]">
                {isLoading ? "Querying..." : `${locationCount} Active Node${locationCount === 1 ? "" : "s"}`}
              </Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">{isLoading ? "Loading..." : primaryHubName}</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Default dispatch center for domestic Luzon, Visayas, and Mindanao express air/ground delivery.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Carriers: J&T & Lalamove</span>
            <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Storage Regimes</span>
              <Badge size="2xsmall" color="blue" className="text-[10px]">Calibrated</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Ambient Desiccated & Regulated</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Ambient temperature control (20°C–25°C) with desiccant protection for lyophilized vials, sterile diluents, and reference standard kits.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Environmental Logging</span>
            <span className="text-blue-600 font-semibold">24/7 Monitored</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Catalog Routing</span>
              <Badge size="2xsmall" color="purple" className="text-[10px]">Synchronized</Badge>
            </div>
            <Text className="text-sm font-bold text-slate-900">Online Store & Wholesale</Text>
            <Text className="text-[11px] text-slate-500 leading-relaxed">
              Multi-vial BOM allocation across single units, 5-vial research packs, and custom agreement bundles.
            </Text>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <span>Stock Depletion</span>
            <span className="text-purple-600 font-semibold">Real-Time Sync</span>
          </div>
        </div>
      </div>

      {/* ── SETTINGS QUICK-NAVIGATION MATRIX ── */}
      <SettingsQuickNavigationGrid activeModule="locations" />
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: ["location.list.before", "location.details.before"],
})

export default LocationsSettingsHeader
