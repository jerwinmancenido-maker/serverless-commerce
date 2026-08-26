import { randomUUID } from "node:crypto"

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  retrieveCurrentResearchDeletionRequest,
  retrievePurchasedItemCandidates,
  retrieveResearchProfile,
  retrieveResearchTrackingConfiguration,
  retrieveTrackedResearchMaterials,
  type PurchasedItemCandidate,
  type ResearchPrivacyRequest,
  type ResearchProfile,
  type ResearchTrackingConfiguration,
  type TrackedResearchMaterial,
} from "@lib/data/research-tracking"
import {
  createPurchasedActivationSubmissionKeys,
  createResearchSubmissionKeys,
} from "@lib/research-tracking-idempotency"
import ResearchTracking from "@modules/account/components/research-tracking"

export const metadata: Metadata = {
  title: "Research & Tracking",
  description: "Private research organization and data controls.",
}

const unavailableConfiguration: ResearchTrackingConfiguration = {
  available: false,
  purchased_activation_available: false,
  consent_version: null,
  notice_url: null,
  default_timezone: "Asia/Manila",
  supported_locales: ["en-PH"],
}

export default async function ResearchTrackingPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  let configuration = unavailableConfiguration
  let profile: ResearchProfile | null = null
  let privacyRequest: ResearchPrivacyRequest | null = null
  let runtimeReady = true
  let purchasedItems: PurchasedItemCandidate[] = []
  let trackedMaterials: TrackedResearchMaterial[] = []
  let purchasedRuntimeReady = true

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

    const purchasedTrackingReady =
      profile?.status === "active" &&
      profile.consent_version === configuration.consent_version &&
      configuration.purchased_activation_available

    if (purchasedTrackingReady) {
      try {
        ;[purchasedItems, trackedMaterials] = await Promise.all([
          retrievePurchasedItemCandidates(),
          retrieveTrackedResearchMaterials(),
        ])
      } catch {
        purchasedRuntimeReady = false
      }
    }
  } catch {
    runtimeReady = false
  }

  return (
    <ResearchTracking
      configuration={configuration}
      countryCode={countryCode}
      profile={profile}
      privacyRequest={privacyRequest}
      purchasedActivationKeys={createPurchasedActivationSubmissionKeys(
        purchasedItems.map((item) => item.line_item_id),
        randomUUID,
      )}
      purchasedItems={purchasedItems}
      purchasedRuntimeReady={purchasedRuntimeReady}
      runtimeReady={runtimeReady}
      submissionKeys={createResearchSubmissionKeys(randomUUID)}
      trackedMaterials={trackedMaterials}
    />
  )
}
