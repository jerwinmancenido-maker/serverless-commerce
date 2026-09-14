"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { getCompoundProtocol } from "@lib/data/compound-protocols"
import type { ResearchProtocolAccess } from "@lib/data/research-tracking"
import {
  startProtocolRoutineAction,
  type ResearchTrackingActionState,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import { useActionState, useMemo, useState } from "react"
import { useFormStatus } from "react-dom"

type MyProtocolsProps = {
  protocols: ResearchProtocolAccess[]
  runtimeReady: boolean
  countryCode: string
  submissionKeys: Record<string, string>
  trackedMaterials: TrackedResearchMaterial[]
}

const initialState: ResearchTrackingActionState = {
  success: false,
  error: null,
}

function StartButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-ui-fg-base px-3 py-2 text-sm font-medium text-ui-bg-base disabled:opacity-50"
    >
      {pending ? "Starting…" : "Start tracking"}
    </button>
  )
}

function ProtocolRoutineForm({
  protocol,
  countryCode,
  submissionKey,
  trackedMaterials,
}: {
  protocol: ResearchProtocolAccess
  countryCode: string
  submissionKey: string
  trackedMaterials: TrackedResearchMaterial[]
}) {
  const [state, action] = useActionState(
    startProtocolRoutineAction,
    initialState,
  )
  const levels = protocol.routine_levels.filter((level) =>
    level.rows.every((row) => row.routine_ready),
  )
  const [selectedLevelKey, setSelectedLevelKey] = useState(
    levels[0]?.key || "",
  )
  const selectedLevel =
    levels.find((level) => level.key === selectedLevelKey) || levels[0]

  if (protocol.routine_id) {
    return (
      <p className="text-xs font-semibold text-emerald-700">
        ✓ Active in Personal Routines
      </p>
    )
  }

  if (!levels.length) {
    return null
  }

  if (!trackedMaterials.length) {
    return (
      <p className="text-xs text-amber-700">
        Add this item under Products & Supplies to start routine tracking.
      </p>
    )
  }

  return (
    <details className="group rounded-xl border border-ui-border-base bg-white p-3 text-xs">
      <summary className="cursor-pointer font-medium text-ui-fg-subtle hover:text-ui-fg-base">
        Start personal routine schedule ▾
      </summary>
      <form action={action} className="mt-3 space-y-3">
        <input type="hidden" name="country_code" value={countryCode} />
        <input type="hidden" name="profile_access_id" value={protocol.profile_access_id} />
        <input type="hidden" name="idempotency_key" value={submissionKey} />
        <label className="block text-xs font-medium text-ui-fg-base">
          Purchased item
          <select
            name="tracked_material_id"
            required
            className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-2.5 py-1.5 text-xs"
          >
            {trackedMaterials.map((material) => (
              <option key={material.tracked_material_id} value={material.tracked_material_id}>
                {material.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-ui-fg-base">
          Schedule
          <select
            name="protocol_level_key"
            required
            value={selectedLevelKey}
            onChange={(event) => setSelectedLevelKey(event.target.value)}
            className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-2.5 py-1.5 text-xs"
          >
            {levels.map((level) => (
              <option key={level.key} value={level.key}>
                {level.title}{level.duration ? ` · ${level.duration}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-ui-fg-base">
          Start date
          <input
            type="date"
            name="start_date"
            required
            className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-2.5 py-1.5 text-xs"
          />
        </label>
        <div className="overflow-hidden rounded-lg border border-ui-border-base bg-white">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-ui-bg-subtle text-ui-fg-subtle">
              <tr>
                <th className="px-2.5 py-1.5 font-semibold">Phase</th>
                <th className="px-2.5 py-1.5 font-semibold">Amount</th>
                <th className="px-2.5 py-1.5 font-semibold">Timing</th>
              </tr>
            </thead>
            <tbody>
              {selectedLevel?.rows.map((row) => (
                <tr key={row.row_key} className="border-t border-ui-border-base">
                  <td className="px-2.5 py-1.5">{row.period}</td>
                  <td className="px-2.5 py-1.5">{row.amount} {row.unit}</td>
                  <td className="px-2.5 py-1.5">{row.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-emerald-700">Routine started.</p> : null}
        <StartButton />
      </form>
    </details>
  )
}

function ProtocolThumbnail({
  thumbnail,
  title,
}: {
  thumbnail?: string | null
  title?: string | null
}) {
  const [imgError, setImgError] = useState(false)

  if (!thumbnail || imgError) {
    return (
      <span
        className="flex h-12 w-12 shrink-0 aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-xs font-bold tracking-tight text-white shadow-xs border border-slate-700/50"
        aria-hidden="true"
      >
        {(title || "").slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <div className="relative flex h-12 w-12 shrink-0 aspect-square items-center justify-center overflow-hidden rounded-xl border border-ui-border-base bg-white p-1 shadow-2xs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnail}
        alt={title || "Compound reference vial"}
        onError={() => setImgError(true)}
        className="h-full w-full max-h-full max-w-full object-contain"
      />
    </div>
  )
}

export default function MyProtocols({
  protocols,
  runtimeReady,
  countryCode,
  submissionKeys,
  trackedMaterials,
}: MyProtocolsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grouped" | "batches">("grouped")

  // Group protocols by compound / protocol handle to eliminate repetitive duplicate cards
  const groupedProtocols = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string
        protocol_title: string
        protocol_handle: string
        product_title: string
        thumbnail: string | null
        current_revision: number
        preserved_revision: number
        has_newer_revision: boolean
        orders: Array<{
          id: string
          display_id: string | number
          created_at: string
          variant_title: string | null
          access_token: string | null
          preserved_revision: number
          profile_access_id: string
          protocol: ResearchProtocolAccess
        }>
        primaryProtocol: ResearchProtocolAccess
      }
    >()

    protocols.forEach((p) => {
      const key = p.protocol_handle || p.protocol_title || p.product.title
      const existing = map.get(key)
      const orderEntry = {
        id: p.order.id,
        display_id: p.order.display_id,
        created_at: p.order.created_at,
        variant_title: p.variant?.title || null,
        access_token: p.access_token,
        preserved_revision: p.preserved_revision,
        profile_access_id: p.profile_access_id,
        protocol: p,
      }

      if (existing) {
        existing.orders.push(orderEntry)
        // Keep the latest revision as primary
        if (p.preserved_revision > existing.preserved_revision) {
          existing.preserved_revision = p.preserved_revision
          existing.primaryProtocol = p
        }
      } else {
        map.set(key, {
          key,
          protocol_title: p.protocol_title,
          protocol_handle: p.protocol_handle,
          product_title: p.product.title,
          thumbnail: p.product.thumbnail,
          current_revision: p.current_revision,
          preserved_revision: p.preserved_revision,
          has_newer_revision: p.has_newer_revision,
          orders: [orderEntry],
          primaryProtocol: p,
        })
      }
    })

    return Array.from(map.values())
  }, [protocols])

  // Filtered lists based on search query
  const filteredGrouped = useMemo(() => {
    if (!searchQuery.trim()) return groupedProtocols
    const q = searchQuery.toLowerCase()
    return groupedProtocols.filter(
      (g) =>
        g.protocol_title.toLowerCase().includes(q) ||
        g.product_title.toLowerCase().includes(q) ||
        g.orders.some((o) => String(o.display_id).includes(q))
    )
  }, [groupedProtocols, searchQuery])

  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return protocols
    const q = searchQuery.toLowerCase()
    return protocols.filter(
      (p) =>
        p.protocol_title.toLowerCase().includes(q) ||
        p.product.title.toLowerCase().includes(q) ||
        String(p.order.display_id).includes(q)
    )
  }, [protocols, searchQuery])

  return (
    <section className="mt-8 space-y-6" data-testid="my-protocols">
      {/* 1. Executive Clinical Research Header & KPI Strip */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-ui-border-base pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700 tracking-wide">
              CLINICAL COMPOUND REVISION ARCHIVE
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-ui-fg-muted font-mono">
              v1.0.4 · ISO-17025 Certified
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ui-fg-base">
            My Protocols
          </h2>
          <p className="mt-1 text-sm text-ui-fg-subtle">
            Preserved laboratory reference monographs, exact dilution ratios, and delivery batch snapshots.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-xl border border-ui-border-base bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("grouped")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "grouped"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-ui-fg-subtle hover:text-ui-fg-base"
            }`}
          >
            <span>⚗️ Group by Compound</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {groupedProtocols.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("batches")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === "batches"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-ui-fg-subtle hover:text-ui-fg-base"
            }`}
          >
            <span>📦 All Order Batches</span>
            <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700">
              {protocols.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="tablist" aria-label="Protocol View Modes">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "grouped"}
          onClick={() => setViewMode("grouped")}
          className={`group rounded-xl p-4 text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
            viewMode === "grouped"
              ? "border-2 border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10"
              : "border border-ui-border-base bg-white hover:border-slate-300 hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ui-fg-muted uppercase tracking-wider">
              Active Compounds
            </span>
            {viewMode === "grouped" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                Active View ✓
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ui-fg-base">
              {groupedProtocols.length}
            </span>
            <span className="text-xs text-emerald-600 font-medium font-mono">
              Verified Formulations
            </span>
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "batches"}
          onClick={() => setViewMode("batches")}
          className={`group rounded-xl p-4 text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            viewMode === "batches"
              ? "border-2 border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/10"
              : "border border-ui-border-base bg-white hover:border-blue-200 hover:shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ui-fg-muted uppercase tracking-wider">
              Preserved Delivery Batches
            </span>
            {viewMode === "batches" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                Active View ✓
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-ui-fg-base">
              {protocols.length}
            </span>
            <span className="text-xs text-blue-600 font-medium font-mono">
              Archived Snapshots
            </span>
          </div>
        </button>

        <div className="rounded-xl border border-ui-border-base bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ui-fg-muted uppercase tracking-wider">
              Reconstitution Standard
            </span>
            <span className="text-[10px] font-medium text-slate-500 font-mono">
              GLP Standard
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-ui-fg-base truncate">
              28-Day Stability
            </span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              2°C–8°C Refrigerated
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Quick Filters Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search compounds, protocols, or order #..."
          className="w-full rounded-xl border border-ui-border-base bg-white pl-10 pr-4 py-2.5 text-sm placeholder:text-ui-fg-muted focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
        />
        <svg
          className="absolute left-3.5 top-3.5 h-4 w-4 text-ui-fg-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {!runtimeReady ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-900">
          Protocol access could not be verified right now. Please try again later.
        </div>
      ) : viewMode === "grouped" ? (
        /* ==========================================================================
           VIEW MODE 1: SMART COMPOUND GROUPING (De-duplicated Clean Cards)
           ========================================================================== */
        <div className="grid gap-5 large:grid-cols-2">
          {filteredGrouped.map((group) => {
            const analyticalProtocol = getCompoundProtocol(
              group.protocol_handle || group.protocol_title || group.product_title
            )
            const recon = analyticalProtocol.reconstitution
            const latestOrder = group.orders[0]

            return (
              <article
                key={group.key}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-300"
              >
                <div>
                  {/* Compound Header */}
                  <div className="flex items-start gap-3.5 p-5">
                    <ProtocolThumbnail
                      thumbnail={group.thumbnail}
                      title={group.protocol_title || group.product_title}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold tracking-tight text-ui-fg-base">
                          {group.protocol_title}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-ui-fg-subtle line-clamp-1">
                        {analyticalProtocol.subtitle || group.product_title}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Current Rev. {group.current_revision}
                        </span>
                        <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 font-mono">
                          {group.orders.length} {group.orders.length === 1 ? "Order Batch" : "Order Batches"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Monospace Analytical Specifications Strip */}
                  <div className="mx-5 mb-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
                        Analytical Reconstitution Specs
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        USP SWFI Preserved
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Solvent</span>
                        <p className="font-medium text-slate-800 truncate" title={recon.solvent}>
                          BAC Water 0.9%
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Ratio</span>
                        <p className="font-bold text-slate-900 font-mono">
                          {recon.defaultDiluentMl} mL / {recon.defaultVialNetMg} mg
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Target Yield</span>
                        <p className="font-bold text-blue-700 font-mono truncate">
                          {recon.resultingConcentrationMgPerMl} mg/mL
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10.5px] text-slate-500">
                      <span className="truncate">{analyticalProtocol.storage?.reconstituted || "Store at 2°C–8°C refrigerated"}</span>
                      <span className="font-mono shrink-0 ml-2 font-medium text-slate-600">28-Day Limit</span>
                    </div>
                  </div>

                  {/* Order Batches Chip Bar */}
                  <div className="px-5 mb-4">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-ui-fg-muted">
                      Preserved Order Batches:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {group.orders.map((o) => (
                        <LocalizedClientLink
                          key={o.profile_access_id}
                          href={o.access_token ? `/research-protocol-access/${o.access_token}` : `/account/orders/details/${o.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-ui-border-base bg-white px-2.5 py-1 text-xs font-medium text-ui-fg-base hover:border-blue-400 hover:text-blue-700 transition-colors shadow-2xs"
                        >
                          <span className="font-bold">Order #{o.display_id}</span>
                          <span className="text-[10.5px] text-ui-fg-muted">
                            {new Date(o.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                          </span>
                        </LocalizedClientLink>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Streamlined Action Bar (Side-by-Side) */}
                <div className="border-t border-ui-border-base bg-slate-50/50 p-4 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <LocalizedClientLink
                      href={`/account/research-hub/my-protocols/${group.protocol_handle}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
                    >
                      <span>View Monograph</span>
                      <span aria-hidden="true">→</span>
                    </LocalizedClientLink>

                    <LocalizedClientLink
                      href={`/account/research-hub?section=calculator&mass=${recon.defaultVialNetMg}&unit=mg&name=${encodeURIComponent(group.protocol_title)}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-ui-border-base bg-white px-3 py-2 text-xs font-semibold text-ui-fg-base shadow-2xs hover:bg-slate-50 transition-colors hover:text-blue-700 hover:border-blue-300"
                    >
                      <span>Launch Calculator ⚗️</span>
                    </LocalizedClientLink>
                  </div>

                  {/* Routine trigger if routine levels exist */}
                  <ProtocolRoutineForm
                    protocol={latestOrder.protocol}
                    countryCode={countryCode}
                    submissionKey={submissionKeys[latestOrder.profile_access_id] ?? ""}
                    trackedMaterials={trackedMaterials}
                  />
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        /* ==========================================================================
           VIEW MODE 2: ALL ORDER BATCHES (Detailed Chronological List)
           ========================================================================== */
        <div className="grid gap-5 large:grid-cols-2">
          {filteredBatches.map((protocol) => {
            const analyticalProtocol = getCompoundProtocol(
              protocol.protocol_handle || protocol.product.title || protocol.protocol_title
            )
            const recon = analyticalProtocol.reconstitution

            return (
              <article
                key={protocol.profile_access_id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-300"
              >
                <div>
                  <div className="flex items-start gap-3.5 p-5">
                    <ProtocolThumbnail
                      thumbnail={protocol.product.thumbnail}
                      title={protocol.protocol_title || protocol.product.title}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold tracking-tight text-ui-fg-base">
                        {protocol.protocol_title}
                      </p>
                      <p className="mt-0.5 text-xs text-ui-fg-subtle line-clamp-1">
                        {protocol.product.title}
                        {protocol.variant?.title ? ` · ${protocol.variant.title}` : ""}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-2 py-0.5 font-medium text-ui-fg-subtle">
                          Preserved rev. {protocol.preserved_revision}
                        </span>
                        <span className="font-bold text-blue-700 font-mono">
                          Order #{protocol.order.display_id} · {new Date(protocol.order.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mx-5 mb-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Solvent</span>
                        <p className="font-medium text-slate-800 truncate">BAC Water 0.9%</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Ratio</span>
                        <p className="font-bold text-slate-900 font-mono">{recon.defaultDiluentMl} mL / {recon.defaultVialNetMg} mg</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Yield</span>
                        <p className="font-bold text-blue-700 font-mono">{recon.resultingConcentrationMgPerMl} mg/mL</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-ui-border-base bg-slate-50/50 p-4 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    {protocol.access_token ? (
                      <LocalizedClientLink
                        href={`/research-protocol-access/${protocol.access_token}`}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
                      >
                        <span>Preserved Snapshot →</span>
                      </LocalizedClientLink>
                    ) : null}
                    <LocalizedClientLink
                      href={`/account/research-hub/my-protocols/${protocol.protocol_handle}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-ui-border-base bg-white px-3 py-2 text-xs font-semibold text-ui-fg-base shadow-2xs hover:bg-slate-50 transition-colors hover:text-blue-700"
                    >
                      <span>Current Monograph</span>
                    </LocalizedClientLink>
                  </div>

                  <ProtocolRoutineForm
                    protocol={protocol}
                    countryCode={countryCode}
                    submissionKey={submissionKeys[protocol.profile_access_id] ?? ""}
                    trackedMaterials={trackedMaterials}
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Empty State when search returns 0 */}
      {(viewMode === "grouped" ? filteredGrouped.length === 0 : filteredBatches.length === 0) && protocols.length > 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">No matching protocols found</p>
          <p className="mt-1 text-xs text-slate-500">Try adjusting your search query &quot;{searchQuery}&quot;.</p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-3 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Empty State when user has 0 protocols */}
      {protocols.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center flex flex-col items-center justify-center gap-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v7.31a2 2 0 0 1-.37 1.17l-5.26 7.89A2 2 0 0 0 6 21.5h12a2 2 0 0 0 1.63-3.13l-5.26-7.89A2 2 0 0 1 14 9.31V2" />
              <path d="M8.5 2h7M7 16h10" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">No protocols linked yet</p>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              Preserved reference monographs and reconstitution dosing protocols will automatically bind here upon verified compound delivery.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>Explore Compound Catalog</span>
              <span aria-hidden="true">&rarr;</span>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/research-library#protocols"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-2xs"
            >
              <span>Browse Public Protocols</span>
            </LocalizedClientLink>
          </div>
        </div>
      )}
    </section>
  )
}
