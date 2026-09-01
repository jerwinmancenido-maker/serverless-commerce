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
    <div className="grid gap-8 large:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <div className="rounded-xl border border-ui-border-base bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-interactive">Protected customer community</p>
          <h1 className="mt-2 text-2xl font-semibold">Protocol discussions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ui-fg-subtle">
            Read and discuss protocols connected to your eligible purchases. Community posts are separate from the official Admin-published protocol.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Community views">
          {viewLabels.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setView(item.value)}
              aria-pressed={view === item.value}
              className={`rounded-full border px-3 py-2 text-sm font-medium ${
                view === item.value
                  ? "border-ui-fg-base bg-ui-fg-base text-white"
                  : "border-ui-border-base bg-white text-ui-fg-subtle"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-6">
          {visibleProtocols.map((protocol) => (
            <section key={protocol.handle} className="overflow-hidden rounded-xl border border-ui-border-base bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-ui-border-base px-5 py-4">
                <div>
                  <h2 className="font-semibold">{protocol.title}</h2>
                  <p className="text-xs text-ui-fg-subtle">{protocol.threads.length} discussion{protocol.threads.length === 1 ? "" : "s"}</p>
                </div>
                <LocalizedClientLink href={`/account/research-hub/my-protocols/${protocol.handle}`} className="text-sm font-medium text-ui-fg-interactive">
                  View protocol
                </LocalizedClientLink>
              </div>
              {protocol.threads.length ? (
                <div className="divide-y divide-ui-border-base">
                  {protocol.threads.map((thread) => (
                    <LocalizedClientLink key={thread.id} href={`/account/community/${protocol.handle}/${thread.id}`} className="block p-5 hover:bg-ui-bg-subtle">
                      <div className="flex flex-wrap items-center gap-2">
                        {thread.is_pinned ? <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">Pinned</span> : null}
                        {thread.is_answered ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Answered</span> : null}
                        {thread.status !== "approved" ? <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">{thread.status}</span> : null}
                      </div>
                      <h3 className="mt-2 font-semibold">{thread.title}</h3>
                      {thread.preview ? <p className="mt-1 line-clamp-2 text-sm text-ui-fg-subtle">{thread.preview.body}</p> : null}
                      <p className="mt-3 text-xs text-ui-fg-muted">
                        {thread.author.alias}{thread.author.verified_customer ? " · Purchased" : ""} · {thread.reply_count} replies
                      </p>
                    </LocalizedClientLink>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-sm text-ui-fg-subtle">No approved discussions yet.</p>
              )}
            </section>
          ))}
          {!protocols.length ? (
            <div className="rounded-xl border border-ui-border-base bg-white p-5 text-sm text-ui-fg-subtle">
              No eligible protocol discussions are available yet. Protocol access appears here after an eligible purchase.
            </div>
          ) : !visibleProtocols.length ? (
            <div className="rounded-xl border border-ui-border-base bg-white p-5 text-sm text-ui-fg-subtle">
              No discussions match this view.
            </div>
          ) : null}
        </div>
      </div>

      <aside className="space-y-5 large:sticky large:top-24 large:self-start">
        {protocols.some((protocol) => protocol.reports.length > 0) ? (
          <section className="rounded-xl border border-ui-border-base bg-white p-5">
            <h2 className="font-semibold">My reports</h2>
            <p className="mt-1 text-sm text-ui-fg-subtle">
              Only you and authorized moderators can see these statuses.
            </p>
            <div className="mt-3 space-y-3">
              {protocols.flatMap((protocol) =>
                protocol.reports.map((report) => (
                  <div key={report.id} className="rounded-lg bg-ui-bg-subtle p-3">
                    <p className="text-sm font-medium">{protocol.title}</p>
                    <p className="mt-1 text-xs text-ui-fg-subtle">
                      {report.reason} · {report.status}
                    </p>
                  </div>
                )),
              )}
            </div>
          </section>
        ) : null}
        <form action={identityAction} className="space-y-3 rounded-xl border border-ui-border-base bg-white p-5">
          <h2 className="font-semibold">Community identity</h2>
          <p className="text-sm text-ui-fg-subtle">Your real name and order details are never displayed. Choose a private alias or keep the generated one.</p>
          <input type="hidden" name="country_code" value={countryCode} />
          <label className="block text-sm font-medium">Display alias
            <input name="display_name" minLength={3} maxLength={40} required defaultValue={identity?.display_name || ""} placeholder="Choose an alias after your first post" className="mt-1 w-full rounded-lg border border-ui-border-base px-3 py-2" />
          </label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="show_verified_badge" defaultChecked={identity?.show_verified_badge || false} /> Show a Purchased badge</label>
          <button disabled={identityPending} className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium disabled:opacity-50">{identityPending ? "Saving…" : "Save identity"}</button>
          <Message state={identityState} />
        </form>

        {protocols.length ? (
          <form action={threadAction} className="space-y-3 rounded-xl border border-ui-border-base bg-white p-5">
            <h2 className="font-semibold">Start a discussion</h2>
            <input type="hidden" name="country_code" value={countryCode} />
            <label className="block text-sm font-medium">Protocol
              <select name="protocol_handle" className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2">
                {protocols.map((protocol) => <option key={protocol.handle} value={protocol.handle}>{protocol.title}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Type
              <select name="kind" defaultValue="question" className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2">
                <option value="question">Question</option><option value="idea">Idea</option><option value="recommendation">Recommendation</option><option value="general">Discussion</option>
              </select>
            </label>
            <label className="block text-sm font-medium">Title<input name="title" minLength={5} maxLength={180} required className="mt-1 w-full rounded-lg border border-ui-border-base px-3 py-2" /></label>
            <label className="block text-sm font-medium">Message<textarea name="body" minLength={3} maxLength={5000} required rows={5} className="mt-1 w-full rounded-lg border border-ui-border-base p-3" /></label>
            <button disabled={threadPending} className="rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{threadPending ? "Submitting…" : "Submit discussion"}</button>
            <Message state={threadState} />
          </form>
        ) : null}
      </aside>
    </div>
  )
}
