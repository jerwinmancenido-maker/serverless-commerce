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
  type ResearchOccurrence,
  type ResearchNotification,
  type ResearchJournalEntry,
  type ResearchPrivateRecordsConfiguration,
  type ResearchRoutine,
  type ResearchRoutineLog,
  type ResearchReplenishmentProjection,
  type ResearchProtocolAccess,
  type ResearchCalculationSnapshot,
  type ResearchPersonalGoal,
  type ResearchMeasurement,
  type ResearchMeasurementSummary,
  type ResearchTimelineEvent,
  type TrackedResearchMaterial,
  updateResearchPreferencesAction,
} from "@lib/data/research-tracking"
import type {
  PurchasedActivationSubmissionKeys,
  ResearchSubmissionKeys,
  RoutineSubmissionKeys,
} from "@lib/research-tracking-idempotency"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import Journal from "./journal"
import PersonalRoutines from "./personal-routines"
import ProductsAndSupplies from "./products-and-supplies"
import MyProtocols from "./my-protocols"
import Measurements from "./measurements"
import ActivityTimeline from "./activity-timeline"
import Replenishment from "./replenishment"
import ResearchCalendar from "./research-calendar"
import ResearchToday from "./research-today"
import ResearchCalculator from "./research-calculator"
import ResearchGoals from "./research-goals"
import type { RewardsSummary } from "@lib/data/rewards"
import ProductRecommendations, {
  type ResearchRecommendationItem,
} from "@modules/research-protocols/product-recommendations"

type ResearchTrackingProps = {
  section?: "overview" | "today" | "calendar" | "protocols" | "routines" | "calculator" | "progress" | "journal" | "timeline" | "rewards"
  calendarAnchor: string
  configuration: ResearchTrackingConfiguration
  countryCode: string
  profile: ResearchProfile | null
  protocolAccesses: ResearchProtocolAccess[]
  calculations: ResearchCalculationSnapshot[]
  calculationSubmissionKey: string
  goals: ResearchPersonalGoal[]
  routineStreak: number
  rewards: RewardsSummary | null
  protocolRuntimeReady: boolean
  protocolRoutineKeys: Record<string, string>
  privateRecords: ResearchPrivateRecordsConfiguration
  privacyRequest: ResearchPrivacyRequest | null
  purchasedActivationKeys: PurchasedActivationSubmissionKeys
  purchasedItems: PurchasedItemCandidate[]
  purchasedRuntimeReady: boolean
  occurrences: ResearchOccurrence[]
  notifications: ResearchNotification[]
  notificationUnreadCount: number
  journalEntries: ResearchJournalEntry[]
  journalCount: number
  journalLimit: number
  journalOffset: number
  journalConsentKey: string
  journalRuntimeReady: boolean
  journalSubmissionKeys: {
    create: string
    byEntry: Record<string, { revise: string; transition: string }>
  }
  measurements: ResearchMeasurement[]
  measurementSummary: ResearchMeasurementSummary
  measurementRuntimeReady: boolean
  measurementSubmissionKeys: {
    consent: string
    create: string
    byEntry: Record<string, string>
  }
  timeline: ResearchTimelineEvent[]
  timelineRuntimeReady: boolean
  routineLogs: ResearchRoutineLog[]
  replenishmentProjections: ResearchReplenishmentProjection[]
  replenishmentRuntimeReady: boolean
  routineToday: string
  routineRuntimeReady: boolean
  routines: ResearchRoutine[]
  routineSubmissionKeys: RoutineSubmissionKeys
  runtimeReady: boolean
  submissionKeys: ResearchSubmissionKeys
  trackedMaterials: TrackedResearchMaterial[]
  myProtocolsRecommendations: {
    handle: string
    items: ResearchRecommendationItem[]
  } | null
  dashboardRecommendations: {
    handle: string
    items: ResearchRecommendationItem[]
  } | null
  contextRecommendations: {
    handle: string
    items: ResearchRecommendationItem[]
  } | null
}

const initialState: ResearchTrackingActionState = {
  success: false,
  error: null,
}

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

