import { randomUUID } from "node:crypto"

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  retrieveCurrentResearchDeletionRequest,
  retrieveResearchProfile,
  retrieveResearchTrackingConfiguration,
  type ResearchPrivacyRequest,
  type ResearchProfile,
  type ResearchTrackingConfiguration,
} from "@lib/data/research-tracking"
import { createResearchSubmissionKeys } from "@lib/research-tracking-idempotency"
import ResearchTracking from "@modules/account/components/research-tracking"

export const metadata: Metadata = {
  title: "Research & Tracking",
  description: "Private research organization and data controls.",
}

const unavailableConfiguration: ResearchTrackingConfiguration = {
  available: false,
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
  } catch {
    runtimeReady = false
  }

  return (
    <ResearchTracking
      configuration={configuration}
      countryCode={countryCode}
      profile={profile}
      privacyRequest={privacyRequest}
      runtimeReady={runtimeReady}
      submissionKeys={createResearchSubmissionKeys(randomUUID)}
    />
  )
}
