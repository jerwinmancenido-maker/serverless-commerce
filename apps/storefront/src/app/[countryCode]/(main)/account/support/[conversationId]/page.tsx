import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { retrieveSupportConversation } from "@lib/data/customer-support"
import SupportThread from "@modules/account/components/customer-support/support-thread"

export const metadata: Metadata = {
  title: "Support Conversation",
  robots: { index: false, follow: false },
}

export default async function SupportConversationPage({
  params,
}: {
  params: Promise<{ countryCode: string; conversationId: string }>
}) {
  const { countryCode, conversationId } = await params
  const result = await retrieveSupportConversation(conversationId).catch(() => null)

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
