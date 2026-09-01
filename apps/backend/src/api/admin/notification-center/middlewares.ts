import {
  type MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { PolicyOperation } from "@medusajs/framework/utils"

import {
  AdminListCustomerNotificationOperations,
  AdminSendCustomerNotificationTest,
  AdminUpdateCustomerNotificationTemplate,
} from "../../../modules/customer-notifications/contracts"

export const AdminRestoreCustomerNotificationTemplate = z.object({
  change_reason: z.string().trim().min(3).max(500),
})
export type AdminRestoreCustomerNotificationTemplate = z.infer<typeof AdminRestoreCustomerNotificationTemplate>

const ownerPolicy = [{ resource: "customer_notifications", operation: PolicyOperation.update }]

export const adminCustomerNotificationMiddlewares: MiddlewareRoute[] = [
  { matcher: "/admin/notification-center*", methods: ["GET"], middlewares: [], policies: ownerPolicy },
  { matcher: "/admin/notification-center/templates/:eventKey", method: "POST", middlewares: [validateAndTransformBody(AdminUpdateCustomerNotificationTemplate)], policies: ownerPolicy },
  { matcher: "/admin/notification-center/templates/:eventKey/restore", method: "POST", middlewares: [validateAndTransformBody(AdminRestoreCustomerNotificationTemplate)], policies: ownerPolicy },
  { matcher: "/admin/notification-center/operations", method: "GET", middlewares: [validateAndTransformQuery(AdminListCustomerNotificationOperations, {})], policies: ownerPolicy },
  { matcher: "/admin/notification-center/test", method: "POST", middlewares: [validateAndTransformBody(AdminSendCustomerNotificationTest)], policies: ownerPolicy },
]
