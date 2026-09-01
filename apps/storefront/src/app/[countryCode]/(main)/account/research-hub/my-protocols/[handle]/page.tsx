import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomerResearchProtocol } from "@lib/data/research-protocols"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FullProtocol from "@modules/research-protocols/full-protocol"

export const metadata: Metadata = {
  title: "My Protocol",
  robots: { index: false, follow: false },
}

export default async function CustomerProtocolPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const result = await retrieveCustomerResearchProtocol(handle).catch(() => null)
  if (!result?.protocol || result.protocol.access_level !== "purchaser") notFound()
  return <div>
    <div className="mb-5 flex flex-wrap gap-3">
      <LocalizedClientLink href="/account/research-hub?section=protocols" className="text-sm font-medium text-ui-fg-interactive">← My Protocols</LocalizedClientLink>
      <LocalizedClientLink href={`/account/community`} className="text-sm font-medium text-ui-fg-interactive">Open community →</LocalizedClientLink>
    </div>
    <FullProtocol protocol={result.protocol} />
  </div>
}
