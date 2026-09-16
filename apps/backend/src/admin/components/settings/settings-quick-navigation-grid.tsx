/**
 * @file    apps/backend/src/admin/components/settings/settings-quick-navigation-grid.tsx
 * @module  SettingsQuickNavigationGrid (SADS 2.0)
 * @purpose Standardized 8-card navigation matrix across all Medusa Settings routes with live telemetry and active route states.
 * @contracts
 *   Design:    Storefront SADS 2.0 & Sovereign Admin
 *   Routes:    /settings/locations, /settings/regions, /settings/sales-channels, /settings/users, /settings/publishable-api-keys, /settings/workflows, /research-hub-settings, /notification-center
 */

import React from "react"
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
import { Link, useLocation } from "react-router-dom"
import { sdk } from "../../lib/sdk"

export type SettingsModuleKey =
  | "locations"
  | "regions"
  | "sales-channels"
  | "users"
  | "api-keys"
  | "workflows"
  | "research-hub"
  | "notification-center"
  | "store"

interface SettingsQuickNavigationGridProps {
  activeModule?: SettingsModuleKey
}

export const SettingsQuickNavigationGrid: React.FC<SettingsQuickNavigationGridProps> = ({
  activeModule,
}) => {
  const location = useLocation()

  let effectiveModule = activeModule
  if (!effectiveModule && location?.pathname) {
    const p = location.pathname
    if (p.includes("/settings/locations")) effectiveModule = "locations"
    else if (p.includes("/settings/regions")) effectiveModule = "regions"
    else if (p.includes("/settings/sales-channels")) effectiveModule = "sales-channels"
    else if (p.includes("/settings/users")) effectiveModule = "users"
    else if (
      p.includes("/settings/publishable-api-keys") ||
      p.includes("/settings/secret-api-keys") ||
      p.includes("/settings/api-keys")
    )
      effectiveModule = "api-keys"
    else if (p.includes("/settings/workflows")) effectiveModule = "workflows"
    else if (p.includes("/research-hub-settings")) effectiveModule = "research-hub"
    else if (p.includes("/notification-center")) effectiveModule = "notification-center"
    else if (p.includes("/settings/store")) effectiveModule = "store"
  }

  const { data: locationsData } = useQuery({
    queryKey: ["admin_settings_grid_locations"],
    queryFn: () => sdk.admin.stockLocation.list({ limit: 100 }),
    staleTime: 60_000,
  })

  const { data: regionsData } = useQuery({
    queryKey: ["admin_settings_grid_regions"],
    queryFn: () => sdk.admin.region.list({ limit: 100 }),
    staleTime: 60_000,
  })

  const { data: channelsData } = useQuery({
    queryKey: ["admin_settings_grid_channels"],
    queryFn: () => sdk.admin.salesChannel.list({ limit: 100 }),
    staleTime: 60_000,
  })

  const { data: apiKeysData } = useQuery({
    queryKey: ["admin_settings_grid_api_keys"],
    queryFn: () => sdk.admin.apiKey.list({ limit: 100 }),
    staleTime: 60_000,
  })

  const { data: workflowsData } = useQuery({
    queryKey: ["admin_settings_grid_workflows"],
    queryFn: () => sdk.admin.workflowExecution.list({ limit: 50 }),
    staleTime: 60_000,
  })

  const locationCount = locationsData?.count ?? locationsData?.stock_locations?.length ?? 1
  const regionCount = regionsData?.count ?? regionsData?.regions?.length ?? 1
  const channelCount = channelsData?.count ?? channelsData?.sales_channels?.length ?? 2
  const apiKeyCount = apiKeysData?.count ?? apiKeysData?.api_keys?.length ?? 3
  const workflowCount = workflowsData?.count ?? workflowsData?.workflow_executions?.length ?? 0

  const primaryRegion = regionsData?.regions?.[0]
  const defaultCurrency = (primaryRegion?.currency_code || "php").toUpperCase()

  const quickCards = [
    {
      key: "locations" as SettingsModuleKey,
      title: "Stock Locations & Logistics",
      value: `${locationCount} Staging Hub${locationCount === 1 ? "" : "s"} · Manila Central`,
      desc: "Fulfillment origins, 20°C–25°C ambient desiccated storage, and J&T Express & Lalamove dispatch.",
      href: "/settings/locations",
      badge: "Active",
      badgeColor: "green" as const,
      icon: <MapPin className="size-4 text-emerald-600" />,
    },
    {
      key: "regions" as SettingsModuleKey,
      title: "Regions & Currency Markets",
      value: `${regionCount} Market Region${regionCount === 1 ? "" : "s"} · ${defaultCurrency} ₱`,
      desc: "Philippine domestic shipping boundary, PHP currency settlement, and zero-tax reference standard pricing.",
      href: "/settings/regions",
      badge: `${defaultCurrency} ₱ Base`,
      badgeColor: "blue" as const,
      icon: <ShieldCheck className="size-4 text-blue-600" />,
    },
    {
      key: "sales-channels" as SettingsModuleKey,
      title: "Sales Channels & Portals",
      value: `${channelCount} Active Channel${channelCount === 1 ? "" : "s"} · Online`,
      desc: "Digital client ordering portal, institutional procurement catalog, and inventory routing.",
      href: "/settings/sales-channels",
      badge: `${channelCount} Channels`,
      badgeColor: "purple" as const,
      icon: <BuildingStorefront className="size-4 text-purple-600" />,
    },
    {
      key: "users" as SettingsModuleKey,
      title: "Team RBAC & Staff Roles",
      value: "Staff Roles & Operations Access",
      desc: "Staff analytical roles, order review authorization, and cryptographic audit log tracing.",
      href: "/settings/users",
      badge: "Sovereign RBAC",
      badgeColor: "grey" as const,
      icon: <Users className="size-4 text-slate-600" />,
    },
    {
      key: "api-keys" as SettingsModuleKey,
      title: "API Keys & Credentials",
      value: `${apiKeyCount} Keys · Storefront & Secrets`,
      desc: "Client-safe publishable keys, encrypted backend serverless tokens, and token rotation.",
      href: "/settings/publishable-api-keys",
      badge: "Security",
      badgeColor: "orange" as const,
      icon: <Key className="size-4 text-amber-600" />,
    },
    {
      key: "workflows" as SettingsModuleKey,
      title: "Workflows & Automations",
      value: `${workflowCount} Executions · Sagas Active`,
      desc: "Atomic workflow step compensations, payment proof settlements, and automated BOM deductions.",
      href: "/settings/workflows",
      badge: "Engine",
      badgeColor: "blue" as const,
      icon: <ArrowPath className="size-4 text-cyan-600" />,
    },
    {
      key: "research-hub" as SettingsModuleKey,
      title: "Research Hub & Quiet Hours",
      value: "Telemetry & Protocol Automation",
      desc: "Quiet hours (22:00–07:00 PHT), replenishment snooze windows, and protocol reminders.",
      href: "/research-hub-settings",
      badge: "Automated",
      badgeColor: "orange" as const,
      icon: <Sparkles className="size-4 text-amber-600" />,
    },
    {
      key: "notification-center" as SettingsModuleKey,
      title: "Notification Center",
      value: "Templates & Delivery Routing",
      desc: "Automated customer email/SMS alerts, manual payment receipts, and courier dispatch triggers.",
      href: "/notification-center",
      badge: "Multi-Channel",
      badgeColor: "green" as const,
      icon: <Clock className="size-4 text-teal-600" />,
    },
  ]

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <Heading level="h2" className="text-sm font-semibold text-slate-900 tracking-tight">
            Settings &amp; Operations Modules
          </Heading>
          <span className="text-[11px] font-medium text-slate-500">
            Direct access to system configuration engines
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          8 Connected Modules
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickCards.map((card) => {
          const isActive = effectiveModule === card.key

          return (
            <Link
              key={card.href}
              to={card.href}
              className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 no-underline ${
                isActive
                  ? "border-blue-500 bg-blue-50/20 shadow-xs ring-1 ring-blue-500/20"
                  : "border-slate-200 bg-white hover:shadow-md hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex size-7 items-center justify-center rounded-lg border transition-transform group-hover:scale-105 ${
                        isActive
                          ? "bg-blue-100 border-blue-200"
                          : "bg-slate-100/90 border-slate-200/60"
                      }`}
                    >
                      {card.icon}
                    </div>
                    <Text
                      size="small"
                      weight="plus"
                      className={`font-semibold transition-colors ${
                        isActive
                          ? "text-blue-700 font-bold"
                          : "text-slate-800 group-hover:text-blue-600"
                      }`}
                    >
                      {card.title}
                    </Text>
                  </div>
                  <Badge
                    size="2xsmall"
                    color={isActive ? "blue" : card.badgeColor}
                    className="text-[10px] font-semibold"
                  >
                    {isActive ? "Current" : card.badge}
                  </Badge>
                </div>

                <Text className="text-xs font-medium text-slate-900 line-clamp-1">
                  {card.value}
                </Text>

                <Text className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {card.desc}
                </Text>
              </div>

              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] font-medium ${
                  isActive
                    ? "border-blue-200/60 text-blue-700"
                    : "border-slate-100 text-blue-600 group-hover:text-blue-700"
                }`}
              >
                <span>{isActive ? "Active Module View" : "Configure Module"}</span>
                <ArrowRightMini
                  className={`size-3.5 transition-transform ${
                    isActive ? "text-blue-700" : "group-hover:translate-x-1"
                  }`}
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default SettingsQuickNavigationGrid
