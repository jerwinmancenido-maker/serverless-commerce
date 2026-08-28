import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  getResearchJournalConfiguration,
  getResearchTrackingCustomerConfiguration,
} from "../../../../../../modules/research-tracking/config"
import { setResearchPrivateNoStore } from "../utils"

export async function GET(
  _req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()
  const journalConfiguration = getResearchJournalConfiguration()

  res.json({
    research_tracking: configuration.available
      ? {
          available: true,
          purchased_activation_available:
            configuration.purchasedActivationAvailable,
          consent_version: configuration.activeConsentVersion,
          notice_url: configuration.noticeUrl,
          default_timezone: "Asia/Manila",
          supported_locales: ["en-PH"],
          journal: journalConfiguration.available
            ? {
                available: true,
                consent_version:
                  journalConfiguration.activeConsentVersion,
                notice_url: journalConfiguration.noticeUrl,
                effective_at: journalConfiguration.effectiveAt,
              }
            : {
                available: false,
                consent_version: null,
                notice_url: null,
                effective_at: null,
              },
        }
      : {
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
        },
  })
}
