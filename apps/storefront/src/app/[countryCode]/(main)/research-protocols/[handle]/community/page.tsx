/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/research-protocols/[handle]/community/page.tsx
 * @module  ResearchProtocolCommunityPage (Research Protocols Storefront)
 * @purpose Renders the per-protocol public community discussion board and peer observations.
 * @contracts
 *   Fetches: retrieveResearchProtocol() · listResearchCommunityThreads() · retrieveResearchCommunityIdentity()
 *   API:     GET /store/research-protocols/:handle · GET /store/customers/me/research-protocol-community/:handle/threads
 */

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCompoundProtocol } from "@lib/data/compound-protocols"
import {
  listResearchCommunityReports,
  listResearchCommunityThreads,
  retrieveResearchCommunityIdentity,
  retrieveResearchProtocol,
} from "@lib/data/research-protocols"
import CommunityDirectory from "@modules/research-protocols/community-directory"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const backendProtocol = await retrieveResearchProtocol(handle)
    .then((res) => res.protocol)
    .catch(() => null)
  const staticProtocol = getCompoundProtocol(handle)
  const title =
    backendProtocol?.title ||
    (staticProtocol?.id !== "generic-peptide" ? staticProtocol?.compoundName : null) ||
    handle

  return {
    title: `${title} Community & Peer Discussions`,
    description: `Peer discussions, reconstitution observations, and laboratory notes for ${title}. Protected peer discussion.`,
  }
}

export default async function ResearchProtocolCommunityPage({ params }: Props) {
  const { countryCode, handle } = await params

  const [backendProtocol, staticProtocol] = await Promise.all([
    retrieveResearchProtocol(handle)
      .then((res) => res.protocol)
      .catch(() => null),
    Promise.resolve(getCompoundProtocol(handle)),
  ])

  if (!backendProtocol && (!staticProtocol || staticProtocol.id === "generic-peptide")) {
    notFound()
  }

  const title = backendProtocol?.title || staticProtocol.compoundName

  const [identityResult, threadsResult, reportsResult] = await Promise.all([
    retrieveResearchCommunityIdentity().catch(() => ({ identity: null })),
    listResearchCommunityThreads(handle).catch(() => ({ threads: [], count: 0 })),
    listResearchCommunityReports(handle).catch(() => ({ reports: [] })),
  ])

  const protocols = [
    {
      handle,
      title,
      threads: threadsResult.threads || [],
      reports: reportsResult.reports || [],
    },
  ]

  return (
    <div className="content-container py-8 small:py-12">
      <CommunityDirectory
        countryCode={countryCode}
        identity={identityResult.identity}
        protocols={protocols}
        protocolHandle={handle}
        protocolTitle={title}
      />
    </div>
  )
}
