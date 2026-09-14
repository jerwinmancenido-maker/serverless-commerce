import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveCustomerNotificationPreferences } from "@lib/data/customer-notifications"
import NotificationPreferences from "@modules/account/components/notification-preferences"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = { title: "Notification preferences" }

export default async function NotificationSettingsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const result = await retrieveCustomerNotificationPreferences().catch(() => null)
  if (!result) notFound()
  return (
    <div className="w-full space-y-8" data-testid="notification-preferences-page">
      <div>
        <LocalizedClientLink
          href="/account/settings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <span>&larr; Back to Profile &amp; Settings</span>
        </LocalizedClientLink>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Communication Channels &amp; Telemetry
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Notification Preferences
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-xl leading-relaxed">
              Choose optional in-app notices, batch release alerts, and community announcements. Mandatory service messages stay enabled.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 self-start sm:self-auto">
            Delivery Alerts Active
          </span>
        </div>
      </div>
      <NotificationPreferences countryCode={countryCode} initialPreferences={result.preferences} channels={result.channels} />
    </div>
  )
}
