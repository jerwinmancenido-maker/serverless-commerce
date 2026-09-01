"use client"

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
  return <div className="mx-auto max-w-4xl">
    <LocalizedClientLink href="/account/community" className="text-sm font-medium text-ui-fg-interactive">← Back to community</LocalizedClientLink>
    <article className="mt-5 overflow-hidden rounded-xl border border-ui-border-base bg-white">
      <header className="border-b border-ui-border-base p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-interactive">{protocolTitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{thread.title}</h1>
          {thread.is_answered ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Answered</span> : null}
          {thread.is_locked ? <span className="rounded-full bg-ui-bg-subtle px-2 py-1 text-xs">Locked</span> : null}
        </div>
        <p className="mt-2 text-sm text-ui-fg-subtle">Started by {thread.author.alias}{thread.author.verified_customer ? " · Purchased" : ""}</p>
        <form action={followResearchCommunityThreadAction} className="mt-4">
          <input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="protocol_handle" value={handle} /><input type="hidden" name="thread_id" value={thread.id} /><input type="hidden" name="subscribed" value={String(thread.followed)} />
          <button className="rounded-lg border border-ui-border-base px-3 py-2 text-sm font-medium">{thread.followed ? "Unfollow" : "Follow discussion"}</button>
        </form>
      </header>
      <div className="divide-y divide-ui-border-base">
        {thread.comments.map((comment) => <div key={comment.id} className={`p-6 ${comment.parent_comment_id ? "ml-8 border-l-2 border-l-ui-border-base" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold">{comment.author.alias}{comment.author.verified_customer ? <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">Purchased</span> : null}</p>
            <time className="text-xs text-ui-fg-muted">{new Date(comment.submitted_at).toLocaleString("en-PH")}{comment.edited_at ? " · Edited" : ""}</time>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ui-fg-subtle">{comment.body}</p>
          {!comment.removed ? <div className="mt-4 flex flex-wrap items-center gap-2">
            {(["helpful", "like"] as const).map((reaction) => <form key={reaction} action={reactResearchCommunityCommentAction}>
              <input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="protocol_handle" value={handle} /><input type="hidden" name="thread_id" value={thread.id} /><input type="hidden" name="comment_id" value={comment.id} /><input type="hidden" name="reaction" value={reaction} /><input type="hidden" name="active" value={String(comment.customer_reaction === reaction)} />
              <button className={`rounded-full border px-3 py-1 text-xs ${comment.customer_reaction === reaction ? "border-ui-fg-interactive bg-blue-50 text-blue-700" : "border-ui-border-base"}`}>{reaction === "helpful" ? "Helpful" : "Like"} · {comment.reactions[reaction]}</button>
            </form>)}
            {!comment.parent_comment_id && !thread.is_locked ? <button type="button" onClick={() => setReplyTo({ id: comment.id, alias: comment.author.alias })} className="text-xs text-ui-fg-subtle">Reply</button> : null}
            <details className="relative"><summary className="cursor-pointer text-xs text-ui-fg-subtle">Report</summary><ReportForm countryCode={countryCode} handle={handle} threadId={thread.id} commentId={comment.id} /></details>
            {comment.owned_by_customer ? <CommentOwnerActions countryCode={countryCode} handle={handle} threadId={thread.id} commentId={comment.id} body={comment.body} /> : null}
          </div> : null}
        </div>)}
      </div>
    </article>
    {!thread.is_locked ? <form action={replyAction} className="mt-6 space-y-3 rounded-xl border border-ui-border-base bg-white p-5">
      <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{replyTo ? `Reply to ${replyTo.alias}` : "Reply"}</h2>{replyTo ? <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-ui-fg-subtle">Cancel reply target</button> : null}</div><input type="hidden" name="country_code" value={countryCode} /><input type="hidden" name="protocol_handle" value={handle} /><input type="hidden" name="thread_id" value={thread.id} /><input type="hidden" name="parent_comment_id" value={replyTo?.id || ""} />
      <textarea name="body" minLength={3} maxLength={5000} rows={5} required className="w-full rounded-lg border border-ui-border-base p-3" placeholder="Add a useful reply" />
      <button disabled={replyPending} className="rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{replyPending ? "Submitting…" : "Submit reply"}</button>
      {replyState.error ? <p className="text-sm text-red-600">{replyState.error}</p> : replyState.success ? <p className="text-sm text-emerald-700">Reply submitted. Admin review may be required.</p> : null}
    </form> : null}
    <p className="mt-5 text-xs text-ui-fg-muted">Community discussion — separate from the official protocol. Do not share personal, order, or contact information.</p>
  </div>
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
