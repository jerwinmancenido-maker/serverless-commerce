"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

export default function MyProtocols({
  protocols,
  runtimeReady,
  countryCode,
  submissionKeys,
  trackedMaterials,
}: MyProtocolsProps) {
  return (
    <section className="mt-10" data-testid="my-protocols">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">My Protocols</h2>
          <p className="mt-1 text-sm text-ui-fg-subtle">
            Exact protocol revisions preserved from your eligible orders.
          </p>
        </div>
        <span className="rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium">
          {protocols.length} available
        </span>
      </div>

      {!runtimeReady ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Protocol access could not be verified right now. Please try again later.
        </div>
      ) : protocols.length ? (
        <div className="grid gap-4 large:grid-cols-2">
          {protocols.map((protocol) => (
            <article
              key={protocol.profile_access_id}
              className="overflow-hidden rounded-xl border border-ui-border-base bg-white"
            >
              <div className="flex gap-4 p-5">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ui-bg-subtle">
                  {protocol.product.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={protocol.product.thumbnail}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-ui-fg-muted">No image</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold">
                    {protocol.protocol_title}
                  </p>
                  <p className="mt-1 text-sm text-ui-fg-subtle">
                    {protocol.product.title}
                    {protocol.variant?.title ? ` · ${protocol.variant.title}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-ui-bg-subtle px-2.5 py-1">
                      Preserved revision {protocol.preserved_revision}
                    </span>
                    {protocol.has_newer_revision ? (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                        Revision {protocol.current_revision} available
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-ui-border-base px-5 py-4">
                <p className="text-xs text-ui-fg-muted">
                  Order {protocol.order.display_id} · {new Date(protocol.order.created_at).toLocaleDateString("en-PH")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {protocol.access_token ? (
                    <LocalizedClientLink
                      href={`/research-protocol-access/${protocol.access_token}`}
                      className="rounded-lg bg-ui-fg-base px-3 py-2 text-sm font-medium text-ui-bg-base"
                    >
                      View preserved protocol
                    </LocalizedClientLink>
                  ) : null}
                  <LocalizedClientLink
                    href={`/research-protocols/${protocol.protocol_handle}`}
                    className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium"
                  >
                    View current protocol
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href={`/account/orders/details/${protocol.order.id}`}
                    className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium"
                  >
                    View order
                  </LocalizedClientLink>
                </div>
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
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-ui-border-base bg-white p-5">
          <p className="text-sm font-medium">No protocols linked yet</p>
          <p className="mt-1 text-sm text-ui-fg-subtle">
            Eligible purchases will appear here with their preserved revision.
          </p>
        </div>
      )}
    </section>
  )
}
