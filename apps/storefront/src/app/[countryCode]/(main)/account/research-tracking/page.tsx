import { randomUUID } from "node:crypto"

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  retrieveCurrentResearchDeletionRequest,
  retrievePurchasedItemCandidates,
  retrieveResearchProfile,
  retrieveResearchProtocolAccesses,
  retrieveResearchCalculationSnapshots,
  retrieveResearchPersonalGoals,
  retrieveResearchJournalEntries,
  retrieveResearchPrivateRecordsConfiguration,
  retrieveResearchMeasurements,
  retrieveResearchMeasurementSummary,
  retrieveResearchTimeline,
  retrieveResearchOccurrences,
  retrieveResearchNotifications,
  retrieveResearchRoutineLogs,
  retrieveResearchRoutines,
  retrieveResearchReplenishmentProjections,
  retrieveResearchTrackingConfiguration,
  retrieveTrackedResearchMaterials,
  type PurchasedItemCandidate,
  type ResearchPrivacyRequest,
  type ResearchJournalEntry,
  type ResearchPrivateRecordsConfiguration,
  type ResearchMeasurement,
  type ResearchMeasurementSummary,
  type ResearchTimelineEvent,
  type ResearchProfile,
  type ResearchProtocolAccess,
  type ResearchCalculationSnapshot,
  type ResearchPersonalGoal,
  type ResearchOccurrence,
  type ResearchNotification,
  type ResearchRoutine,
  type ResearchRoutineLog,
  type ResearchReplenishmentProjection,
  type ResearchTrackingConfiguration,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import {
  createPurchasedActivationSubmissionKeys,
  createResearchSubmissionKeys,
  createRoutineSubmissionKeys,
} from "@lib/research-tracking-idempotency"
import ResearchTracking from "@modules/account/components/research-tracking"
import {
  listResearchProtocolRecommendations,
  type ResearchProtocolRecommendation,
} from "@lib/data/research-protocols"
import { listProducts } from "@lib/data/products"
import type { ResearchRecommendationItem } from "@modules/research-protocols/product-recommendations"
import { retrieveRewardsSummary, type RewardsSummary } from "@lib/data/rewards"

export const metadata: Metadata = {
  title: "Research Hub | Clinical Research Workspace",
  description: "Private research protocol organization, dosing schedules, stability telemetry, and data controls.",
}

const unavailableConfiguration: ResearchTrackingConfiguration = {
  available: false,
  purchased_activation_available: false,
  consent_version: null,
  notice_url: null,
  default_timezone: "Asia/Manila",
  supported_locales: ["en-PH"],
  journal: {
    available: false,
    consent_version: null,
    notice_url: null,
    effective_at: null,
  },
}

const unavailablePrivateRecords: ResearchPrivateRecordsConfiguration = {
  journal: {
    available: false,
    consent_version: null,
    notice_url: null,
    effective_at: null,
    current_consent: null,
  },
  measurements: {
    available: false,
    allowlist_version: null,
    consent_version: null,
    notice_url: null,
    effective_at: null,
    supported_metrics: [],
    current_consent: null,
  },
}

function localDateInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  )

  return `${values.year}-${values.month}-${values.day}`
}

