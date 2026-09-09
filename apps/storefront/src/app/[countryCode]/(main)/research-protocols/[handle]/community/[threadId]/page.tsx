/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/research-protocols/[handle]/community/[threadId]/page.tsx
 * @module  ResearchProtocolCommunityThreadPage (Research Protocols Storefront)
 * @purpose Thread detail discussion view scoped to a specific protocol and thread ID.
 * @contracts
 *   Fetches: retrieveCustomerResearchProtocol() · retrieveResearchProtocol() · retrieveResearchCommunityThread()
 *   API:     GET /store/research-protocols/:handle · GET /store/customers/me/research-protocol-community/:handle/threads/:threadId
 */

import type { Metadata } from "next"

import { getCompoundProtocol } from "@lib/data/compound-protocols"
import {
  retrieveCustomerResearchProtocol,
  retrieveResearchCommunityThread,
  retrieveResearchProtocol,
} from "@lib/data/research-protocols"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CommunityThread from "@modules/research-protocols/community-thread"

type Props = {
  params: Promise<{ countryCode: string; handle: string; threadId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, threadId } = await params
  const threadResult = await retrieveResearchCommunityThread(handle, threadId).catch(() => null)
  return {
    title: threadResult?.thread?.title ? `${threadResult.thread.title} | Protocol Discussion` : "Protocol Discussion",
    robots: { index: false, follow: false },
  }
}

export default async function ResearchProtocolCommunityThreadPage({ params }: Props) {
  const { countryCode, handle, threadId } = await params
  const [customerResult, publicResult, threadResult] = await Promise.all([
    retrieveCustomerResearchProtocol(handle).catch(() => null),
    retrieveResearchProtocol(handle)
      .then((res) => res.protocol)
      .catch(() => null),
    retrieveResearchCommunityThread(handle, threadId).catch(() => null),
  ])

  const staticProtocol = getCompoundProtocol(handle)
  const protocolTitle =
    customerResult?.protocol?.title ||
    publicResult?.title ||
    (staticProtocol?.id !== "generic-peptide" ? staticProtocol?.compoundName : null) ||
    handle

  if (!threadResult) {
    return (
      <div className="content-container py-12 max-w-2xl mx-auto text-center">
        <div className="rounded-xl border border-ui-border-base bg-white p-8 shadow-xs">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 text-xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold text-ui-fg-base">Discussion Not Found</h1>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            This protocol discussion thread does not exist or may have been archived.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LocalizedClientLink
              href={`/research-protocols/${handle}/community`}
              className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors"
            >
              Return to {protocolTitle} Community
            </LocalizedClientLink>
            <LocalizedClientLink
              href={`/research-protocols/${handle}`}
              className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-2 text-sm font-semibold text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors"
            >
              Protocol Specs
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container py-8 small:py-12 max-w-4xl mx-auto">
      <CommunityThread
        countryCode={countryCode}
        handle={handle}
        protocolTitle={protocolTitle}
        thread={threadResult.thread}
      />
    </div>
  )
}
