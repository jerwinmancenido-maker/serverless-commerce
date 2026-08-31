"use client"

import {
  submitResearchProtocolComment,
  type ResearchProtocolCommunityComment,
  type SubmitProtocolCommentState,
} from "@lib/data/research-protocols"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState, useEffect, useRef } from "react"

type Props = {
  handle: string
  comments: ResearchProtocolCommunityComment[]
  signedIn: boolean
}

const kindLabels = {
  idea: "Idea",
  recommendation: "Recommendation",
  question: "Question",
  general: "Comment",
} as const

export default function CommunityBoard({ handle, comments, signedIn }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const action = submitResearchProtocolComment.bind(null, handle)
  const [state, formAction, pending] = useActionState<
    SubmitProtocolCommentState,
    FormData
  >(action, null)

  useEffect(() => {
    if (state?.state === "success") formRef.current?.reset()
  }, [state])

  return (
    <aside className="large:sticky large:top-24 large:self-start">
      <div className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-5">
        <h2 className="text-xl-semi text-ui-fg-base">Community board</h2>
        <p className="mt-2 text-small-regular text-ui-fg-subtle">
          Share an idea, recommendation, or question about this protocol.
          Customer comments are separate from the Admin-published protocol.
        </p>

        {signedIn ? (
          <form ref={formRef} action={formAction} className="mt-5 grid gap-3">
            <label className="grid gap-2 text-small-semi text-ui-fg-base">
              Type
              <select
                name="kind"
                defaultValue="idea"
                className="h-10 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-small-regular"
              >
                <option value="idea">Idea</option>
                <option value="recommendation">Recommendation</option>
                <option value="question">Question</option>
                <option value="general">General comment</option>
              </select>
            </label>
            <label className="grid gap-2 text-small-semi text-ui-fg-base">
              Your comment
              <textarea
                name="body"
                required
                minLength={3}
                maxLength={2000}
                rows={5}
                placeholder="Share something useful with the community"
                className="resize-y rounded-md border border-ui-border-base bg-ui-bg-field p-3 text-small-regular"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-ui-button-inverted px-4 py-2 text-small-semi text-ui-fg-on-inverted disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit for review"}
            </button>
            {state ? (
              <p
                className={`text-small-regular ${
                  state.state === "success"
                    ? "text-ui-fg-interactive"
                    : "text-ui-fg-error"
                }`}
                role="status"
              >
                {state.message}
              </p>
            ) : null}
          </form>
        ) : (
          <div className="mt-5 rounded-rounded bg-ui-bg-subtle p-4">
            <p className="text-small-regular text-ui-fg-subtle">
              Sign in to join the discussion.
            </p>
            <LocalizedClientLink
              href="/account"
              className="mt-2 inline-block text-small-semi text-ui-fg-interactive"
            >
              Sign in
            </LocalizedClientLink>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        {comments.length ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-small-semi text-ui-fg-base">
                  {comment.author_name}
                </p>
                <span className="rounded-full bg-ui-bg-subtle px-2 py-1 text-xsmall-regular text-ui-fg-subtle">
                  {kindLabels[comment.kind]}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-small-regular text-ui-fg-subtle">
                {comment.body}
              </p>
              <time className="mt-3 block text-xsmall-regular text-ui-fg-muted">
                {new Date(comment.submitted_at).toLocaleDateString()}
              </time>
            </article>
          ))
        ) : (
          <div className="rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-4">
            <p className="text-small-regular text-ui-fg-subtle">
              No approved community comments yet. Be the first to share an idea.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
