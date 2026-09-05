import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { retrieveRewardsSummary } from "@lib/data/rewards"
import {
  retrieveResearchProtocolAccesses,
  retrieveResearchTrackingConfiguration,
  retrieveResearchPersonalGoals,
} from "@lib/data/research-tracking"
import { retrieveCustomerNotificationUnreadCount } from "@lib/data/customer-notifications"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const [
    customer,
    orders,
    rewards,
    protocolAccesses,
    trackingConfig,
    personalGoals,
    notificationCount,
  ] = await Promise.all([
    retrieveCustomer().catch(() => null),
    listOrders().catch(() => null),
    retrieveRewardsSummary().catch(() => null),
    retrieveResearchProtocolAccesses().catch(() => []),
    retrieveResearchTrackingConfiguration().catch(() => null),
    retrieveResearchPersonalGoals().catch(() => null),
    retrieveCustomerNotificationUnreadCount().catch(() => ({ unread_count: 0 })),
  ])

  if (!customer) {
    return null
  }

  return (
    <Overview
      customer={customer}
      orders={orders}
      rewards={rewards}
      protocolAccesses={protocolAccesses}
      researchTrackingAvailable={Boolean(trackingConfig?.available)}
      routineStreak={personalGoals?.streaks.routine ?? 0}
      unreadNotificationsCount={notificationCount?.unread_count ?? 0}
    />
  )
}
