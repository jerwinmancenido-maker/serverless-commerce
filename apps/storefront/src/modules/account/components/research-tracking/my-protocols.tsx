"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { getCompoundProtocol } from "@lib/data/compound-protocols"
import type { ResearchProtocolAccess } from "@lib/data/research-tracking"
import {
  startProtocolRoutineAction,
  type ResearchTrackingActionState,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import { useActionState, useState } from "react"
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
      <p className="text-sm font-medium text-emerald-700">
        Added to Personal Routines
      </p>
    )
  }

  if (!levels.length) {
    return (
      <p className="text-sm text-ui-fg-subtle">
        This revision does not yet have a routine-ready dosage schedule.
      </p>
    )
  }

  if (!trackedMaterials.length) {
    return (
      <p className="text-sm text-amber-700">
        Add this purchased item under Products & Supplies before starting its
        routine.
      </p>
    )
  }

  return (
    <details className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-3">
      <summary className="cursor-pointer text-sm font-medium">
        Start a personal routine
      </summary>
      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="country_code" value={countryCode} />
        <input type="hidden" name="profile_access_id" value={protocol.profile_access_id} />
        <input type="hidden" name="idempotency_key" value={submissionKey} />
        <label className="block text-xs font-medium">
          Purchased item
          <select
            name="tracked_material_id"
            required
            className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
          >
            {trackedMaterials.map((material) => (
              <option key={material.tracked_material_id} value={material.tracked_material_id}>
                {material.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium">
          Schedule
          <select
            name="protocol_level_key"
            required
            value={selectedLevelKey}
            onChange={(event) => setSelectedLevelKey(event.target.value)}
            className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
          >
            {levels.map((level) => (
              <option key={level.key} value={level.key}>
                {level.title}{level.duration ? ` · ${level.duration}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium">
          Start date
          <input
            type="date"
            name="start_date"
            required
            className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
          />
        </label>
        <div className="overflow-hidden rounded-lg border border-ui-border-base bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-ui-bg-subtle text-ui-fg-subtle">
              <tr>
                <th className="px-3 py-2">Phase</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Timing</th>
              </tr>
            </thead>
            <tbody>
              {selectedLevel.rows.map((row) => (
                <tr key={row.row_key} className="border-t border-ui-border-base">
                  <td className="px-3 py-2">{row.period}</td>
                  <td className="px-3 py-2">{row.amount} {row.unit}</td>
                  <td className="px-3 py-2">{row.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">Routine started.</p> : null}
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
        className="flex h-11 w-11 shrink-0 aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-slate-800 text-xs font-bold tracking-tight text-white shadow-xs"
        aria-hidden="true"
      >
        {(title || "").slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <div className="relative flex h-11 w-11 shrink-0 aspect-square items-center justify-center overflow-hidden rounded-lg border border-ui-border-base bg-white p-1 shadow-2xs">
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
  return (
    <section className="mt-8" data-testid="my-protocols">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">
            Protocol Revisions
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-ui-fg-base">
            My Protocols
          </h2>
          <p className="mt-0.5 text-sm text-ui-fg-subtle">
            Exact protocol revisions preserved from your verified orders.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-ui-border-base bg-white px-3 py-1 text-xs font-medium text-ui-fg-subtle shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {protocols.length} {protocols.length === 1 ? "protocol" : "protocols"} available
        </span>
      </div>

      {!runtimeReady ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-900">
          Protocol access could not be verified right now. Please try again later.
        </div>
      ) : protocols.length ? (
        <div className="grid gap-5 large:grid-cols-2">
          {protocols.map((protocol) => {
            const isCurrent = !protocol.has_newer_revision
            const analyticalProtocol = getCompoundProtocol(
              protocol.protocol_handle || protocol.product.title || protocol.protocol_title
            )
            const recon = analyticalProtocol.reconstitution

            return (
              <article
                key={protocol.profile_access_id}
                className={`group overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-emerald-300/80 ${
                  isCurrent ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-amber-500"
                }`}
              >
                <div className="flex gap-4 p-5">
                  <ProtocolThumbnail
                    thumbnail={protocol.product.thumbnail}
                    title={protocol.protocol_title || protocol.product.title}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold tracking-tight text-ui-fg-base">
                      {protocol.protocol_title}
                    </p>
                    <p className="mt-1 text-sm text-ui-fg-subtle line-clamp-1">
                      {protocol.product.title}
                      {protocol.variant?.title ? ` · ${protocol.variant.title}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-md border border-ui-border-base/70 bg-ui-bg-subtle px-2 py-0.5 font-medium text-ui-fg-subtle">
                        Preserved rev. {protocol.preserved_revision}
                      </span>
                      {protocol.has_newer_revision ? (
                        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                          Rev. {protocol.current_revision} available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Analytical Reconstitution & Dilution Specification Bar */}
                <div className="mx-5 mb-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                    <span className="font-semibold text-emerald-950">
                      Reconstitution & Dilution Ratios
                    </span>
                    <span className="rounded-md border border-emerald-300/80 bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-800 shadow-2xs">
                      28-Day Stability Window (2°C – 8°C)
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-ui-fg-muted">Solvent Type</span>
                      <p className="font-medium text-ui-fg-base truncate" title={recon.solvent}>
                        BAC Water 0.9% Preserved
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-ui-fg-muted">Standard Ratio</span>
                      <p className="font-semibold text-emerald-800">
                        {recon.defaultDiluentMl} mL per {recon.defaultVialNetMg} mg vial
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase tracking-wider text-ui-fg-muted">Target Yield</span>
                      <p className="font-semibold text-ui-fg-base">
                        {recon.resultingConcentrationMgPerMl} mg/mL ({recon.resultingConcentrationMgPerMl * 1000} mcg/mL)
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-100/70 pt-2.5">
                    <p className="text-[10px] text-ui-fg-subtle">
                      {analyticalProtocol.storage.reconstituted}
                    </p>
                    <LocalizedClientLink
                      href={`/account/research-hub?section=calculator&mass=${recon.defaultVialNetMg}&unit=mg&name=${encodeURIComponent(protocol.protocol_title)}`}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800 transition-colors"
                    >
                      <span>Calculate Reconstitution →</span>
                    </LocalizedClientLink>
                  </div>
                </div>

                <div className="border-t border-ui-border-base bg-ui-bg-subtle/30 px-5 py-4">
                  <p className="text-xs font-medium text-ui-fg-muted">
                    Order {protocol.order.display_id} · {new Date(protocol.order.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                  {/* Primary action */}
                  {protocol.access_token ? (
                    <LocalizedClientLink
                      href={`/research-protocol-access/${protocol.access_token}`}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-ui-fg-base px-4 py-2.5 text-sm font-semibold text-ui-bg-base shadow-xs transition-colors hover:bg-ui-fg-subtle"
                    >
                      View preserved protocol
                      <span aria-hidden="true">→</span>
                    </LocalizedClientLink>
                  ) : null}

                  {/* Secondary action */}
                  <LocalizedClientLink
                    href={`/account/research-hub/my-protocols/${protocol.protocol_handle}`}
                    className="mt-2 flex w-full items-center justify-center rounded-xl border border-ui-border-base bg-white px-4 py-2 text-sm font-medium text-ui-fg-base shadow-2xs transition-colors hover:bg-ui-bg-subtle"
                  >
                    View current protocol
                  </LocalizedClientLink>

                  {/* Tertiary actions — collapsed by default */}
                  <details className="mt-2.5 group">
                    <summary className="cursor-pointer list-none text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base hover:underline">
                      More options ▾
                    </summary>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <LocalizedClientLink
                        href="/account/community"
                        className="rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium text-ui-fg-base shadow-2xs hover:bg-ui-bg-subtle"
                      >
                        Community
                      </LocalizedClientLink>
                      <LocalizedClientLink
                        href={`/account/support?protocolSeriesId=${encodeURIComponent(protocol.protocol_series_id)}`}
                        className="rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium text-ui-fg-base shadow-2xs hover:bg-ui-bg-subtle"
                      >
                        Protocol support
                      </LocalizedClientLink>
                      <LocalizedClientLink
                        href={`/account/orders/details/${protocol.order.id}`}
                        className="rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs font-medium text-ui-fg-base shadow-2xs hover:bg-ui-bg-subtle"
                      >
                        View order
                      </LocalizedClientLink>
                    </div>
                  </details>
                  <div className="mt-4">
                    <ProtocolRoutineForm
                      protocol={protocol}
                      countryCode={countryCode}
                      submissionKey={submissionKeys[protocol.profile_access_id] ?? ""}
                      trackedMaterials={trackedMaterials}
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center flex flex-col items-center justify-center gap-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-800 transition-colors shadow-2xs"
            >
              <span>Browse Public Protocols</span>
            </LocalizedClientLink>
          </div>
        </div>
      )}
    </section>
  )
}
