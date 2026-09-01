import type { Metadata } from "next"

import {
  listResearchCommunityThreads,
  listResearchCommunityReports,
  retrieveResearchCommunityIdentity,
} from "@lib/data/research-protocols"
import { retrieveResearchProtocolAccesses } from "@lib/data/research-tracking"
import CommunityDirectory from "@modules/research-protocols/community-directory"

export const metadata: Metadata = {
  title: "Protocol Community",
  robots: { index: false, follow: false },
}

export default async function AccountCommunityPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const accesses = await retrieveResearchProtocolAccesses().catch(() => [])
  const unique = Array.from(new Map(accesses.map((access) => [access.protocol_handle, access])).values())
  const [identityResult, protocolThreads] = await Promise.all([
    retrieveResearchCommunityIdentity().catch(() => ({ identity: null })),
    Promise.all(unique.map(async (access) => ({
      handle: access.protocol_handle,
      title: access.protocol_title,
      threads: await listResearchCommunityThreads(access.protocol_handle).then((result) => result.threads).catch(() => []),
      reports: await listResearchCommunityReports(access.protocol_handle).then((result) => result.reports).catch(() => []),
    }))),
  ])

  return <CommunityDirectory countryCode={countryCode} identity={identityResult.identity} protocols={protocolThreads} />
}