function addCalendarDays(localDate: string, days: number): string {
  const date = new Date(`${localDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

async function loadProtocolRecommendations(input: {
  countryCode: string
  handle: string
  placement:
    | "my_protocols"
    | "dashboard"
    | "today"
    | "calendar"
    | "replenishment"
    | "after_activity"
  excludedProductIds: string[]
}): Promise<ResearchRecommendationItem[]> {
  const recommendationResult = await listResearchProtocolRecommendations({
    handle: input.handle,
    placement: input.placement,
    excludeProductIds: input.excludedProductIds,
  }).catch(() => ({ recommendations: [] as ResearchProtocolRecommendation[] }))

  if (!recommendationResult.recommendations.length) {
    return []
  }

  const { response } = await listProducts({
    countryCode: input.countryCode,
    queryParams: {
      id: recommendationResult.recommendations.map((item) => item.product_id),
      limit: recommendationResult.recommendations.length,
    },
  }).catch(() => ({ response: { products: [] } }))
  const productsById = new Map(
    response.products.map((product) => [product.id, product]),
  )

  return recommendationResult.recommendations.flatMap((recommendation) => {
    const product = productsById.get(recommendation.product_id)
    return product ? [{ recommendation, product }] : []
  })
}

export default async function ResearchTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    calendarDate?: string
    journalPage?: string
    section?: string
    mass?: string
    unit?: string
    name?: string
  }>
}) {
  const { countryCode } = await params
  const resolvedSearchParams = await searchParams
  const requestedJournalPage = Number(resolvedSearchParams.journalPage ?? "1")
  const section = [
    "overview",
    "today",
    "calendar",
    "schedule",
    "supplies",
    "protocols",
    "routines",
    "calculator",
    "progress",
    "journal",
    "timeline",
    "rewards",
  ].includes(resolvedSearchParams.section || "")
    ? resolvedSearchParams.section as "overview" | "today" | "calendar" | "schedule" | "supplies" | "protocols" | "routines" | "calculator" | "progress" | "journal" | "timeline" | "rewards"
    : "overview"
  const requestedCalendarDate = /^\d{4}-\d{2}-\d{2}$/.test(
    resolvedSearchParams.calendarDate || "",
  )
    ? resolvedSearchParams.calendarDate!
    : null
  const calculatorParams = {
    mass: typeof resolvedSearchParams.mass === "string" ? resolvedSearchParams.mass : undefined,
    unit: typeof resolvedSearchParams.unit === "string" ? resolvedSearchParams.unit : undefined,
    name: typeof resolvedSearchParams.name === "string" ? resolvedSearchParams.name : undefined,
  }
  const journalPage =
    Number.isInteger(requestedJournalPage) && requestedJournalPage > 0
      ? requestedJournalPage
      : 1
  const journalLimit = 10
  const journalOffset = (journalPage - 1) * journalLimit
  let configuration = unavailableConfiguration
  let profile: ResearchProfile | null = null
  let privacyRequest: ResearchPrivacyRequest | null = null
  let protocolAccesses: ResearchProtocolAccess[] = []
  let calculations: ResearchCalculationSnapshot[] = []
  let goals: ResearchPersonalGoal[] = []
  let routineStreak = 0
  let rewards: RewardsSummary | null = null
  let protocolRuntimeReady = true
  let runtimeReady = true
  let purchasedItems: PurchasedItemCandidate[] = []
  let trackedMaterials: TrackedResearchMaterial[] = []
  let purchasedRuntimeReady = true
  let routines: ResearchRoutine[] = []
  let occurrences: ResearchOccurrence[] = []
  let notifications: ResearchNotification[] = []
  let notificationUnreadCount = 0
  let routineLogs: ResearchRoutineLog[] = []
  let routineToday = localDateInTimezone(new Date(), "Asia/Manila")
  let calendarAnchor = routineToday
  let routineRuntimeReady = true
  let replenishmentProjections: ResearchReplenishmentProjection[] = []
  let replenishmentRuntimeReady = true
  let journalEntries: ResearchJournalEntry[] = []
  let journalCount = 0
  let privateRecords = unavailablePrivateRecords
  let journalRuntimeReady = true
  let measurements: ResearchMeasurement[] = []
  let measurementSummary: ResearchMeasurementSummary = {
    metric_type: "weight",
    summary: null,
    points: [],
  }
  let measurementRuntimeReady = true
  let timeline: ResearchTimelineEvent[] = []
  let timelineRuntimeReady = true
  let myProtocolsRecommendations: {
    handle: string
    items: ResearchRecommendationItem[]
  } | null = null
  let dashboardRecommendations: {
    handle: string
    items: ResearchRecommendationItem[]
  } | null = null
  let contextRecommendations: {
    handle: string
    items: ResearchRecommendationItem[]
  } | null = null

  try {
    configuration = await retrieveResearchTrackingConfiguration()
  } catch {
    runtimeReady = false
  }

  if (runtimeReady && !configuration.available) {
    notFound()
  }

  try {
    if (!runtimeReady) {
      throw new Error("Research & Tracking configuration is unavailable")
    }

    profile = await retrieveResearchProfile()
    privacyRequest = profile
      ? await retrieveCurrentResearchDeletionRequest()
      : null

    const privateTrackingReady =
      profile?.status === "active" &&
      profile.consent_version === configuration.consent_version

    if (privateTrackingReady) {
      try {
        trackedMaterials = await retrieveTrackedResearchMaterials()

        if (configuration.purchased_activation_available) {
          purchasedItems = await retrievePurchasedItemCandidates()
        }
      } catch {
        purchasedRuntimeReady = false
      }
    }

    if (profile) {
      try {
        const [goalResult, rewardResult] = await Promise.all([
          retrieveResearchPersonalGoals(),
          retrieveRewardsSummary().catch(() => null),
        ])
        goals = goalResult.goals
        routineStreak = goalResult.streaks.routine
        rewards = rewardResult
      } catch {
        goals = []
      }
      try {
        protocolAccesses = await retrieveResearchProtocolAccesses()
        calculations = await retrieveResearchCalculationSnapshots()

        const newestProtocol = protocolAccesses[0]
        if (newestProtocol) {
          const excludedProductIds = Array.from(
            new Set(protocolAccesses.map((access) => access.product.id)),
          )
          const contextPlacement = section === "today"
            ? "today"
            : section === "calendar"
              ? "calendar"
              : "replenishment"
          const [myProtocolItems, dashboardItems, contextItems] = await Promise.all([
            loadProtocolRecommendations({
              countryCode,
              handle: newestProtocol.protocol_handle,
              placement: "my_protocols",
              excludedProductIds,
            }),
            loadProtocolRecommendations({
              countryCode,
              handle: newestProtocol.protocol_handle,
              placement: "dashboard",
              excludedProductIds,
            }),
            loadProtocolRecommendations({
              countryCode,
              handle: newestProtocol.protocol_handle,
              placement: contextPlacement,
              excludedProductIds,
            }),
          ])
          myProtocolsRecommendations = {
            handle: newestProtocol.protocol_handle,
            items: myProtocolItems,
          }
          dashboardRecommendations = {
            handle: newestProtocol.protocol_handle,
            items: dashboardItems,
          }
          contextRecommendations = {
            handle: newestProtocol.protocol_handle,
            items: contextItems,
          }
        }
      } catch {
        protocolRuntimeReady = false
      }

      try {
        privateRecords = await retrieveResearchPrivateRecordsConfiguration()
        const journalPageResult = await retrieveResearchJournalEntries({
          limit: journalLimit,
          offset: journalOffset,
        })
        journalEntries = journalPageResult.entries
        journalCount = journalPageResult.count
        measurements = await retrieveResearchMeasurements()
        measurementSummary = await retrieveResearchMeasurementSummary("weight")
        timeline = await retrieveResearchTimeline()
      } catch {
        journalRuntimeReady = false
        measurementRuntimeReady = false
        timelineRuntimeReady = false
      }

      try {
        routines = await retrieveResearchRoutines()
        routineLogs = await retrieveResearchRoutineLogs()
        replenishmentProjections = await retrieveResearchReplenishmentProjections()

        if (profile.status === "active") {
          routineToday = localDateInTimezone(new Date(), profile.timezone)
          calendarAnchor = requestedCalendarDate ?? routineToday
          const calendarDate = new Date(`${calendarAnchor}T00:00:00.000Z`)
          const calendarStart = new Date(
            Date.UTC(
              calendarDate.getUTCFullYear(),
              calendarDate.getUTCMonth(),
              1,
            ),
          )
          const calendarEnd = new Date(
            Date.UTC(
              calendarDate.getUTCFullYear(),
              calendarDate.getUTCMonth() + 1,
              0,
            ),
          )
          const isMonthView = section === "calendar" || section === "routines" || section === "schedule" || section === "overview"
          occurrences = await retrieveResearchOccurrences(
            isMonthView
              ? calendarStart.toISOString().slice(0, 10)
              : routineToday,
            isMonthView
              ? calendarEnd.toISOString().slice(0, 10)
              : addCalendarDays(routineToday, 6),
          )
          const notificationResult = await retrieveResearchNotifications()
          notifications = notificationResult.notifications
          notificationUnreadCount = notificationResult.unread_count
        }
      } catch {
        routineRuntimeReady = false
        replenishmentRuntimeReady = false
      }
    }
  } catch {
    runtimeReady = false
  }

  return (
    <ResearchTracking
      section={section}
      configuration={configuration}
      countryCode={countryCode}
      profile={profile}
      protocolAccesses={protocolAccesses}
      calculations={calculations}
      calculationSubmissionKey={randomUUID()}
      calculatorParams={calculatorParams}
      goals={goals}
      routineStreak={routineStreak}
      rewards={rewards}
      protocolRuntimeReady={protocolRuntimeReady}
      protocolRoutineKeys={Object.fromEntries(
        protocolAccesses.map((access) => [access.profile_access_id, randomUUID()]),
      )}
      privacyRequest={privacyRequest}
      purchasedActivationKeys={createPurchasedActivationSubmissionKeys(
        purchasedItems.map((item) => item.line_item_id),
        randomUUID,
      )}
      purchasedItems={purchasedItems}
      purchasedRuntimeReady={purchasedRuntimeReady}
      occurrences={occurrences}
      notifications={notifications}
      notificationUnreadCount={notificationUnreadCount}
      journalEntries={journalEntries}
      journalCount={journalCount}
      journalLimit={journalLimit}
      journalOffset={journalOffset}
      journalConsentKey={randomUUID()}
      privateRecords={privateRecords}
      journalRuntimeReady={journalRuntimeReady}
      measurements={measurements}
      measurementSummary={measurementSummary}
      measurementRuntimeReady={measurementRuntimeReady}
      measurementSubmissionKeys={{
        consent: randomUUID(),
        create: randomUUID(),
        byEntry: Object.fromEntries(
          measurements.map((measurement) => [measurement.measurement_entry_id, randomUUID()]),
        ),
      }}
      timeline={timeline}
      timelineRuntimeReady={timelineRuntimeReady}
      journalSubmissionKeys={{
        create: randomUUID(),
        byEntry: Object.fromEntries(
          journalEntries.map((entry) => [
            entry.journal_entry_id,
            {
              revise: randomUUID(),
              transition: randomUUID(),
            },
          ]),
        ),
      }}
      routineLogs={routineLogs}
      replenishmentProjections={replenishmentProjections}
      replenishmentRuntimeReady={replenishmentRuntimeReady}
      routineToday={routineToday}
      calendarAnchor={calendarAnchor}
      routineRuntimeReady={routineRuntimeReady}
      routines={routines}
      routineSubmissionKeys={createRoutineSubmissionKeys(
        routines.map((routine) => routine.routine_id),
        occurrences.map((occurrence) => occurrence.occurrence_id),
        routineLogs.map((log) => log.log_id),
        randomUUID,
      )}
      runtimeReady={runtimeReady}
      submissionKeys={createResearchSubmissionKeys(randomUUID)}
      trackedMaterials={trackedMaterials}
      myProtocolsRecommendations={myProtocolsRecommendations}
      dashboardRecommendations={dashboardRecommendations}
      contextRecommendations={contextRecommendations}
    />
  )
}
