"use client"

import {
  cancelResearchDeletionAction,
  closeResearchProfileAction,
  createResearchProfileAction,
  renewResearchConsentAction,
  requestResearchDeletionAction,
  type ResearchPrivacyRequest,
  type ResearchProfile,
  type PurchasedItemCandidate,
  type ResearchTrackingActionState,
  type ResearchTrackingConfiguration,
  type TrackedResearchMaterial,
  updateResearchPreferencesAction,
} from "@lib/data/research-tracking"
import type {
  PurchasedActivationSubmissionKeys,
  ResearchSubmissionKeys,
} from "@lib/research-tracking-idempotency"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import ProductsAndSupplies from "./products-and-supplies"

type ResearchTrackingProps = {
  configuration: ResearchTrackingConfiguration
  countryCode: string
  profile: ResearchProfile | null
  privacyRequest: ResearchPrivacyRequest | null
  purchasedActivationKeys: PurchasedActivationSubmissionKeys
  purchasedItems: PurchasedItemCandidate[]
  purchasedRuntimeReady: boolean
  runtimeReady: boolean
  submissionKeys: ResearchSubmissionKeys
  trackedMaterials: TrackedResearchMaterial[]
}

const initialState: ResearchTrackingActionState = {
  success: false,
  error: null,
}

const futureAreas = [
  ["Today", "A future review-first view of customer-created research routines."],
  ["Measurements", "Deferred until privacy fields and retention are approved."],
  ["Personal Routines", "Customer-authored organization, never a store recommendation."],
  ["Journal", "Deferred private notes with export and deletion controls."],
  ["Research Protocols", "Published research-reference content linked to products."],
  ["Calculator", "Transparent unit arithmetic with visible inputs and formulas."],
] as const

const cardClass = "rounded-xl border border-ui-border-base bg-white p-5"
const inputClass =
  "w-full rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-sm outline-none focus:border-ui-fg-base"