export function OptInCard({
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

export function PreferencesCard({
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

export function ConsentCard({
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

export function PrivacyCard({
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
  section = "overview",
  calendarAnchor,
  configuration,
  countryCode,
  profile,
  protocolAccesses,
  calculations,
  calculationSubmissionKey,
  goals,
  routineStreak,
  rewards,
  protocolRuntimeReady,
  protocolRoutineKeys,
  privateRecords,
  privacyRequest: _privacyRequest,
  purchasedActivationKeys,
  purchasedItems,
  purchasedRuntimeReady,
  occurrences,
  notifications,
  notificationUnreadCount,
  journalEntries,
  journalCount,
  journalLimit,
  journalOffset,
  journalConsentKey,
  journalRuntimeReady,
  journalSubmissionKeys,
  measurements,
  measurementSummary,
  measurementRuntimeReady,
  measurementSubmissionKeys,
  timeline,
  timelineRuntimeReady,
  routineLogs,
  replenishmentProjections,
  replenishmentRuntimeReady,
  routineToday,
  routineRuntimeReady,
  routines,
  routineSubmissionKeys,
  runtimeReady,
  submissionKeys: _submissionKeys,
  trackedMaterials,
  myProtocolsRecommendations,
  dashboardRecommendations,
  contextRecommendations,
}: ResearchTrackingProps) {
  return (
    <div className="w-full" data-testid="research-tracking-page">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
          Private customer workspace
        </p>
        <h1 className="mt-2 text-2xl-semi">Research Hub</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ui-fg-subtle">
          Your purchased protocols, routines, progress and private observations
          in one place.
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
      ) : !profile ? (
        <div className={cardClass}>
          <h2 className="text-lg font-semibold">Finish account setup</h2>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Complete the one-time account agreement to activate your private
            Research Hub.
          </p>
          <a className="mt-4 inline-block text-sm font-medium underline" href={`/${countryCode}/account/complete-setup`}>
            Continue setup
          </a>
        </div>
      ) : null}

      {runtimeReady && profile && (section === "overview" || section === "protocols") && (
        <MyProtocols
          protocols={protocolAccesses}
          runtimeReady={protocolRuntimeReady}
          countryCode={countryCode}
          submissionKeys={protocolRoutineKeys}
          trackedMaterials={trackedMaterials}
        />
      )}

      {runtimeReady && profile && section === "protocols" && myProtocolsRecommendations?.items.length ? (
        <ProductRecommendations
          handle={myProtocolsRecommendations.handle}
          countryCode={countryCode}
          items={myProtocolsRecommendations.items}
          eyebrow="For your protocols"
        />
      ) : null}

      {runtimeReady && profile && section === "overview" && (
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

      {runtimeReady && profile && section === "today" && (
        <ResearchToday
          countryCode={countryCode}
          occurrences={occurrences}
          routines={routines}
          today={routineToday}
          trackedMaterials={trackedMaterials}
          notifications={notifications}
          notificationUnreadCount={notificationUnreadCount}
        />
      )}

      {runtimeReady && profile && section === "calendar" && (
        <ResearchCalendar
          anchorDate={calendarAnchor}
          countryCode={countryCode}
          occurrences={occurrences}
          today={routineToday}
        />
      )}

      {runtimeReady && profile && section === "calculator" && (
        <ResearchCalculator
          countryCode={countryCode}
          protocols={protocolAccesses}
          routines={routines}
          journalEntries={journalEntries}
          calculations={calculations}
          submissionKey={calculationSubmissionKey}
        />
      )}

      {runtimeReady && profile && section === "rewards" && (
        <ResearchGoals
          countryCode={countryCode}
          today={routineToday}
          goals={goals}
          routineStreak={routineStreak}
          routines={routines}
          rewards={rewards}
        />
      )}

      {runtimeReady && profile && (section === "overview" || section === "progress") && (
        <Measurements
          configuration={privateRecords.measurements}
          countryCode={countryCode}
          measurements={measurements}
          profile={profile}
          protocols={protocolAccesses}
          routines={routines}
          runtimeReady={measurementRuntimeReady}
          submissionKeys={measurementSubmissionKeys}
          summary={measurementSummary}
          trackedMaterials={trackedMaterials}
          timeline={timeline}
        />
      )}

      {runtimeReady && profile && section === "timeline" && (
        <ActivityTimeline events={timeline} runtimeReady={timelineRuntimeReady} />
      )}

      {runtimeReady && profile && section === "overview" && (
        <Replenishment
          projections={replenishmentProjections}
          runtimeReady={replenishmentRuntimeReady}
          countryCode={countryCode}
        />
      )}

      {runtimeReady && profile && section === "overview" && dashboardRecommendations?.items.length ? (
        <ProductRecommendations
          handle={dashboardRecommendations.handle}
          items={dashboardRecommendations.items}
          eyebrow="Supply and reorder options"
          countryCode={countryCode}
        />
      ) : null}

      {runtimeReady && profile && ["today", "calendar"].includes(section) && contextRecommendations?.items.length ? (
        <ProductRecommendations
          handle={contextRecommendations.handle}
          items={contextRecommendations.items}
          eyebrow={section === "today" ? "Useful for today" : "Related products and supplies"}
          countryCode={countryCode}
        />
      ) : null}

      {runtimeReady && profile && (section === "overview" || section === "routines") && (
        <PersonalRoutines
          canMutate={
            profile.status === "active" &&
            profile.consent_version === configuration.consent_version
          }
          countryCode={countryCode}
          occurrences={occurrences}
          logs={routineLogs}
          routines={routines}
          today={routineToday}
          runtimeReady={routineRuntimeReady}
          submissionKeys={routineSubmissionKeys}
          trackedMaterials={trackedMaterials}
        />
      )}

      {runtimeReady && profile && section === "journal" && (
        <Journal
          canMutate={
            profile.status === "active" &&
            profile.consent_version === configuration.consent_version &&
            privateRecords.journal.available &&
            privateRecords.journal.current_consent?.is_current === true
          }
          configuration={privateRecords.journal}
          consentSubmissionKey={journalConsentKey}
          countryCode={countryCode}
          entries={journalEntries}
          entryCount={journalCount}
          limit={journalLimit}
          logs={routineLogs}
          offset={journalOffset}
          runtimeReady={journalRuntimeReady}
          routines={routines}
          submissionKeys={journalSubmissionKeys}
          timezone={profile.timezone}
          trackedMaterials={trackedMaterials}
        />
      )}

      {runtimeReady && profile && (
        <p className="mt-8 border-t border-ui-border-base pt-5 text-sm text-ui-fg-subtle">
          Your Research Hub records are private. <a className="underline" href={`/${countryCode}/account/settings/privacy`}>Manage privacy and data settings.</a>
        </p>
      )}

    </div>
  )
}
