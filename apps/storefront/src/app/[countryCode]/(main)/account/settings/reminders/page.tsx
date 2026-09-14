import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveResearchReminderPreferences } from "@lib/data/research-tracking"
import ReminderPreferences from "@modules/account/components/research-tracking/reminder-preferences"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = { title: "Reminder preferences" }

export default async function ReminderSettingsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const preferences = await retrieveResearchReminderPreferences().catch(() => null)
  if (!preferences) notFound()
  return (
    <div className="w-full space-y-8" data-testid="reminder-preferences-page">
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
                Protocol Schedules &amp; Quiet Hours
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Reminder Preferences
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-xl leading-relaxed">
              Manage private Research Hub dosing reminders, routine alert frequency, and clean-bench quiet hours.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200 self-start sm:self-auto">
            Timezone: Asia/Manila (PHT)
          </span>
        </div>
      </div>
      <ReminderPreferences countryCode={countryCode} preferences={preferences} />
    </div>
  )
}
