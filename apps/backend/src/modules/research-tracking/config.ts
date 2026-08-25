import { MedusaError } from "@medusajs/framework/utils"

import {
  normalizeResearchConsentVersion,
  normalizeResearchNoticeSha256,
} from "./contracts/ownership"

export type ResearchTrackingCustomerConfiguration =
  | {
      available: false
      activeConsentVersion: null
      noticeSha256: null
      noticeUrl: null
    }
  | {
      available: true
      activeConsentVersion: string
      noticeSha256: string
      noticeUrl: string
    }

type ResearchTrackingEnvironment = Partial<Pick<
  NodeJS.ProcessEnv,
  | "RESEARCH_TRACKING_CUSTOMER_API_ENABLED"
  | "RESEARCH_TRACKING_CONSENT_VERSION"
  | "RESEARCH_TRACKING_NOTICE_SHA256"
  | "RESEARCH_TRACKING_NOTICE_URL"
>>

function invalidConfiguration(message: string): never {
  throw new MedusaError(
    MedusaError.Types.UNEXPECTED_STATE,
    `Research & Tracking configuration is invalid: ${message}`,
  )
}

export function getResearchTrackingCustomerConfiguration(
  environment: ResearchTrackingEnvironment = process.env,
): ResearchTrackingCustomerConfiguration {
  if (environment.RESEARCH_TRACKING_CUSTOMER_API_ENABLED !== "true") {
    return {
      available: false,
      activeConsentVersion: null,
      noticeSha256: null,
      noticeUrl: null,
    }
  }

  const version = environment.RESEARCH_TRACKING_CONSENT_VERSION
  const digest = environment.RESEARCH_TRACKING_NOTICE_SHA256
  const noticeUrlValue = environment.RESEARCH_TRACKING_NOTICE_URL

  if (!version || !digest || !noticeUrlValue) {
    invalidConfiguration(
      "enabled customer access requires consent version, notice digest, and notice URL",
    )
  }

  let noticeUrl: URL

  try {
    noticeUrl = new URL(noticeUrlValue)
  } catch {
    invalidConfiguration("notice URL must be an absolute URL")
  }

  if (
    noticeUrl.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(noticeUrl.hostname)
  ) {
    invalidConfiguration("notice URL must use HTTPS outside local development")
  }

  try {
    return {
      available: true,
      activeConsentVersion: normalizeResearchConsentVersion(version),
      noticeSha256: normalizeResearchNoticeSha256(digest),
      noticeUrl: noticeUrl.toString(),
    }
  } catch {
    invalidConfiguration("consent version or notice digest has an invalid format")
  }
}
