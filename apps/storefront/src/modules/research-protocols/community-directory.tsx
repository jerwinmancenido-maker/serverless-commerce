"use client"

import {
  createResearchCommunityThreadAction,
  updateResearchCommunityIdentityAction,
  type CommunityActionState,
  type ResearchCommunityIdentity,
  type ResearchCommunityReport,
  type ResearchCommunityThread,
} from "@lib/data/research-protocols"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState, useState } from "react"

const initialState: CommunityActionState = { success: false, error: null }

type ProtocolDiscussions = {
  handle: string
  title: string
  threads: ResearchCommunityThread[]
  reports: ResearchCommunityReport[]
}

type DirectoryView = "recent" | "followed" | "unanswered" | "pinned" | "mine"

const viewLabels: Array<{ value: DirectoryView; label: string }> = [
  { value: "recent", label: "Recent" },
  { value: "followed", label: "Followed" },
  { value: "unanswered", label: "Unanswered" },
  { value: "pinned", label: "Pinned" },
  { value: "mine", label: "My posts" },
]

const Message = ({ state }: { state: CommunityActionState }) =>
  state.error ? <p className="text-sm text-red-600">{state.error}</p> : state.success ? <p className="text-sm text-emerald-700">Saved. Admin review may be required before others can see it.</p> : null

