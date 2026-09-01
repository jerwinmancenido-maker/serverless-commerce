import { randomUUID } from "node:crypto"

import { retrieveReferralSummary, retrieveRewardsSummary } from "@lib/data/rewards"
import RewardsRedemption from "@modules/account/components/rewards-redemption"
import ReferralPanel from "@modules/account/components/referral-panel"

const onboardingEvents = new Set([
  "profile_completed",
  "first_address",
  "first_protocol_review",
  "first_routine",
  "first_measurement",
  "first_journal",
  "first_routine_activity",
  "first_weekly_goal",
])

export default async function RewardsPage() {
  const [summary, referrals] = await Promise.all([
    retrieveRewardsSummary().catch(() => null),
    retrieveReferralSummary().catch(() => null),
  ])
  if (!summary?.program) {
    return (
      <section>
        <h1 className="text-2xl-semi">Rewards</h1>
        <p className="mt-3 text-ui-fg-subtle">The rewards program is being prepared. Your order history is preserved.</p>
      </section>
    )
  }
  const completed = new Set(summary.entries.filter((entry) => entry.points > 0).map((entry) => entry.source_type))
  const onboardingRules = summary.rules.filter((rule) => onboardingEvents.has(rule.event_type))
  const onboardingEarned = onboardingRules.reduce((total, rule) => total + (completed.has(rule.event_type) ? Number(rule.point_value || 0) : 0), 0)
  const onboardingTotal = onboardingRules.reduce((total, rule) => total + Number(rule.point_value || 0), 0)

  return (
    <div className="space-y-8" data-testid="rewards-page">
      <header><p className="text-small-regular uppercase tracking-wide text-ui-fg-subtle">Your account</p><h1 className="mt-2 text-2xl-semi">Rewards</h1></header>
      <section className="grid gap-4 medium:grid-cols-3">
        <div className="rounded-xl border border-ui-border-base p-5"><p className="text-sm text-ui-fg-subtle">Available</p><p className="mt-1 text-3xl-semi">{summary.balance.available} points</p><p className="mt-2 text-sm text-ui-fg-subtle">₱{summary.balance.peso_value.toLocaleString("en-PH")}</p></div>
        <div className="rounded-xl border border-ui-border-base p-5"><p className="text-sm text-ui-fg-subtle">Pending</p><p className="mt-1 text-3xl-semi">{summary.balance.pending}</p><p className="mt-2 text-sm text-ui-fg-subtle">Available after eligible payment confirmation.</p></div>
        <div className="rounded-xl border border-ui-border-base p-5"><p className="text-sm text-ui-fg-subtle">Lifetime earned</p><p className="mt-1 text-3xl-semi">{summary.balance.lifetime_earned}</p></div>
      </section>
      <section className="rounded-xl border border-ui-border-base p-5">
        <div className="flex justify-between gap-4"><h2 className="text-lg font-semibold">Getting started</h2><span className="text-sm font-medium">{onboardingEarned}/{onboardingTotal} points</span></div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ui-bg-subtle"><div className="h-full bg-ui-fg-interactive" style={{ width: `${onboardingTotal ? Math.min(100, onboardingEarned / onboardingTotal * 100) : 0}%` }} /></div>
        <ul className="mt-5 grid gap-3 medium:grid-cols-2">{onboardingRules.map((rule) => <li key={rule.id} className="flex justify-between rounded-lg bg-ui-bg-subtle p-3 text-sm"><span>{rule.name}</span><span>{completed.has(rule.event_type) ? "Completed" : `+${rule.point_value}`}</span></li>)}</ul>
      </section>
      <section><h2 className="text-lg font-semibold">Points history</h2><div className="mt-3 divide-y divide-ui-border-base rounded-xl border border-ui-border-base px-5">{summary.entries.length ? summary.entries.map((entry) => <div key={entry.id} className="flex justify-between py-4 text-sm"><div><p className="font-medium">{entry.source_type.replaceAll("_", " ")}</p><p className="mt-1 text-ui-fg-subtle">{new Date(entry.created_at).toLocaleDateString("en-PH")} · {entry.status}</p></div><span className={entry.points >= 0 ? "text-emerald-700" : "text-ui-fg-error"}>{entry.points >= 0 ? "+" : ""}{entry.points}</span></div>) : <p className="py-5 text-sm text-ui-fg-subtle">Your points activity will appear here.</p>}</div></section>
      <section className="rounded-xl bg-ui-bg-subtle p-5 text-sm">
        <h2 className="font-semibold">Redemption</h2>
        <p className="mt-2 text-ui-fg-subtle">Minimum redemption: {summary.program.minimum_redemption_points} points. One point is worth ₱{summary.program.peso_value_per_point}.</p>
        <RewardsRedemption
          available={summary.balance.available}
          minimum={summary.program.minimum_redemption_points}
          pesoValuePerPoint={summary.program.peso_value_per_point}
          idempotencyKey={randomUUID()}
        />
      </section>
      {referrals && <ReferralPanel summary={referrals} />}
    </div>
  )
}
