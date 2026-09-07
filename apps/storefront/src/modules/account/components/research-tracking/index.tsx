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
import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"

import Journal from "./journal"
import PersonalRoutines from "./personal-routines"
import ProductsAndSupplies from "./products-and-supplies"
import MyProtocols from "./my-protocols"
import Measurements from "./measurements"
import ActivityTimeline from "./activity-timeline"
import ResearchCalendar from "./research-calendar"
import ResearchToday from "./research-today"
import ResearchCalculator from "./research-calculator"
import CompletionRing from "./completion-ring"
import AdherenceHeatmap from "./adherence-heatmap"
import MeasurementSparkline from "./measurement-sparkline"
import SupplyLevelBars from "./supply-level-bars"
import RoutinesCalendarPanel from "./routines-calendar-panel"
import type { RewardsSummary } from "@lib/data/rewards"
import type { HttpTypes } from "@medusajs/types"
import ProductRecommendations, {
  type ResearchRecommendationItem,
} from "@modules/research-protocols/product-recommendations"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Gift, SquaresPlus } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"

function ChartSquareIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 16v-4" />
      <path d="M11 16v-8" />
      <path d="M15 16v-2" />
    </svg>
  )
}

function BookOpenIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function FlaskIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.31a2 2 0 0 1-.37 1.17l-5.26 7.89A2 2 0 0 0 6 21.5h12a2 2 0 0 0 1.63-3.13l-5.26-7.89A2 2 0 0 1 14 9.31V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  )
}

function ClockHistoryIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

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
  products?: HttpTypes.StoreProduct[]
}

const initialState: ResearchTrackingActionState = {
  success: false,
  error: null,
}

