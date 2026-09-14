"use client"

/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/account/community/account-community-hub.tsx
 * @module  AccountCommunityHub (Research Protocols Storefront)
 * @purpose Renders the customer's unlocked protocol communities nav hub and identity settings.
 * @contracts
 *   Fetches: updateResearchCommunityIdentityAction()
 *   API:     POST /store/customers/me/research-community/identity
 */

import { useActionState, useMemo, useState } from "react"

import {
  type CommunityActionState,
  type ResearchCommunityIdentity,
  updateResearchCommunityIdentityAction,
} from "@lib/data/research-protocols"
import type { ResearchProtocolAccess } from "@lib/data/research-tracking"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const initialState: CommunityActionState = { success: false, error: null }

const Message = ({ state }: { state: CommunityActionState }) =>
  state.error ? (
    <p className="text-sm text-red-600">{state.error}</p>
  ) : state.success ? (
    <p className="text-sm text-emerald-700">Saved. Your alias has been updated.</p>
  ) : null

export default function AccountCommunityHub({
  countryCode,
  accesses,
  identity,
}: {
  countryCode: string
  accesses: ResearchProtocolAccess[]
  identity: ResearchCommunityIdentity | null
}) {
  const [identityState, identityAction, identityPending] = useActionState(
    updateResearchCommunityIdentityAction,
    initialState,
  )
  const [search, setSearch] = useState("")

  const filteredAccesses = useMemo(() => {
    if (!search.trim()) return accesses
    const q = search.toLowerCase().trim()
    return accesses.filter(
      (a) =>
        a.protocol_title.toLowerCase().includes(q) ||
        a.protocol_handle.toLowerCase().includes(q),
    )
  }, [accesses, search])

  return (
    <div className="space-y-6">
      {/* Top breadcrumb navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border-base pb-3 text-xs">
        <div className="flex items-center gap-2 text-ui-fg-muted">
          <LocalizedClientLink
            href="/account"
            className="hover:text-ui-fg-base hover:underline transition-colors"
          >
            Account
          </LocalizedClientLink>
          <span>/</span>
          <LocalizedClientLink
            href="/account/research-hub"
            className="hover:text-ui-fg-base hover:underline transition-colors"
          >
            Research Hub
          </LocalizedClientLink>
          <span>/</span>
          <span className="font-semibold text-ui-fg-base">Your Communities</span>
        </div>
        <LocalizedClientLink
          href="/account/research-hub"
          className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <span>← Back to Research Hub Workspace</span>
        </LocalizedClientLink>
      </div>

      {/* Main Container */}
      <div className="grid gap-8 large:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {/* Header Card */}
          <div className="rounded-xl border border-ui-border-base bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Verified Research Communities
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ui-fg-base">
              Your Protocol Communities
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ui-fg-subtle">
              Direct access to peer research discussions, laboratory reconstitution observations, and verified protocol forums for compounds in your active portfolio.
            </p>
          </div>

          {/* Search bar if multiple protocols exist */}
          {accesses.length > 2 && (
            <div className="mt-5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your unlocked communities…"
                className="w-full rounded-lg border border-ui-border-base bg-white px-3.5 py-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          )}

          {/* Unlocked Communities Grid */}
          <div className="mt-6 space-y-4">
            {filteredAccesses.map((access) => (
              <div
                key={access.protocol_handle}
                className="overflow-hidden rounded-xl border border-ui-border-base bg-white p-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-ui-fg-base">
                        {access.protocol_title}
                      </h2>
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        Verified Access
                      </span>
                    </div>
                    <p className="text-xs text-ui-fg-subtle">
                      Access active since {new Date(access.granted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <LocalizedClientLink
                      href={`/research-protocols/${access.protocol_handle}`}
                      className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-3 py-1.5 text-xs font-semibold text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors"
                    >
                      Specs
                    </LocalizedClientLink>
                    <LocalizedClientLink
                      href={`/research-protocols/${access.protocol_handle}/community`}
                      className="rounded-lg bg-emerald-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900 transition-colors shadow-2xs"
                    >
                      Open Community Board →
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {!accesses.length && (
              <div className="rounded-xl border border-ui-border-base bg-white p-8 text-center shadow-xs">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 text-lg font-bold">
                  🧪
                </div>
                <h3 className="text-sm font-bold text-ui-fg-base">
                  No Protocol Communities Unlocked Yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-ui-fg-subtle">
                  Protocol community boards are automatically unlocked when you purchase an eligible research compound. Once confirmed, you can share and review reconstitution observations, routine notes, and solubility logs with peers.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <LocalizedClientLink
                    href="/research-protocols"
                    className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 transition-colors"
                  >
                    Browse Protocol Specifications
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/store"
                    className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-2 text-xs font-semibold text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors"
                  >
                    Compound Catalog
                  </LocalizedClientLink>
                </div>
              </div>
            )}

            {accesses.length > 0 && !filteredAccesses.length && (
              <div className="rounded-xl border border-ui-border-base bg-white p-6 text-center text-xs text-ui-fg-subtle shadow-xs">
                No communities match your search.
              </div>
            )}
          </div>
        </div>

        {/* Right Rail Sidebar */}
        <aside className="space-y-5 large:sticky large:top-24 large:self-start">
          {/* Identity Card */}
          <form
            action={identityAction}
            className="space-y-3 rounded-xl border border-ui-border-base bg-white p-5 shadow-xs"
          >
            <h2 className="text-sm font-bold text-ui-fg-base">Researcher Alias & Identity</h2>
            <p className="text-xs leading-relaxed text-ui-fg-subtle">
              Privacy Protected. Your real name, order IDs, and shipping addresses are never displayed publicly.
            </p>
            <input type="hidden" name="country_code" value={countryCode} />
            <label className="block text-xs font-semibold text-ui-fg-base">
              Display Alias
              <input
                name="display_name"
                minLength={3}
                maxLength={40}
                required
                defaultValue={identity?.display_name || ""}
                placeholder="e.g. BioResearcher_QC"
                className="mt-1.5 w-full rounded-lg border border-ui-border-base px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-ui-fg-subtle cursor-pointer">
              <input
                type="checkbox"
                name="show_verified_badge"
                defaultChecked={identity?.show_verified_badge || false}
                className="h-3.5 w-3.5 rounded border-ui-border-base text-emerald-700 focus:ring-emerald-700"
              />
              <span>Show Verified Researcher badge</span>
            </label>
            <button
              disabled={identityPending}
              className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-2xs disabled:opacity-50"
            >
              {identityPending ? "Saving…" : "Save Identity"}
            </button>
            <Message state={identityState} />
          </form>

          {/* Quick Links Card */}
          <section className="rounded-xl border border-ui-border-base bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-ui-fg-base">Community Standards</h2>
            <ul className="mt-3 space-y-2 text-xs text-ui-fg-subtle">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>All discussions focus strictly on in-vitro laboratory research and analytical protocols.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>Reconstitution observations should include solvent volumes and ambient temperatures.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span>Encrypted pseudonymity guarantees complete researcher confidentiality and account privacy.</span>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
