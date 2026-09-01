import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_TRACKING_MODULE } from "../research-tracking"
import type ResearchTrackingModuleService from "../research-tracking/service"
import { RESEARCH_CONTENT_MODULE } from "."
import type { ResearchProtocolVisibilityPolicyValue } from "./protocol-access"
import {
  isProtocolCommunityEligible,
  normalizeResearchProtocolVisibilityPolicy,
} from "./protocol-access"
import type ResearchContentModuleService from "./service"

type ResolveContainer = { resolve: <T = unknown>(key: string) => T }

export type CustomerProtocolEligibility = {
  series: any
  policy: ResearchProtocolVisibilityPolicyValue
  profile: any | null
  purchaser: boolean
}

export const getCustomerProtocolEligibility = async ({
  container,
  customerId,
  protocolHandle,
  seriesId,
}: {
  container: ResolveContainer
  customerId: string
  protocolHandle?: string
  seriesId?: string
}): Promise<CustomerProtocolEligibility> => {
  const content = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const [series] = await content.listResearchProtocolSeries(
    {
      ...(seriesId ? { id: seriesId } : {}),
      ...(protocolHandle ? { protocol_key: protocolHandle } : {}),
      archived_at: null,
    },
    { take: 1 },
  )
  if (!series) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Research protocol was not found",
    )
  }
  const [published] = await content.listResearchProtocols(
    { series_id: series.id, status: "published" },
    { take: 1 },
  )
  if (!published) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Community access is available after the protocol is published",
    )
  }
  const [storedPolicy] = await content.listResearchProtocolVisibilityPolicies(
    { series_id: series.id },
    { take: 1 },
  )
  const policy = normalizeResearchProtocolVisibilityPolicy(storedPolicy)
  const tracking = container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [profile] = await tracking.listResearchProfiles(
    { customer_id: customerId },
    { take: 1 },
  )
  const [access] = profile
    ? await tracking.listResearchProtocolProfileAccesses(
        {
          profile_id: profile.id,
          protocol_series_id: series.id,
          status: "active",
        },
        { take: 1 },
      )
    : []
  return { series, policy, profile: profile || null, purchaser: Boolean(access) }
}

export const assertCommunityEligibility = ({
  policy,
  purchaser,
  operation,
}: {
  policy: ResearchProtocolVisibilityPolicyValue
  purchaser: boolean
  operation: "read" | "post"
}) => {
  const scope =
    operation === "read"
      ? policy.community_read_scope
      : policy.community_post_scope
  if (
    !isProtocolCommunityEligible({ scope, signedIn: true, purchaser })
  ) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      operation === "read"
        ? "This discussion is available to eligible purchasers"
        : "Posting is available to eligible purchasers",
    )
  }
}
