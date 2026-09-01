import { type MiddlewareRoute, validateAndTransformBody, validateAndTransformQuery } from "@medusajs/framework/http"
import { PolicyOperation } from "@medusajs/framework/utils"
import multer from "multer"
import { AdminAssignSupportConversation, AdminCreateSupportInternalNote, AdminCreateSupportMessage, AdminListSupportConversations, AdminPrioritizeSupportConversation, AdminUpdateSupportConversation, AdminUpdateSupportSettings, AdminUpsertSupportCategory, AdminUpsertSupportSavedResponse } from "../../../modules/customer-support/contracts"
const policy = (operation: (typeof PolicyOperation)[keyof typeof PolicyOperation]) => [{ resource: "customer_support", operation }]
const supportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 25 * 1024 * 1024 },
})
export const adminCustomerSupportMiddlewares: MiddlewareRoute[] = [
  { matcher: "/admin/customer-support", methods: ["GET"], middlewares: [validateAndTransformQuery(AdminListSupportConversations, {})], policies: policy(PolicyOperation.read) },
  { matcher: "/admin/customer-support/staff", methods: ["GET"], middlewares: [], policies: [{ resource: "customer_support_assign", operation: PolicyOperation.update }] },
  { matcher: "/admin/customer-support/:conversationId", methods: ["GET"], middlewares: [], policies: policy(PolicyOperation.read) },
  { matcher: "/admin/customer-support/:conversationId", methods: ["POST"], middlewares: [validateAndTransformBody(AdminUpdateSupportConversation)], policies: [{ resource: "customer_support_update", operation: PolicyOperation.update }] },
  { matcher: "/admin/customer-support/:conversationId/priority", methods: ["POST"], middlewares: [validateAndTransformBody(AdminPrioritizeSupportConversation)], policies: [{ resource: "customer_support_assign", operation: PolicyOperation.update }] },
  { matcher: "/admin/customer-support/:conversationId/assignment", methods: ["POST"], middlewares: [validateAndTransformBody(AdminAssignSupportConversation)], policies: [{ resource: "customer_support_assign", operation: PolicyOperation.update }] },
  { matcher: "/admin/customer-support/:conversationId/read", methods: ["POST"], middlewares: [], policies: [{ resource: "customer_support_update", operation: PolicyOperation.update }] },
  { matcher: "/admin/customer-support/:conversationId/messages", methods: ["POST"], middlewares: [validateAndTransformBody(AdminCreateSupportMessage)], policies: [{ resource: "customer_support_reply", operation: PolicyOperation.update }] },
  { matcher: "/admin/customer-support/:conversationId/messages/:messageId/attachments", methods: ["POST"], middlewares: [supportUpload.single("attachment")], policies: [{ resource: "customer_support_attachment", operation: PolicyOperation.create }] },
  { matcher: "/admin/customer-support/:conversationId/notes", methods: ["POST"], middlewares: [validateAndTransformBody(AdminCreateSupportInternalNote)], policies: [{ resource: "customer_support_note", operation: PolicyOperation.create }] },
  { matcher: "/admin/customer-support/:conversationId/attachments/:attachmentId/file", methods: ["GET"], middlewares: [], policies: [{ resource: "customer_support_attachment", operation: PolicyOperation.read }] },
  { matcher: "/admin/support-settings", methods: ["GET"], middlewares: [], policies: [{ resource: "customer_support_settings", operation: PolicyOperation.read }] },
  { matcher: "/admin/support-settings", methods: ["POST"], middlewares: [validateAndTransformBody(AdminUpdateSupportSettings)], policies: [{ resource: "customer_support_settings", operation: PolicyOperation.update }] },
  { matcher: "/admin/support-categories", methods: ["POST"], middlewares: [validateAndTransformBody(AdminUpsertSupportCategory)], policies: [{ resource: "customer_support_settings", operation: PolicyOperation.update }] },
  { matcher: "/admin/support-saved-responses", methods: ["GET"], middlewares: [], policies: [{ resource: "customer_support_saved_responses", operation: PolicyOperation.read }] },
  { matcher: "/admin/support-saved-responses", methods: ["POST"], middlewares: [validateAndTransformBody(AdminUpsertSupportSavedResponse)], policies: [{ resource: "customer_support_saved_responses", operation: PolicyOperation.update }] },
  { matcher: "/admin/support-saved-responses/:responseId", methods: ["POST"], middlewares: [validateAndTransformBody(AdminUpsertSupportSavedResponse)], policies: [{ resource: "customer_support_saved_responses", operation: PolicyOperation.update }] },
  { matcher: "/admin/support-saved-responses/:responseId", methods: ["DELETE"], middlewares: [], policies: [{ resource: "customer_support_saved_responses", operation: PolicyOperation.update }] },
]