export default function CommunityDirectory({
  countryCode,
  identity,
  protocols,
}: {
  countryCode: string
  identity: ResearchCommunityIdentity | null
  protocols: ProtocolDiscussions[]
}) {
  const [identityState, identityAction, identityPending] = useActionState(updateResearchCommunityIdentityAction, initialState)
  const [threadState, threadAction, threadPending] = useActionState(createResearchCommunityThreadAction, initialState)
  const [view, setView] = useState<DirectoryView>("recent")
  const visibleProtocols = protocols
    .map((protocol) => ({
      ...protocol,
      threads: protocol.threads.filter((thread) => {
        if (view === "followed") return thread.followed
        if (view === "unanswered") return thread.kind === "question" && !thread.is_answered
        if (view === "pinned") return thread.is_pinned
        if (view === "mine") return thread.owned_by_customer
        return true
      }),
    }))
    .filter((protocol) => protocol.threads.length > 0 || view === "recent")

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
          <span className="font-semibold text-ui-fg-base">Community</span>
        </div>
        <LocalizedClientLink
          href="/account/research-hub"
          className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <span>← Back to Research Hub Workspace</span>
        </LocalizedClientLink>
      </div>

      <div className="grid gap-8 large:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {/* Header Card */}
          <div className="rounded-xl border border-ui-border-base bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Verified Research Community
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ui-fg-base">
              Protocol Discussions & Peer Research
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ui-fg-subtle">
              Protected peer forum for verified researchers and clients. Share reconstitution observations, solubility notes, and routine schedules with encrypted pseudonymity under Philippine DPA 2012 compliance.
            </p>
          </div>

          {/* View Filters */}
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Community views">
            {viewLabels.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setView(item.value)}
                aria-pressed={view === item.value}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all touch-manipulation shadow-2xs ${
                  view === item.value
                    ? "border border-emerald-700 bg-emerald-700 text-white"
                    : "border border-ui-border-base bg-white text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Discussions List */}
          <div className="mt-6 space-y-6">
            {visibleProtocols.map((protocol) => (
              <section
                key={protocol.handle}
                className="overflow-hidden rounded-xl border border-ui-border-base bg-white shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border-base bg-ui-bg-subtle/30 px-5 py-3.5">
                  <div>
                    <h2 className="text-sm font-bold text-ui-fg-base">{protocol.title}</h2>
                    <p className="text-[11px] text-ui-fg-muted">
                      {protocol.threads.length} discussion{protocol.threads.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <LocalizedClientLink
                    href={`/account/research-hub/my-protocols/${protocol.handle}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                  >
                    <span>View Protocol Specs →</span>
                  </LocalizedClientLink>
                </div>
                {protocol.threads.length ? (
                  <div className="divide-y divide-ui-border-base">
                    {protocol.threads.map((thread) => (
                      <LocalizedClientLink
                        key={thread.id}
                        href={`/account/community/${protocol.handle}/${thread.id}`}
                        className="block p-5 transition-colors hover:bg-emerald-50/20"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {thread.is_pinned && (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
                              Pinned
                            </span>
                          )}
                          {thread.is_answered && (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                              Answered
                            </span>
                          )}
                          {thread.status !== "approved" && (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              {thread.status}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-ui-fg-base">
                          {thread.title}
                        </h3>
                        {thread.preview && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ui-fg-subtle">
                            {thread.preview.body}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ui-fg-muted">
                          <span className="font-medium text-ui-fg-subtle">{thread.author.alias}</span>
                          {thread.author.verified_customer && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.2 text-[10px] font-semibold text-emerald-800">
                              Verified Researcher
                            </span>
                          )}
                          <span>·</span>
                          <span>{thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}</span>
                        </div>
                      </LocalizedClientLink>
                    ))}
                  </div>
                ) : (
                  <p className="p-5 text-xs text-ui-fg-subtle">No approved discussions yet for this protocol.</p>
                )}
              </section>
            ))}
            {!protocols.length ? (
              <div className="rounded-xl border border-ui-border-base bg-white p-6 text-center text-xs text-ui-fg-subtle shadow-xs">
                No eligible protocol discussions are available yet. Protocol access appears automatically after an eligible compound purchase.
              </div>
            ) : !visibleProtocols.length ? (
              <div className="rounded-xl border border-ui-border-base bg-white p-6 text-center text-xs text-ui-fg-subtle shadow-xs">
                No discussions match this view filter.
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Rail Sidebar */}
        <aside className="space-y-5 large:sticky large:top-24 large:self-start">
          {protocols.some((protocol) => protocol.reports.length > 0) ? (
            <section className="rounded-xl border border-ui-border-base bg-white p-5 shadow-xs">
              <h2 className="text-sm font-bold text-ui-fg-base">My Reports</h2>
              <p className="mt-1 text-xs text-ui-fg-subtle">
                Only you and authorized moderators can see these statuses.
              </p>
              <div className="mt-3 space-y-2">
                {protocols.flatMap((protocol) =>
                  protocol.reports.map((report) => (
                    <div key={report.id} className="rounded-lg bg-ui-bg-subtle p-3 text-xs">
                      <p className="font-semibold text-ui-fg-base">{protocol.title}</p>
                      <p className="mt-1 text-[11px] text-ui-fg-subtle">
                        {report.reason} · {report.status}
                      </p>
                    </div>
                  )),
                )}
              </div>
            </section>
          ) : null}

          {/* Identity Card */}
          <form action={identityAction} className="space-y-3 rounded-xl border border-ui-border-base bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-ui-fg-base">Researcher Alias & Identity</h2>
            <p className="text-xs leading-relaxed text-ui-fg-subtle">
              Philippine DPA 2012 Protected. Your real name, order IDs, and shipping addresses are never displayed publicly.
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

          {/* Start Discussion Card */}
          {protocols.length ? (
            <form action={threadAction} className="space-y-3 rounded-xl border border-ui-border-base bg-white p-5 shadow-xs">
              <h2 className="text-sm font-bold text-ui-fg-base">Start a Discussion</h2>
              <input type="hidden" name="country_code" value={countryCode} />
              <label className="block text-xs font-semibold text-ui-fg-base">
                Protocol Target
                <select
                  name="protocol_handle"
                  className="mt-1.5 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {protocols.map((protocol) => (
                    <option key={protocol.handle} value={protocol.handle}>
                      {protocol.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-ui-fg-base">
                Category
                <select
                  name="kind"
                  defaultValue="question"
                  className="mt-1.5 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="question">Question & Inquiry</option>
                  <option value="idea">Protocol Observation</option>
                  <option value="recommendation">Reconstitution Tip</option>
                  <option value="general">General Research</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-ui-fg-base">
                Topic Title
                <input
                  name="title"
                  minLength={5}
                  maxLength={180}
                  required
                  placeholder="e.g. Dilution clarity with 2.0 mL BAC water"
                  className="mt-1.5 w-full rounded-lg border border-ui-border-base px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </label>
              <label className="block text-xs font-semibold text-ui-fg-base">
                Message Body
                <textarea
                  name="body"
                  minLength={3}
                  maxLength={5000}
                  required
                  rows={4}
                  placeholder="Describe your laboratory observation or question in detail…"
                  className="mt-1.5 w-full rounded-lg border border-ui-border-base p-3 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </label>
              <button
                disabled={threadPending}
                className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-2xs disabled:opacity-50"
              >
                {threadPending ? "Submitting…" : "Submit Discussion"}
              </button>
              <Message state={threadState} />
            </form>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
