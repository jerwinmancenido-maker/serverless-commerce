import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { retrieveResearchReminderPreferences } from "@lib/data/research-tracking"
import ReminderPreferences from "@modules/account/components/research-tracking/reminder-preferences"

export const metadata: Metadata = { title: "Reminder preferences" }

export default async function ReminderSettingsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const preferences = await retrieveResearchReminderPreferences().catch(() => null)
  if (!preferences) notFound()
  return <div className="space-y-6"><header><h1 className="text-2xl-semi">Reminder preferences</h1><p className="mt-2 text-sm text-ui-fg-subtle">Manage private Research Hub reminders and quiet hours.</p></header><ReminderPreferences countryCode={countryCode} preferences={preferences} /></div>
}