function SubmitButton({ children, tone = "dark" }: {
  children: React.ReactNode
  tone?: "dark" | "danger" | "light"
}) {
  const { pending } = useFormStatus()
  const styles = {
    dark: "bg-ui-fg-base text-ui-bg-base",
    danger: "bg-red-600 text-white",
    light: "border border-ui-border-base bg-white text-ui-fg-base",
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${styles[tone]}`}
    >
      {pending ? "Saving…" : children}
    </button>
  )
}

function ActionMessage({ state }: { state: ResearchTrackingActionState }) {
  if (state.error) {
    return <p className="text-sm text-red-600">{state.error}</p>
  }

  if (state.success) {
    return <p className="text-sm text-emerald-700">Saved successfully.</p>
  }

  return null
}

function HiddenCountry({ countryCode }: { countryCode: string }) {
  return <input type="hidden" name="country_code" value={countryCode} />
}

function HiddenMutationKey({ value }: { value: string }) {
  return <input type="hidden" name="idempotency_key" value={value} />
}

function OptInCard({
  configuration,
  countryCode,
  idempotencyKey,
}: {
  configuration: ResearchTrackingConfiguration
  countryCode: string
  idempotencyKey: string
}) {
  const [state, action] = useActionState(
    createResearchProfileAction,
    initialState,
  )

  if (!configuration.available) {
    return (
      <div className={`${cardClass} border-amber-200 bg-amber-50`}>
        <p className="text-sm font-medium text-amber-900">Activation pending</p>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          Research & Tracking is built behind a privacy gate. It will remain
          unavailable until the approved customer notice and production controls
          are configured.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className={`${cardClass} space-y-4`}>
      <HiddenCountry countryCode={countryCode} />
      <HiddenMutationKey value={idempotencyKey} />
      <input
        type="hidden"
        name="consent_version"
        value={configuration.consent_version ?? ""}
      />
      <div>
        <h2 className="text-lg font-semibold">Start Research & Tracking</h2>
        <p className="mt-2 text-sm leading-6 text-ui-fg-subtle">
          Create a private research profile. No purchase is tracked automatically,
          and this area does not provide medical guidance.
        </p>
      </div>
      <label className="block text-sm font-medium" htmlFor="research-timezone">
        Timezone
      </label>
      <select
        id="research-timezone"
        name="timezone"
        defaultValue={configuration.default_timezone}
        className={inputClass}
      >
        <option value="Asia/Manila">Asia/Manila</option>
      </select>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input type="checkbox" name="accepted" required className="mt-1" />
        <span>
          I reviewed and accept Research & Tracking notice version{" "}
          {configuration.consent_version}.{" "}
          {configuration.notice_url && (
            <a
              href={configuration.notice_url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Read the notice
            </a>
          )}
        </span>
      </label>
      <ActionMessage state={state} />
      <SubmitButton>Start tracking</SubmitButton>
    </form>
  )
}

function PreferencesCard({
  countryCode,
  idempotencyKey,
  profile,
}: {
  countryCode: string
  idempotencyKey: string
  profile: ResearchProfile
}) {
  const [state, action] = useActionState(
    updateResearchPreferencesAction,
    initialState,
  )

  if (profile.status !== "active") {
    return (
      <div className={cardClass}>
        <h2 className="text-lg font-semibold">Preferences</h2>
        <p className="mt-2 text-sm leading-6 text-ui-fg-subtle">
          Timezone {profile.timezone} · Locale {profile.locale}. Preferences are
          read-only while this profile is {profile.status}.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className={`${cardClass} space-y-4`}>
      <HiddenCountry countryCode={countryCode} />
      <HiddenMutationKey value={idempotencyKey} />
      <div>
        <h2 className="text-lg font-semibold">Preferences</h2>
        <p className="mt-1 text-sm text-ui-fg-subtle">
          Locale {profile.locale} · Consent {profile.consent_version}
        </p>
      </div>
      <label className="block text-sm font-medium" htmlFor="profile-timezone">
        Timezone
      </label>
      <select
        id="profile-timezone"
        name="timezone"
        defaultValue={profile.timezone}
        className={inputClass}
      >
        <option value="Asia/Manila">Asia/Manila</option>
      </select>
      <ActionMessage state={state} />
      <SubmitButton>Save preferences</SubmitButton>
    </form>
  )
}

function ConsentCard({
  configuration,
  countryCode,
  idempotencyKey,
  profile,
}: {
  configuration: ResearchTrackingConfiguration
  countryCode: string
  idempotencyKey: string
  profile: ResearchProfile
}) {
  const [state, action] = useActionState(
    renewResearchConsentAction,
    initialState,
  )
  const renewalAvailable =
    configuration.available &&
    configuration.consent_version !== profile.consent_version &&
    profile.status === "active"

  return (
    <div className={cardClass}>
      <h2 className="text-lg font-semibold">Consent</h2>
      <p className="mt-2 text-sm leading-6 text-ui-fg-subtle">
        Accepted {new Date(profile.consented_at).toLocaleDateString("en-PH")} ·
        Version {profile.consent_version}
      </p>
      {!configuration.available ? (
        <p className="mt-3 text-sm text-amber-700">
          Consent renewal is unavailable until the current approved notice is
          configured.
        </p>
      ) : renewalAvailable ? (
        <form action={action} className="mt-4 space-y-4">
          <HiddenCountry countryCode={countryCode} />
          <HiddenMutationKey value={idempotencyKey} />
          <input
            type="hidden"
            name="consent_version"
            value={configuration.consent_version ?? ""}
          />
          <label className="flex items-start gap-3 text-sm leading-6">
            <input type="checkbox" name="accepted" required className="mt-1" />
            <span>
              I reviewed and accept the current notice version{" "}
              {configuration.consent_version}.{" "}
              {configuration.notice_url && (
                <a
                  href={configuration.notice_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Read the notice
                </a>
              )}
            </span>
          </label>
          <ActionMessage state={state} />
          <SubmitButton>Renew consent</SubmitButton>
        </form>
      ) : (
        <p className="mt-3 text-sm text-emerald-700">
          Your current consent record is up to date.
        </p>
      )}
    </div>
  )
}

function PrivacyCard({
  countryCode,
  idempotencyKeys,
  profile,
  privacyRequest,
}: {
  countryCode: string
  idempotencyKeys: Pick<
    ResearchSubmissionKeys,
    "profileClosure" | "deletionRequest" | "deletionCancellation"
  >
  profile: ResearchProfile
  privacyRequest: ResearchPrivacyRequest | null
}) {
  const [closeState, closeAction] = useActionState(
    closeResearchProfileAction,
    initialState,
  )
  const [deleteState, deleteAction] = useActionState(
    requestResearchDeletionAction,
    initialState,
  )
  const [cancelState, cancelAction] = useActionState(
    cancelResearchDeletionAction,
    initialState,
  )

  return (
    <div className={`${cardClass} space-y-6`}>
      <div>
        <h2 className="text-lg font-semibold">Privacy & Data</h2>
        <p className="mt-2 text-sm leading-6 text-ui-fg-subtle">
          Profile status: <span className="font-medium">{profile.status}</span>.
          Commerce orders, payments, and fulfillment records are governed
          separately from private tracking records.
        </p>
      </div>

      {privacyRequest ? (
        <div className="rounded-lg bg-ui-bg-subtle p-4">
          <p className="text-sm font-medium">
            Deletion request: {privacyRequest.status}
          </p>
          <p className="mt-1 text-sm text-ui-fg-subtle">
            Requested {new Date(privacyRequest.requested_at).toLocaleDateString("en-PH")}.
            Submission is not proof that deletion is complete.
          </p>
          {privacyRequest.status === "requested" && (
            <form action={cancelAction} className="mt-4 space-y-3">
              <HiddenCountry countryCode={countryCode} />
              <HiddenMutationKey value={idempotencyKeys.deletionCancellation} />
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="acknowledge_cancellation"
                  required
                  className="mt-1"
                />
                <span>I understand that I am cancelling this request.</span>
              </label>
              <ActionMessage state={cancelState} />
              <SubmitButton tone="light">Cancel deletion request</SubmitButton>
            </form>
          )}
        </div>
      ) : (
        <form action={deleteAction} className="space-y-3">
          <HiddenCountry countryCode={countryCode} />
          <HiddenMutationKey value={idempotencyKeys.deletionRequest} />
          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              name="acknowledge_deletion_request"
              required
              className="mt-1"
            />
            <span>
              I understand this submits a private-data deletion request and does
              not immediately erase data or required commerce records.
            </span>
          </label>
          <ActionMessage state={deleteState} />
          <SubmitButton tone="danger">Request deletion</SubmitButton>
        </form>
      )}

      {profile.status === "active" && !privacyRequest && (
        <form action={closeAction} className="space-y-3 border-t pt-5">
          <HiddenCountry countryCode={countryCode} />
          <HiddenMutationKey value={idempotencyKeys.profileClosure} />
          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              name="acknowledge_closure"
              required
              className="mt-1"
            />
            <span>
              I understand closing withdraws consent and makes this profile
              read-only. RT-2 does not provide a reopen action.
            </span>
          </label>
          <ActionMessage state={closeState} />
          <SubmitButton tone="light">Close research profile</SubmitButton>
        </form>
      )}
    </div>
  )
}

export default function ResearchTracking({
  configuration,
  countryCode,
  profile,
  privacyRequest,
  purchasedActivationKeys,
  purchasedItems,
  purchasedRuntimeReady,
  runtimeReady,
  submissionKeys,
  trackedMaterials,
}: ResearchTrackingProps) {
  return (
    <div className="w-full" data-testid="research-tracking-page">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
          Private customer workspace
        </p>
        <h1 className="mt-2 text-2xl-semi">Research & Tracking</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ui-fg-subtle">
          Organize research materials and future customer-created records. This
          area does not provide medical advice, treatment plans, or product-use
          recommendations.
        </p>
      </div>

      {!runtimeReady ? (
        <div className={`${cardClass} border-sky-200 bg-sky-50`}>
          <p className="text-sm font-medium text-sky-900">
            Research & Tracking is temporarily unavailable
          </p>
          <p className="mt-2 text-sm leading-6 text-sky-800">
            We could not verify your current Research & Tracking account data.
            No changes can be made from this page right now. Please try again
            later.
          </p>
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 gap-5 large:grid-cols-2">
          <PreferencesCard
            countryCode={countryCode}
            idempotencyKey={submissionKeys.preferencesUpdate}
            profile={profile}
          />
          <ConsentCard
            configuration={configuration}
            countryCode={countryCode}
            idempotencyKey={submissionKeys.consentRenewal}
            profile={profile}
          />
          <div className="large:col-span-2">
            <PrivacyCard
              countryCode={countryCode}
              idempotencyKeys={submissionKeys}
              profile={profile}
              privacyRequest={privacyRequest}
            />
          </div>
        </div>
      ) : (
        <OptInCard
          configuration={configuration}
          countryCode={countryCode}
          idempotencyKey={submissionKeys.profileCreate}
        />
      )}

      {runtimeReady && profile && (
        <ProductsAndSupplies
          configuration={configuration}
          countryCode={countryCode}
          profile={profile}
          purchasedActivationKeys={purchasedActivationKeys}
          purchasedItems={purchasedItems}
          runtimeReady={purchasedRuntimeReady}
          trackedMaterials={trackedMaterials}
        />
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Planned workspace</h2>
            <p className="mt-1 text-sm text-ui-fg-subtle">
              These areas remain read-only previews until their own reviewed phase.
            </p>
          </div>
          <span className="rounded-full bg-ui-bg-subtle px-3 py-1 text-xs font-medium">
            Coming later
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 medium:grid-cols-2">
          {futureAreas.map(([title, description]) => (
            <div key={title} className="rounded-xl border border-ui-border-base p-4">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-5 text-ui-fg-subtle">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
