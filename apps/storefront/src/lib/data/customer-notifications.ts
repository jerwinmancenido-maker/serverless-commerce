"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"
import { revalidatePath } from "next/cache"

export type CustomerNotificationCategory =
  | "support"
  | "community"
  | "protocols"
  | "research"
  | "rewards"
  | "system"

export type CustomerNotification = {
  id: string
  event_key: string
  category: CustomerNotificationCategory
  priority: "low" | "normal" | "high" | "urgent"
  title: string
  body: string
  status: "scheduled" | "unread" | "read" | "snoozed" | "archived"
  action_label: string | null
  target: {
    kind:
      | "support_conversation"
      | "community_thread"
      | "protocol"
      | "research_hub_section"
      | "rewards"
      | "notifications"
    id: string | null
    secondary_id: string | null
  }
  available_at: string
  read_at: string | null
  snoozed_until: string | null
  created_at: string
  snoozable: boolean
}

export type NotificationPreference = {
  event_key: string
  display_name: string
  category: CustomerNotificationCategory
  enabled: boolean
  customer_can_disable: boolean
}

export type NotificationChannels = {
  in_app: "available"
  email: "unavailable"
  browser_push: "unavailable"
  mobile_push: "unavailable"
  sms: "unavailable"
}

export const listCustomerNotifications = async (query?: {
  status?: CustomerNotification["status"]
  category?: CustomerNotificationCategory
  event_key?: string
  offset?: number
  limit?: number
}) => {
  const search = new URLSearchParams()
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value))
  })
  const suffix = search.size ? `?${search.toString()}` : ""
  return sdk.client.fetch<{
    notifications: CustomerNotification[]
    count: number
    offset: number
    limit: number
  }>(`/store/customers/me/notifications${suffix}`, {
    method: "GET",
    headers: await getAuthHeaders(),
    cache: "no-store",
  })
}

export const retrieveCustomerNotificationUnreadCount = async () =>
  sdk.client.fetch<{ unread_count: number }>(
    "/store/customers/me/notifications/unread-count",
    {
      method: "GET",
      headers: await getAuthHeaders(),
      cache: "no-store",
    },
  )

export const mutateCustomerNotification = async (
  notificationId: string,
  mutation:
    | { action: "mark_read" | "mark_unread" | "archive" | "open" }
    | { action: "snooze"; snoozed_until: string },
) =>
  sdk.client.fetch<{ notification: CustomerNotification }>(
    `/store/customers/me/notifications/${encodeURIComponent(notificationId)}/action`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: mutation,
      cache: "no-store",
    },
  )

export const markAllCustomerNotificationsRead = async () =>
  sdk.client.fetch<{ affected: number }>(
    "/store/customers/me/notifications/actions",
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { action: "mark_all_read" },
      cache: "no-store",
    },
  )

export const archiveCustomerNotifications = async (ids: string[]) =>
  sdk.client.fetch<{ affected: number }>(
    "/store/customers/me/notifications/actions",
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { action: "archive", ids },
      cache: "no-store",
    },
  )

export const retrieveCustomerNotificationPreferences = async () =>
  sdk.client.fetch<{
    preferences: NotificationPreference[]
    channels: NotificationChannels
  }>("/store/customers/me/notification-preferences", {
    method: "GET",
    headers: await getAuthHeaders(),
    cache: "no-store",
  })

export const retrieveCustomerNotificationExport = async () =>
  sdk.client.fetch<{
    notifications: CustomerNotification[]
    preferences: NotificationPreference[]
  }>("/store/customers/me/notifications/export", {
    method: "GET",
    headers: await getAuthHeaders(),
    cache: "no-store",
  })

export const updateCustomerNotificationPreferences = async (
  preferences: Array<{ event_key: string; enabled: boolean }>,
  countryCode: string,
) => {
  const result = await sdk.client.fetch<{ preferences: NotificationPreference[] }>(
    "/store/customers/me/notification-preferences",
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: { preferences },
      cache: "no-store",
    },
  )
  revalidatePath(`/${countryCode}/account/settings/notifications`, "page")
  return result
}
