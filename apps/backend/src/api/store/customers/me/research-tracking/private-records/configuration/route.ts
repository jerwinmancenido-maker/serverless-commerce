import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchJournalConfiguration,
  getResearchTrackingCustomerConfiguration,
} from "../../../../../../../modules/research-tracking/config"
import { retrieveOwnedResearchJournalConsentStatus } from "../../../../../../../modules/research-tracking/queries/journal"
import { setResearchPrivateNoStore } from "../../utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const trackingConfiguration = getResearchTrackingCustomerConfiguration()
  const journalConfiguration = getResearchJournalConfiguration()
  const consent =
    trackingConfiguration.available && journalConfiguration.available
    ? await retrieveOwnedResearchJournalConsentStatus({
        container: req.scope,
        customerId: req.auth_context.actor_id,
        activeConsentVersion: journalConfiguration.activeConsentVersion,
        activeNoticeSha256: journalConfiguration.noticeSha256,
      })
    : null

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
        available: false,
        allowlist_version: null,
      },
    },
  })
}