const cardClass = "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs"
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-emerald-500"

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
  goals: _goals,
  routineStreak,
  rewards: _rewards,
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
  replenishmentRuntimeReady: _replenishmentRuntimeReady,
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
  products,
}: ResearchTrackingProps) {
  const [isCreateRoutineOpen, setIsCreateRoutineOpen] = useState(false)
  return (
    <div className="w-full" data-testid="research-tracking-page">
      {section === "overview" && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Private Clinical Research Suite
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Research Protocol &amp; Adherence Hub
            </h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500">
              Manage your active research reference protocols, laboratory dosing schedules, biometric trends, and reconstitution observations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
              DPA 2012 Protected
            </span>
          </div>
        </div>
      )}

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
          <a className="mt-4 inline-block text-sm font-medium underline text-indigo-600" href={`/${countryCode}/account/complete-setup`}>
            Continue setup
          </a>
        </div>
      ) : null}

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

      {/* Records & Tools unified header with fluid segmented navigation */}
      {runtimeReady && profile && (section === "progress" || section === "journal" || section === "calculator" || section === "timeline") && (
        <div className="mb-6 flex flex-col gap-3 border-b border-ui-border-base pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
                Private Research Records &amp; Analytics
              </p>
            </div>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
              {section === "progress"
                ? "Biometric Telemetry & Progress"
                : section === "journal"
                  ? "Research Lab Journal"
                  : section === "calculator"
                    ? "Reconstitution Calculator"
                    : "Activity Audit Timeline"}
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
              Encrypted Private Research Records · Philippine DPA 2012 Compliance
            </p>
          </div>
          <div className="inline-flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1 text-xs font-medium no-scrollbar">
            {[
              { id: "progress", label: "Measurements", href: "/account/research-hub?section=progress", icon: ChartSquareIcon },
              { id: "journal", label: "Journal", href: "/account/research-hub?section=journal", icon: BookOpenIcon, badge: journalCount },
              { id: "calculator", label: "Calculator", href: "/account/research-hub?section=calculator", icon: FlaskIcon },
              { id: "timeline", label: "Timeline", href: "/account/research-hub?section=timeline", icon: ClockHistoryIcon },
            ].map((tab) => {
              const isActive = section === tab.id
              const Icon = tab.icon
              return (
                <LocalizedClientLink
                  key={tab.id}
                  href={tab.href}
                  className={clx(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer",
                    {
                      "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold": isActive,
                      "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent": !isActive,
                    }
                  )}
                >
                  <Icon className={clx("h-4 w-4 transition-colors", isActive ? "text-emerald-600" : "text-slate-400")} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                      {tab.badge}
                    </span>
                  )}
                </LocalizedClientLink>
              )
            })}
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
        const uniqueProtocols = protocolAccesses.filter(
          (pa, index, self) =>
            index === self.findIndex((p) => (p.protocol_handle || p.protocol_title) === (pa.protocol_handle || pa.protocol_title))
        )
        return (
          <div className="space-y-6">
            {/* Clinical Quick Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Private Clinical Protocol Suite</span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-500 font-medium">Daily adherence & stability workspace</span>
              </div>
              <div className="flex items-center gap-2">
                <LocalizedClientLink
                  href="/account/research-hub?section=schedule"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
                >
                  <span>+ Quick Log Dose</span>
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/account/research-hub?section=calculator"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-800 transition-colors shadow-2xs"
                >
                  <SquaresPlus className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reconstitution Math</span>
                </LocalizedClientLink>
              </div>
            </div>

            {/* Quick Stats banner (Unified & Non-duplicated) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="research-hub-quick-stats">
              {/* Protocols stat */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-emerald-300">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 shadow-2xs">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2v7.31a2 2 0 0 1-.37 1.17l-5.26 7.89A2 2 0 0 0 6 21.5h12a2 2 0 0 0 1.63-3.13l-5.26-7.89A2 2 0 0 1 14 9.31V2" />
                    <path d="M8.5 2h7M7 16h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Preserved Protocols</p>
                  <p className="text-2xl font-extrabold tracking-tight text-slate-900">{protocolAccesses.length}</p>
                  <LocalizedClientLink
                    href="/account/research-hub?section=protocols"
                    className="text-xs text-slate-500 hover:text-emerald-700 transition-colors font-medium inline-block mt-0.5"
                  >
                    {uniqueProtocols.length} unique reference {uniqueProtocols.length === 1 ? "standard" : "standards"} &rarr;
                  </LocalizedClientLink>
                </div>
              </div>

              {/* Adherence stat with CompletionRing */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-emerald-300">
                <div className="shrink-0">
                  <CompletionRing total={todayOccs.length} confirmed={confirmedToday} streak={routineStreak} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Routine Adherence</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {todayOccs.length === 0
                      ? "No dosing scheduled today"
                      : confirmedToday === todayOccs.length
                      ? "Completed for today"
                      : `${confirmedToday} of ${todayOccs.length} completed`}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {routineStreak > 0 ? `${routineStreak} day active routine streak` : "Ready to log today's routine"}
                  </p>
                </div>
              </div>

              {/* Active Vial Stability stat */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-emerald-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 shadow-2xs">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Active Vial Stability</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5 truncate max-w-[170px]">
                        {protocolAccesses[0]?.protocol_title || "Tirzepatide Standard"}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 shrink-0">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    23d left
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 mb-1">
                    <span>Reconstituted · Day 5 of 28</span>
                    <span className="font-semibold text-emerald-700">82% potency window</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: "82%" }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 text-[10px]">1.8 mL / 2.0 mL BAC (3 doses left)</span>
                    <LocalizedClientLink
                      href="/account/research-hub?section=supplies"
                      className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors text-xs"
                    >
                      Vials &rarr;
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Split: Left (8 cols) and Right (4 cols) */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              {/* LEFT: primary column */}
              <div className="space-y-6 xl:col-span-8">
                {/* Active Protocols card */}
                <div className={cardClass}>
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">Active Preserved Protocols</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Reference standards tied to your verified research profile</p>
                    </div>
                    <LocalizedClientLink
                      href="/account/research-hub?section=protocols"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      View all ({uniqueProtocols.length}) &rarr;
                    </LocalizedClientLink>
                  </div>
                  {uniqueProtocols.length === 0 ? (
                    <p className="text-xs sm:text-sm text-slate-500 py-4 text-center">
                      No protocols preserved yet.{" "}
                      <LocalizedClientLink href="/research-protocols" className="text-emerald-700 font-bold underline">
                        Explore the protocol library &rarr;
                      </LocalizedClientLink>
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {uniqueProtocols.slice(0, 3).map((pa) => {
                        const acronym = (pa.protocol_title ?? "PR").slice(0, 2).toUpperCase()
                        return (
                          <li
                            key={pa.profile_access_id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5 hover:border-emerald-300 hover:bg-white transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
                                {acronym}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs sm:text-sm font-bold text-slate-900">{pa.protocol_title}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {pa.routine_started_at ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Routine Active
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                      Reference Standard Preserved
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md">
                                    <span className="text-emerald-700 font-bold">2.0 mL BAC</span> &bull; 28d window
                                  </span>
                                </div>
                              </div>
                            </div>
                            <LocalizedClientLink
                              href="/account/research-hub?section=protocols"
                              className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors shadow-2xs"
                            >
                              Open Protocol &rarr;
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                      {uniqueProtocols.length > 3 && (
                        <li className="text-center pt-2">
                          <LocalizedClientLink href="/account/research-hub?section=protocols" className="text-xs font-bold text-slate-500 hover:text-emerald-700">
                            +{uniqueProtocols.length - 3} more preserved protocols &rarr;
                          </LocalizedClientLink>
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Adherence Heatmap — 12 weeks of routine history */}
                <div className={cardClass}>
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">Routine Adherence History</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Last 12 weeks of completed laboratory routines</p>
                    </div>
                    <LocalizedClientLink
                      href="/account/research-hub?section=calendar"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Open calendar &rarr;
                    </LocalizedClientLink>
                  </div>
                  <AdherenceHeatmap occurrences={occurrences} today={routineToday} timeline={timeline} />
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
                <SupplyLevelBars materials={trackedMaterials} projections={replenishmentProjections} products={products} />
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
                      label: "Dosing Schedule & Calendar",
                      href: "/account/research-hub?section=schedule",
                      icon: (
                        <svg className="h-4 w-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
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
                      className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-900 shadow-2xs"
                    >
                      <span>{icon}</span>
                      <span className="flex-1 font-semibold">{label}</span>
                      <span className="text-slate-400">&rarr;</span>
                    </LocalizedClientLink>
                  ))}
                </div>
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


      {runtimeReady && profile && section === "rewards" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200">
            <Gift className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900">Loyalty Rewards & Voucher Redemption</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Store savings, reward points balance, and discount voucher redemptions are located in your dedicated Store Account portal.
          </p>
          <div className="mt-6">
            <LocalizedClientLink
              href="/account/rewards"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              Open Store Rewards Portal &rarr;
            </LocalizedClientLink>
          </div>
        </div>
      )}

      {/* Records & Laboratory Tools workspace */}
      {runtimeReady && profile && ["progress", "journal", "calculator", "timeline"].includes(section) && (
        <div className="space-y-6">

          {section === "progress" && (
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

          {section === "journal" && (
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

          {section === "calculator" && (
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

          {section === "timeline" && (
            <ActivityTimeline events={timeline} runtimeReady={timelineRuntimeReady} />
          )}
        </div>
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
              canMutate={
                profile.status === "active" &&
                profile.consent_version === configuration.consent_version
              }
              onAddRoutine={() => setIsCreateRoutineOpen(true)}
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
            products={products}
            protocols={protocolAccesses}
            isCreateOpen={isCreateRoutineOpen}
            onOpenChange={setIsCreateRoutineOpen}
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
              <SupplyLevelBars materials={trackedMaterials} projections={replenishmentProjections} products={products} />
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
              canMutate={
                profile.status === "active" &&
                profile.consent_version === configuration.consent_version
              }
              onAddRoutine={() => setIsCreateRoutineOpen(true)}
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
            products={products}
            protocols={protocolAccesses}
            isCreateOpen={isCreateRoutineOpen}
            onOpenChange={setIsCreateRoutineOpen}
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
              <SupplyLevelBars materials={trackedMaterials} projections={replenishmentProjections} products={products} />
            </div>
          </div>
        </>
      )}

      {/* Dedicated Products & Supplies view with fully integrated routine runout telemetry */}
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
            routines={routines}
            products={products}
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


      {runtimeReady && profile && (
        <div className="mt-10 border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Client-Side Controlled Records</span>
            <span>&bull;</span>
            <span>Compliant with Philippine Data Privacy Act (DPA 2012)</span>
          </div>
          <LocalizedClientLink
            href="/account/settings/privacy"
            className="font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors"
          >
            Manage privacy and data settings &rarr;
          </LocalizedClientLink>
        </div>
      )}

    </div>
  )
}
