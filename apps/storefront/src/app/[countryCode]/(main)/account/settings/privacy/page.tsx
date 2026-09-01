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
    <div className="space-y-8" data-testid="privacy-data-page">
      <header>
        <p className="text-small-regular uppercase tracking-wide text-ui-fg-subtle">
          Profile & Settings
        </p>
        <h1 className="mt-2 text-2xl-semi">Privacy & Data</h1>
        <p className="mt-2 text-sm leading-6 text-ui-fg-subtle">
          View your agreement record and manage private Research Hub data here.
          These controls do not affect rewards.
        </p>
      </header>

      <section className="rounded-xl border border-ui-border-base p-5">
        <h2 className="text-lg font-semibold">Current agreement</h2>
        {agreement.current_acceptance ? (
          <div className="mt-3 space-y-1 text-sm">
            <p>
              Accepted {new Date(agreement.current_acceptance.accepted_at).toLocaleString("en-PH")}
            </p>
            <p className="text-ui-fg-subtle">
              Agreement version {agreement.active_agreement_bundle?.public_version || "archived"}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ui-fg-subtle">
            No consolidated agreement has been recorded yet.
          </p>
        )}
        {agreement.active_agreement_bundle ? (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <a className="underline" href={agreement.active_agreement_bundle.terms_url} target="_blank" rel="noreferrer">Terms</a>
            <a className="underline" href={agreement.active_agreement_bundle.privacy_url} target="_blank" rel="noreferrer">Privacy Policy</a>
            <a className="underline" href={agreement.active_agreement_bundle.research_hub_url} target="_blank" rel="noreferrer">Research Hub agreement</a>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-ui-border-base p-5">
        <h2 className="text-lg font-semibold">Agreement history</h2>
        <div className="mt-3 divide-y divide-ui-border-base">
          {agreement.agreement_history.length ? agreement.agreement_history.map((entry) => (
            <div key={entry.id} className="py-3 text-sm">
              <p className="font-medium">Research Hub {entry.research_hub_version_snapshot}</p>
              <p className="mt-1 text-ui-fg-subtle">
                Terms {entry.terms_version_snapshot} · Privacy {entry.privacy_version_snapshot} · {new Date(entry.accepted_at).toLocaleString("en-PH")}
              </p>
            </div>
          )) : <p className="py-3 text-sm text-ui-fg-subtle">No prior agreement versions.</p>}
        </div>
      </section>

      {profile ? (
        <>
          <section className="rounded-xl border border-ui-border-base p-5">
            <h2 className="font-semibold">Download private records</h2>
            <p className="mt-2 text-sm leading-6 text-ui-fg-subtle">
              Download a JSON copy of your Research Hub protocols, routines,
              progress, Journal and timeline records.
            </p>
            <a
              className="mt-4 inline-flex rounded-md border border-ui-border-base px-4 py-2 text-sm font-medium"
              href={`/${countryCode}/account/settings/privacy/export`}
            >
              Download my records
            </a>
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
        <section className="rounded-xl border border-ui-border-base p-5">
          <h2 className="font-semibold">Research Hub records</h2>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            You do not currently have a Research Hub profile.
          </p>
        </section>
      )}

      <section className="rounded-xl bg-ui-bg-subtle p-5 text-sm leading-6">
        <h2 className="font-semibold">Commerce record retention</h2>
        <p className="mt-2 text-ui-fg-subtle">
          Closing or requesting deletion of Research Hub records does not erase
          orders, payments, fulfillment, tax or fraud-prevention records that
          the store must retain separately.
        </p>
      </section>
    </div>
  )
}
