import {
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
  type MiddlewareRoute,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"

import {
  StoreCreateResearchProtocolReply,
  StoreCreateResearchProtocolThread,
  StoreEditResearchProtocolComment,
  StoreListResearchProtocolThreads,
  StoreReactResearchProtocolComment,
  StoreRemoveResearchProtocolComment,
  StoreReportResearchProtocolContent,
  StoreUpdateCommunityIdentity,
  StoreUpdateResearchProtocolSubscription,
} from "../../../../../modules/research-content/contracts/research-protocol-community"

const privateNoStore = (
  _req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) => {
  res.setHeader("Cache-Control", "private, no-store")
  next()
}

export const storeResearchProtocolCommunityMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/customers/me/research-protocol-community*",
    middlewares: [privateNoStore],
  },
  {
    matcher: "/store/customers/me/research-protocol-community/identity",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(StoreUpdateCommunityIdentity)],
  },
  {
    matcher: "/store/customers/me/research-protocol-community/:handle/threads",
    methods: ["GET"],
    middlewares: [validateAndTransformQuery(StoreListResearchProtocolThreads, {})],
  },
  {
    matcher: "/store/customers/me/research-protocol-community/:handle/threads",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(StoreCreateResearchProtocolThread)],
  },
  {
    matcher: "/store/customers/me/research-protocol-community/:handle/threads/:threadId/replies",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(StoreCreateResearchProtocolReply)],
  },
  {
    matcher: "/store/customers/me/research-protocol-community/:handle/comments/:commentId/edit",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(StoreEditResearchProtocolComment)],
  },
  {
    matcher: "/store/customers/me/research-protocol-community/:handle/comments/:commentId/remove",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(StoreRemoveResearchProtocolComment)],
  },
  {
    matcher: "/store/customers/me/research-protocol-community/:handle/comments/:commentId/reaction",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(StoreReactResearchProtocolComment)],
  },
  {
    matcher: "/store/customers/me/research-protocol-community/:handle/reports",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(StoreReportResearchProtocolContent)],
  },
  {
    matcher: "/store/customers/me/research-protocol-community/:handle/threads/:threadId/subscription",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(StoreUpdateResearchProtocolSubscription)],
  },
]
