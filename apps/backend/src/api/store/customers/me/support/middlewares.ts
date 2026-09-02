import { type MedusaNextFunction, type MedusaRequest, type MedusaResponse, type MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework/http"
import { StoreCreateSupportConversation, StoreCreateSupportReply, StorePostThreadMessage, StoreMarkSupportRead, StoreMutateSupportConversation } from "../../../../../modules/customer-support/contracts"
import multer from "multer"
import { SUPPORT_ATTACHMENT_MAX_BYTES } from "../../../../../workflows/steps/manage-support-attachment"
const noStore = (_req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => { res.setHeader("Cache-Control", "private, no-store"); next() }
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 1, fileSize: SUPPORT_ATTACHMENT_MAX_BYTES } })
export const storeCustomerSupportMiddlewares: MiddlewareRoute[] = [
  { matcher: "/store/customers/me/support*", middlewares: [noStore] },
  { matcher: "/store/customers/me/support-read", middlewares: [noStore] },
  { matcher: "/store/customers/me/support", methods: ["POST"], middlewares: [validateAndTransformBody(StoreCreateSupportConversation)] },
  { matcher: "/store/customers/me/support/thread/message", methods: ["POST"], middlewares: [validateAndTransformBody(StorePostThreadMessage)] },
  { matcher: "/store/customers/me/support/:conversationId", methods: ["POST"], middlewares: [validateAndTransformBody(StoreMutateSupportConversation)] },
  { matcher: "/store/customers/me/support/:conversationId/messages", methods: ["POST"], middlewares: [validateAndTransformBody(StoreCreateSupportReply)] },
  { matcher: "/store/customers/me/support-read", methods: ["POST"], middlewares: [validateAndTransformBody(StoreMarkSupportRead)] },
  { matcher: "/store/customers/me/support/:conversationId/messages/:messageId/attachments", methods: ["POST"], middlewares: [upload.single("attachment")] },
]
