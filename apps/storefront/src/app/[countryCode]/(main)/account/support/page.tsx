import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveSupportThread } from "@lib/data/customer-support"
import SupportThread from "@modules/account/components/customer-support/support-thread"

export const metadata: Metadata = {
  title: "Customer Support",
  robots: { index: false, follow: false },
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const result = await retrieveSupportThread().catch(() => null)

  if (!result?.conversation) {
    notFound()
  }

  return (
    <SupportThread
      countryCode={countryCode}
      conversation={result.conversation}
    />
  )
}
