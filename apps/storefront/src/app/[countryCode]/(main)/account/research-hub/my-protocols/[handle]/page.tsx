/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/account/research-hub/my-protocols/[handle]/page.tsx
 * @module  CustomerProtocolPage (Research Tracking Storefront)
 * @purpose Renders full protocol specifications for verified customer compound purchases with graceful fallback.
 * @contracts
 *   Fetches: retrieveCustomerResearchProtocol() · retrieveResearchProtocol()
 *   API:     GET /store/customers/me/research-protocols/:handle · GET /store/research-protocols/:handle
 */

import type { Metadata } from "next"
import { redirect } from "next/navigation"

import {
  retrieveCustomerResearchProtocol,
  retrieveResearchProtocol,
} from "@lib/data/research-protocols"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FullProtocol from "@modules/research-protocols/full-protocol"

export const metadata: Metadata = {
  title: "My Protocol",
  robots: { index: false, follow: false },
}

export default async function CustomerProtocolPage({
  params,
}: {
  params: Promise<{ countryCode: string; handle: string }>
}) {
  const { handle, countryCode } = await params
  const result = await retrieveCustomerResearchProtocol(handle).catch(() => null)

  if (!result?.protocol || result.protocol.access_level !== "purchaser") {
    const publicResult = await retrieveResearchProtocol(handle).catch(() => null)
    if (publicResult?.protocol) {
      redirect(`/${countryCode}/research-protocols/${handle}`)
    }

    return (
      <div className="mx-auto max-w-2xl py-12 px-4 text-center">
        <div className="rounded-xl border border-ui-border-base bg-white p-8 shadow-xs">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 text-xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold text-ui-fg-base">Protocol Not Available</h1>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            This research protocol is not active or purchaser verification was not found on your account.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LocalizedClientLink
              href="/account/research-hub?section=protocols"
              className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900 transition-colors"
            >
              Return to My Protocols
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/research-protocols"
              className="rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-2 text-sm font-semibold text-ui-fg-base hover:bg-ui-bg-subtle-hover transition-colors"
            >
              Protocol Library
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3 print:hidden">
        <LocalizedClientLink
          href="/account/research-hub?section=protocols"
          className="text-sm font-medium text-ui-fg-interactive"
        >
          ← My Protocols
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/research-protocols/${handle}/community`}
          className="text-sm font-medium text-ui-fg-interactive"
        >
          Open community →
        </LocalizedClientLink>
      </div>
      <FullProtocol protocol={result.protocol} countryCode={countryCode} />
    </div>
  )
}

