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
    <div className="space-y-8 w-full" data-testid="rewards-page">
      {/* Top 3 Reward Balances */}
      <section className="grid gap-4 sm:grid-cols-3">
        {/* Available Points */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Available Balance
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Redeemable
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900">
            {summary.balance.available.toLocaleString("en-PH")} <span className="text-base font-semibold text-slate-500 font-sans">pts</span>
          </p>
          <p className="mt-2 text-xs font-semibold text-emerald-800">
            ₱{summary.balance.peso_value.toLocaleString("en-PH")} store credit value
          </p>
        </div>

        {/* Pending Points */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Pending Points
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200/80">
              Awaiting Verification
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900">
            {summary.balance.pending.toLocaleString("en-PH")} <span className="text-base font-semibold text-slate-500 font-sans">pts</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Credited after GCash / Maya payment clearance
          </p>
        </div>

        {/* Lifetime Earned */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Lifetime Earned
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/80">
              Accrual History
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900">
            {summary.balance.lifetime_earned.toLocaleString("en-PH")} <span className="text-base font-semibold text-slate-500 font-sans">pts</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Cumulative points earned across all orders
          </p>
        </div>
      </section>

      {/* Onboarding & Milestone Progress */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Researcher Milestones
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Getting started</h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200 self-start sm:self-auto">
            {onboardingEarned} / {onboardingTotal} points achieved
          </span>
        </div>

        <div className="mt-4">
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${onboardingTotal ? Math.min(100, (onboardingEarned / onboardingTotal) * 100) : 0}%` }}
            />
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {onboardingRules.map((rule) => {
            const isDone = completed.has(rule.event_type)
            return (
              <li
                key={rule.id}
                className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-semibold border transition-all ${
                  isDone
                    ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
                    : "bg-slate-50/70 border-slate-200/70 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDone ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {isDone ? "✓" : "•"}
                  </span>
                  <span>{rule.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isDone ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-700 border border-slate-200 shadow-2xs"
                }`}>
                  {isDone ? "Completed" : `+${rule.point_value} pts`}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Points History */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="pb-3 mb-4 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Verified Transactions
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Points history</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {summary.entries.length ? (
            summary.entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3.5 text-xs">
                <div>
                  <p className="font-bold text-slate-800 capitalize">
                    {entry.source_type.replaceAll("_", " ")}
                  </p>
                  <p className="mt-0.5 text-slate-400">
                    {new Date(entry.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} · <span className="capitalize">{entry.status}</span>
                  </p>
                </div>
                <span className={`font-mono font-extrabold text-sm ${entry.points >= 0 ? "text-emerald-800" : "text-rose-600"}`}>
                  {entry.points >= 0 ? "+" : ""}{entry.points} pts
                </span>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-slate-400">
              No reward point transactions recorded yet.
            </p>
          )}
        </div>
      </section>

      {/* Redemption Section */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="pb-3 mb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Store Credit Conversion
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Redemption</h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
              1 pt = ₱{summary.program.peso_value_per_point.toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Minimum threshold: {summary.program.minimum_redemption_points} points. Redeemed points apply as instant checkout discount codes.
          </p>
        </div>

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
