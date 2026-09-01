import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomerNotificationPreferences } from "@lib/data/customer-notifications"
import NotificationPreferences from "@modules/account/components/notification-preferences"

export const metadata: Metadata = { title: "Notification preferences" }

export default async function NotificationSettingsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const result = await retrieveCustomerNotificationPreferences().catch(() => null)
  if (!result) notFound()
  return <div className="space-y-6"><header><h1 className="text-2xl-semi">Notification preferences</h1><p className="mt-2 text-sm text-ui-fg-subtle">Choose optional in-app updates. Required account and service messages stay enabled.</p></header><NotificationPreferences countryCode={countryCode} initialPreferences={result.preferences} channels={result.channels} /></div>
}
