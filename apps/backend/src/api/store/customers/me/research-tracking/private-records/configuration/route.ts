import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchJournalConfiguration,
  getResearchTrackingCustomerConfiguration,
  getResearchMeasurementConfiguration,
} from "../../../../../../../modules/research-tracking/config"
import { retrieveOwnedResearchJournalConsentStatus } from "../../../../../../../modules/research-tracking/queries/journal"
import { setResearchPrivateNoStore } from "../../utils"
import { RESEARCH_TRACKING_MODULE } from "../../../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../../../modules/research-tracking/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const trackingConfiguration = getResearchTrackingCustomerConfiguration()
  const journalConfiguration = getResearchJournalConfiguration()
  const measurementConfiguration = getResearchMeasurementConfiguration()
  const consent =
    trackingConfiguration.available && journalConfiguration.available
    ? await retrieveOwnedResearchJournalConsentStatus({
        container: req.scope,
        customerId: req.auth_context.actor_id,
        activeConsentVersion: journalConfiguration.activeConsentVersion,
        activeNoticeSha256: journalConfiguration.noticeSha256,
      })
    : null
  const trackingService = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [profile] = await trackingService.listResearchProfiles(
    { customer_id: req.auth_context.actor_id },
    { take: 1 },
  )
  const [measurementConsent] = profile
    ? await trackingService.listResearchMeasurementConsentEvents(
        { profile_id: profile.id },
        { order: { occurred_at: "DESC" }, take: 1 },
      )
    : []

  res.json({
    private_records: {
      journal: journalConfiguration.available
        ? {
            available: true,
            consent_version: journalConfiguration.activeConsentVersion,
            notice_url: journalConfiguration.noticeUrl,
            effective_at: journalConfiguration.effectiveAt,
            current_consent: consent,
          }
        : {
            available: false,
            consent_version: null,
            notice_url: null,
            effective_at: null,
            current_consent: consent,
          },
      measurements: {
        available: measurementConfiguration.available,
        allowlist_version: measurementConfiguration.allowlistVersion,
        consent_version: measurementConfiguration.activeConsentVersion,
        notice_url: measurementConfiguration.noticeUrl,
        effective_at: measurementConfiguration.effectiveAt,
        supported_metrics: measurementConfiguration.available
          ? [
              { key: "weight", units: ["kg", "lb"] },
              { key: "waist", units: ["cm", "in"] },
              { key: "body_fat", units: ["percent"] },
            ]
          : [],
        current_consent: measurementConsent
          ? {
              event_type: measurementConsent.event_type,
              consent_version: measurementConsent.consent_version,
              occurred_at: measurementConsent.occurred_at,
              is_current:
                measurementConfiguration.available &&
                measurementConsent.event_type === "accepted" &&
                measurementConsent.consent_version ===
                  measurementConfiguration.activeConsentVersion &&
                measurementConsent.notice_sha256 ===
                  measurementConfiguration.noticeSha256,
            }
          : null,
      },
    },
  })
}
