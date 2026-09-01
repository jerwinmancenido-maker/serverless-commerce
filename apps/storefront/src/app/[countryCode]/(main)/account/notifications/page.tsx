import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCustomerNotifications } from "@lib/data/customer-notifications"
import NotificationCenter from "@modules/account/components/notification-center"

export const metadata: Metadata = { title: "Notifications" }

export default async function NotificationsPage() {
  const initial = await listCustomerNotifications({ offset: 0, limit: 20 }).catch(() => null)
  if (!initial) notFound()
  return <NotificationCenter initialItems={initial.notifications} initialCount={initial.count} />
}
