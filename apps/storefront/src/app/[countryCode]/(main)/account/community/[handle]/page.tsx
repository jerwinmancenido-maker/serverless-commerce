/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/account/community/[handle]/page.tsx
 * @module  AccountCommunityProtocolRedirect (Research Protocols Storefront)
 * @purpose Redirects legacy account community handle URL to canonical research protocol community board.
 * @contracts
 *   API:     GET /account/community/:handle -> 308 /research-protocols/:handle/community
 */

import { redirect, RedirectType } from "next/navigation"

export default async function AccountCommunityHandleRedirect({
  params,
}: {
  params: Promise<{ countryCode: string; handle: string }>
}) {
  const { countryCode, handle } = await params
  redirect(
    `/${countryCode}/research-protocols/${encodeURIComponent(handle)}/community`,
    RedirectType.replace,
  )
}
