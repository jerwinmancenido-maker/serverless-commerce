"use client"

import {
  updateCustomerNotificationPreferences,
  type NotificationChannels,
  type NotificationPreference,
} from "@lib/data/customer-notifications"
import { useMemo, useState, useTransition } from "react"

const CATEGORY_LABELS: Record<string, string> = {
  support: "Support",
  community: "Community",
  protocols: "Protocols",
  research: "Research Hub",
  rewards: "Rewards",
  system: "Account",
}

export default function NotificationPreferences({ countryCode, initialPreferences, channels }: { countryCode: string; initialPreferences: NotificationPreference[]; channels: NotificationChannels }) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const groups = useMemo(() => Object.entries(preferences.reduce<Record<string, NotificationPreference[]>>((result, item) => {
    result[item.category] ||= []
    result[item.category].push(item)
    return result
  }, {})), [preferences])

  const toggle = (eventKey: string, enabled: boolean) => {
    const previous = preferences
    setPreferences((items) => items.map((item) => item.event_key === eventKey ? { ...item, enabled } : item))
    setMessage(null)
    startTransition(async () => {
      try {
        const result = await updateCustomerNotificationPreferences([{ event_key: eventKey, enabled }], countryCode)
        setPreferences((items) => items.map((item) => result.preferences.find((saved) => saved.event_key === item.event_key) || item))
        setMessage("Notification preference saved.")
      } catch (error) {
        setPreferences(previous)
        setMessage(error instanceof Error ? error.message : "Preference could not be saved.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-ui-border-base bg-white p-5">
        <h2 className="font-semibold">Delivery channels</h2>
        <div className="mt-4 grid gap-3 small:grid-cols-2">
          {Object.entries(channels).map(([key, status]) => <div key={key} className="flex items-center justify-between rounded-lg bg-ui-bg-subtle p-3"><span className="text-sm capitalize">{key.replaceAll("_", " ")}</span><span className={`text-xs font-semibold ${status === "available" ? "text-green-700" : "text-ui-fg-muted"}`}>{status === "available" ? "Available" : "Coming later"}</span></div>)}
        </div>
        <p className="mt-3 text-xs text-ui-fg-subtle">Only private in-app notifications are active. Email, browser push, mobile push, and SMS are not sent.</p>
      </section>

      {groups.map(([category, items]) => (
        <section key={category} className="overflow-hidden rounded-xl border border-ui-border-base bg-white">
          <header className="border-b border-ui-border-base px-5 py-4"><h2 className="font-semibold">{CATEGORY_LABELS[category] || category}</h2></header>
          <div className="divide-y divide-ui-border-base">
            {(items || []).map((item) => (
              <label key={item.event_key} className="flex cursor-pointer items-start justify-between gap-5 px-5 py-4">
                <span>
                  <span className="block text-sm font-medium">{item.display_name}</span>
                  <span className="mt-1 block text-xs text-ui-fg-subtle">{item.customer_can_disable ? "Optional" : "Required account or service update"}</span>
                </span>
                <input type="checkbox" checked={item.enabled} disabled={pending || !item.customer_can_disable} onChange={(event) => toggle(item.event_key, event.target.checked)} className="mt-1 h-4 w-4 rounded border-ui-border-base" />
              </label>
            ))}
          </div>
        </section>
      ))}
      {message ? <p role="status" className="text-sm text-ui-fg-subtle">{message}</p> : null}
    </div>
  )
}
