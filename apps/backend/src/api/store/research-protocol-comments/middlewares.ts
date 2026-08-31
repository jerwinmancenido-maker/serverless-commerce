import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"

import { StoreCreateResearchProtocolComment } from "../../../modules/research-content/contracts/research-protocol-comment"

export const storeResearchProtocolCommentMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/customers/me/research-protocol-comments",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(StoreCreateResearchProtocolComment),
    ],
  },
]
