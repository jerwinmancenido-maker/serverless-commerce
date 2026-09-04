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
import CompletionRing from "./completion-ring"
import AdherenceHeatmap from "./adherence-heatmap"
import MeasurementSparkline from "./measurement-sparkline"
import SupplyLevelBars from "./supply-level-bars"
import RoutinesCalendarPanel from "./routines-calendar-panel"
import type { RewardsSummary } from "@lib/data/rewards"
import ProductRecommendations, {
  type ResearchRecommendationItem,
} from "@modules/research-protocols/product-recommendations"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

type ResearchTrackingProps = {
  section?: "overview" | "today" | "calendar" | "schedule" | "supplies" | "protocols" | "routines" | "calculator" | "progress" | "journal" | "timeline" | "rewards"
  calendarAnchor: string
  configuration: ResearchTrackingConfiguration
  countryCode: string
  profile: ResearchProfile | null
  protocolAccesses: ResearchProtocolAccess[]
  calculations: ResearchCalculationSnapshot[]
  calculationSubmissionKey: string
  calculatorParams?: {
    mass?: string
    unit?: string
    name?: string
  }
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
  calculatorParams,
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
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-muted">
          <span className="size-2 rounded-full bg-indigo-500" />
          <span>Research & Protocol Workspace</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ui-fg-base sm:text-3xl">
          Research Hub
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ui-fg-subtle">
          Manage your active research protocols, dosing schedules, progress tracking, and observations.
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

      {runtimeReady && profile && section === "overview" && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="research-hub-quick-stats">
          <div className="flex items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-white p-4 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
                <path d="M6 14h12" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Protocols</p>
              <p className="text-2xl font-bold tracking-tight text-ui-fg-base">{protocolAccesses.length}</p>
              <p className="text-xs text-ui-fg-subtle">
                {protocolAccesses.length === 1 ? "1 active protocol" : `${protocolAccesses.length} active protocols`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 via-white to-white p-4 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Adherence</p>
              <p className="text-2xl font-bold tracking-tight text-ui-fg-base">
                {routineStreak} <span className="text-sm font-semibold text-ui-fg-subtle">{routineStreak === 1 ? "day" : "days"}</span>
              </p>
              <p className="text-xs text-ui-fg-subtle">
                {routineStreak > 0 ? "Active routine streak" : "Ready to log today"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/60 via-white to-white p-4 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Rewards</p>
              <p className="text-2xl font-bold tracking-tight text-ui-fg-base">
                {rewards?.balance.available ?? 0} <span className="text-sm font-semibold text-ui-fg-subtle">pts</span>
              </p>
              <p className="text-xs text-ui-fg-subtle">
                Worth ₱{rewards?.balance.peso_value ?? 0} store savings
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule sub-navigation toggle — legacy today/calendar and new unified schedule */}
      {runtimeReady && profile && (section === "today" || section === "calendar" || section === "schedule") && (
        <div className="mb-6 flex flex-col gap-3 border-b border-ui-border-base pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">
              Schedule & Planning
            </p>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-ui-fg-base">
              {section === "today" ? "Today's Research Agenda" : section === "calendar" ? "Monthly Protocol Calendar" : "Dosing Schedule & Protocol Regimens"}
            </h2>
          </div>
        </div>
      )}

      {/* Records sub-navigation toggle */}
      {runtimeReady && profile && (section === "progress" || section === "journal") && (() => {
        const activeProtocol = protocolAccesses.length > 0 ? protocolAccesses[0] : null
        return (
          <div className="mb-6 flex flex-col gap-3 border-b border-ui-border-base pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">
                {activeProtocol ? (
                  <span className="inline-flex items-center gap-1.5 text-indigo-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Active Protocol · {activeProtocol.protocol_title}
                  </span>
                ) : (
                  "Private Records & Observations"
                )}
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-ui-fg-base">
                {section === "progress" ? "Measurements & Progress" : "Research Journal"}
              </h2>
            </div>
            <div className="inline-flex rounded-xl border border-ui-border-base bg-ui-bg-subtle p-1 text-xs font-medium">
              <LocalizedClientLink
                href="/account/research-hub?section=progress"
                className={clx("rounded-lg px-3.5 py-1.5 transition-all", {
                  "bg-white font-semibold text-ui-fg-base shadow-2xs": section === "progress",
                  "text-ui-fg-subtle hover:text-ui-fg-base": section !== "progress",
                })}
              >
                Measurements & Trends
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/account/research-hub?section=journal"
                className={clx("rounded-lg px-3.5 py-1.5 transition-all", {
                  "bg-white font-semibold text-ui-fg-base shadow-2xs": section === "journal",
                  "text-ui-fg-subtle hover:text-ui-fg-base": section !== "journal",
                })}
              >
                Research Journal ({journalCount})
              </LocalizedClientLink>
            </div>
          </div>
        )
      })()}

      {/* Tools & Goals sub-navigation toggle */}
      {runtimeReady && profile && (section === "calculator" || section === "timeline" || section === "rewards") && (
        <div className="mb-6 flex flex-col gap-3 border-b border-ui-border-base pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">
              Workspace Tools & Milestones
            </p>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-ui-fg-base">
              {section === "calculator"
                ? "Reconstitution Calculator"
                : section === "timeline"
                  ? "Activity Timeline"
                  : "Goals & Rewards"}
            </h2>
          </div>
          <div className="inline-flex overflow-x-auto rounded-xl border border-ui-border-base bg-ui-bg-subtle p-1 text-xs font-medium">
            <LocalizedClientLink
              href="/account/research-hub?section=calculator"
              className={clx("whitespace-nowrap rounded-lg px-3.5 py-1.5 transition-all", {
                "bg-white font-semibold text-ui-fg-base shadow-2xs": section === "calculator",
                "text-ui-fg-subtle hover:text-ui-fg-base": section !== "calculator",
              })}
            >
              Calculator
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/research-hub?section=timeline"
              className={clx("whitespace-nowrap rounded-lg px-3.5 py-1.5 transition-all", {
                "bg-white font-semibold text-ui-fg-base shadow-2xs": section === "timeline",
                "text-ui-fg-subtle hover:text-ui-fg-base": section !== "timeline",
              })}
            >
              Timeline
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/research-hub?section=rewards"
              className={clx("whitespace-nowrap rounded-lg px-3.5 py-1.5 transition-all", {
                "bg-white font-semibold text-ui-fg-base shadow-2xs": section === "rewards",
                "text-ui-fg-subtle hover:text-ui-fg-base": section !== "rewards",
              })}
            >
              Goals & Rewards
            </LocalizedClientLink>
          </div>
        </div>
      )}

      {/* Protocols tab */}
      {runtimeReady && profile && section === "protocols" && (
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

      {runtimeReady && profile && section === "overview" && (() => {
        const todayOccs = occurrences.filter((o) => o.local_date === routineToday)
        const confirmedToday = todayOccs.filter((o) => o.status === "confirmed").length
        return (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* LEFT: primary column */}
            <div className="space-y-6 xl:col-span-8">
              {/* Quick Stats banner */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Protocols stat */}
                <div className="flex items-center gap-4 rounded-xl border border-ui-border-base bg-white p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                    {protocolAccesses.length}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-600">PROTOCOLS</p>
                    <p className="text-sm font-semibold text-ui-fg-base">{protocolAccesses.length} active protocol{protocolAccesses.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                {/* Adherence stat with donut ring */}
                <div className="flex items-center gap-4 rounded-xl border border-ui-border-base bg-white p-4">
                  <CompletionRing total={todayOccs.length} confirmed={confirmedToday} streak={routineStreak} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">ADHERENCE</p>
                    <p className="text-sm font-semibold text-ui-fg-base">
                      {routineStreak > 0 ? `${routineStreak} day streak` : "Ready to log today"}
                    </p>
                  </div>
                </div>
                {/* Rewards stat */}
                <div className="flex items-center gap-4 rounded-xl border border-ui-border-base bg-white p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-lg font-bold text-white">
                    🏆
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600">REWARDS</p>
                    <p className="text-sm font-semibold text-ui-fg-base">
                      {rewards ? `${rewards.balance.available} pts` : "0 pts"}
                    </p>
                    {rewards && <p className="text-[10px] text-ui-fg-subtle">Worth ₱{rewards.balance.peso_value} store savings</p>}
                  </div>
                </div>
              </div>

              {/* Active Protocols card */}
              <div className={cardClass}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-ui-fg-base">Active Protocols</h2>
                  <LocalizedClientLink
                    href="/account/research-hub?section=protocols"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View all →
                  </LocalizedClientLink>
                </div>
                {protocolAccesses.length === 0 ? (
                  <p className="text-sm text-ui-fg-subtle">No protocols preserved yet. <LocalizedClientLink href="/research-protocols" className="underline">Explore the protocol library →</LocalizedClientLink></p>
                ) : (
                  <ul className="space-y-3">
                    {protocolAccesses.slice(0, 3).map((pa) => (
                      <li key={pa.profile_access_id} className="flex items-start gap-3 rounded-lg border border-ui-border-base p-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                          {(pa.protocol_title ?? "PR").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ui-fg-base">{pa.protocol_title}</p>
                          <p className="text-xs text-ui-fg-subtle">{pa.routine_started_at ? "Routine active" : "Protocol preserved"}</p>
                        </div>
                        <LocalizedClientLink
                          href={`/account/research-hub?section=protocols`}
                          className="shrink-0 rounded-lg border border-ui-border-base bg-white px-2.5 py-1 text-xs font-medium text-ui-fg-base hover:border-indigo-300 hover:text-indigo-700"
                        >
                          View
                        </LocalizedClientLink>
                      </li>
                    ))}
                    {protocolAccesses.length > 3 && (
                      <li className="text-center">
                        <LocalizedClientLink href="/account/research-hub?section=protocols" className="text-xs font-medium text-ui-fg-subtle hover:text-indigo-600">
                          +{protocolAccesses.length - 3} more protocols →
                        </LocalizedClientLink>
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Adherence Heatmap — 12 weeks of routine history */}
              <div className={cardClass}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-ui-fg-base">Routine Adherence</h2>
                    <p className="text-xs text-ui-fg-subtle mt-0.5">Last 12 weeks of completion history</p>
                  </div>
                  <LocalizedClientLink
                    href="/account/research-hub?section=calendar"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Open calendar →
                  </LocalizedClientLink>
                </div>
                <AdherenceHeatmap occurrences={occurrences} today={routineToday} />
              </div>
            </div>

            {/* RIGHT: secondary column */}
            <div className="space-y-4 xl:col-span-4">
              {/* Measurement Sparkline */}
              <div className={cardClass}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-ui-fg-base">Biometric Trend</h2>
                  <LocalizedClientLink
                    href="/account/research-hub?section=progress"
                    className="text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base"
                  >
                    + Log →
                  </LocalizedClientLink>
                </div>
                <MeasurementSparkline summary={measurementSummary} />
              </div>

              {/* Supply Level Bars */}
              <div className={cardClass}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-ui-fg-base">Supplies & Inventory</h2>
                  <LocalizedClientLink
                    href="/account/research-hub?section=schedule"
                    className="text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base"
                  >
                    Manage →
                  </LocalizedClientLink>
                </div>
                <SupplyLevelBars materials={trackedMaterials} projections={replenishmentProjections} />
                {purchasedItems.some((p) => p.added_to_tracking_at === null && p.eligibility === "eligible") && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    New purchases ready to activate. <LocalizedClientLink href="/account/research-hub?section=schedule" className="font-semibold underline">Activate now →</LocalizedClientLink>
                  </div>
                )}
              </div>

              {/* Quick Tools */}
              <div className={cardClass}>
                <h2 className="mb-3 text-sm font-semibold text-ui-fg-base">Quick Tools</h2>
                <div className="space-y-1.5">
                  {[
                    {
                      label: "Reconstitution Calculator",
                      href: "/account/research-hub?section=calculator",
                      icon: (
                        <svg className="h-4 w-4 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 2v7.31a2 2 0 0 1-.37 1.17l-5.26 7.89A2 2 0 0 0 6 21.5h12a2 2 0 0 0 1.63-3.13l-5.26-7.89A2 2 0 0 1 14 9.31V2" />
                          <path d="M8.5 2h7M7 16h10" />
                        </svg>
                      ),
                    },
                    {
                      label: "Research Journal",
                      href: "/account/research-hub?section=journal",
                      icon: (
                        <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                          <path d="M6 6h10M6 10h10" />
                        </svg>
                      ),
                    },
                    {
                      label: "Goals & Rewards",
                      href: "/account/research-hub?section=rewards",
                      icon: (
                        <svg className="h-4 w-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="7" />
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                        </svg>
                      ),
                    },
                    {
                      label: "Activity Timeline",
                      href: "/account/research-hub?section=timeline",
                      icon: (
                        <svg className="h-4 w-4 text-sky-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      ),
                    },
                  ].map(({ label, href, icon }) => (
                    <LocalizedClientLink
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 rounded-lg border border-ui-border-base px-3 py-2.5 text-sm text-ui-fg-base transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <span>{icon}</span>
                      <span className="flex-1 font-medium">{label}</span>
                      <span className="text-ui-fg-subtle">→</span>
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}


      {runtimeReady && profile && section === "today" && (
        <ResearchToday
          countryCode={countryCode}
          occurrences={occurrences}
          routines={routines}
          today={routineToday}
          trackedMaterials={trackedMaterials}
          notifications={notifications}
          notificationUnreadCount={notificationUnreadCount}
          logs={routineLogs}
          measurements={measurements}
          journalEntries={journalEntries}
          timezone={profile.timezone}
          measurementSubmissionKey={measurementSubmissionKeys.create}
          journalSubmissionKey={journalSubmissionKeys.create}
          purchasedItems={purchasedItems}
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
          initialMass={calculatorParams?.mass}
          initialUnit={calculatorParams?.unit}
          initialName={calculatorParams?.name}
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

      {runtimeReady && profile && section === "progress" && (
        <Measurements
          configuration={privateRecords.measurements}
          countryCode={countryCode}
          measurements={measurements}
          occurrences={occurrences}
          profile={profile}
          protocols={protocolAccesses}
          routines={routines}
          runtimeReady={measurementRuntimeReady}
          submissionKeys={measurementSubmissionKeys}
          summary={measurementSummary}
          today={routineToday}
          trackedMaterials={trackedMaterials}
          timeline={timeline}
        />
      )}

      {runtimeReady && profile && section === "timeline" && (
        <ActivityTimeline events={timeline} runtimeReady={timelineRuntimeReady} />
      )}

      {runtimeReady && profile && ["today", "calendar"].includes(section) && contextRecommendations?.items.length ? (
        <ProductRecommendations
          handle={contextRecommendations.handle}
          items={contextRecommendations.items}
          eyebrow={section === "today" ? "Useful for today" : "Related products and supplies"}
          countryCode={countryCode}
        />
      ) : null}

      {/* Routines tab (legacy) — kept for backward compat; schedule is now the primary entry point */}
      {runtimeReady && profile && section === "routines" && (
        <>
          {/* Full-month two-panel calendar & upcoming schedule at the top */}
          <div className="mb-6">
            <RoutinesCalendarPanel
              occurrences={occurrences}
              today={routineToday}
              countryCode={countryCode}
            />
          </div>
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
          <div className="mt-8 rounded-2xl border border-ui-border-base bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border-base pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">Inventory Health</p>
                <h3 className="mt-0.5 text-base font-bold text-ui-fg-base">Active Supplies & Vials</h3>
              </div>
              <LocalizedClientLink
                href="/account/research-hub?section=supplies"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-3 py-1.5 text-xs font-semibold text-ui-fg-base hover:bg-ui-bg-base transition-colors"
              >
                <span>Manage Vials & Supplies →</span>
              </LocalizedClientLink>
            </div>
            <div className="mt-4">
              <SupplyLevelBars materials={trackedMaterials} projections={replenishmentProjections} />
            </div>
          </div>
        </>
      )}

      {/* Unified Schedule — primary entry point combining calendar view + routine management */}
      {runtimeReady && profile && section === "schedule" && (
        <>
          <div className="mb-6">
            <RoutinesCalendarPanel
              occurrences={occurrences}
              today={routineToday}
              countryCode={countryCode}
            />
          </div>
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
          <div className="mt-8 rounded-2xl border border-ui-border-base bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border-base pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ui-fg-muted">Inventory Health</p>
                <h3 className="mt-0.5 text-base font-bold text-ui-fg-base">Active Supplies & Vials</h3>
              </div>
              <LocalizedClientLink
                href="/account/research-hub?section=supplies"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-3 py-1.5 text-xs font-semibold text-ui-fg-base hover:bg-ui-bg-base transition-colors"
              >
                <span>Manage Vials & Supplies →</span>
              </LocalizedClientLink>
            </div>
            <div className="mt-4">
              <SupplyLevelBars materials={trackedMaterials} projections={replenishmentProjections} />
            </div>
          </div>
        </>
      )}

      {/* Dedicated Products & Supplies view */}
      {runtimeReady && profile && section === "supplies" && (
        <div className="space-y-8">
          <ProductsAndSupplies
            configuration={configuration}
            countryCode={countryCode}
            profile={profile}
            purchasedActivationKeys={purchasedActivationKeys}
            purchasedItems={purchasedItems}
            runtimeReady={purchasedRuntimeReady}
            trackedMaterials={trackedMaterials}
            projections={replenishmentProjections}
          />
          <Replenishment
            projections={replenishmentProjections}
            runtimeReady={replenishmentRuntimeReady}
            countryCode={countryCode}
          />
          {dashboardRecommendations?.items.length ? (
            <ProductRecommendations
              handle={dashboardRecommendations.handle}
              items={dashboardRecommendations.items}
              eyebrow="Supply and reorder options"
              countryCode={countryCode}
            />
          ) : null}
        </div>
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
