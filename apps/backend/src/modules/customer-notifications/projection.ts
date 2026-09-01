import { getNotificationCatalogEntry } from "./catalog"

export const projectCustomerNotification = (notification: any) => ({
  id: notification.id,
  event_key: notification.event_key,
  category: notification.category,
  priority: notification.priority,
  title: notification.title,
  body: notification.body,
  status: notification.status,
  action_label: notification.action_label,
  target: {
    kind: notification.target_kind,
    id: notification.target_id,
    secondary_id: notification.secondary_target_id,
  },
  available_at: notification.available_at,
  read_at: notification.read_at,
  snoozed_until: notification.snoozed_until,
  created_at: notification.created_at,
  snoozable: getNotificationCatalogEntry(notification.event_key).snoozable,
})

export const projectPreferenceCatalog = ({
  templates,
  preferences,
}: {
  templates: any[]
  preferences: any[]
}) => templates.map((template) => {
  const override = preferences.find((preference) => preference.event_key === template.event_key)
  return {
    event_key: template.event_key,
    display_name: template.display_name,
    category: template.category,
    enabled: override?.enabled ?? template.default_enabled,
    customer_can_disable: template.customer_can_disable,
  }
})
