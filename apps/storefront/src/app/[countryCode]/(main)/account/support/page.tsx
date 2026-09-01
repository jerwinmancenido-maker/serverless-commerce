import type { Metadata } from "next"
import { listSupportConversations } from "@lib/data/customer-support"
import SupportHome from "@modules/account/components/customer-support/support-home"
export const metadata: Metadata = { title: "Customer Support", robots: { index: false, follow: false } }
export default async function SupportPage({ params, searchParams }: { params: Promise<{ countryCode: string }>; searchParams: Promise<{ orderId?: string; protocolSeriesId?: string }> }) { const [{ countryCode }, query] = await Promise.all([params, searchParams]); const conversations = await listSupportConversations().then((result) => result.conversations).catch(() => []); return <SupportHome countryCode={countryCode} conversations={conversations} orderId={query.orderId || ""} protocolSeriesId={query.protocolSeriesId || ""} /> }
