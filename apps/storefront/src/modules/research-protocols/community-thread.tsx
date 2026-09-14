"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/community-thread.tsx
 * @module  CommunityThread (Research Protocols Storefront)
 * @purpose Renders the thread detail discussion view, replies, and interactive reply/reaction actions.
 * @contracts
 *   Fetches: createResearchCommunityReplyAction() · reactResearchCommunityCommentAction()
 *   API:     POST /store/research-community/:handle/threads/:threadId/comments
 */

import {
  createResearchCommunityReplyAction,
  editResearchCommunityCommentAction,
  followResearchCommunityThreadAction,
  reactResearchCommunityCommentAction,
  removeResearchCommunityCommentAction,
  reportResearchCommunityContentAction,
  type CommunityActionState,
  type ResearchCommunityThreadDetail,
} from "@lib/data/research-protocols"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState, useState } from "react"

const initialState: CommunityActionState = { success: false, error: null }

export default function CommunityThread({ countryCode, handle, protocolTitle, thread }: { countryCode: string; handle: string; protocolTitle: string; thread: ResearchCommunityThreadDetail }) {
  const [replyState, replyAction, replyPending] = useActionState(createResearchCommunityReplyAction, initialState)
  const [replyTo, setReplyTo] = useState<{ id: string; alias: string } | null>(null)
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center justify-between text-xs">
        <LocalizedClientLink
          href={`/research-protocols/${handle}/community`}
          className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <span>← Back to {protocolTitle} Community</span>
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/research-protocols/${handle}`}
          className="text-ui-fg-subtle hover:text-ui-fg-base hover:underline transition-colors"
        >
          View Protocol Specifications →
        </LocalizedClientLink>
      </div>

      <article className="overflow-hidden rounded-xl border border-ui-border-base bg-white shadow-xs">
        <header className="border-b border-ui-border-base p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            {protocolTitle}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ui-fg-base">{thread.title}</h1>
            {thread.is_answered && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                Answered
              </span>
            )}
            {thread.is_locked && (
              <span className="rounded-full border border-ui-border-base bg-ui-bg-subtle px-2.5 py-0.5 text-xs font-medium text-ui-fg-muted">
                Locked
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ui-fg-subtle">
            <span>Started by <span className="font-semibold text-ui-fg-base">{thread.author.alias}</span></span>
            {thread.author.verified_customer && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                Verified Researcher
              </span>
            )}
          </div>
          <form action={followResearchCommunityThreadAction} className="mt-4">
            <input type="hidden" name="country_code" value={countryCode} />
            <input type="hidden" name="protocol_handle" value={handle} />
            <input type="hidden" name="thread_id" value={thread.id} />
            <input type="hidden" name="subscribed" value={String(thread.followed)} />
            <button className="rounded-lg border border-ui-border-base bg-white px-3 py-1.5 text-xs font-semibold text-ui-fg-base hover:bg-ui-bg-subtle transition-colors shadow-2xs">
              {thread.followed ? "Unfollow Discussion" : "Follow Discussion"}
            </button>
          </form>
        </header>

        <div className="divide-y divide-ui-border-base">
          {thread.comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-6 ${
                comment.parent_comment_id ? "ml-6 border-l-2 border-l-emerald-500 bg-ui-bg-subtle/20" : ""
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ui-fg-base">
                    {comment.author.alias}
                  </span>
                  {comment.author.verified_customer && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Verified Researcher
                    </span>
                  )}
                </div>
                <time className="text-xs text-ui-fg-muted">
                  {new Date(comment.submitted_at).toLocaleString("en-PH")}
                  {comment.edited_at ? " · Edited" : ""}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ui-fg-subtle">
                {comment.body}
              </p>
              {!comment.removed && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(["helpful", "like"] as const).map((reaction) => (
                    <form key={reaction} action={reactResearchCommunityCommentAction}>
                      <input type="hidden" name="country_code" value={countryCode} />
                      <input type="hidden" name="protocol_handle" value={handle} />
                      <input type="hidden" name="thread_id" value={thread.id} />
                      <input type="hidden" name="comment_id" value={comment.id} />
                      <input type="hidden" name="reaction" value={reaction} />
                      <input
                        type="hidden"
                        name="active"
                        value={String(comment.customer_reaction === reaction)}
                      />
                      <button
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          comment.customer_reaction === reaction
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold"
                            : "border-ui-border-base bg-white text-ui-fg-subtle hover:text-ui-fg-base hover:bg-ui-bg-subtle"
                        }`}
                      >
                        {reaction === "helpful" ? "Helpful" : "Like"} · {comment.reactions[reaction]}
                      </button>
                    </form>
                  ))}
                  {!comment.parent_comment_id && !thread.is_locked && (
                    <button
                      type="button"
                      onClick={() => setReplyTo({ id: comment.id, alias: comment.author.alias })}
                      className="text-xs font-medium text-emerald-800 hover:text-emerald-950 transition-colors"
                    >
                      Reply
                    </button>
                  )}
                  <details className="relative">
                    <summary className="cursor-pointer text-xs text-ui-fg-muted hover:text-ui-fg-base">
                      Report
                    </summary>
                    <ReportForm
                      countryCode={countryCode}
                      handle={handle}
                      threadId={thread.id}
                      commentId={comment.id}
                    />
                  </details>
                  {comment.owned_by_customer && (
                    <CommentOwnerActions
                      countryCode={countryCode}
                      handle={handle}
                      threadId={thread.id}
                      commentId={comment.id}
                      body={comment.body}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </article>

      {!thread.is_locked && (
        <form action={replyAction} className="space-y-3 rounded-xl border border-ui-border-base bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-ui-fg-base">
              {replyTo ? `Reply to ${replyTo.alias}` : "Contribute to Discussion"}
            </h2>
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-xs text-rose-600 hover:underline"
              >
                Cancel reply target
              </button>
            )}
          </div>
          <input type="hidden" name="country_code" value={countryCode} />
          <input type="hidden" name="protocol_handle" value={handle} />
          <input type="hidden" name="thread_id" value={thread.id} />
          <input type="hidden" name="parent_comment_id" value={replyTo?.id || ""} />
          <textarea
            name="body"
            minLength={3}
            maxLength={5000}
            rows={4}
            required
            className="w-full rounded-lg border border-ui-border-base p-3 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            placeholder="Share your protocol observation, dilution note, or question…"
          />
          <button
            disabled={replyPending}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-2xs disabled:opacity-50"
          >
            {replyPending ? "Submitting…" : "Submit Reply"}
          </button>
          {replyState.error ? (
            <p className="text-xs font-medium text-rose-600">{replyState.error}</p>
          ) : replyState.success ? (
            <p className="text-xs font-medium text-emerald-700">Reply submitted. Admin review may be required.</p>
          ) : null}
        </form>
      )}
      <p className="text-center text-[11px] text-ui-fg-muted">
        Protected peer discussion. Do not share personally identifiable contact or shipping details.
      </p>
    </div>
  )
}

