import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getResearchTrackingCustomerConfiguration } from "../../../../../../modules/research-tracking/config"
import { setResearchPrivateNoStore } from "../utils"

export async function GET(
  _req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const configuration = getResearchTrackingCustomerConfiguration()

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
        }
      : {
          available: false,
          purchased_activation_available: false,
          consent_version: null,
          notice_url: null,
          default_timezone: "Asia/Manila",
          supported_locales: ["en-PH"],
        },
  })
}
