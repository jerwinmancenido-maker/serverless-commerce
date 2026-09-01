"use client"

import {
  activateReferralAccountAction,
  claimReferralCodeAction,
  type ReferralSummary,
} from "@lib/data/rewards"
import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"

const initial = { success: false, error: null as string | null }

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return <button disabled={pending} className="rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-ui-bg-base disabled:opacity-50">{pending ? "Saving…" : children}</button>
}

export default function ReferralPanel({ summary }: { summary: ReferralSummary }) {
  const [activateState, activate] = useActionState(activateReferralAccountAction, initial)
  const [claimState, claim] = useActionState(claimReferralCodeAction, initial)
  const [copied, setCopied] = useState(false)
  if (!summary.enabled) {
    return <section className="rounded-xl border border-ui-border-base p-5"><h2 className="text-lg font-semibold">Referrals</h2><p className="mt-2 text-sm text-ui-fg-subtle">The referral program is currently disabled. Existing history remains preserved.</p></section>
  }
  const shareUrl = summary.account && typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname.replace(/\/account\/rewards.*$/, "/account")}?ref=${summary.account.code}`
    : ""
  return (
    <section className="rounded-xl border border-ui-border-base p-5" data-testid="referral-panel">
      <h2 className="text-lg font-semibold">Referrals</h2>
      <p className="mt-2 text-sm text-ui-fg-subtle">Share your code. Rewards are added only after an eligible order qualifies under the current Admin settings.</p>
      {summary.account ? (
        <div className="mt-4 rounded-lg bg-ui-bg-subtle p-4">
          <p className="text-xs uppercase tracking-wide text-ui-fg-muted">Your referral code</p>
          <div className="mt-2 flex flex-wrap items-center gap-3"><strong className="text-xl tracking-wider">{summary.account.code}</strong><button type="button" className="text-sm underline" onClick={async () => { await navigator.clipboard.writeText(shareUrl); setCopied(true) }}>{copied ? "Copied" : "Copy share link"}</button></div>
          <p className="mt-2 text-xs text-ui-fg-muted">{summary.account.qualified_referrals} qualified referrals</p>
        </div>
      ) : (
        <form action={activate} className="mt-4"><Submit>Create my referral code</Submit>{activateState.error && <p className="mt-2 text-sm text-ui-fg-error">{activateState.error}</p>}</form>
      )}
      {!summary.events.some((event) => event.role === "referred_customer") && (
        <form action={claim} className="mt-5 flex flex-wrap items-end gap-3">
          <label className="flex-1 text-sm font-medium">Have a referral code?<input name="code" required className="mt-1 w-full rounded-lg border border-ui-border-base px-3 py-2" /></label><Submit>Apply code</Submit>
          {claimState.error && <p className="w-full text-sm text-ui-fg-error">{claimState.error}</p>}
        </form>
      )}
      <div className="mt-5 border-t border-ui-border-base pt-4">
        <h3 className="text-sm font-semibold">Referral history</h3>
        {summary.events.length ? <ul className="mt-3 space-y-2">{summary.events.map((event) => <li key={event.id} className="flex justify-between rounded-lg bg-ui-bg-subtle px-3 py-2 text-sm"><span>{event.role === "referrer" ? "Shared referral" : "Code applied"} · {new Date(event.claimed_at).toLocaleDateString("en-PH")}</span><span className="capitalize">{event.status}</span></li>)}</ul> : <p className="mt-2 text-sm text-ui-fg-subtle">No referral activity yet.</p>}
      </div>
    </section>
  )
}
