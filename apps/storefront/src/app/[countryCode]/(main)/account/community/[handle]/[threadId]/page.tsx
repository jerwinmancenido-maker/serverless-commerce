/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/account/community/[handle]/[threadId]/page.tsx
 * @module  AccountCommunityThreadRedirect (Research Protocols Storefront)
 * @purpose Redirects legacy account community thread URL to canonical research protocol thread route.
 * @contracts
 *   API:     GET /account/community/:handle/:threadId -> 308 /research-protocols/:handle/community/:threadId
 */

import { redirect, RedirectType } from "next/navigation"

export default async function AccountCommunityThreadRedirect({
  params,
}: {
  params: Promise<{ countryCode: string; handle: string; threadId: string }>
}) {
  const { countryCode, handle, threadId } = await params
  redirect(
    `/${countryCode}/research-protocols/${encodeURIComponent(handle)}/community/${encodeURIComponent(threadId)}`,
    RedirectType.replace,
  )
}
