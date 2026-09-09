/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/account/community/page.tsx
 * @module  AccountCommunityPage (Research Protocols Storefront)
 * @purpose Customer portal hub listing all accessible protocol community boards and researcher profile.
 * @contracts
 *   Fetches: retrieveResearchProtocolAccesses() · retrieveResearchCommunityIdentity()
 *   API:     GET /store/customers/me/research-tracking/protocols · GET /store/customers/me/research-community/identity
 */

import type { Metadata } from "next"

import { retrieveResearchCommunityIdentity } from "@lib/data/research-protocols"
import { retrieveResearchProtocolAccesses } from "@lib/data/research-tracking"
import AccountCommunityHub from "./account-community-hub"

export const metadata: Metadata = {
  title: "Your Protocol Communities",
  robots: { index: false, follow: false },
}

export default async function AccountCommunityPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const [accesses, identityResult] = await Promise.all([
    retrieveResearchProtocolAccesses().catch(() => []),
    retrieveResearchCommunityIdentity().catch(() => ({ identity: null })),
  ])

  const uniqueAccesses = Array.from(
    new Map(accesses.map((access) => [access.protocol_handle, access])).values(),
  )

  return (
    <AccountCommunityHub
      countryCode={countryCode}
      accesses={uniqueAccesses}
      identity={identityResult.identity}
    />
  )
}
