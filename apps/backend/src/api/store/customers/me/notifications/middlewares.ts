import {
  type MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"

import {
  StoreBulkCustomerNotificationAction,
  StoreListCustomerNotifications,
  StoreMutateCustomerNotification,
  StoreUpdateCustomerNotificationPreferences,
} from "../../../../../modules/customer-notifications/contracts"

export const storeCustomerNotificationMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/customers/me/notifications",
    method: "GET",
    middlewares: [validateAndTransformQuery(StoreListCustomerNotifications, {})],
  },
  {
    matcher: "/store/customers/me/notifications/:id/action",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreMutateCustomerNotification)],
  },
  {
    matcher: "/store/customers/me/notifications/actions",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreBulkCustomerNotificationAction)],
  },
  {
    matcher: "/store/customers/me/notification-preferences",
    method: "POST",
    middlewares: [validateAndTransformBody(StoreUpdateCustomerNotificationPreferences)],
  },
]
