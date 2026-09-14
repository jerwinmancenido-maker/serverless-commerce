import { randomUUID } from "node:crypto"

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveResearchAgreementStatus } from "@lib/data/research-agreement"
import {
  retrieveCurrentResearchDeletionRequest,
  retrieveResearchProfile,
} from "@lib/data/research-tracking"
import { createResearchSubmissionKeys } from "@lib/research-tracking-idempotency"
import { PrivacyCard } from "@modules/account/components/research-tracking"

export const metadata: Metadata = {
  title: "Privacy & Data",
  description: "Manage agreements and private Research Hub records.",
}

export default async function PrivacyDataPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const [agreement, profile] = await Promise.all([
    retrieveResearchAgreementStatus().catch(() => null),
    retrieveResearchProfile().catch(() => null),
  ])
  if (!agreement) notFound()
  const privacyRequest = profile
    ? await retrieveCurrentResearchDeletionRequest().catch(() => null)
    : null
  const keys = createResearchSubmissionKeys(randomUUID)

  return (
    <div className="space-y-8 w-full" data-testid="privacy-data-page">
      <div>
        <a
          href={`/${countryCode}/account/settings`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <span>&larr; Back to Profile &amp; Settings</span>
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Data Sovereignty &amp; Governance
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Privacy &amp; Data Controls
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-xl leading-relaxed">
              View your active legal agreements, export private research telemetry, or execute data sovereignty controls. These controls do not affect rewards.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 self-start sm:self-auto">
            Privacy Protected
          </span>
        </div>
      </div>

      {/* Current Agreement */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Active Legal Record
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Current Agreement</h2>
          </div>
          {agreement.current_acceptance && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active Acceptance
            </span>
          )}
        </div>

        {agreement.current_acceptance ? (
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-slate-800">
              Accepted on {new Date(agreement.current_acceptance.accepted_at).toLocaleString("en-PH")}
            </p>
            <p className="text-slate-500 font-mono">
              Consolidated bundle version: {agreement.active_agreement_bundle?.public_version || "archived"}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No consolidated agreement has been recorded yet.
          </p>
        )}
        {agreement.active_agreement_bundle ? (
          <div className="mt-4 flex flex-wrap gap-2.5 text-xs font-semibold">
            <a
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs"
              href={agreement.active_agreement_bundle.terms_url}
              target="_blank"
              rel="noreferrer"
            >
              <span>Terms of Service</span>
              <span className="text-slate-400">&rarr;</span>
            </a>
            <a
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs"
              href={agreement.active_agreement_bundle.privacy_url}
              target="_blank"
              rel="noreferrer"
            >
              <span>Privacy Policy</span>
              <span className="text-slate-400">&rarr;</span>
            </a>
            <a
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs"
              href={agreement.active_agreement_bundle.research_hub_url}
              target="_blank"
              rel="noreferrer"
            >
              <span>Research Hub Agreement</span>
              <span className="text-slate-400">&rarr;</span>
            </a>
          </div>
        ) : null}
      </section>

      {/* Agreement History */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="pb-3 mb-4 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Compliance Audit Trail
          </span>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Agreement Version History</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {agreement.agreement_history.length ? (
            agreement.agreement_history.map((entry) => (
              <div key={entry.id} className="py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <p className="font-bold text-slate-800">Research Hub v{entry.research_hub_version_snapshot}</p>
                  <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                    Terms {entry.terms_version_snapshot} · Privacy {entry.privacy_version_snapshot}
                  </p>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(entry.accepted_at).toLocaleString("en-PH")}
                </span>
              </div>
            ))
          ) : (
            <p className="py-3 text-xs text-slate-400">No prior agreement versions recorded.</p>
          )}
        </div>
      </section>

      {/* Export & Data Controls */}
      {profile ? (
        <>
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="pb-3 mb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Data Portability
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Download Private Records</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Download a machine-readable JSON copy of your Research Hub protocols, routine adherence logs, biometric telemetry, Lab Journal entries, and private support threads.
            </p>
            <div className="mt-4">
              <a
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
                href={`/${countryCode}/account/settings/privacy/export`}
              >
                <span>Download my records</span>
                <span aria-hidden="true">&darr;</span>
              </a>
            </div>
          </section>

          <PrivacyCard
            countryCode={countryCode}
            profile={profile}
            privacyRequest={privacyRequest}
            idempotencyKeys={{
              profileClosure: keys.profileClosure,
              deletionRequest: keys.deletionRequest,
              deletionCancellation: keys.deletionCancellation,
            }}
          />
        </>
      ) : (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <h2 className="font-bold text-slate-900 text-base">Research Hub Records</h2>
          <p className="mt-1 text-xs text-slate-500">
            You do not currently have an active Research Hub profile.
          </p>
        </section>
      )}

      {/* Commerce Record Retention Disclaimer */}
      <section className="rounded-2xl bg-slate-100/70 border border-slate-200/80 p-5 text-xs leading-relaxed text-slate-600">
        <h3 className="font-bold text-slate-900 mb-1">Commerce Record Retention Notice</h3>
        <p className="text-slate-500">
          Closing or requesting deletion of private Research Hub records does not erase historical orders, invoices, payments, fulfillment logs, or fraud-prevention records that the store is legally mandated to retain under Philippine tax and accounting law.
        </p>
      </section>
    </div>
  )
}
