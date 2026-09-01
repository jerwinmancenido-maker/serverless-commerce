import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  retrieveCustomerResearchProtocol,
  retrieveResearchCommunityThread,
} from "@lib/data/research-protocols"
import CommunityThread from "@modules/research-protocols/community-thread"

export const metadata: Metadata = {
  title: "Protocol Discussion",
  robots: { index: false, follow: false },
}

export default async function AccountCommunityThreadPage({ params }: { params: Promise<{ countryCode: string; handle: string; threadId: string }> }) {
  const { countryCode, handle, threadId } = await params
  const [protocolResult, threadResult] = await Promise.all([
    retrieveCustomerResearchProtocol(handle).catch(() => null),
    retrieveResearchCommunityThread(handle, threadId).catch(() => null),
  ])
  if (!protocolResult || !threadResult) notFound()
  return <CommunityThread countryCode={countryCode} handle={handle} protocolTitle={protocolResult.protocol.title} thread={threadResult.thread} />
}