function ReportForm({ countryCode, handle, threadId, commentId }: { countryCode: string; handle: string; threadId: string; commentId: string }) {
  const [state, action, pending] = useActionState(reportResearchCommunityContentAction, initialState)
  return <form action={action} className="absolute right-0 z-10 mt-2 w-72 space-y-2 rounded-lg border border-ui-border-base bg-white p-3 shadow-elevation-flyout">
    <input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="protocol_handle" value={handle} /><input type="hidden" name="thread_id" value={threadId} /><input type="hidden" name="comment_id" value={commentId} />
    <select name="reason" className="w-full rounded border border-ui-border-base px-2 py-1 text-sm"><option value="misleading">Misleading</option><option value="privacy">Privacy</option><option value="spam">Spam</option><option value="harassment">Harassment</option><option value="other">Other</option></select>
    <textarea name="details" maxLength={1000} rows={2} className="w-full rounded border border-ui-border-base p-2 text-sm" placeholder="Optional details" />
    <button disabled={pending} className="rounded bg-ui-fg-base px-3 py-1.5 text-xs font-medium text-white">{pending ? "Sending…" : "Send report"}</button>
    {state.success ? <p className="text-xs text-emerald-700">Report sent.</p> : state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
  </form>
}

function CommentOwnerActions({ countryCode, handle, threadId, commentId, body }: { countryCode: string; handle: string; threadId: string; commentId: string; body: string }) {
  const [state, action, pending] = useActionState(editResearchCommunityCommentAction, initialState)
  return <details><summary className="cursor-pointer text-xs text-ui-fg-subtle">Manage</summary><div className="mt-2 w-72 space-y-2 rounded-lg border border-ui-border-base bg-white p-3 text-ui-fg-base"><form action={action} className="space-y-2"><input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="protocol_handle" value={handle} /><input type="hidden" name="thread_id" value={threadId} /><input type="hidden" name="comment_id" value={commentId} /><textarea name="body" defaultValue={body} minLength={3} maxLength={5000} rows={3} className="w-full rounded border border-ui-border-base p-2 text-sm" /><button disabled={pending} className="rounded bg-ui-fg-base px-3 py-1.5 text-xs font-medium text-white">{pending ? "Saving…" : "Save edit"}</button>{state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}</form><form action={removeResearchCommunityCommentAction}><input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="protocol_handle" value={handle} /><input type="hidden" name="thread_id" value={threadId} /><input type="hidden" name="comment_id" value={commentId} /><button className="text-xs font-medium text-red-600">Remove comment</button></form></div></details>
}
